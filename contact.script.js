document.addEventListener('DOMContentLoaded', () => {
    const contactFormVisual = document.getElementById('contact-form-visual');

    if (contactFormVisual) {
        contactFormVisual.addEventListener('submit', function(event) {
            event.preventDefault();

            const feedbackP = document.getElementById('contact-form-feedback');

            // Basic validation example (can be expanded)
            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const message = document.getElementById('contact-message').value.trim();

            if (!name || !email || !message) {
                feedbackP.textContent = 'Por favor, preencha todos os campos do formulário.';
                feedbackP.className = 'error'; // Assuming .error class is defined in CSS for error messages
                feedbackP.style.color = '#D8000C'; // Fallback red
                feedbackP.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                feedbackP.style.border = '1px solid #D8000C';
                feedbackP.style.display = 'block';
                return;
            }

            // Simulate form submission
            feedbackP.textContent = 'Obrigado pelo seu contato! Sua mensagem foi "enviada". (Funcionalidade de envio real não implementada.)';
            feedbackP.className = 'success'; // Assuming .success class is defined for success messages
            feedbackP.style.color = '#28a745'; // Fallback green
            feedbackP.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
            feedbackP.style.border = '1px solid #28a745';
            feedbackP.style.display = 'block';

            contactFormVisual.reset();

            setTimeout(() => {
                if (feedbackP) { // Check if still exists
                    feedbackP.style.display = 'none';
                    feedbackP.textContent = ''; // Clear text
                    feedbackP.className = ''; // Reset classes
                }
            }, 5000); // Hide message after 5 seconds
        });
    } else {
        console.warn("Formulário de contato 'contact-form-visual' não encontrado.");
    }
});
