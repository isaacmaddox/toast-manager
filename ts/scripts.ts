import ToastManager, { ToastProps, ToastStyles } from "./ToastManager.js";

let manager = new ToastManager();

document.getElementById("toast-trigger").addEventListener("click", () => {
  let msg = (document.getElementById("toast-content") as HTMLInputElement).value.trim();
  if (msg === "") msg = "Hello, World!";

  let hue = Math.floor(Math.random() * 361);

  manager.notify({
    message: msg,
    duration: 3000,
    style: {
      backgroundColor: `hsl(${hue}, 50%, 95%)`,
      borderColor: `hsl(${hue}, 50%, 80%)`,
      borderHoverColor: `hsl(${hue}, 50%, 70%)`,
      dismissButtonColor: `hsl(${hue}, 60%, 65%)`,
      dismissButtonHoverColor: `hsl(${hue}, 60%, 35%)`,
      textColor: `hsl(${hue}, 60%, 25%)`,
    },
  });
});

const advancedButton = document.getElementById("show-advanced");
let inputs = document.querySelectorAll("#try-form input") as NodeListOf<HTMLInputElement>;

document.getElementById("try-form").addEventListener("keyup", (e) => {
  if (e.key === "Enter")
    document.getElementById("create-custom-toast").click();
})

advancedButton.addEventListener("click", () => {
  const adv = document.querySelector("#try-form .advanced");

  if (adv.classList.toggle("show")) {
    advancedButton.textContent = "Hide advanced options";
  } else {
    advancedButton.textContent = "Show advanced options";
  }
})

document.getElementById("create-custom-toast").addEventListener("click", () => {
  let values = Array.from(inputs).map(i => i.value.trim());

  let title = values[0];
  let message = values[1];
  let duration = values[2];
  let dismissable = inputs[3].checked;
  let type = (document.getElementById("toast-options-type") as HTMLSelectElement).value;

  let styles: ToastStyles = {
    backgroundColor: values[4] !== "" ? values[4] : null,
    borderColor: values[5] !== "" ? values[5] : null,
    borderHoverColor: values[6] !== "" ? values[6] : null,
    textColor: values[7] !== "" ? values[7] : null,
    titleColor: values[8] !== "" ? values[8] : null,
    dismissButtonColor: values[9] !== "" ? values[9] : null,
    dismissButtonHoverColor: values[10] !== "" ? values[10] : null,
  }

  try {
    let options: ToastProps = {
      title: title !== "" ? title : null,
      message: message,
      duration: duration !== "" ? parseInt(duration) : null,
      dismissable: dismissable,
      style: styles
    };

    switch (type) {
      case "success":
        manager.success(options);
        break;
      case "warning":
        manager.warn(options);
        break;
      case "error":
        manager.error(options);
        break;
      default:
        manager.notify(options);
        break;
    }
  } catch (e) {
    manager.error({
      message: e.message
    })
  }
})