import {
  Action,
  ActionPanel,
  Clipboard,
  Form,
  PopToRootType,
  showHUD,
} from "@raycast/api";
import { useForm } from "@raycast/utils";
import { useState } from "react";
import { extractEmojis } from "unicode-emoji-utils";

import { POST } from "./common/api";
import { StatusCreateResponse } from "./common/types";

interface FormValues {
  emoji: string;
  content: string;
  external_url: string;
  skip_mastodon_post: boolean;
}

export default function Command() {
  const [isLoading, setIsLoading] = useState(false);

  async function createStatus(values: FormValues): Promise<void> {
    setIsLoading(true);

    const response: StatusCreateResponse = await POST("statuses", {
      emoji: extractEmojis(values.emoji)?.[0] ?? undefined,
      content: values.content,
      external_url: values.external_url ?? undefined,
      skip_mastodon_post: !values.skip_mastodon_post,
    });

    await showHUD(`Copied status URL to clipboard!`, {
      clearRootSearch: true,
      popToRootType: PopToRootType.Immediate,
    });

    await Clipboard.copy(response.url);
  }

  const { handleSubmit, itemProps } = useForm<FormValues>({
    onSubmit: createStatus,
    validation: {
      emoji: (value) => {
        if (value && value.length > 0) {
          const count = extractEmojis(value).length;
          if (count > 1) {
            return "Choose only one emoji";
          }
          if (count === 0) {
            return "Use only emoji characters";
          }
        }
      },
      content: (value) => {
        if (!value) {
          return "Status content is required";
        }
      },
      external_url: (value) => {
        if (value && !value.startsWith("http")) {
          return "External link must be a valid URL";
        }
      },
    },
  });

  return (
    <Form
      navigationTitle="Create new status"
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        title="Emoji"
        placeholder="✨"
        info={"Press Fn+E to open emoji picker"}
        {...itemProps.emoji}
      />
      <Form.TextArea
        title="Content"
        placeholder=""
        info={"Status message"}
        {...itemProps.content}
      />
      <Form.TextField
        title="External link"
        placeholder="https://omg.lol"
        info={"Link to another resource"}
        {...itemProps.content}
      />
      <Form.Checkbox
        label="Share to social.lol"
        info={"Whether this status should be cross-posted to social.lol."}
        defaultValue={true}
        {...itemProps.skip_mastodon_post}
      />
    </Form>
  );
}
