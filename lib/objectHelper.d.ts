export declare const existingStates: {
    [id: string]: ioBroker.Object;
};
export declare const adapterObjects: {
    [id: string]: ioBroker.Object;
};
export declare function setOrUpdateObject(id: string, obj: ioBroker.Object, obtainCustomFields: string[] | undefined, value?: ioBroker.StateValue | null, stateChangeCallback?: (stateVal: ioBroker.StateValue, state: ioBroker.State) => void, createNow?: boolean, callback?: () => void): void;
export declare function deleteObject(id: string): void;
export declare function processObjectQueue(callback?: () => void): void;
export declare function getObject(id: string): ioBroker.Object | undefined;
export declare function loadExistingObjects(callback?: () => void): void;
export declare function handleStateChange(id: string, state: ioBroker.State | null | undefined): void;
export declare function init(adapterInstance: ioBroker.Adapter): void;
declare const _default: {
    init: typeof init;
    setOrUpdateObject: typeof setOrUpdateObject;
    deleteObject: typeof deleteObject;
    processObjectQueue: typeof processObjectQueue;
    loadExistingObjects: typeof loadExistingObjects;
    getObject: typeof getObject;
    handleStateChange: typeof handleStateChange;
    existingStates: {
        [id: string]: ioBroker.Object;
    };
    adapterObjects: {
        [id: string]: ioBroker.Object;
    };
};
export default _default;
