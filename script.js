console.log("script.js loaded - Initial check");

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('loggedIn') !== 'true') {
        console.log("User not logged in. Redirecting to login.html");
        window.location.href = 'login.html';
        return;
    }

    const currentUsername = sessionStorage.getItem('currentUser');
    console.log("User is logged in. Initializing page content for user:", currentUsername);

    // --- Common Helper Functions ---
    function generateConversationId(user1, user2, collectibleId) {
        const participants = [user1, user2].sort();
        return `${participants[0]}_${participants[1]}_${collectibleId}`;
    }

    function updateUnreadMessagesBadge() {
        const sidebarUnreadBadge = document.getElementById('sidebar-unread-badge');
        if (!sidebarUnreadBadge) {
            // console.warn("Sidebar unread badge not found on this page (expected if page has no sidebar).");
            return;
        }
        if (!currentUsername) { // Should always have currentUsername if logged in
            sidebarUnreadBadge.style.display = 'none';
            return;
        }
        const conversations = JSON.parse(localStorage.getItem('chatConversations')) || [];
        let totalUnreadCount = 0;
        conversations.forEach(conv => {
            if (conv.participants.includes(currentUsername)) {
                conv.messages.forEach(msg => {
                    if (msg.receiver === currentUsername && !msg.isRead) {
                        totalUnreadCount++;
                    }
                });
            }
        });
        if (totalUnreadCount > 0) {
            sidebarUnreadBadge.textContent = totalUnreadCount > 9 ? '9+' : totalUnreadCount;
            sidebarUnreadBadge.style.display = 'inline-block';
        } else {
            sidebarUnreadBadge.style.display = 'none';
        }
    }

    // --- Header Profile Display (Common for dashboard & edit-profile) ---
    const userProfileHeaderInfo = document.getElementById('user-profile-header-info');
    const headerProfileImage = document.getElementById('header-profile-image');
    const headerUsernameDisplay = document.getElementById('header-username');

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
            if (userProfileHeaderInfo) userProfileHeaderInfo.style.display = 'none';
        }
    }

    // --- Sidebar Initialization (Common for dashboard & edit-profile if sidebar HTML is present) ---
    const userSidebar = document.getElementById('user-sidebar');
    const pageContentWrapper = document.getElementById('page-content-wrapper');

    function initUserSidebar() {
        if (!userSidebar || !pageContentWrapper || !currentUsername) {
            // console.warn("Sidebar elements or current user not available for sidebar init.");
            if(pageContentWrapper && userSidebar) pageContentWrapper.classList.remove('sidebar-active'); // Ensure no active class if sidebar cannot be shown
            if(userSidebar) userSidebar.style.display = 'none';
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const loggedInUser = users.find(user => user.username === currentUsername);

        if (loggedInUser) {
            const sidebarProfileImageElem = document.getElementById('sidebar-profile-image');
            const sidebarUsernameElem = document.getElementById('sidebar-username');
            const sidebarCollectibleCountElem = document.getElementById('sidebar-collectible-count');

            if (sidebarProfileImageElem && sidebarUsernameElem && sidebarCollectibleCountElem) {
                sidebarUsernameElem.textContent = loggedInUser.username;
                sidebarCollectibleCountElem.textContent = loggedInUser.collectibles ? loggedInUser.collectibles.length : 0;
                if (loggedInUser.profileImageUrl) {
                    sidebarProfileImageElem.src = loggedInUser.profileImageUrl;
                } else {
                    sidebarProfileImageElem.src = 'https://via.placeholder.com/80x80.png?text=Perfil';
                }
                userSidebar.style.display = 'flex';
                pageContentWrapper.classList.add('sidebar-active');
                updateUnreadMessagesBadge(); // Update badge when sidebar is shown
            } else {
                 console.warn("Sidebar internal elements not found.");
                 userSidebar.style.display = 'none';
                 pageContentWrapper.classList.remove('sidebar-active');
            }
        } else {
            userSidebar.style.display = 'none';
            pageContentWrapper.classList.remove('sidebar-active');
        }
    }
    initUserSidebar(); // Call to initialize sidebar on page load

    // --- Logout Button (Common for dashboard & edit-profile) ---
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('loggedIn');
            sessionStorage.removeItem('currentUser');
            if (userSidebar) userSidebar.style.display = 'none'; // Hide sidebar on logout
            if (pageContentWrapper) pageContentWrapper.classList.remove('sidebar-active'); // Reset content margin
            console.log("User logged out. Redirecting to login.html");
            window.location.href = 'login.html'; // login.html will then route to public-gallery
        });
    } else {
        console.warn("Logout button not found.");
    }


    // --- Chat Modal Elements & Logic (Common for dashboard & edit-profile, if chat buttons exist on page) ---
    let currentChatContext = null;
    const chatModalOverlay = document.getElementById('chat-modal-overlay');
    const closeChatModalBtn = document.getElementById('close-chat-modal-btn');
    const chatModalTitle = document.getElementById('chat-modal-title');
    const chatModalItemImage = document.getElementById('chat-modal-item-image');
    const chatModalItemName = document.getElementById('chat-modal-item-name');
    const chatModalMessagesContainer = document.getElementById('chat-modal-messages');
    const chatModalForm = document.getElementById('chat-modal-form');
    const chatModalInput = document.getElementById('chat-modal-input');

    function openChatModal(collectibleId, owner, name, imageUrl) {
        // ... (Chat modal logic as defined in public-gallery.script.js - can be refactored to a shared utility)
        // For brevity, assuming this function is available or would be copied/adapted here.
        // This function would use `currentChatContext`, `generateConversationId`, `loadAndRenderMessages`.
        // It needs access to currentUsername.
        if (!currentUsername) {
            alert("Você precisa estar logado para iniciar uma conversa.");
            window.location.href = 'login.html';
            return;
        }
        if (!chatModalOverlay || !chatModalTitle || !chatModalItemName || !chatModalItemImage || !chatModalMessagesContainer) {
            console.error("Elementos do modal de chat não encontrados."); return;
        }
        currentChatContext = {
            collectibleId, ownerUsername: owner, collectibleName: name, collectibleImageUrl: imageUrl,
            participants: [currentUsername, owner].sort(),
            conversationId: generateConversationId(currentUsername, owner, collectibleId)
        };
        chatModalTitle.textContent = `Chat sobre: ${name}`;
        chatModalItemName.textContent = name;
        chatModalItemImage.src = imageUrl || 'https://via.placeholder.com/50x50.png?text=Item';
        loadAndRenderMessages(currentChatContext.conversationId);
        chatModalOverlay.style.display = 'flex';
        setTimeout(() => chatModalOverlay.classList.add('active'), 10);
    }

    function closeChatModal() {
        if (!chatModalOverlay) return;
        chatModalOverlay.classList.remove('active');
        setTimeout(() => {
            chatModalOverlay.style.display = 'none';
            if(chatModalMessagesContainer) chatModalMessagesContainer.innerHTML = '';
            currentChatContext = null;
        }, 300);
    }
    if(closeChatModalBtn) closeChatModalBtn.addEventListener('click', closeChatModal);
    if(chatModalOverlay) {
        chatModalOverlay.addEventListener('click', (event) => {
            if (event.target === chatModalOverlay) closeChatModal();
        });
    }

    function loadAndRenderMessages(conversationId) {
        // ... (Message loading/rendering logic as defined in public-gallery.script.js)
        // This needs access to chatModalMessagesContainer, currentUsername.
        if(!chatModalMessagesContainer) return;
        chatModalMessagesContainer.innerHTML = '';
        const conversations = JSON.parse(localStorage.getItem('chatConversations')) || [];
        const conversation = conversations.find(c => c.conversationId === conversationId);
        if (conversation && conversation.messages) {
            let messagesMarkedAsRead = false;
            conversation.messages.forEach(msg => {
                // Mark as read logic for messages page, not modal directly unless intended
                // if (msg.receiver === currentUsername && !msg.isRead) { msg.isRead = true; messagesMarkedAsRead = true; }
                const msgDiv = document.createElement('div');
                msgDiv.classList.add('chat-message', msg.sender === currentUsername ? 'sent' : 'received');
                msgDiv.innerHTML = `<span class="msg-sender-name">${msg.sender === currentUsername ? "Você" : msg.sender}</span><p>${msg.text}</p><span class="msg-timestamp">${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;
                chatModalMessagesContainer.appendChild(msgDiv);
            });
            // if (messagesMarkedAsRead) { localStorage.setItem('chatConversations', JSON.stringify(conversations)); updateUnreadMessagesBadge(); }
        }
        chatModalMessagesContainer.scrollTop = chatModalMessagesContainer.scrollHeight;
    }

    if(chatModalForm && chatModalInput) {
        chatModalForm.addEventListener('submit', (event) => {
            // ... (Chat form submission logic as defined in public-gallery.script.js)
            // This needs access to currentChatContext, currentUsername, generateConversationId,
            // loadAndRenderMessages, chatModalInput, updateUnreadMessagesBadge.
            event.preventDefault();
            const messageText = chatModalInput.value.trim();
            if (!messageText || !currentChatContext) return;
            const receiver = currentChatContext.participants.find(p => p !== currentUsername);
            if(!receiver) { console.error("Receiver not found for chat message."); return; }

            const newMessage = {
                sender: currentUsername, receiver, text: messageText,
                timestamp: Date.now(), isRead: false
            };
            let conversations = JSON.parse(localStorage.getItem('chatConversations')) || [];
            let convIndex = conversations.findIndex(c => c.conversationId === currentChatContext.conversationId);
            if (convIndex !== -1) {
                conversations[convIndex].messages.push(newMessage);
                conversations[convIndex].lastActivity = Date.now();
            } else {
                conversations.push({
                    conversationId: currentChatContext.conversationId,
                    collectibleId: currentChatContext.collectibleId,
                    collectibleName: currentChatContext.collectibleName,
                    collectibleImageUrl: currentChatContext.collectibleImageUrl,
                    participants: currentChatContext.participants,
                    ownerUsername: currentChatContext.ownerUsername,
                    messages: [newMessage],
                    lastActivity: Date.now()
                });
            }
            localStorage.setItem('chatConversations', JSON.stringify(conversations));
            loadAndRenderMessages(currentChatContext.conversationId);
            chatModalInput.value = '';
            updateUnreadMessagesBadge();
        });
    }

    // Event Delegation for Chat Buttons (specific to dashboard context)
    // Note: Dashboard has "Ver Conversas" which links to messages.html, not opens modal directly for initiating.
    // The modal opening would be for starting new chats if that feature was on dashboard items from other users (not currently the case).
    // So, this delegation might primarily be for `profile.html` or `search.html` if this script were more generic.
    // For `dashboard.html`, the "Ver Conversas" buttons created in `renderUserGallery` use `window.location.href`.
    // The `view-item-chats-btn` class is used there.

    // --- Dashboard Specific Form & Gallery Logic ---
    if (document.body.contains(document.getElementById('upload-form')) && document.body.contains(document.querySelector('.collection-grid'))) {
        const imageUploadInput = document.getElementById('image-upload');
        const imagePreview = document.getElementById('image-preview');
        const uploadForm = document.getElementById('upload-form');
        const collectibleNameInput = document.getElementById('collectible-name');
        const collectibleSourceInput = document.getElementById('collectible-source');
        const collectibleYearInput = document.getElementById('collectible-year');
        const collectibleConditionSelect = document.getElementById('collectible-condition');
        const collectibleForTradeCheckbox = document.getElementById('collectible-for-trade');
        const uploadFormMessage = document.getElementById('upload-form-message');
        const collectionGrid = document.querySelector('.collection-grid');
        const collectibleCountDisplay = document.getElementById('collectible-count-display');
        let editingCollectibleId = null;
        const editModeIndicator = document.getElementById('edit-mode-indicator');
        const formTitle = document.querySelector('#upload-section h2');
        const submitButton = document.querySelector('#upload-form button[type="submit"]');

        // ... (showUploadFormMessage, resetFormTo謚, handleDeleteCollectible, handleEditCollectible, renderUserGallery as before) ...
        // Ensure renderUserGallery's "Ver Conversas" button has the correct class and dataset attributes.
        // The `view-item-chats-btn` created in `renderUserGallery` for dashboard.html should link to messages.html
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
            }
        }

        function resetFormTo謚() {
            if (uploadForm) uploadForm.reset();
            if (imagePreview) {
                imagePreview.style.display = 'none';
                imagePreview.src = '#';
            }
            if(imageUploadInput) imageUploadInput.value = '';
            if (collectibleForTradeCheckbox) collectibleForTradeCheckbox.checked = false;
            if (collectibleConditionSelect) collectibleConditionSelect.value = 'novo';
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
                    renderUserGallery();
                    showUploadFormMessage('Boneco deletado com sucesso!', 'success');
                    if(editingCollectibleId === collectibleId) resetFormTo謚();
                } else { showUploadFormMessage('Erro: Boneco não encontrado para deleção.', 'error'); }
            } else { showUploadFormMessage('Erro: Usuário ou coleção não encontrados.', 'error'); }
        }

        function handleEditCollectible(collectibleId) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.username === currentUsername);
            if (user && user.collectibles) {
                const collectibleToEdit = user.collectibles.find(c => c.id === collectibleId);
                if (collectibleToEdit && collectibleNameInput && collectibleSourceInput && collectibleYearInput && imagePreview && imageUploadInput && collectibleConditionSelect && collectibleForTradeCheckbox && formTitle && submitButton && editModeIndicator && uploadFormMessage) {
                    collectibleNameInput.value = collectibleToEdit.name;
                    collectibleSourceInput.value = collectibleToEdit.source;
                    collectibleYearInput.value = collectibleToEdit.year;
                    collectibleConditionSelect.value = collectibleToEdit.condition || 'novo';
                    collectibleForTradeCheckbox.checked = collectibleToEdit.isForTrade || false;
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
                } else { console.error("One or more form elements for editing not found."); }
            }
        }

        function renderUserGallery() {
            if (!currentUsername) { /* ... */ return; }
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const loggedInUser = users.find(user => user.username === currentUsername);
            if (!collectionGrid || !collectibleCountDisplay) { /* ... */ return; }
            collectionGrid.innerHTML = '';
            if (loggedInUser && loggedInUser.collectibles && loggedInUser.collectibles.length > 0) {
                collectibleCountDisplay.textContent = `Você tem ${loggedInUser.collectibles.length} boneco(s) em sua coleção.`;
                loggedInUser.collectibles.forEach(collectible => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('collectible-item');
                    itemDiv.dataset.collectibleId = collectible.id;
                    itemDiv.innerHTML = `
                        <img src="${collectible.imageUrl}" alt="${collectible.name}">
                        <h3>${collectible.name}</h3>
                        <p>Filme/Série: ${collectible.source}</p>
                        <p>Ano: ${collectible.year}</p>
                        <p class="collectible-detail-condition">Condição: ${collectible.condition === 'novo' ? 'Novo' : 'Usado'}</p>
                        ${collectible.isForTrade ? `<div class="for-trade-indicator">Negociável</div>` : ''}
                        <div class="collectible-item-actions">
                            <button class="edit-btn" data-collectible-id="${collectible.id}">Editar</button>
                            <button class="delete-btn" data-collectible-id="${collectible.id}">Deletar</button>
                            ${collectible.isForTrade ? `<button class="view-item-chats-btn sidebar-button-style" data-collectible-id="${collectible.id}" data-collectible-name="${collectible.name}">Ver Conversas</button>` : ''}
                        </div>
                    `;
                    // Re-attach event listeners for dynamically created buttons
                    itemDiv.querySelector('.edit-btn')?.addEventListener('click', () => handleEditCollectible(collectible.id));
                    itemDiv.querySelector('.delete-btn')?.addEventListener('click', () => handleDeleteCollectible(collectible.id));
                    itemDiv.querySelector('.view-item-chats-btn')?.addEventListener('click', (e) => {
                         e.preventDefault(); // Prevent any default if it were a link
                         window.location.href = `messages.html?itemId=${e.target.dataset.collectibleId}&itemName=${encodeURIComponent(e.target.dataset.collectibleName)}`;
                    });
                    collectionGrid.appendChild(itemDiv);
                });
            } else { /* ... no items message ... */
                collectibleCountDisplay.textContent = "Você ainda não adicionou nenhum boneco à sua coleção.";
                collectionGrid.innerHTML = '<p style="text-align: center; color: #fff; padding: 20px;">Sua galeria está vazia. Adicione seu primeiro boneco!</p>';
            }
        }

        if (imageUploadInput && imagePreview) { /* ... image preview logic ... */
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
        }

        if (uploadForm && collectibleNameInput && collectibleSourceInput && collectibleYearInput && imageUploadInput && collectibleConditionSelect && collectibleForTradeCheckbox && showUploadFormMessage && resetFormTo謚 && renderUserGallery) {
            uploadForm.addEventListener('submit', function(event) { /* ... form submit logic ... */
                event.preventDefault();
                const name = collectibleNameInput.value.trim();
                const source = collectibleSourceInput.value.trim();
                const year = collectibleYearInput.value.trim();
                const imageFile = imageUploadInput.files[0];
                const condition = collectibleConditionSelect.value;
                const isForTrade = collectibleForTradeCheckbox.checked;

                if (!name || !source || !year) {
                    showUploadFormMessage('Todos os campos de texto devem ser preenchidos.', 'error'); return;
                }
                let users = JSON.parse(localStorage.getItem('users')) || [];
                const userIndex = users.findIndex(user => user.username === currentUsername);
                if (userIndex === -1) {
                    showUploadFormMessage('Erro: Usuário não logado ou não encontrado.', 'error'); return;
                }
                const processData = (imageDataUrlToStore) => {
                    if (editingCollectibleId) {
                        const collectibleIndex = users[userIndex].collectibles.findIndex(c => c.id === editingCollectibleId);
                        if (collectibleIndex !== -1) {
                            users[userIndex].collectibles[collectibleIndex].name = name;
                            users[userIndex].collectibles[collectibleIndex].source = source;
                            users[userIndex].collectibles[collectibleIndex].year = year;
                            users[userIndex].collectibles[collectibleIndex].condition = condition;
                            users[userIndex].collectibles[collectibleIndex].isForTrade = isForTrade;
                            if (imageDataUrlToStore) {
                                users[userIndex].collectibles[collectibleIndex].imageUrl = imageDataUrlToStore;
                            }
                            localStorage.setItem('users', JSON.stringify(users));
                            showUploadFormMessage('Boneco atualizado com sucesso!', 'success');
                        } else { showUploadFormMessage('Erro ao encontrar o boneco para atualizar.', 'error'); return; }
                    } else {
                        if (!imageDataUrlToStore) { showUploadFormMessage('Por favor, selecione uma imagem para o novo boneco.', 'error'); return; }
                        const newCollectible = {
                            id: Date.now().toString(), name, source, year, imageUrl: imageDataUrlToStore, condition, isForTrade
                        };
                        if (!users[userIndex].collectibles) users[userIndex].collectibles = [];
                        users[userIndex].collectibles.push(newCollectible);
                        localStorage.setItem('users', JSON.stringify(users));
                        showUploadFormMessage('Boneco adicionado com sucesso!', 'success');
                    }
                    resetFormTo謚();
                    renderUserGallery();
                    initUserSidebar(); // Update sidebar count
                };
                if (imageFile) {
                    const reader = new FileReader();
                    reader.onloadend = () => { processData(reader.result); };
                    reader.readAsDataURL(imageFile);
                } else {
                    if (editingCollectibleId) {
                        const collectibleToUpdate = users[userIndex].collectibles.find(c => c.id === editingCollectibleId);
                        processData(collectibleToUpdate ? collectibleToUpdate.imageUrl : null);
                    } else { showUploadFormMessage('Por favor, selecione uma imagem para o novo boneco.', 'error'); }
                }
            });
        }
        if (typeof renderUserGallery === "function") renderUserGallery();
    } // End of dashboard specific logic guard

    // Chat button event delegation (moved to be global if modal is global)
    // This was in public-gallery.script.js, should be here if script.js is used on pages with these buttons.
    // However, dashboard.html's "Ver Conversas" buttons in renderUserGallery are handled differently now.
    // This part is for pages that *don't* use renderUserGallery but might have .start-chat-btn
    document.body.addEventListener('click', function(event) {
        const targetButton = event.target.closest('.start-chat-btn'); // Only for starting new chats
        if (targetButton && typeof openChatModal === "function") { // Check if openChatModal is defined
            const { collectibleId, ownerUsername, collectibleName, collectibleImageUrl } = targetButton.dataset;
            openChatModal(collectibleId, ownerUsername, collectibleName, collectibleImageUrl);
        }
    });
});
