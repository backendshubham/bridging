// Image upload validation and preview

document.addEventListener('DOMContentLoaded', function() {
    const galleryInput = document.getElementById('gallery_images');
    const primaryInput = document.getElementById('primary_image');
    const primaryPreviewContainer = document.getElementById('primary_preview_container');
    const primaryPreviewImage = document.getElementById('primary_preview_image');
    const galleryPreviewContainer = document.getElementById('gallery_preview_container');
    const galleryInfoLine = document.getElementById('gallery_new_selection_info');
    
    // Primary image preview and validation
    if (primaryInput) {
        primaryInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Size validation (10MB)
                if (file.size > 10 * 1024 * 1024) {
                    alert(`File "${file.name}" is too large. Maximum file size is 10MB.`);
                    e.target.value = '';
                    return false;
                }
                
                // Preview logic
                const reader = new FileReader();
                reader.onload = function(event) {
                    if (primaryPreviewImage) {
                        primaryPreviewImage.src = event.target.result;
                        primaryPreviewContainer.style.display = 'block';
                        // Add a border highlight to show it's a new preview
                        primaryPreviewImage.style.borderColor = 'var(--admin-gold)';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Gallery images preview and validation
    if (galleryInput) {
        galleryInput.addEventListener('change', function(e) {
            const files = e.target.files;
            const maxFiles = 5;
            
            if (files.length > maxFiles) {
                alert(`Maximum ${maxFiles} gallery images allowed total.`);
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

            if (files.length > 0) {
                // Show info line if updating existing item
                if (galleryInfoLine) {
                    galleryInfoLine.style.display = 'block';
                    galleryInfoLine.textContent = `New selection of ${files.length} image(s) will replace the existing gallery upon saving.`;
                }
                
                // Clear existing previews for new selection
                if (galleryPreviewContainer) {
                    galleryPreviewContainer.innerHTML = '';
                    galleryPreviewContainer.style.display = 'grid';
                    
                    Array.from(files).forEach((file, index) => {
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            const item = document.createElement('div');
                            item.className = 'gallery-preview-item';
                            item.innerHTML = `
                                <div style="position: relative;">
                                    <img src="${event.target.result}" alt="Gallery preview" style="width: 100%; height: 80px; object-fit: cover; border-radius: var(--r-sm); border: 2px solid var(--admin-gold); box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                    <span style="position: absolute; top: -5px; right: -5px; background: var(--admin-gold); color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                        ${index + 1}
                                    </span>
                                </div>
                            `;
                            galleryPreviewContainer.appendChild(item);
                        };
                        reader.readAsDataURL(file);
                    });
                }
            }
        });
    }
});
