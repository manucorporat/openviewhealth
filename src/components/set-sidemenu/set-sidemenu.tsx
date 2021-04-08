import {
  Component,
  h,
  Host,
  Element,
  Prop,
  FunctionalComponent,
  forceUpdate,
  getRenderingRef,
  Watch,
  State,
} from "@stencil/core";

import { Point, Workspace } from "@sethealth/core";

@Component({
  tag: "set-sidemenu",
  styleUrl: "set-sidemenu.css",
  shadow: true,
})
export class SetSidemenu {
  private rm?: () => void;

  @Element() el!: HTMLSetControlToolbarElement;

  @State() workspace?: Workspace;
  @State() key = 0;

  @Prop() controller?: any;

  @Watch("controller")
  async controllerChanged() {
    this.rm?.();
    this.rm = undefined;

    if (this.controller && this.controller.getWorkspace) {
      const workspace = (await this.controller.getWorkspace())!;
      const update = () => forceUpdate(this);
      const a = workspace.onChange("window", update);
      const b = workspace.onChange("level", update);
      this.workspace = workspace;
      this.key++;
      this.rm = () => {
        a();
        b();
      };
    }
  }

  componentWillLoad() {
    this.controllerChanged();
  }

  componentShouldUpdate(_a: any, _b: any, prop: string) {
    if (prop === "controller") {
      return false;
    }
    return true;
  }

  private renderTool(controller: any, workspace: Workspace | undefined) {
    if (workspace) {
      const tag = controller?.tagName;
      switch (tag) {
        case "SET-VIEW-VOLUMETRIC":
          return tool3D(controller, workspace);
        case "SET-VIEW-SLICES":
          return toolLayers(controller, workspace);
        case "SET-VIEW-GEOMETRY":
          return tool3DGeometry(controller, workspace);

        default:
          return toolDefault();
      }
    }
  }

  render() {
    const constroller = this.controller;
    return (
      <Host>
        <div class="toolbar-content" key={`${this.key}`}>
          {this.renderTool(constroller, this.workspace)}
        </div>
      </Host>
    );
  }
}

const Fragment: FunctionalComponent = (_, children) => {
  return children;
};

const toolDefault = () => {
  return (
    <section>
      <div class="tool-content no-panel">
        <h2>No panel selected</h2>
        <p>
          This side menu includes contextual settings and information of the
          selected panel on the right.
        </p>
      </div>
    </section>
  );
};

const tool3DGeometry = (
  controller: HTMLSetViewGeometryElement,
  _workspace: Workspace
) => {
  const ref = getRenderingRef();
  const showAxial = controller.showPlanes.includes("axial");
  const showSagittal = controller.showPlanes.includes("sagittal");
  const showCoronal = controller.showPlanes.includes("coronal");

  return (
    <Fragment>
      <section>
        <h1>
          <set-icon name="videocam-outline" />
          Camera
        </h1>

        <div class="tool-content">
          <set-input-select
            header="Camera"
            value={controller.camera}
            onSetChange={(ev) => {
              controller.camera = ev.detail as any;
              forceUpdate(ref);
            }}
            options={{
              perspective: "Perspective",
              orthographic: "Orthographic",
            }}
          />
        </div>
      </section>
      <section>
        <h1>
          <set-icon name="cube-outline" />
          Geometry
        </h1>
        <div class="tool-content">
          <div class="add-material">
            <button
              class={{ selected: showAxial }}
              onClick={() => {
                if (showAxial) {
                  controller.showPlanes = controller.showPlanes.filter(
                    (p) => p !== "axial"
                  );
                } else {
                  controller.showPlanes = [...controller.showPlanes, "axial"];
                }
                forceUpdate(ref);
              }}
              title="Toggle transversal plane"
            >
              <Cube transversal />
            </button>
            <button
              class={{ selected: showSagittal }}
              onClick={() => {
                if (showSagittal) {
                  controller.showPlanes = controller.showPlanes.filter(
                    (p) => p !== "sagittal"
                  );
                } else {
                  controller.showPlanes = [
                    ...controller.showPlanes,
                    "sagittal",
                  ];
                }
                forceUpdate(ref);
              }}
              title="Toggle sagittal plane"
            >
              <Cube sagittal />
            </button>
            <button
              class={{ selected: showCoronal }}
              onClick={() => {
                if (showCoronal) {
                  controller.showPlanes = controller.showPlanes.filter(
                    (p) => p !== "coronal"
                  );
                } else {
                  controller.showPlanes = [...controller.showPlanes, "coronal"];
                }
                forceUpdate(ref);
              }}
              title="Toggle coronal plane"
            >
              <Cube coronal />
            </button>
          </div>
          <set-control-geometries workspace={controller.workspace} />
        </div>
      </section>
    </Fragment>
  );
};

const tool3D = (
  controller: HTMLSetViewVolumetricElement,
  workspace: Workspace
) => {
  const ref = getRenderingRef();
  const colorMaps = controller.shader === "max-intensity" ? "all" : "materials";
  const window = controller.cutHigh - controller.cutLow;
  const level = controller.cutLow + window / 2.0;

  return (
    <Fragment>
      <section>
        <h1>
          <set-icon name="contrast" />
          Color mapping
        </h1>
        <div class="tool-content">
          <set-input-select
            header="Shader"
            value={controller.shader}
            onSetChange={(ev) => {
              controller.shader = ev.detail as any;
              forceUpdate(ref);
            }}
            options={{
              basic: "Basic",
              lighting: "Lighting",
              shadows: "Shadows",
              "max-intensity": "Max Intensity",
            }}
          />
          <set-control-colormap
            colormap={controller.colormap}
            colormaps={colorMaps}
            window={window}
            level={level}
            onSetChange={(ev) => {
              controller.colormap = ev.detail;
            }}
          />
        </div>
      </section>

      {controller.shader !== "max-intensity" && (
        <section>
          <h1>
            <set-icon name="flashlight" />
            Lighting
          </h1>
          <div class="tool-content">
            <set-input-range
              header="Ambient"
              max={255}
              value={controller.ambientColor[3]}
              onSetChange={(ev) =>
                (controller.ambientColor = [255, 255, 255, ev.detail])
              }
            />
            <set-input-range
              header="Diffuse"
              max={255}
              value={controller.diffuseColor[3]}
              onSetChange={(ev) =>
                (controller.diffuseColor = [255, 255, 255, ev.detail])
              }
            />
            <set-input-range
              header="Specular"
              value={controller.specularColor[3]}
              onSetChange={(ev) =>
                (controller.specularColor = [255, 255, 255, ev.detail])
              }
            />
          </div>
        </section>
      )}
      {controller.shader === "max-intensity" && (
        <section>
          <h1>
            <set-icon name="color-filter" />
            Filtering
          </h1>
          <div class="tool-content">
            <set-input-range
              header="Low cut"
              min={MIN_HU}
              max={MAX_HU}
              value={controller.cutLow}
              onSetChange={(ev) => (controller.cutLow = ev.detail)}
            />
            <set-input-range
              header="High cut"
              min={MIN_HU}
              max={MAX_HU}
              value={controller.cutHigh}
              onSetChange={(ev) => (controller.cutHigh = ev.detail)}
            />
          </div>
        </section>
      )}
      <section>
        <h1>
          <set-icon name="color-filter" />
          Geometry
        </h1>
        <div class="tool-content">
          <button
            class="add-material"
            onClick={async () => {
              if (controller.colormap?.type === "materials") {
                const materials = controller.colormap.materials.filter(
                  (m) => !m.disabled
                );
                materials.map(async (material) => {
                  const geometry = await workspace.med!.volume!.getGeometryFromIso(
                    {
                      name: material.name,
                      from: material.from,
                      to: material.to,
                      box: workspace.box,
                    }
                  );
                  workspace.geometries = [...workspace.geometries, geometry];
                });
              }
            }}
          >
            Generate geometry
          </button>
        </div>
      </section>
    </Fragment>
  );
};

const toolLayers = (
  _controller: HTMLSetViewSlicesElement,
  workspace: Workspace
) => {
  return (
    <Fragment>
      <section>
        <h1>
          <set-icon name="contrast" />
          Color mapping
        </h1>
        <div class="tool-content">
          <set-control-colormap
            window={workspace.window}
            level={workspace.level}
            colormap={workspace.colormap}
            onSetChange={(ev) => {
              workspace.colormap = ev.detail;
            }}
          />
          <div class="material-form">
            <label>
              <div>Window</div>
              <input
                type="number"
                value={Math.round(workspace.window)}
                step="5"
                onInput={(ev) => {
                  workspace.window = parseInt((ev.target as any).value);
                }}
              />
            </label>
            <label>
              <div>Level</div>
              <input
                type="number"
                value={Math.round(workspace.level)}
                onInput={(ev) => {
                  workspace.level = parseInt((ev.target as any).value);
                }}
              />
            </label>
          </div>
        </div>
      </section>
      <section>
        <h1>
          <set-icon name="star-half" />
          Segmentation
        </h1>
        <div class="tool-content">
          <button
            class="add-material"
            onClick={async () => {
              document.querySelector("set-player")!.slicesAction = "new-brush";
              workspace.shapes = workspace.shapes.filter(
                (s) => s.type !== "brush"
              );
            }}
          >
            Paint seed points
          </button>
          <button
            class="add-material"
            onClick={async () => {
              const points: Point[] = [];
              workspace.shapes.forEach((s) => {
                if (s.type === "brush") {
                  points.push(...s.points);
                }
              });
              const geometry = await workspace.med!.volume!.getGeometryFromRegionGrow(
                {
                  seedPoints: points,
                  box: workspace.box,
                  multiplier: 1.25,
                }
              );
              workspace.geometries = [...workspace.geometries, geometry];
            }}
          >
            Perform segmentation
          </button>
        </div>
      </section>
    </Fragment>
  );
};

interface CubeOptions {
  transversal?: boolean;
  sagittal?: boolean;
  coronal?: boolean;
}

const Cube: FunctionalComponent<CubeOptions> = (props) => {
  const unselectedColor = "#C4C4C4";
  return (
    <svg
      width="39"
      height="40"
      viewBox="0 0 39 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.90118 13.5618C4.90118 12.8091 5.72383 12.3454 6.36776 12.7353L18.1964 19.8957C18.4855 20.0707 18.6622 20.3842 18.6622 20.7223V34.1982C18.6622 34.951 17.8396 35.4146 17.1956 35.0248L5.36704 27.8644C5.07785 27.6893 4.90118 27.3758 4.90118 27.0378L4.90118 13.5618Z"
        fill={props.coronal ? "#FF8080" : unselectedColor}
      />
      <path
        d="M32.9887 13.5618C32.9887 12.8091 32.1661 12.3454 31.5222 12.7353L19.6936 19.8957C19.4044 20.0708 19.2277 20.3842 19.2277 20.7223V34.1982C19.2277 34.951 20.0504 35.4146 20.6943 35.0248L32.5229 27.8644C32.8121 27.6893 32.9887 27.3758 32.9887 27.0378L32.9887 13.5618Z"
        fill={props.sagittal ? "#96FF7C" : unselectedColor}
      />
      <path
        d="M31.5169 12.173C32.1626 11.7865 32.1261 10.8474 31.4519 10.4998L19.8034 4.49498C19.528 4.35301 19.2017 4.34855 18.9249 4.48299L6.49347 10.519C5.80567 10.8529 5.77068 11.8096 6.43188 12.2031L18.4795 19.3733C18.79 19.5581 19.177 19.5585 19.4847 19.3744L31.5169 12.173Z"
        fill={props.transversal ? "#8591FF" : unselectedColor}
      />
    </svg>
  );
};

const MIN_HU = -1024;
const MAX_HU = 7178;
