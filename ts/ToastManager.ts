// #region Classes

/**
 * Class to manage Toasts
 */
export class ToastManager implements ToastListener {
  private readonly DEFAULT_DURATION = 3000;
  private readonly INITIAL_Y = 16;
  private readonly GAP = 8;
  private activeToasts: Toast[] = [];
  private template: HTMLTemplateElement;

  constructor() {
    const template = document.getElementById("toast") as HTMLTemplateElement;

    if (!template) {
      throw new Error(
        "The necessary <template> element was not found on this page"
      );
    }

    this.template = template;
  }

  private buildProps(props: ToastBuildProps, type: ToastType): ToastProps {
    return {
      ...props,
      duration:
        props.duration !== undefined ? props.duration : this.DEFAULT_DURATION,
      type: type,
      template: this.template,
      listener: this,
      dismissable: props.dismissable ?? true,
    };
  }

  private pushToast(newToast: Toast, resolver: Promise<Toast>) {
    this.activeToasts.push(newToast);
    this.updatePositions();

    resolver?.then((toast) => {
      this.onToastRemoved(toast);
    });
  }

  /**
   * Build and push a neutral toast to the user.
   * @param props Properties for the toast.
   */
  notify(props: ToastBuildProps) {
    const { newToast, resolver } = Toast.build(
      this.buildProps(props, ToastType.Neutral)
    );
    this.pushToast(newToast, resolver);
  }

  /**
   * Build and push a success toast to the user.
   * @param props Properties for the toast.
   */
  success(props: ToastBuildProps) {
    const { newToast, resolver } = Toast.build(
      this.buildProps(props, ToastType.Success)
    );
    this.pushToast(newToast, resolver);
  }

  /**
   * Build and push a warning toast to the user.
   * @param props Properties for the toast.
   */
  warn(props: ToastBuildProps) {
    const { newToast, resolver } = Toast.build(
      this.buildProps(props, ToastType.Warn)
    );
    this.pushToast(newToast, resolver);
  }

  /**
   * Build and push an error toast to the user.
   * @param props Properties for the toast.
   */
  error(props: ToastBuildProps) {
    const { newToast, resolver } = Toast.build(
      this.buildProps(props, ToastType.Error)
    );
    this.pushToast(newToast, resolver);
  }

  private updatePositions() {
    let snapshot = [...this.activeToasts];
    let y = this.INITIAL_Y;

    for (let i = 0; i < snapshot.length; ++i) {
      snapshot[i].setTop(y);
      y += Math.ceil(snapshot[i].getHeight() + this.GAP);
    }
  }

  getCount(): number {
    return this.activeToasts.length;
  }

  onToastRemoved(toast: Toast) {
    let index = this.activeToasts.indexOf(toast);
    this.activeToasts.splice(index, 1);

    for (let i = index; i < this.activeToasts.length; ++i) {
      this.activeToasts[i].setDelay((i - index) * 30);
    }

    this.updatePositions();
  }
}

/**
 * The internal class representing a Toast
 */
export class Toast {
  private readonly TRANSITION_DURATION = 300;
  private element: HTMLDivElement;
  private height: number;
  private removed: boolean = false;
  private static cssProps = {
    textColor: "--_text",
    titleColor: "--_title",
    backgroundColor: "--_bg",
    borderColor: "--_border",
    borderHoverColor: "--_border-hover",
    dismissButtonColor: "--_dismiss",
    dismissButtonHoverColor: "--_dismiss-hover",
  };

  constructor(props: ToastProps) {
    let template = props.template.content.cloneNode(
      true
    ) as HTMLTemplateElement;
    let toast = template.querySelector(".toast") as HTMLDivElement;

    switch (props.type) {
      case ToastType.Neutral:
        toast.classList.add("neutral");
        break;
      case ToastType.Success:
        toast.classList.add("success");
        break;
      case ToastType.Warn:
        toast.classList.add("warn");
        break;
      case ToastType.Error:
        toast.classList.add("error");
        break;
    }

    if (props.type === ToastType.Warn || props.type === ToastType.Error) {
      toast.ariaLive = "assertive";
    }

    let messageText = template.querySelector(".toast-message");
    messageText.textContent = props.message;

    let titleText = template.querySelector(".toast-title");

    let dismissButton = template.querySelector(".dismiss") as HTMLButtonElement;

    if (!props.title) {
      titleText.remove();
    } else {
      titleText.textContent = props.title;
    }

    if (props.onclick) {
      toast.onclick = props.onclick;
      toast.classList.add("has-listener");
    }

    if (props.dismissable) {
      dismissButton.onclick = () => {
        this.remove().then(() => {
          props.listener.onToastRemoved(this);
        });
      };
    } else {
      dismissButton.remove();
    }

    if (props.style) {
      for (let key of Object.keys(props.style)) {
        toast.style.setProperty(Toast.cssProps[key], props.style[key]);
      }
    }

    document.body.prepend(template);
    this.height = toast.getBoundingClientRect().height;
    this.element = toast as HTMLDivElement;
  }

  remove() {
    if (this.removed) return;
    this.removed = true;

    return new Promise<boolean>((resolve) => {
      this.element?.classList.add("remove");

      setTimeout(() => {
        this.element?.remove();
      }, this.TRANSITION_DURATION);

      resolve(true);
    });
  }

  static build(props: ToastProps): {
    newToast: Toast;
    resolver?: Promise<Toast>;
  } {
    if (!props.dismissable && props.duration === 0) {
      throw new Error(
        "A Toast must either be dismissable or have a non-infinite duration"
      );
    }

    let newToast = new Toast(props);
    let resolver = null;

    if (props.duration > 0) {
      resolver = new Promise<Toast>((resolve) => {
        setTimeout(() => {
          newToast.remove()?.then(() => {
            resolve(newToast);
          });
        }, props.duration);
      });
    }

    return { newToast, resolver };
  }

  setDelay(newDelay: number) {
    this.element.style.setProperty("--_delay", `${newDelay}ms`);
  }

  setTop(newTop: number) {
    this.element.style.setProperty("--_top", `${newTop}px`);
  }

  getHeight() {
    return this.height;
  }
}

// #endregion Classes

// #region Types

export type ToastProps = {
  type: ToastType;
  template: HTMLTemplateElement;
  title?: string;
  message: string;
  duration: number;
  onclick?: (this: GlobalEventHandlers, ev: MouseEvent) => any;
  listener: ToastListener;
  dismissable: boolean;
  style?: ToastStyles;
};

export type ToastBuildProps = {
  title?: string;
  message: string;
  duration?: number;
  onclick?: (this: GlobalEventHandlers, ev: MouseEvent) => any;
  dismissable?: boolean;
  style?: ToastStyles;
};

enum ToastType {
  Neutral,
  Success,
  Warn,
  Error,
}

interface ToastListener {
  onToastRemoved(toast: Toast): void;
}

export type ToastStyles = {
  textColor?: string;
  titleColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderHoverColor?: string;
  dismissButtonColor?: string;
  dismissButtonHoverColor?: string;
};

// #endregion Types
