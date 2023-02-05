'use strict';

// Defaults
const defaultsgen1 = require(__dirname + '/devices/default').defaultsgen1;
const defaultsgen2 = require(__dirname + '/devices/default').defaultsgen2;

// Gen 1
const shelly1 = require(__dirname + '/devices/gen1/shelly1').shelly1;
const shelly1pm = require(__dirname + '/devices/gen1/shelly1pm').shelly1pm;
const shelly1l = require(__dirname + '/devices/gen1/shelly1l').shelly1l;
const shellyswitch = require(__dirname + '/devices/gen1/shellyswitch').shellyswitch;
const shellyswitch25 = require(__dirname + '/devices/gen1/shellyswitch25').shellyswitch25;
const shellyht = require(__dirname + '/devices/gen1/shellyht').shellyht;
const shellysmoke = require(__dirname + '/devices/gen1/shellysmoke').shellysmoke;
const shellybulb = require(__dirname + '/devices/gen1/shellybulb').shellybulb;
const shellyrgbw2 = require(__dirname + '/devices/gen1/shellyrgbw2').shellyrgbw2;
const shelly2led = require(__dirname + '/devices/gen1/shelly2led').shelly2led;
const shellyplug = require(__dirname + '/devices/gen1/shellyplug').shellyplug;
const shellyplugs = require(__dirname + '/devices/gen1/shellyplugs').shellyplugs;
const shelly4pro = require(__dirname + '/devices/gen1/shelly4pro').shelly4pro;
const shellysense = require(__dirname + '/devices/gen1/shellysense').shellysense;
const shellyem = require(__dirname + '/devices/gen1/shellyem').shellyem;
const shellyem3 = require(__dirname + '/devices/gen1/shellyem3').shellyem3;
const shellyflood = require(__dirname + '/devices/gen1/shellyflood').shellyflood;
const shellydimmer = require(__dirname + '/devices/gen1/shellydimmer').shellydimmer;
const shellydimmer2 = require(__dirname + '/devices/gen1/shellydimmer2').shellydimmer2;
const shellydw = require(__dirname + '/devices/gen1/shellydw').shellydw;
const shellydw2 = require(__dirname + '/devices/gen1/shellydw2').shellydw2;
const shellybulbduo = require(__dirname + '/devices/gen1/shellybulbduo').shellybulbduo;
const shellyvintage = require(__dirname + '/devices/gen1/shellyvintage').shellyvintage;
const shellyix3 = require(__dirname + '/devices/gen1/shellyix3').shellyix3;
const shellybutton1 = require(__dirname + '/devices/gen1/shellybutton1').shellybutton1;
const shellygas = require(__dirname + '/devices/gen1/shellygas').shellygas;
const shellyuni = require(__dirname + '/devices/gen1/shellyuni').shellyuni;
const shellycolorbulb = require(__dirname + '/devices/gen1/shellycolorbulb').shellycolorbulb;
const shellymotionsensor = require(__dirname + '/devices/gen1/shellymotionsensor').shellymotionsensor;
const shellymotion2 = require(__dirname + '/devices/gen1/shellymotion2').shellymotion2;
const shellytrv = require(__dirname + '/devices/gen1/shellytrv').shellytrv;

// Gen 2
const shellyplus1 = require(__dirname + '/devices/gen2/shellyplus1').shellyplus1;
const shellyplus1pm = require(__dirname + '/devices/gen2/shellyplus1pm').shellyplus1pm;
const shellyplus2pm = require(__dirname + '/devices/gen2/shellyplus2pm').shellyplus2pm;
const shellyplusi4 = require(__dirname + '/devices/gen2/shellyplusi4').shellyplusi4;
const shellypro1 = require(__dirname + '/devices/gen2/shellypro1').shellypro1;
const shellypro1pm = require(__dirname + '/devices/gen2/shellypro1pm').shellypro1pm;
const shellypro2 = require(__dirname + '/devices/gen2/shellypro2').shellypro2;
const shellypro2pm = require(__dirname + '/devices/gen2/shellypro2pm').shellypro2pm;
const shellypro3 = require(__dirname + '/devices/gen2/shellypro3').shellypro3;
const shellypro4pm = require(__dirname + '/devices/gen2/shellypro4pm').shellypro4pm;
const shellyplusht = require(__dirname + '/devices/gen2/shellyplusht').shellyplusht;
const shellyplusplugs = require(__dirname + '/devices/gen2/shellyplusplugs').shellyplusplugs;

const devices = {
    // Gen 1
    'shellyswitch': shellyswitch,
    'shellyswitch25': shellyswitch25,
    'shelly1': shelly1,
    'shelly1pm': shelly1pm,
    'shelly1l': shelly1l,
    'shellyht': shellyht,
    'shellysmoke': shellysmoke,
    'shellybulb': shellybulb,
    'shellyrgbw2': shellyrgbw2,
    'shelly2led': shelly2led,
    'shellyplug': shellyplug,
    'shelly4pro': shelly4pro,
    'shellysense': shellysense,
    'shellyplug-s': shellyplugs,
    'shellyem': shellyem,
    'shellyem3': shellyem3,
    'shellyflood': shellyflood,
    'shellydimmer': shellydimmer,
    'shellydw': shellydw,
    'shellydw2': shellydw2,
    'ShellyBulbDuo': shellybulbduo,
    'ShellyVintage': shellyvintage,
    'shellyix3': shellyix3,
    'shellybutton1': shellybutton1,
    'shellygas': shellygas,
    'shellydimmer2': shellydimmer2,
    'shellyuni': shellyuni,
    'shellycolorbulb': shellycolorbulb,
    'shellymotionsensor': shellymotionsensor,
    'shellymotion2': shellymotion2,
    'shellytrv': shellytrv,
    // Gen 2
    'shellyplus1': shellyplus1,
    'shellyplus1pm': shellyplus1pm,
    'shellyplus2pm': shellyplus2pm,
    'shellyplusi4': shellyplusi4,
    'shellypro1': shellypro1,
    'shellypro1pm': shellypro1pm,
    'shellypro2': shellypro2,
    'shellypro2pm': shellypro2pm,
    'shellypro3': shellypro3,
    'shellypro4pm': shellypro4pm,
    'shellyplusht': shellyplusht,
    'shellyplusplugs': shellyplusplugs,
};

const deviceTypes = {
    // '<deviceClass>': ['<deviceType>', '<deviceType>'],
    // Gen 1
    'shellyswitch': ['SHSW-21'],
    'shellyswitch25': ['SHSW-25'],
    'shelly1': ['SHSW-1'],
    'shelly1pm': ['SHSW-PM'],
    'shelly1l': ['SHSW-L'],
    'shellyht': ['SHHT-1'],
    'shellysmoke': ['SHSM-01'],
    'shellybulb': ['SHBLB-1'],
    'shellyrgbw2': ['SHRGBW2'],
    'shelly2led': ['SH2LED'],
    'shellyplug': ['SHPLG-1'],
    'shelly4pro': ['SHSW-44'],
    'shellysense': ['SHSEN-1'],
    'shellyplug-s': ['SHPLG-S', 'SHPLG2-1'],
    'shellyem': ['SHEM'],
    'shellyem3': ['SHEM-3'],
    'shellyflood': ['SHWT-1'],
    'shellydimmer': ['SHDM-1'],
    'shellydw': ['SHDW-1'],
    'shellydw2': ['SHDW-2'],
    'ShellyBulbDuo': ['SHBDUO-1'],
    'ShellyVintage': ['SHVIN-1'],
    'shellyix3': ['SHIX3-1'],
    'shellybutton1': ['SHBTN-1', 'SHBTN-2'],
    'shellygas': ['SHGS-1'],
    'shellydimmer2': ['SHDM-2'],
    'shellyuni': ['SHUNI-1'],
    'shellycolorbulb': ['SHCB-1'],
    'shellymotionsensor': ['SHMOS-01'],
    'shellymotion2': ['SHMOS-02'],
    'shellytrv': ['SHTRV-01'],
    // Gen 2
    'shellyplus1': ['shellyplus1'],
    'shellyplus1pm': ['shellyplus1pm'],
    'shellyplus2pm': ['shellyplus2pm'],
    'shellyplusi4': ['shellyplusi4'],
    'shellypro1': ['shellypro1'],
    'shellypro1pm': ['shellypro1pm'],
    'shellypro2': ['shellypro2'],
    'shellypro2pm': ['shellypro2pm'],
    'shellypro3': ['shellypro3'],
    'shellypro4pm': ['shellypro4pm'],
    'shellyplusht': ['shellyplusht'],
    'shellyplusplugs': ['shellyplusplugs'],
};

const deviceGen = {
    // Gen 1
    'shellyswitch': 1,
    'shellyswitch25': 1,
    'shelly1': 1,
    'shelly1pm': 1,
    'shelly1l': 1,
    'shellyht': 1,
    'shellysmoke': 1,
    'shellybulb': 1,
    'shellyrgbw2': 1,
    'shelly2led': 1,
    'shellyplug': 1,
    'shelly4pro': 1,
    'shellysense': 1,
    'shellyplug-s': 1,
    'shellyem': 1,
    'shellyem3': 1,
    'shellyflood': 1,
    'shellydimmer': 1,
    'shellydw': 1,
    'shellydw2': 1,
    'ShellyBulbDuo': 1,
    'ShellyVintage': 1,
    'shellyix3': 1,
    'shellybutton1': 1,
    'shellygas': 1,
    'shellydimmer2': 1,
    'shellyuni': 1,
    'shellycolorbulb': 1,
    'shellymotionsensor': 1,
    'shellymotion2': 1,
    'shellytrv': 1,
    // Gen 2
    'shellyplus1': 2,
    'shellyplus1pm': 2,
    'shellyplus2pm': 2,
    'shellyplusi4': 2,
    'shellypro1': 2,
    'shellypro1pm': 2,
    'shellypro2': 2,
    'shellypro2pm': 2,
    'shellypro3': 2,
    'shellypro4pm': 2,
    'shellyplusht': 2,
    'shellyplusplugs': 2,
};

// https://shelly.cloud/knowledge-base/devices/
const deviceKnowledgeBase = {
    // Gen 1
    'shellyswitch': undefined,
    'shellyswitch25': 'https://kb.shelly.cloud/knowledge-base/shelly-2-5',
    'shelly1': 'https://kb.shelly.cloud/knowledge-base/shelly-1',
    'shelly1pm': 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1pm',
    'shelly1l': 'https://kb.shelly.cloud/knowledge-base/shelly-1l',
    'shellyht': 'https://kb.shelly.cloud/knowledge-base/shelly-h-t',
    'shellysmoke': undefined,
    'shellybulb': undefined,
    'shellyrgbw2': 'https://kb.shelly.cloud/knowledge-base/shelly-rgbw2',
    'shelly2led': undefined,
    'shellyplug': 'https://kb.shelly.cloud/knowledge-base/shelly-plug',
    'shelly4pro': 'https://kb.shelly.cloud/knowledge-base/4shelly-pro-4pm',
    'shellysense': undefined,
    'shellyplug-s': 'https://kb.shelly.cloud/knowledge-base/shelly-plug-s',
    'shellyem': 'https://kb.shelly.cloud/knowledge-base/shelly-em',
    'shellyem3': 'https://kb.shelly.cloud/knowledge-base/shelly-3em',
    'shellyflood': 'https://kb.shelly.cloud/knowledge-base/shelly-flood',
    'shellydimmer': undefined,
    'shellydw': undefined,
    'shellydw2': 'https://kb.shelly.cloud/knowledge-base/shelly-door-window-2',
    'ShellyBulbDuo': 'https://kb.shelly.cloud/knowledge-base/shelly-bulb-duo-rgbw',
    'ShellyVintage': 'https://kb.shelly.cloud/knowledge-base/shelly-vintage',
    'shellyix3': 'https://kb.shelly.cloud/knowledge-base/shelly-i3',
    'shellybutton1': 'https://kb.shelly.cloud/knowledge-base/shelly-button-1',
    'shellygas': 'https://kb.shelly.cloud/knowledge-base/shelly-gas',
    'shellydimmer2': 'https://kb.shelly.cloud/knowledge-base/shelly-dimmer-2',
    'shellyuni': 'https://kb.shelly.cloud/knowledge-base/shelly-uni',
    'shellycolorbulb': undefined,
    'shellymotionsensor': 'https://kb.shelly.cloud/knowledge-base/shelly-motion',
    'shellymotion2': 'https://kb.shelly.cloud/knowledge-base/shelly-motion-2',
    'shellytrv': 'https://kb.shelly.cloud/knowledge-base/shelly-trv',
    // Gen 2
    'shellyplus1': 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1',
    'shellyplus1pm': 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1pm',
    'shellyplus2pm': 'https://kb.shelly.cloud/knowledge-base/shelly-plus-2pm',
    'shellyplusi4': 'https://kb.shelly.cloud/knowledge-base/shelly-plus-i4',
    'shellypro1': 'https://kb.shelly.cloud/knowledge-base/shelly-pro-1',
    'shellypro1pm': 'https://kb.shelly.cloud/knowledge-base/shelly-pro-1pm',
    'shellypro2': 'https://kb.shelly.cloud/knowledge-base/shelly-pro-2',
    'shellypro2pm': 'https://kb.shelly.cloud/knowledge-base/shelly-pro-2pm',
    'shellypro3': 'https://kb.shelly.cloud/knowledge-base/shelly-pro-3-v1',
    'shellypro4pm': 'https://kb.shelly.cloud/knowledge-base/4shelly-pro-4pm',
    'shellyplusht': 'https://kb.shelly.cloud/knowledge-base/shelly-plus-h-t',
    'shellyplusplugs': 'https://kb.shelly.cloud/knowledge-base/shelly-plus-plug-s',
};

/**
 * Polltime of battery powered devices (sec)
 */
const pollTime = {
    // Gen 1
    'shellyht': 3600,
    'shellysmoke': 3600,
    'shellysense': 3600,
    'shellyflood': 3600,
    'shellydw': 3600,
    'shellydw2': 3600,
    'shellybutton1': 3600,
    'shellygas': 3600,
    'shellymotionsensor': 3600,
    'shellymotion2': 3600,
    // Gen 2
    'shellyplusht': 3600,
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
        temp = new obj.constructor(); //or new Date(obj);
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
                    continue;
                }
            }
        }
    }

    return device;
}

function getDeviceByClass(deviceClass, protocol, mode) {
    if (!devices[deviceClass]) return;

    let device;

    if (getDeviceGen(deviceClass) == 2) {
        device = clone(Object.assign(devices[deviceClass], defaultsgen2));
    } else {
        device = clone(Object.assign(devices[deviceClass], defaultsgen1));
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
        if (getDeviceGen(deviceClass) == 2) {
            o[deviceClass] = clone(Object.assign(device, defaultsgen2));
        } else {
            o[deviceClass] = clone(Object.assign(device, defaultsgen1));
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
    getDeviceTypeByClass: getDeviceTypeByClass,
    getDeviceClassByType: getDeviceClassByType,
    getAllDeviceDefinitions: getAllDeviceDefinitions,
    getKnowledgeBaseUrlByClass: getKnowledgeBaseUrlByClass,
    getDeviceGen: getDeviceGen,
    getDeviceByClass: getDeviceByClass,
    getPolltime: getPolltime,
};
