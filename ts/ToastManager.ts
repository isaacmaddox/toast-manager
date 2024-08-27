// #region Types

export type ToastProps = {
   type: ToastType;
   template: HTMLTemplateElement;
   title?: string;
   message: string;
   duration: number;
   onclick?: (this: GlobalEventHandlers, ev: MouseEvent) => any;
   listener: ToastListener
}

export type ToastBuildProps = {
   title?: string;
   message: string;
   duration?: number;
   onclick?: (this: GlobalEventHandlers, ev: MouseEvent) => any;
}

enum ToastType {
   Neutral,
   Success,
   Warn,
   Error
}

interface ToastListener {
   onToastRemoved(toast: Toast): void;
}

// #endregion Types

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
      // Check for the necessary template elements
      const template = document.getElementById("toast") as HTMLTemplateElement;

      if (!template) {
         throw new Error("The necessary <template> element was not found on this page");
      } else {
         this.template = template;
      }
   }

   private buildProps(props: ToastBuildProps, type: ToastType): ToastProps {
      return {
         ...props,
         duration: props.duration !== undefined ? props.duration : this.DEFAULT_DURATION,
         type: type,
         template: this.template,
         listener: this
      }
   }

   private pushToast(newToast: Toast, resolver: Promise<Toast>) {
      this.activeToasts.push(newToast);
      this.updatePositions();

      resolver?.then((toast) => {
         this.onToastRemoved(toast)
      });
   }

   /**
    * Build and push a neutral toast to the user.
    * @param props Properties for the toast.
    */
   notify(props: ToastBuildProps) {
      const { newToast, resolver } = ToastBuilder.build(this.buildProps(props, ToastType.Neutral));
      this.pushToast(newToast, resolver);
   }

   /**
    * Build and push a success toast to the user.
    * @param props Properties for the toast.
    */
   success(props: ToastBuildProps) {
      const { newToast, resolver } = ToastBuilder.build(this.buildProps(props, ToastType.Success));
      this.pushToast(newToast, resolver);
   }

   /**
    * Build and push a warning toast to the user.
    * @param props Properties for the toast.
    */
   warn(props: ToastBuildProps) {
      const { newToast, resolver } = ToastBuilder.build(this.buildProps(props, ToastType.Warn));
      this.pushToast(newToast, resolver);
   }

   /**
    * Build and push an error toast to the user.
    * @param props Properties for the toast.
    */
   error(props: ToastBuildProps) {
      const { newToast, resolver } = ToastBuilder.build(this.buildProps(props, ToastType.Error));
      this.pushToast(newToast, resolver);
   }

   private updatePositions() {
      let snapshot = [...this.activeToasts];
      let y = this.INITIAL_Y;

      for (let toast of snapshot) {
         toast.setTop(y);
         y += Math.ceil(toast.getHeight() + this.GAP);
      }
   }

   onToastRemoved(toast: Toast) {
      this.activeToasts.splice(this.activeToasts.indexOf(toast), 1);
      this.updatePositions();
   }
}

/**
 * The internal class representing a Toast
 */
export class Toast {
   private readonly TRANSITION_DURATION = 500;
   private element: HTMLDivElement;
   private height: number;
   private removed: boolean = false;

   constructor(props: ToastProps) {
      let template = props.template.content.cloneNode(true) as HTMLTemplateElement;
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

      dismissButton.onclick = () => {
         this.remove().then(() => {
            props.listener.onToastRemoved(this);
         });
      };

      document.body.prepend(template);
      this.height = toast.getBoundingClientRect().height;
      this.element = toast as HTMLDivElement;
   }

   remove() {
      if (this.removed) return;
      this.removed = true;

      return new Promise<boolean>(resolve => {
         this.element?.classList.add("remove");

         setTimeout(() => {
            this.element?.remove();
         }, this.TRANSITION_DURATION);

         resolve(true);
      });
   }

   setTop(newTop: number) {
      this.element.style.setProperty("--_top", `${newTop}px`);
   }

   getHeight() {
      return this.height;
   }
}

/**
 * Internal class used to build a Toast and handle its removal
 */
class ToastBuilder {
   static build(props: ToastProps): { newToast: Toast, resolver?: Promise<Toast> } {
      let newToast = new Toast(props);
      let resolver = null;

      if (props.duration > 0) {
         resolver = new Promise<Toast>(resolve => {
            setTimeout(() => {
               newToast.remove()?.then(() => {
                  resolve(newToast);
               })
            }, props.duration);
         });
      }

      return { newToast, resolver };
   }
}

// #endregion Classes