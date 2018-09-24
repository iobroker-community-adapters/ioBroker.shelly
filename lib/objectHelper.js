/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

const forbiddenCharacters = /[\]\[*,;'"`<>\\\s?]/g;

let adapter;

const stateChangeTrigger = {};
const objectQueue = [];

const existingStates = {};
const adapterObjects = {};
function setOrUpdateObject(id, obj, obtainCustomFields, value, stateChangeCallback, createNow) {
    let callback = null;
    if (!Array.isArray(obtainCustomFields)) {
        createNow = stateChangeCallback;
        stateChangeCallback = value;
        value = obtainCustomFields;
        obtainCustomFields =  [];
    }
    if (typeof value === 'function') {
        createNow = stateChangeCallback;
        stateChangeCallback = value;
        value = undefined;
    }
    if (typeof createNow === 'function') {
        callback = createNow;
        createNow = true;
    }

    if (! obj.type) {
        obj.type = 'state';
    }
    if (! obj.common) {
        obj.common = {};
    }
    if (! obj.native) {
        obj.native = {};
    }
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
        obj.common.write = !!stateChangeCallback;
    }
/*    if (obj.common && obj.common.def === undefined && value !== null && value !== undefined) {
        obj.common.def = value;
    }*/
    if (obj.common && obj.common.name === undefined) {
        obj.common.name = id.split('.').pop();
    }

    if (!adapterObjects[id] && existingStates[id]) {
        adapterObjects[id] = existingStates[id];
        if (adapterObjects[id].from) delete adapterObjects[id].from;
        if (adapterObjects[id].ts) delete adapterObjects[id].ts;
        if (adapterObjects[id].acl) delete adapterObjects[id].acl;
        if (adapterObjects[id]._id) delete adapterObjects[id]._id;
        if (obj.common.def === undefined && adapterObjects[id].common.def !== undefined) delete adapterObjects[id].common.def;
        if (obj.common.unit === undefined && adapterObjects[id].common.unit !== undefined) delete adapterObjects[id].common.unit;
        if (obj.common.min === undefined && adapterObjects[id].common.min !== undefined) delete adapterObjects[id].common.min;
        if (obj.common.max === undefined && adapterObjects[id].common.max !== undefined) delete adapterObjects[id].common.max;
        value = undefined; // when exists and it is first time do not overwrite value!
    }
    if (existingStates[id]) delete(existingStates[id]);
    if (adapterObjects[id] && isEquivalent(obj, adapterObjects[id])) {
        //adapter.log.debug('Object unchanged for ' + id + ': ' + JSON.stringify(adapterObjects[id]) + ' - update only: ' + JSON.stringify(value));
        if (value !== undefined) adapter.setState(id, value, true);
        if (stateChangeCallback) stateChangeTrigger[id] = stateChangeCallback;
        return;
    }
    //adapter.log.debug('Add Object for ' + id + ': ' + JSON.stringify(adapterObjects[id]) + '/' + JSON.stringify(obj));

    objectQueue.push({
        id: id,
        value: value,
        obj: obj,
        stateChangeCallback: stateChangeCallback,
        obtainCustomFields: obtainCustomFields
    });
    adapterObjects[id] = JSON.parse(JSON.stringify(obj));
    //adapter.log.debug('Create object for ' + id + ': ' + JSON.stringify(obj) + ' with value: ' + JSON.stringify(value));

    if (createNow) {
        processObjectQueue(callback);
    }
}

function deleteObject(id) {
    const obj = adapterObjects[id];
    if (obj && obj.type) {
        if (obj.type !== 'state') {
            Object.keys(adapterObjects).forEach((objId) => {
                if (objId.startsWith(id + '.')) {
                    adapter.delObject(objId, (err) => {
                        err = err ? ' (' + err + ')' : '';
                        adapter.log.info(adapterObjects[objId].type + ' ' +  objId + ' deleted' + err);
                        if (!err) {
                            delete adapterObjects[objId];
                        }
                    });
                }
            });

        }
        adapter.delObject(id, (err) => {
            adapter.log.info(adapterObjects[id].type + ' ' +  id + ' deleted (' + err + ')');
            if (!err) {
                delete adapterObjects[id];
            }
        });
    }
}


function isEquivalent(a, b) {
    //adapter.log.debug('Compare ' + JSON.stringify(a) + ' with ' +  JSON.stringify(b));
    // Create arrays of property names
    if (a === null || a === undefined || b === null || b === undefined) {
        return (a === b);
    }
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        //console.log('num props different: ' + JSON.stringify(aProps) + ' / ' + JSON.stringify(bProps));
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        if (typeof a[propName] !== typeof b[propName]) {
            //console.log('type props ' + propName + ' different');
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
                //console.log('props ' + propName + ' different');
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
        callback && callback();
        return;
    }

    function handleObject(queueEntry, callback) {
        if (!queueEntry.obj) {
            handleValue(queueEntry, () => {
                return callback && callback();
            });
        }
        adapter.getObject(queueEntry.id, (err, obj) => {
            if (!err && obj) {
                if (Array.isArray(queueEntry.obtainCustomFields)) {
                    queueEntry.obtainCustomFields.forEach(name => {
                        if (queueEntry.obj.common && queueEntry.obj.common[name]) delete queueEntry.obj.common[name];
                    });
                }
                adapter.extendObject(queueEntry.id, queueEntry.obj, () => {
                    handleValue(queueEntry, () => {
                        return callback && callback();
                    });
                });
            }
            else {
                adapter.setObject(queueEntry.id, queueEntry.obj, () => {
                    handleValue(queueEntry, () => {
                        return callback && callback();
                    });
                });
            }
        });
    }

    function handleValue(queueEntry, callback) {
        if (queueEntry.value === null || queueEntry.value === undefined) {
            stateChangeTrigger[queueEntry.id] = queueEntry.stateChangeCallback;
            return callback && callback();
        }
        adapter.setState(queueEntry.id, queueEntry.value, true, () => {
            stateChangeTrigger[queueEntry.id] = queueEntry.stateChangeCallback;
            return callback && callback();
        });
    }

    const queueEntry = objectQueue.shift();
    handleObject(queueEntry, () => {
        return processObjectQueue(callback);
    });
}

function getObject(id) {
    return adapterObjects[id];
}

function loadExistingObjects(callback) {
    adapter.getAdapterObjects((res) => {
        const objectKeys = Object.keys(res);
        for (let i = 0; i < objectKeys.length; i++) {
            if (objectKeys[i].indexOf(adapter.namespace + '.info') === 0) continue;
            existingStates[objectKeys[i].substr(adapter.namespace.length + 1)] = res[objectKeys[i]];
        }
        //adapter.log.debug('Existing States: ' + JSON.stringify(Object.keys(existingStates), null, 4));

        // devId + '.Bluetooth' = device , ChannelsOd = MACs
        // devId + '.Notifications' = channel, statesOf ??
        // devId + '.Routines' = channel, statesOf

        if (callback) callback();
    });
}

function handleStateChange(id, state) {
    if (!state || state.ack) return;
    id = id.substr(adapter.namespace.length + 1);

    if (typeof stateChangeTrigger[id] === 'function') {
        if (adapterObjects[id] && adapterObjects[id].common && adapterObjects[id].common.type && adapterObjects[id].common.type !== 'mixed') {
            if (adapterObjects[id].common.type === 'boolean' && adapterObjects[id].common.role && adapterObjects[id].common.role.startsWith('button')) state.val = !!state.val;
            if (typeof state.val !== adapterObjects[id].common.type) {
                adapter.log.error('Datatype for ' + id + ' differs from expected, ignore state change! Please write correct datatype (' + adapterObjects[id].common.type + ')');
                return;
            }
        }
        stateChangeTrigger[id](state.val);
    }
}

function init(adapterInstance) {
    adapter = adapterInstance;
}

module.exports = {
    init: init,
    setOrUpdateObject: setOrUpdateObject,
    deleteObject: deleteObject,
    processObjectQueue: processObjectQueue,
    loadExistingObjects: loadExistingObjects,
    getObject: getObject,
    handleStateChange: handleStateChange
};
