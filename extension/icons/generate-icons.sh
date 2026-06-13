#!/bin/bash
# Generate PNG icons from SVG using ImageMagick
# Usage: bash generate-icons.sh

# Install ImageMagick if needed
# Mac: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick
# Windows: choco install imagemagick

INPUT_SVG="extension/icons/icon.svg"
OUTPUT_DIR="extension/icons"

# Generate icons at different sizes
echo "Generating extension icons..."

# 16x16 (browser toolbar)
convert -density 384 -resize 16x16 "$INPUT_SVG" "$OUTPUT_DIR/icon-16.png"
echo "✓ Created icon-16.png"

# 48x48 (extension management)
convert -density 384 -resize 48x48 "$INPUT_SVG" "$OUTPUT_DIR/icon-48.png"
echo "✓ Created icon-48.png"

# 128x128 (Chrome Web Store)
convert -density 384 -resize 128x128 "$INPUT_SVG" "$OUTPUT_DIR/icon-128.png"
echo "✓ Created icon-128.png"

echo "✅ All icons generated successfully!"
