#!/bin/bash

# Image Optimization Script for Portfolio
# This script helps optimize images for web performance
# 
# Prerequisites:
# - Install ImageMagick: brew install imagemagick
# - Or use online tools like TinyPNG, Squoosh, or ImageOptim
#
# Usage: ./optimize-images.sh

echo "Portfolio Image Optimization Helper"
echo "===================================="
echo ""
echo "This script will help you optimize images for better performance."
echo ""
echo "Recommended optimizations:"
echo "1. Resize images to max 2000px width (for high-res displays)"
echo "2. Compress to 80-85% quality"
echo "3. Convert to WebP format for better compression"
echo ""
echo "Current image sizes:"
du -sh images/

echo ""
echo "To optimize with ImageMagick (if installed):"
echo "  mkdir -p images-optimized"
echo "  for img in images/*.jpg images/*.JPG; do"
echo "    convert \"\$img\" -resize '2000x2000>' -quality 85 \"images-optimized/\$(basename \"\$img\")\""
echo "  done"
echo ""
echo "Alternative: Use online tools"
echo "  - TinyPNG: https://tinypng.com/ (batch upload)"
echo "  - Squoosh: https://squoosh.app/ (one by one, best quality)"
echo "  - ImageOptim: https://imageoptim.com/mac (Mac app)"
echo ""
echo "After optimization, replace images/ folder with optimized versions"
