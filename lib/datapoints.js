'use strict';

// Defaults
const defaultsgen1 = require('./devices/default').defaultsgen1;
const defaultsgen2 = require('./devices/default').defaultsgen2;
const defaultsgen3 = require('./devices/default').defaultsgen3;
const defaultsgen4 = require('./devices/default').defaultsgen4;

// Gen 1
const shelly1 = require('./devices/gen1/shelly1').shelly1;
const shelly1l = require('./devices/gen1/shelly1l').shelly1l;
const shelly1pm = require('./devices/gen1/shelly1pm').shelly1pm;
const shelly2led = require('./devices/gen1/shelly2led').shelly2led;
const shelly4pro = require('./devices/gen1/shelly4pro').shelly4pro;
const shellybulb = require('./devices/gen1/shellybulb').shellybulb;
const shellybulbduo = require('./devices/gen1/shellybulbduo').shellybulbduo;
const shellybutton1 = require('./devices/gen1/shellybutton1').shellybutton1;
const shellycolorbulb = require('./devices/gen1/shellycolorbulb').shellycolorbulb;
const shellydimmer = require('./devices/gen1/shellydimmer').shellydimmer;
const shellydimmer2 = require('./devices/gen1/shellydimmer2').shellydimmer2;
const shellydw = require('./devices/gen1/shellydw').shellydw;
const shellydw2 = require('./devices/gen1/shellydw2').shellydw2;
const shellyem = require('./devices/gen1/shellyem').shellyem;
const shellyem3 = require('./devices/gen1/shellyem3').shellyem3;
const shellyflood = require('./devices/gen1/shellyflood').shellyflood;
const shellygas = require('./devices/gen1/shellygas').shellygas;
const shellyht = require('./devices/gen1/shellyht').shellyht;
const shellyix3 = require('./devices/gen1/shellyix3').shellyix3;
const shellymotion2 = require('./devices/gen1/shellymotion2').shellymotion2;
const shellymotionsensor = require('./devices/gen1/shellymotionsensor').shellymotionsensor;
const shellyplug = require('./devices/gen1/shellyplug').shellyplug;
const shellyplugs = require('./devices/gen1/shellyplugs').shellyplugs;
const shellyrgbw2 = require('./devices/gen1/shellyrgbw2').shellyrgbw2;
const shellysense = require('./devices/gen1/shellysense').shellysense;
const shellysmoke = require('./devices/gen1/shellysmoke').shellysmoke;
const shellyswitch = require('./devices/gen1/shellyswitch').shellyswitch;
const shellyswitch25 = require('./devices/gen1/shellyswitch25').shellyswitch25;
const shellytrv = require('./devices/gen1/shellytrv').shellytrv;
const shellyuni = require('./devices/gen1/shellyuni').shellyuni;
const shellyvintage = require('./devices/gen1/shellyvintage').shellyvintage;

// Gen 2
const shelly1mini = require('./devices/gen2/shelly1mini').shelly1mini;
const shelly1pmmini = require('./devices/gen2/shelly1pmmini').shelly1pmmini;
const shellyblugw = require('./devices/gen2/shellyblugw').shellyblugw;
const shellyplus010v = require('./devices/gen2/shellyplus010v').shellyplus010v;
const shellyplus1 = require('./devices/gen2/shellyplus1').shellyplus1;
const shellyplus1pm = require('./devices/gen2/shellyplus1pm').shellyplus1pm;
const shellyplus2pm = require('./devices/gen2/shellyplus2pm').shellyplus2pm;
const shellyplusht = require('./devices/gen2/shellyplusht').shellyplusht;
const shellyplusi4 = require('./devices/gen2/shellyplusi4').shellyplusi4;
const shellyplusplugs = require('./devices/gen2/shellyplusplugs').shellyplusplugs;
const shellyplusrgbwpm = require('./devices/gen2/shellyplusrgbwpm').shellyplusrgbwpm;
const shellyplussmoke = require('./devices/gen2/shellyplussmoke').shellyplussmoke;
const shellyplusuni = require('./devices/gen2/shellyplusuni').shellyplusuni;
const shellypmmini = require('./devices/gen2/shellypmmini').shellypmmini;
const shellypro0110pm = require('./devices/gen2/shellypro0110pm').shellypro0110pm;
const shellypro1 = require('./devices/gen2/shellypro1').shellypro1;
const shellypro1pm = require('./devices/gen2/shellypro1pm').shellypro1pm;
const shellypro2 = require('./devices/gen2/shellypro2').shellypro2;
const shellypro2cover = require('./devices/gen2/shellypro2cover').shellypro2cover;
const shellypro2pm = require('./devices/gen2/shellypro2pm').shellypro2pm;
const shellypro3 = require('./devices/gen2/shellypro3').shellypro3;
const shellypro3em = require('./devices/gen2/shellypro3em').shellypro3em;
const shellypro3em400 = require('./devices/gen2/shellypro3em400').shellypro3em400;
const shellypro3em63 = require('./devices/gen2/shellypro3em63').shellypro3em63;
const shellypro4pm = require('./devices/gen2/shellypro4pm').shellypro4pm;
const shellyprodm1pm = require('./devices/gen2/shellyprodm1pm').shellyprodm1pm;
const shellyprodm2pm = require('./devices/gen2/shellyprodm2pm').shellyprodm2pm;
const shellyproem50 = require('./devices/gen2/shellyproem50').shellyproem50;
const shellyprorgbwwpm = require('./devices/gen2/shellyprorgbwwpm').shellyprorgbwwpm;
const shellywalldisplay = require('./devices/gen2/shellywalldisplay').shellywalldisplay;

// Gen 3
const shelly0110dimg3 = require('./devices/gen3/shelly0110dimg3').shelly0110dimg3;
const shelly1g3 = require('./devices/gen3/shelly1g3').shelly1g3;
const shelly1lg3 = require('./devices/gen3/shelly1lg3').shelly1lg3;
const shelly1minig3 = require('./devices/gen3/shelly1minig3').shelly1minig3;
const shelly1pmg3 = require('./devices/gen3/shelly1pmg3').shelly1pmg3;
const shelly1pmminig3 = require('./devices/gen3/shelly1pmminig3').shelly1pmminig3;
const shelly2lg3 = require('./devices/gen3/shelly2lg3').shelly2lg3;
const shelly2pmg3 = require('./devices/gen3/shelly2pmg3').shelly2pmg3;
const shelly3em63g3 = require('./devices/gen3/shelly3em63g3').shelly3em63g3;
const shellyazplug = require('./devices/gen3/shellyazplug').shellyazplug;
const shellyblugwg3 = require('./devices/gen3/shellyblugwg3').shellyblugwg3;
const shellyddimmerg3 = require('./devices/gen3/shellyddimmerg3').shellyddimmerg3;
const shellydimmerg3 = require('./devices/gen3/shellydimmerg3').shellydimmerg3;
const shellyemg3 = require('./devices/gen3/shellyemg3').shellyemg3;
const shellyhtg3 = require('./devices/gen3/shellyhtg3').shellyhtg3;
const shellyi4g3 = require('./devices/gen3/shellyi4g3').shellyi4g3;
const shellyoutdoorsg3 = require('./devices/gen3/shellyoutdoorsg3').shellyoutdoorsg3;
const shellypill = require('./devices/gen3/shellypill').shellypill;
const shellyplugmg3 = require('./devices/gen3/shellyplugmg3').shellyplugmg3;
const shellyplugpmg3 = require('./devices/gen3/shellyplugpmg3').shellyplugpmg3;
const shellyplugsg3 = require('./devices/gen3/shellyplugsg3').shellyplugsg3;
const shellypmminig3 = require('./devices/gen3/shellypmminig3').shellypmminig3;
const shellyshutter = require('./devices/gen3/shellyshutter').shellyshutter;

// Gen 4
const shelly1g4 = require('./devices/gen4/shelly1g4').shelly1g4;
const shelly1minig4 = require('./devices/gen4/shelly1minig4').shelly1minig4;
const shelly1pmg4 = require('./devices/gen4/shelly1pmg4').shelly1pmg4;
const shelly1pmminig4 = require('./devices/gen4/shelly1pmminig4').shelly1pmminig4;
const shelly2pmg4 = require('./devices/gen4/shelly2pmg4').shelly2pmg4;
const shellydimmerg4 = require('./devices/gen4/shellydimmerg4').shellydimmerg4;
const shellyemminig4 = require('./devices/gen4/shellyemminig4').shellyemminig4;
const shellyfloodg4 = require('./devices/gen4/shellyfloodg4').shellyfloodg4;
const shellypstripg4 = require('./devices/gen4/shellypstripg4').shellypstripg4;

// Pwowered by Shelly
const irrigation = require('./devices/poweredbyshelly/irrigation').irrigation;
const ogemray25a = require('./devices/poweredbyshelly/ogemray25a').ogemray25a;
const st1820 = require('./devices/poweredbyshelly/st1820').st1820;
const watervalve = require('./devices/poweredbyshelly/watervalve').watervalve;

const devices = {
    // Gen 1
    shelly1,
    shelly1l,
    shelly1pm,
    shelly2led,
    shelly4pro,
    shellybulb,
    ShellyBulbDuo: shellybulbduo,
    shellybutton1,
    shellycolorbulb,
    shellydimmer,
    shellydimmer2,
    shellydw,
    shellydw2,
    shellyem,
    shellyem3,
    shellyflood,
    shellygas,
    shellyht,
    shellyix3,
    shellymotion2,
    shellymotionsensor,
    shellyplug,
    'shellyplug-s': shellyplugs,
    shellyrgbw2,
    shellysense,
    shellysmoke,
    shellyswitch,
    shellyswitch25,
    shellytrv,
    shellyuni,
    ShellyVintage: shellyvintage,

    // Gen 2
    shelly1mini,
    shelly1pmmini,
    shellyblugw,
    shellyplus010v,
    shellyplus1,
    shellyplus1pm,
    shellyplus2pm,
    shellyplusht,
    shellyplusi4,
    shellyplusplugs,
    shellyplusrgbwpm,
    shellyplussmoke,
    shellyplusuni,
    shellypmmini,
    shellypro0110pm,
    shellypro1,
    shellypro1pm,
    shellypro2,
    shellypro2cover,
    shellypro2pm,
    shellypro3,
    shellypro3em,
    shellypro3em400,
    shellypro3em63,
    shellypro4pm,
    shellyprodm1pm,
    shellyprodm2pm,
    shellyproem50,
    shellyprorgbwwpm,
    ShellyWallDisplay: shellywalldisplay,

    // Gen 3
    shelly0110dimg3,
    shelly1g3,
    shelly1lg3,
    shelly1minig3,
    shelly1pmg3,
    shelly1pmminig3,
    shelly2lg3,
    shelly2pmg3,
    shelly3em63g3,
    shellyazplug,
    shellyblugwg3,
    shellyddimmerg3,
    shellydimmerg3,
    shellyemg3,
    shellyhtg3,
    shellyi4g3,
    shellyoutdoorsg3,
    shellypill,
    shellyplugmg3,
    shellyplugpmg3,
    shellyplugsg3,
    shellypmminig3,
    shellyshutter,

    // Gen 4
    shelly1g4,
    shelly1minig4,
    shelly1pmg4,
    shelly1pmminig4,
    shelly2pmg4,
    shellydimmerg4,
    shellyemminig4,
    shellyfloodg4,
    shellypstripg4,

    // poweredbyshelly
    irrigation,
    ogemray25a,
    st1820,
    watervalve,
};

const deviceGen = {
    // Gen 1
    shelly1: 1,
    shelly1l: 1,
    shelly1pm: 1,
    shelly2led: 1,
    shelly4pro: 1,
    shellybulb: 1,
    ShellyBulbDuo: 1,
    shellybutton1: 1,
    shellycolorbulb: 1,
    shellydimmer: 1,
    shellydimmer2: 1,
    shellydw: 1,
    shellydw2: 1,
    shellyem: 1,
    shellyem3: 1,
    shellyflood: 1,
    shellygas: 1,
    shellyht: 1,
    shellyix3: 1,
    shellymotion2: 1,
    shellymotionsensor: 1,
    shellyplug: 1,
    'shellyplug-s': 1,
    shellyrgbw2: 1,
    shellysense: 1,
    shellysmoke: 1,
    shellyswitch: 1,
    shellyswitch25: 1,
    shellytrv: 1,
    shellyuni: 1,
    ShellyVintage: 1,

    // Gen 2
    shelly1mini: 2,
    shelly1pmmini: 2,
    shellyblugw: 2,
    shellyplus010v: 2,
    shellyplus1: 2,
    shellyplus1pm: 2,
    shellyplus2pm: 2,
    shellyplusht: 2,
    shellyplusi4: 2,
    shellyplusplugs: 2,
    shellyplusrgbwpm: 2,
    shellyplussmoke: 2,
    shellyplusuni: 2,
    shellypmmini: 2,
    shellypro0110pm: 2,
    shellypro1: 2,
    shellypro1pm: 2,
    shellypro2: 2,
    shellypro2cover: 2,
    shellypro2pm: 2,
    shellypro3: 2,
    shellypro3em: 2,
    shellypro3em400: 2,
    shellypro3em63: 2,
    shellypro4pm: 2,
    shellyprodm1pm: 2,
    shellyprodm2pm: 2,
    shellyproem50: 2,
    shellyprorgbwwpm: 2,
    ShellyWallDisplay: 2,

    // Gen 3
    shelly0110dimg3: 3,
    shelly1g3: 3,
    shelly1lg3: 3,
    shelly1minig3: 3,
    shelly1pmg3: 3,
    shelly1pmminig3: 3,
    shelly2lg3: 3,
    shelly2pmg3: 3,
    shelly3em63g3: 3,
    shellyazplug: 3,
    shellyblugwg3: 3,
    shellyddimmerg3: 3,
    shellydimmerg3: 3,
    shellyemg3: 3,
    shellyhtg3: 3,
    shellyi4g3: 3,
    shellyoutdoorsg3: 3,
    shellypill: 3,
    shellyplugmg3: 3,
    shellyplugpmg3: 3,
    shellyplugsg3: 3,
    shellypmminig3: 3,
    shellyshutter: 3,

    // Gen 4
    shelly1g4: 4,
    shelly1minig4: 4,
    shelly1pmg4: 4,
    shelly1pmminig4: 4,
    shelly2pmg4: 4,
    shellydimmerg4: 4,
    shellyemminig4: 4,
    shellyfloodg4: 4,
    shellypstripg4: 4,

    // Powered by Shelly
    irrigation: 3,
    ogemray25a: 3,
    st1820: 3,
    watervalve: 3,
};

/** Map device class to group key */
const deviceGroupMap = {
    // Gen 1
    shelly1: 'relay',
    shelly1l: 'relay',
    shelly1pm: 'relay',
    shelly2led: 'light',
    shelly4pro: 'relay',
    shellybulb: 'light',
    ShellyBulbDuo: 'light',
    shellybutton1: 'input',
    shellycolorbulb: 'light',
    shellydimmer: 'dimmer',
    shellydimmer2: 'dimmer',
    shellydw: 'sensor',
    shellydw2: 'sensor',
    shellyem: 'meter',
    shellyem3: 'meter',
    shellyflood: 'sensor',
    shellygas: 'sensor',
    shellyht: 'sensor',
    shellyix3: 'input',
    shellymotion2: 'sensor',
    shellymotionsensor: 'sensor',
    shellyplug: 'plug',
    'shellyplug-s': 'plug',
    shellyrgbw2: 'light',
    shellysense: 'sensor',
    shellysmoke: 'sensor',
    shellyswitch: 'relay',
    shellyswitch25: 'relay',
    shellytrv: 'climate',
    shellyuni: 'gateway',
    ShellyVintage: 'light',

    // Gen 2
    shelly1mini: 'relay',
    shelly1pmmini: 'relay',
    shellyblugw: 'gateway',
    shellyplus010v: 'dimmer',
    shellyplus1: 'relay',
    shellyplus1pm: 'relay',
    shellyplus2pm: 'relay',
    shellyplusht: 'sensor',
    shellyplusi4: 'input',
    shellyplusplugs: 'plug',
    shellyplusrgbwpm: 'light',
    shellyplussmoke: 'sensor',
    shellyplusuni: 'gateway',
    shellypmmini: 'meter',
    shellypro0110pm: 'dimmer',
    shellypro1: 'relay',
    shellypro1pm: 'relay',
    shellypro2: 'relay',
    shellypro2cover: 'cover',
    shellypro2pm: 'relay',
    shellypro3: 'relay',
    shellypro3em: 'meter',
    shellypro3em400: 'meter',
    shellypro3em63: 'meter',
    shellypro4pm: 'relay',
    shellyprodm1pm: 'dimmer',
    shellyprodm2pm: 'dimmer',
    shellyproem50: 'meter',
    shellyprorgbwwpm: 'light',
    ShellyWallDisplay: 'gateway',

    // Gen 3
    shelly0110dimg3: 'dimmer',
    shelly1g3: 'relay',
    shelly1lg3: 'relay',
    shelly1minig3: 'relay',
    shelly1pmg3: 'relay',
    shelly1pmminig3: 'relay',
    shelly2lg3: 'relay',
    shelly2pmg3: 'relay',
    shelly3em63g3: 'meter',
    shellyazplug: 'plug',
    shellyblugwg3: 'gateway',
    shellyddimmerg3: 'dimmer',
    shellydimmerg3: 'dimmer',
    shellyemg3: 'meter',
    shellyhtg3: 'sensor',
    shellyi4g3: 'input',
    shellyoutdoorsg3: 'sensor',
    shellypill: 'sensor',
    shellyplugmg3: 'plug',
    shellyplugpmg3: 'plug',
    shellyplugsg3: 'plug',
    shellypmminig3: 'meter',
    shellyshutter: 'cover',

    // Gen 4
    shelly1g4: 'relay',
    shelly1minig4: 'relay',
    shelly1pmg4: 'relay',
    shelly1pmminig4: 'relay',
    shelly2pmg4: 'relay',
    shellydimmerg4: 'dimmer',
    shellyemminig4: 'meter',
    shellyfloodg4: 'sensor',
    shellypstripg4: 'light',

    // Powered by Shelly
    irrigation: 'other',
    ogemray25a: 'other',
    st1820: 'other',
    watervalve: 'other',
};

const deviceIcons = {
    // Gen 1 - product images where available, fallback to similar device
    shelly1: 'shellyplus1',
    shelly1l: 'shelly1lg3',
    shelly1pm: 'shellyplus1pm',
    shelly2led: 'shellyrgbw2',
    shelly4pro: 'shellypro4pm',
    shellybulb: 'shellybulbduo',
    ShellyBulbDuo: 'shellybulbduo',
    shellybutton1: 'shellyplusi4',
    shellycolorbulb: 'shellybulbduo',
    shellydimmer: 'shellydimmerg3',
    shellydimmer2: 'shellydimmerg3',
    shellydw: 'shellydw2',
    shellydw2: 'shellydw2',
    shellyem: 'shellyem3',
    shellyem3: 'shellyem3',
    shellyflood: 'shellyflood',
    shellygas: 'shellygas',
    shellyht: 'shellyhtg3',
    shellyix3: 'shellyplusi4',
    shellymotion2: 'shellymotion2',
    shellymotionsensor: 'shellymotion2',
    shellyplug: 'shellyplug',
    'shellyplug-s': 'shellyplugs',
    shellyrgbw2: 'shellyrgbw2',
    shellysense: 'shellyhtg3',
    shellysmoke: 'shellyplussmoke',
    shellyswitch: 'shellyplus2pm',
    shellyswitch25: 'shellyplus2pm',
    shellytrv: 'shellytrv',
    shellyuni: 'shellyuni',
    ShellyVintage: 'shellybulbduo',

    // Gen 2
    shelly1mini: 'shelly1minig3',
    shelly1pmmini: 'shelly1pmminig3',
    shellyblugw: 'shellyblugw',
    shellyplus010v: 'shellyplus010v',
    shellyplus1: 'shellyplus1',
    shellyplus1pm: 'shellyplus1pm',
    shellyplus2pm: 'shellyplus2pm',
    shellyplusht: 'shellyhtg3',
    shellyplusi4: 'shellyplusi4',
    shellyplusplugs: 'shellyplusplugs',
    shellyplusrgbwpm: 'shellyplusrgbwpm',
    shellyplussmoke: 'shellyplussmoke',
    shellyplusuni: 'shellyplusuni',
    shellypmmini: 'shellypmminig3',
    shellypro0110pm: 'shellyplus010v',
    shellypro1: 'shellypro1',
    shellypro1pm: 'shellypro1pm',
    shellypro2: 'shellypro2',
    shellypro2cover: 'shellyshutter',
    shellypro2pm: 'shellypro2pm',
    shellypro3: 'shellypro3',
    shellypro3em: 'shellypro3em400',
    shellypro3em400: 'shellypro3em400',
    shellypro3em63: 'shellypro3em400',
    shellypro4pm: 'shellypro4pm',
    shellyprodm1pm: 'shellyprodm1pm',
    shellyprodm2pm: 'shellyprodm2pm',
    shellyproem50: 'shellyproem50',
    shellyprorgbwwpm: 'shellyprorgbwwpm',
    ShellyWallDisplay: 'shellyprodm1pm',

    // Gen 3
    shelly0110dimg3: 'shellydimmerg3',
    shelly1g3: 'shelly1g3',
    shelly1lg3: 'shelly1lg3',
    shelly1minig3: 'shelly1minig3',
    shelly1pmg3: 'shelly1pmg3',
    shelly1pmminig3: 'shelly1pmminig3',
    shelly2lg3: 'shelly2lg3',
    shelly2pmg3: 'shelly2pmg3',
    shelly3em63g3: 'shellyemg3',
    shellyazplug: 'shellyplugsg3',
    shellyblugwg3: 'shellyblugwg3',
    shellyddimmerg3: 'shellydimmerg3',
    shellydimmerg3: 'shellydimmerg3',
    shellyemg3: 'shellyemg3',
    shellyhtg3: 'shellyhtg3',
    shellyi4g3: 'shellyi4g3',
    shellyoutdoorsg3: 'shellyoutdoorsg3',
    shellypill: 'shellyhtg3',
    shellyplugmg3: 'shellyplugsg3',
    shellyplugpmg3: 'shellyplugsg3',
    shellyplugsg3: 'shellyplugsg3',
    shellypmminig3: 'shellypmminig3',
    shellyshutter: 'shellyshutter',

    // Gen 4
    shelly1g4: 'shelly1g4',
    shelly1minig4: 'shelly1minig4',
    shelly1pmg4: 'shelly1pmg4',
    shelly1pmminig4: 'shelly1pmminig4',
    shelly2pmg4: 'shelly2pmg4',
    shellydimmerg4: 'shellydimmerg4',
    shellyemminig4: 'shellyemminig4',
    shellyfloodg4: 'shellyfloodg4',
    shellypstripg4: 'shelly2pmg4',

    // Powered by Shelly
    irrigation: 'shellyplus1',
    ogemray25a: 'shellyplus1',
    st1820: 'shellyplus1',
    watervalve: 'shellyplus1',
};

// https://shelly.cloud/knowledge-base/devices/
const deviceKnowledgeBase = {
    // Gen 1
    shelly1: 'https://kb.shelly.cloud/knowledge-base/shelly-1',
    shelly1l: 'https://kb.shelly.cloud/knowledge-base/shelly-1l',
    shelly1pm: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1pm',
    shelly2led: undefined,
    shelly4pro: 'https://kb.shelly.cloud/knowledge-base/4shelly-pro-4pm',
    shellybulb: undefined,
    ShellyBulbDuo: 'https://kb.shelly.cloud/knowledge-base/shelly-bulb-duo-rgbw',
    shellybutton1: 'https://kb.shelly.cloud/knowledge-base/shelly-button-1',
    shellycolorbulb: undefined,
    shellydimmer: undefined,
    shellydimmer2: 'https://kb.shelly.cloud/knowledge-base/shelly-dimmer-2',
    shellydw: undefined,
    shellydw2: 'https://kb.shelly.cloud/knowledge-base/shelly-door-window-2',
    shellyem: 'https://kb.shelly.cloud/knowledge-base/shelly-em',
    shellyem3: 'https://kb.shelly.cloud/knowledge-base/shelly-3em',
    shellyflood: 'https://kb.shelly.cloud/knowledge-base/shelly-flood',
    shellygas: 'https://kb.shelly.cloud/knowledge-base/shelly-gas',
    shellyht: 'https://kb.shelly.cloud/knowledge-base/shelly-h-t',
    shellyix3: 'https://kb.shelly.cloud/knowledge-base/shelly-i3',
    shellymotion2: 'https://kb.shelly.cloud/knowledge-base/shelly-motion-2',
    shellymotionsensor: 'https://kb.shelly.cloud/knowledge-base/shelly-motion',
    shellyplug: 'https://kb.shelly.cloud/knowledge-base/shelly-plug',
    'shellyplug-s': 'https://kb.shelly.cloud/knowledge-base/shelly-plug-s',
    shellyrgbw2: 'https://kb.shelly.cloud/knowledge-base/shelly-rgbw2',
    shellysense: undefined,
    shellysmoke: undefined,
    shellyswitch: undefined,
    shellyswitch25: 'https://kb.shelly.cloud/knowledge-base/shelly-2-5',
    shellytrv: 'https://kb.shelly.cloud/knowledge-base/shelly-trv',
    shellyuni: 'https://kb.shelly.cloud/knowledge-base/shelly-uni',
    ShellyVintage: 'https://kb.shelly.cloud/knowledge-base/shelly-vintage',

    // Gen 2
    shelly1mini: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1-mini',
    shelly1pmmini: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1pm-mini',
    shellyblugw: 'https://kb.shelly.cloud/knowledge-base/shellyblu-gateway',
    shellyplus010v: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-0-10v-dimmer',
    shellyplus1: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1',
    shellyplus1pm: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-1pm',
    shellyplus2pm: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-2pm',
    shellyplusht: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-h-t',
    shellyplusi4: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-i4',
    shellyplusplugs: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-plug-s',
    shellyplusrgbwpm: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-rgbw-pm',
    shellyplussmoke: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-smoke',
    shellyplusuni: 'https://kb.shelly.cloud/knowledge-base/shelly-plus-uni',
    shellypmmini: 'https://shelly-api-docs.shelly.cloud/gen2/Devices/ShellyPlusPMMini',
    shellypro0110pm: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-dimmer-0-1-10v-pm',
    shellypro1: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-1',
    shellypro1pm: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-1pm',
    shellypro2: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-2',
    shellypro2cover: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-dual-cover-pm',
    shellypro2pm: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-2pm',
    shellypro3: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-3-v1',
    shellypro3em: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-3em',
    shellypro3em400: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-3em-3ct400',
    shellypro3em63: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-3em-3ct63',
    shellypro4pm: 'https://kb.shelly.cloud/knowledge-base/4shelly-pro-4pm',
    shellyprodm1pm: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-dimmer-1pm',
    shellyprodm2pm: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-dimmer-2pm',
    shellyproem50: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-em-50',
    shellyprorgbwwpm: 'https://kb.shelly.cloud/knowledge-base/shelly-pro-rgbww-pm',
    ShellyWallDisplay: 'https://kb.shelly.cloud/knowledge-base/shelly-wall-display',

    // Gen 3
    shelly0110dimg3: 'https://kb.shelly.cloud/knowledge-base/shelly-dimmer-0-1-10v-pm-gen3',
    shelly1g3: 'https://kb.shelly.cloud/knowledge-base/shelly-1-gen3',
    shelly1lg3: 'https://kb.shelly.cloud/knowledge-base/shelly-1l-gen3',
    shelly1minig3: 'https://kb.shelly.cloud/knowledge-base/shelly-1-mini-gen3',
    shelly1pmg3: 'https://kb.shelly.cloud/knowledge-base/shelly-1pm-gen3',
    shelly1pmminig3: 'https://kb.shelly.cloud/knowledge-base/shelly-1pm-mini-gen3',
    shelly2lg3: 'https://kb.shelly.cloud/knowledge-base/shelly-2l-gen3',
    shelly2pmg3: 'https://kb.shelly.cloud/knowledge-base/shelly-2pm-gen3',
    shelly3em63g3: 'https://kb.shelly.cloud/knowledge-base/shelly-3em-63-gen3',
    shellyazplug: 'https://kb.shelly.cloud/knowledge-base/shelly-az-plug',
    shellyblugwg3: 'https://kb.shelly.cloud/knowledge-base/shelly-blu-gateway-gen3',
    shellyddimmerg3: 'https://kb.shelly.cloud/knowledge-base/shelly-dali-dimmer-gen3',
    shellydimmerg3: 'https://kb.shelly.cloud/knowledge-base/shelly-dimmer-gen3',
    shellyemg3: 'https://kb.shelly.cloud/knowledge-base/shelly-em-gen3',
    shellyhtg3: 'https://kb.shelly.cloud/knowledge-base/shelly-h-t-gen3',
    shellyi4g3: 'https://kb.shelly.cloud/knowledge-base/shelly-i4-gen3',
    shellyoutdoorsg3: 'https://kb.shelly.cloud/knowledge-base/outdoor-plug-s-gen3',
    shellypill: 'https://kb.shelly.cloud/knowledge-base/the-pill-by-shelly',
    shellyplugmg3: 'https://kb.shelly.cloud/knowledge-base/shelly-plug-m-gen3',
    shellyplugpmg3: 'https://kb.shelly.cloud/knowledge-base/shelly-plug-pm-gen3',
    shellyplugsg3: 'https://kb.shelly.cloud/knowledge-base/shelly-plug-s-mtr-gen3',
    shellypmminig3: 'https://kb.shelly.cloud/knowledge-base/shelly-pm-mini-gen3',
    shellyshutter: 'https://kb.shelly.cloud/knowledge-base/shelly-shutter',

    // Gen 4
    shelly1g4: 'https://kb.shelly.cloud/knowledge-base/shelly-1-gen4',
    shelly1minig4: 'https://kb.shelly.cloud/knowledge-base/shelly-1-mini-gen4',
    shelly1pmg4: 'https://kb.shelly.cloud/knowledge-base/shelly-1pm-gen4',
    shelly1pmminig4: 'https://kb.shelly.cloud/knowledge-base/shelly-1pm-mini-gen4',
    shelly2pmg4: 'https://kb.shelly.cloud/knowledge-base/shelly-2pm-gen4',
    shellydimmerg4: 'https://kb.shelly.cloud/knowledge-base/shelly-dimmer-gen4',
    shellyemminig4: 'https://kb.shelly.cloud/knowledge-base/shelly-em-mini-gen4',
    shellyfloodg4: 'https://kb.shelly.cloud/knowledge-base/shelly-flood-gen4',
    shellypstripg4: 'https://kb.shelly.cloud/knowledge-base/shelly-power-strip-gen4',

    // Powered by Shelly
    irrigation: '', // no knowledgebase entry exists
    ogemray25a: 'https://www.shelly.com/de/products/ogemray-25a-smart-relay', // no knowledgebase entry exists
    st1820: '', // no knowledgebase entry exists,
    watervalve: '', // no knowledgebase entry exists,
};

const deviceTypes = {
    // '<deviceClass>': ['<deviceType>', '<deviceType>'],

    // Gen 1
    shelly1: ['SHSW-1'],
    shelly1l: ['SHSW-L'],
    shelly1pm: ['SHSW-PM'],
    shelly2led: ['SH2LED'],
    shelly4pro: ['SHSW-44'],
    shellybulb: ['SHBLB-1'],
    ShellyBulbDuo: ['SHBDUO-1'],
    shellybutton1: ['SHBTN-1', 'SHBTN-2'],
    shellycolorbulb: ['SHCB-1'],
    shellydimmer: ['SHDM-1'],
    shellydimmer2: ['SHDM-2'],
    shellydw: ['SHDW-1'],
    shellydw2: ['SHDW-2'],
    shellyem: ['SHEM'],
    shellyem3: ['SHEM-3'],
    shellyflood: ['SHWT-1'],
    shellygas: ['SHGS-1'],
    shellyht: ['SHHT-1'],
    shellyix3: ['SHIX3-1'],
    shellymotion2: ['SHMOS-02'],
    shellymotionsensor: ['SHMOS-01'],
    shellyplug: ['SHPLG-1'],
    'shellyplug-s': ['SHPLG-S', 'SHPLG2-1'],
    shellyrgbw2: ['SHRGBW2'],
    shellysense: ['SHSEN-1'],
    shellysmoke: ['SHSM-01'],
    shellyswitch: ['SHSW-21'],
    shellyswitch25: ['SHSW-25'],
    shellytrv: ['SHTRV-01'],
    shellyuni: ['SHUNI-1'],
    ShellyVintage: ['SHVIN-1'],

    // Gen 2
    shelly1mini: ['shelly1mini'],
    shelly1pmmini: ['shelly1pmmini'],
    shellyblugw: ['shellyblugw'],
    shellyplus010v: ['shellyplus010v'],
    shellyplus1: ['shellyplus1'],
    shellyplus1pm: ['shellyplus1pm'],
    shellyplus2pm: ['shellyplus2pm'],
    shellyplusht: ['shellyplusht'],
    shellyplusi4: ['shellyplusi4'],
    shellyplusplugs: ['shellyplusplugs'],
    shellyplusrgbwpm: ['shellyplusrgbwpm'],
    shellyplussmoke: ['shellyplussmoke'],
    shellyplusuni: ['shellyplusuni'],
    shellypmmini: ['shellypmmini'],
    shellypro0110pm: ['shellypro0110pm'],
    shellypro1: ['shellypro1'],
    shellypro1pm: ['shellypro1pm'],
    shellypro2: ['shellypro2'],
    shellypro2cover: ['shellypro2cover'],
    shellypro2pm: ['shellypro2pm'],
    shellypro3: ['shellypro3'],
    shellypro3em: ['shellypro3em'],
    shellypro3em400: ['shellypro3em400'],
    shellypro3em63: ['shellypro3em63'],
    shellypro4pm: ['shellypro4pm'],
    shellyprodm1pm: ['shellyprodm1pm'],
    shellyprodm2pm: ['shellyprodm2pm'],
    shellyproem50: ['shellyproem50'],
    shellyprorgbwwpm: ['shellyprorgbwwpm'],
    ShellyWallDisplay: ['ShellyWallDisplay'],

    // Gen 3
    shelly0110dimg3: ['shelly0110dimg3'],
    shelly1g3: ['shelly1g3'],
    shelly1lg3: ['shelly1lg3'],
    shelly1minig3: ['shelly1minig3'],
    shelly1pmg3: ['shelly1pmg3'],
    shelly1pmminig3: ['shelly1pmminig3'],
    shelly2lg3: ['shelly2lg3'],
    shelly2pmg3: ['shelly2pmg3'],
    shelly3em63g3: ['shelly3em63g3'],
    shellyazplug: ['shellyazplug'],
    shellyblugwg3: ['shellyblugwg3'],
    shellyddimmerg3: ['shellyddimmerg3'],
    shellydimmerg3: ['shellydimmerg3'],
    shellyemg3: ['shellyemg3'],
    shellyhtg3: ['shellyhtg3'],
    shellyi4g3: ['shellyi4g3'],
    shellyoutdoorsg3: ['shellyoutdoorsg3'],
    shellypill: ['shellypill'],
    shellyplugmg3: ['shellyplugmg3'],
    shellyplugpmg3: ['shellyplugpmg3'],
    shellyplugsg3: ['shellyplugsg3'],
    shellypmminig3: ['shellypmminig3'],
    shellyshutter: ['shellyshutter'],

    // Gen 4
    shelly1g4: ['shelly1g4'],
    shelly1minig4: ['shelly1minig4'],
    shelly1pmg4: ['shelly1pmg4'],
    shelly1pmminig4: ['shelly1pmminig4'],
    shelly2pmg4: ['shelly2pmg4'],
    shellydimmerg4: ['shellydimmerg4'],
    shellyemminig4: ['shellyemminig4'],
    shellyfloodg4: ['shellyfloodg4'],
    shellypstripg4: ['shellypstripg4'],

    // Powered by Shelly
    irrigation: ['irrigation'],
    ogemray25a: ['ogemray25a'],
    st1820: ['st1820'],
    watervalve: ['watervalve'],
};

/**
 * Poll time of battery-powered devices (sec)
 */
const pollTime = {
    // Gen 1
    shellybutton1: 3600,
    shellydw: 3600,
    shellydw2: 3600,
    shellyflood: 3600,
    shellygas: 3600,
    shellyht: 3600,
    shellymotion2: 3600,
    shellymotionsensor: 3600,
    shellysense: 3600,
    shellysmoke: 3600,

    // Gen 2
    shellyplusht: 3600,
    shellyplussmoke: 3600,

    // Gen 3
    shellyhtg3: 3600,

    // Gen 4
    shellyfloodg4: 3600,
};

/**
 * Copy an object
 *
 * @param obj
 */
function clone(obj) {
    if (obj === null || typeof obj !== 'object' || 'isActiveClone' in obj) {
        return obj;
    }

    let temp;
    if (obj instanceof Date) {
        // @ts-expect-error is a working code ...
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
    if (!devices[deviceClass]) {
        return;
    }

    let device;

    switch (getDeviceGen(deviceClass)) {
        case 4:
            device = clone(Object.assign(Object.assign({}, defaultsgen4), devices[deviceClass]));
            break;
        case 3:
            device = clone(Object.assign(Object.assign({}, defaultsgen3), devices[deviceClass]));
            break;
        case 2:
            device = clone(Object.assign(Object.assign({}, defaultsgen2), devices[deviceClass]));
            break;
        default:
            device = clone(Object.assign(Object.assign({}, defaultsgen1), devices[deviceClass]));
    }

    device = deleteNoDisplay(device, protocol, mode);
    return device;
}

function getDeviceClassByType(deviceType) {
    return Object.keys(deviceTypes).find(key => deviceTypes[key].includes(deviceType));
}

function getDeviceIcon(deviceClass) {
    return deviceIcons?.[deviceClass] || 'relay';
}

function getDeviceGen(deviceClass) {
    return deviceGen?.[deviceClass] ?? 1;
}

function getDeviceGroupByClass(deviceClass) {
    return deviceGroupMap[deviceClass] || 'other';
}

function getDeviceTypeByClass(deviceClass) {
    return deviceTypes[deviceClass] ? deviceTypes[deviceClass][0] : undefined;
}

function getKnowledgeBaseUrlByClass(deviceClass) {
    return deviceKnowledgeBase?.[deviceClass];
}

function getPollTime(deviceClass) {
    return pollTime?.[deviceClass];
}

function getAllDeviceDefinitions() {
    return Object.entries(devices).reduce((o, [deviceClass, device]) => {
        switch (getDeviceGen(deviceClass)) {
            case 4:
                o[deviceClass] = clone(Object.assign(Object.assign({}, defaultsgen4), device));
                break;
            case 3:
                o[deviceClass] = clone(Object.assign(Object.assign({}, defaultsgen3), device));
                break;
            case 2:
                o[deviceClass] = clone(Object.assign(Object.assign({}, defaultsgen2), device));
                break;
            default:
                o[deviceClass] = clone(Object.assign(Object.assign({}, defaultsgen1), device));
        }
        return o;
    }, {});
}

module.exports = {
    getAllDeviceDefinitions,
    getDeviceByClass,
    getDeviceClassByType,
    getDeviceGroupByClass,
    getDeviceGen,
    getDeviceIcon,
    getDeviceTypeByClass,
    getKnowledgeBaseUrlByClass,
    getPollTime,

    // Raw data structures (exposed for testing  only, do NOT use at other code)
    devices,
    deviceGen,
    deviceGroupMap,
    deviceIcons,
    deviceKnowledgeBase,
    deviceTypes,
    pollTime,
};
