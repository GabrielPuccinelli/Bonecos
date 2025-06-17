document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const usernameFromUrl = urlParams.get('user');

    const profileUsernameDisplay = document.getElementById('profile-username-display');
    const profileUsernameCollectiblesTitle = document.getElementById('profile-username-collectibles-title');
    const profileCollectionGrid = document.getElementById('profile-collection-grid');
    const profileCollectibleCountDisplay = document.getElementById('profile-collectible-count-display');

    // Get the no-results message paragraph from the grid
    const noResultsMessage = profileCollectionGrid.querySelector('.no-results-message');

    if (!profileUsernameDisplay || !profileUsernameCollectiblesTitle || !profileCollectionGrid || !profileCollectibleCountDisplay || !noResultsMessage) {
        console.error("Um ou mais elementos essenciais da página de perfil não foram encontrados no DOM.");
        if(document.querySelector('main')) { // Check if main exists before trying to write to it
            document.querySelector('main').innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar a estrutura da página de perfil.</p>';
        }
        return;
    }

    if (!usernameFromUrl) {
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.innerHTML = '<p style="color:red; text-align:center;">Erro: Nome de usuário não especificado na URL.</p>';
        }
        // Hide elements that might show default text
        if(profileUsernameDisplay) profileUsernameDisplay.textContent = "Erro";
        if(profileUsernameCollectiblesTitle) profileUsernameCollectiblesTitle.textContent = "N/A";
        if(profileCollectibleCountDisplay) profileCollectibleCountDisplay.style.display = 'none';
        return;
    }

    profileUsernameDisplay.textContent = `Perfil de ${usernameFromUrl}`;
    profileUsernameCollectiblesTitle.textContent = usernameFromUrl;

    renderProfileGallery(usernameFromUrl);

    function renderProfileGallery(username) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const profileUser = users.find(user => user.username === username);

        // Clear previous content and hide no-results message initially
        profileCollectionGrid.innerHTML = '';
        noResultsMessage.style.display = 'none';
        // Re-append the noResultsMessage to the grid so it's there if needed
        profileCollectionGrid.appendChild(noResultsMessage);


        if (profileUser) {
            if (profileUser.collectibles && profileUser.collectibles.length > 0) {
                profileCollectibleCountDisplay.textContent = `Este usuário tem ${profileUser.collectibles.length} boneco(s) em sua coleção.`;

                profileUser.collectibles.forEach(collectible => {
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

                    // Display For Trade indicator if applicable
                    if (collectible.isForTrade) {
                        const forTradeIndicator = document.createElement('div');
                        forTradeIndicator.classList.add('for-trade-indicator');
                        forTradeIndicator.textContent = 'Negociável'; // Consistent with dashboard
                        itemDiv.appendChild(forTradeIndicator);
                    }

                    profileCollectionGrid.insertBefore(itemDiv, noResultsMessage); // Insert before the message
                });
            } else {
                profileCollectibleCountDisplay.textContent = "Este usuário ainda não adicionou nenhum boneco à sua coleção.";
                noResultsMessage.textContent = "Este usuário ainda não adicionou nenhum boneco.";
                noResultsMessage.style.display = 'block';
            }
        } else {
            profileCollectibleCountDisplay.textContent = ""; // Clear count
            profileCollectionGrid.innerHTML = ''; // Clear grid before adding the message
            noResultsMessage.textContent = `Usuário "${username}" não encontrado.`;
            noResultsMessage.style.display = 'block';
            profileCollectionGrid.appendChild(noResultsMessage); // Ensure it's in the grid

            // Also update the main profile display if user not found
            profileUsernameDisplay.textContent = `Perfil Não Encontrado`;
            profileUsernameCollectiblesTitle.textContent = "N/A";
        }
    }
});
