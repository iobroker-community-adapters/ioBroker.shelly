"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapterObjects = exports.existingStates = void 0;
exports.setOrUpdateObject = setOrUpdateObject;
exports.deleteObject = deleteObject;
exports.processObjectQueue = processObjectQueue;
exports.getObject = getObject;
exports.loadExistingObjects = loadExistingObjects;
exports.handleStateChange = handleStateChange;
exports.init = init;
let adapter = null;
const stateChangeTrigger = {};
const objectQueue = [];
exports.existingStates = {};
exports.adapterObjects = {};
function setOrUpdateObject(id, obj, obtainCustomFields, value, stateChangeCallback, createNow = true, callback) {
    if (!adapter) {
        throw new Error('Adapter is not set');
    }
    obj.type ||= 'state';
    obj.common ||= {};
    obj.native ||= {};
    if (obj.common && obj.common.type === undefined) {
        if (value !== null && value !== undefined) {
            obj.common.type = typeof value;
        }
        else if (obj.common.def !== undefined) {
            obj.common.type = typeof obj.common.def;
        }
        else if (obj.type === 'state') {
            obj.common.type = 'mixed';
        }
    }
    if (obj.common && obj.common.read === undefined) {
        obj.common.read = true; //!(obj.common.type === 'boolean' && !!stateChangeCallback);
    }
    if (obj.common && obj.common.write === undefined) {
        obj.common.write = !!stateChangeCallback || stateChangeTrigger[id];
    }
    /*    if (obj.common && obj.common.def === undefined && value !== null && value !== undefined) {
            obj.common.def = value;
        }*/
    if (obj.common && obj.common.name === undefined) {
        obj.common.name = id.split('.').pop() || '';
    }
    if (!exports.adapterObjects[id] && exports.existingStates[id]) {
        exports.adapterObjects[id] = exports.existingStates[id];
        if (exports.adapterObjects[id].from) {
            delete exports.adapterObjects[id].from;
        }
        if (exports.adapterObjects[id].ts) {
            delete exports.adapterObjects[id].ts;
        }
        if (exports.adapterObjects[id].acl) {
            delete exports.adapterObjects[id].acl;
        }
        if (exports.adapterObjects[id]._id) {
            // @ts-expect-error it is Ok
            delete exports.adapterObjects[id]._id;
        }
        if (obj.common.def === undefined && exports.adapterObjects[id].common.def !== undefined) {
            delete exports.adapterObjects[id].common.def;
        }
        if (obj.common.unit === undefined && exports.adapterObjects[id].common.unit !== undefined) {
            delete exports.adapterObjects[id].common.unit;
        }
        if (obj.common.min === undefined && exports.adapterObjects[id].common.min !== undefined) {
            delete exports.adapterObjects[id].common.min;
        }
        if (obj.common.max === undefined && exports.adapterObjects[id].common.max !== undefined) {
            delete exports.adapterObjects[id].common.max;
        }
        value = undefined; // when exists, and it is first time do not overwrite value!
    }
    if (exports.existingStates[id]) {
        delete exports.existingStates[id];
    }
    if (exports.adapterObjects[id] && isEquivalent(obj, exports.adapterObjects[id])) {
        //adapter.log.debug('Object unchanged for ' + id + ': ' + JSON.stringify(adapterObjects[id]) + ' - update only: ' + JSON.stringify(value));
        if (value !== undefined) {
            void adapter.setState(id, value, true);
        }
        if (stateChangeCallback) {
            stateChangeTrigger[id] = stateChangeCallback;
        }
        return;
    }
    // adapter.log.debug('Add Object for ' + id + ': ' + JSON.stringify(adapterObjects[id]) + '/' + JSON.stringify(obj));
    objectQueue.push({
        id,
        value,
        obj,
        stateChangeCallback,
        obtainCustomFields,
    });
    exports.adapterObjects[id] = JSON.parse(JSON.stringify(obj));
    // adapter.log.debug('Create object for ' + id + ': ' + JSON.stringify(obj) + ' with value: ' + JSON.stringify(value));
    if (createNow) {
        processObjectQueue(callback);
    }
}
function deleteObject(id) {
    const obj = exports.adapterObjects[id];
    if (!adapter) {
        throw new Error('Adapter is not set');
    }
    if (obj?.type) {
        if (obj.type !== 'state') {
            Object.keys(exports.adapterObjects).forEach(objId => {
                if (objId.startsWith(`${id}.`)) {
                    adapter.delObject(objId, (err) => {
                        adapter.log.info(`${exports.adapterObjects[objId].type} ${objId} deleted${err ? ` (${err})` : ''}`);
                        if (!err) {
                            delete exports.adapterObjects[objId];
                            delete stateChangeTrigger[objId];
                        }
                    });
                }
            });
        }
        adapter.delObject(id, err => {
            adapter.log.info(`${exports.adapterObjects[id].type} ${id} deleted (${err})`);
            if (!err) {
                delete exports.adapterObjects[id];
                delete stateChangeTrigger[id];
            }
        });
    }
}
function isEquivalent(a, b) {
    //adapter.log.debug('Compare ' + JSON.stringify(a) + ' with ' +  JSON.stringify(b));
    // Create arrays of property names
    if (a === null || a === undefined || b === null || b === undefined) {
        return a === b;
    }
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);
    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length !== bProps.length) {
        //console.log('num props different: ' + JSON.stringify(aProps) + ' / ' + JSON.stringify(bProps));
        return false;
    }
    for (let i = 0; i < aProps.length; i++) {
        const propName = aProps[i];
        if (typeof a[propName] !== typeof b[propName]) {
            // console.log('type props ' + propName + ' different');
            return false;
        }
        if (typeof a[propName] === 'object') {
            if (!isEquivalent(a[propName], b[propName])) {
                return false;
            }
        }
        else {
            // If values of same property are not equal,
            // objects are not equivalent
            if (a[propName] !== b[propName]) {
                // console.log('props ' + propName + ' different');
                return false;
            }
        }
    }
    // If we made it this far, objects
    // are considered equivalent
    return true;
}
function processObjectQueue(callback) {
    if (!objectQueue.length) {
        callback?.();
        return;
    }
    function handleObject(queueEntry, callback) {
        if (!queueEntry.obj) {
            handleValue(queueEntry, () => callback?.());
        }
        if (!adapter) {
            throw new Error('Adapter is not set');
        }
        adapter.getObject(queueEntry.id, (err, obj) => {
            if (!adapter) {
                throw new Error('Adapter is not set');
            }
            if (!err && obj) {
                if (Array.isArray(queueEntry.obtainCustomFields)) {
                    queueEntry.obtainCustomFields.forEach(name => {
                        if (queueEntry.obj.common?.[name]) {
                            delete queueEntry.obj.common[name];
                        }
                    });
                }
                adapter.extendObject(queueEntry.id, queueEntry.obj, () => handleValue(queueEntry, () => callback?.()));
            }
            else {
                adapter.setObject(queueEntry.id, queueEntry.obj, () => handleValue(queueEntry, () => callback?.()));
            }
        });
    }
    function handleValue(queueEntry, callback) {
        if (queueEntry.value === null || queueEntry.value === undefined) {
            if (queueEntry.stateChangeCallback) {
                stateChangeTrigger[queueEntry.id] = queueEntry.stateChangeCallback;
            }
            return callback?.();
        }
        void adapter.setState(queueEntry.id, queueEntry.value, true, () => {
            if (queueEntry.stateChangeCallback) {
                stateChangeTrigger[queueEntry.id] = queueEntry.stateChangeCallback;
            }
            return callback?.();
        });
    }
    const queueEntry = objectQueue.shift();
    if (queueEntry) {
        handleObject(queueEntry, () => processObjectQueue(callback));
    }
    else {
        processObjectQueue(callback);
    }
}
function getObject(id) {
    return exports.adapterObjects[id];
}
function loadExistingObjects(callback) {
    if (!adapter) {
        throw new Error('Adapter is not set');
    }
    void adapter.getAdapterObjects(res => {
        if (!adapter) {
            throw new Error('Adapter is not set');
        }
        const objectKeys = Object.keys(res);
        for (let i = 0; i < objectKeys.length; i++) {
            if (objectKeys[i].indexOf(`${adapter.namespace}.info`) === 0) {
                continue;
            }
            exports.existingStates[objectKeys[i].substr(adapter.namespace.length + 1)] = res[objectKeys[i]];
        }
        // adapter.log.debug('Existing States: ' + JSON.stringify(Object.keys(existingStates), null, 4));
        // devId + '.Bluetooth' = device , ChannelsOd = MACs
        // devId + '.Notifications' = channel, statesOf ??
        // devId + '.Routines' = channel, statesOf
        callback?.();
    });
}
function handleStateChange(id, state) {
    if (!state || state.ack) {
        return;
    }
    if (!adapter) {
        throw new Error('Adapter is not set');
    }
    id = id.substring(adapter.namespace.length + 1);
    if (typeof stateChangeTrigger[id] === 'function') {
        const obj = exports.adapterObjects[id];
        if (obj?.common?.type && obj.common.type !== 'mixed') {
            if (obj.common.type === 'boolean') {
                if (state.val === 'true') {
                    state.val = true;
                }
                else if (state.val === 'false') {
                    state.val = false;
                }
                state.val = !!state.val;
            }
            if (typeof state.val !== obj.common.type) {
                adapter.log.error(`Datatype for ${id} differs from expected, ignore state change! Please write correct datatype (${obj.common.type})`);
                return;
            }
        }
        stateChangeTrigger[id](state.val, state);
    }
}
function init(adapterInstance) {
    adapter = adapterInstance;
}
exports.default = {
    init,
    setOrUpdateObject,
    deleteObject,
    processObjectQueue,
    loadExistingObjects,
    getObject,
    handleStateChange,
    existingStates: exports.existingStates,
    adapterObjects: exports.adapterObjects,
};
//# sourceMappingURL=objectHelper.js.map