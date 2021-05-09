import { Fragment, h } from "@stencil/core";
import styles from "./alert.css";
import { createModal } from "../set-modal/set-modal-api";
import copy from "copy-text-to-clipboard";
import { ProgressCallback } from "@sethealth/core";

export interface AlertOptions {
  title: string;
  message: string;
}

export const createAlertModal = async (
  shareLink: (onProgress: ProgressCallback) => Promise<any>,
  onDonate: () => void
) => {
  let uploading = false;
  let linkUrl: string | null = null;
  let copied = false;
  let progress = 0;
  let donated = false;
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

      const onDonateAction = async () => {
        await onDonate();
        donated = true;
        forceUpdate();
      };
      let showButton = !uploading && !linkUrl;
      return (
        <div class="alert-container">
          {!linkUrl && (
            <>
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
                An anonymized version of the medical images will be end-to-end
                encrypted and uploaded. Only people with the generated link will
                be able to access it, not even us.
              </p>
              {uploading && (
                <set-progress-bar value={progress}>
                  Uploading... might take a while
                </set-progress-bar>
              )}
            </>
          )}
          {linkUrl && (
            <>
              <div class="donated-title">
                <h1>Anonymized and encrypted sucessfully</h1>
                <p>
                  Your medical images has been anonymized. All names, dates, and
                  any personal data have been removed.
                </p>
              </div>
              <code class={{ copied: copied }} onClick={onCopy}>
                {copied ? "Link copied into the clipboard!" : linkUrl}
              </code>
              <div class="donate-panel">
                <h2>Together we are making medical data open</h2>
                <p>
                  We are working with top medical institutions to create the
                  world-first truly open and diverse dataset of medical data.
                  Allowing anyone to innovate. <a href="#">Learn more</a>.
                </p>
                {/* <div class="donate-partners">
                  <img src="https://online.stanford.edu/sites/default/files/styles/school_logo_title/public/school/stanford_medicine_logo.png?itok=a4RsQf6Y" />
                  <img src="https://identityguide.hms.harvard.edu/files/hmsidentityguide/files/hms_logo_final_rgb.png?m=1580238232" />
                  <img src="https://www.zorrotzaurre.com/wp-content/uploads/2019/01/logo-vector-universidad-navarra.jpg" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Logo_Charite.svg/1200px-Logo_Charite.svg.png" />
                </div> */}
                {!donated && (
                  <button class="share-btn donate-btn" onClick={onDonateAction}>
                    Contribute anonymously
                  </button>
                )}
                {donated && <span class="donate-thanks">Thank you! ❤️</span>}
              </div>
            </>
          )}
        </div>
      );
    },
  });
  return modal.onDismiss;
};
