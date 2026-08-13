import type { DeviceDefinition } from './deviceTypes';
// Defaults
import { defaultsgen1, defaultsgen2, defaultsgen3, defaultsgen4 } from './devices/default';

// Gen 1
import { shelly1 } from './devices/gen1/shelly1';
import { shelly1l } from './devices/gen1/shelly1l';
import { shelly1pm } from './devices/gen1/shelly1pm';
import { shelly2led } from './devices/gen1/shelly2led';
import { shelly4pro } from './devices/gen1/shelly4pro';
import { shellybulb } from './devices/gen1/shellybulb';
import { shellybulbduo } from './devices/gen1/shellybulbduo';
import { shellybutton1 } from './devices/gen1/shellybutton1';
import { shellycolorbulb } from './devices/gen1/shellycolorbulb';
import { shellydimmer } from './devices/gen1/shellydimmer';
import { shellydimmer2 } from './devices/gen1/shellydimmer2';
import { shellydw } from './devices/gen1/shellydw';
import { shellydw2 } from './devices/gen1/shellydw2';
import { shellyem } from './devices/gen1/shellyem';
import { shellyem3 } from './devices/gen1/shellyem3';
import { shellyflood } from './devices/gen1/shellyflood';
import { shellygas } from './devices/gen1/shellygas';
import { shellyht } from './devices/gen1/shellyht';
import { shellyix3 } from './devices/gen1/shellyix3';
import { shellymotion2 } from './devices/gen1/shellymotion2';
import { shellymotionsensor } from './devices/gen1/shellymotionsensor';
import { shellyplug } from './devices/gen1/shellyplug';
import { shellyplugs } from './devices/gen1/shellyplugs';
import { shellyrgbw2 } from './devices/gen1/shellyrgbw2';
import { shellysense } from './devices/gen1/shellysense';
import { shellysmoke } from './devices/gen1/shellysmoke';
import { shellyswitch } from './devices/gen1/shellyswitch';
import { shellyswitch25 } from './devices/gen1/shellyswitch25';
import { shellytrv } from './devices/gen1/shellytrv';
import { shellyuni } from './devices/gen1/shellyuni';
import { shellyvintage } from './devices/gen1/shellyvintage';

// Gen 2
import { shelly1mini } from './devices/gen2/shelly1mini';
import { shelly1pmmini } from './devices/gen2/shelly1pmmini';
import { shellyblugw } from './devices/gen2/shellyblugw';
import { shellyplus010v } from './devices/gen2/shellyplus010v';
import { shellyplus1 } from './devices/gen2/shellyplus1';
import { shellyplus1pm } from './devices/gen2/shellyplus1pm';
import { shellyplus2pm } from './devices/gen2/shellyplus2pm';
import { shellyplusht } from './devices/gen2/shellyplusht';
import { shellyplusi4 } from './devices/gen2/shellyplusi4';
import { shellyplusplugs } from './devices/gen2/shellyplusplugs';
import { shellyplusrgbwpm } from './devices/gen2/shellyplusrgbwpm';
import { shellyplussmoke } from './devices/gen2/shellyplussmoke';
import { shellyplusuni } from './devices/gen2/shellyplusuni';
import { shellypmmini } from './devices/gen2/shellypmmini';
import { shellypro0110pm } from './devices/gen2/shellypro0110pm';
import { shellypro1 } from './devices/gen2/shellypro1';
import { shellypro1pm } from './devices/gen2/shellypro1pm';
import { shellypro2 } from './devices/gen2/shellypro2';
import { shellypro2cover } from './devices/gen2/shellypro2cover';
import { shellypro2pm } from './devices/gen2/shellypro2pm';
import { shellypro3 } from './devices/gen2/shellypro3';
import { shellypro3em } from './devices/gen2/shellypro3em';
import { shellypro3em400 } from './devices/gen2/shellypro3em400';
import { shellypro3em63 } from './devices/gen2/shellypro3em63';
import { shellypro4pm } from './devices/gen2/shellypro4pm';
import { shellyprodm1pm } from './devices/gen2/shellyprodm1pm';
import { shellyprodm2pm } from './devices/gen2/shellyprodm2pm';
import { shellyproem50 } from './devices/gen2/shellyproem50';
import { shellyprorgbwwpm } from './devices/gen2/shellyprorgbwwpm';
import { shellywalldisplay } from './devices/gen2/shellywalldisplay';

// Gen 3
import { shelly0110dimg3 } from './devices/gen3/shelly0110dimg3';
import { shelly1g3 } from './devices/gen3/shelly1g3';
import { shelly1lg3 } from './devices/gen3/shelly1lg3';
import { shelly1minig3 } from './devices/gen3/shelly1minig3';
import { shelly1pmg3 } from './devices/gen3/shelly1pmg3';
import { shelly1pmminig3 } from './devices/gen3/shelly1pmminig3';
import { shelly2lg3 } from './devices/gen3/shelly2lg3';
import { shelly2pmg3 } from './devices/gen3/shelly2pmg3';
import { shelly3em63g3 } from './devices/gen3/shelly3em63g3';
import { shellyazplug } from './devices/gen3/shellyazplug';
import { shellyblugwg3 } from './devices/gen3/shellyblugwg3';
import { shellyddimmerg3 } from './devices/gen3/shellyddimmerg3';
import { shellydimmerg3 } from './devices/gen3/shellydimmerg3';
import { shellyemg3 } from './devices/gen3/shellyemg3';
import { shellyhtg3 } from './devices/gen3/shellyhtg3';
import { shellyi4g3 } from './devices/gen3/shellyi4g3';
import { shellyoutdoorsg3 } from './devices/gen3/shellyoutdoorsg3';
import { shellypill } from './devices/gen3/shellypill';
import { shellyplugmg3 } from './devices/gen3/shellyplugmg3';
import { shellyplugpmg3 } from './devices/gen3/shellyplugpmg3';
import { shellyplugsg3 } from './devices/gen3/shellyplugsg3';
import { shellypmminig3 } from './devices/gen3/shellypmminig3';
import { shellyshutter } from './devices/gen3/shellyshutter';

// Gen 4
import { shelly0110dimg4 } from './devices/gen4/shelly0110dimg4';
import { shelly1g4 } from './devices/gen4/shelly1g4';
import { shelly1minig4 } from './devices/gen4/shelly1minig4';
import { shelly1pmg4 } from './devices/gen4/shelly1pmg4';
import { shelly1pmminig4 } from './devices/gen4/shelly1pmminig4';
import { shelly2pmg4 } from './devices/gen4/shelly2pmg4';
import { shellydimmerg4 } from './devices/gen4/shellydimmerg4';
import { shellyemg4 } from './devices/gen4/shellyemg4';
import { shellyemminig4 } from './devices/gen4/shellyemminig4';
import { shellyfloodg4 } from './devices/gen4/shellyfloodg4';
import { shellypresence } from './devices/gen4/shellypresence';
import { shellypstripg4 } from './devices/gen4/shellypstripg4';

// Pwowered by Shelly
import { cury } from './devices/poweredbyshelly/cury';
import { hiluxds8 } from './devices/poweredbyshelly/hiluxds8';
import { irrigation } from './devices/poweredbyshelly/irrigation';
import { ogemray25a } from './devices/poweredbyshelly/ogemray25a';
import { st1820 } from './devices/poweredbyshelly/st1820';
import { watervalve } from './devices/poweredbyshelly/watervalve';

const devices: Record<string, DeviceDefinition> = {
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
    shelly0110dimg4,
    shelly1g4,
    shelly1minig4,
    shelly1pmg4,
    shelly1pmminig4,
    shelly2pmg4,
    shellydimmerg4,
    shellyemg4,
    shellyemminig4,
    shellyfloodg4,
    shellypresence,
    shellypstripg4,

    // poweredbyshelly
    cury,
    hiluxds8,
    irrigation,
    ogemray25a,
    st1820,
    watervalve,
};

const deviceGen: Record<string, number> = {
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
    shelly0110dimg4: 4,
    shelly1g4: 4,
    shelly1minig4: 4,
    shelly1pmg4: 4,
    shelly1pmminig4: 4,
    shelly2pmg4: 4,
    shellydimmerg4: 4,
    shellyemg4: 4,
    shellyemminig4: 4,
    shellyfloodg4: 4,
    shellypresence: 4,
    shellypstripg4: 4,

    // Powered by Shelly
    cury: 3,
    hiluxds8: 3,
    irrigation: 3,
    ogemray25a: 3,
    st1820: 3,
    watervalve: 3,
};

/** Map device class to group key */
const deviceGroupMap: Record<string, string> = {
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
    shelly0110dimg4: 'dimmer',
    shelly1g4: 'relay',
    shelly1minig4: 'relay',
    shelly1pmg4: 'relay',
    shelly1pmminig4: 'relay',
    shelly2pmg4: 'relay',
    shellydimmerg4: 'dimmer',
    shellyemg4: 'meter',
    shellyemminig4: 'meter',
    shellyfloodg4: 'sensor',
    shellypresence: 'sensor',
    shellypstripg4: 'light',

    // Powered by Shelly
    cury: 'other',
    hiluxds8: 'light',
    irrigation: 'other',
    ogemray25a: 'other',
    st1820: 'other',
    watervalve: 'other',
};

const deviceIcons: Record<string, string> = {
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
    shelly0110dimg4: 'shellydimmerg4',
    shelly1g4: 'shelly1g4',
    shelly1minig4: 'shelly1minig4',
    shelly1pmg4: 'shelly1pmg4',
    shelly1pmminig4: 'shelly1pmminig4',
    shelly2pmg4: 'shelly2pmg4',
    shellydimmerg4: 'shellydimmerg4',
    shellyemg4: 'shellyemg3',
    shellyemminig4: 'shellyemminig4',
    shellyfloodg4: 'shellyfloodg4',
    shellypresence: 'shellypresence',
    shellypstripg4: 'shelly2pmg4',

    // Powered by Shelly
    cury: 'cury',
    hiluxds8: 'shellyprorgbwwpm',
    irrigation: 'shellyplus1',
    ogemray25a: 'shellyplus1',
    st1820: 'shellyplus1',
    watervalve: 'shellyplus1',
};

// https://shelly.cloud/knowledge-base/devices/
const deviceKnowledgeBase: Record<string, string | undefined> = {
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
    shelly0110dimg4: 'https://kb.shelly.cloud/knowledge-base/shelly-dimmer-0-1-10v-pm-gen4',
    shelly1g4: 'https://kb.shelly.cloud/knowledge-base/shelly-1-gen4',
    shelly1minig4: 'https://kb.shelly.cloud/knowledge-base/shelly-1-mini-gen4',
    shelly1pmg4: 'https://kb.shelly.cloud/knowledge-base/shelly-1pm-gen4',
    shelly1pmminig4: 'https://kb.shelly.cloud/knowledge-base/shelly-1pm-mini-gen4',
    shelly2pmg4: 'https://kb.shelly.cloud/knowledge-base/shelly-2pm-gen4',
    shellydimmerg4: 'https://kb.shelly.cloud/knowledge-base/shelly-dimmer-gen4',
    shellyemg4: 'https://kb.shelly.cloud/knowledge-base/shelly-em-gen4',
    shellyemminig4: 'https://kb.shelly.cloud/knowledge-base/shelly-em-mini-gen4',
    shellyfloodg4: 'https://kb.shelly.cloud/knowledge-base/shelly-flood-gen4',
    shellypresence: 'https://kb.shelly.cloud/knowledge-base/shelly-presence-gen4',
    shellypstripg4: 'https://kb.shelly.cloud/knowledge-base/shelly-power-strip-gen4',

    // Powered by Shelly
    cury: 'https://kb.shelly.cloud/knowledge-base/cury',
    hiluxds8: undefined, // no knowledgebase entry exists
    irrigation: undefined, // no knowledgebase entry exists
    ogemray25a: 'https://www.shelly.com/de/products/ogemray-25a-smart-relay',
    st1820: undefined, // no knowledgebase entry exists,
    watervalve: undefined, // no knowledgebase entry exists,
};

const deviceTypes: Record<string, string[]> = {
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
    shelly0110dimg4: ['shelly0110dimg4'],
    shelly1g4: ['shelly1g4'],
    shelly1minig4: ['shelly1minig4'],
    shelly1pmg4: ['shelly1pmg4'],
    shelly1pmminig4: ['shelly1pmminig4'],
    shelly2pmg4: ['shelly2pmg4'],
    shellydimmerg4: ['shellydimmerg4'],
    shellyemg4: ['shellyemg4'],
    shellyemminig4: ['shellyemminig4'],
    shellyfloodg4: ['shellyfloodg4'],
    shellypresence: ['shellypresence'],
    shellypstripg4: ['shellypstripg4'],

    // Powered by Shelly
    cury: ['cury'],
    hiluxds8: ['hiluxds8'],
    irrigation: ['irrigation'],
    ogemray25a: ['ogemray25a'],
    st1820: ['st1820'],
    watervalve: ['watervalve'],
};

/**
 * Poll time of battery-powered devices (sec)
 */
const pollTime: Record<string, number> = {
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
function clone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    const source = obj as Record<string, unknown>;
    if ('isActiveClone' in source) {
        return obj;
    }

    let temp: Record<string, unknown>;
    if (source instanceof Date) {
        temp = new (source.constructor as new () => Record<string, unknown>)(); // or new Date(obj);
    } else {
        temp = (source.constructor as () => Record<string, unknown>)();
    }

    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            source.isActiveClone = null;
            temp[key] = clone(source[key]);
            delete source.isActiveClone;
        }
    }

    return temp as T;
}

function deleteNoDisplay(device: DeviceDefinition, protocol: 'coap' | 'mqtt', mode?: string): DeviceDefinition {
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

function getDeviceByClass(deviceClass: string, protocol: 'coap' | 'mqtt', mode?: string): DeviceDefinition | undefined {
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

function getDeviceClassByType(deviceType: string | undefined): string | undefined {
    return Object.keys(deviceTypes).find(key => deviceType !== undefined && deviceTypes[key].includes(deviceType));
}

function getDeviceIcon(deviceClass: string): string {
    return deviceIcons?.[deviceClass] || 'relay';
}

function getDeviceGen(deviceClass: string): number {
    return deviceGen?.[deviceClass] ?? 1;
}

function getDeviceGroupByClass(deviceClass: string): string {
    return deviceGroupMap[deviceClass] || 'other';
}

function getDeviceTypeByClass(deviceClass: string): string | undefined {
    return deviceTypes[deviceClass] ? deviceTypes[deviceClass][0] : undefined;
}

function getKnowledgeBaseUrlByClass(deviceClass: string): string | undefined {
    return deviceKnowledgeBase?.[deviceClass];
}

function getPollTime(deviceClass: string): number | undefined {
    return pollTime?.[deviceClass];
}

function getAllDeviceDefinitions(): Record<string, DeviceDefinition> {
    return Object.entries(devices).reduce((o: Record<string, DeviceDefinition>, [deviceClass, device]) => {
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

export {
    getAllDeviceDefinitions,
    getDeviceByClass,
    getDeviceClassByType,
    getDeviceGroupByClass,
    getDeviceGen,
    getDeviceIcon,
    getDeviceTypeByClass,
    getKnowledgeBaseUrlByClass,
    getPollTime,

    // Raw data structures (exposed for testing only, do NOT use elsewhere)
    devices,
    deviceGen,
    deviceGroupMap,
    deviceIcons,
    deviceKnowledgeBase,
    deviceTypes,
    pollTime,
};
