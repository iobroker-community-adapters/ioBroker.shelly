'use strict';

const axios = require('axios');

/**
 * DeviceRegistry - Detects Shelly device generation and model
 */
class DeviceRegistry {
    constructor(log) {
        this.log = log;
        this.timeout = 5000; // 5 seconds timeout
    }

    /**
     * Detect device generation and model
     * @param {string} ip - Device IP address
     * @returns {Promise<{gen: string, model: string, fw: string}>}
     */
    async detect(ip) {
        this.log.debug(`[DeviceRegistry] Detecting device at ${ip}`);

        // Try Gen2/Gen3 first (RPC endpoint)
        try {
            const gen2Info = await this.detectGen2(ip);
            if (gen2Info) {
                this.log.debug(`[DeviceRegistry] ${ip} is ${gen2Info.gen} (${gen2Info.model})`);
                return gen2Info;
            }
        } catch (e) {
            this.log.debug(`[DeviceRegistry] ${ip} is not Gen2/3: ${e.message}`);
        }

        // Try Gen1 (HTTP endpoint)
        try {
            const gen1Info = await this.detectGen1(ip);
            if (gen1Info) {
                this.log.debug(`[DeviceRegistry] ${ip} is Gen1 (${gen1Info.model})`);
                return gen1Info;
            }
        } catch (e) {
            this.log.debug(`[DeviceRegistry] ${ip} is not Gen1: ${e.message}`);
        }

        // Unknown device
        this.log.warn(`[DeviceRegistry] ${ip} could not be identified`);
        return {
            gen: 'unknown',
            model: 'unknown',
            fw: 'unknown',
        };
    }

    /**
     * Detect Gen2/Gen3 device via RPC
     * @param {string} ip
     * @returns {Promise<{gen: string, model: string, fw: string}|null>}
     */
    async detectGen2(ip) {
        try {
            // Call Shelly.GetDeviceInfo via RPC
            const response = await axios.post(
                `http://${ip}/rpc/Shelly.GetDeviceInfo`,
                {
                    id: 1,
                    method: 'Shelly.GetDeviceInfo',
                },
                {
                    timeout: this.timeout,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data && response.data.result) {
                const result = response.data.result;
                
                // Determine generation
                let gen = 'gen2';
                if (result.gen && result.gen === 3) {
                    gen = 'gen3';
                }

                return {
                    gen: gen,
                    model: result.model || result.app || 'unknown',
                    fw: result.fw_id || result.ver || 'unknown',
                    id: result.id || null,
                    mac: result.mac || null,
                    auth: result.auth_en || false,
                };
            }

            return null;
        } catch (e) {
            // Not a Gen2/Gen3 device or unreachable
            throw new Error(`Gen2 detection failed: ${e.message}`);
        }
    }

    /**
     * Detect Gen1 device via HTTP
     * @param {string} ip
     * @returns {Promise<{gen: string, model: string, fw: string}|null>}
     */
    async detectGen1(ip) {
        try {
            // Try /shelly endpoint (most Gen1 devices)
            const response = await axios.get(`http://${ip}/shelly`, {
                timeout: this.timeout,
            });

            if (response.data && response.data.type) {
                return {
                    gen: 'gen1',
                    model: response.data.type || 'unknown',
                    fw: response.data.fw || 'unknown',
                    mac: response.data.mac || null,
                    auth: response.data.auth || false,
                };
            }

            return null;
        } catch (e) {
            // Try /status endpoint as fallback
            try {
                const statusResponse = await axios.get(`http://${ip}/status`, {
                    timeout: this.timeout,
                });

                if (statusResponse.data) {
                    // Status endpoint exists, likely Gen1
                    return {
                        gen: 'gen1',
                        model: 'unknown', // Can't determine model from /status alone
                        fw: 'unknown',
                        mac: null,
                        auth: false,
                    };
                }
            } catch (statusError) {
                throw new Error(`Gen1 detection failed: ${e.message}`);
            }

            return null;
        }
    }

    /**
     * Get full status from Gen1 device
     * @param {string} ip
     * @returns {Promise<Object>}
     */
    async getGen1Status(ip) {
        try {
            const response = await axios.get(`http://${ip}/status`, {
                timeout: this.timeout,
            });

            return response.data;
        } catch (e) {
            throw new Error(`Failed to get Gen1 status: ${e.message}`);
        }
    }

    /**
     * Get settings from Gen1 device
     * @param {string} ip
     * @returns {Promise<Object>}
     */
    async getGen1Settings(ip) {
        try {
            const response = await axios.get(`http://${ip}/settings`, {
                timeout: this.timeout,
            });

            return response.data;
        } catch (e) {
            throw new Error(`Failed to get Gen1 settings: ${e.message}`);
        }
    }
}

module.exports = DeviceRegistry;
