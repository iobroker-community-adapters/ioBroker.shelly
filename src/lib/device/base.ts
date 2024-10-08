import * as utils from '@iobroker/adapter-core';

export abstract class BaseDevice {
    protected adapter: utils.AdapterInstance;
    protected deviceId: string | undefined;

    constructor(adapter: utils.AdapterInstance) {
        this.adapter = adapter;

        // Handle firmware updates
        // this.eventEmitter.on('onFirmwareUpdate', async () => await this.firmwareUpdate());
    }

    public async init(deviceId: string, gen: number): Promise<void> {
        this.deviceId = deviceId;

        await this.adapter.extendObject(deviceId, {
            type: 'device',
            common: {
                name: `Device ${deviceId}`,
                desc: `Gen ${gen}`,
                statusStates: {
                    onlineId: `${this.adapter.namespace}.${deviceId}.online`,
                },
            },
            native: {},
        });

        await this.adapter.extendObject(`${deviceId}.online`, {
            type: 'state',
            common: {
                name: {
                    en: 'Device online',
                    de: 'Gerät online',
                    ru: 'Устройство онлайн',
                    pt: 'Dispositivo online',
                    nl: 'Device online',
                    fr: 'Appareil en ligne',
                    it: 'Dispositivo online',
                    es: 'Dispositivo en línea',
                    pl: 'Device online',
                    uk: 'Пристрої онлайн',
                    'zh-cn': '网上证人',
                },
                type: 'boolean',
                role: 'indicator.reachable',
                read: true,
                write: false,
                icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMi4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNTQuMiAyMDIuOUMxMjMuMiAxMzYuNyAyMTYuOCA5NiAzMjAgOTZzMTk2LjggNDAuNyAyNjUuOCAxMDYuOWMxMi44IDEyLjIgMzMgMTEuOCA0NS4yLS45czExLjgtMzMtLjktNDUuMkM1NDkuNyA3OS41IDQ0MC40IDMyIDMyMCAzMlM5MC4zIDc5LjUgOS44IDE1Ni43Qy0yLjkgMTY5LTMuMyAxODkuMiA4LjkgMjAyczMyLjUgMTMuMiA0NS4yIC45ek0zMjAgMjU2YzU2LjggMCAxMDguNiAyMS4xIDE0OC4yIDU2YzEzLjMgMTEuNyAzMy41IDEwLjQgNDUuMi0yLjhzMTAuNC0zMy41LTIuOC00NS4yQzQ1OS44IDIxOS4yIDM5MyAxOTIgMzIwIDE5MnMtMTM5LjggMjcuMi0xOTAuNSA3MmMtMTMuMyAxMS43LTE0LjUgMzEuOS0yLjggNDUuMnMzMS45IDE0LjUgNDUuMiAyLjhjMzkuNS0zNC45IDkxLjMtNTYgMTQ4LjItNTZ6bTY0IDE2MGMwLTM1LjMtMjguNy02NC02NC02NHMtNjQgMjguNy02NCA2NHMyOC43IDY0IDY0IDY0czY0LTI4LjcgNjQtNjR6Ii8+PC9zdmc+',
            },
            native: {},
        });
        await this.adapter.setState(`${deviceId}.online`, { val: true, ack: true });

        await this.adapter.extendObject(`${deviceId}.gen`, {
            type: 'state',
            common: {
                name: {
                    en: 'Device generation',
                    de: 'Gerätegeneration',
                    ru: 'Генерация устройства',
                    pt: 'Geração de dispositivos',
                    nl: 'Vernietigingsgeneratie',
                    fr: "Production d'appareils",
                    it: 'Generazione di dispositivi',
                    es: 'Generación de dispositivos',
                    pl: 'Pokolenie Device',
                    uk: 'Виробництво',
                    'zh-cn': '代 人',
                },
                type: 'number',
                role: 'state',
                read: true,
                write: false,
                states: {
                    '1': 'Generation 1',
                    '2': 'Generation 2',
                    '3': 'Generation 3',
                },
            },
            native: {},
        });
        await this.adapter.setState(`${deviceId}.gen`, { val: gen, ack: true });

        await this.adapter.extendObject(`${deviceId}.version`, {
            type: 'state',
            common: {
                name: {
                    en: 'Firmware version',
                    de: 'Firmware-Version',
                    ru: 'Версия прошивки',
                    pt: 'Versão de firmware',
                    nl: 'Firmware',
                    fr: 'Firmware version',
                    it: 'Versione firmware',
                    es: 'Versión de firmware',
                    pl: 'Okładka',
                    uk: 'Версія прошивки',
                    'zh-cn': '导 言',
                },
                type: 'string',
                role: 'state',
                read: true,
                write: false,
                icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMi4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMTc2IDI0YzAtMTMuMy0xMC43LTI0LTI0LTI0cy0yNCAxMC43LTI0IDI0VjY0Yy0zNS4zIDAtNjQgMjguNy02NCA2NEgyNGMtMTMuMyAwLTI0IDEwLjctMjQgMjRzMTAuNyAyNCAyNCAyNEg2NHY1NkgyNGMtMTMuMyAwLTI0IDEwLjctMjQgMjRzMTAuNyAyNCAyNCAyNEg2NHY1NkgyNGMtMTMuMyAwLTI0IDEwLjctMjQgMjRzMTAuNyAyNCAyNCAyNEg2NGMwIDM1LjMgMjguNyA2NCA2NCA2NHY0MGMwIDEzLjMgMTAuNyAyNCAyNCAyNHMyNC0xMC43IDI0LTI0VjQ0OGg1NnY0MGMwIDEzLjMgMTAuNyAyNCAyNCAyNHMyNC0xMC43IDI0LTI0VjQ0OGg1NnY0MGMwIDEzLjMgMTAuNyAyNCAyNCAyNHMyNC0xMC43IDI0LTI0VjQ0OGMzNS4zIDAgNjQtMjguNyA2NC02NGg0MGMxMy4zIDAgMjQtMTAuNyAyNC0yNHMtMTAuNy0yNC0yNC0yNEg0NDhWMjgwaDQwYzEzLjMgMCAyNC0xMC43IDI0LTI0cy0xMC43LTI0LTI0LTI0SDQ0OFYxNzZoNDBjMTMuMyAwIDI0LTEwLjcgMjQtMjRzLTEwLjctMjQtMjQtMjRINDQ4YzAtMzUuMy0yOC43LTY0LTY0LTY0VjI0YzAtMTMuMy0xMC43LTI0LTI0LTI0cy0yNCAxMC43LTI0IDI0VjY0SDI4MFYyNGMwLTEzLjMtMTAuNy0yNC0yNC0yNHMtMjQgMTAuNy0yNCAyNFY2NEgxNzZWMjR6TTE2MCAxMjhIMzUyYzE3LjcgMCAzMiAxNC4zIDMyIDMyVjM1MmMwIDE3LjctMTQuMyAzMi0zMiAzMkgxNjBjLTE3LjcgMC0zMi0xNC4zLTMyLTMyVjE2MGMwLTE3LjcgMTQuMy0zMiAzMi0zMnptMTkyIDMySDE2MFYzNTJIMzUyVjE2MHoiLz48L3N2Zz4=',
            },
            native: {},
        });
    }

    protected async setBaseDeviceState(id: 'version' | 'gen', val: ioBroker.StateValue): ioBroker.SetStatePromise {
        return this.adapter.setState(`${this.deviceId}.${id}`, { val, ack: true });
    }

    public abstract setName(name: string): void;

    public abstract onMessagePublish(topic: string, payload: string): void;
}
