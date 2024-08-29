import ToastManager from "./ToastManager.js";

let manager = new ToastManager();

document.getElementById("toast-trigger").addEventListener("click", () => {
  let msg = (document.getElementById("toast-content") as HTMLInputElement).value.trim();
  if (msg === "") msg = "Hello, World!";

  let hue = Math.floor(Math.random() * 256);

  manager.notify({
    message: msg,
    duration: 3000,
    style: {
      backgroundColor: `hsl(${hue}, 50%, 95%)`,
      borderColor: `hsl(${hue}, 50%, 80%)`,
      borderHoverColor: `hsl(${hue}, 50%, 75%)`,
      dismissButtonColor: `hsl(${hue}, 60%, 65%)`,
      dismissButtonHoverColor: `hsl(${hue}, 60%, 35%)`,
      textColor: `hsl(${hue}, 60%, 25%)`,
    },
  });
});