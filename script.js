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
        this.activeYears = new Set();
        this.allYears = new Set();
        
        this.init();
    }

    /**
     * Initialize all gallery features
     */
    init() {
        this.setupIntersectionObserver();
        this.loadPhotoData();
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
        this.setupResizeHandler();
    }
    
    /**
     * Setup window resize handler to re-render gallery on column count change
     */
    setupResizeHandler() {
        let currentColumnCount = this.getColumnCount();
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newColumnCount = this.getColumnCount();
                if (newColumnCount !== currentColumnCount) {
                    currentColumnCount = newColumnCount;
                    this.renderGallery();
                }
            }, 250);
        });
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
        // Use thumbnail for gallery display, full image (src) for enlarged view
        this.photos = window.PHOTO_CONFIG.map(photo => ({
            ...photo,
            placeholder,
            // Store full image path separately for enlarged view
            fullImage: photo.src,
            // Use thumbnail for gallery display
            src: photo.thumbnail
        }));

        // Collect all unique tags and years for filtering
        this.allTags.clear();
        this.allYears.clear();
        this.photos.forEach(photo => {
            photo.tags.forEach(tag => this.allTags.add(tag));
            if (photo.year) {
                this.allYears.add(photo.year);
            }
        });

        // Calculate aspect ratios and sort photos by number of tags
        this.calculateAspectRatiosAndSort();
    }

    /**
     * Sort photos by number of tags and render gallery
     * All images use default dimensions initially - actual dimensions load on-demand
     */
    async calculateAspectRatiosAndSort() {
        // Sort by number of tags (most tags first)
        this.photos.sort((a, b) => b.tags.length - a.tags.length);
        
        // Set default dimensions for all photos - no pre-loading
        this.photos.forEach(photo => {
            if (!photo.aspectRatio) {
                photo.aspectRatio = 1.33; // Default 4:3 aspect ratio
                photo.width = 1200;
                photo.height = 900;
            }
        });
        
        // Render tag selector now that we have all tags and years
        this.renderTagSelector();
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
            rootMargin: '200px', // Load images 200px before they enter viewport
            threshold: 0.01
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
        
        // Check if already loaded or loading
        if (!actualSrc || img.src.includes(actualSrc) || img.dataset.loading === 'true') {
            return;
        }
        
        // Mark as loading to prevent duplicate requests
        img.dataset.loading = 'true';
        
        // Create a new image to load in background
        const tempImg = new Image();
        
        tempImg.onload = () => {
            // Update actual dimensions once loaded
            const photo = this.photos.find(p => p.src === actualSrc);
            if (photo && !photo.dimensionsLoaded) {
                photo.aspectRatio = tempImg.width / tempImg.height;
                photo.width = tempImg.width;
                photo.height = tempImg.height;
                photo.dimensionsLoaded = true;
                
                // Update aspect ratio on the img element
                img.style.aspectRatio = `${photo.aspectRatio}`;
            }
            
            // Swap to actual image
            img.src = actualSrc;
            photoItem.classList.add('loaded');
            img.style.opacity = '1';
            delete img.dataset.loading;
        };
        
        tempImg.onerror = () => {
            // Still try to load the image even if temp load fails
            img.src = actualSrc;
            delete img.dataset.loading;
        };
        
        tempImg.src = actualSrc;
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
        
        // Create columns for masonry layout
        const columnCount = this.getColumnCount();
        const columns = Array.from({ length: columnCount }, () => {
            const column = document.createElement('div');
            column.className = 'gallery-column';
            return column;
        });
        
        // Track column heights for balanced distribution
        const columnHeights = Array(columnCount).fill(0);
        
        // Distribute photos to shortest column for balanced layout
        filteredPhotos.forEach((photo) => {
            const photoItem = this.createPhotoElement(photo);
            
            // Find the shortest column
            const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
            
            // Add photo to shortest column
            columns[shortestColumnIndex].appendChild(photoItem);
            
            // Update column height (using aspect ratio as proxy for height)
            if (photo.aspectRatio) {
                columnHeights[shortestColumnIndex] += 1 / photo.aspectRatio;
            } else {
                columnHeights[shortestColumnIndex] += 1.33; // Default aspect ratio
            }
            
            this.observer.observe(photoItem);
        });
        
        // Append columns to gallery
        columns.forEach(column => this.gallery.appendChild(column));
    }
    
    /**
     * Get number of columns based on viewport width
     */
    getColumnCount() {
        const width = window.innerWidth;
        if (width >= 1400) return 3;
        if (width >= 768) return 2;
        return 1;
    }

    /**
     * Create a photo element with lazy loading and proper dimensions
     */
    createPhotoElement(photo) {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.dataset.tags = photo.tags.join(',');
        photoItem.dataset.year = photo.year || '';
        
        const img = document.createElement('img');
        img.src = photo.placeholder;
        img.dataset.src = photo.src;
        img.alt = photo.alt;
        
        // Set aspect ratio to prevent layout shift, but let width determine height
        if (photo.aspectRatio) {
            img.style.aspectRatio = `${photo.aspectRatio}`;
        }
        
        photoItem.appendChild(img);
        
        // Add click handler for enlargement
        photoItem.addEventListener('click', () => this.handlePhotoClick(photoItem));
        
        return photoItem;
    }

    /**
     * Get photos filtered by active tags and years (AND logic)
     */
    getFilteredPhotos() {
        if (this.activeTags.size === 0 && this.activeYears.size === 0) {
            return this.photos;
        }
        
        return this.photos.filter(photo => {
            const tagsMatch = this.activeTags.size === 0 || 
                Array.from(this.activeTags).every(tag => photo.tags.includes(tag));
            const yearsMatch = this.activeYears.size === 0 || 
                this.activeYears.has(photo.year);
            return tagsMatch && yearsMatch;
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
        
        // Load full-resolution image when enlarging
        const img = photoItem.querySelector('img');
        const thumbnailSrc = img.dataset.src || img.src;
        
        // Find the photo data to get full image path
        const photo = this.photos.find(p => p.src === thumbnailSrc);
        if (photo && photo.fullImage && !img.dataset.fullImageLoaded) {
            // Load full-resolution image
            const fullImg = new Image();
            fullImg.onload = () => {
                img.src = photo.fullImage;
                img.dataset.fullImageLoaded = 'true';
            };
            fullImg.src = photo.fullImage;
        }
        
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
        const sortedYears = Array.from(this.allYears).sort((a, b) => b - a); // Newest first
        
        this.tagSelector.innerHTML = `
            <div class="tag-filters">
                ${sortedYears.length > 0 ? `
                    <div class="year-filters">
                        ${sortedYears.map(year => `
                            <button class="year-button" data-year="${year}">
                                <span class="year-text">${year}</span>
                                <span class="year-count"></span>
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
                ${sortedTags.map(tag => `
                    <button class="tag-button" data-tag="${tag}">
                        <span class="tag-text">${tag}</span>
                        <span class="tag-count"></span>
                    </button>
                `).join('')}
                <button class="clear-filters" style="display: none;">clear all</button>
            </div>
        `;
        
        // Add event listeners for tags
        this.tagSelector.querySelectorAll('.tag-button').forEach(button => {
            button.addEventListener('click', () => this.toggleTag(button.dataset.tag));
        });
        
        // Add event listeners for years
        this.tagSelector.querySelectorAll('.year-button').forEach(button => {
            button.addEventListener('click', () => this.toggleYear(parseInt(button.dataset.year)));
        });
        
        this.tagSelector.querySelector('.clear-filters').addEventListener('click', () => {
            this.clearAllFilters();
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
     * Toggle year selection
     */
    toggleYear(year) {
        if (this.activeYears.has(year)) {
            this.activeYears.delete(year);
        } else {
            this.activeYears.add(year);
        }
        
        this.updateTagSelector();
        this.renderGallery();
        this.updateTagCounts();
    }

    /**
     * Clear all active tags and years
     */
    clearAllFilters() {
        this.activeTags.clear();
        this.activeYears.clear();
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
        const yearButtons = this.tagSelector.querySelectorAll('.year-button');
        
        // Show/hide clear button
        clearButton.style.display = (this.activeTags.size > 0 || this.activeYears.size > 0) ? 'inline-block' : 'none';
        
        // Update tag button states
        tagButtons.forEach(button => {
            const isActive = this.activeTags.has(button.dataset.tag);
            button.classList.toggle('active', isActive);
        });
        
        // Update year button states
        yearButtons.forEach(button => {
            const year = parseInt(button.dataset.year);
            const isActive = this.activeYears.has(year);
            button.classList.toggle('active', isActive);
        });
    }

    /**
     * Update tag and year counts based on current selection
     */
    updateTagCounts() {
        const tagButtons = this.tagSelector.querySelectorAll('.tag-button');
        const yearButtons = this.tagSelector.querySelectorAll('.year-button');
        
        // Update tag counts
        tagButtons.forEach(button => {
            const tag = button.dataset.tag;
            const countSpan = button.querySelector('.tag-count');
            
            if (this.activeTags.size === 0 && this.activeYears.size === 0) {
                // No filters selected - show total count for each tag
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
                    const tagsMatch = Array.from(potentialTags).every(t => photo.tags.includes(t));
                    const yearsMatch = this.activeYears.size === 0 || this.activeYears.has(photo.year);
                    return tagsMatch && yearsMatch;
                });
                
                const count = matchingPhotos.length;
                countSpan.textContent = `(${count})`;
                countSpan.style.color = count > 0 ? '#666' : '#ccc';
                button.querySelector('.tag-text').style.color = count > 0 ? '#333' : '#ccc';
            }
        });
        
        // Update year counts
        yearButtons.forEach(button => {
            const year = parseInt(button.dataset.year);
            const countSpan = button.querySelector('.year-count');
            
            if (this.activeTags.size === 0 && this.activeYears.size === 0) {
                // No filters selected - show total count for each year
                const matchingPhotos = this.photos.filter(photo => photo.year === year);
                const count = matchingPhotos.length;
                countSpan.textContent = `(${count})`;
                countSpan.style.color = '#666';
                button.querySelector('.year-text').style.color = '#333';
            } else if (this.activeYears.has(year)) {
                // This year is active - show current filtered count
                const filteredPhotos = this.getFilteredPhotos();
                countSpan.textContent = `(${filteredPhotos.length})`;
                countSpan.style.color = '#fff';
            } else {
                // Calculate potential matches if this year were added
                const potentialYears = new Set([...this.activeYears, year]);
                const matchingPhotos = this.photos.filter(photo => {
                    const tagsMatch = this.activeTags.size === 0 || 
                        Array.from(this.activeTags).every(t => photo.tags.includes(t));
                    const yearsMatch = potentialYears.has(photo.year);
                    return tagsMatch && yearsMatch;
                });
                
                const count = matchingPhotos.length;
                countSpan.textContent = `(${count})`;
                countSpan.style.color = count > 0 ? '#666' : '#ccc';
                button.querySelector('.year-text').style.color = count > 0 ? '#333' : '#ccc';
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
        
        // Set magnifier image source - use full resolution if available
        const thumbnailSrc = img.dataset.src || img.src;
        const photo = this.photos.find(p => p.src === thumbnailSrc);
        const magnifierSrc = (photo && photo.fullImage && img.dataset.fullImageLoaded) ? photo.fullImage : img.src;
        
        if (this.magnifierImage.src !== magnifierSrc) {
            this.magnifierImage.src = magnifierSrc;
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