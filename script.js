console.log("script.js loaded - Initial check");

document.addEventListener('DOMContentLoaded', () => {
    // Check for login status
    if (sessionStorage.getItem('loggedIn') !== 'true') {
        console.log("User not logged in. Redirecting to login.html");
        window.location.href = 'login.html';
        return; // Stop script execution if not logged in
    }

    // Common elements for pages that use this script (dashboard, edit-profile)
    const currentUsername = sessionStorage.getItem('currentUser');
    console.log("User is logged in. Initializing page content for user:", currentUsername);

    const userProfileHeaderInfo = document.getElementById('user-profile-header-info');
    const headerProfileImage = document.getElementById('header-profile-image');
    const headerUsernameDisplay = document.getElementById('header-username');
    const logoutButton = document.getElementById('logout-button');

    if (currentUsername && userProfileHeaderInfo && headerProfileImage && headerUsernameDisplay) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const loggedInUser = users.find(user => user.username === currentUsername);

        if (loggedInUser) {
            headerUsernameDisplay.textContent = loggedInUser.username;
            if (loggedInUser.profileImageUrl) {
                headerProfileImage.src = loggedInUser.profileImageUrl;
            } else {
                headerProfileImage.src = 'https://via.placeholder.com/40x40.png?text=Perfil';
            }
            userProfileHeaderInfo.style.display = 'flex';
        } else {
            console.warn("Logged in user data not found in localStorage for header display.");
            if (userProfileHeaderInfo) userProfileHeaderInfo.style.display = 'none';
        }
    } else {
        console.warn("Header profile display elements not all found or no current user.");
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('loggedIn');
            sessionStorage.removeItem('currentUser');
            console.log("User logged out. Redirecting to login.html");
            window.location.href = 'login.html';
        });
    } else {
        console.warn("Logout button not found. This is expected on pages without it if script is shared.");
    }

    // --- Dashboard specific elements and functions ---
    // Guard all dashboard-specific logic
    if (document.body.contains(document.getElementById('upload-form')) && document.body.contains(document.querySelector('.collection-grid'))) {

        const imageUploadInput = document.getElementById('image-upload');
        const imagePreview = document.getElementById('image-preview');
        const uploadForm = document.getElementById('upload-form');

        const collectibleNameInput = document.getElementById('collectible-name');
        const collectibleSourceInput = document.getElementById('collectible-source');
        const collectibleYearInput = document.getElementById('collectible-year');
        const uploadFormMessage = document.getElementById('upload-form-message');

        const collectionGrid = document.querySelector('.collection-grid');
        const collectibleCountDisplay = document.getElementById('collectible-count-display');

        let editingCollectibleId = null;
        const editModeIndicator = document.getElementById('edit-mode-indicator');
        const formTitle = document.querySelector('#upload-section h2');
        const submitButton = document.querySelector('#upload-form button[type="submit"]');

        function showUploadFormMessage(text, type) {
            if (uploadFormMessage) {
                uploadFormMessage.textContent = text;
                uploadFormMessage.className = 'message ' + type;
                uploadFormMessage.style.display = 'block';
                if (type === 'success') {
                    setTimeout(() => {
                        if(uploadFormMessage) uploadFormMessage.style.display = 'none';
                    }, 3000);
                }
            } else {
                console.warn("uploadFormMessage element not found for dashboard. Message:", text, "Type:", type);
            }
        }

        function resetFormTo謚() {
            if (uploadForm) uploadForm.reset();
            if (imagePreview) {
                imagePreview.style.display = 'none';
                imagePreview.src = '#';
            }
            if(imageUploadInput) imageUploadInput.value = '';

            editingCollectibleId = null;
            if (formTitle) formTitle.textContent = "Adicionar Novo Boneco à Coleção";
            if (submitButton) submitButton.textContent = 'Adicionar Boneco';
            if (editModeIndicator) editModeIndicator.style.display = 'none';
            if (uploadFormMessage) uploadFormMessage.style.display = 'none';
        }

        function handleDeleteCollectible(collectibleId) {
            if (!confirm('Tem certeza que deseja deletar este boneco?')) return;

            let users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(user => user.username === currentUsername);

            if (userIndex !== -1 && users[userIndex].collectibles) {
                const collectibleIndex = users[userIndex].collectibles.findIndex(c => c.id === collectibleId);
                if (collectibleIndex !== -1) {
                    users[userIndex].collectibles.splice(collectibleIndex, 1);
                    localStorage.setItem('users', JSON.stringify(users));
                    renderUserGallery(); // Must be defined and callable
                    showUploadFormMessage('Boneco deletado com sucesso!', 'success');
                    if(editingCollectibleId === collectibleId) resetFormTo謚();
                } else {
                    showUploadFormMessage('Erro: Boneco não encontrado para deleção.', 'error');
                }
            } else {
                showUploadFormMessage('Erro: Usuário ou coleção não encontrados.', 'error');
            }
        }

        function handleEditCollectible(collectibleId) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.username === currentUsername);
            if (user && user.collectibles) {
                const collectibleToEdit = user.collectibles.find(c => c.id === collectibleId);
                if (collectibleToEdit && collectibleNameInput && collectibleSourceInput && collectibleYearInput && imagePreview && imageUploadInput && formTitle && submitButton && editModeIndicator && uploadFormMessage) {
                    collectibleNameInput.value = collectibleToEdit.name;
                    collectibleSourceInput.value = collectibleToEdit.source;
                    collectibleYearInput.value = collectibleToEdit.year;
                    imagePreview.src = collectibleToEdit.imageUrl;
                    imagePreview.style.display = 'block';
                    imageUploadInput.value = '';

                    editingCollectibleId = collectibleId;
                    formTitle.textContent = "Editar Boneco";
                    submitButton.textContent = 'Salvar Alterações';
                    editModeIndicator.style.display = 'block';
                    uploadFormMessage.style.display = 'none';

                    const uploadSection = document.getElementById('upload-section');
                    if (uploadSection) uploadSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }

        function renderUserGallery() {
            if (!currentUsername) {
                console.error("Nenhum usuário logado...");
                if (collectibleCountDisplay) collectibleCountDisplay.textContent = "Erro: Usuário não identificado.";
                if (collectionGrid) collectionGrid.innerHTML = '<p style="color: red; text-align: center;">Não foi possível carregar a galeria.</p>';
                return;
            }
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const loggedInUser = users.find(user => user.username === currentUsername);

            if (!collectionGrid || !collectibleCountDisplay) {
                 // These elements are specific to dashboard.html, so if not found, just return silently.
                console.log("Gallery or count display not found, skipping renderUserGallery (expected on non-dashboard pages).");
                return;
            }
            collectionGrid.innerHTML = '';

            if (loggedInUser && loggedInUser.collectibles && loggedInUser.collectibles.length > 0) {
                collectibleCountDisplay.textContent = `Você tem ${loggedInUser.collectibles.length} boneco(s) em sua coleção.`;
                loggedInUser.collectibles.forEach(collectible => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('collectible-item');
                    itemDiv.dataset.collectibleId = collectible.id;
                    // ... (rest of item creation code from previous version) ...
                    const img = document.createElement('img');
                    img.src = collectible.imageUrl;
                    img.alt = collectible.name;

                    const nameH3 = document.createElement('h3');
                    nameH3.textContent = collectible.name;

                    const sourceP = document.createElement('p');
                    sourceP.textContent = `Filme/Série: ${collectible.source}`;

                    const yearP = document.createElement('p');
                    yearP.textContent = `Ano: ${collectible.year}`;

                    const editButton = document.createElement('button');
                    editButton.textContent = 'Editar';
                    editButton.classList.add('edit-btn');
                    editButton.addEventListener('click', () => handleEditCollectible(collectible.id));

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Deletar';
                    deleteButton.classList.add('delete-btn');
                    deleteButton.addEventListener('click', () => handleDeleteCollectible(collectible.id));

                    const buttonsWrapper = document.createElement('div');
                    buttonsWrapper.classList.add('collectible-item-actions');
                    buttonsWrapper.appendChild(editButton);
                    buttonsWrapper.appendChild(deleteButton);

                    itemDiv.appendChild(img);
                    itemDiv.appendChild(nameH3);
                    itemDiv.appendChild(sourceP);
                    itemDiv.appendChild(yearP);
                    itemDiv.appendChild(buttonsWrapper);
                    collectionGrid.appendChild(itemDiv);
                });
            } else {
                collectibleCountDisplay.textContent = "Você ainda não adicionou nenhum boneco à sua coleção.";
                const noItemsMsg = document.createElement('p');
                noItemsMsg.textContent = "Sua galeria está vazia. Adicione seu primeiro boneco!";
                noItemsMsg.style.textAlign = "center";
                noItemsMsg.style.color = "#fff";
                noItemsMsg.style.padding = "20px";
                collectionGrid.appendChild(noItemsMsg);
            }
        }

        if (imageUploadInput && imagePreview) {
            imageUploadInput.addEventListener('change', function(event) {
                if (event.target.files && event.target.files[0]) {
                    const file = event.target.files[0];
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        imagePreview.src = e.target.result;
                        imagePreview.style.display = 'block';
                        if(uploadFormMessage) uploadFormMessage.style.display = 'none';
                    }
                    reader.readAsDataURL(file);
                } else {
                    if (!editingCollectibleId || !imagePreview.src || imagePreview.src === '#') {
                        imagePreview.src = '#';
                        imagePreview.style.display = 'none';
                    }
                }
            });
        } else {
             // console.warn("Image upload input or preview element not found (expected on non-dashboard pages).");
        }

        if (uploadForm && collectibleNameInput && collectibleSourceInput && collectibleYearInput && imageUploadInput && showUploadFormMessage && resetFormTo謚 && renderUserGallery) {
            uploadForm.addEventListener('submit', function(event) {
                event.preventDefault();
                // ... (rest of submit logic from previous version, it's already quite robust) ...
                const name = collectibleNameInput.value.trim();
                const source = collectibleSourceInput.value.trim();
                const year = collectibleYearInput.value.trim();
                const imageFile = imageUploadInput.files[0];

                if (!name || !source || !year) {
                    showUploadFormMessage('Todos os campos de texto devem ser preenchidos.', 'error');
                    return;
                }

                let users = JSON.parse(localStorage.getItem('users')) || [];
                const userIndex = users.findIndex(user => user.username === currentUsername);

                if (userIndex === -1) {
                    showUploadFormMessage('Erro: Usuário não logado ou não encontrado.', 'error');
                    return;
                }

                const processData = (imageDataUrlToStore) => {
                    if (editingCollectibleId) {
                        const collectibleIndex = users[userIndex].collectibles.findIndex(c => c.id === editingCollectibleId);
                        if (collectibleIndex !== -1) {
                            users[userIndex].collectibles[collectibleIndex].name = name;
                            users[userIndex].collectibles[collectibleIndex].source = source;
                            users[userIndex].collectibles[collectibleIndex].year = year;
                            if (imageDataUrlToStore) {
                                users[userIndex].collectibles[collectibleIndex].imageUrl = imageDataUrlToStore;
                            }
                            localStorage.setItem('users', JSON.stringify(users));
                            showUploadFormMessage('Boneco atualizado com sucesso!', 'success');
                        } else {
                            showUploadFormMessage('Erro ao encontrar o boneco para atualizar.', 'error');
                            return;
                        }
                    } else {
                        if (!imageDataUrlToStore) {
                            showUploadFormMessage('Por favor, selecione uma imagem para o novo boneco.', 'error');
                            return;
                        }
                        const newCollectible = {
                            id: Date.now().toString(), name: name, source: source, year: year, imageUrl: imageDataUrlToStore
                        };
                        if (!users[userIndex].collectibles) users[userIndex].collectibles = [];
                        users[userIndex].collectibles.push(newCollectible);
                        localStorage.setItem('users', JSON.stringify(users));
                        showUploadFormMessage('Boneco adicionado com sucesso!', 'success');
                    }
                    resetFormTo謚();
                    renderUserGallery();
                };

                if (imageFile) {
                    const reader = new FileReader();
                    reader.onloadend = () => { processData(reader.result); };
                    reader.readAsDataURL(imageFile);
                } else {
                    if (editingCollectibleId) {
                        const collectibleToUpdate = users[userIndex].collectibles.find(c => c.id === editingCollectibleId);
                        processData(collectibleToUpdate ? collectibleToUpdate.imageUrl : null);
                    } else {
                        showUploadFormMessage('Por favor, selecione uma imagem para o novo boneco.', 'error');
                    }
                }
            });
        } else {
            // console.warn("Upload form or its core components not found (expected on non-dashboard pages).");
        }

        // Initial render for dashboard.html
        if (typeof renderUserGallery === "function") { // Check if function is defined (i.e. on dashboard)
             renderUserGallery();
        }
    } // End of dashboard specific logic guard
});
