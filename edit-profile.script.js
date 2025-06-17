document.addEventListener('DOMContentLoaded', () => {
    // Page Protection & User Data
    const currentUsernameFromSession = sessionStorage.getItem('currentUser'); // Renamed for clarity
    if (!currentUsernameFromSession || sessionStorage.getItem('loggedIn') !== 'true') {
        console.log("Edit Profile: User not logged in or session expired. Redirecting to login.");
        window.location.href = 'login.html';
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(user => user.username === currentUsernameFromSession);

    if (userIndex === -1) {
        alert('Erro: Usuário não encontrado no localStorage. Por favor, faça login novamente.');
        sessionStorage.removeItem('loggedIn'); // Clear potentially inconsistent session
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
        return;
    }
    const currentUserData = users[userIndex];

    // DOM Elements - Password Form
    const changePasswordForm = document.getElementById('change-password-form');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmNewPasswordInput = document.getElementById('confirm-new-password');
    const passwordFeedback = document.getElementById('password-feedback');

    // DOM Elements - Profile Image Form
    const changeProfileImageForm = document.getElementById('change-profile-image-form');
    const editProfileImageInput = document.getElementById('edit-profile-image');
    const currentProfileImagePreview = document.getElementById('current-profile-image-preview');
    const newProfileImagePreview = document.getElementById('new-profile-image-preview');
    const imageFeedback = document.getElementById('image-feedback');

    // DOM Elements - Header (to update profile pic in real-time if script.js didn't catch it or for immediate feedback)
    const headerProfileImage = document.getElementById('header-profile-image'); // From main header

    // Helper to display feedback messages
    function showFeedback(element, message, type = 'error') {
        if (!element) {
            console.warn("Feedback element not found for message:", message);
            return;
        }
        element.textContent = message;
        // Assign class based on type, assuming CSS handles the styling for .success and .error
        element.className = 'feedback-message ' + type;
        element.style.display = 'block';
        setTimeout(() => {
            if (element) element.style.display = 'none';
        }, 5000);
    }

    // Load current profile image into previews
    if (currentUserData.profileImageUrl) {
        if(currentProfileImagePreview) currentProfileImagePreview.src = currentUserData.profileImageUrl;
    } else {
        if(currentProfileImagePreview) currentProfileImagePreview.src = 'https://via.placeholder.com/150x150.png?text=Atual';
    }

    // Password Change Form Logic
    if (changePasswordForm && currentPasswordInput && newPasswordInput && confirmNewPasswordInput && passwordFeedback) {
        changePasswordForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const currentPassword = currentPasswordInput.value; // No trim for passwords
            const newPassword = newPasswordInput.value;
            const confirmNewPassword = confirmNewPasswordInput.value;

            if (!currentPassword || !newPassword || !confirmNewPassword) {
                showFeedback(passwordFeedback, 'Todos os campos de senha são obrigatórios.');
                return;
            }
            if (newPassword !== confirmNewPassword) {
                showFeedback(passwordFeedback, 'A nova senha e a confirmação não coincidem.');
                return;
            }
            if (newPassword.length < 6) {
                showFeedback(passwordFeedback, 'A nova senha deve ter pelo menos 6 caracteres.');
                return;
            }
            // IMPORTANT: This is plain text comparison. In a real app, currentPassword would be sent to a server
            // to be compared with a hashed password, and newPassword would be hashed by the server before saving.
            if (currentUserData.password !== currentPassword) {
                showFeedback(passwordFeedback, 'A senha atual está incorreta.');
                return;
            }
            if (newPassword === currentPassword) {
                showFeedback(passwordFeedback, 'A nova senha não pode ser igual à senha atual.', 'error');
                return;
            }

            // Update password
            users[userIndex].password = newPassword; // Store new password (still plain text here)
            localStorage.setItem('users', JSON.stringify(users));
            showFeedback(passwordFeedback, 'Senha alterada com sucesso!', 'success');
            changePasswordForm.reset();
        });
    } else {
        console.warn("Formulário de alteração de senha ou seus campos não foram completamente encontrados.");
    }

    // Profile Image Change Logic - Preview
    if (editProfileImageInput && newProfileImagePreview) {
        editProfileImageInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    newProfileImagePreview.src = e.target.result;
                    newProfileImagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                newProfileImagePreview.src = '#';
                newProfileImagePreview.style.display = 'none';
            }
        });
    } else {
        console.warn("Campos de preview de imagem de perfil não encontrados.");
    }

    // Profile Image Change Form Logic - Submission
    if (changeProfileImageForm && editProfileImageInput && imageFeedback && currentProfileImagePreview) {
        changeProfileImageForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const file = editProfileImageInput.files[0];

            if (!file) {
                showFeedback(imageFeedback, 'Por favor, selecione uma nova imagem de perfil para alterar.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const newImageDataUrl = reader.result;
                users[userIndex].profileImageUrl = newImageDataUrl;
                localStorage.setItem('users', JSON.stringify(users));

                // Update current preview on page
                currentProfileImagePreview.src = newImageDataUrl;
                // Update header image if element exists (it should be handled by script.js on next load, but this gives immediate feedback)
                if (headerProfileImage) {
                    headerProfileImage.src = newImageDataUrl;
                }

                showFeedback(imageFeedback, 'Imagem de perfil alterada com sucesso!', 'success');
                editProfileImageInput.value = ''; // Clear file input
                if (newProfileImagePreview) {
                    newProfileImagePreview.style.display = 'none';
                    newProfileImagePreview.src = '#';
                }
            };
            reader.readAsDataURL(file);
        });
    } else {
        console.warn("Formulário de alteração de imagem de perfil ou seus campos não foram completamente encontrados.");
    }
});
