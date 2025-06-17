document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const usernameFromUrl = urlParams.get('user'); // User whose profile is being viewed

    // Sidebar elements
    const userSidebar = document.getElementById('user-sidebar');
    const sidebarProfileImage = document.getElementById('sidebar-profile-image');
    const sidebarUsername = document.getElementById('sidebar-username');
    const sidebarCollectibleCount = document.getElementById('sidebar-collectible-count');
    const pageContentWrapper = document.getElementById('page-content-wrapper');

    // Profile page specific elements
    const profileUsernameDisplay = document.getElementById('profile-username-display');
    const profileUsernameCollectiblesTitle = document.getElementById('profile-username-collectibles-title');
    const profileCollectionGrid = document.getElementById('profile-collection-grid');
    const profileCollectibleCountDisplay = document.getElementById('profile-collectible-count-display');
    const noResultsMessage = profileCollectionGrid ? profileCollectionGrid.querySelector('.no-results-message') : null;

    // --- Chat Modal Globals ---
    let currentChatContext = null;
    const chatModalOverlay = document.getElementById('chat-modal-overlay');
    const closeChatModalBtn = document.getElementById('close-chat-modal-btn');
    const chatModalTitle = document.getElementById('chat-modal-title');
    const chatModalItemImage = document.getElementById('chat-modal-item-image');
    const chatModalItemName = document.getElementById('chat-modal-item-name');
    const chatModalMessagesContainer = document.getElementById('chat-modal-messages');
    const chatModalForm = document.getElementById('chat-modal-form');
    const chatModalInput = document.getElementById('chat-modal-input');
    // --- End Chat Modal Globals ---

    if (!profileUsernameDisplay || !profileUsernameCollectiblesTitle || !profileCollectionGrid || !profileCollectibleCountDisplay || !noResultsMessage) {
        console.error("Um ou mais elementos essenciais da página de perfil não foram encontrados no DOM.");
        if(document.querySelector('main')) {
            document.querySelector('main').innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar a estrutura da página de perfil.</p>';
        }
        return;
    }

    if (!usernameFromUrl) {
        // ... (error handling for missing usernameFromUrl as before) ...
        const mainContent = document.querySelector('main');
        if (mainContent) mainContent.innerHTML = '<p style="color:red; text-align:center;">Erro: Nome de usuário não especificado na URL.</p>';
        if(profileUsernameDisplay) profileUsernameDisplay.textContent = "Erro";
        if(profileUsernameCollectiblesTitle) profileUsernameCollectiblesTitle.textContent = "N/A";
        if(profileCollectibleCountDisplay) profileCollectibleCountDisplay.style.display = 'none';
        return;
    }

    profileUsernameDisplay.textContent = `Perfil de ${usernameFromUrl}`;
    profileUsernameCollectiblesTitle.textContent = usernameFromUrl;

    // --- Helper Functions (Chat & Badge) ---
    function generateConversationId(user1, user2, collectibleId) {
        const participants = [user1, user2].sort();
        return `${participants[0]}_${participants[1]}_${collectibleId}`;
    }

    function updateUnreadMessagesBadge() {
        const sidebarUnreadBadge = document.getElementById('sidebar-unread-badge');
        if (!sidebarUnreadBadge) return;
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) { sidebarUnreadBadge.style.display = 'none'; return; }
        const conversations = JSON.parse(localStorage.getItem('chatConversations')) || [];
        let totalUnreadCount = 0;
        conversations.forEach(conv => {
            if (conv.participants.includes(currentUser)) {
                conv.messages.forEach(msg => {
                    if (msg.receiver === currentUser && !msg.isRead) totalUnreadCount++;
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

    // --- Sidebar Initialization ---
    function initUserSidebar() {
        const isLoggedIn = sessionStorage.getItem('loggedIn') === 'true';
        if (!userSidebar || !pageContentWrapper || !sidebarProfileImage || !sidebarUsername || !sidebarCollectibleCount) {
            console.warn("Elementos do sidebar ou pageContentWrapper não encontrados na página de perfil.");
            return;
        }
        if (isLoggedIn) {
            const currentLoggedInUser = sessionStorage.getItem('currentUser'); // This is the viewer
            const users = JSON.parse(localStorage.getItem('users')) || [];
            // The sidebar should always show the LOGGED IN user's info, not the profile being viewed.
            const sidebarUser = users.find(user => user.username === currentLoggedInUser);
            if (sidebarUser) {
                userSidebar.style.display = 'flex';
                pageContentWrapper.classList.add('sidebar-active');
                sidebarUsername.textContent = sidebarUser.username;
                sidebarCollectibleCount.textContent = sidebarUser.collectibles ? sidebarUser.collectibles.length : 0;
                sidebarProfileImage.src = sidebarUser.profileImageUrl || 'https://via.placeholder.com/80x80.png?text=Perfil';
                updateUnreadMessagesBadge();
            } else {
                userSidebar.style.display = 'none';
                pageContentWrapper.classList.remove('sidebar-active');
            }
        } else {
            userSidebar.style.display = 'none';
            pageContentWrapper.classList.remove('sidebar-active');
        }
    }

    // --- Chat Modal Functions ---
    function openChatModal(collectibleId, owner, name, imageUrl) {
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) {
            alert("Você precisa estar logado para iniciar uma conversa.");
            window.location.href = 'login.html'; return;
        }
        if (!chatModalOverlay || !chatModalTitle || !chatModalItemName || !chatModalItemImage || !chatModalMessagesContainer) {
            console.error("Elementos do modal de chat não encontrados."); return;
        }
        currentChatContext = {
            collectibleId, ownerUsername: owner, collectibleName: name, collectibleImageUrl: imageUrl,
            participants: [currentUser, owner].sort(),
            conversationId: generateConversationId(currentUser, owner, collectibleId)
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
        if(!chatModalMessagesContainer) return;
        chatModalMessagesContainer.innerHTML = '';
        const conversations = JSON.parse(localStorage.getItem('chatConversations')) || [];
        const conversation = conversations.find(c => c.conversationId === conversationId);
        const currentUser = sessionStorage.getItem('currentUser');
        if (conversation && conversation.messages) {
            conversation.messages.forEach(msg => {
                const msgDiv = document.createElement('div');
                msgDiv.classList.add('chat-message', msg.sender === currentUser ? 'sent' : 'received');
                msgDiv.innerHTML = `<span class="msg-sender-name">${msg.sender === currentUser ? "Você" : msg.sender}</span><p>${msg.text}</p><span class="msg-timestamp">${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;
                chatModalMessagesContainer.appendChild(msgDiv);
            });
        }
        chatModalMessagesContainer.scrollTop = chatModalMessagesContainer.scrollHeight;
    }

    if(chatModalForm && chatModalInput) {
        chatModalForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const messageText = chatModalInput.value.trim();
            if (!messageText || !currentChatContext) return;
            const currentUser = sessionStorage.getItem('currentUser');
            const receiver = currentChatContext.participants.find(p => p !== currentUser);
            if(!receiver) { console.error("Receiver not found."); return; }
            const newMessage = { sender: currentUser, receiver, text: messageText, timestamp: Date.now(), isRead: false };
            let conversations = JSON.parse(localStorage.getItem('chatConversations')) || [];
            let convIndex = conversations.findIndex(c => c.conversationId === currentChatContext.conversationId);
            if (convIndex !== -1) {
                conversations[convIndex].messages.push(newMessage);
                conversations[convIndex].lastActivity = Date.now();
            } else {
                conversations.push({
                    conversationId: currentChatContext.conversationId, collectibleId: currentChatContext.collectibleId,
                    collectibleName: currentChatContext.collectibleName, collectibleImageUrl: currentChatContext.collectibleImageUrl,
                    participants: currentChatContext.participants, ownerUsername: currentChatContext.ownerUsername,
                    messages: [newMessage], lastActivity: Date.now()
                });
            }
            localStorage.setItem('chatConversations', JSON.stringify(conversations));
            loadAndRenderMessages(currentChatContext.conversationId);
            chatModalInput.value = '';
            updateUnreadMessagesBadge();
        });
    }

    // Event Delegation for Chat Buttons on Profile Page
    document.body.addEventListener('click', function(event) {
        const targetButton = event.target.closest('.start-chat-btn, .view-item-chats-btn');
        if (targetButton) {
            const { collectibleId, ownerUsername, collectibleName, collectibleImageUrl } = targetButton.dataset;
            if (targetButton.classList.contains('start-chat-btn')) {
                 openChatModal(collectibleId, ownerUsername, collectibleName, collectibleImageUrl);
            } else if (targetButton.classList.contains('view-item-chats-btn')) {
                window.location.href = `messages.html?itemId=${collectibleId}&itemName=${encodeURIComponent(collectibleName)}`;
            }
        }
    });

    // --- Render Profile Gallery ---
    function renderProfileGallery(usernameOfProfileOwner) { // Renamed param for clarity
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const profileUser = users.find(user => user.username === usernameOfProfileOwner);

        if(!profileCollectionGrid.contains(noResultsMessage)) profileCollectionGrid.appendChild(noResultsMessage);
        Array.from(profileCollectionGrid.querySelectorAll('.collectible-item')).forEach(item => item.remove());
        noResultsMessage.style.display = 'none';

        if (profileUser) {
            profileUsernameDisplay.textContent = `Perfil de ${profileUser.username}`; // Update with actual username from data
            profileUsernameCollectiblesTitle.textContent = profileUser.username;

            if (profileUser.collectibles && profileUser.collectibles.length > 0) {
                profileCollectibleCountDisplay.textContent = `Este usuário tem ${profileUser.collectibles.length} boneco(s) em sua coleção.`;
                profileUser.collectibles.forEach(collectible => {
                    const itemDiv = document.createElement('div');
                    itemDiv.classList.add('collectible-item');
                    itemDiv.dataset.collectibleId = collectible.id;
                    // ... (construct inner HTML for collectible item as before) ...
                    itemDiv.innerHTML = `
                        <img src="${collectible.imageUrl}" alt="${collectible.name}">
                        <h3>${collectible.name}</h3>
                        <p>Filme/Série: ${collectible.source}</p>
                        <p>Ano: ${collectible.year}</p>
                        ${collectible.condition ? `<p class="collectible-detail-condition">Condição: ${collectible.condition === 'novo' ? 'Novo' : 'Usado'}</p>` : ''}
                        ${collectible.isForTrade ? `<div class="for-trade-indicator">Negociável</div>` : ''}
                    `;

                    if (collectible.isForTrade) {
                        const currentLoggedInUser = sessionStorage.getItem('currentUser');
                        if (currentLoggedInUser) {
                            if (currentLoggedInUser === profileUser.username) { // Viewing their own profile
                                const viewChatsButton = document.createElement('button');
                                viewChatsButton.textContent = 'Ver Suas Conversas';
                                viewChatsButton.classList.add('view-item-chats-btn', 'sidebar-button-style');
                                viewChatsButton.dataset.collectibleId = collectible.id;
                                viewChatsButton.dataset.collectibleName = collectible.name;
                                viewChatsButton.dataset.ownerUsername = profileUser.username;
                                itemDiv.appendChild(viewChatsButton);
                            } else { // Logged in, viewing another user's profile
                                const startChatButton = document.createElement('button');
                                startChatButton.textContent = `Chat c/ ${profileUser.username}`;
                                startChatButton.classList.add('start-chat-btn', 'sidebar-button-style');
                                startChatButton.dataset.collectibleId = collectible.id;
                                startChatButton.dataset.ownerUsername = profileUser.username;
                                startChatButton.dataset.collectibleName = collectible.name;
                                startChatButton.dataset.collectibleImageUrl = collectible.imageUrl;
                                itemDiv.appendChild(startChatButton);
                            }
                        } else { // Not logged in
                            const loginToChatLink = document.createElement('a');
                            loginToChatLink.href = 'login.html';
                            loginToChatLink.textContent = 'Login para Negociar';
                            loginToChatLink.classList.add('login-to-chat-link');
                            itemDiv.appendChild(loginToChatLink);
                        }
                    }
                    profileCollectionGrid.insertBefore(itemDiv, noResultsMessage);
                });
            } else { /* ... no collectibles message ... */
                profileCollectibleCountDisplay.textContent = "Este usuário ainda não adicionou nenhum boneco à sua coleção.";
                noResultsMessage.textContent = "Este usuário ainda não adicionou nenhum boneco.";
                noResultsMessage.style.display = 'block';
            }
        } else { /* ... user not found message ... */
            profileCollectibleCountDisplay.textContent = "";
            noResultsMessage.textContent = `Usuário "${usernameOfProfileOwner}" não encontrado.`;
            noResultsMessage.style.display = 'block';
            profileUsernameDisplay.textContent = `Perfil Não Encontrado`;
            profileUsernameCollectiblesTitle.textContent = "N/A";
        }
    }

    // Initial Load
    renderProfileGallery(usernameFromUrl);
    initUserSidebar(); // Initialize sidebar state
});
