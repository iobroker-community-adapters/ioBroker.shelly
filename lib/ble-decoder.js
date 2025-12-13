const rawtext = -1;
const uint8 = 0;
const int8 = 1;
const uint16 = 2;
const int16 = 3;
const uint24 = 4;
const int24 = 5;
const uint32 = 6;
const int32 = 7;

const BTH = {
    // Misc
    0x00: { n: 'pid', t: uint8 },
    0xf0: { n: 'device_type', t: uint16 },
    0xf1: { n: 'firmware_version', t: uint32 },
    0xf2: { n: 'firmware_version', t: uint24 },
    0x60: { n: 'channel', t: uint8 },
    // Sensor data
    0x51: { n: 'acceleration', t: uint16, f: 0.001, u: 'm/s²' },
    0x01: { n: 'battery', t: uint8, u: '%' },
    0x12: { n: 'co2', t: uint16, u: 'ppm' },
    0x09: { n: 'count', t: uint8 },
    0x3d: { n: 'count', t: uint16 },
    0x3e: { n: 'count', t: uint32 },
    0x59: { n: 'count', t: int8 },
    0x5a: { n: 'count', t: int16 },
    0x5b: { n: 'count', t: int32 },
    0x43: { n: 'current', t: uint16, f: 0.001, u: 'A' },
    0x5d: { n: 'current', t: int16, f: 0.001, u: 'A' },
    0x08: { n: 'dewpoint', t: int16, f: 0.01, u: '°C' },
    0x40: { n: 'distance_mm', t: uint16, u: 'mm' },
    0x41: { n: 'distance_m', t: uint16, f: 0.1, u: 'm' },
    0x42: { n: 'duration', t: uint24, f: 0.001, u: 's' },
    0x4d: { n: 'energy', t: uint32, f: 0.001, u: 'kWh' },
    0x0a: { n: 'energy', t: uint24, f: 0.001, u: 'kWh' },
    0x4b: { n: 'gas', t: uint24, f: 0.001, u: 'm3' },
    0x4c: { n: 'gas', t: uint32, f: 0.001, u: 'm3' },
    0x52: { n: 'gyroscope', t: uint16, f: 0.001, u: '°/s' },
    0x03: { n: 'humidity', t: uint16, f: 0.01, u: '%' },
    0x2e: { n: 'humidity', t: uint8, u: '%' },
    0x05: { n: 'illuminance', t: uint24, f: 0.01, u: 'lux' },
    0x06: { n: 'mass_kg', t: uint16, f: 0.01, u: 'kg' },
    0x07: { n: 'mass_lb', t: uint16, f: 0.01, u: 'lb' },
    0x14: { n: 'moisture', t: uint16, f: 0.01, u: '%' },
    0x2f: { n: 'moisture', t: uint8, u: '%' },
    0x0d: { n: 'pm2_5', t: uint16, u: 'ug/m3' },
    0x0e: { n: 'pm10', t: uint16, u: 'ug/m3' },
    0x0b: { n: 'power', t: uint24, f: 0.01, u: 'W' },
    0x5c: { n: 'power', t: int32, f: 0.01, u: 'W' },
    0x04: { n: 'pressure', t: uint24, f: 0.01, u: 'hPa' },
    0x3f: { n: 'rotation', t: int16, f: 0.1, u: '°' },
    0x44: { n: 'speed', t: uint16, f: 0.01, u: 'm/s' },
    0x57: { n: 'temperature', t: int8, u: '°C' },
    0x58: { n: 'temperature', t: int8, f: 0.35, u: '°C' },
    0x45: { n: 'temperature', t: int16, f: 0.1, u: '°C' },
    0x02: { n: 'temperature', t: int16, f: 0.01, u: '°C' },
    0x13: { n: 'tvoc', t: uint16, u: 'ug/m3' },
    0x0c: { n: 'voltage', t: uint16, f: 0.001, u: 'V' },
    0x4a: { n: 'voltage', t: uint16, f: 0.1, u: 'V' },
    0x4e: { n: 'volume', t: uint32, f: 0.001, u: 'l' },
    0x47: { n: 'volume', t: uint16, f: 0.1, u: 'l' },
    0x48: { n: 'volume', t: uint16, u: 'ml' },
    0x55: { n: 'volume_storage', t: uint32, f: 0.001, u: 'l' },
    0x49: { n: 'volume_flowrate', t: uint16, f: 0.001, u: 'm3/h' },
    0x46: { n: 'uv_index', t: uint8, f: 0.1 },
    0x4f: { n: 'water', t: uint32, f: 0.001, u: 'l' },
    0x5e: { n: 'direction', t: uint16, f: 0.01, u: '°' },
    0x5f: { n: 'precipitation', t: uint16, f: 0.1, u: 'mm' },
    // Binary Sensor data
    0x15: { n: 'battery', t: uint8 },
    0x16: { n: 'battery_charging', t: uint8 },
    0x17: { n: 'carbon_monoxide', t: uint8 },
    0x18: { n: 'cold', t: uint8 },
    0x19: { n: 'connectivity', t: uint8 },
    0x1a: { n: 'door', t: uint8 },
    0x1b: { n: 'garage_door', t: uint8 },
    0x1c: { n: 'gas', t: uint8 },
    0x0f: { n: 'generic_boolean', t: uint8 },
    0x1d: { n: 'heat', t: uint8 },
    0x1e: { n: 'light', t: uint8 },
    0x1f: { n: 'lock', t: uint8 },
    0x20: { n: 'rain status', t: uint8 },
    0x21: { n: 'motion', t: uint8 },
    0x22: { n: 'moving', t: uint8 },
    0x23: { n: 'occupancy', t: uint8 },
    0x11: { n: 'opening', t: uint8 },
    0x24: { n: 'plug', t: uint8 },
    0x10: { n: 'power', t: uint8 },
    0x25: { n: 'presence', t: uint8 },
    0x26: { n: 'problem', t: uint8 },
    0x27: { n: 'running', t: uint8 },
    0x28: { n: 'safety', t: uint8 },
    0x29: { n: 'smoke', t: uint8 },
    0x2a: { n: 'sound', t: uint8 },
    0x2b: { n: 'tamper', t: uint8 },
    0x2c: { n: 'vibration', t: uint8 },
    0x2d: { n: 'window', t: uint8 },
    // Events
    0x3a: { n: 'button', t: uint8, b: 1 },
    0x3c: { n: 'dimmer', t: uint8 },
    // Text / Raw
    0x54: { n: 'raw', t: rawtext },
    0x53: { n: 'text', t: rawtext },
};

class BleDecoder {
    utoi(num, bitsz) {
        let mask = 1 << (bitsz - 1);
        return num & mask ? num - (1 << bitsz) : num;
    }

    getUInt8(buffer) {
        return buffer.at(0);
    }
    getInt8(buffer) {
        return this.utoi(this.getUInt8(buffer), 8);
    }
    getUInt16LE(buffer) {
        return 0xffff & ((buffer.at(1) << 8) | buffer.at(0));
    }
    getInt16LE(buffer) {
        return this.utoi(this.getUInt16LE(buffer), 16);
    }
    getUInt24LE(buffer) {
        return 0x00ffffff & ((buffer.at(2) << 16) | (buffer.at(1) << 8) | buffer.at(0));
    }
    getInt24LE(buffer) {
        return this.utoi(this.getUInt24LE(buffer), 24);
    }
    getUInt32LE(buffer) {
        return 0x00ffffffff & ((buffer.at(3) << 24) | (buffer.at(2) << 16) | (buffer.at(1) << 8) | buffer.at(0));
    }
    getInt32LE(buffer) {
        return this.utoi(this.getUInt32LE(buffer), 32);
    }
    getBufValue(type, buffer) {
        if (buffer.length < this.getByteSize(type)) {
            return null;
        }
        let res = null;
        if (type === uint8) {
            res = this.getUInt8(buffer);
        }
        if (type === int8) {
            res = this.getInt8(buffer);
        }
        if (type === uint16) {
            res = this.getUInt16LE(buffer);
        }
        if (type === int16) {
            res = this.getInt16LE(buffer);
        }
        if (type === uint24) {
            res = this.getUInt24LE(buffer);
        }
        if (type === int24) {
            res = this.getInt24LE(buffer);
        }
        if (type === uint32) {
            res = this.getUInt32LE(buffer);
        }
        if (type === int32) {
            res = this.getInt32LE(buffer);
        }
        return res;
    }
    getByteSize(type) {
        if (type === uint8 || type === int8) {
            return 1;
        }
        if (type === uint16 || type === int16) {
            return 2;
        }
        if (type === uint24 || type === int24) {
            return 3;
        }
        // impossible as advertisements are much smaller
        return 255;
    }
    unpack(buffer, encryptedPayload) {
        // beacons might not provide BTH service data
        if (buffer.length === 0) {
            return null;
        }

        let result = {};
        if (!encryptedPayload) {
            let _dib = buffer.at(0);
            result['encryption'] = _dib & 0x1 ? true : false;
            result['BTHome_version'] = _dib >> 5;
            if (result['BTHome_version'] !== 2) {
                //return null;
            }
            // can not handle encrypted data
            if (result['encryption']) {
                return result;
            }
            buffer = buffer.slice(1);
        }

        let _value;
        let _name;
        let _btnNum = 1;

        while (buffer.length > 0) {
            const _bth = BTH[buffer.at(0)];
            if (typeof _bth === 'undefined') {
                break;
            }

            buffer = buffer.slice(1);
            _name = _bth.n;

            // FIX: Ecowitt WS90 sends 0x44 twice.
            // First time is 'speed' (Wind Speed), second time is 'gust_speed' (Gust Speed).
            // If 'speed' is already present in the result, rename this one to 'gust_speed'.
            if (_byteId === 0x44 && typeof result['speed'] !== 'undefined') {
                _name = 'gust_speed';
            }

            if (_bth.t === rawtext) {
                // text and raw values
                // TODO: not implemented
                _value = 'not_implemented';
            } else {
                _value = this.getBufValue(_bth.t, buffer);
                if (_value === null) {
                    break;
                }

                if (typeof _bth.f !== 'undefined') {
                    _value = _value * _bth.f;
                }

                if (typeof _bth.b !== 'undefined') {
                    _name = `${_name}_${_btnNum.toString()}`;
                    _btnNum++;
                }
            }

            result[_name] = _value;
            buffer = buffer.slice(this.getByteSize(_bth.t));
        }

        return result;
    }
}

module.exports = {
    BleDecoder,
};
