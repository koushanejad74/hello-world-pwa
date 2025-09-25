#!/bin/bash

# PWA Icon Generator Script
# This script generates PWA icons in various sizes from a source image

echo "🎨 PWA Icon Generator"
echo "===================="

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Installing..."
    
    # Try to install ImageMagick based on the system
    if command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y imagemagick
    elif command -v yum &> /dev/null; then
        sudo yum install -y ImageMagick
    elif command -v brew &> /dev/null; then
        brew install imagemagick
    else
        echo "❌ Could not install ImageMagick automatically."
        echo "Please install ImageMagick manually and run this script again."
        echo ""
        echo "For Ubuntu/Debian: sudo apt install imagemagick"
        echo "For CentOS/RHEL: sudo yum install ImageMagick"
        echo "For macOS: brew install imagemagick"
        exit 1
    fi
fi

# Icon sizes needed for PWA
declare -a sizes=("32" "72" "96" "128" "144" "152" "192" "384" "512")

# Create a simple colored square as base icon if no source image is provided
echo "🎯 Creating base icon..."
convert -size 512x512 xc:"#2196F3" -fill white -gravity center -pointsize 200 -annotate +0+0 "🌍" base_icon.png

echo "📱 Generating PWA icons..."

# Generate all required icon sizes
for size in "${sizes[@]}"
do
    echo "Creating ${size}x${size} icon..."
    convert base_icon.png -resize ${size}x${size} "icons/icon-${size}x${size}.png"
done

# Create favicon
echo "🔗 Creating favicon..."
convert base_icon.png -resize 32x32 "icons/favicon.ico"

# Clean up
rm base_icon.png

echo "✅ All icons generated successfully!"
echo ""
echo "Generated icons:"
ls -la icons/
echo ""
echo "🚀 Your PWA is ready! Open index.html in a web browser to test."
echo "💡 For best results, serve the files from a local web server:"
echo "   python3 -m http.server 8000"
echo "   or"
echo "   npx serve ."
