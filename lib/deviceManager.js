'use strict';

const { DeviceManagement } = require('@iobroker/dm-utils');

/**
 * DeviceManager Class
 */
class ShellyDeviceManagement extends DeviceManagement {
    /**
     * Initialize Class with Adapter
     *
     * @param adapter Adapter Reference
     */
    constructor(adapter) {
        super(adapter);
        this.adapter = adapter;
    }
    /**
     * List all LoRaWAN devices
     */
    async listDevices() {
        const arrDevices = [];
        const devices = await this.adapter.getDevicesAsync();

        for (const device of devices) {
            // Check for logging
            const res = {
                id: device._id,
                name: device.common.name,
                icon: await this.getIcon(device),
                manufacturer: 'Shelly',
                model: 'Shelly', // - ${value.uplink.remaining.rxInfo[0].rssi.ts}`,
                status: this.adapter.onlineDevices[device._id.substring(this.adapter.namespace.length + 1)],
                hasDetails: false,
                actions: [
                    {
                        id: 'rename',
                        icon: 'edit',
                        description: { en: 'Rename this device' },
                        handler: async (_id, context) => await this.handleRenameDevice(_id, context),
                    },
                ],
            };
            if (res.status.connection === 'connected') {
                res.actions.push({
                    id: 'config',
                    icon: 'settings',
                    description: { en: 'Config this device' },
                    handler: undefined, //async (_id, context) => await this.handleRenameDevice(_id, context),
                });
                res.actions.push({
                    id: 'Info',
                    icon: 'lines',
                    description: { en: 'Info of this device' },
                    handler: undefined, //async (_id, context) => await this.handleRenameDevice(_id, context),
                });
            }
            arrDevices.push(res);
        }
        return arrDevices;
    }

    /**
     *
     * @param deviceValue values of device
     */
    async getIcon(deviceValue) {
        // if (deviceValue.indicators) {
        //     if (deviceValue.indicators.isThermostat) {
        //         return 'thermostat';
        //     } else if (deviceValue.indicators.isDoor) {
        //         return 'door';
        //     } else if (deviceValue.indicators.isWindow) {
        //         return 'window';
        //     }
        // }
        return 'node';
    }

    /**
     *
     * @param id ID to rename
     * @param context context sendet from Backend
     */
    async handleRenameDevice(id, context) {
        const result = await context.showForm(
            {
                type: 'panel',
                items: {
                    newName: {
                        type: 'text',
                        trim: false,
                        placeholder: '',
                    },
                },
            },
            {
                data: {
                    newName: '',
                },
                title: {
                    en: 'Enter new name',
                    de: 'Neuen Namen eingeben',
                    ru: 'Введите новое имя',
                    pt: 'Digite um novo nome',
                    nl: 'Voer een nieuwe naam in',
                    fr: 'Entrez un nouveau nom',
                    it: 'Inserisci un nuovo nome',
                    es: 'Ingrese un nuevo nombre',
                    pl: 'Wpisz nowe imię',
                    'zh-cn': '输入新名称',
                    uk: "Введіть нове ім'я",
                },
            },
        );
        if (result?.newName === undefined || result?.newName === '') {
            return { refresh: false };
        }
        const obj = {
            common: {
                name: result.newName,
            },
        };
        const res = await this.adapter.extendForeignObjectAsync(id, obj);
        if (res === null) {
            this.adapter.log.warn(`Can not rename device ${id}: ${JSON.stringify(res)}`);
            return { refresh: false };
        }
        return { refresh: true };
    }
}

module.exports = ShellyDeviceManagement;
