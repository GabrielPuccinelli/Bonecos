document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginErrorMessage = document.getElementById('login-error-message');

    if (loginForm && usernameInput && passwordInput && loginErrorMessage) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Stop default form submission

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            // Simulate authentication
            if (username === "user" && password === "password") {
                // Authentication successful
                loginErrorMessage.style.display = 'none';
                loginErrorMessage.textContent = ''; // Clear any previous error message

                // Set login status in sessionStorage
                sessionStorage.setItem('loggedIn', 'true');

                // Redirect to the main portal page
                window.location.href = 'index.html';
            } else if (username === "" || password === "") {
                // Authentication failed - empty fields
                loginErrorMessage.textContent = 'Por favor, preencha ambos os campos de usuário e senha.';
                loginErrorMessage.style.display = 'block';
                if (password !== "") { // Only clear password if it was typed into but username might be empty
                    passwordInput.value = '';
                }
                if (username === "") {
                    usernameInput.focus();
                } else {
                    passwordInput.focus();
                }
            } else {
                // Authentication failed - incorrect credentials
                loginErrorMessage.textContent = 'Usuário ou senha inválidos. Por favor, tente novamente.';
                loginErrorMessage.style.display = 'block';
                passwordInput.value = ''; // Clear password field for security/usability
                passwordInput.focus();
            }
        });
    } else {
        console.error('Erro: Elementos do formulário de login não encontrados no DOM.');
    }
});
