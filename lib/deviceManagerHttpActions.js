'use strict';

function getWritableStateSuffixes(objects, namespace, shortDeviceId) {
    const prefix = `${namespace}.${shortDeviceId}.`;
    return Object.values(objects)
        .filter(obj => obj?.type === 'state' && obj._id.startsWith(prefix))
        .filter(obj => obj.common?.write !== false)
        .map(obj => obj._id.substring(prefix.length));
}

function getHttpDeviceManagerCommands(objects, namespace, shortDeviceId) {
    const suffixes = getWritableStateSuffixes(objects, namespace, shortDeviceId);
    const commands = [];
    const firstSwitch = suffixes.find(suffix =>
        /^(Relay|Switch|Light|RGB|RGBW|lights|white)(\d*)\.Switch$/.test(suffix),
    );
    const firstToggle = suffixes.find(suffix =>
        /^(Relay|Switch|Light|RGB|RGBW|lights|white)(\d*)\.Toggle$/.test(suffix),
    );
    const coverOpen = suffixes.find(suffix => /^Cover(\d*)\.Open$/.test(suffix));
    const coverClose = suffixes.find(suffix => /^Cover(\d*)\.Close$/.test(suffix));
    const coverStop = suffixes.find(suffix => /^Cover(\d*)\.Stop$/.test(suffix));

    if (firstSwitch) {
        commands.push(
            { id: 'http-on', icon: 'play', label: 'On', stateSuffix: firstSwitch, value: true },
            { id: 'http-off', icon: 'stop', label: 'Off', stateSuffix: firstSwitch, value: false },
        );
    }

    if (firstToggle) {
        commands.push({ id: 'http-toggle', icon: 'refresh', label: 'Toggle', stateSuffix: firstToggle, value: true });
    }

    if (coverOpen) {
        commands.push({ id: 'http-cover-open', icon: 'play', label: 'Open', stateSuffix: coverOpen, value: true });
    }
    if (coverClose) {
        commands.push({ id: 'http-cover-close', icon: 'stop', label: 'Close', stateSuffix: coverClose, value: true });
    }
    if (coverStop) {
        commands.push({ id: 'http-cover-stop', icon: 'pause', label: 'Stop', stateSuffix: coverStop, value: true });
    }

    return commands;
}

module.exports = {
    getHttpDeviceManagerCommands,
};
