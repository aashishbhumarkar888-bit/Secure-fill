# Icon Generation Guide

## Prerequisites

### macOS
```bash
brew install imagemagick
```

### Ubuntu/Debian
```bash
sudo apt-get install imagemagick
```

### Windows
Use WSL or install ImageMagick from https://imagemagick.org/

## Generate Icons

```bash
cd extension/icons
bash generate-icons.sh
```

This generates:
- `icon-16.png` - Browser toolbar (16x16)
- `icon-48.png` - Extension management (48x48)
- `icon-128.png` - Chrome Web Store (128x128)

## Manual Generation

If you prefer to use online tools:

1. Visit [Convertio](https://convertio.co/svg-png/) or similar
2. Upload [icon.svg](icon.svg)
3. Set size to 16x16, convert, save as `icon-16.png`
4. Repeat for 48x48 and 128x128 sizes

## Customizing Icons

### Edit icon.svg

Open in any SVG editor:
- Figma
- Inkscape (free)
- Adobe Illustrator
- Online: https://www.svgedit.net/

### Design Guidelines

- **Simple** - Works at small sizes
- **Recognizable** - Unique and memorable
- **Consistent** - Matches brand style
- **Colors** - Use 2-3 colors max
- **Scalable** - Vector format (no pixelation)

### Icon Specifications

| Size | Use Case | Format |
|------|----------|--------|
| 16x16 | Browser toolbar | PNG |
| 48x48 | Extension list | PNG |
| 128x128 | Chrome Web Store | PNG |
| Any | Design source | SVG |

## Using Your Own Icons

1. Replace `icon.svg` with your design
2. Run `generate-icons.sh` or convert manually
3. Rebuild extension: `npm run build:extension`
4. Icons will be included in build

## Verification

Check that all PNG files exist:
```bash
ls -la extension/icons/*.png
```

Should show:
- icon-16.png
- icon-48.png
- icon-128.png

## Troubleshooting

### ImageMagick not found
```bash
# Reinstall
brew uninstall imagemagick
brew install imagemagick
```

### Permission denied
```bash
chmod +x extension/icons/generate-icons.sh
bash extension/icons/generate-icons.sh
```

### Poor quality output
- Ensure SVG is high quality
- Check ImageMagick density setting
- Try online converter for testing

---

**Created**: June 2026
