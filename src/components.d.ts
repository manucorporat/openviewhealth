/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { MedSource, SlicesAction } from "@sethealth/core";
export namespace Components {
    interface SetModal {
        "backdropClose": boolean;
        "renderContent"?: (
    resolve: (value: any) => void,
    forceUpdate: () => void
  ) => any;
        "resolve"?: (value: any) => void;
        "styles"?: string;
        "type": "alert" | "modal" | "popover";
    }
    interface SetPlayer {
        "openFromID": (id: string) => Promise<void>;
        "openFromSource": (source: MedSource) => Promise<void>;
        "sideMenu": string | undefined;
        "slicesAction": SlicesAction;
    }
    interface SetSidemenu {
        "controller"?: any;
    }
}
declare global {
    interface HTMLSetModalElement extends Components.SetModal, HTMLStencilElement {
    }
    var HTMLSetModalElement: {
        prototype: HTMLSetModalElement;
        new (): HTMLSetModalElement;
    };
    interface HTMLSetPlayerElement extends Components.SetPlayer, HTMLStencilElement {
    }
    var HTMLSetPlayerElement: {
        prototype: HTMLSetPlayerElement;
        new (): HTMLSetPlayerElement;
    };
    interface HTMLSetSidemenuElement extends Components.SetSidemenu, HTMLStencilElement {
    }
    var HTMLSetSidemenuElement: {
        prototype: HTMLSetSidemenuElement;
        new (): HTMLSetSidemenuElement;
    };
    interface HTMLElementTagNameMap {
        "set-modal": HTMLSetModalElement;
        "set-player": HTMLSetPlayerElement;
        "set-sidemenu": HTMLSetSidemenuElement;
    }
}
declare namespace LocalJSX {
    interface SetModal {
        "backdropClose"?: boolean;
        "renderContent"?: (
    resolve: (value: any) => void,
    forceUpdate: () => void
  ) => any;
        "resolve"?: (value: any) => void;
        "styles"?: string;
        "type"?: "alert" | "modal" | "popover";
    }
    interface SetPlayer {
        "sideMenu"?: string | undefined;
        "slicesAction"?: SlicesAction;
    }
    interface SetSidemenu {
        "controller"?: any;
    }
    interface IntrinsicElements {
        "set-modal": SetModal;
        "set-player": SetPlayer;
        "set-sidemenu": SetSidemenu;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "set-modal": LocalJSX.SetModal & JSXBase.HTMLAttributes<HTMLSetModalElement>;
            "set-player": LocalJSX.SetPlayer & JSXBase.HTMLAttributes<HTMLSetPlayerElement>;
            "set-sidemenu": LocalJSX.SetSidemenu & JSXBase.HTMLAttributes<HTMLSetSidemenuElement>;
        }
    }
}
