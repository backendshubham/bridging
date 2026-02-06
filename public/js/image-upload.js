// Image upload validation and preview

document.addEventListener('DOMContentLoaded', function() {
    const galleryInput = document.getElementById('gallery_images');
    const primaryInput = document.getElementById('primary_image');
    
    // Validate gallery images count
    if (galleryInput) {
        galleryInput.addEventListener('change', function(e) {
            const files = e.target.files;
            const maxFiles = 5;
            
            // Check existing gallery images count
            const existingCount = document.querySelectorAll('.gallery-preview img').length || 0;
            const totalCount = files.length + existingCount;
            
            if (totalCount > maxFiles) {
                alert(`Maximum ${maxFiles} gallery images allowed. You have ${existingCount} existing and tried to add ${files.length}. Please select only ${maxFiles - existingCount} image(s).`);
                e.target.value = '';
                return false;
            }
            
            // Validate file sizes (10MB each)
            for (let i = 0; i < files.length; i++) {
                if (files[i].size > 10 * 1024 * 1024) {
                    alert(`File "${files[i].name}" is too large. Maximum file size is 10MB.`);
                    e.target.value = '';
                    return false;
                }
            }
        });
    }
    
    // Validate primary image size
    if (primaryInput) {
        primaryInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.size > 10 * 1024 * 1024) {
                alert(`File "${file.name}" is too large. Maximum file size is 10MB.`);
                e.target.value = '';
                return false;
            }
        });
    }
});

