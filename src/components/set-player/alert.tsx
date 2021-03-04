import { h } from "@stencil/core";
import styles from "./alert.css";
import { createModal } from "../set-modal/set-modal-api";
import copy from "copy-text-to-clipboard";
import { ProgressCallback } from "@sethealth/core";

export interface AlertOptions {
  title: string;
  message: string;
}

export const createAlertModal = async (
  shareLink: (onProgress: ProgressCallback) => Promise<any>
) => {
  let uploading = false;
  let linkUrl: string | null = null;
  let copied = false;
  let progress = 0;
  const modal = await createModal({
    type: "alert",
    styles,
    render: (_, forceUpdate) => {
      const onClick = async () => {
        uploading = true;
        forceUpdate();
        linkUrl = await shareLink((value) => {
          progress = value;
          forceUpdate();
        });
        uploading = false;
        forceUpdate();
      };
      const onCopy = () => {
        if (linkUrl) {
          copy(linkUrl);
          copied = true;
          forceUpdate();
          setTimeout(() => {
            copied = false;
            forceUpdate();
          }, 2000);
        }
      };
      let showButton = !uploading && !linkUrl;
      return (
        <div class="alert-container">
          <div class="title">
            <h1>Secure sharing</h1>
            {showButton && (
              <button class="share-btn" onClick={onClick}>
                <set-icon name="link-outline" />
                Get share link
              </button>
            )}
          </div>
          <p>
            An anonymized version of the medical image will be end-to-end
            encrypted and uploaded. Only people with the generated link will be
            able to access it.
          </p>
          {uploading && (
            <set-progress-bar value={progress}>
              Uploading... might take a while
            </set-progress-bar>
          )}
          {linkUrl && (
            <code class={{ copied: copied }} onClick={onCopy}>
              {copied ? "Link copied into the clipboard!" : linkUrl}
            </code>
          )}
        </div>
      );
    },
  });
  return modal.onDismiss;
};
