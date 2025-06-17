document.addEventListener('DOMContentLoaded', () => {
    const globalCollectionGrid = document.getElementById('global-collection-grid');
    const paginationControls = document.getElementById('pagination-controls');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const publicNav = document.getElementById('public-nav');

    // Header updates
    const userProfileHeaderInfoPublic = document.getElementById('user-profile-header-info-public');
    const publicHeaderProfileImage = document.getElementById('public-header-profile-image');
    const publicHeaderUsername = document.getElementById('public-header-username');

    // Inline search
    const inlineSearchForm = document.getElementById('public-inline-search-form');
    const inlineSearchQueryInput = document.getElementById('public-inline-search-query');

    // Sidebar elements
    const userSidebar = document.getElementById('user-sidebar');
    const sidebarProfileImage = document.getElementById('sidebar-profile-image');
    const sidebarUsername = document.getElementById('sidebar-username');
    const sidebarCollectibleCount = document.getElementById('sidebar-collectible-count');
    const pageContentWrapper = document.getElementById('page-content-wrapper');

    // Filter controls
    const filterTradeSelect = document.getElementById('filter-trade');
    const filterConditionSelect = document.getElementById('filter-condition');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');

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

    // --- Lightbox Globals ---
    const lightboxOverlay = document.getElementById('image-lightbox-overlay');
    const lightboxImage = document.getElementById('lightbox-image');
    const closeLightboxBtn = document.getElementById('close-lightbox-btn');
    // const lightboxCaption = document.getElementById('lightbox-caption'); // If using caption
    // --- End Lightbox Globals ---


    let allCollectibles = [];
    let displayedCollectibles = [];
    let currentPage = 1;
    const itemsPerPage = 12;

    function generateConversationId(user1, user2, collectibleId) {
        const participants = [user1, user2].sort();
        return `${participants[0]}_${participants[1]}_${collectibleId}`;
    }

    function updateUnreadMessagesBadge() {
        const sidebarUnreadBadge = document.getElementById('sidebar-unread-badge');
        if (!sidebarUnreadBadge) {
            return;
        }
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
                    if (msg.receiver === currentUser && !msg.isRead) {
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

    function fetchAllCollectibles() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        allCollectibles = [];
        users.forEach(user => {
            if (user.collectibles && user.collectibles.length > 0) {
                user.collectibles.forEach(collectible => {
                    allCollectibles.push({ ...collectible, ownerUsername: user.username });
                });
            }
        });
        allCollectibles.sort((a, b) => b.id - a.id);
        applyCurrentFilters();
    }

    function applyCurrentFilters() {
        const tradeFilter = filterTradeSelect ? filterTradeSelect.value : 'todos';
        const conditionFilter = filterConditionSelect ? filterConditionSelect.value : 'todos';
        displayedCollectibles = allCollectibles.filter(collectible => {
            let matchesTrade = true;
            if (tradeFilter === 'sim') matchesTrade = collectible.isForTrade === true;
            else if (tradeFilter === 'nao') matchesTrade = !collectible.isForTrade;
            let matchesCondition = true;
            if (conditionFilter !== 'todos') matchesCondition = collectible.condition === conditionFilter;
            return matchesTrade && matchesCondition;
        });
    }

    // --- Lightbox Functions ---
    function openLightbox(imageUrl, captionText = '') {
        if (lightboxOverlay && lightboxImage) {
            lightboxImage.src = imageUrl;
            // if (lightboxCaption) lightboxCaption.textContent = captionText;
            lightboxOverlay.classList.add('visible');
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
        }
    }

    function closeLightbox() {
        if (lightboxOverlay) {
            lightboxOverlay.classList.remove('visible');
            document.body.style.overflow = ''; // Re-enable scrolling
        }
    }
    // --- End Lightbox Functions ---

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
        chatModalOverlay.style.display = 'flex'; // Use flex as per CSS
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
    // --- End Chat Modal Functions ---


    // Event Listeners for Modals closing
    if(closeChatModalBtn) closeChatModalBtn.addEventListener('click', closeChatModal);
    if(chatModalOverlay) {
        chatModalOverlay.addEventListener('click', (event) => {
            if (event.target === chatModalOverlay) closeChatModal();
        });
    }
    if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
    if (lightboxOverlay) {
        lightboxOverlay.addEventListener('click', (event) => {
            if (event.target === lightboxOverlay) closeLightbox();
        });
    }
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            if (chatModalOverlay && chatModalOverlay.classList.contains('visible')) closeChatModal();
            if (lightboxOverlay && lightboxOverlay.classList.contains('visible')) closeLightbox();
        }
    });


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
        chatModalForm.addEventListener('submit', function(event) {
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

    // Event Delegation for Chat Buttons and Image Clicks
    document.body.addEventListener('click', function(event) {
        const chatButton = event.target.closest('.start-chat-btn, .view-item-chats-btn');
        const imageInGallery = event.target.closest('.collectible-item img');

        if (chatButton) {
            const { collectibleId, ownerUsername, collectibleName, collectibleImageUrl } = chatButton.dataset;
            if (chatButton.classList.contains('start-chat-btn')) {
                 openChatModal(collectibleId, ownerUsername, collectibleName, collectibleImageUrl);
            } else if (chatButton.classList.contains('view-item-chats-btn')) {
                window.location.href = `messages.html?itemId=${collectibleId}&itemName=${encodeURIComponent(collectibleName)}`;
            }
        } else if (imageInGallery && globalCollectionGrid && globalCollectionGrid.contains(imageInGallery)) {
            // Ensure click is within the global gallery context for this script
            event.preventDefault();
            const imageUrl = imageInGallery.src;
            const collectibleName = imageInGallery.alt || 'Colecionável';
            openLightbox(imageUrl, collectibleName);
        }
    });

    function renderGalleryPage(pageNumber) {
        currentPage = pageNumber;
        if(!globalCollectionGrid) { console.error("globalCollectionGrid not found"); return; }
        globalCollectionGrid.innerHTML = '';
        if (displayedCollectibles.length === 0) {
            globalCollectionGrid.innerHTML = allCollectibles.length === 0 ?
                '<p style="text-align:center; color:#ccc; padding: 20px;">Ainda não há nenhum boneco na galeria global. Seja o primeiro a cadastrar!</p>' :
                '<p style="text-align:center; color:#ccc; padding: 20px;">Nenhum boneco encontrado com os filtros atuais.</p>';
            if (paginationControls) paginationControls.style.display = 'none';
            return;
        }
        if (paginationControls) paginationControls.style.display = 'flex';
        const startIndex = (pageNumber - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsToDisplay = displayedCollectibles.slice(startIndex, endIndex);
        if (itemsToDisplay.length === 0 && pageNumber > 1) { renderGalleryPage(1); return; }

        itemsToDisplay.forEach(collectible => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('collectible-item');
            itemDiv.innerHTML = `
                <img src="${collectible.imageUrl}" alt="${collectible.name}">
                <h3>${collectible.name}</h3>
                <p>Origem: ${collectible.source}</p>
                <p>Ano: ${collectible.year}</p>
                ${collectible.condition ? `<p class="collectible-detail-condition">Condição: ${collectible.condition === 'novo' ? 'Novo' : 'Usado'}</p>` : ''}
                ${collectible.isForTrade ? `<div class="for-trade-indicator">Interesse em Negociar</div>` : ''}
            `;
            // Chat/Login buttons/links based on trade status and login state
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
            const ownerLink = document.createElement('a');
            ownerLink.href = `profile.html?user=${encodeURIComponent(collectible.ownerUsername)}`;
            ownerLink.textContent = collectible.ownerUsername;
            ownerLink.style.cssText = "color: #ffcc00; text-decoration: none;"; // Thematic link
            ownerLink.onmouseover = () => ownerLink.style.textDecoration = 'underline';
            ownerLink.onmouseout = () => ownerLink.style.textDecoration = 'none';
            ownerP.textContent = `Dono(a): `;
            ownerP.appendChild(ownerLink);
            itemDiv.appendChild(ownerP);
            globalCollectionGrid.appendChild(itemDiv);
        });
        renderPaginationControls();
    }

    function renderPaginationControls() { /* ... as before ... */
        if (!paginationControls) return;
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(displayedCollectibles.length / itemsPerPage);
        if (totalPages <= 1) { paginationControls.style.display = 'none'; return; }
        paginationControls.style.display = 'flex';
        paginationControls.style.justifyContent = 'center';
        paginationControls.style.alignItems = 'center';
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Anterior';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => renderGalleryPage(currentPage - 1));
        paginationControls.appendChild(prevButton);
        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        pageInfo.style.margin = "0 10px";
        pageInfo.classList.add('page-number', 'current');
        paginationControls.appendChild(pageInfo);
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Próxima';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => renderGalleryPage(currentPage + 1));
        paginationControls.appendChild(nextButton);
    }

    if (mobileMenuToggle && publicNav) { /* ... as before ... */
        mobileMenuToggle.addEventListener('click', () => publicNav.classList.toggle('active'));
    } else { console.warn("Mobile menu toggle or public nav not found."); }

    function updateUserUI() { /* ... as before ... */
        const isLoggedIn = sessionStorage.getItem('loggedIn') === 'true';
        if (!publicNav || !userProfileHeaderInfoPublic || !publicHeaderProfileImage || !publicHeaderUsername || !userSidebar || !sidebarProfileImage || !sidebarUsername || !sidebarCollectibleCount || !pageContentWrapper ) {
            console.warn("Um ou mais elementos da UI para atualização não foram encontrados."); return;
        }
        if (isLoggedIn) {
            const currentUsername = sessionStorage.getItem('currentUser');
            let users = JSON.parse(localStorage.getItem('users')) || [];
            let loggedInUser = users.find(user => user.username === currentUsername);
            publicNav.innerHTML = '';
            // ... (add logged-in nav links)
            const navItems = [
                { href: 'dashboard.html', text: 'Minha Galeria' },
                { href: 'search.html', text: 'Buscar' },
                { href: 'about.html', text: 'Sobre Nós' },
                { href: 'contact.html', text: 'Contato' }
            ];
            navItems.forEach(item => {
                const link = document.createElement('a');
                link.href = item.href; link.textContent = item.text; link.classList.add('nav-link'); // Assuming .nav-link for styling
                publicNav.appendChild(link);
            });
            const logoutButton = document.createElement('a');
            logoutButton.href = '#'; logoutButton.textContent = 'Logout'; logoutButton.id = 'public-gallery-logout-btn'; logoutButton.classList.add('nav-link');
            logoutButton.addEventListener('click', (e) => { /* ... logout logic ... */
                e.preventDefault();
                sessionStorage.removeItem('loggedIn'); sessionStorage.removeItem('currentUser');
                updateUserUI(); window.location.reload();
            });
            publicNav.appendChild(logoutButton);
            if (loggedInUser) {
                publicHeaderUsername.textContent = loggedInUser.username;
                publicHeaderProfileImage.src = loggedInUser.profileImageUrl || 'https://via.placeholder.com/30x30.png?text=P';
                userProfileHeaderInfoPublic.style.display = 'flex';
                userSidebar.style.display = 'flex';
                if (pageContentWrapper) pageContentWrapper.classList.add('sidebar-active');
                sidebarUsername.textContent = loggedInUser.username;
                sidebarCollectibleCount.textContent = loggedInUser.collectibles ? loggedInUser.collectibles.length : 0;
                sidebarProfileImage.src = loggedInUser.profileImageUrl || 'https://via.placeholder.com/80x80.png?text=Perfil';
                updateUnreadMessagesBadge();
            } else {
                userProfileHeaderInfoPublic.style.display = 'none';
                userSidebar.style.display = 'none';
                if (pageContentWrapper) pageContentWrapper.classList.remove('sidebar-active');
            }
        } else {
            userProfileHeaderInfoPublic.style.display = 'none';
            userSidebar.style.display = 'none';
            if (pageContentWrapper) pageContentWrapper.classList.remove('sidebar-active');
            publicNav.innerHTML = `
                <a href="index.html" class="nav-link" id="nav-home-public">Página Inicial</a>
                <a href="search.html" class="nav-link" id="nav-search-public">Buscar</a>
                <a href="about.html" class="nav-link" id="nav-about-public">Sobre Nós</a>
                <a href="contact.html" class="nav-link" id="nav-contact-public">Contato</a>
                <a href="register.html" class="nav-link" id="nav-register-public">Cadastre-se</a>
                <a href="login.html" class="nav-link" id="nav-login-public">Login</a>
            `; // Ensured nav-link class for consistency
            updateUnreadMessagesBadge();
        }
    }

    if (inlineSearchForm && inlineSearchQueryInput) { /* ... as before ... */
        inlineSearchForm.addEventListener('submit', function(event) {
            event.preventDefault(); const query = inlineSearchQueryInput.value.trim();
            if (query) window.location.href = `search.html?query=${encodeURIComponent(query)}`;
        });
    } else { console.warn("Formulário de busca inline não encontrado."); }

    if (applyFiltersBtn) { /* ... as before ... */
        applyFiltersBtn.addEventListener('click', () => { applyCurrentFilters(); renderGalleryPage(1); });
    } else { console.warn("Botão de aplicar filtros não encontrado."); }

    fetchAllCollectibles();
    if (globalCollectionGrid) renderGalleryPage(1);
    updateUserUI();
});
