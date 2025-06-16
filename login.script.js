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

            // First, check for empty fields
            if (!username || !password) {
                loginErrorMessage.textContent = 'Por favor, preencha ambos os campos de usuário e senha.';
                loginErrorMessage.style.display = 'block';
                if (!username && usernameInput) {
                    usernameInput.focus();
                } else if (passwordInput) { // if username is filled but password is not
                    passwordInput.focus();
                }
                return; // Stop further processing
            }

            // Retrieve users from localStorage
            const users = JSON.parse(localStorage.getItem('users')) || [];

            // Find the user in the array
            // IMPORTANT: In a real application, passwords should be hashed.
            // This comparison is for demonstration purposes only with plain text passwords.
            const foundUser = users.find(user => user.username === username && user.password === password);

            if (foundUser) {
                // Authentication successful
                loginErrorMessage.style.display = 'none';
                loginErrorMessage.textContent = ''; // Clear any previous error message

                sessionStorage.setItem('loggedIn', 'true');
                sessionStorage.setItem('currentUser', foundUser.username); // Store current user's name

                console.log('Login successful for user:', foundUser.username);
                window.location.href = 'index.html';
            } else {
                // Authentication failed - incorrect credentials or user not found
                loginErrorMessage.textContent = 'Usuário ou senha inválidos. Tente novamente.';
                loginErrorMessage.style.display = 'block';
                if (passwordInput) passwordInput.value = ""; // Clear password field for security/usability
                if (usernameInput) usernameInput.focus(); // Set focus back to username field
                console.log('Login failed for user:', username);
            }
        });
    } else {
        console.error('Erro: Elementos do formulário de login não encontrados no DOM.');
    }
});
