document.addEventListener('DOMContentLoaded', () => {
    const globalCollectionGrid = document.getElementById('global-collection-grid');
    const paginationControls = document.getElementById('pagination-controls');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const publicNav = document.getElementById('public-nav');

    // For header updates
    const userProfileHeaderInfoPublic = document.getElementById('user-profile-header-info-public');
    const publicHeaderProfileImage = document.getElementById('public-header-profile-image');
    const publicHeaderUsername = document.getElementById('public-header-username');

    // For inline search
    const inlineSearchForm = document.getElementById('public-inline-search-form');
    const inlineSearchQueryInput = document.getElementById('public-inline-search-query');


    let allCollectibles = [];
    let currentPage = 1;
    const itemsPerPage = 12;

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
    }

    function renderGalleryPage(pageNumber) {
        currentPage = pageNumber;
        if(globalCollectionGrid) globalCollectionGrid.innerHTML = ''; // Guard against missing element
        else { console.error("globalCollectionGrid not found for renderGalleryPage"); return; }


        if (allCollectibles.length === 0) {
            globalCollectionGrid.innerHTML = '<p style="text-align:center; color:#ccc; padding: 20px;">Ainda não há nenhum boneco na galeria global. Seja o primeiro a cadastrar!</p>';
            if (paginationControls) paginationControls.style.display = 'none';
            return;
        }

        if (paginationControls) paginationControls.style.display = 'flex';

        const startIndex = (pageNumber - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const itemsToDisplay = allCollectibles.slice(startIndex, endIndex);

        if (itemsToDisplay.length === 0 && pageNumber > 1) {
            renderGalleryPage(1);
            return;
        }

        itemsToDisplay.forEach(collectible => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('collectible-item');

            const img = document.createElement('img');
            img.src = collectible.imageUrl;
            img.alt = collectible.name;

            const nameH3 = document.createElement('h3');
            nameH3.textContent = collectible.name;

            const sourceP = document.createElement('p');
            sourceP.textContent = `Origem: ${collectible.source}`;

            const yearP = document.createElement('p');
            yearP.textContent = `Ano: ${collectible.year}`;

            const ownerP = document.createElement('p');
            ownerP.classList.add('owner-info');
            const ownerLink = document.createElement('a');
            ownerLink.href = `profile.html?user=${encodeURIComponent(collectible.ownerUsername)}`;
            ownerLink.textContent = collectible.ownerUsername;
            ownerLink.style.color = '#ffcc00';
            ownerLink.style.textDecoration = 'none';
            ownerLink.onmouseover = () => ownerLink.style.textDecoration = 'underline';
            ownerLink.onmouseout = () => ownerLink.style.textDecoration = 'none';
            ownerP.textContent = `Dono(a): `;
            ownerP.appendChild(ownerLink);

            itemDiv.appendChild(img);
            itemDiv.appendChild(nameH3);
            itemDiv.appendChild(sourceP);
            itemDiv.appendChild(yearP);
            itemDiv.appendChild(ownerP);
            globalCollectionGrid.appendChild(itemDiv);
        });

        renderPaginationControls();
    }

    function renderPaginationControls() {
        if (!paginationControls) return;
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(allCollectibles.length / itemsPerPage);

        if (totalPages <= 1) {
            paginationControls.style.display = 'none';
            return;
        }
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
        pageInfo.classList.add('page-number');
        pageInfo.classList.add('current');
        paginationControls.appendChild(pageInfo);

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Próxima';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => renderGalleryPage(currentPage + 1));
        paginationControls.appendChild(nextButton);
    }

    if (mobileMenuToggle && publicNav) {
        mobileMenuToggle.addEventListener('click', () => {
            publicNav.classList.toggle('active');
        });
    } else {
        console.warn("Mobile menu toggle or public nav not found.");
    }

    function updateUserSpecificHeader() {
        const isLoggedIn = sessionStorage.getItem('loggedIn') === 'true';

        if (!publicNav || !userProfileHeaderInfoPublic || !publicHeaderProfileImage || !publicHeaderUsername) {
            console.warn("Elementos do header público para atualização não encontrados.");
            return;
        }

        if (isLoggedIn) {
            const currentUsername = sessionStorage.getItem('currentUser');
            let users = JSON.parse(localStorage.getItem('users')) || [];
            let loggedInUser = users.find(user => user.username === currentUsername);

            publicNav.innerHTML = '';

            const myGalleryLink = document.createElement('a');
            myGalleryLink.href = 'dashboard.html';
            myGalleryLink.textContent = 'Minha Galeria';
            publicNav.appendChild(myGalleryLink);

            const searchLink = document.createElement('a');
            searchLink.href = 'search.html';
            searchLink.textContent = 'Buscar'; // This is the main search page link
            publicNav.appendChild(searchLink);

            const aboutLink = document.createElement('a');
            aboutLink.href = 'about.html';
            aboutLink.textContent = 'Sobre Nós';
            publicNav.appendChild(aboutLink);

            const contactLink = document.createElement('a');
            contactLink.href = 'contact.html';
            contactLink.textContent = 'Contato';
            publicNav.appendChild(contactLink);

            const logoutButton = document.createElement('a');
            logoutButton.href = '#';
            logoutButton.textContent = 'Logout';
            logoutButton.id = 'public-gallery-logout-btn';
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.removeItem('loggedIn');
                sessionStorage.removeItem('currentUser');
                updateUserSpecificHeader();
                window.location.href = 'public-gallery.html';
            });
            publicNav.appendChild(logoutButton);

            if (loggedInUser) {
                publicHeaderUsername.textContent = loggedInUser.username;
                if (loggedInUser.profileImageUrl) {
                    publicHeaderProfileImage.src = loggedInUser.profileImageUrl;
                } else {
                    publicHeaderProfileImage.src = 'https://via.placeholder.com/30x30.png?text=P';
                }
                userProfileHeaderInfoPublic.style.display = 'flex';
            } else {
                userProfileHeaderInfoPublic.style.display = 'none';
            }

        } else {
            userProfileHeaderInfoPublic.style.display = 'none';
            publicNav.innerHTML = `
                <a href="search.html" id="nav-search-public-link">Buscar</a>
                <a href="about.html" id="nav-about-link">Sobre Nós</a>
                <a href="contact.html" id="nav-contact-link">Contato</a>
                <a href="register.html" id="nav-register-link">Cadastre-se</a>
                <a href="login.html" id="nav-login-link">Login</a>
            `;
        }
    }

    // Inline Search Form Logic
    if (inlineSearchForm && inlineSearchQueryInput) {
        inlineSearchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const query = inlineSearchQueryInput.value.trim();
            if (query) {
                window.location.href = `search.html?query=${encodeURIComponent(query)}`;
            }
        });
    } else {
        console.warn("Formulário de busca inline não encontrado.");
    }

    // Initial Load Logic
    fetchAllCollectibles();
    if (globalCollectionGrid) { // Only render if grid exists
        renderGalleryPage(1);
    }
    updateUserSpecificHeader();
});
