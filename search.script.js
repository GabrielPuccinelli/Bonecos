document.addEventListener('DOMContentLoaded', () => {
    // Sidebar elements
    const userSidebar = document.getElementById('user-sidebar');
    const sidebarProfileImage = document.getElementById('sidebar-profile-image');
    const sidebarUsername = document.getElementById('sidebar-username');
    const sidebarCollectibleCount = document.getElementById('sidebar-collectible-count');
    const pageContentWrapper = document.getElementById('page-content-wrapper');

    // Search form elements
    const searchForm = document.getElementById('search-form');
    const searchQueryInput = document.getElementById('search-query');
    const userResultsGrid = document.getElementById('user-results-grid');
    const collectibleResultsGrid = document.getElementById('collectible-results-grid');

    const noUserResultsMessage = userResultsGrid ? userResultsGrid.querySelector('.no-results-message') : null;
    const noCollectibleResultsMessage = collectibleResultsGrid ? collectibleResultsGrid.querySelector('.no-results-message') : null;

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

    if (!searchForm || !searchQueryInput || !userResultsGrid || !collectibleResultsGrid || !noUserResultsMessage || !noCollectibleResultsMessage) {
        console.error("Um ou mais elementos essenciais da página de busca não foram encontrados no DOM (form/results).");
        const body = document.querySelector('body');
        if (body && !body.classList.contains('error-displayed')) {
            body.innerHTML = '<p style="color:red; text-align:center; padding-top: 50px;">Erro ao carregar a página de busca. Tente novamente mais tarde.</p>';
            body.classList.add('error-displayed');
        }
        return;
    }

    // --- Helper Functions (Chat & Badge) ---
    function generateConversationId(user1, user2, collectibleId) {
        const participants = [user1, user2].sort();
        return `${participants[0]}_${participants[1]}_${collectibleId}`;
    }

    function updateUnreadMessagesBadge() {
        const sidebarUnreadBadge = document.getElementById('sidebar-unread-badge');
        if (!sidebarUnreadBadge) return;
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) {
            sidebarUnreadBadge.style.display = 'none';
            return;
        }
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
            console.warn("Elementos do sidebar ou pageContentWrapper não encontrados na página de busca.");
            return;
        }
        if (isLoggedIn) {
            const currentUsername = sessionStorage.getItem('currentUser');
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const loggedInUser = users.find(user => user.username === currentUsername);
            if (loggedInUser) {
                userSidebar.style.display = 'flex';
                pageContentWrapper.classList.add('sidebar-active');
                sidebarUsername.textContent = loggedInUser.username;
                sidebarCollectibleCount.textContent = loggedInUser.collectibles ? loggedInUser.collectibles.length : 0;
                sidebarProfileImage.src = loggedInUser.profileImageUrl || 'https://via.placeholder.com/80x80.png?text=Perfil';
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
            updateUnreadMessagesBadge(); // Potentially new unread for other user, not current one
        });
    }

    // Event Delegation for Chat Buttons on Search Results
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

    // --- Search Logic & Rendering ---
    function renderUserResults(users) {
        if (!userResultsGrid || !noUserResultsMessage) return;
        if (!userResultsGrid.contains(noUserResultsMessage)) userResultsGrid.appendChild(noUserResultsMessage);
        Array.from(userResultsGrid.querySelectorAll('.user-result-item')).forEach(item => item.remove());
        if (users.length === 0) {
            noUserResultsMessage.textContent = `Nenhum usuário encontrado com o termo: "${searchQueryInput.value.trim()}"`;
            noUserResultsMessage.style.display = 'block';
        } else {
            noUserResultsMessage.style.display = 'none';
            users.forEach(user => { /* ... existing user rendering ... */
                const userDiv = document.createElement('div');
                userDiv.classList.add('user-result-item');
                const userLink = document.createElement('a');
                userLink.href = `profile.html?user=${encodeURIComponent(user.username)}`;
                userLink.textContent = user.username;
                userDiv.appendChild(userLink);
                userResultsGrid.insertBefore(userDiv, noUserResultsMessage);
            });
        }
    }

    function renderCollectibleResults(collectibles) {
        if (!collectibleResultsGrid || !noCollectibleResultsMessage) return;
        if (!collectibleResultsGrid.contains(noCollectibleResultsMessage)) collectibleResultsGrid.appendChild(noCollectibleResultsMessage);
        Array.from(collectibleResultsGrid.querySelectorAll('.collectible-result-item')).forEach(item => item.remove());
        if (collectibles.length === 0) {
            noCollectibleResultsMessage.textContent = `Nenhum boneco localizado com o termo: "${searchQueryInput.value.trim()}"`;
            noCollectibleResultsMessage.style.display = 'block';
        } else {
            noCollectibleResultsMessage.style.display = 'none';
            collectibles.forEach(collectible => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('collectible-result-item'); // Or 'collectible-item'
                // ... (img, nameH3, sourceP, yearP, conditionP from previous version) ...
                itemDiv.innerHTML = `
                    <img src="${collectible.imageUrl}" alt="${collectible.name}">
                    <h3>${collectible.name}</h3>
                    <p>Filme/Série: ${collectible.source}</p>
                    <p>Ano: ${collectible.year}</p>
                    ${collectible.condition ? `<p class="collectible-detail-condition">Condição: ${collectible.condition === 'novo' ? 'Novo' : 'Usado'}</p>` : ''}
                    ${collectible.isForTrade ? `<div class="for-trade-indicator">Interesse em Negociar</div>` : ''}
                `;

                // Chat Button Logic for Search Results
                if (collectible.isForTrade) {
                    const currentLoggedInUser = sessionStorage.getItem('currentUser');
                    if (currentLoggedInUser) {
                        if (currentLoggedInUser === collectible.ownerUsername) {
                            const viewChatsButton = document.createElement('button');
                            viewChatsButton.textContent = 'Ver Suas Conversas';
                            viewChatsButton.classList.add('view-item-chats-btn', 'sidebar-button-style');
                            viewChatsButton.dataset.collectibleId = collectible.id;
                            viewChatsButton.dataset.collectibleName = collectible.name;
                            itemDiv.appendChild(viewChatsButton);
                        } else {
                            const startChatButton = document.createElement('button');
                            startChatButton.textContent = `Chat c/ ${collectible.ownerUsername}`;
                            startChatButton.classList.add('start-chat-btn', 'sidebar-button-style');
                            startChatButton.dataset.collectibleId = collectible.id;
                            startChatButton.dataset.ownerUsername = collectible.ownerUsername;
                            startChatButton.dataset.collectibleName = collectible.name;
                            startChatButton.dataset.collectibleImageUrl = collectible.imageUrl;
                            itemDiv.appendChild(startChatButton);
                        }
                    } else {
                         const loginToChatLink = document.createElement('a');
                         loginToChatLink.href = 'login.html';
                         loginToChatLink.textContent = 'Login para Negociar';
                         loginToChatLink.classList.add('login-to-chat-link');
                         itemDiv.appendChild(loginToChatLink);
                    }
                }
                const ownerP = document.createElement('p'); // Owner info last
                ownerP.classList.add('owner-info');
                ownerP.textContent = `Dono(a): ${collectible.ownerUsername}`;
                itemDiv.appendChild(ownerP);
                collectibleResultsGrid.insertBefore(itemDiv, noCollectibleResultsMessage);
            });
        }
    }

    function executeSearch(queryTerm) {
        // ... (existing search execution logic) ...
        const normalizedQuery = queryTerm.trim().toLowerCase();
        if(noUserResultsMessage) noUserResultsMessage.style.display = 'none';
        if(noCollectibleResultsMessage) noCollectibleResultsMessage.style.display = 'none';
        Array.from(userResultsGrid.querySelectorAll('.user-result-item')).forEach(item => item.remove());
        Array.from(collectibleResultsGrid.querySelectorAll('.collectible-result-item')).forEach(item => item.remove());

        if (!normalizedQuery) {
            if(noUserResultsMessage) { noUserResultsMessage.textContent = "Por favor, digite um termo para buscar."; noUserResultsMessage.style.display = 'block'; }
            if(noCollectibleResultsMessage) { noCollectibleResultsMessage.textContent = "Por favor, digite um termo para buscar."; noCollectibleResultsMessage.style.display = 'block'; }
            return;
        }
        const usersData = JSON.parse(localStorage.getItem('users')) || [];
        let foundUsers = usersData.filter(user => user.username.toLowerCase().includes(normalizedQuery));
        let foundCollectibles = [];
        usersData.forEach(user => {
            if (user.collectibles && user.collectibles.length > 0) {
                user.collectibles.forEach(collectible => {
                    if (collectible.name.toLowerCase().includes(normalizedQuery) ||
                        collectible.source.toLowerCase().includes(normalizedQuery) ||
                        (collectible.year && collectible.year.toString().toLowerCase().includes(normalizedQuery))) {
                        foundCollectibles.push({ ...collectible, ownerUsername: user.username });
                    }
                });
            }
        });
        renderUserResults(foundUsers);
        renderCollectibleResults(foundCollectibles);
    }

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = searchQueryInput.value;
        const url = new URL(window.location);
        url.searchParams.set('query', query);
        window.history.pushState({}, '', url);
        executeSearch(query);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const queryFromUrl = urlParams.get('query');
    if (queryFromUrl) {
        searchQueryInput.value = decodeURIComponent(queryFromUrl);
        executeSearch(queryFromUrl);
    } else {
        if(noUserResultsMessage) { noUserResultsMessage.textContent = "Digite sua busca acima e clique em 'Buscar'."; noUserResultsMessage.style.display = 'block';}
        if(noCollectibleResultsMessage) { noCollectibleResultsMessage.textContent = "Resultados de bonecos aparecerão aqui."; noCollectibleResultsMessage.style.display = 'block';}
    }

    initUserSidebar();
});
