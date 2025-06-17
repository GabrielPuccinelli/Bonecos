document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchQueryInput = document.getElementById('search-query');
    const userResultsGrid = document.getElementById('user-results-grid');
    const collectibleResultsGrid = document.getElementById('collectible-results-grid');

    // Get references to the "no results" message paragraphs
    const noUserResultsMessage = userResultsGrid.querySelector('.no-results-message');
    const noCollectibleResultsMessage = collectibleResultsGrid.querySelector('.no-results-message');

    if (!searchForm || !searchQueryInput || !userResultsGrid || !collectibleResultsGrid || !noUserResultsMessage || !noCollectibleResultsMessage) {
        console.error("Um ou mais elementos essenciais da página de busca não foram encontrados.");
        return;
    }

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = searchQueryInput.value.trim().toLowerCase();

        // Clear previous results and hide "no results" messages
        userResultsGrid.innerHTML = ''; // This will also remove the noUserResultsMessage if it was previously appended
        collectibleResultsGrid.innerHTML = ''; // Same for collectibles
        noUserResultsMessage.style.display = 'none';
        noCollectibleResultsMessage.style.display = 'none';
        // Re-append them so they are there if needed.
        userResultsGrid.appendChild(noUserResultsMessage);
        collectibleResultsGrid.appendChild(noCollectibleResultsMessage);


        if (!query) {
            // Optionally, display a message asking for a search term or simply show no results
            noUserResultsMessage.textContent = "Por favor, digite um termo para buscar.";
            noUserResultsMessage.style.display = 'block';
            noCollectibleResultsMessage.textContent = "Por favor, digite um termo para buscar.";
            noCollectibleResultsMessage.style.display = 'block';
            return;
        }

        const usersData = JSON.parse(localStorage.getItem('users')) || [];
        let foundUsers = [];
        let foundCollectibles = [];

        // Search Users
        foundUsers = usersData.filter(user => user.username.toLowerCase().includes(query));

        // Search Collectibles
        usersData.forEach(user => {
            if (user.collectibles && user.collectibles.length > 0) {
                user.collectibles.forEach(collectible => {
                    if (collectible.name.toLowerCase().includes(query) ||
                        collectible.source.toLowerCase().includes(query) ||
                        (collectible.year && collectible.year.toString().includes(query))) { // Added year search
                        foundCollectibles.push({ ...collectible, ownerUsername: user.username });
                    }
                });
            }
        });

        renderUserResults(foundUsers);
        renderCollectibleResults(foundCollectibles);
    });

    function renderUserResults(users) {
        // Ensure the no-results message is removed if it was the only child
        if (userResultsGrid.contains(noUserResultsMessage) && users.length > 0) {
            noUserResultsMessage.style.display = 'none';
        }

        if (users.length === 0) {
            noUserResultsMessage.textContent = "Nenhum usuário encontrado.";
            noUserResultsMessage.style.display = 'block';
        } else {
            users.forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.classList.add('user-result-item');

                const userLink = document.createElement('a');
                userLink.href = `profile.html?user=${encodeURIComponent(user.username)}`; // Link to a future profile page
                userLink.textContent = user.username;

                userDiv.appendChild(userLink);
                userResultsGrid.insertBefore(userDiv, noUserResultsMessage); // Insert before the message P
            });
        }
    }

    function renderCollectibleResults(collectibles) {
         // Ensure the no-results message is removed if it was the only child
        if (collectibleResultsGrid.contains(noCollectibleResultsMessage) && collectibles.length > 0) {
            noCollectibleResultsMessage.style.display = 'none';
        }

        if (collectibles.length === 0) {
            noCollectibleResultsMessage.textContent = "Nenhum boneco encontrado.";
            noCollectibleResultsMessage.style.display = 'block';
        } else {
            collectibles.forEach(collectible => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('collectible-result-item'); // Can be styled like .collectible-item

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
                collectibleResultsGrid.insertBefore(itemDiv, noCollectibleResultsMessage); // Insert before the message P
            });
        }
    }
});
