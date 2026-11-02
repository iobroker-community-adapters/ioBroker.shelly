const assert = require('node:assert');
const datapoints = require('../build/lib/datapoints');
const ObjectHelper = require('../build/lib/objectHelper').default;

const NAMESPACE = 'shelly.0';
const STATE_ID = 'shellyplugsg3#tv#1.PLUGS_UI.Mode';

// Minimal adapter: keeps objects and states in memory, like js-controller does
function createAdapter(objects) {
    const states = {};
    return {
        namespace: NAMESPACE,
        objects,
        states,
        log: { error: () => {}, info: () => {}, debug: () => {} },
        getAdapterObjects: cb => cb({ ...objects }),
        getObject: (id, cb) => cb(null, objects[`${NAMESPACE}.${id}`]),
        setObject: (id, obj, cb) => {
            objects[`${NAMESPACE}.${id}`] = obj;
            cb();
        },
        extendObject: (id, obj, cb) => {
            objects[`${NAMESPACE}.${id}`] = { ...objects[`${NAMESPACE}.${id}`], ...obj };
            cb();
        },
        setState: (id, val, ack, cb) => {
            states[`${NAMESPACE}.${id}`] = { val, ack };
            cb?.();
            return Promise.resolve();
        },
        // delForeignObject removes the state together with the object
        delForeignObject: id => {
            delete objects[id];
            delete states[id];
        },
    };
}

const stateObject = () => ({
    type: 'state',
    common: { name: { en: 'Mode' }, type: 'string', role: 'state', read: true, write: true },
});

// The object as stored by js-controller after a previous run of the adapter
const storedObject = () => ({
    _id: `${NAMESPACE}.${STATE_ID}`,
    ...stateObject(),
    native: {},
    from: 'system.adapter.shelly.0',
    ts: 1,
});

describe('Test object helper', function () {
    it('Recreates an object which was deleted without the helper', async function () {
        const adapter = createAdapter({ [`${NAMESPACE}.${STATE_ID}`]: storedObject() });
        const objectHelper = new ObjectHelper(adapter);
        await new Promise(resolve => objectHelper.loadExistingObjects(resolve));

        // deleteOldStates() deletes the object directly
        adapter.delForeignObject(`${NAMESPACE}.${STATE_ID}`);
        objectHelper.forgetObject(STATE_ID);

        // createObjects() and httpIoBrokerState() afterwards
        objectHelper.setOrUpdateObject(STATE_ID, stateObject(), ['name'], undefined, undefined, false);
        await new Promise(resolve => objectHelper.processObjectQueue(resolve));
        objectHelper.setOrUpdateObject(STATE_ID, stateObject(), ['name'], 'switch');

        assert.ok(adapter.objects[`${NAMESPACE}.${STATE_ID}`], 'the object must be created again');
        assert.strictEqual(adapter.states[`${NAMESPACE}.${STATE_ID}`]?.val, 'switch');
    });

    it('Forgets the objects below a deleted channel', function () {
        const adapter = createAdapter({});
        const objectHelper = new ObjectHelper(adapter);
        objectHelper.setOrUpdateObject(STATE_ID, stateObject(), ['name'], undefined, undefined, false);
        objectHelper.setOrUpdateObject('shellyplugsg3#tv#1.PLUGS_UIx', stateObject(), ['name'], undefined, undefined, false);

        objectHelper.forgetObject('shellyplugsg3#tv#1.PLUGS_UI', true);

        assert.strictEqual(objectHelper.getObject(STATE_ID), undefined);
        assert.ok(objectHelper.getObject('shellyplugsg3#tv#1.PLUGS_UIx'), 'only objects below the ID are forgotten');
    });
});

describe('Test firmware dependent states', function () {
    const plugsUI = (...args) =>
        Object.keys(datapoints.getDeviceByClass('shellyplugsg3', 'mqtt', undefined, ...args)).filter(id =>
            id.startsWith('PLUGS_UI.'),
        );

    it('Creates the states only for a firmware version which supports them', function () {
        assert.strictEqual(plugsUI().length, 0);
        assert.strictEqual(plugsUI('1.7.1').length, 0);
        assert.ok(plugsUI('2.0.0').length > 0);
    });

    it('Keeps the states while the firmware version is unknown', function () {
        assert.deepStrictEqual(plugsUI(undefined, true), plugsUI('2.0.0'));
        assert.strictEqual(plugsUI('1.7.1', true).length, 0);
    });
});
