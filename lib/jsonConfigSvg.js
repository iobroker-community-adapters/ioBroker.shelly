// convert SVG to base64 and store it in admin/jsonConfig.json
const fs = require('node:fs');
const jsonConfig = require('../admin/jsonConfig.json');
let changed = false;

function updateConfig(config, name, base64icon, changed) {
    changed = changed || false;
    for (const key in config) {
        if (typeof config[key] === 'object') {
            if (key === name || key === `_${name}` && config[key].icon && config[key].icon !== base64icon) {
                changed = true;
                config[key].icon = base64icon;
            }
            changed = updateConfig(config[key], name, base64icon, changed) || changed;
        }
    }
    return changed;
}

fs.readdirSync('../icons').forEach(file => {
    if (file.endsWith('.svg')) {
        const svg = fs.readFileSync(`../icons/${file}`, 'utf8');
        const base64 = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
        if (updateConfig(jsonConfig, file.replace('.svg', ''), base64)) {
            changed = true;
        }
    }
});

if (changed) {
    fs.writeFileSync('../admin/jsonConfig.json', JSON.stringify(jsonConfig, null, 4));
}
