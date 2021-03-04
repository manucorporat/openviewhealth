import {
  Component,
  Host,
  h,
  Prop,
  Element,
  Build,
  forceUpdate,
} from "@stencil/core";

@Component({
  tag: "set-modal",
  styleUrl: "set-modal.css",
  shadow: true,
})
export class SetModal {
  @Element() el!: HTMLElement;

  @Prop() type: "alert" | "modal" | "popover" = "alert";
  @Prop() backdropClose = true;
  @Prop() renderContent?: (
    resolve: (value: any) => void,
    forceUpdate: () => void
  ) => any;
  @Prop() resolve?: (value: any) => void;
  @Prop() styles?: string;

  componentWillLoad() {
    const styles = this.styles;
    if (Build.isBrowser && styles) {
      const styleEl = document.createElement("style");
      styleEl.textContent = styles;
      this.el.shadowRoot?.prepend(styleEl);
    }
  }

  private backdropClick = (ev: MouseEvent) => {
    if (
      this.backdropClose &&
      (ev.target as HTMLElement).classList.contains("backdrop")
    ) {
      this.closeModal(undefined);
    }
    ev.preventDefault();
    ev.stopImmediatePropagation();
  };

  private closeModal = (returnValue: any) => {
    this.el.remove();
    if (this.resolve) {
      this.resolve(returnValue);
    }
  };

  private forceUpdate = () => {
    forceUpdate(this);
  };

  render() {
    const { renderContent, closeModal, forceUpdate } = this;
    return (
      <Host class={`type-${this.type}`}>
        <div
          role="presentation"
          class="backdrop"
          onClick={this.backdropClick}
        />
        <div class="container">
          <div class="content">
            {renderContent && renderContent(closeModal, forceUpdate)}
          </div>
        </div>
      </Host>
    );
  }
}
