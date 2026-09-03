const loginForm = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");
const loginError = document.getElementById("loginError");
const togglePassword = document.getElementById("togglePassword");

// Usuários autorizados
const usuariosValidos = [
    {
        usuario: "admin",
        senha: "123456"
    },
    {
        usuario: "Matias.toex",
        senha: "Matias47"
    }
];

// Se já estiver logado, vai direto para o Dashboard
if (sessionStorage.getItem("atestado_logged") === "true") {
    window.location.replace("dashboard.html");
}

// Mostrar / ocultar senha
togglePassword.addEventListener("click", () => {
    const showing = password.type === "text";

    password.type = showing ? "password" : "text";

    togglePassword.setAttribute(
        "aria-label",
        showing ? "Mostrar senha" : "Ocultar senha"
    );
});

// Login
loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const usuario = username.value.trim();
    const senha = password.value;

    // Procura o usuário e senha na lista
    const usuarioEncontrado = usuariosValidos.find(
        item =>
            item.usuario === usuario &&
            item.senha === senha
    );

    if (usuarioEncontrado) {
        // Salva a sessão
        sessionStorage.setItem("atestado_logged", "true");

        // Salva qual usuário entrou
        sessionStorage.setItem(
            "atestado_usuario",
            usuarioEncontrado.usuario
        );

        // Vai para o Dashboard
        window.location.replace("dashboard.html");

        return;
    }

    // Login incorreto
    loginError.classList.add("show");

    password.value = "";

    password.focus();
});

// Remove mensagem de erro ao digitar
username.addEventListener("input", () => {
    loginError.classList.remove("show");
});

password.addEventListener("input", () => {
    loginError.classList.remove("show");
});