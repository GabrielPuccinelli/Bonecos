document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const usernameInput = document.getElementById('reg-username');
    const passwordInput = document.getElementById('reg-password');
    const confirmPasswordInput = document.getElementById('reg-confirm-password');
    const messageParagraph = document.getElementById('register-message');

    // Helper function to display messages
    function showMessage(text, type) {
        messageParagraph.textContent = text;
        messageParagraph.className = 'message ' + type; // e.g., 'message success' or 'message error'
        messageParagraph.style.display = 'block';
    }

    if (registerForm && usernameInput && passwordInput && confirmPasswordInput && messageParagraph) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();

            // --- Validations ---
            if (username === '' || password === '' || confirmPassword === '') {
                showMessage('Todos os campos são obrigatórios.', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showMessage('As senhas não coincidem.', 'error');
                confirmPasswordInput.value = ''; // Clear confirm password field
                confirmPasswordInput.focus();
                return;
            }

            if (password.length < 6) {
                showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
                return;
            }

            // --- Manage users in localStorage ---
            let users = JSON.parse(localStorage.getItem('users')) || [];

            // Check for existing username
            const userExists = users.find(user => user.username === username);
            if (userExists) {
                showMessage('Este nome de usuário já existe. Por favor, escolha outro.', 'error');
                usernameInput.focus();
                return;
            }

            // If all validations pass and username is unique
            // In a real app, password would be hashed before storing
            const newUser = { username: username, password: password };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            showMessage('Cadastro realizado com sucesso! Você pode fazer login agora.', 'success');
            registerForm.reset(); // Clear the form fields

        });
    } else {
        console.error('Erro: Elementos do formulário de cadastro não encontrados no DOM.');
        if (messageParagraph) { // Try to show error on page if possible
             showMessage('Ocorreu um erro ao carregar o formulário de cadastro. Tente recarregar a página.', 'error');
        }
    }
});
