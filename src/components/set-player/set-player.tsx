import {
  Component,
  h,
  Host,
  Element,
  State,
  Method,
  Prop,
  Listen,
  Fragment,
  Build,
} from "@stencil/core";

import {
  MedHandler,
  ViewFocusDetail,
  ProgressCallback,
  Workspace,
  SlicesAction,
  ItemHandler,
  SerializableWorkspace,
  ViewState,
  AsyncResult,
  MedSource,
  FileResource,
  med,
} from "@sethealth/core";
import { createAlertModal } from "./alert";
import { goal, reactiveMedia } from "../../utils";
import * as sethealth from "@sethealth/core";
import { SetDemo } from "../set-demo/set-demo";
import { createModal } from "../set-modal/set-modal-api";
import styles from "./alert.css";

interface PanelView {
  id: string;
  title: string;
  hasToolbar: boolean;
  ref: string | undefined;
  components: {
    type: string;
    state: ViewState;
  }[];
}

const isMobile = reactiveMedia("(max-width: 600px)");

const MENU = [
  {
    type: "browser",
    icon: "document-outline",
    selectedIcon: "document",
    text: "File browser",
  },
];

@Component({
  tag: "set-player",
  styleUrl: "set-player.css",
  scoped: true,
})
export class SetPlayer {
  @Element() el!: HTMLSetPlayerElement;

  @State() selectedHandlers: MedHandler[] = [];
  @State() handlers: MedHandler[] = [];
  @State() views: PanelView[] = [];
  @State() selectedView?: PanelView;
  @State() showToolbar = false;
  @State() selectedController?: any;

  @State() loadingClass?: string;
  @State() loadingText?: string;
  @State() loadingProcess = 0;

  @State() shareError?: string;

  @Prop({ mutable: true }) sideMenu: string | undefined;
  @Prop({ mutable: true }) slicesAction: SlicesAction = "contrast";

  async componentWillLoad() {
    if (Build.isBrowser) {
      const url = new URL(location.href);
      const sideMenu =
        window.innerWidth > 600 && url.searchParams.get("side") === "browser";
      this.showToolbar = window.innerWidth > 800;
      this.sideMenu = sideMenu ? "browser" : undefined;
      this.loadToken();
      await sethealth.ready();
    }
  }

  @Method()
  async openFromSource(source: MedSource) {
    let ref: string | undefined = undefined;
    if (typeof source.input === "string") {
      ref = source.input;
      const found = this.views.find((v) => v.ref === source.input);
      if (found) {
        this.selectedView = found;
        return;
      }
    }
    this.loadingClass = "loading-modal";
    this.loadingText = "Loading medical images";
    this.loadingProcess = 0;
    const handler = await sethealth.med.loadFromSource(source, (p) => {
      this.loadingProcess = p;
    });
    if (!handler.error) {
      await this.openMed(handler.value[0], ref);
    }
    this.loadingText = undefined;
  }

  @Method()
  async openFromID(id: string) {
    const found = this.views.find((v) => v.ref === id);
    if (found) {
      this.selectedView = found;
      return;
    }
    this.loadingClass = "loading-modal";
    this.loadingText = "Loading medical images";
    this.loadingProcess = 0;
    const res = await loadPanelsFromId(id, (p) => (this.loadingProcess = p));
    if (res.value) {
      this.views.push(...res.value);
      this.selectedView = this.views[this.views.length - res.value.length];
    }
    this.loadingText = undefined;
  }

  @Listen("resize", { target: "window" })
  onWindowResize() {
    document.body.style.width = `${window.innerWidth}px`;
    document.body.style.height = `${window.innerHeight}px`;
  }

  @Listen("setMedChange", { target: "window" })
  async medChanged() {
    this.handlers = await sethealth.med.getAll();
  }

  async open(id: string) {
    const handler = await sethealth.med.get(id);
    if (handler) {
      await this.openMed(handler, undefined);
    }
  }

  async loadToken() {
    try {
      const res = await fetch("https://openview.set.health/api/token", {
        method: "POST",
      });
      const json = await res.json();
      await sethealth.auth.setAccessToken(json.token);
    } catch (e) {
      console.error(e);
    }
    const hash = location.hash.slice(1);
    if (hash !== "") {
      const params = new URLSearchParams(hash);
      const panelId = params.get("id");
      if (panelId) {
        this.sideMenu = undefined;
        goal("Open shared link");
        await this.openFromID(panelId);
        this.sideMenu = "browser";
      }
    }
  }

  private openFolder = async () => {
    const files = await sethealth.utils.openFiles(true, true);
    if (files.length > 0) {
      this.loadingClass = "loading-toast";
      this.loadingText = "Loading files";
      this.loadingProcess = 0;
      const handlers = await sethealth.med.loadFromFiles(
        files,
        (p) => (this.loadingProcess = p)
      );
      if (handlers.value && handlers.value.length > 0) {
        this.dataImported();
      }
      this.loadingText = undefined;
    }
  };

  private openFromURL = async () => {
    let url = "";
    let type = "dicom";
    const modal = await createModal({
      type: "alert",
      styles,
      render: (resolve) => {
        const downloadImage = async () => {
          resolve(undefined);
          this.loadingClass = "loading-modal";
          this.loadingText = "Loading medical images from URL";
          this.loadingProcess = 0;

          const handlers = await sethealth.med.loadFromSource(
            {
              input: url,
              type: type as any,
            },
            (p) => (this.loadingProcess = p)
          );

          if (handlers.value && handlers.value.length > 0) {
            goal("Import medical data URL");
            this.sideMenu = "browser";
          }
          this.loadingText = undefined;
        };
        return (
          <div class="alert-container">
            <div class="title">
              <h1>Load external medical image</h1>
            </div>
            <p>
              <label>
                Image type:
                <select onInput={(ev: any) => (type = ev.target.value)}>
                  <option selected>dicom</option>
                  <option>nifty</option>
                  <option>nrrd</option>
                </select>
              </label>
            </p>
            <p>
              URL:{" "}
              <label>
                <input
                  type="url"
                  onInput={(ev: any) => (url = ev.target.value)}
                  placeholder="https://example.com/images.zip"
                />
              </label>
            </p>
            <button class="share-btn" onClick={downloadImage}>
              <set-icon name="cloud-download" />
              Load image
            </button>
          </div>
        );
      },
    });
    return modal.onDismiss;
  };

  private openFiles = async () => {
    const files = await sethealth.utils.openFiles(false, true);
    if (files.length > 0) {
      this.loadingClass = "loading-toast";
      this.loadingText = "Loading files";
      this.loadingProcess = 0;
      const handlers = await sethealth.med.loadFromFiles(
        files,
        (p) => (this.loadingProcess = p)
      );
      if (handlers.value && handlers.value.length > 0) {
        this.dataImported();
      }
      this.loadingText = undefined;
    }
  };

  private setWindowCloseWarning() {
    window.onbeforeunload = () => {
      return "Changes are not saved. Aree you sure you want to close the tab?";
    };
  }

  private onOpenVolume = (ev: CustomEvent<ItemHandler>) => {
    if (ev.detail.type === "med") {
      this.openMed(ev.detail, undefined);
      if (isMobile.matches) {
        this.sideMenu = undefined;
      }
    }
  };

  private onSelectionChanged = (ev: CustomEvent<ItemHandler[]>) => {
    const handlers = ev.detail.filter((i) => i.type === "med") as MedHandler[];
    this.selectedHandlers = handlers;
    this.shareError = undefined;
    const shareButtons = Array.from(
      this.el.shadowRoot!.querySelectorAll(".share-button")
    );
    shareButtons.forEach((btn) => btn.classList.add("share-jump"));
    setTimeout(() => {
      shareButtons.forEach((btn) => btn.classList.remove("share-jump"));
    }, 300);
  };

  private openMed = async (handler: MedHandler, ref: string | undefined) => {
    const workspaces = handler.getWorkspaces().map((w) => w.id);
    let selectedView = this.views.find((v) => workspaces.includes(v.id));
    if (!selectedView) {
      selectedView = await createView(handler, ref);
      this.views = [...this.views, selectedView];
    }
    this.selectedView = selectedView;
    this.setWindowCloseWarning();
  };

  private async getState(onProgress: ProgressCallback): Promise<Version3> {
    const views = await Promise.all(
      this.selectedHandlers.map(async (handler) => {
        const workspaces = handler.getWorkspaces().map((w) => w.id);
        let selectedView = this.views.find((v) => workspaces.includes(v.id));
        if (!selectedView) {
          selectedView = await createView(handler, undefined);
        }
        return selectedView;
      })
    );
    const workspaces = views.flatMap((view) =>
      view.components.map((c) => c.state.workspace!)
    );

    const res = await sethealth.workspace.ensureSources(
      workspaces,
      {
        bucket: {
          med: "bu-5748563258638336",
          geometry: "bu-5631652369793024",
        },
        anonymize: {
          keepStructuredReport: true,
          keepDescriptions: true,
        },
      },
      onProgress
    );
    if (res.error) {
      throw res.error;
    }

    const serialized = await sethealth.workspace.serialize(workspaces);
    return {
      version: 3,
      workspaces: serialized,
      views,
    };
  }

  private sharePanel = async () => {
    if (this.selectedHandlers.length === 0) {
      this.shareError =
        "Please select some items by clicking the circular checkbox";
      const browser = this.el.querySelector("set-browser");
      if (browser) {
        browser.classList.add("share-failed");
        setTimeout(() => {
          browser.classList.remove("share-failed");
        }, 100);
      }
      return;
    }
    const onShare = async (onProgress) => {
      const progress = await sethealth.utils.createProgress(onProgress);
      const finalUpload = progress.source();
      const panelState = await this.getState(progress.source());
      return sharePanel(panelState, finalUpload);
    };
    const onDonate = async () => {
      const caseID = await sethealth.dataset.allocateCaseID();
      const images = await sethealth.dataset.get("ds-5680152080023552");
      const entries = this.selectedHandlers.map((handler) => ({
        case: caseID,
        type: "image",
        value: handler,
      }));
      await images.append(entries);
    };
    goal("Share");

    await createAlertModal(onShare, onDonate);
  };

  private downloadImages = async () => {
    if (this.selectedHandlers.length === 0) {
      const browser = this.el.querySelector("set-browser");
      this.shareError =
        "Please select some items by clicking the circular checkbox";
      if (browser) {
        browser.classList.add("share-failed");
        setTimeout(() => {
          browser.classList.remove("share-failed");
        }, 100);
      }
      return;
    }

    goal("Share");

    this.loadingClass = "loading-toast";
    this.loadingText = "Packing files into a ZIP...";
    const progress = await sethealth.utils.createProgress(
      (p) => (this.loadingProcess = p)
    );
    try {
      const files: FileResource[] = [];
      let i = 0;
      for (const handler of this.selectedHandlers) {
        const { data, extension } = await handler.serialize(
          {
            format: "original",
            anonymize: false,
          },
          progress.source()
        );
        files.push({
          path: `${i++}${extension}`,
          data,
        });
      }
      if (files.length === 1) {
        const h = await sethealth.utils.saveAs(files[0].path);
        h(files[0].data);
      } else {
        await sethealth.utils.saveZipAs(
          {
            filename: "export-sethealth",
            files,
          },
          progress.source()
        );
      }
    } catch (e) {
      console.error(e);
    }
    progress.end();
    this.loadingText = undefined;
    this.loadingProcess = 0;
  };

  private viewFocusChanged = (ev: CustomEvent<ViewFocusDetail>) => {
    this.selectedController = ev.detail.controller;
  };

  private toggleSide = () => {
    this.showToolbar = !this.showToolbar;
  };

  private selectAll = () => {
    this.selectedHandlers = this.handlers.slice();
  };

  private unselectAll = () => {
    this.selectedHandlers = [];
  };

  private clearAll = async () => {
    this.handlers = [];
    this.selectedHandlers = [];
    this.views = [];
    this.selectedView = undefined;
    this.selectedController = undefined;
    await med.destroyAll();
  };

  dataImported = async () => {
    goal("Import medical data FS");
    this.sideMenu = "browser";
  };

  private renderHeader() {
    return (
      <header>
        <div class="header-top">
          {this.selectedView ? (
            <button
              class="back-button"
              onClick={() => {
                this.sideMenu = "browser";
                this.selectedView = undefined;
              }}
            >
              <set-icon name="arrow-back" />
            </button>
          ) : (
            <a
              href="https://set.health?utm_medium=referral&utm_source=OpenView&utm_campaign=PoweredBy"
              class="sethealth-logo"
              title="Sethealth"
              target="_blank"
              rel="noopener"
            >
              <img
                src="/assets/logo-small.svg"
                alt="Sethealth logo"
                width="462"
                height="259"
              />
            </a>
          )}
        </div>

        <div class="header-buttons">
          {MENU.map((item) => {
            const selected = this.sideMenu === item.type;
            return (
              <button
                class={{ selected: selected }}
                onClick={() => {
                  this.sideMenu = selected ? undefined : item.type;
                }}
                title={item.text}
              >
                <set-icon
                  name={
                    selected
                      ? item.selectedIcon ?? item.icon
                      : (item.icon as any)
                  }
                />
              </button>
            );
          })}
        </div>
        <div class="header-bottom-buttons">
          {this.selectedView !== undefined && (
            <button
              onClick={() => {
                this.selectedView = undefined;
              }}
              title="Show home page"
            >
              <set-icon name="home" />
            </button>
          )}
        </div>
      </header>
    );
  }

  private renderLeftMenu() {
    if (this.sideMenu === "browser") {
      return (
        <div class="side-menu" key="side-menu">
          <div class="section-header">
            <h2>Browser</h2>
          </div>
          {this.handlers.length > 0 && (
            <div class="section-header">
              <button
                class="section-header-button-text"
                onClick={this.selectAll}
              >
                Select all
              </button>
              <button
                class="section-header-button-text"
                onClick={this.unselectAll}
              >
                Unselect all
              </button>
              <button
                class="section-header-button-text"
                onClick={this.clearAll}
              >
                Clear all
              </button>
            </div>
          )}
          <set-browser
            selectionType="multiple"
            items={this.handlers}
            value={this.selectedHandlers}
            onSetChange={this.onSelectionChanged}
            onSetClick={this.onOpenVolume}
          >
            {this.shareError && (
              <div slot="top" class="error-select">
                {this.shareError}
              </div>
            )}
            <div slot="bottom" class="empty-buttons">
              <button class="empty-button" onClick={this.openFiles}>
                <set-icon name="document-outline" />
                Import files
              </button>
              <button class="empty-button" onClick={this.openFolder}>
                <set-icon name="folder-open-outline" />
                Import folders
              </button>

              <button class="empty-button" onClick={this.openFromURL}>
                <set-icon name="folder-open-outline" />
                Import from URL
              </button>

              <set-file-loader
                buttonAction="select-folder"
                class={{
                  "drag-button": true,
                  "drag-button-collapse": this.handlers.length > 0,
                }}
                loadMed
                multipleSelection
                onSetMedLoad={this.dataImported}
              >
                <set-icon name="folder-open-outline" />
                <h2>Drop your medical files / folder</h2>
              </set-file-loader>
            </div>
          </set-browser>
          <button
            class={{
              "share-button": true,
              "share-visible": this.handlers.length > 0,
              "share-disabled": this.selectedHandlers.length === 0,
            }}
            onClick={this.sharePanel}
          >
            <set-icon name="share"></set-icon>

            {this.selectedHandlers.length > 0 ? (
              <span>Share {this.selectedHandlers.length} files</span>
            ) : (
              <span>Share files</span>
            )}
          </button>

          <button
            class={{
              "share-button": true,
              "download-button": true,
              "share-visible": this.handlers.length > 0,
              "share-disabled": this.selectedHandlers.length === 0,
            }}
            onClick={this.downloadImages}
          >
            <set-icon name="download"></set-icon>
            {this.selectedHandlers.length > 0 ? (
              <span>Download {this.selectedHandlers.length} files</span>
            ) : (
              <span>Download files</span>
            )}
          </button>
        </div>
      );
    }
  }

  private renderEditor() {
    const { selectedView } = this;
    const hasToolbar = selectedView?.hasToolbar === true;
    return (
      <main
        class={{
          "has-toolbar": hasToolbar,
        }}
      >
        {hasToolbar && (
          <div class="main-toolbar">
            <set-control-toolbar
              selected={this.slicesAction}
              onSetChange={(ev: any) => (this.slicesAction = ev.detail)}
              tools={[
                "contrast",
                "crop",
                "crosshair",
                "new-line",
                "new-spline",
                "new-point",
                "pan",
                "zoom",
              ]}
            />
            <button onClick={this.toggleSide} class="side-menu-button">
              {this.showToolbar ? (
                <>
                  <set-icon name="close" />
                  <span>Colapse menu</span>
                </>
              ) : (
                <>
                  <set-icon name="arrow-back" />
                  <span>Menu</span>
                </>
              )}
            </button>
          </div>
        )}
        <div class="editor">
          {selectedView ? (
            <set-grid-panel key={selectedView.id}>
              {selectedView.components.map((c) => {
                const Cmp = c.type;
                let attributes = c.state;
                if (Cmp === "set-view-slices") {
                  attributes = { ...c.state, pointerAction: this.slicesAction };
                }
                return (
                  <set-pane showMaximize={true} state={c.state}>
                    <Cmp {...attributes} />
                  </set-pane>
                );
              })}
            </set-grid-panel>
          ) : (
            <SetDemo player={this} />
          )}
          {hasToolbar && this.showToolbar && selectedView && (
            <>
              <div class="side-menu-backdrop" onClick={this.toggleSide}></div>
              <set-sidemenu controller={this.selectedController} />
            </>
          )}
        </div>
      </main>
    );
  }

  private renderLoading() {
    if (!this.loadingText) {
      return null;
    }
    if (this.loadingClass === "loading-modal") {
      return (
        <div class="loading-modal">
          <div class="loading-modal-content">
            <img
              class="logo"
              src="/assets/icon/setview.svg"
              alt="OpenView Health logo"
              width="1693"
              height="829"
            />

            <h1>Loading medical data</h1>
            <h4>
              Medical data is usually very large, might take some minutes to
              download. Hold tight!
            </h4>
            <set-progress-bar
              value={this.loadingProcess}
              class="loading-modal-progress"
            >
              {Math.round(this.loadingProcess * 100)}%
            </set-progress-bar>
          </div>
        </div>
      );
    }
    if (this.loadingClass === "loading-modal") {
      return (
        <div class="loading-modal">
          <set-progress-bar
            value={this.loadingProcess}
            class="loading-toast-progress"
          >
            {this.loadingText}
          </set-progress-bar>
        </div>
      );
    }
    return (
      <div class="loading-toast">
        <set-progress-bar value={this.loadingProcess} class="main-loading">
          {this.loadingText}
        </set-progress-bar>
      </div>
    );
  }
  render() {
    return (
      <Host onSetFocus={this.viewFocusChanged}>
        {this.renderHeader()}
        {this.renderLeftMenu()}
        {this.renderEditor()}
        {this.renderLoading()};
        {!this.selectedView && <div innerHTML={GITHUB_LINK} />}
      </Host>
    );
  }
}

const GITHUB_LINK = `
<a href="https://github.com/sethealth/openviewhealth" class="github-corner" aria-label="View source on GitHub"><svg width="80" height="80" viewBox="0 0 250 250" style="fill:#151513; color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg></a><style>.github-corner:hover .octo-arm{animation:octocat-wave 560ms ease-in-out}@keyframes octocat-wave{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(-25deg)}40%,80%{transform:rotate(10deg)}}@media (max-width:500px){.github-corner:hover .octo-arm{animation:none}.github-corner .octo-arm{animation:octocat-wave 560ms ease-in-out}}</style>
`;

const sharePanel = async (state: any, onProgress: ProgressCallback) => {
  const resSecret = await sethealth.storage.uploadMetadata(state, onProgress);
  if (resSecret.error) {
    throw resSecret.error;
  }

  const params = new URLSearchParams({
    id: resSecret.value.source,
  });
  const fragment = `#${params.toString()}`;
  history.replaceState(null, null as any, fragment);
  return `${location.origin}/${fragment}`;
};

const loadPanelsFromId = async (
  panelId: string,
  onProgress: ProgressCallback
) => {
  const progress = await sethealth.utils.createProgress(onProgress);
  const getPanelProgress = progress.source();
  const getImagesProgress = progress.source();

  const res = await sethealth.storage.loadMetadata(panelId, getPanelProgress);
  if (res.error) {
    progress.end();
    return res;
  }

  const panels = await loadPanelVersion3(res.value, panelId, getImagesProgress);
  progress.end();
  return panels;
};

interface Version3 {
  version: 3;
  workspaces: SerializableWorkspace[];
  views: {
    id: string;
    title: string;
    components: {
      type: string;
      state: ViewState;
    }[];
  }[];
}

const loadPanelVersion3 = async (
  state: Version3,
  ref: string,
  onProgress: ProgressCallback
): AsyncResult<PanelView[]> => {
  const res = await sethealth.workspace.loadFromSerialization(
    state.workspaces,
    onProgress
  );
  if (res.error) {
    return res;
  }
  const value = state.views.map((view) => {
    const v: PanelView = {
      id: view.id,
      ref,
      hasToolbar: view.components.some((c) => c.type === "set-view-slices"),
      components: view.components,
      title: view.title,
    };
    return v;
  });
  return {
    value,
  };
};

const isWorkspace3D = (workspace?: Workspace) => {
  const z = workspace?.med?.volume?.dimensions.z ?? 0;
  return z > 40;
};

const createView = async (
  handler: MedHandler,
  ref: string | undefined
): Promise<PanelView> => {
  const workspace = await sethealth.workspace.create(handler);
  const isTouch = matchMedia("(any-hover: none)").matches;

  if (!workspace.med?.volume) {
    return {
      id: workspace.id,
      title: handler.description!,
      hasToolbar: false,
      ref,
      components: [
        {
          type: "set-view-report",
          state: {
            workspace,
          },
        },
      ],
    };
  } else if (!isWorkspace3D(workspace)) {
    return {
      id: workspace.id,
      title: handler.description!,
      hasToolbar: true,
      ref,
      components: [
        {
          type: "set-view-slices",
          state: {
            workspace,
            showRange: isTouch,
          },
        },
      ],
    };
  } else {
    return {
      id: workspace.id,
      title: handler.description!,
      hasToolbar: true,
      ref,
      components: [
        {
          type: "set-view-slices",
          state: {
            workspace,
            projection: "axial",
            showRange: isTouch,
          },
        },
        {
          type: "set-view-volumetric",
          state: {
            workspace,
            showGeometry: true,
            showAxes: true,
          },
        },
        {
          type: "set-view-slices",
          state: {
            workspace,
            projection: "coronal",
            showRange: isTouch,
          },
        },
        {
          type: "set-view-slices",
          state: {
            workspace,
            projection: "sagittal",
            showRange: isTouch,
          },
        },
      ],
    };
  }
};
