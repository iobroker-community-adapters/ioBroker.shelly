# ioBroker Adapter Development with GitHub Copilot

**Version:** 0.4.0
**Template Source:** https://github.com/DrozmotiX/ioBroker-Copilot-Instructions

This file contains instructions and best practices for GitHub Copilot when working on ioBroker adapter development.

## Project Context

You are working on an ioBroker adapter. ioBroker is an integration platform for the Internet of Things, focused on building smart home and industrial IoT solutions. Adapters are plugins that connect ioBroker to external systems, devices, or services.

## Adapter-Specific Context
- **Adapter Name**: iobroker.shelly
- **Primary Function**: Integrate Shelly smart home devices via MQTT or CoAP protocols
- **Repository**: iobroker-community-adapters/ioBroker.shelly
- **Target Devices**: Shelly Wi-Fi enabled switches, sensors, dimmers, and other IoT devices
- **Supported Generations**: 
  - Gen 1 devices (ESP8266) - CoAP/CoIoT or MQTT protocols
  - Gen 2+ devices (ESP32) - MQTT protocol only
- **Key Features**:
  - Device auto-discovery and configuration
  - Support for 100+ different Shelly device models
  - BLE (Bluetooth Low Energy) device support via Shelly gateways
  - Firmware update management
  - Multi-language support with extensive translations
  - Real-time device state monitoring and control

## Testing

### Unit Testing
- Use Jest as the primary testing framework for ioBroker adapters
- Create tests for all adapter main functions and helper methods
- Test error handling scenarios and edge cases
- Mock external API calls and hardware dependencies
- For adapters connecting to APIs/devices not reachable by internet, provide example data files to allow testing of functionality without live connections
- Example test structure:
  ```javascript
  describe('AdapterName', () => {
    let adapter;
    
    beforeEach(() => {
      // Setup test adapter instance
    });
    
    test('should initialize correctly', () => {
      // Test adapter initialization
    });
  });
  ```

### Integration Testing

**IMPORTANT**: Use the official `@iobroker/testing` framework for all integration tests. This is the ONLY correct way to test ioBroker adapters.

**Official Documentation**: https://github.com/ioBroker/testing

#### Framework Structure
Integration tests MUST follow this exact pattern:

```javascript
const path = require('path');
const { tests } = require('@iobroker/testing');

// Define test coordinates or configuration
const TEST_COORDINATES = '52.520008,13.404954'; // Berlin
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Use tests.integration() with defineAdditionalTests
tests.integration(path.join(__dirname, '..'), {
    defineAdditionalTests({ suite }) {
        suite('Test adapter with specific configuration', (getHarness) => {
            let harness;

            before(() => {
                harness = getHarness();
            });

            it('should configure and start adapter', function () {
                return new Promise(async (resolve, reject) => {
                    try {
                        harness = getHarness();
                        
                        // Get adapter object using promisified pattern
                        const obj = await new Promise((res, rej) => {
                            harness.objects.getObject('system.adapter.your-adapter.0', (err, o) => {
                                if (err) return rej(err);
                                res(o);
                            });
                        });
                        
                        if (!obj) {
                            return reject(new Error('Adapter object not found'));
                        }

                        // Configure adapter properties
                        Object.assign(obj.native, {
                            position: TEST_COORDINATES,
                            createCurrently: true,
                            createHourly: true,
                            createDaily: true,
                            // Add other configuration as needed
                        });

                        // Set the updated configuration
                        harness.objects.setObject(obj._id, obj);

                        console.log('✅ Step 1: Configuration written, starting adapter...');
                        
                        // Start adapter and wait
                        await harness.startAdapterAndWait();
                        
                        console.log('✅ Step 2: Adapter started');

                        // Wait for adapter to process data
                        const waitMs = 15000;
                        await wait(waitMs);

                        console.log('🔍 Step 3: Checking states after adapter run...');
                        
                        // Add your specific state checks here
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                });
            }).timeout(60000);
        });
    }
});
```

## Development Guidelines

### Device Communication Patterns
- **MQTT Protocol**: Primary communication method for all Shelly generations
- **CoAP/CoIoT Protocol**: Legacy support for Gen 1 devices only
- **HTTP API**: Used for configuration, firmware updates, and device management
- **Device Discovery**: Automatic network scanning and device identification
- **Message Handling**: Process JSON-based device status updates and commands

### Error Handling and Recovery
- Implement robust connection retry logic for network interruptions
- Handle device offline/online state transitions gracefully
- Validate device responses and handle malformed data
- Provide clear error messages for configuration issues
- Support automatic reconnection for MQTT and CoAP connections

### State Management
- Follow ioBroker state naming conventions (e.g., `shelly.0.SHSW-25#1234567.Relay0.Switch`)
- Implement proper state role assignments for device controls
- Handle device capability changes during firmware updates
- Maintain device generation compatibility across firmware versions
- Support multi-language state descriptions

### Configuration Management
- Use JSON Config for admin interface (adminUI.config: "json")
- Validate user input for network settings, credentials, and device parameters
- Provide default configurations for common use cases
- Support encrypted storage for sensitive data (passwords, API keys)
- Handle migration between configuration schema versions

### Logging and Debugging
- Use appropriate logging levels:
  - `error`: Critical failures, connection issues
  - `warn`: Deprecated features, compatibility issues
  - `info`: Device discovery, connection status changes
  - `debug`: Detailed protocol communication, state changes
- Include device identifiers in log messages for troubleshooting
- Provide debug options for protocol message inspection
- Log firmware version compatibility issues

## Shelly-Specific Development Patterns

### Device Model Support
- Device definitions in `lib/devices/` directory organized by generation
- Generation-specific helpers in `lib/devices/gen1-helper.js`, `gen2-helper.js`, etc.
- Datapoint definitions in `lib/datapoints.js` with device mappings
- Support for device capabilities detection and dynamic state creation

### Protocol Handling
- MQTT: JSON-RPC message format for Gen2+ devices
- CoAP: Binary packet parsing for Gen1 devices  
- HTTP: REST API calls for device configuration and management
- WebSocket: Real-time updates for certain device models

### BLE Device Support
- BTHome protocol implementation for Bluetooth Low Energy devices
- Script-based decoding moved to adapter (memory optimization)
- Encryption key management for secure BLE communications
- Gateway device management for BLE network coordination

### Firmware Update Management
- Automatic firmware update detection and notification
- User-controlled update process with progress tracking
- Compatibility validation before firmware installation
- Rollback support for failed updates

## Code Style and Standards

- Follow JavaScript/TypeScript best practices
- Use async/await for asynchronous operations
- Implement proper resource cleanup in `unload()` method
- Use semantic versioning for adapter releases
- Include proper JSDoc comments for public methods

### Clean Resource Cleanup
```javascript
async unload(callback) {
  try {
    // Stop all timers
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = undefined;
    }
    // Close connections, clean up resources
    callback();
  } catch (e) {
    callback();
  }
}
```

## Initial Setup Complete

This file has been automatically created with basic ioBroker adapter context for the Shelly adapter. The content includes comprehensive patterns specific to Shelly device integration, including MQTT/CoAP protocols, device generation support, BLE handling, and firmware management.