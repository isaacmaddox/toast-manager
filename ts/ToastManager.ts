// #region Types

/**
 * @description Properties used to call the Toast constructor. This contains all the ingredients to make your Toast come to life!
 */
export type ToastProps = {
   type: ToastType;
   template: HTMLTemplateElement;
   title?: string;
   message: string;
   duration: number;
   onclick?: (this: GlobalEventHandlers, ev: MouseEvent) => any;
}

/**
 * @description Properties used to call a Toast building function. This type excludes the `type` property and marks `duration` as optional.
 */
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

type ToastPropsWithRemoveFunction = ToastProps & {
   onRemove: CallableFunction;
}

// #endregion Types

// #region Classes

export class ToastManager {
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

   getProps(props): ToastPropsWithRemoveFunction {
      return {
         ...props,
         duration: props.duration !== undefined ? props.duration : this.DEFAULT_DURATION,
         type: ToastType.Neutral,
         template: this.template,
         onRemove: this.onRemoveFunction
      };
   }

   onRemoveFunction = (toast) => {
      this.activeToasts.splice(this.activeToasts.indexOf(toast), 1);
      this.updatePositions();
   }

   notify(props: ToastBuildProps) {
      let newProps = { ...this.getProps(props), onRemove: this.onRemoveFunction }

      const { newToast, resolver }: { newToast: Toast, resolver?: Promise<boolean> } = ToastBuilder.build(newProps);

      this.activeToasts.push(newToast);
      this.updatePositions();

      resolver?.then(this.onRemoveFunction);
   }

   updatePositions() {
      let snapshot = [...this.activeToasts];
      let y = this.INITIAL_Y;

      for (let toast of snapshot) {
         toast.setTop(y);
         y += toast.getHeight() + this.GAP;
      }
   }
}

export class Toast {
   private readonly TRANSITION_DURATION = 500;
   private element: HTMLDivElement;
   private height: number;

   constructor(props: ToastPropsWithRemoveFunction) {
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
            props.onRemove();
         });
      };

      document.body.prepend(template);
      this.height = toast.getBoundingClientRect().height;
      this.element = toast as HTMLDivElement;
   }

   remove() {
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

export class ToastBuilder {
   static build(props: ToastPropsWithRemoveFunction) {
      let newToast = new Toast(props);
      let resolver = null;

      if (props.duration > 0) {
         resolver = new Promise<boolean>(resolve => {
            setTimeout(() => {
               newToast.remove().then(() => {
                  resolve(true);
               })
            }, props.duration);
         });
      }

      return { newToast, resolver };
   }
}

// #endregion Classes