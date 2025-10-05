#!/bin/bash

# Image Compression Script using macOS sips
# This will compress images to be more web-friendly while maintaining quality
#
# Usage: ./compress-images.sh

set -e

echo "================================================"
echo "Portfolio Image Compression Script"
echo "================================================"
echo ""

# Configuration
MAX_WIDTH=2000
QUALITY=85
BACKUP_DIR="images-backup"
IMAGES_DIR="images"

# Check if images directory exists
if [ ! -d "$IMAGES_DIR" ]; then
    echo "Error: images/ directory not found"
    exit 1
fi

# Count images
TOTAL_IMAGES=$(find "$IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) | wc -l | tr -d ' ')

if [ "$TOTAL_IMAGES" -eq 0 ]; then
    echo "No JPEG images found in $IMAGES_DIR/"
    exit 1
fi

echo "Found $TOTAL_IMAGES images to process"
echo ""

# Create backup directory
echo "Creating backup directory: $BACKUP_DIR/"
mkdir -p "$BACKUP_DIR"

# Get initial size
INITIAL_SIZE=$(du -sh "$IMAGES_DIR" | cut -f1)
echo "Current total size: $INITIAL_SIZE"
echo ""

# Ask for confirmation (skip if -y flag is passed)
if [ "$1" != "-y" ]; then
    read -p "This will compress all images. Continue? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
fi

echo ""
echo "Processing images..."
echo "================================================"

PROCESSED=0

# Process each image
find "$IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) | while read img; do
    PROCESSED=$((PROCESSED + 1))
    filename=$(basename "$img")
    
    # Get original size
    original_size=$(stat -f%z "$img")
    original_size_mb=$(echo "scale=2; $original_size / 1048576" | bc)
    
    echo "[$PROCESSED/$TOTAL_IMAGES] Processing: $filename (${original_size_mb}MB)"
    
    # Backup original
    cp "$img" "$BACKUP_DIR/"
    
    # Get current dimensions
    width=$(sips -g pixelWidth "$img" | tail -n1 | awk '{print $2}')
    height=$(sips -g pixelHeight "$img" | tail -n1 | awk '{print $2}')
    
    # Resize if width exceeds MAX_WIDTH
    if [ "$width" -gt "$MAX_WIDTH" ]; then
        echo "  → Resizing from ${width}x${height} to max width $MAX_WIDTH"
        sips --resampleWidth $MAX_WIDTH "$img" > /dev/null 2>&1
    fi
    
    # Compress with quality setting
    echo "  → Compressing to ${QUALITY}% quality"
    sips --setProperty formatOptions $QUALITY "$img" > /dev/null 2>&1
    
    # Get new size
    new_size=$(stat -f%z "$img")
    new_size_mb=$(echo "scale=2; $new_size / 1048576" | bc)
    reduction=$(echo "scale=1; 100 - ($new_size * 100 / $original_size)" | bc)
    
    echo "  → New size: ${new_size_mb}MB (${reduction}% reduction)"
    echo ""
done

echo "================================================"
echo "Compression complete!"
echo ""

# Get final size
FINAL_SIZE=$(du -sh "$IMAGES_DIR" | cut -f1)
echo "Original size: $INITIAL_SIZE"
echo "Final size:    $FINAL_SIZE"
echo ""
echo "Backups saved in: $BACKUP_DIR/"
echo ""
echo "To restore originals: rm -rf $IMAGES_DIR && mv $BACKUP_DIR $IMAGES_DIR"
echo "To delete backups:    rm -rf $BACKUP_DIR"
