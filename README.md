# Arthur Stainmesse Photography Portfolio

A minimal, performance-focused photography portfolio website built with vanilla JavaScript, featuring advanced image viewing capabilities and responsive design.

## 🌟 Features

### Core Functionality
- **Masonry Layout**: Flexible grid system that adapts to different photo aspect ratios
- **Lazy Loading**: Efficient image loading using Intersection Observer API
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Performance Optimized**: Minimal dependencies, fast loading times

### Advanced Photo Viewing
- **Click-to-Enlarge**: Photos expand with elegant white frame styling
- **Magnifier Tool**: 8x zoom magnifier for detailed photo inspection (desktop only)
- **Dynamic Captions**: Auto-generated captions from filenames (e.g., "crystal-blue-lake.jpg" → "Crystal Blue Lake")
- **Keyboard Navigation**: ESC key to close enlarged photos and modals

### Smart Filtering System
- **Tag-Based Filtering**: Organize photos by categories (landscape, urban, nature, etc.)
- **AND Logic**: Multiple tag selection for precise filtering
- **Live Count Preview**: Shows number of matching photos for tag combinations
- **One-Click Clear**: Easy filter reset functionality

### User Experience
- **Click-Outside-to-Close**: Intuitive interaction for enlarged photos
- **Social Integration**: LinkedIn, Instagram links with clipboard email functionality
- **Camera Gear Modal**: Detailed equipment list for photography enthusiasts
- **Accessibility**: ARIA labels and semantic HTML structure

## 🛠️ Technical Implementation

### Architecture
- **Vanilla JavaScript**: No frameworks or libraries for maximum performance
- **CSS Grid & Flexbox**: Modern layout techniques for responsive design
- **CSS Columns**: Masonry-style layout for optimal photo arrangement
- **Intersection Observer**: Efficient lazy loading implementation

### Performance Optimizations
- **Lazy Loading**: Images load only when entering viewport
- **Aspect Ratio Sorting**: Photos arranged by width for optimal layout
- **Efficient Event Handling**: Minimal DOM manipulation and event delegation
- **CSS-Only Animations**: Smooth transitions without JavaScript overhead

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (ES6+ features)
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Touch Device Support**: Magnifier disabled on touch devices for better UX

## 📁 Project Structure

```
portfolio/
├── index.html          # Main HTML structure
├── styles.css          # Comprehensive CSS with responsive design
├── script.js           # Photography gallery functionality
├── images/             # Photo assets directory
│   ├── photo1.jpg
│   ├── photo2.jpg
│   └── ...
├── .gitignore         # Git ignore rules
└── README.md          # Project documentation
```

## 🚀 Getting Started

### Local Development
1. Clone the repository
2. Add your photos to the `images/` directory
3. Update photo data in `script.js` (loadPhotoData method)
4. Open `index.html` in a web browser

### GitHub Pages Deployment
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Select source branch (usually `main`)
4. Your portfolio will be available at `https://username.github.io/repository-name`

### Customization
- **Photos**: Replace images in `/images/` directory
- **Tags**: Modify tag arrays in photo data
- **Styling**: Customize colors and typography in `styles.css`
- **Content**: Update title, social links, and gear list in HTML

## 🎨 Design Philosophy

### Minimalism
- Clean, distraction-free interface
- Typography-focused design using Courier Prime font
- Subtle animations and transitions
- Monochromatic color scheme with strategic use of white space

### Performance First
- No external JavaScript libraries
- Optimized image loading strategies
- Minimal CSS and JavaScript footprint
- Fast initial page load and smooth interactions

### User-Centric
- Intuitive navigation and interaction patterns
- Responsive design for all device types
- Accessibility considerations throughout
- Progressive enhancement approach

## 📱 Responsive Breakpoints

- **Large Desktop**: 1400px+ (4 columns)
- **Standard Desktop**: 1024-1399px (3 columns)
- **Tablet Landscape**: 768-1023px (2 columns)
- **Mobile Landscape**: 481-767px (2 columns)
- **Mobile Portrait**: ≤480px (1 column)

## 🔧 Browser Features Used

- **Intersection Observer API**: For lazy loading
- **CSS Grid & Flexbox**: For responsive layouts
- **CSS Columns**: For masonry layout
- **Clipboard API**: For email copying functionality
- **CSS Backdrop Filter**: For modern visual effects
- **CSS Custom Properties**: For maintainable styling

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Arthur Stainmesse**
- LinkedIn: [@arthur-stainmesse](https://www.linkedin.com/in/arthur-stainmesse/)
- Instagram: [@only_yokur](https://www.instagram.com/only_yokur/)
- Email: arthur.stainmesse@gmail.com

---

Built with ❤️ for photography enthusiasts who appreciate clean, minimal design and optimal performance.