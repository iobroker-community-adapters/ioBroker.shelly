'use strict';

const axios = require('axios');
const WebSocket = require('ws');

/**
 * ShellyRpcClient - RPC client for Gen2/Gen3 devices
 */
class ShellyRpcClient {
    constructor(log) {
        this.log = log;
        this.timeout = 5000;
        this.requestId = 1;
        this.wsConnections = {}; // WebSocket connections per device
    }

    /**
     * Get next request ID
     */
    getNextId() {
        return this.requestId++;
    }

    /**
     * Call RPC method via HTTP
     * @param {string} ip - Device IP
     * @param {string} method - RPC method name
     * @param {Object} params - Method parameters
     * @returns {Promise<any>}
     */
    async call(ip, method, params = {}) {
        try {
            const requestId = this.getNextId();
            
            this.log.debug(`[RPC] Calling ${method} on ${ip} (id: ${requestId})`);

            const response = await axios.post(
                `http://${ip}/rpc`,
                {
                    id: requestId,
                    method: method,
                    params: params,
                },
                {
                    timeout: this.timeout,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.error) {
                throw new Error(`RPC Error: ${JSON.stringify(response.data.error)}`);
            }

            return response.data.result;
        } catch (e) {
            this.log.debug(`[RPC] Call to ${ip} failed: ${e.message}`);
            throw new Error(`RPC call failed: ${e.message}`);
        }
    }

    /**
     * Get device info
     * @param {string} ip
     * @returns {Promise<Object>}
     */
    async getDeviceInfo(ip) {
        return await this.call(ip, 'Shelly.GetDeviceInfo');
    }

    /**
     * Get Shelly info (includes ID)
     * @param {string} ip
     * @returns {Promise<Object>}
     */
    async getShelly(ip) {
        return await this.call(ip, 'Shelly.GetDeviceInfo');
    }

    /**
     * Get device status
     * @param {string} ip
     * @returns {Promise<Object>}
     */
    async getStatus(ip) {
        return await this.call(ip, 'Shelly.GetStatus');
    }

    /**
     * Get device config
     * @param {string} ip
     * @returns {Promise<Object>}
     */
    async getConfig(ip) {
        return await this.call(ip, 'Shelly.GetConfig');
    }

    /**
     * Get switch status
     * @param {string} ip
     * @param {number} id - Switch ID (0, 1, 2, ...)
     * @returns {Promise<Object>}
     */
    async getSwitchStatus(ip, id) {
        return await this.call(ip, 'Switch.GetStatus', { id });
    }

    /**
     * Set switch state
     * @param {string} ip
     * @param {number} id - Switch ID
     * @param {Object} params - Parameters (e.g., {on: true})
     * @returns {Promise<Object>}
     */
    async switchSet(ip, id, params) {
        return await this.call(ip, 'Switch.Set', { id, ...params });
    }

    /**
     * Toggle switch
     * @param {string} ip
     * @param {number} id - Switch ID
     * @returns {Promise<Object>}
     */
    async switchToggle(ip, id) {
        return await this.call(ip, 'Switch.Toggle', { id });
    }

    /**
     * Get cover status
     * @param {string} ip
     * @param {number} id - Cover ID
     * @returns {Promise<Object>}
     */
    async getCoverStatus(ip, id) {
        return await this.call(ip, 'Cover.GetStatus', { id });
    }

    /**
     * Open cover
     * @param {string} ip
     * @param {number} id - Cover ID
     * @returns {Promise<Object>}
     */
    async coverOpen(ip, id) {
        return await this.call(ip, 'Cover.Open', { id });
    }

    /**
     * Close cover
     * @param {string} ip
     * @param {number} id - Cover ID
     * @returns {Promise<Object>}
     */
    async coverClose(ip, id) {
        return await this.call(ip, 'Cover.Close', { id });
    }

    /**
     * Stop cover
     * @param {string} ip
     * @param {number} id - Cover ID
     * @returns {Promise<Object>}
     */
    async coverStop(ip, id) {
        return await this.call(ip, 'Cover.Stop', { id });
    }

    /**
     * Set cover position
     * @param {string} ip
     * @param {number} id - Cover ID
     * @param {number} pos - Position (0-100)
     * @returns {Promise<Object>}
     */
    async coverGoToPosition(ip, id, pos) {
        return await this.call(ip, 'Cover.GoToPosition', { id, pos });
    }

    /**
     * Get light status
     * @param {string} ip
     * @param {number} id - Light ID
     * @returns {Promise<Object>}
     */
    async getLightStatus(ip, id) {
        return await this.call(ip, 'Light.GetStatus', { id });
    }

    /**
     * Set light state
     * @param {string} ip
     * @param {number} id - Light ID
     * @param {Object} params - Parameters (e.g., {on: true, brightness: 50})
     * @returns {Promise<Object>}
     */
    async lightSet(ip, id, params) {
        return await this.call(ip, 'Light.Set', { id, ...params });
    }

    /**
     * Get input status
     * @param {string} ip
     * @param {number} id - Input ID
     * @returns {Promise<Object>}
     */
    async getInputStatus(ip, id) {
        return await this.call(ip, 'Input.GetStatus', { id });
    }

    /**
     * Reboot device
     * @param {string} ip
     * @returns {Promise<Object>}
     */
    async reboot(ip) {
        return await this.call(ip, 'Shelly.Reboot');
    }

    /**
     * Check for firmware update
     * @param {string} ip
     * @returns {Promise<Object>}
     */
    async checkForUpdate(ip) {
        return await this.call(ip, 'Shelly.CheckForUpdate');
    }

    /**
     * Start firmware update
     * @param {string} ip
     * @param {string} stage - Update stage ('stable' or 'beta')
     * @returns {Promise<Object>}
     */
    async update(ip, stage = 'stable') {
        return await this.call(ip, 'Shelly.Update', { stage });
    }

    /**
     * Connect WebSocket for real-time updates
     * @param {string} ip
     * @param {Function} onMessage - Callback for messages
     * @returns {Promise<WebSocket>}
     */
    async connectWebSocket(ip, onMessage) {
        return new Promise((resolve, reject) => {
            try {
                const ws = new WebSocket(`ws://${ip}/rpc`);

                ws.on('open', () => {
                    this.log.debug(`[RPC] WebSocket connected to ${ip}`);
                    this.wsConnections[ip] = ws;
                    resolve(ws);
                });

                ws.on('message', (data) => {
                    try {
                        const message = JSON.parse(data.toString());
                        this.log.debug(`[RPC] WebSocket message from ${ip}: ${JSON.stringify(message)}`);
                        
                        if (onMessage) {
                            onMessage(message);
                        }
                    } catch (e) {
                        this.log.error(`[RPC] Failed to parse WebSocket message: ${e.message}`);
                    }
                });

                ws.on('error', (error) => {
                    this.log.error(`[RPC] WebSocket error for ${ip}: ${error.message}`);
                });

                ws.on('close', () => {
                    this.log.debug(`[RPC] WebSocket closed for ${ip}`);
                    delete this.wsConnections[ip];
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Disconnect WebSocket
     * @param {string} ip
     */
    disconnectWebSocket(ip) {
        if (this.wsConnections[ip]) {
            try {
                this.wsConnections[ip].close();
                delete this.wsConnections[ip];
                this.log.debug(`[RPC] WebSocket disconnected for ${ip}`);
            } catch (e) {
                this.log.error(`[RPC] Error disconnecting WebSocket: ${e.message}`);
            }
        }
    }

    /**
     * Disconnect all WebSockets
     */
    disconnectAll() {
        for (const ip in this.wsConnections) {
            this.disconnectWebSocket(ip);
        }
        this.log.debug('[RPC] All WebSocket connections closed');
    }

    /**
     * Enable outbound WebSocket on device
     * @param {string} ip
     * @param {string} server - WebSocket server URL
     * @returns {Promise<Object>}
     */
    async enableOutboundWebSocket(ip, server) {
        try {
            return await this.call(ip, 'Ws.SetConfig', {
                config: {
                    enable: true,
                    server: server,
                    ssl_ca: '*',
                }
            });
        } catch (e) {
            this.log.debug(`[RPC] Could not enable outbound WebSocket: ${e.message}`);
            return null;
        }
    }

    /**
     * Execute script on device
     * @param {string} ip
     * @param {number} id - Script ID
     * @param {string} action - Action ('start', 'stop')
     * @returns {Promise<Object>}
     */
    async scriptControl(ip, id, action) {
        if (action === 'start') {
            return await this.call(ip, 'Script.Start', { id });
        } else if (action === 'stop') {
            return await this.call(ip, 'Script.Stop', { id });
        }
        throw new Error(`Unknown script action: ${action}`);
    }

    /**
     * Get script status
     * @param {string} ip
     * @param {number} id - Script ID
     * @returns {Promise<Object>}
     */
    async getScriptStatus(ip, id) {
        return await this.call(ip, 'Script.GetStatus', { id });
    }

    /**
     * List all scripts
     * @param {string} ip
     * @returns {Promise<Object>}
     */
    async listScripts(ip) {
        return await this.call(ip, 'Script.List');
    }
}

module.exports = ShellyRpcClient;
