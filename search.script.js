document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchQueryInput = document.getElementById('search-query');
    const userResultsGrid = document.getElementById('user-results-grid');
    const collectibleResultsGrid = document.getElementById('collectible-results-grid');

    const noUserResultsMessage = userResultsGrid ? userResultsGrid.querySelector('.no-results-message') : null;
    const noCollectibleResultsMessage = collectibleResultsGrid ? collectibleResultsGrid.querySelector('.no-results-message') : null;

    if (!searchForm || !searchQueryInput || !userResultsGrid || !collectibleResultsGrid || !noUserResultsMessage || !noCollectibleResultsMessage) {
        console.error("Um ou mais elementos essenciais da página de busca não foram encontrados no DOM.");
        // Optionally, display a user-facing error message on the page itself
        const body = document.querySelector('body');
        if (body) {
            body.innerHTML = '<p style="color:red; text-align:center; padding-top: 50px;">Erro ao carregar a página de busca. Tente novamente mais tarde.</p>';
        }
        return;
    }

    function renderUserResults(users) {
        if (!userResultsGrid.contains(noUserResultsMessage)) { // Ensure it's a child before trying to use it as reference
            userResultsGrid.appendChild(noUserResultsMessage);
        }

        // Clear previous user items only, not the noUserResultsMessage itself
        Array.from(userResultsGrid.querySelectorAll('.user-result-item')).forEach(item => item.remove());

        if (users.length === 0) {
            noUserResultsMessage.textContent = "Nenhum usuário encontrado.";
            noUserResultsMessage.style.display = 'block';
        } else {
            noUserResultsMessage.style.display = 'none';
            users.forEach(user => {
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
        if (!collectibleResultsGrid.contains(noCollectibleResultsMessage)) {
             collectibleResultsGrid.appendChild(noCollectibleResultsMessage);
        }

        Array.from(collectibleResultsGrid.querySelectorAll('.collectible-result-item')).forEach(item => item.remove());

        if (collectibles.length === 0) {
            noCollectibleResultsMessage.textContent = "Nenhum boneco encontrado.";
            noCollectibleResultsMessage.style.display = 'block';
        } else {
            noCollectibleResultsMessage.style.display = 'none';
            collectibles.forEach(collectible => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('collectible-result-item');
                // ... (construct collectible item display as before)
                const img = document.createElement('img');
                img.src = collectible.imageUrl;
                img.alt = collectible.name;

                const nameH3 = document.createElement('h3');
                nameH3.textContent = collectible.name;

                const sourceP = document.createElement('p');
                sourceP.textContent = `Filme/Série: ${collectible.source}`;

                const yearP = document.createElement('p');
                yearP.textContent = `Ano: ${collectible.year}`;

                const ownerP = document.createElement('p');
                ownerP.classList.add('owner-info');
                ownerP.textContent = `Dono(a): ${collectible.ownerUsername}`;

                itemDiv.appendChild(img);
                itemDiv.appendChild(nameH3);
                itemDiv.appendChild(sourceP);
                itemDiv.appendChild(yearP);
                itemDiv.appendChild(ownerP);
                collectibleResultsGrid.insertBefore(itemDiv, noCollectibleResultsMessage);
            });
        }
    }

    function executeSearch(queryTerm) {
        const normalizedQuery = queryTerm.trim().toLowerCase();

        // Initial setup for results display
        if(noUserResultsMessage) noUserResultsMessage.style.display = 'none';
        if(noCollectibleResultsMessage) noCollectibleResultsMessage.style.display = 'none';
        // Clear previous items correctly before new search
        Array.from(userResultsGrid.querySelectorAll('.user-result-item')).forEach(item => item.remove());
        Array.from(collectibleResultsGrid.querySelectorAll('.collectible-result-item')).forEach(item => item.remove());


        if (!normalizedQuery) {
            if(noUserResultsMessage) {
                noUserResultsMessage.textContent = "Por favor, digite um termo para buscar.";
                noUserResultsMessage.style.display = 'block';
            }
            if(noCollectibleResultsMessage) {
                noCollectibleResultsMessage.textContent = "Por favor, digite um termo para buscar.";
                noCollectibleResultsMessage.style.display = 'block';
            }
            return;
        }

        const usersData = JSON.parse(localStorage.getItem('users')) || [];
        let foundUsers = [];
        let foundCollectibles = [];

        foundUsers = usersData.filter(user => user.username.toLowerCase().includes(normalizedQuery));

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
        // Update URL without navigating, to reflect current search
        const url = new URL(window.location);
        url.searchParams.set('query', query);
        window.history.pushState({}, '', url); // Update URL in history

        executeSearch(query);
    });

    // Auto-search if query param exists on page load
    const urlParams = new URLSearchParams(window.location.search);
    const queryFromUrl = urlParams.get('query');

    if (queryFromUrl) {
        searchQueryInput.value = decodeURIComponent(queryFromUrl); // Pre-fill search box
        executeSearch(queryFromUrl); // Perform search
    } else {
        // If no query in URL, show initial "please search" messages or keep results empty
        if(noUserResultsMessage) {
             noUserResultsMessage.textContent = "Digite sua busca acima e clique em 'Buscar'.";
             noUserResultsMessage.style.display = 'block';
        }
        if(noCollectibleResultsMessage) {
            noCollectibleResultsMessage.textContent = "Resultados de bonecos aparecerão aqui.";
            noCollectibleResultsMessage.style.display = 'block';
        }
    }
});
