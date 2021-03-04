export type ModalTypes = "alert" | "modal" | "popover";

export interface ModalOptions {
  type: ModalTypes;
  styles?: string;
  backdropClose?: boolean;
  render: (resolve: (value?: any) => void, forceUpdate: () => void) => any;
}

export const createModal = (opts: ModalOptions) => {
  const modal = document.createElement("set-modal");
  modal.renderContent = opts.render;
  modal.type = opts.type;
  if (opts.backdropClose !== undefined) {
    modal.backdropClose = opts.backdropClose;
  }
  modal.styles = opts.styles;
  document.body.appendChild(modal);
  return modal.componentOnReady().then(() => ({
    onDismiss: new Promise<any>((resolve) => {
      modal.resolve = resolve;
    }),
  }));
};
