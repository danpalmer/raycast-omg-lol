import {
  ActionPanel,
  Form,
  Action,
  showHUD,
  PopToRootType,
} from "@raycast/api";
import { useState } from "react";
import { POST } from "./common/api";
import { Clipboard } from "@raycast/api";
import { PasteCreateResponse } from "./common/types";
import { getPrefs } from "./common/prefs";

const pasteTitleRegex = /^[a-zA-Z0-9-_.]+$/;

interface FormValues {
  title: string;
  content: string;
  listed: boolean;
}

export default function Command() {
  const [titleError, setTitleError] = useState<string | undefined>();
  const [contentError, setContentError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function createPaste(values: FormValues): Promise<boolean> {
    if (!validateTitle(values.title) || !validateContent(values.content)) {
      return false;
    }

    setIsLoading(true);

    const response: PasteCreateResponse = await POST("pastebin", {
      title: values.title,
      content: values.content,
      listed: values.listed ? "on" : null,
    });

    await showHUD(`Copied to clipboard!`, {
      clearRootSearch: true,
      popToRootType: PopToRootType.Immediate,
    });

    const prefs = getPrefs();
    Clipboard.copy(`https://paste.lol/${prefs.username}/${response.title}`);

    return true;
  }

  function validateTitle(title: string | undefined): boolean {
    if (!title) {
      setTitleError("Title is required");
      return false;
    }
    if (pasteTitleRegex.test(title) === false) {
      setTitleError("A-Z, a-z, 0-9, -, _, .");
      return false;
    }
    return true;
  }

  function clearTitleError(title: string) {
    if (validateTitle(title)) {
      setTitleError(undefined);
    }
  }

  function validateContent(content: string | undefined) {
    if (!content) {
      setContentError("Content is required");
      return false;
    }
    return true;
  }

  function clearContentError(content: string) {
    if (validateContent(content)) {
      setContentError(undefined);
    }
  }

  return (
    <Form
      navigationTitle="Create Paste"
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Create"
            onSubmit={(values) => createPaste(values as FormValues)}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="title"
        title="Title"
        placeholder="...uhhhh"
        error={titleError}
        autoFocus
        onBlur={(event) => validateTitle(event.target.value)}
        onChange={(value) => clearTitleError(value)}
      />
      <Form.TextArea
        id="content"
        title="Content"
        placeholder="something something paste"
        error={contentError}
        onBlur={(event) => validateContent(event.target.value)}
        onChange={(value) => clearContentError(value)}
      />
      <Form.Checkbox id="listed" label="Listed" defaultValue={false} />
    </Form>
  );
}
