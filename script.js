/**
 * Arthur Stainmesse Photography Portfolio
 * A minimal, performance-focused photography portfolio with advanced features
 * 
 * Features:
 * - Lazy loading with Intersection Observer API
 * - Masonry-style responsive grid layout
 * - Click-to-enlarge photos with white frame
 * - Advanced tag filtering with AND logic
 * - Magnifier tool for detailed photo inspection
 * - Dynamic photo captions from filenames
 * - Keyboard navigation (ESC to close)
 * - Click-outside-to-close functionality
 * - Social links with clipboard integration
 * - Camera gear modal
 */

class PhotoGallery {
    constructor() {
        // DOM element references
        this.gallery = document.getElementById('gallery');
        this.tagSelector = document.getElementById('tagSelector');
        this.magnifier = document.getElementById('magnifier');
        this.magnifierImage = document.getElementById('magnifierImage');
        this.photoCaption = document.getElementById('photoCaption');
        
        // State management
        this.photos = [];
        this.observer = null;
        this.enlargedPhoto = null;
        this.activeTags = new Set();
        this.allTags = new Set();
        
        this.init();
    }

    /**
     * Initialize all gallery features
     */
    init() {
        this.setupIntersectionObserver();
        this.loadPhotoData();
        this.renderTagSelector();
        this.setupEventHandlers();
    }

    /**
     * Setup all event handlers in one place for better organization
     */
    setupEventHandlers() {
        this.setupKeyboardHandlers();
        this.setupEmailClipboard();
        this.setupMagnifier();
        this.setupGearModal();
        this.setupClickOutside();
    }

    // ========================================
    // PHOTO DATA AND LOADING
    // ========================================

    /**
     * Load photo data from external configuration file
     */
    loadPhotoData() {
        const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjlmOWY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJDb3VyaWVyLCBtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNjY2MiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5sb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==';
        
        // Load photos from external configuration
        this.photos = window.PHOTO_CONFIG.map(photo => ({
            ...photo,
            placeholder
        }));

        // Collect all unique tags for filtering
        this.allTags.clear();
        this.photos.forEach(photo => {
            photo.tags.forEach(tag => this.allTags.add(tag));
        });

        // Calculate aspect ratios and sort photos by width (widest first)
        this.calculateAspectRatiosAndSort();
    }

    /**
     * Asynchronously calculate aspect ratios and sort photos by width
     * This ensures proper masonry layout with widest photos first
     */
    async calculateAspectRatiosAndSort() {
        const photoPromises = this.photos.map(photo => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    photo.aspectRatio = img.width / img.height;
                    photo.width = img.width;
                    photo.height = img.height;
                    resolve(photo);
                };
                img.onerror = () => {
                    // Default to 4:3 aspect ratio if image fails to load
                    photo.aspectRatio = 1.33;
                    photo.width = 1200;
                    photo.height = 900;
                    resolve(photo);
                };
                img.src = photo.src;
            });
        });

        await Promise.all(photoPromises);
        
        // Sort by aspect ratio (widest first) for better masonry layout
        this.photos.sort((a, b) => b.aspectRatio - a.aspectRatio);
        
        this.renderGallery();
        this.updateTagCounts();
    }

    // ========================================
    // LAZY LOADING
    // ========================================

    /**
     * Setup Intersection Observer for efficient lazy loading
     */
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
    }

    /**
     * Load actual image and replace placeholder
     */
    loadImage(photoItem) {
        const img = photoItem.querySelector('img');
        const actualSrc = img.dataset.src;
        
        if (actualSrc && !img.src.includes(actualSrc)) {
            img.src = actualSrc;
            img.onload = () => {
                photoItem.classList.add('loaded');
                img.style.opacity = '1';
                // Reset height to auto once image is loaded to allow natural sizing
                img.style.height = 'auto';
                // Remove min-height once loaded
                img.style.minHeight = '0';
            };
        }
    }

    // ========================================
    // GALLERY RENDERING
    // ========================================

    /**
     * Render the photo gallery with masonry layout
     */
    renderGallery() {
        const filteredPhotos = this.getFilteredPhotos();
        
        this.gallery.innerHTML = '';
        
        filteredPhotos.forEach(photo => {
            const photoItem = this.createPhotoElement(photo);
            this.gallery.appendChild(photoItem);
            this.observer.observe(photoItem);
        });
    }

    /**
     * Create a photo element with lazy loading and proper dimensions
     */
    createPhotoElement(photo) {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.dataset.tags = photo.tags.join(',');
        
        const img = document.createElement('img');
        img.src = photo.placeholder;
        img.dataset.src = photo.src;
        img.alt = photo.alt;
        img.loading = 'lazy';
        
        // Set dimensions if available to prevent layout shift
        if (photo.width && photo.height) {
            const aspectRatio = photo.height / photo.width;
            img.style.aspectRatio = `${photo.width} / ${photo.height}`;
            // Set a reasonable height based on column width estimate
            const estimatedWidth = 400; // Approximate column width
            img.style.height = `${estimatedWidth * aspectRatio}px`;
        }
        
        photoItem.appendChild(img);
        
        // Add click handler for enlargement
        photoItem.addEventListener('click', () => this.handlePhotoClick(photoItem));
        
        return photoItem;
    }

    /**
     * Get photos filtered by active tags (AND logic)
     */
    getFilteredPhotos() {
        if (this.activeTags.size === 0) {
            return this.photos;
        }
        
        return this.photos.filter(photo => {
            return Array.from(this.activeTags).every(tag => photo.tags.includes(tag));
        });
    }

    // ========================================
    // PHOTO ENLARGEMENT
    // ========================================

    /**
     * Handle photo click for enlargement
     */
    handlePhotoClick(photoItem) {
        if (photoItem.classList.contains('enlarged')) {
            this.shrinkPhoto(photoItem);
        } else {
            // Shrink any currently enlarged photo
            if (this.enlargedPhoto) {
                this.shrinkPhoto(this.enlargedPhoto);
            }
            this.enlargePhoto(photoItem);
        }
    }

    /**
     * Enlarge photo with white frame and caption
     */
    enlargePhoto(photoItem) {
        photoItem.classList.add('enlarged');
        this.enlargedPhoto = photoItem;
        
        // Adjust positioning for very tall images
        setTimeout(() => {
            const photoRect = photoItem.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // If photo extends beyond viewport, adjust positioning
            if (photoRect.height > viewportHeight * 0.95) {
                photoItem.style.top = '5vh';
                photoItem.style.transform = 'translateX(-50%)';
                photoItem.style.maxHeight = '90vh';
            }
        }, 50);
        
        // Show caption with formatted filename after photo is fully positioned
        const img = photoItem.querySelector('img');
        if (img && img.src) {
            const caption = this.formatCaption(img.src);
            this.photoCaption.textContent = caption;
            
            // Add click handler to copy caption text
            this.photoCaption.onclick = (e) => {
                e.stopPropagation(); // Prevent photo from closing
                navigator.clipboard.writeText(caption).then(() => {
                    const originalText = this.photoCaption.textContent;
                    this.photoCaption.textContent = 'Caption copied!';
                    setTimeout(() => {
                        this.photoCaption.textContent = originalText;
                    }, 1000);
                }).catch(() => {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = caption;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                });
            };
            
            // Wait for CSS transitions to complete before positioning caption
            const showAndPositionCaption = () => {
                // Wait for the photo to be fully positioned
                if (!photoItem.classList.contains('enlarged')) {
                    return;
                }
                
                const photoRect = photoItem.getBoundingClientRect();
                const captionHeight = 40; // Approximate caption height
                const margin = 15; // Margin from photo frame
                
                // Ensure we have valid dimensions and the photo has finished animating
                if (photoRect.width === 0 || photoRect.height === 0) {
                    // Retry if dimensions aren't ready
                    setTimeout(showAndPositionCaption, 50);
                    return;
                }
                
                // Position just below the photo frame (including padding)
                let captionTop = photoRect.bottom + margin;
                
                // Ensure caption stays within viewport
                if (captionTop + captionHeight > window.innerHeight - 20) {
                    // If no space below, position above the photo frame
                    captionTop = Math.max(photoRect.top - captionHeight - margin, 20);
                }
                
                // Force the positioning and show the caption
                this.photoCaption.style.position = 'fixed';
                this.photoCaption.style.top = captionTop + 'px';
                this.photoCaption.style.left = '50%';
                this.photoCaption.style.transform = 'translateX(-50%)';
                this.photoCaption.style.zIndex = '1001';
                this.photoCaption.style.display = 'block';
            };
            
            // Wait for CSS transition to complete (enlarged photo animation is 0.3s) + extra buffer
            setTimeout(showAndPositionCaption, 500);
            
            // Also reposition on window resize or scroll
            this.repositionHandler = () => {
                if (this.photoCaption.style.display === 'block') {
                    showAndPositionCaption();
                }
            };
            window.addEventListener('resize', this.repositionHandler);
            window.addEventListener('scroll', this.repositionHandler);
        }
        
        // Smooth scroll to center the enlarged photo
        setTimeout(() => {
            photoItem.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        }, 100);
    }

    /**
     * Shrink photo back to normal size
     */
    shrinkPhoto(photoItem) {
        photoItem.classList.remove('enlarged');
        this.enlargedPhoto = null;
        this.photoCaption.style.display = 'none';
        
        // Reset any custom positioning
        photoItem.style.top = '';
        photoItem.style.transform = '';
        photoItem.style.maxHeight = '';
        
        // Clean up event listeners
        window.removeEventListener('resize', this.repositionHandler);
        window.removeEventListener('scroll', this.repositionHandler);
    }

    /**
     * Format filename into readable caption
     * Example: "crystal-blue-lake.jpg" → "Crystal Blue Lake"
     * Handles URL-encoded characters like %c3%a1 → á
     */
    formatCaption(src) {
        const filename = src.split('/').pop();
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
        
        // Decode URL-encoded characters
        const decoded = decodeURIComponent(nameWithoutExt);
        
        return decoded
            .replace(/[-_]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    // ========================================
    // TAG FILTERING
    // ========================================

    /**
     * Render tag selector with counts
     */
    renderTagSelector() {
        const sortedTags = Array.from(this.allTags).sort();
        
        this.tagSelector.innerHTML = `
            <div class="tag-filters">
                ${sortedTags.map(tag => `
                    <button class="tag-button" data-tag="${tag}">
                        <span class="tag-text">${tag}</span>
                        <span class="tag-count"></span>
                    </button>
                `).join('')}
                <button class="clear-filters" style="display: none;">clear all</button>
            </div>
        `;
        
        // Add event listeners
        this.tagSelector.querySelectorAll('.tag-button').forEach(button => {
            button.addEventListener('click', () => this.toggleTag(button.dataset.tag));
        });
        
        this.tagSelector.querySelector('.clear-filters').addEventListener('click', () => {
            this.clearAllTags();
        });
    }

    /**
     * Toggle tag selection with AND logic
     */
    toggleTag(tag) {
        if (this.activeTags.has(tag)) {
            this.activeTags.delete(tag);
        } else {
            this.activeTags.add(tag);
        }
        
        this.updateTagSelector();
        this.renderGallery();
        this.updateTagCounts();
    }

    /**
     * Clear all active tags
     */
    clearAllTags() {
        this.activeTags.clear();
        this.updateTagSelector();
        this.renderGallery();
        this.updateTagCounts();
    }

    /**
     * Update tag selector visual state
     */
    updateTagSelector() {
        const clearButton = this.tagSelector.querySelector('.clear-filters');
        const tagButtons = this.tagSelector.querySelectorAll('.tag-button');
        
        // Show/hide clear button
        clearButton.style.display = this.activeTags.size > 0 ? 'inline-block' : 'none';
        
        // Update button states
        tagButtons.forEach(button => {
            const isActive = this.activeTags.has(button.dataset.tag);
            button.classList.toggle('active', isActive);
        });
    }

    /**
     * Update tag counts based on current selection
     */
    updateTagCounts() {
        const tagButtons = this.tagSelector.querySelectorAll('.tag-button');
        
        tagButtons.forEach(button => {
            const tag = button.dataset.tag;
            const countSpan = button.querySelector('.tag-count');
            
            if (this.activeTags.size === 0) {
                // No tags selected - show total count for each tag
                const matchingPhotos = this.photos.filter(photo => photo.tags.includes(tag));
                const count = matchingPhotos.length;
                countSpan.textContent = `(${count})`;
                countSpan.style.color = '#666';
                button.querySelector('.tag-text').style.color = '#333';
            } else if (this.activeTags.has(tag)) {
                // This tag is active - show current filtered count
                const filteredPhotos = this.getFilteredPhotos();
                countSpan.textContent = `(${filteredPhotos.length})`;
                countSpan.style.color = '#fff';
            } else {
                // Calculate potential matches if this tag were added
                const potentialTags = new Set([...this.activeTags, tag]);
                const matchingPhotos = this.photos.filter(photo => {
                    return Array.from(potentialTags).every(t => photo.tags.includes(t));
                });
                
                const count = matchingPhotos.length;
                countSpan.textContent = `(${count})`;
                countSpan.style.color = count > 0 ? '#666' : '#ccc';
                button.querySelector('.tag-text').style.color = count > 0 ? '#333' : '#ccc';
            }
        });
    }

    // ========================================
    // MAGNIFIER FUNCTIONALITY
    // ========================================

    /**
     * Setup magnifier for enlarged photos (desktop only)
     */
    setupMagnifier() {
        // Skip on touch devices
        if ('ontouchstart' in window) return;

        document.addEventListener('mousemove', (e) => {
            const target = e.target.closest('.photo-item.enlarged');
            
            if (target && target.classList.contains('loaded')) {
                const img = target.querySelector('img');
                if (img && img.src && !img.src.includes('data:image/svg')) {
                    this.showMagnifier(e, target, img);
                } else {
                    this.hideMagnifier();
                }
            } else {
                this.hideMagnifier();
            }
        });
    }

    /**
     * Show magnifier with accurate positioning and scaling
     */
    showMagnifier(event, photoItem, img) {
        const imgRect = img.getBoundingClientRect();
        
        // Calculate cursor position relative to the actual image
        const x = event.clientX - imgRect.left;
        const y = event.clientY - imgRect.top;
        
        // Set magnifier image source
        if (this.magnifierImage.src !== img.src) {
            this.magnifierImage.src = img.src;
        }
        
        // Position magnifier square near cursor
        const magnifierSize = 180;
        const offset = 20;
        
        let magnifierX = event.clientX + offset;
        let magnifierY = event.clientY + offset;
        
        // Keep magnifier within viewport
        if (magnifierX + magnifierSize > window.innerWidth) {
            magnifierX = event.clientX - magnifierSize - offset;
        }
        if (magnifierY + magnifierSize > window.innerHeight) {
            magnifierY = event.clientY - magnifierSize - offset;
        }
        
        this.magnifier.style.left = magnifierX + 'px';
        this.magnifier.style.top = magnifierY + 'px';
        this.magnifier.style.display = 'block';
        
        // Calculate accurate scaling and positioning
        const xPercent = x / imgRect.width;
        const yPercent = y / imgRect.height;
        
        const scaleX = (imgRect.width / magnifierSize) * 8; // 8x zoom
        const scaleY = (imgRect.height / magnifierSize) * 8;
        
        // Set magnifier image dimensions
        this.magnifierImage.style.width = `${scaleX * magnifierSize}px`;
        this.magnifierImage.style.height = `${scaleY * magnifierSize}px`;
        
        // Position image so cursor point is centered
        const centerOffset = magnifierSize / 2;
        const translateX = centerOffset - (xPercent * scaleX * magnifierSize);
        const translateY = centerOffset - (yPercent * scaleY * magnifierSize);
        
        this.magnifierImage.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }

    /**
     * Hide magnifier
     */
    hideMagnifier() {
        this.magnifier.style.display = 'none';
    }

    // ========================================
    // EVENT HANDLERS
    // ========================================

    /**
     * Setup keyboard navigation
     */
    setupKeyboardHandlers() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close enlarged photo
                if (this.enlargedPhoto) {
                    this.shrinkPhoto(this.enlargedPhoto);
                }
                // Close gear modal
                const gearModal = document.getElementById('gearModal');
                if (gearModal && gearModal.style.display === 'block') {
                    gearModal.style.display = 'none';
                }
            }
        });
    }

    /**
     * Setup click-outside-to-close for enlarged photos
     */
    setupClickOutside() {
        document.addEventListener('click', (e) => {
            if (!this.enlargedPhoto) return;
            
            const clickedOnEnlargedPhoto = e.target.closest('.photo-item.enlarged');
            if (!clickedOnEnlargedPhoto) {
                this.shrinkPhoto(this.enlargedPhoto);
            }
        });
    }

    /**
     * Setup email clipboard functionality
     */
    setupEmailClipboard() {
        const emailLink = document.getElementById('emailLink');
        if (!emailLink) return;
        
        emailLink.addEventListener('click', async () => {
            const email = 'arthur.stainmesse@gmail.com';
            const originalText = emailLink.textContent;
            
            try {
                await navigator.clipboard.writeText(email);
                emailLink.textContent = 'email copied to clipboard';
                
                setTimeout(() => {
                    emailLink.textContent = originalText;
                }, 2000);
            } catch (err) {
                console.warn('Failed to copy email to clipboard:', err);
            }
        });
    }

    /**
     * Setup gear modal functionality
     */
    setupGearModal() {
        const gearLink = document.getElementById('gearLink');
        const gearModal = document.getElementById('gearModal');
        const gearModalClose = document.getElementById('gearModalClose');

        if (!gearLink || !gearModal || !gearModalClose) return;

        // Open modal
        gearLink.addEventListener('click', () => {
            gearModal.style.display = 'block';
        });

        // Close modal
        gearModalClose.addEventListener('click', () => {
            gearModal.style.display = 'none';
        });

        // Close on outside click
        gearModal.addEventListener('click', (e) => {
            if (e.target === gearModal) {
                gearModal.style.display = 'none';
            }
        });
    }
}

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PhotoGallery();
});