console.log("script.js loaded - Initial check");

document.addEventListener('DOMContentLoaded', () => {
    // Check for login status
    if (sessionStorage.getItem('loggedIn') !== 'true') {
        // If not logged in, redirect to login.html
        console.log("User not logged in. Redirecting to login.html");
        window.location.href = 'login.html';
    } else {
        // If logged in, proceed with the rest of the script
        console.log("User is logged in. Initializing page content for user:", sessionStorage.getItem('currentUser'));

        const imageUploadInput = document.getElementById('image-upload');
        const imagePreview = document.getElementById('image-preview');
        const uploadForm = document.getElementById('upload-form');
        const logoutButton = document.getElementById('logout-button');

        const collectibleNameInput = document.getElementById('collectible-name');
        const collectibleSourceInput = document.getElementById('collectible-source');
        const collectibleYearInput = document.getElementById('collectible-year');
        const uploadFormMessage = document.getElementById('upload-form-message');

        const collectionGrid = document.querySelector('.collection-grid');
        const collectibleCountDisplay = document.getElementById('collectible-count-display');

        // Helper function to display messages for upload form
        function showUploadFormMessage(text, type) {
            if (uploadFormMessage) {
                uploadFormMessage.textContent = text;
                uploadFormMessage.className = 'message ' + type;
                uploadFormMessage.style.display = 'block';
            } else {
                console.warn("uploadFormMessage element not found. Message:", text, "Type:", type);
            }
        }

        function renderUserGallery() {
            const currentUsername = sessionStorage.getItem('currentUser');
            if (!currentUsername) {
                console.error("Nenhum usuário logado encontrado para renderizar a galeria.");
                // Optionally redirect to login or show an error message on the page
                if (collectibleCountDisplay) collectibleCountDisplay.textContent = "Erro: Usuário não identificado.";
                if (collectionGrid) collectionGrid.innerHTML = '<p style="color: red; text-align: center;">Não foi possível carregar a galeria. Faça login novamente.</p>';
                return;
            }

            const users = JSON.parse(localStorage.getItem('users')) || [];
            const loggedInUser = users.find(user => user.username === currentUsername);

            if (!collectionGrid || !collectibleCountDisplay) {
                console.error("Elementos da galeria ou contagem não encontrados no DOM.");
                return;
            }

            collectionGrid.innerHTML = ''; // Clear existing items

            if (loggedInUser && loggedInUser.collectibles && loggedInUser.collectibles.length > 0) {
                collectibleCountDisplay.textContent = `Você tem ${loggedInUser.collectibles.length} boneco(s) em sua coleção.`;

                loggedInUser.collectibles.forEach(collectible => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('collectible-item');
                    itemDiv.dataset.collectibleId = collectible.id;

                    const img = document.createElement('img');
                    img.src = collectible.imageUrl;
                    img.alt = collectible.name;

                    const nameH3 = document.createElement('h3');
                    nameH3.textContent = collectible.name;

                    const sourceP = document.createElement('p');
                    sourceP.textContent = `Filme/Série: ${collectible.source}`;

                    const yearP = document.createElement('p');
                    yearP.textContent = `Ano: ${collectible.year}`;

                    itemDiv.appendChild(img);
                    itemDiv.appendChild(nameH3);
                    itemDiv.appendChild(sourceP);
                    itemDiv.appendChild(yearP);
                    collectionGrid.appendChild(itemDiv);
                });
            } else {
                collectibleCountDisplay.textContent = "Você ainda não adicionou nenhum boneco à sua coleção.";
                const noItemsMsg = document.createElement('p');
                noItemsMsg.textContent = "Sua galeria está vazia. Adicione seu primeiro boneco usando o formulário abaixo!";
                noItemsMsg.style.textAlign = "center";
                noItemsMsg.style.color = "#fff"; // Make it visible on dark background
                noItemsMsg.style.padding = "20px";
                collectionGrid.appendChild(noItemsMsg);
            }
        }

        if (imageUploadInput && imagePreview) {
            imageUploadInput.addEventListener('change', function(event) {
                if (event.target.files && event.target.files[0]) { // Check if files array exists and has a file
                    const file = event.target.files[0];
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        imagePreview.src = e.target.result;
                        imagePreview.style.display = 'block';
                        if(uploadFormMessage) uploadFormMessage.style.display = 'none';
                    }
                    reader.readAsDataURL(file);
                } else {
                    imagePreview.src = '#';
                    imagePreview.style.display = 'none';
                    // imageUploadInput.value = ''; // Reset file input if no file is chosen (optional)
                }
            });
        } else {
            console.error("Image upload input or preview element not found.");
        }

        if (uploadForm) {
            uploadForm.addEventListener('submit', function(event) {
                event.preventDefault();

                const name = collectibleNameInput.value.trim();
                const source = collectibleSourceInput.value.trim();
                const year = collectibleYearInput.value.trim();
                const imageFile = imageUploadInput.files[0]; // Get the file itself

                if (!name || !source || !year) {
                    showUploadFormMessage('Todos os campos de texto devem ser preenchidos.', 'error');
                    return;
                }
                if (!imageFile) { // Check if a file is selected
                    showUploadFormMessage('Por favor, selecione uma imagem para o boneco.', 'error');
                    return;
                }

                const currentUser = sessionStorage.getItem('currentUser');
                if (!currentUser) {
                    showUploadFormMessage('Erro: Usuário não identificado. Faça login novamente.', 'error');
                    return;
                }

                let users = JSON.parse(localStorage.getItem('users')) || [];
                const userIndex = users.findIndex(user => user.username === currentUser);

                if (userIndex === -1) {
                    showUploadFormMessage('Erro: Usuário não encontrado no banco de dados.', 'error');
                    return;
                }

                const loggedInUserObject = users[userIndex];
                if (!loggedInUserObject.collectibles) {
                    loggedInUserObject.collectibles = [];
                }

                // Use FileReader to get Data URL, as preview.src might be an object URL that won't persist
                const reader = new FileReader();
                reader.onloadend = function() {
                    const imageDataUrl = reader.result;

                    const newCollectible = {
                        id: Date.now().toString(),
                        name: name,
                        source: source,
                        year: year,
                        imageUrl: imageDataUrl
                    };

                    loggedInUserObject.collectibles.push(newCollectible);
                    users[userIndex] = loggedInUserObject;
                    localStorage.setItem('users', JSON.stringify(users));

                    showUploadFormMessage('Boneco adicionado com sucesso!', 'success');
                    uploadForm.reset();
                    imagePreview.style.display = 'none';
                    imagePreview.src = '#';
                    // imageUploadInput.value = ''; // Already handled by form.reset() for type=file

                    renderUserGallery(); // Re-render the gallery
                    console.log("Current user collectibles:", loggedInUserObject.collectibles);
                };
                reader.readAsDataURL(imageFile); // Read the selected file
            });
        } else {
            console.error("Upload form not found.");
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                sessionStorage.removeItem('loggedIn');
                sessionStorage.removeItem('currentUser');
                console.log("User logged out. Redirecting to login.html");
                window.location.href = 'login.html';
            });
        } else {
            console.error("Logout button not found.");
        }

        renderUserGallery(); // Initial render when page loads
    }
});
