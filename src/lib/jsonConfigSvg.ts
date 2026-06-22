// Build-time helper: convert the SVG files in /icons to base64 data URLs and store them in
// admin/jsonConfig.json. Run via `npm run update-svg` (which builds first, then runs the
// compiled build/lib/jsonConfigSvg.js). Paths are resolved relative to the repository root so
// the script works regardless of the current working directory.
import * as fs from 'node:fs';
import * as path from 'node:path';

// build/lib/jsonConfigSvg.js -> repository root is two levels up.
const root = path.join(__dirname, '..', '..');
const jsonConfigPath = path.join(root, 'admin', 'jsonConfig.json');
const iconsDir = path.join(root, 'icons');

const jsonConfig = JSON.parse(fs.readFileSync(jsonConfigPath, 'utf8'));
let changed = false;

/**
 * Recursively walks a jsonConfig (sub)tree and assigns the given base64 icon to every matching
 * node. A node matches when its key equals `name`, or when its key equals `_${name}` and it
 * already has an `icon` that differs from `base64icon`. The `config` object is mutated in place.
 *
 * @param config - the jsonConfig node (or the whole document) to walk and mutate
 * @param name - the config/icon key to match (the SVG file name without its `.svg` extension)
 * @param base64icon - the `data:image/svg+xml;base64,…` data URL to assign to matching nodes
 * @returns `true` if at least one node's icon was changed, otherwise `false`
 */
function updateConfig(config: any, name: string, base64icon: string): boolean {
    let didChange = false;
    for (const key in config) {
        if (typeof config[key] === 'object' && config[key] !== null) {
            if (key === name || (key === `_${name}` && config[key].icon && config[key].icon !== base64icon)) {
                didChange = true;
                config[key].icon = base64icon;
            }
            didChange = updateConfig(config[key], name, base64icon) || didChange;
        }
    }
    return didChange;
}

for (const file of fs.readdirSync(iconsDir)) {
    if (file.endsWith('.svg')) {
        const svg = fs.readFileSync(path.join(iconsDir, file), 'utf8');
        const base64 = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
        if (updateConfig(jsonConfig, file.replace('.svg', ''), base64)) {
            changed = true;
        }
    }
}

if (changed) {
    fs.writeFileSync(jsonConfigPath, JSON.stringify(jsonConfig, null, 4));
}
