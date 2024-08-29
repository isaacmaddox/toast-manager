export default class ToastManager {
  private readonly DEFAULT_DURATION = 3000;
  private readonly INITIAL_TOP = 16;
  private readonly GAP = 8;
  private activeToasts: Toast[] = [];
  private template: HTMLTemplateElement;

  constructor() {
    let template = document.getElementById("tm-template") as HTMLTemplateElement;

    if (!template) {
      throw new Error("ToastManager couldn't find the necessary <template> element on this page");
    }

    this.template = template;
  }

  private getProps(oldProps: ToastProps, type: ToastType): StrictToastProps {
    return {
      ...oldProps,
      type: type,
      duration: oldProps.duration ?? this.DEFAULT_DURATION,
      dismissable: oldProps.dismissable ?? true,
      template: this.template,
      onRemove: (t) => {
        this.onToastRemove(t);
      },
    };
  }

  private updateToastProps() {
    let top = this.INITIAL_TOP;

    for (const toast of this.activeToasts) {
      toast.top = top;
      top += toast.height + this.GAP;
    }
  }

  private updateToastDelay(start: number) {
    for (let i = start; i < this.activeToasts.length; ++i) {
      this.activeToasts[i].delay = (i - start) * 30;
    }
  }

  private onToastRemove(toast: Toast) {
    let ind = this.activeToasts.indexOf(toast);
    this.activeToasts.splice(ind, 1);
    this.updateToastProps();
    this.updateToastDelay(ind);
  }

  makeToast(props: ToastProps, type: ToastType) {
    let strictProps = this.getProps(props, type);
    let newToast = new Toast(strictProps);
    this.activeToasts.push(newToast);
    this.updateToastProps();
  }

  notify(props: ToastProps) {
    this.makeToast(props, ToastType.Neutral);
  }

  success(props: ToastProps) {
    this.makeToast(props, ToastType.Success);
  }

  warn(props: ToastProps) {
    this.makeToast(props, ToastType.Warn);
  }

  error(props: ToastProps) {
    this.makeToast(props, ToastType.Error);
  }

  get toastCount(): number {
    return this.activeToasts.length;
  }
}

export class Toast {
  public height: number;
  private readonly ANIMATION_DURATION = 300;
  private element: HTMLDivElement;
  private props: StrictToastProps;
  private timeout: number;
  private static cssProps = {
    textColor: "--_text",
    titleColor: "--_title",
    backgroundColor: "--_bg",
    borderColor: "--_border",
    borderHoverColor: "--_border-hover",
    dismissButtonColor: "--_dismiss",
    dismissButtonHoverColor: "--_dismiss-hover",
  };

  constructor(props: StrictToastProps) {
    this.props = props;
    const toast = (props.template.content.cloneNode(true) as HTMLElement).querySelector(".toast") as HTMLDivElement;
    const titleElement = toast.querySelector(".toast-title");
    const messageElement = toast.querySelector(".toast-message");
    const dismissButton = toast.querySelector("button.dismiss") as HTMLButtonElement;

    // Error checking
    if (props.duration < 0) props.duration = 0;

    if (!props.dismissable && props.duration === 0) {
      throw new Error("Toasts must be dismissable or have a non-infinite duration");
    }

    // Remove unecessary elements, else set their values
    if (!props.title) {
      titleElement.remove();
    } else {
      titleElement.textContent = props.title;
    }

    if (!props.dismissable) {
      dismissButton.remove();
    } else {
      dismissButton.onclick = () => {
        this.remove();
      };
    }

    messageElement.textContent = props.message;

    switch (props.type) {
      case ToastType.Success:
        toast.classList.add("success");
        break;
      case ToastType.Warn:
        toast.classList.add("warn");
        break;
      case ToastType.Error:
        toast.classList.add("error");
        break;
      default:
        toast.classList.add("neutral");
        break;
    }

    if (props.style)
      for (const [key, value] of Object.entries(props.style)) {
        toast.style.setProperty(Toast.cssProps[key], value);
      }

    if (props.type === ToastType.Warn || props.type === ToastType.Error) {
      toast.ariaLive = "assertive";
    }

    document.body.prepend(toast);
    this.height = toast.getBoundingClientRect().height;
    this.element = toast;

    if (props.duration !== 0) {
      this.timeout = setTimeout(() => {
        this.remove();
      }, props.duration + this.ANIMATION_DURATION);
    }
  }

  private remove() {
    this.element.classList.add("remove");
    clearTimeout(this.timeout);
    this.props.onRemove(this);

    setTimeout(() => {
      this.element.remove();
    }, this.ANIMATION_DURATION);
  }

  set top(newTop: number) {
    this.element.style.setProperty("--_top", `${newTop}px`);
  }

  set delay(newDelay: number) {
    this.element.style.setProperty("--_delay", `${newDelay}ms`);
  }
}

export type ToastProps = {
  title?: string;
  message: string;
  duration?: number;
  dismissable?: boolean;
  style?: ToastStyles;
  onClick?: (this: GlobalEventHandlers, ev: MouseEvent) => any;
};

type StrictToastProps = {
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
  dismissable: boolean;
  style?: ToastStyles;
  template: HTMLTemplateElement;
  onClick?: (this: GlobalEventHandlers, ev: MouseEvent) => any;
  onRemove: (toast: Toast) => void;
};

export type ToastStyles = {
  textColor?: string;
  titleColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderHoverColor?: string;
  dismissButtonColor?: string;
  dismissButtonHoverColor?: string;
};

enum ToastType {
  Neutral,
  Success,
  Warn,
  Error,
}
