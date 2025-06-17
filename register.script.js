document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const usernameInput = document.getElementById('reg-username');
    const passwordInput = document.getElementById('reg-password');
    const confirmPasswordInput = document.getElementById('reg-confirm-password');
    const messageParagraph = document.getElementById('register-message');

    const regProfileImageInput = document.getElementById('reg-profile-image');
    const regProfileImagePreview = document.getElementById('reg-profile-image-preview');

    // Helper function to display messages
    function showMessage(text, type) {
        messageParagraph.textContent = text;
        messageParagraph.className = 'message ' + type;
        messageParagraph.style.display = 'block';
         // Auto-hide success messages after a few seconds
        if (type === 'success') {
            setTimeout(() => {
                messageParagraph.style.display = 'none';
            }, 3000);
        }
    }

    if (regProfileImageInput && regProfileImagePreview) {
        regProfileImageInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    regProfileImagePreview.src = e.target.result;
                    regProfileImagePreview.style.display = 'block';
                }
                reader.readAsDataURL(file);
            } else {
                regProfileImagePreview.src = '#';
                regProfileImagePreview.style.display = 'none';
            }
        });
    } else {
        console.warn("Elementos de upload de imagem de perfil não encontrados.");
    }

    if (registerForm && usernameInput && passwordInput && confirmPasswordInput && messageParagraph) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();
            const profileImageFile = regProfileImageInput ? regProfileImageInput.files[0] : null;

            // --- Validations ---
            if (username === '' || password === '' || confirmPassword === '') {
                showMessage('Todos os campos são obrigatórios (exceto imagem de perfil).', 'error');
                return;
            }
            if (password !== confirmPassword) {
                showMessage('As senhas não coincidem.', 'error');
                confirmPasswordInput.value = '';
                confirmPasswordInput.focus();
                return;
            }
            if (password.length < 6) {
                showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
                return;
            }

            let users = JSON.parse(localStorage.getItem('users')) || [];
            const userExists = users.find(user => user.username === username);
            if (userExists) {
                showMessage('Este nome de usuário já existe. Por favor, escolha outro.', 'error');
                usernameInput.focus();
                return;
            }

            // --- Process registration (potentially async due to image) ---
            const processRegistration = (profileImageDataUrl) => {
                const newUser = {
                    username: username,
                    password: password, // In real apps, HASH this.
                    collectibles: [],
                    profileImageUrl: profileImageDataUrl // Store the data URL or null
                };

                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));
                showMessage('Cadastro realizado com sucesso! Você pode fazer login agora.', 'success');
                registerForm.reset();
                if (regProfileImagePreview) {
                    regProfileImagePreview.style.display = 'none';
                    regProfileImagePreview.src = '#';
                }
                if (regProfileImageInput) { // Ensure file input value is cleared across browsers
                     regProfileImageInput.value = '';
                }
            };

            if (profileImageFile) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    processRegistration(reader.result);
                };
                reader.readAsDataURL(profileImageFile);
            } else {
                processRegistration(null); // No profile image selected
            }
        });
    } else {
        console.error('Erro: Elementos do formulário de cadastro não encontrados no DOM.');
        if (messageParagraph) {
             showMessage('Ocorreu um erro ao carregar o formulário de cadastro.', 'error');
        }
    }
});
