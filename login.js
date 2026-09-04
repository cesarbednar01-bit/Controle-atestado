import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { auth } from "./firebase.js";

const loginForm = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");
const loginError = document.getElementById("loginError");
const togglePassword = document.getElementById("togglePassword");

// Usuários do sistema
// O usuário digita o nome abaixo, mas o Firebase autentica pelo e-mail.
const usuarios = {
    "admin": "junior.bednarczuk01@gmail.com",
    "Matias.toex": "matiasdacargill@gmail.com"
};

// Mostrar / ocultar senha
if (togglePassword) {
    togglePassword.addEventListener("click", () => {
        const mostrando = password.type === "text";

        password.type = mostrando ? "password" : "text";

        togglePassword.setAttribute(
            "aria-label",
            mostrando ? "Mostrar senha" : "Ocultar senha"
        );
    });
}

// Login
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const usuarioDigitado = username.value.trim();
    const senhaDigitada = password.value;

    // Limpa erro anterior
    loginError.classList.remove("show");

    // Verifica se o usuário existe no sistema
    const email = usuarios[usuarioDigitado];

    if (!email) {
        loginError.textContent = "Usuário ou senha inválidos.";
        loginError.classList.add("show");
        password.value = "";
        password.focus();
        return;
    }

    try {
        // Autenticação pelo Firebase
        await signInWithEmailAndPassword(
            auth,
            email,
            senhaDigitada
        );

        // Login realizado
        window.location.replace("dashboard.html");

    } catch (error) {
        console.error("Erro ao realizar login:", error);

        loginError.textContent = "Usuário ou senha inválidos.";
        loginError.classList.add("show");

        password.value = "";
        password.focus();
    }
});

// Remove a mensagem de erro ao digitar novamente
username.addEventListener("input", () => {
    loginError.classList.remove("show");
});

password.addEventListener("input", () => {
    loginError.classList.remove("show");
});