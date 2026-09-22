import type { DeviceDefinition } from '../../deviceTypes';
import * as cameraHelper from '../camera-helper';

/**
 * Shelly Camera / shellycamera
 *
 * Wi-Fi camera with 1080p Full HD video and infrared night vision.
 * Product code: S1CM-0DXW00
 *
 * https://shelly-api-docs.shelly.cloud/gen2/Devices/Gen3/ShellyCamera
 * https://kb.shelly.cloud/knowledge-base/shelly-camera
 */
const shellycamera: DeviceDefinition = {};

cameraHelper.addCamera(shellycamera, 0);
cameraHelper.addCameraZone(shellycamera, 0);
cameraHelper.addStreamer(shellycamera, 0);
cameraHelper.addStorage(shellycamera, 0);

export { shellycamera };
