console.log("script.js loaded");

document.addEventListener('DOMContentLoaded', () => {
    const imageUploadInput = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const uploadForm = document.getElementById('upload-form');

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
});
