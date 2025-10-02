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
     * Load photo data with metadata and tags
     */
    loadPhotoData() {
        const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjlmOWY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJDb3VyaWVyLCBtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNjY2MiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5sb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==';
        
        this.photos = [
            { id: 1, src: 'images/photo1.jpg', alt: 'Photography by Arthur Stainmesse', tags: ['landscape', 'nature'], placeholder },
            { id: 2, src: 'images/photo2.jpg', alt: 'Photography by Arthur Stainmesse', tags: ['urban', 'architecture'], placeholder },
            { id: 3, src: 'images/photo3.jpg', alt: 'Photography by Arthur Stainmesse', tags: ['nature', 'water'], placeholder },
            { id: 4, src: 'images/photo4.jpg', alt: 'Photography by Arthur Stainmesse', tags: ['landscape', 'mountains'], placeholder },
            { id: 5, src: 'images/photo5.jpg', alt: 'Photography by Arthur Stainmesse', tags: ['urban', 'street'], placeholder },
            { id: 6, src: 'images/photo6.jpg', alt: 'Photography by Arthur Stainmesse', tags: ['nature', 'forest'], placeholder },
            { id: 7, src: 'images/photo7.jpg', alt: 'Photography by Arthur Stainmesse', tags: ['landscape', 'sunset'], placeholder },
            { id: 8, src: 'images/photo8.jpg', alt: 'Photography by Arthur Stainmesse', tags: ['urban', 'night'], placeholder },
            { id: 9, src: 'images/photo9.jpg', alt: 'Photography by Arthur Stainmesse', tags: ['nature', 'wildlife'], placeholder },
            { id: 10, src: 'images/photo10.jpg', alt: 'Photography by Arthur Stainmesse', tags: ['landscape', 'ocean'], placeholder },
            { id: 11, src: 'images/photo11.jpg', alt: 'Photography by Arthur Stainmesse', tags: ['urban', 'architecture'], placeholder },
            { id: 12, src: 'images/photo12.jpg', alt: 'Photography by Arthur Stainmesse', tags: ['nature', 'flowers'], placeholder },
            { id: 13, src: 'images/photo13.jpg', alt: 'Photography by Arthur Stainmesse', tags: ['portrait', 'vertical'], placeholder }
        ];

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
     * Create a photo element with lazy loading
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
        
        // Show caption with formatted filename
        const img = photoItem.querySelector('img');
        if (img && img.src) {
            const caption = this.formatCaption(img.src);
            this.photoCaption.textContent = caption;
            this.photoCaption.style.display = 'block';
            
            // Position caption below the enlarged photo
            setTimeout(() => {
                const photoRect = photoItem.getBoundingClientRect();
                this.photoCaption.style.top = (photoRect.bottom + 10) + 'px';
            }, 50);
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
    }

    /**
     * Format filename into readable caption
     * Example: "crystal-blue-lake.jpg" → "Crystal Blue Lake"
     */
    formatCaption(src) {
        const filename = src.split('/').pop();
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
        
        return nameWithoutExt
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