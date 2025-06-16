console.log("script.js loaded - Initial check");

document.addEventListener('DOMContentLoaded', () => {
    // Check for login status
    if (sessionStorage.getItem('loggedIn') !== 'true') {
        // If not logged in, redirect to login.html
        console.log("User not logged in. Redirecting to login.html");
        window.location.href = 'login.html';
    } else {
        // If logged in, proceed with the rest of the script
        console.log("User is logged in. Initializing page content.");

        const imageUploadInput = document.getElementById('image-upload');
        const imagePreview = document.getElementById('image-preview');
        const uploadForm = document.getElementById('upload-form');
        const logoutButton = document.getElementById('logout-button');

        if (imageUploadInput && imagePreview) {
            imageUploadInput.addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file) {
                    // Create a URL for the selected file
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        imagePreview.src = e.target.result;
                        imagePreview.style.display = 'block'; // Make the preview visible
                    }
                    reader.readAsDataURL(file);
                } else {
                    // No file selected or selection cancelled
                    imagePreview.src = '#'; // Reset src
                    imagePreview.style.display = 'none'; // Hide the preview
                }
            });
        } else {
            console.error("Image upload input or preview element not found.");
        }

        if (uploadForm) {
            uploadForm.addEventListener('submit', function(event) {
                event.preventDefault();
                // In a real application, you would handle the form submission here,
                // for example, by uploading the image and other form data.
                console.log("Form submission prevented. Image data would be processed here.");
                // Optionally, you could clear the preview and reset the form
                // imagePreview.src = '#';
                // imagePreview.style.display = 'none';
                // uploadForm.reset();
            });
        } else {
            console.error("Upload form not found.");
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                // Remove the loggedIn flag from sessionStorage
                sessionStorage.removeItem('loggedIn');
                // Redirect to login.html
                console.log("User logged out. Redirecting to login.html");
                window.location.href = 'login.html';
            });
        } else {
            console.error("Logout button not found.");
        }

    } // End of else (user is logged in)
});
