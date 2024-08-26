export class ToastManager {
   private activeToasts: Toast[];
   private neutralTemplate: HTMLTemplateElement;

   constructor() {
      this.neutralTemplate = document.getElementById("neutral-tast") as HTMLTemplateElement;

      if (!this.neutralTemplate) {
         throw new ToastManagerError("The current page is missing the \"neutral-toast\" HTML <template> element");
      }
   }

   warn(props: ToastProps): Toast {
      const newToast = this.makeNewToast(props);
      return newToast;
   }

   private makeNewToast(props: FullToastProps): Toast {
      const newToast = new Toast(props);
      this.activeToasts.push(newToast);
      return newToast;
   }
}

export class Toast {
   private element: HTMLDivElement;

   constructor({ type, title, message }: FullToastProps) {

   }

}

class ToastManagerError extends Error {
   constructor(message) {
      super(message, {
         cause: "Improper setup"
      });
   }
}

type FullToastProps = {
   type: "neutral" | "warning" | "error" | "success";
   title?: string;
   message: string;
   duration: number;
}

export type ToastProps = {
   title?: string;
   message: string;
   duration?: number;
}