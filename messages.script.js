document.addEventListener('DOMContentLoaded', () => {
    // Page Protection
    const currentLoggedInUser = sessionStorage.getItem('currentUser');
    if (!currentLoggedInUser || sessionStorage.getItem('loggedIn') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // DOM Elements
    const conversationsListDiv = document.getElementById('conversations-list'); // The actual list container
    const messageDetailPanel = document.getElementById('message-detail-panel');
    const messageDetailHeader = document.getElementById('message-detail-header');
    const messageDetailItemInfo = document.getElementById('message-detail-item-info');
    const messageDetailItemImage = document.getElementById('message-detail-item-image');
    const messageDetailItemName = document.getElementById('message-detail-item-name');
    const messageDetailMessagesContainer = messageDetailPanel.querySelector('.chat-messages-container'); // More specific selector
    const messageDetailReplyForm = document.getElementById('reply-form'); // Corrected ID from prompt
    const messageDetailReplyInput = document.getElementById('reply-message-input'); // Corrected ID

    let currentOpenConversationId = null;
    let allUserConversations = []; // To store conversations relevant to the current user

    // --- Helper: Generate Conversation ID ---
    function generateConversationId(user1, user2, collectibleId) {
        const participants = [user1, user2].sort();
        return `${participants[0]}_${participants[1]}_${collectibleId}`;
    }

    // --- Helper: Update Unread Messages Badge in Sidebar ---
    // This function is intended to be global or part of each script with a sidebar.
    // For now, it's defined here and will be called.
    function updateUnreadMessagesBadge() {
        const sidebarUnreadBadge = document.getElementById('sidebar-unread-badge');
        if (!sidebarUnreadBadge) {
            // console.warn("Sidebar unread badge not found.");
            return;
        }

        if (!currentLoggedInUser) {
            sidebarUnreadBadge.style.display = 'none';
            return;
        }

        const conversations = JSON.parse(localStorage.getItem('chatConversations')) || [];
        let totalUnreadCount = 0;
        conversations.forEach(conv => {
            if (conv.participants.includes(currentLoggedInUser)) {
                conv.messages.forEach(msg => {
                    if (msg.receiver === currentLoggedInUser && !msg.isRead) {
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


    // --- Display Conversation Detail ---
    function displayConversationDetail(conversationId) {
        currentOpenConversationId = conversationId;
        const conversations = JSON.parse(localStorage.getItem('chatConversations')) || [];
        const conversation = conversations.find(c => c.conversationId === conversationId);

        if (!conversation || !messageDetailPanel || !messageDetailMessagesContainer || !messageDetailHeader || !messageDetailItemInfo || !messageDetailItemImage || !messageDetailItemName || !replyForm) {
            console.error("One or more UI elements for message detail view are missing.");
            if (messageDetailPanel) messageDetailPanel.style.display = 'none';
            return;
        }

        const otherParticipant = conversation.participants.find(p => p !== currentLoggedInUser) || 'Desconhecido';
        messageDetailHeader.textContent = `Chat sobre: ${conversation.collectibleName} com ${otherParticipant}`;

        messageDetailItemImage.src = conversation.collectibleImageUrl || 'https://via.placeholder.com/50x50.png?text=Item';
        messageDetailItemName.textContent = conversation.collectibleName || 'Item não especificado';
        messageDetailItemInfo.style.display = 'flex';

        messageDetailMessagesContainer.innerHTML = ''; // Clear previous messages
        let messagesMarkedAsRead = false;

        if (conversation.messages && conversation.messages.length > 0) {
            conversation.messages.forEach(msg => {
                if (msg.receiver === currentLoggedInUser && !msg.isRead) {
                    msg.isRead = true;
                    messagesMarkedAsRead = true;
                }
                const msgDiv = document.createElement('div');
                msgDiv.classList.add('chat-message');
                msgDiv.classList.add(msg.sender === currentLoggedInUser ? 'sent' : 'received');

                const senderSpan = document.createElement('span');
                senderSpan.classList.add('msg-sender-name'); // Changed from sender-name
                senderSpan.textContent = msg.sender === currentLoggedInUser ? "Você" : msg.sender;

                const textP = document.createElement('p');
                textP.textContent = msg.text;

                const timeSpan = document.createElement('span');
                timeSpan.classList.add('msg-timestamp'); // Changed from timestamp
                timeSpan.textContent = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                msgDiv.appendChild(senderSpan);
                msgDiv.appendChild(textP);
                msgDiv.appendChild(timeSpan);
                messageDetailMessagesContainer.appendChild(msgDiv);
            });
        } else {
            messageDetailMessagesContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#aaa;">Nenhuma mensagem nesta conversa ainda.</p>';
        }

        if (messagesMarkedAsRead) {
            const convIndex = conversations.findIndex(c => c.conversationId === conversationId);
            if (convIndex !== -1) {
                conversations[convIndex] = conversation; // Update the conversation with messages marked as read
                localStorage.setItem('chatConversations', JSON.stringify(conversations));
            }
            loadAndDisplayConversations(); // Re-render conversation list to update unread counts
            updateUnreadMessagesBadge(); // Update global badge in sidebar
        }

        messageDetailPanel.style.display = 'flex'; // Assuming it's a flex column
        messageDetailMessagesContainer.scrollTop = messageDetailMessagesContainer.scrollHeight;
        if (replyMessageInput) replyMessageInput.focus();
        replyForm.style.display = 'flex';
    }

    // --- Load and Display List of Conversations ---
    function loadAndDisplayConversations() {
        if (!conversationsListDiv) {
            console.error("Conversation list container not found.");
            return;
        }
        conversationsListDiv.innerHTML = '<p>Carregando conversas...</p>';

        const storedConversations = JSON.parse(localStorage.getItem('chatConversations')) || [];
        allUserConversations = storedConversations.filter(conv => conv.participants.includes(currentLoggedInUser));

        allUserConversations.sort((a, b) => b.lastActivity - a.lastActivity);

        if (allUserConversations.length === 0) {
            conversationsListDiv.innerHTML = '<p style="text-align:center; padding:20px; color:#aaa;">Nenhuma conversa encontrada.</p>';
            if (messageDetailPanel) messageDetailPanel.style.display = 'none'; // Hide detail panel too
            return;
        }

        conversationsListDiv.innerHTML = '';
        allUserConversations.forEach(conv => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('conversation-item');
            itemDiv.dataset.conversationId = conv.conversationId;

            const collectibleNameH4 = document.createElement('h4');
            collectibleNameH4.textContent = conv.collectibleName || 'Item Desconhecido';
            itemDiv.appendChild(collectibleNameH4);

            const otherParticipant = conv.participants.find(p => p !== currentLoggedInUser) || 'Participante Desconhecido';
            const participantsP = document.createElement('p');
            participantsP.textContent = `Com: ${otherParticipant}`;
            itemDiv.appendChild(participantsP);

            let unreadInConv = 0;
            if (conv.messages && conv.messages.length > 0) {
                const lastMsg = conv.messages[conv.messages.length - 1];
                const snippetP = document.createElement('p');
                snippetP.classList.add('last-message-snippet');
                snippetP.textContent = `${lastMsg.sender === currentLoggedInUser ? "Você: " : ""}${lastMsg.text.substring(0, 25)}...`;
                itemDiv.appendChild(snippetP);

                unreadInConv = conv.messages.filter(m => m.receiver === currentLoggedInUser && !m.isRead).length;
                if (unreadInConv > 0) {
                    const unreadIndicator = document.createElement('span');
                    unreadIndicator.classList.add('unread-indicator');
                    unreadIndicator.textContent = unreadInConv > 9 ? "9+" : unreadInConv;
                    itemDiv.appendChild(unreadIndicator);
                }
            } else {
                 const snippetP = document.createElement('p');
                 snippetP.classList.add('last-message-snippet');
                 snippetP.textContent = "Nenhuma mensagem ainda.";
                 itemDiv.appendChild(snippetP);
            }

            itemDiv.addEventListener('click', () => {
                document.querySelectorAll('#conversations-list .conversation-item.active').forEach(activeEl => {
                    activeEl.classList.remove('active');
                });
                itemDiv.classList.add('active');
                displayConversationDetail(conv.conversationId);
            });
            conversationsListDiv.appendChild(itemDiv);
        });
    }

    // --- Reply Form Logic ---
    if (replyForm && replyMessageInput) {
        replyForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const messageText = replyMessageInput.value.trim();
            if (!messageText || !currentOpenConversationId) return;

            const conversations = JSON.parse(localStorage.getItem('chatConversations')) || [];
            const convIndex = conversations.findIndex(c => c.conversationId === currentOpenConversationId);
            if (convIndex === -1) {
                console.error("Conversa aberta não encontrada no localStorage para responder.");
                return;
            }

            const conversation = conversations[convIndex];
            const receiver = conversation.participants.find(p => p !== currentLoggedInUser);
            if (!receiver) {
                console.error("Destinatário não pôde ser determinado para a resposta.");
                return;
            }

            const newMessage = {
                sender: currentLoggedInUser,
                receiver: receiver,
                text: messageText,
                timestamp: Date.now(),
                isRead: false
            };

            conversations[convIndex].messages.push(newMessage);
            conversations[convIndex].lastActivity = Date.now();
            localStorage.setItem('chatConversations', JSON.stringify(conversations));

            displayConversationDetail(currentOpenConversationId); // Re-render messages
            loadAndDisplayConversations(); // Re-render conversation list (updates sort & snippet & unread count)

            // Re-apply active class to the current conversation in the list
            const activeConvItem = conversationsListDiv.querySelector(`.conversation-item[data-conversation-id="${currentOpenConversationId}"]`);
            if (activeConvItem) activeConvItem.classList.add('active');

            replyMessageInput.value = '';
            replyMessageInput.focus(); // Keep focus on input for quick replies
        });
    } else {
        console.warn("Formulário de resposta ou input não encontrado.");
    }

    // --- Initial Load and URL Parameter Handling ---
    loadAndDisplayConversations();
    updateUnreadMessagesBadge(); // Initial update for sidebar badge

    const urlParamsMsg = new URLSearchParams(window.location.search);
    const itemIdFromUrl = urlParamsMsg.get('itemId');
    // const itemNameFromUrl = urlParamsMsg.get('itemName'); // Not directly used, info is in conversation object

    if (itemIdFromUrl) {
        // Try to find a conversation related to this item.
        // If owner clicked "Ver Conversas", they are currentLoggedInUser.
        // If a non-owner started a chat, they are currentLoggedInUser.
        // The conversation ID is built from sorted names and item ID.

        // Find the specific conversation if possible. This might involve knowing the other participant.
        // For now, let's find the first conversation for this item involving the current user.
        const relevantConversation = allUserConversations.find(conv =>
            conv.collectibleId === itemIdFromUrl
            // No need to check participants here as allUserConversations is already filtered for currentLoggedInUser
        );

        if (relevantConversation) {
            displayConversationDetail(relevantConversation.conversationId);
            const listItem = conversationsListDiv.querySelector(`.conversation-item[data-conversation-id="${relevantConversation.conversationId}"]`);
            if(listItem) listItem.classList.add('active');
        } else if (messageDetailHeader && messagesContainer && replyForm) {
            messageDetailHeader.textContent = "Nenhuma conversa sobre este item.";
            messageDetailItemInfo.style.display = 'none';
            messagesContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#aaa;">Você não tem conversas sobre este item ainda.</p>';
            replyForm.style.display = 'none';
            if(messageDetailPanel) messageDetailPanel.style.display = 'block'; // Show panel with message
        }
    } else {
        if (messageDetailPanel && messageDetailHeader) { // If no item from URL, hide detail panel initially
            messageDetailPanel.style.display = 'none';
        }
    }
});
