/**
 * Small, dependency-free color-space conversions used by the RGB(W) Shelly light devices.
 *
 * Both functions work with the ranges Shelly/ioBroker use in their states:
 *   - hue        `h` in [0, 360]
 *   - saturation `s` in [0, 100]
 *   - value      `v` in [0, 100]
 *   - r, g, b    in [0, 255]
 *
 * Adapted from the formulas at http://en.wikipedia.org/wiki/HSV_color_space.
 */

/** A red/green/blue or hue/saturation/value triple. */
export type ColorTriple = [number, number, number];

/**
 * Converts an RGB color value to HSV.
 *
 * @param r - red color value [0, 255]
 * @param g - green color value [0, 255]
 * @param b - blue color value [0, 255]
 * @returns `[hue (0-360), saturation (0-100), value (0-100)]`
 */
export function rgbToHsv(r: number, g: number, b: number): ColorTriple {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    // `h` is always assigned below before it is read, but it is initialized so the strict
    // compiler can prove it (the `switch` over `max` does not narrow to an exhaustive set).
    let h = 0;
    let s = max;
    const v = max;

    const d = max - min;
    s = !max ? 0 : d / max;

    if (max === min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}

/**
 * Converts an HSV color value to RGB.
 *
 * @param h - hue [0, 360]
 * @param s - saturation [0, 100]
 * @param v - value [0, 100]
 * @returns `[red (0-255), green (0-255), blue (0-255)]`
 */
export function hsvToRgb(h: number, s: number, v: number): ColorTriple {
    h = h / 360;
    s = s / 100;
    v = v / 100;

    // Initialized for the strict compiler; the `switch (i % 6)` below always assigns all three.
    let r = 0;
    let g = 0;
    let b = 0;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0:
            ((r = v), (g = t), (b = p));
            break;
        case 1:
            ((r = q), (g = v), (b = p));
            break;
        case 2:
            ((r = p), (g = v), (b = t));
            break;
        case 3:
            ((r = p), (g = q), (b = v));
            break;
        case 4:
            ((r = t), (g = p), (b = v));
            break;
        case 5:
            ((r = v), (g = p), (b = q));
            break;
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
