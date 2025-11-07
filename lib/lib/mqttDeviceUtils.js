/**
 * Device Utilities für Shelly-Adapter:
 * - Automatische Generationserkennung
 * - Protokoll-Abstimmung (HTTP/MQTT/RPC)
 * - Vollständig robust und modular für alle Generationen
 */

const axios = require("axios"); // Falls axios bereits im Adapter verwendet wird; ansonsten requestAsync weiterverwenden.

/**
 * Erkennt die Generation eines Shelly-Geräts anhand der Client-ID (MQTT).
 * @param {string} clientId 
 * @returns {number} 1 (Gen1), 2 (Gen2), 3 (Gen3), 0 (unbekannt)
 */
function detectShellyGenerationByClientId(clientId) {
    if (!clientId || typeof clientId !== 'string') return 0;
    // Gen3
    if (/^shelly[a-z0-9]+g3-[a-f0-9]{12}$/i.test(clientId)) return 3;
    // Gen2 (plus/pro)
    if (/^shelly(plus|pro)[a-z0-9]+-[a-f0-9]{12}$/i.test(clientId)) return 2;
    // Gen1 (classic)
    if (/^shelly[a-z0-9]+-[a-f0-9]{12}$/i.test(clientId)) return 1;
    // Für zukünftige Modelle einfach erweitern
    return 0;
}

/**
 * Erkennt die Generation eines Shelly-Geräts anhand API/HTTP-Antwort (falls kein MQTT).
 * @param {string} ip - IP-Adresse des Geräts
 * @returns {Promise<number>} 1, 2, 3, oder 0
 */
async function detectShellyGenerationByRest(ip) {
    // Teste Gen2/Gen3 RPC-API
    try {
        const response = await axios.post(`http://${ip}/rpc/Shelly.GetDeviceInfo`, {}, {timeout: 4000});
        if (response.data && typeof response.data.type === 'string') {
            if (response.data.type.endsWith("G3")) return 3;
            return 2; // Gen2/Gen3
        }
    } catch (e) {/* ignorieren */}

    // Teste Gen1 HTTP-API
    try {
        const response = await axios.get(`http://${ip}/settings`, {timeout: 4000});
        if (response.data && response.data.device && response.data.mqtt) return 1; // Gen1
    } catch (e) {/* ignorieren */}

    return 0; // nicht erkannt
}

/**
 * Gerät registrieren und Protokollfähigkeiten bestimmen
 * Nutzung: deviceRegistry.set(clientId, getDeviceInfo(clientId, ip))
 */
function getDeviceInfo(clientId, ip) {
    const generation = detectShellyGenerationByClientId(clientId);
    return {
        id: clientId,
        ip,
        generation,
        supportsMqtt: generation > 0,        // aktuell alle Generationen unterstützen MQTT, außer ggf. exotische Modelle
        supportsHttp: generation === 1,      // Nur Gen1 HTTP & CoAP
        supportsRpc: generation >= 2,        // Gen2/Gen3 RPC
        supportsCoap: generation === 1,      // Gen1 CoAP
        lastSeen: Date.now()
    };
}

/**
 * Beispiel für HTTP-Prefix-Detection nur für Gen1 (asynchron)
 */
async function setMqttPrefixHttp(clientId, deviceIp, log) {
    const generation = detectShellyGenerationByClientId(clientId);
    if (generation !== 1) {
        if (log) log.debug(`[MQTT] Skipping HTTP prefix detection for Gen${generation} device: ${clientId}`);
        return clientId;
    }
    if (!clientId) {
        if (log) log.warn(`[MQTT] Gen1 detected but clientId missing`);
        return null;
    }
    try {
        const response = await axios.get(`http://${deviceIp}/settings`, {timeout: 4000});
        if (response.data && response.data.mqtt && response.data.mqtt.id) {
            const prefix = response.data.mqtt.id;
            if (log) log.debug(`[MQTT] Detected prefix for ${clientId}: ${prefix}`);
            return prefix;
        }
    } catch (error) {
        if (log) log.error(`[MQTT] Error in setMqttPrefixHttp for ${clientId}: ${error.message}`);
    }
    // Fallback: original ClientID nutzen
    return clientId;
}

/**
 * Abfrage Gerät-Konfiguration über korrekten API-Weg
 */
async function getDeviceConfig(clientId, deviceIp, log) {
    const generation = detectShellyGenerationByClientId(clientId);
    if (generation >= 2) {
        // Gen2/Gen3: RPC nutzen
        try {
            const response = await axios.post(`http://${deviceIp}/rpc/Shelly.GetConfig`, {}, {timeout: 4000});
            if (log) log.debug(`[RPC] Config retrieved for ${clientId}`);
            return response.data;
        } catch (error) {
            if (log) log.error(`[RPC] Error getting config for ${clientId}: ${error.message}`);
            return null;
        }
    } else if (generation === 1) {
        // Gen1: klassisch
        try {
            const response = await axios.get(`http://${deviceIp}/settings`, {timeout: 4000});
            if (log) log.debug(`[HTTP] Config retrieved for ${clientId}`);
            return response.data;
        } catch (error) {
            if (log) log.error(`[HTTP] Error getting config for ${clientId}: ${error.message}`);
            return null;
        }
    }
    return null;
}

module.exports = {
    detectShellyGenerationByClientId,
    detectShellyGenerationByRest,
    getDeviceInfo,
    setMqttPrefixHttp,
    getDeviceConfig,
};
