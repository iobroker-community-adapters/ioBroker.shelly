'use strict';

// Defaults
const defaultsgen1 = require('./devices/default').defaultsgen1;
const defaultsgen2 = require('./devices/default').defaultsgen2;
const defaultsgen3 = require('./devices/default').defaultsgen3;

// Gen 1
const shelly1 = require('./devices/gen1/shelly1').shelly1;
const shelly1pm = require('./devices/gen1/shelly1pm').shelly1pm;
const shelly1l = require('./devices/gen1/shelly1l').shelly1l;
const shellyswitch = require('./devices/gen1/shellyswitch').shellyswitch;
const shellyswitch25 = require('./devices/gen1/shellyswitch25').shellyswitch25;
const shellyht = require('./devices/gen1/shellyht').shellyht;
const shellysmoke = require('./devices/gen1/shellysmoke').shellysmoke;
const shellybulb = require('./devices/gen1/shellybulb').shellybulb;
const shellyrgbw2 = require('./devices/gen1/shellyrgbw2').shellyrgbw2;
const shelly2led = require('./devices/gen1/shelly2led').shelly2led;
const shellyplug = require('./devices/gen1/shellyplug').shellyplug;
const shellyplugs = require('./devices/gen1/shellyplugs').shellyplugs;
const shelly4pro = require('./devices/gen1/shelly4pro').shelly4pro;
const shellysense = require('./devices/gen1/shellysense').shellysense;
const shellyem = require('./devices/gen1/shellyem').shellyem;
const shellyem3 = require('./devices/gen1/shellyem3').shellyem3;
const shellyflood = require('./devices/gen1/shellyflood').shellyflood;
const shellydimmer = require('./devices/gen1/shellydimmer').shellydimmer;
const shellydimmer2 = require('./devices/gen1/shellydimmer2').shellydimmer2;
const shellydw = require('./devices/gen1/shellydw').shellydw;
const shellydw2 = require('./devices/gen1/shellydw2').shellydw2;
const shellybulbduo = require('./devices/gen1/shellybulbduo').shellybulbduo;
const shellyvintage = require('./devices/gen1/shellyvintage').shellyvintage;
const shellyix3 = require('./devices/gen1/shellyix3').shellyix3;
const shellybutton1 = require('./devices/gen1/shellybutton1').shellybutton1;
const shellygas = require('./devices/gen1/shellygas').shellygas;
const shellyuni = require('./devices/gen1/shellyuni').shellyuni;
const shellycolorbulb = require('./devices/gen1/shellycolorbulb').shellycolorbulb;
const shellymotionsensor = require('./devices/gen1/shellymotionsensor').shellymotionsensor;
const shellymotion2 = require('./devices/gen1/shellymotion2').shellymotion2;
const shellytrv = require('./devices/gen1/shellytrv').shellytrv;

// Gen 2
const shellyplus1 = require('./devices/gen2/shellyplus1').shellyplus1;
const shellyplus1pm = require('./devices/gen2/shellyplus1pm').shellyplus1pm;
const shellyplus2pm = require('./devices/gen2/shellyplus2pm').shellyplus2pm;
const shellyplusi4 = require('./devices/gen2/shellyplusi4').shellyplusi4;
const shellyplus010v = require('./devices/gen2/shellyplus010v').shellyplus010v;
const shellypro1 = require('./devices/gen2/shellypro1').shellypro1;
const shellypro1pm = require('./devices/gen2/shellypro1pm').shellypro1pm;
const shellypro2 = require('./devices/gen2/shellypro2').shellypro2;
const shellypro2pm = require('./devices/gen2/shellypro2pm').shellypro2pm;
const shellypro3 = require('./devices/gen2/shellypro3').shellypro3;
const shellypro4pm = require('./devices/gen2/shellypro4pm').shellypro4pm;
const shellypro3em = require('./devices/gen2/shellypro3em').shellypro3em;
const shellypro2cover = require('./devices/gen2/shellypro2cover').shellypro2cover;
const shellyprodm1pm = require('./devices/gen2/shellyprodm1pm').shellyprodm1pm;
const shellyprodm2pm = require('./devices/gen2/shellyprodm2pm').shellyprodm2pm;
const shellyproem50 = require('./devices/gen2/shellyproem50').shellyproem50;
const shellyplusht = require('./devices/gen2/shellyplusht').shellyplusht;
const shellyplussmoke = require('./devices/gen2/shellyplussmoke').shellyplussmoke;
const shellyblugw = require('./devices/gen2/shellyblugw').shellyblugw;
const shellyplusplugs = require('./devices/gen2/shellyplusplugs').shellyplusplugs;
const shellypmmini = require('./devices/gen2/shellypmmini').shellypmmini;
const shelly1mini = require('./devices/gen2/shelly1mini').shelly1mini;
const shelly1pmmini = require('./devices/gen2/shelly1pmmini').shelly1pmmini;
const shellyplusuni = require('./devices/gen2/shellyplusuni').shellyplusuni;
const shellywalldisplay = require('./devices/gen2/shellywalldisplay').shellywalldisplay;
const shellyplusrgbwpm = require('./devices/gen2/shellyplusrgbwpm').shellyplusrgbwpm;

// Gen 3
const shelly1minig3 = require('./devices/gen3/shelly1minig3').shelly1minig3;
const shelly1pmminig3 = require('./devices/gen3/shelly1pmminig3').shelly1pmminig3;
const shellypmminig3 = require('./devices/gen3/shellypmminig3').shellypmminig3;
const shellyhtg3 = require('./devices/gen3/shellyhtg3').shellyhtg3;
const shelly1pmg3 = require('./devices/gen3/shelly1pmg3').shelly1pmg3;
const shelly1g3 = require('./devices/gen3/shelly1g3').shelly1g3;
const shelly2pmg3 = require('./devices/gen3/shelly2pmg3').shelly2pmg3;


const devices = {
    // Gen 1
    shellyswitch,
    shellyswitch25,
    shelly1,
    shelly1pm,
    shelly1l,
    shellyht,
    shellysmoke,
    shellybulb,
    shellyrgbw2,
    shelly2led,
    shellyplug,
    shelly4pro,
    shellysense,
    'shellyplug-s': shellyplugs,
    shellyem,
    shellyem3,
    shellyflood,
    shellydimmer,
    shellydw,
    shellydw2,
    ShellyBulbDuo: shellybulbduo,
    ShellyVintage: shellyvintage,
    shellyix3,
    shellybutton1,
    shellygas,
    shellydimmer2,
    shellyuni,
    shellycolorbulb,
    shellymotionsensor,
    shellymotion2,
    shellytrv,
    // Gen 2
    shellyplus1,
    shellyplus1pm,
    shellyplus2pm,
    shellyplusi4,
    shellyplus010v,
    shellypro1,
    shellypro1pm,
    shellypro2,
    shellypro2pm,
    shellypro3,
    shellypro4pm,
    shellypro3em,
    shellypro2cover,
    shellyprodm1pm,
    shellyprodm2pm,
    shellyproem50,
    shellyplusht,
    shellyplussmoke,
    shellyblugw,
    shellyplusplugs,
    shellypmmini,
    shelly1mini,
    shelly1pmmini,
    shellyplusuni,
    ShellyWallDisplay: shellywalldisplay,
    shellyplusrgbwpm,
    // Gen 3
    shelly1minig3,
    shelly1pmminig3,
    shellypmminig3,
    shellyhtg3,
    shelly1pmg3,
    shelly1g3,
    shelly2pmg3,
};

const deviceTypes = {
    // '<deviceClass>': ['<deviceType>', '<deviceType>'],
    // Gen 1
    shellyswitch: ['SHSW-21'],
    shellyswitch25: ['SHSW-25'],
    shelly1: ['SHSW-1'],
    shelly1pm: ['SHSW-PM'],
    shelly1l: ['SHSW-L'],
    shellyht: ['SHHT-1'],
    shellysmoke: ['SHSM-01'],
    shellybulb: ['SHBLB-1'],
    shellyrgbw2: ['SHRGBW2'],
    shelly2led: ['SH2LED'],
    shellyplug: ['SHPLG-1'],
    shelly4pro: ['SHSW-44'],
    shellysense: ['SHSEN-1'],
    'shellyplug-s': ['SHPLG-S', 'SHPLG2-1'],
    shellyem: ['SHEM'],
    shellyem3: ['SHEM-3'],
    shellyflood: ['SHWT-1'],
    shellydimmer: ['SHDM-1'],
    shellydw: ['SHDW-1'],
    shellydw2: ['SHDW-2'],
    ShellyBulbDuo: ['SHBDUO-1'],
    ShellyVintage: ['SHVIN-1'],
    shellyix3: ['SHIX3-1'],
    shellybutton1: ['SHBTN-1', 'SHBTN-2'],
    shellygas: ['SHGS-1'],
    shellydimmer2: ['SHDM-2'],
    shellyuni: ['SHUNI-1'],
    shellycolorbulb: ['SHCB-1'],
    shellymotionsensor: ['SHMOS-01'],
    shellymotion2: ['SHMOS-02'],
    shellytrv: ['SHTRV-01'],
    // Gen 2
    shellyplus1: ['shellyplus1'],
    shellyplus1pm: ['shellyplus1pm'],
    shellyplus2pm: ['shellyplus2pm'],
    shellyplusi4: ['shellyplusi4'],
    shellyplus010v: ['shellyplus010v'],
    shellypro1: ['shellypro1'],
    shellypro1pm: ['shellypro1pm'],
    shellypro2: ['shellypro2'],
    shellypro2pm: ['shellypro2pm'],
    shellypro3: ['shellypro3'],
    shellypro4pm: ['shellypro4pm'],
    shellypro3em: ['shellypro3em', 'shellypro3em400'],
    shellypro2cover: ['shellypro2cover'],
    shellyprodm1pm: ['shellyprodm1pm'],
    shellyprodm2pm: ['shellyprodm2pm'],
    shellyproem50: ['shellyproem50'],
    shellyplusht: ['shellyplusht'],
    shellyplussmoke: ['shellyplussmoke'],
    shellyblugw: ['shellyblugw'],
    shellyplusplugs: ['shellyplusplugs'],
    shellypmmini: ['shellypmmini'],
    shelly1mini: ['shelly1mini'],
    shelly1pmmini: ['shelly1pmmini'],
    shellyplusuni: ['shellyplusuni'],
    ShellyWallDisplay: ['ShellyWallDisplay'],
    shellyplusrgbwpm: ['shellyplusrgbwpm'],
    // Gen 3
    shelly1minig3: ['shelly1minig3'],
    shelly1pmminig3: ['shelly1pmminig3'],
    shellypmminig3: ['shellypmminig3'],
    shellyhtg3: ['shellyhtg3'],
    shelly1pmg3: ['shelly1pmg3'],
    shelly1g3: ['shelly1g3'],
    shelly2pmg3: ['shelly2pmg3'],
};

const deviceGen = {
    // Gen 1
    shellyswitch: 1,
    shellyswitch25: 1,
    shelly1: 1,
    shelly1pm: 1,
    shelly1l: 1,
    shellyht: 1,
    shellysmoke: 1,
    shellybulb: 1,
    shellyrgbw2: 1,
    shelly2led: 1,
    shellyplug: 1,
    shelly4pro: 1,
    shellysense: 1,
    'shellyplug-s': 1,
    shellyem: 1,
    shellyem3: 1,
    shellyflood: 1,
    shellydimmer: 1,
    shellydw: 1,
    shellydw2: 1,
    ShellyBulbDuo: 1,
    ShellyVintage: 1,
    shellyix3: 1,
    shellybutton1: 1,
    shellygas: 1,
    shellydimmer2: 1,
    shellyuni: 1,
    shellycolorbulb: 1,
    shellymotionsensor: 1,
    shellymotion2: 1,
    shellytrv: 1,
    // Gen 2
    shellyplus1: 2,
    shellyplus1pm: 2,
    shellyplus2pm: 2,
    shellyplusi4: 2,
    shellyplus010v: 2,
    shellypro1: 2,
    shellypro1pm: 2,
    shellypro2: 2,
    shellypro2pm: 2,
    shellypro3: 2,
    shellypro4pm: 2,
    shellypro3em: 2,
    shellypro2cover: 2,
    shellyprodm1pm: 2,
    shellyprodm2pm: 2,
    shellyproem50: 2,
    shellyplusht: 2,
    shellyplussmoke: 2,
    shellyblugw: 2,
    shellyplusplugs: 2,
    shellypmmini: 2,
    shelly1mini: 2,
    shelly1pmmini: 2,
    shellyplusuni: 2,
    ShellyWallDisplay: 2,
    shellyplusrgbwpm: 2,
    // Gen 3
    shelly1minig3: 3,
    shelly1pmminig3: 3,
    shellypmminig3: 3,
    shellyhtg3: 3,
    shelly1pmg3: 3,
    shelly1g3: 3,
    shelly2pmg3: 3,
};

// https://shelly.cloud/knowledge-base/devices/
const deviceKnowledgeBase = {
    // Gen 1
    shellyswitch: undefined,
    shellyswitch25: 'https://kb.shelly.cloud/knowledge-base/shelly-2-5',
    shelly1: 'https://kb.shelly.cloud/knowledge-base/shelly-1',
    shelly1pm: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1pm',
    shelly1l: 'https://kb.shelly.cloud/knowledge-base/shelly-1l',
    shellyht: 'https://kb.shelly.cloud/knowledge-base/shelly-h-t',
    shellysmoke: undefined,
    shellybulb: undefined,
    shellyrgbw2: 'https://kb.shelly.cloud/knowledge-base/shelly-rgbw2',
    shelly2led: undefined,
    shellyplug: 'https://kb.shelly.cloud/knowledge-base/shelly-plug',
    shelly4pro: 'https://kb.shelly.cloud/knowledge-base/4shelly-pro-4pm',
    shellysense: undefined,
    'shellyplug-s': 'https://kb.shelly.cloud/knowledge-base/shelly-plug-s',
    shellyem: 'https://kb.shelly.cloud/knowledge-base/shelly-em',
    shellyem3: 'https://kb.shelly.cloud/knowledge-base/shelly-3em',
    shellyflood: 'https://kb.shelly.cloud/knowledge-base/shelly-flood',
    shellydimmer: undefined,
    shellydw: undefined,
    shellydw2: 'https://kb.shelly.cloud/knowledge-base/shelly-door-window-2',
    ShellyBulbDuo: 'https://kb.shelly.cloud/knowledge-base/shelly-bulb-duo-rgbw',
    ShellyVintage: 'https://kb.shelly.cloud/knowledge-base/shelly-vintage',
    shellyix3: 'https://kb.shelly.cloud/knowledge-base/shelly-i3',
    shellybutton1: 'https://kb.shelly.cloud/knowledge-base/shelly-button-1',
    shellygas: 'https://kb.shelly.cloud/knowledge-base/shelly-gas',
    shellydimmer2: 'https://kb.shelly.cloud/knowledge-base/shelly-dimmer-2',
    shellyuni: 'https://kb.shelly.cloud/knowledge-base/shelly-uni',
    shellycolorbulb: undefined,
    shellymotionsensor: 'https://kb.shelly.cloud/knowledge-base/shelly-motion',
    shellymotion2: 'https://kb.shelly.cloud/knowledge-base/shelly-motion-2',
    shellytrv: 'https://kb.shelly.cloud/knowledge-base/shelly-trv',
    // Gen 2
    shellyplus1: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1',
    shellyplus1pm: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1pm',
    shellyplus2pm: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-2pm',
    shellyplusi4: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-i4',
    shellyplus010v: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-0-10v-dimmer',
    shellypro1: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-1',
    shellypro1pm: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-1pm',
    shellypro2: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-2',
    shellypro2pm: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-2pm',
    shellypro3: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-3-v1',
    shellypro4pm: 'https://kb.shelly.cloud/knowledge-base/4shelly-pro-4pm',
    shellypro3em: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-3em',
    shellypro2cover: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-dual-cover-pm',
    shellyprodm1pm: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-dimmer-1pm',
    shellyprodm2pm: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-dimmer-2pm',
    shellyproem50: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-em-50',
    shellyplusht: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-h-t',
    shellyplussmoke: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-smoke',
    shellyblugw: 'https://kb.shelly.cloud/knowledge-base/shellyblu-gateway',
    shellyplusplugs: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-plug-s',
    shellypmmini: 'https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlusPMMini',
    shelly1mini: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1-mini',
    shelly1pmmini: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1pm-mini',
    shellyplusuni: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-uni',
    ShellyWallDisplay: 'https://kb.shelly.cloud/knowledge-base/shelly-wall-display',
    shellyplusrgbwpm: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-rgbw-pm',
    // Gen 3
    shelly1minig3: 'https://kb.shelly.cloud/knowledge-base/shelly-1-mini-gen3',
    shelly1pmminig3: 'https://kb.shelly.cloud/knowledge-base/shelly-1pm-mini-gen3',
    shellypmminig3: 'https://kb.shelly.cloud/knowledge-base/shelly-pm-mini-gen3',
    shellyhtg3: 'https://kb.shelly.cloud/knowledge-base/shelly-h-t-gen3',
    shelly1pmg3: 'https://kb.shelly.cloud/knowledge-base/shelly-1pm-gen3',
    shelly1g3: 'https://kb.shelly.cloud/knowledge-base/shelly-1-gen3',
    shelly2pmg3: 'https://kb.shelly.cloud/knowledge-base/shelly-2pm-gen3',
};

/**
 * Poll time of battery-powered devices (sec)
 */
const pollTime = {
    // Gen 1
    shellyht: 3600,
    shellysmoke: 3600,
    shellysense: 3600,
    shellyflood: 3600,
    shellydw: 3600,
    shellydw2: 3600,
    shellybutton1: 3600,
    shellygas: 3600,
    shellymotionsensor: 3600,
    shellymotion2: 3600,
    // Gen 2
    shellyplusht: 3600,
    shellyplussmoke: 3600,
    // Gen 3
    shellyhtg3: 3600,
};

/**
 * Copy an object
 * @param {*} obj
 */
function clone(obj) {
    if (obj === null || typeof (obj) !== 'object' || 'isActiveClone' in obj) {
        return obj;
    }

    let temp;
    if (obj instanceof Date) {
        // @ts-ignore
        temp = new obj.constructor(); // or new Date(obj);
    } else {
        temp = obj.constructor();
    }

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            obj['isActiveClone'] = null;
            temp[key] = clone(obj[key]);
            delete obj['isActiveClone'];
        }
    }

    return temp;
}

function deleteNoDisplay(device, protocol, mode) {
    if (protocol === 'coap' || protocol === 'mqtt') {
        for (const key in device) {
            const dev = device[key];
            if (dev?.[protocol]?.no_display) {
                delete device[key];
                continue;
            }

            // Device Mode - just filter if mode is configured!
            if (mode && dev?.device_mode) {
                if (dev.device_mode !== mode) {
                    delete device[key];
                }
            }
        }
    }

    return device;
}

function getDeviceByClass(deviceClass, protocol, mode) {
    if (!devices[deviceClass]) return;

    let device;

    switch (getDeviceGen(deviceClass) ) {
        case 3: device = clone(Object.assign(Object.assign({}, defaultsgen3), devices[deviceClass])); break;
        case 2: device = clone(Object.assign(Object.assign({}, defaultsgen2), devices[deviceClass])); break;
        default: device = clone(Object.assign(Object.assign({}, defaultsgen1), devices[deviceClass]));
    }

    device = deleteNoDisplay(device, protocol, mode);
    return device;
}

function getDeviceTypeByClass(deviceClass) {
    return deviceTypes[deviceClass] ? deviceTypes[deviceClass][0] : undefined;
}

function getDeviceClassByType(deviceType) {
    return Object.keys(deviceTypes).find((key) => deviceTypes[key].indexOf(deviceType) !== -1);
}

function getKnowledgeBaseUrlByClass(deviceClass) {
    return deviceKnowledgeBase?.[deviceClass];
}

function getAllDeviceDefinitions() {
    return Object.entries(devices).reduce((o, [deviceClass, device]) => {
        switch (getDeviceGen(deviceClass) ) {
            case 3: o[deviceClass] = clone(Object.assign(Object.assign({}, defaultsgen3), device)); break;
            case 2: o[deviceClass] = clone(Object.assign(Object.assign({}, defaultsgen2), device)); break;
            default: o[deviceClass] = clone(Object.assign(Object.assign({}, defaultsgen1), device));
        }
        return o;
    }, {});
}

function getDeviceGen(deviceClass) {
    return deviceGen[deviceClass] ? deviceGen[deviceClass] : 1;
}

function getPolltime(deviceClass) {
    return pollTime?.[deviceClass];
}

module.exports = {
    getDeviceTypeByClass,
    getDeviceClassByType,
    getAllDeviceDefinitions,
    getKnowledgeBaseUrlByClass,
    getDeviceGen,
    getDeviceByClass,
    getPolltime,
};
