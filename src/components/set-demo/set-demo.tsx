import { Component, h, Host, State } from "@stencil/core";
import { MANIX, ANKLE } from "./demos";

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
    image: "/assets/demos/covid19.png",
    source:
      "sethealth://meta-v1/md-5678418456739840_JLdoaPqvh9rcJmznFa4j7FPrLyP9TxlYuvanTvxx4g4=",
    loaded: false,
  },
  {
    title: "Manix",
    description: "Full head tomography, no contrast",
    image: "/assets/demos/manix2.png",
    source: MANIX,
    loaded: false,
  },
];

@Component({
  tag: "set-demo",
  styleUrl: "set-demo.css",
  shadow: true,
})
export class SetDemo {
  @State() loadingDemo?: any;

  render() {
    return (
      <Host>
        <div class="section2">
          <img
            class="logo"
            src="/assets/icon/setview.svg"
            alt="OpenView Health logo"
          />
          <p>
            OpenView Health is a free{" "}
            <a
              href="https://en.wikipedia.org/wiki/Medical_imaging"
              target="_blank"
              rel="noopener"
              class="help"
            >
              medical imaging
            </a>{" "}
            app, people all around the world can use to visualize and securely
            share their medical data. A modern open source DICOM visualizer.
          </p>

          <h3>🌐 Open source, open data</h3>
          <p>
            OpenView Health is an{" "}
            <a href="https://github.com/sethealth/openviewhealth">
              open source app
            </a>{" "}
            licensed under the MIT license on Github. Medical data donated to
            the platform also becomes part of truly public dataset, available to
            anyone interested.
          </p>

          <h3>🙈 Privacy-aware</h3>
          <p>
            All data remains offline without ever leaving your computer, we
            never track users and data is fully anonymized before sharing.
          </p>

          <h3>🔒 End-to-end encrypted</h3>
          <p>
            If you decide to share, your data will be end-to-end encrypted with
            AES256-GCM before it's uploaded. Since the encryption key is
            generated on your device, nobody but you can access it, not even us.{" "}
            <a href="#">Learn more about our end-to-end encryption</a>
          </p>

          <h3>👤 HIPPA Compliant Anonymization</h3>
          <p>
            On top of the highest e2e encryption standard, your medical data is
            always anonymized before being uploaded, so even if the data gets
            compromised, it's impossible to trace it back to an specific person,
            time or location.
          </p>

          <p>
            Names, locations, dates, annotations, all metadata is removed
            following the strictest guidelines of the{" "}
            <a href="https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html">
              HIPAA Privacy Rule's De-Identification Standard
            </a>
          </p>
        </div>
        <div class="section">
          <h3>🌐 Try some demos</h3>
          <p>
            No medical data to try Openview? No worries, we got you, click one
            of the following demos:
          </p>
          <div class="demos">
            {DEMOS.map((d) => (
              <button
                disabled={this.loadingDemo != null}
                onClick={async () => {
                  this.loadingDemo = d;
                  const player = document.querySelector("set-player");
                  if (typeof d.source === "string") {
                    player?.openFromID(d.source);
                  } else {
                    player?.openFromSource(d.source);
                  }
                  setTimeout(() => {
                    this.loadingDemo = null;
                    d.loaded = true;
                  }, 500);
                }}
              >
                <div class="demo-img">
                  <img src={d.image} alt={`Screenshot of ${d.title}`} />
                </div>
                <h2>{d.title}</h2>
              </button>
            ))}
          </div>
          <p class="disclaimer">
            <strong>Disclaimer:</strong> OpenView Health is not intended to be
            used as a medical device, and the site cannot and does not contain
            medical/health advice. Any medical/health information is provided
            for general informational and educational purposes only and is not a
            substitute for professional advice.
          </p>
          <p>
            <a href="https://set.health?utm_medium=referral&utm_source=OpenView&utm_campaign=PoweredBy">
              <img
                class="powered-by"
                src="/assets/PoweredBy-Dark.svg"
                alt="Powered by Sethealth"
              />
            </a>
          </p>
        </div>
      </Host>
    );
  }
}
