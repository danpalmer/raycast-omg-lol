import {
  List,
  Icon,
  ActionPanel,
  Action,
  Keyboard,
  showToast,
} from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { GET, DELETE } from "./common/api";
import { PasteListResponse } from "./common/types";
import { useState } from "react";

export default function Command() {
  const [isDeleting, setIsDeleting] = useState(false);

  const { isLoading, data, revalidate } = usePromise(
    async (url: string) => {
      return GET(url) as Promise<PasteListResponse>;
    },
    ["pastebin"],
  );

  async function deletePaste(title: string): Promise<void> {
    setIsDeleting(true);
    await DELETE(`pastebin/${title}`);
    await showToast({ title: `Deleted ${title}` });
    revalidate();
    setIsDeleting(false);
  }

  const isShowingEmpty =
    !isLoading && !isDeleting && data?.pastebin.length === 0;

  return (
    <List isLoading={isLoading || isDeleting} isShowingDetail={!isShowingEmpty}>
      {isShowingEmpty ? (
        <List.EmptyView
          icon={Icon.Clipboard}
          title="No pastes in your pastebin!"
        />
      ) : (
        data?.pastebin.map((paste) => (
          <List.Item
            key={paste.title}
            title={paste.title}
            detail={<List.Item.Detail markdown={paste.content} />}
            actions={
              <ActionPanel>
                <Action.CopyToClipboard content={paste.content} />
                <Action
                  title="Delete"
                  shortcut={Keyboard.Shortcut.Common.Remove}
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  onAction={() => deletePaste(paste.title)}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
