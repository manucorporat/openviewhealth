import { FunctionalComponent, h } from "@stencil/core";
import { goal } from "../../utils";
import { createModal } from "../set-modal/set-modal-api";
import { MANIX, ANKLE } from "./demos";
import styles from "../set-player/alert.css";
import { createStore } from "@stencil/store";
import { isActivated, isJustActivated } from "../../global/app";
import type { SetPlayer } from "../set-player/set-player";
const demoState = createStore<DemoState>({}).state;

export interface DemoState {
  selectedDemo?: string;
}

const DEMOS = [
  {
    title: "Ankle fracture",
    description: "Ankle fracture",
    image: "/assets/demos/ankle.png",
    loaded: false,
    source: ANKLE,
  },
  // {
  //   title: "Torax",
  //   description: "Generic torax tomography from NIH dataset",
  //   image: "/assets/demos/torax.png",
  //   source: SCAN,
  //   loaded: false,
  // },
  {
    title: "Covid19 pneumonia",
    description:
      "Full torax tomography of a COVID19 positive patient, showing the pneumonia caused by SARS-CoV-2",
    image: "/assets/demos/covid19-2.jpg",
    locked: true,
    source:
      "sethealth://meta-v1/md-5734253702676480_whBTn88pEmwLunJdaX6becWoo2zpbxIx2VjRhKFwkRc=",
  },
  {
    title: "Deviated nasal septum",
    description: "Head tomography of a patient of a deviated nasal septum",
    image: "/assets/demos/deviatednasal.jpg",
    locked: true,
    source:
      "sethealth://meta-v1/md-5688466868273152_O9U5alWdbBGY/RB3ldTJREDAKHH8zDyhM0gG7rVFXkg=",
  },
  {
    title: "Manix",
    description: "Full head tomography, no contrast",
    image: "/assets/demos/manix2.png",
    source: MANIX,
    locked: true,
  },
];

export const SetDemo: FunctionalComponent<{
  player: SetPlayer;
}> = ({ player }) => {
  const navigate = (ev: any, page: string) => {
    ev.preventDefault();
    demoState.selectedDemo = page;
  };
  const activated = isActivated();
  const justActivated = isJustActivated();
  return (
    <div class="demo-page">
      <div class="demo-content">
        <img
          class="logo"
          src="/assets/icon/setview.svg"
          alt="OpenView Health logo"
          width="1693"
          height="829"
        />
        <p class="main-text">
          Fully 🙈 anonymized medical imaging app built with technology not 👀
          seen before. An app anyone can use to visualise and privately share
          X-rays 🩻 MRIs from any device 📱. Powered by{" "}
          <a
            target="_blank"
            href="https://set.health/contact?utm_medium=referral&utm_source=OpenView&utm_campaign=text"
          >
            Sethealth
          </a>
          , experts in custom medical imaging and DICOM solutions.
        </p>
        <div class="cards-container">
          <ul>
            <li>
              <a
                href="#opensource"
                onClick={(ev) => navigate(ev, "opensource")}
              >
                <span class="emoji">🌐</span> Open source
              </a>
            </li>
            <li>
              <a href="#privacy" onClick={(ev) => navigate(ev, "privacy")}>
                <span class="emoji">🙈</span> Privacy-aware
              </a>
            </li>
            <li>
              <a href="#encrypted" onClick={(ev) => navigate(ev, "encrypted")}>
                <span class="emoji">🔒</span> E2E encrypted
              </a>
            </li>
            <li>
              <a href="#hippa" onClick={(ev) => navigate(ev, "hippa")}>
                <span class="emoji">👤</span> HIPPA Compliant
              </a>
            </li>
          </ul>
          <div>
            <article
              id="opensource"
              class={{
                "selected-article": demoState.selectedDemo === "opensource",
              }}
            >
              <h3>🌐 Open source, open data</h3>
              <p>
                OpenView Health is an{" "}
                <a href="https://github.com/sethealth/openviewhealth">
                  open source initiative
                </a>{" "}
                licensed under the MIT license on Github. Both software and
                medical data donated to the platform becomes part of truly
                anonymized public dataset.
              </p>
            </article>

            <article
              id="privacy"
              class={{
                "selected-article": demoState.selectedDemo === "privacy",
              }}
            >
              <h3>🙈 Privacy-aware</h3>
              <p>
                All data remains offline without ever leaving your computer, we
                never track users and data is{" "}
                <a
                  href="https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html"
                  target="_blank"
                  rel="noopener"
                  class="help"
                >
                  fully anonymized
                </a>{" "}
                when you decide to share it.
              </p>
            </article>

            <article
              id="encrypted"
              class={{
                "selected-article": demoState.selectedDemo === "encrypted",
              }}
            >
              <h3>🔒 End-to-end encrypted</h3>
              <p>
                If you decide to share, your data will be{" "}
                <a
                  href="https://en.wikipedia.org/wiki/End-to-end_encryption"
                  target="_blank"
                  rel="noopener"
                  class="help"
                >
                  end-to-end encrypted
                </a>{" "}
                with
                <a
                  href="https://en.wikipedia.org/wiki/Galois/Counter_Mode"
                  target="_blank"
                  rel="noopener"
                  class="help"
                >
                  AES256-GCM
                </a>{" "}
                before it's uploaded. Since the encryption key is generated on
                your device, nobody but you can access it, not even us.{" "}
                <a href="#">Learn more about our end-to-end encryption</a>
              </p>
            </article>

            <article
              id="hippa"
              class={{ "selected-article": demoState.selectedDemo === "hippa" }}
            >
              <h3>👤 HIPPA Compliant Anonymization</h3>
              <p>
                On top of the highest e2e encryption standard, your medical data
                is always anonymized before being uploaded, so even if the data
                gets compromised, it's impossible to trace it back to an
                specific person, time or location.
              </p>

              <p>
                Names, locations, dates, annotations, all metadata is removed
                following the strictest guidelines of the{" "}
                <a href="https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html">
                  HIPAA Privacy Rule's De-Identification Standard
                </a>
              </p>
            </article>
          </div>
        </div>
        <div class="demos">
          {DEMOS.map((d) => (
            <button
              class={{
                locked: !!d.locked && !activated,
                justactivated: justActivated && !!d.locked,
              }}
              onClick={async () => {
                if (d.locked && !activated) {
                  goal("Click unlock");
                  await createEmailModal();
                } else {
                  if (typeof d.source === "string") {
                    player?.openFromID(d.source);
                  } else {
                    player?.openFromSource(d.source);
                  }
                  goal("Click demo");
                }
              }}
            >
              <div class="demo-img">
                <img src={d.image} alt={`Screenshot of ${d.title}`} />
              </div>
              <h2>{d.title}</h2>
              {d.locked && !activated && (
                <div class="lockcover">Unlock this 3D image</div>
              )}
            </button>
          ))}
        </div>
        <set-file-loader
          buttonAction="select-folder"
          style={{
            height: "200px",
          }}
          class={{
            "drag-button": true,
          }}
          loadMed
          multipleSelection
          onSetMedLoad={player.dataImported}
        >
          <set-icon name="folder-open-outline" />
          <h2>Drop your medical files / folder</h2>
        </set-file-loader>
        <p class="disclaimer">
          <strong>Disclaimer:</strong> OpenView Health is not intended to be
          used as a medical device, and the site cannot and does not contain
          medical/health advice. Any medical/health information is provided for
          general informational and educational purposes only and is not a
          substitute for professional advice.
        </p>
        <p>
          <a href="https://set.health?utm_medium=referral&utm_source=OpenView&utm_campaign=PoweredBy">
            <img
              class="powered-by"
              src="/assets/PoweredBy-Dark.svg"
              width="2392"
              height="457"
              alt="Powered by Sethealth"
            />
          </a>
        </p>
      </div>
    </div>
  );
};

export const createEmailModal = async () => {
  const modal = await createModal({
    type: "alert",
    styles,
    render: () => {
      return (
        <div class="alert-container">
          <div class="donated-title">
            <h1>Request full access</h1>
            <p>
              We will email you the link to get full access. We take this
              measure to reduce abuse and connect better with our users.{" "}
              <a href="https://set.health/privacy">Privacy Policy</a>.
            </p>
            <iframe src="https://cdn.forms-content.sg-form.com/3de3165a-aaa3-11ec-81d2-760b2eb9a963" />
          </div>
        </div>
      );
    },
  });
  return modal.onDismiss;
};
