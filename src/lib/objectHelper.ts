let adapter: ioBroker.Adapter | null = null;

const stateChangeTrigger: { [id: string]: (stateVal: ioBroker.StateValue, state: ioBroker.State) => void } = {};
const objectQueue: {
    id: string;
    value?: ioBroker.StateValue;
    obj: ioBroker.Object;
    stateChangeCallback?: (stateVal: ioBroker.StateValue, state: ioBroker.State) => void;
    obtainCustomFields?: string[];
}[] = [];

export const existingStates: { [id: string]: ioBroker.Object } = {};
export const adapterObjects: { [id: string]: ioBroker.Object } = {};
export function setOrUpdateObject(
    id: string,
    obj: ioBroker.Object,
    obtainCustomFields: string[] | undefined,
    value?: ioBroker.StateValue | null,
    stateChangeCallback?: (stateVal: ioBroker.StateValue, state: ioBroker.State) => void,
    createNow: boolean = true,
    callback?: () => void,
): void {
    if (!adapter) {
        throw new Error('Adapter is not set');
    }
    (obj as ioBroker.StateObject).type ||= 'state';
    obj.common ||= {} as ioBroker.ObjectCommon;
    obj.native ||= {};
    if (obj.common && obj.common.type === undefined) {
        if (value !== null && value !== undefined) {
            obj.common.type = typeof value;
        } else if (obj.common.def !== undefined) {
            obj.common.type = typeof obj.common.def;
        } else if (obj.type === 'state') {
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

    if (!adapterObjects[id] && existingStates[id]) {
        adapterObjects[id] = existingStates[id];
        if (adapterObjects[id].from) {
            delete adapterObjects[id].from;
        }
        if (adapterObjects[id].ts) {
            delete adapterObjects[id].ts;
        }
        if (adapterObjects[id].acl) {
            delete adapterObjects[id].acl;
        }
        if (adapterObjects[id]._id) {
            // @ts-expect-error it is Ok
            delete adapterObjects[id]._id;
        }
        if (obj.common.def === undefined && adapterObjects[id].common.def !== undefined) {
            delete adapterObjects[id].common.def;
        }
        if (obj.common.unit === undefined && adapterObjects[id].common.unit !== undefined) {
            delete adapterObjects[id].common.unit;
        }
        if (obj.common.min === undefined && adapterObjects[id].common.min !== undefined) {
            delete adapterObjects[id].common.min;
        }
        if (obj.common.max === undefined && adapterObjects[id].common.max !== undefined) {
            delete adapterObjects[id].common.max;
        }
        value = undefined; // when exists, and it is first time do not overwrite value!
    }
    if (existingStates[id]) {
        delete existingStates[id];
    }
    if (adapterObjects[id] && isEquivalent(obj, adapterObjects[id])) {
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
    adapterObjects[id] = JSON.parse(JSON.stringify(obj));
    // adapter.log.debug('Create object for ' + id + ': ' + JSON.stringify(obj) + ' with value: ' + JSON.stringify(value));

    if (createNow) {
        processObjectQueue(callback);
    }
}

export function deleteObject(id: string): void {
    const obj = adapterObjects[id];
    if (!adapter) {
        throw new Error('Adapter is not set');
    }
    if (obj?.type) {
        if (obj.type !== 'state') {
            Object.keys(adapterObjects).forEach(objId => {
                if (objId.startsWith(`${id}.`)) {
                    adapter!.delObject(objId, (err: Error | null | undefined): void => {
                        adapter!.log.info(`${adapterObjects[objId].type} ${objId} deleted${err ? ` (${err})` : ''}`);
                        if (!err) {
                            delete adapterObjects[objId];
                            delete stateChangeTrigger[objId];
                        }
                    });
                }
            });
        }
        adapter.delObject(id, err => {
            adapter!.log.info(`${adapterObjects[id].type} ${id} deleted (${err})`);
            if (!err) {
                delete adapterObjects[id];
                delete stateChangeTrigger[id];
            }
        });
    }
}

function isEquivalent(a: any, b: any): boolean {
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
        } else {
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

export function processObjectQueue(callback?: () => void): void {
    if (!objectQueue.length) {
        callback?.();
        return;
    }

    function handleObject(
        queueEntry: {
            id: string;
            value?: ioBroker.StateValue;
            obj: ioBroker.Object;
            stateChangeCallback?: (stateVal: ioBroker.StateValue, state: ioBroker.State) => void;
            obtainCustomFields?: string[];
        },
        callback?: () => void,
    ): void {
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
            } else {
                adapter.setObject(queueEntry.id, queueEntry.obj, () => handleValue(queueEntry, () => callback?.()));
            }
        });
    }

    function handleValue(
        queueEntry: {
            id: string;
            value?: ioBroker.StateValue;
            obj: ioBroker.Object;
            stateChangeCallback?: (stateVal: ioBroker.StateValue, state: ioBroker.State) => void;
            obtainCustomFields?: string[];
        },
        callback: () => void,
    ): void {
        if (queueEntry.value === null || queueEntry.value === undefined) {
            if (queueEntry.stateChangeCallback) {
                stateChangeTrigger[queueEntry.id] = queueEntry.stateChangeCallback;
            }
            return callback?.();
        }
        void adapter!.setState(queueEntry.id, queueEntry.value, true, () => {
            if (queueEntry.stateChangeCallback) {
                stateChangeTrigger[queueEntry.id] = queueEntry.stateChangeCallback;
            }
            return callback?.();
        });
    }

    const queueEntry = objectQueue.shift();
    if (queueEntry) {
        handleObject(queueEntry, () => processObjectQueue(callback));
    } else {
        processObjectQueue(callback);
    }
}

export function getObject(id: string): ioBroker.Object | undefined {
    return adapterObjects[id];
}

export function loadExistingObjects(callback?: () => void): void {
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
            existingStates[objectKeys[i].substr(adapter.namespace.length + 1)] = res[objectKeys[i]];
        }
        // adapter.log.debug('Existing States: ' + JSON.stringify(Object.keys(existingStates), null, 4));

        // devId + '.Bluetooth' = device , ChannelsOd = MACs
        // devId + '.Notifications' = channel, statesOf ??
        // devId + '.Routines' = channel, statesOf

        callback?.();
    });
}

export function handleStateChange(id: string, state: ioBroker.State | null | undefined): void {
    if (!state || state.ack) {
        return;
    }
    if (!adapter) {
        throw new Error('Adapter is not set');
    }

    id = id.substring(adapter.namespace.length + 1);

    if (typeof stateChangeTrigger[id] === 'function') {
        const obj = adapterObjects[id];
        if (obj?.common?.type && obj.common.type !== 'mixed') {
            if (obj.common.type === 'boolean') {
                if (state.val === 'true') {
                    state.val = true;
                } else if (state.val === 'false') {
                    state.val = false;
                }
                state.val = !!state.val;
            }
            if (typeof state.val !== obj.common.type) {
                adapter.log.error(
                    `Datatype for ${id} differs from expected, ignore state change! Please write correct datatype (${obj.common.type})`,
                );
                return;
            }
        }
        stateChangeTrigger[id](state.val, state);
    }
}

export function init(adapterInstance: ioBroker.Adapter): void {
    adapter = adapterInstance;
}

export default {
    init,
    setOrUpdateObject,
    deleteObject,
    processObjectQueue,
    loadExistingObjects,
    getObject,
    handleStateChange,
    existingStates,
    adapterObjects,
};
