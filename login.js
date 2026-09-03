const loginForm = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");
const loginError = document.getElementById("loginError");
const togglePassword = document.getElementById("togglePassword");

const usuarioValido = "admin";
const senhaValida = "123456";

if (sessionStorage.getItem("atestado_logged") === "true") {
  window.location.replace("dashboard.html");
}

togglePassword.addEventListener("click", () => {
  const showing = password.type === "text";
  password.type = showing ? "password" : "text";
  togglePassword.setAttribute("aria-label", showing ? "Mostrar senha" : "Ocultar senha");
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const usuario = username.value.trim();
  const senha = password.value;

  if (usuario === usuarioValido && senha === senhaValida) {
    sessionStorage.setItem("atestado_logged", "true");
    window.location.replace("dashboard.html");
    return;
  }

  loginError.classList.add("show");
  password.value = "";
  password.focus();
});

username.addEventListener("input", () => loginError.classList.remove("show"));
password.addEventListener("input", () => loginError.classList.remove("show"));
