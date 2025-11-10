'use strict';

/**
 * Utility functions for MQTT device handling
 * Provides device generation detection and other MQTT-related utilities
 */

/**
 * Detect Shelly device generation from MQTT client ID
 * 
 * Rules:
 * - Gen1: Client ID format: shellies/shellyswitch25-112E2A/...
 * - Gen2+: Client ID format: shellyplus1pm-44179394d4d4 or shellypro2pm-...
 * 
 * @param {string} clientId - MQTT client ID
 * @returns {number} - Generation number (1, 2, 3, or 1 as default)
 */
function detectShellyGenerationByClientId(clientId) {
    if (!clientId || typeof clientId !== 'string') {
        return 1; // Default to Gen1 if no client ID
    }

    // Remove potential topic prefix (e.g., "shellies/..." -> "...")
    const normalizedId = clientId.replace(/^shellies\//, '');

    // Gen2+ devices start with specific prefixes
    const gen2Prefixes = [
        'shellyplus',      // Shelly Plus series (Gen2)
        'shellypro',       // Shelly Pro series (Gen2)
        'shellypm',        // Newer PM devices (Gen2+)
        'shellymini',      // Shelly Mini (Gen2)
        'shellywall',      // Shelly Wall Display (Gen2+)
    ];

    // Gen3 devices (if they have specific patterns in the future)
    const gen3Prefixes = [
        // Currently, Gen3 uses same client ID pattern as Gen2
        // Add specific Gen3 patterns here when they exist
    ];

    // Check for Gen3
    for (const prefix of gen3Prefixes) {
        if (normalizedId.toLowerCase().startsWith(prefix.toLowerCase())) {
            return 3;
        }
    }

    // Check for Gen2
    for (const prefix of gen2Prefixes) {
        if (normalizedId.toLowerCase().startsWith(prefix.toLowerCase())) {
            return 2;
        }
    }

    // Gen1 devices typically have format: shellyswitch25-MACADDR or similar
    // If no Gen2+ prefix found, assume Gen1
    return 1;
}

/**
 * Extract device type from client ID
 * 
 * @param {string} clientId - MQTT client ID
 * @returns {string|null} - Device type (e.g., "switch25", "1pm") or null
 */
function extractDeviceTypeFromClientId(clientId) {
    if (!clientId || typeof clientId !== 'string') {
        return null;
    }

    // Remove "shellies/" prefix if present
    const normalizedId = clientId.replace(/^shellies\//, '');

    // Extract device type
    // Gen1: "shellyswitch25-112E2A" -> "switch25"
    // Gen2: "shellyplus1pm-44179394d4d4" -> "plus1pm"
    const match = normalizedId.match(/^shelly([a-z0-9]+)-/i);
    if (match && match[1]) {
        return match[1].toLowerCase();
    }

    return null;
}

/**
 * Extract MAC address from client ID
 * 
 * @param {string} clientId - MQTT client ID
 * @returns {string|null} - MAC address or null
 */
function extractMacFromClientId(clientId) {
    if (!clientId || typeof clientId !== 'string') {
        return null;
    }

    // Remove "shellies/" prefix if present
    const normalizedId = clientId.replace(/^shellies\//, '');

    // Extract MAC address part after last hyphen
    // Gen1: "shellyswitch25-112E2A" -> "112E2A"
    // Gen2: "shellyplus1pm-44179394d4d4" -> "44179394d4d4"
    const match = normalizedId.match(/-([A-F0-9]+)$/i);
    if (match && match[1]) {
        return match[1].toUpperCase();
    }

    return null;
}

/**
 * Validate if client ID is a valid Shelly device
 * 
 * @param {string} clientId - MQTT client ID
 * @returns {boolean} - True if valid Shelly device ID
 */
function isValidShellyClientId(clientId) {
    if (!clientId || typeof clientId !== 'string') {
        return false;
    }

    // Check for basic Shelly patterns
    const shellyPatterns = [
        /^shellies\/shelly[a-z0-9]+-[A-F0-9]+/i,  // Gen1: shellies/shellyswitch25-ABC123
        /^shelly[a-z0-9]+-[A-F0-9]+/i,             // Gen2+: shellyplus1pm-ABC123
    ];

    return shellyPatterns.some(pattern => pattern.test(clientId));
}

/**
 * Get device generation name
 * 
 * @param {number} gen - Generation number (1, 2, 3)
 * @returns {string} - Generation name ("Gen1", "Gen2", "Gen3")
 */
function getGenerationName(gen) {
    switch (gen) {
        case 1:
            return 'Gen1';
        case 2:
            return 'Gen2';
        case 3:
            return 'Gen3';
        default:
            return 'Unknown';
    }
}

/**
 * Determine if device should use RPC protocol (Gen2+)
 * 
 * @param {string} clientId - MQTT client ID
 * @returns {boolean} - True if device should use RPC
 */
function shouldUseRpc(clientId) {
    const gen = detectShellyGenerationByClientId(clientId);
    return gen >= 2;
}

/**
 * Determine if device should use HTTP/CoAP protocol (Gen1)
 * 
 * @param {string} clientId - MQTT client ID
 * @returns {boolean} - True if device should use HTTP/CoAP
 */
function shouldUseHttpCoap(clientId) {
    const gen = detectShellyGenerationByClientId(clientId);
    return gen === 1;
}

module.exports = {
    detectShellyGenerationByClientId,
    extractDeviceTypeFromClientId,
    extractMacFromClientId,
    isValidShellyClientId,
    getGenerationName,
    shouldUseRpc,
    shouldUseHttpCoap,
};
