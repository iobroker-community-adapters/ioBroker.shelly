# Device Icon Format

This document describes the format requirements for device icons stored under `external/device-icons/`.

## Format Specification

| Property | Value |
|----------|-------|
| Format | PNG |
| Size | 80 × 80 pixels |
| Pixel format | 32-bit ARGB (alpha channel required) |
| Background | **Transparent** |
| Aspect ratio | Source image aspect ratio preserved; centered within 80×80 canvas |
| Color depth | True color (no palette) |

## Directory Structure

Icons are organized in subdirectories matching the source pictures in `external/device-pictures/`:

```
external/device-icons/
├── Gen1/           ← Gen1 (ESP8266) devices
├── Gen2/           ← Gen2 (Plus/Mini/Pro) devices
├── Gen3/           ← Gen3 devices
├── Gen4/           ← Gen4 devices
├── poweredbyshelly/← Powered by Shelly / By Shelly devices
├── ble/            ← Shelly BLE devices
├── add-ons/        ← Add-on modules
└── android-devices/← Shelly Android / Wall Display devices
```

## Naming Convention

Icon filenames match the source picture filename (without extension) plus `.png`:
- `shellyi4g4.jpg` → `shellyi4g4.png`

Filenames correspond to the adapter device ID as used in `src/lib/devices/<gen>/*.ts`.

## Conversion Process

Source: `external/device-pictures/<subdir>/<deviceId>.<ext>`
Target: `external/device-icons/<subdir>/<deviceId>.png`

**Steps:**
1. Load source image into a 32bpp ARGB bitmap
2. **Transparency check:** scan all pixels — if ANY pixel has alpha < 255, the source already has a transparent background → skip steps 3–4 entirely and proceed directly to resize
3. *(Opaque sources only)* Detect background color from the first opaque corner pixel (top-left preferred)
4. *(Opaque sources only)* BFS flood-fill from all 4 corners: replace pixels within color distance ≤ 2 of the background color with full transparency
5. Resize result to fit within 80×80 while maintaining aspect ratio (HighQualityBicubic interpolation)
6. Center on a new 80×80 transparent canvas
7. Save as PNG

**Rule:** Background removal is applied **only** when the source has no transparency. This avoids destroying icons whose source images already have clean transparent backgrounds (e.g., Shelly PNG renders). JPEG sources always get background removal (JPEG format cannot store alpha).

**Color distance** is computed as `max(|ΔR|, |ΔG|, |ΔB|)` (Chebyshev distance), tolerance = 10. This removes drop shadows and anti-aliased background edges while preserving white product bodies (whose surface pixels typically differ from background by more than 10 units due to lighting/shading).

## Regenerating Icons

Use the PowerShell script with inline C# (LockBits-based for performance):

```
scratchpad/convert-to-icons-fast.ps1
```

Key parameters:
- `$iconSize = 80`
- `$tolerance = 10`  ← removes drop shadows and anti-aliased edges without eating into white product bodies
- Source root: `external/device-pictures/`
- Destination root: `external/device-icons/`

## Reference

The icon style matches `external/archive/admin-icons-v0/` (67 hand-crafted reference icons, all 80×80 ARGB PNG).
