'use strict';

const colorconv = require('./colorconv');

const icons = {
    // https://fontawesome.com/icons/file-signature?s=solid&f=classic
    signature: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NzYgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMi4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNjQgMEMyOC43IDAgMCAyOC43IDAgNjRWNDQ4YzAgMzUuMyAyOC43IDY0IDY0IDY0SDMyMGMzNS4zIDAgNjQtMjguNyA2NC02NFY0MjguN2MtMi43IDEuMS01LjQgMi04LjIgMi43bC02MC4xIDE1Yy0zIC43LTYgMS4yLTkgMS40Yy0uOSAuMS0xLjggLjItMi43IC4ySDI0MGMtNi4xIDAtMTEuNi0zLjQtMTQuMy04LjhsLTguOC0xNy43Yy0xLjctMy40LTUuMS01LjUtOC44LTUuNXMtNy4yIDIuMS04LjggNS41bC04LjggMTcuN2MtMi45IDUuOS05LjIgOS40LTE1LjcgOC44cy0xMi4xLTUuMS0xMy45LTExLjNMMTQ0IDM4MWwtOS44IDMyLjhjLTYuMSAyMC4zLTI0LjggMzQuMi00NiAzNC4ySDgwYy04LjggMC0xNi03LjItMTYtMTZzNy4yLTE2IDE2LTE2aDguMmM3LjEgMCAxMy4zLTQuNiAxNS4zLTExLjRsMTQuOS00OS41YzMuNC0xMS4zIDEzLjgtMTkuMSAyNS42LTE5LjFzMjIuMiA3LjggMjUuNiAxOS4xbDExLjYgMzguNmM3LjQtNi4yIDE2LjgtOS43IDI2LjgtOS43YzE1LjkgMCAzMC40IDkgMzcuNSAyMy4ybDQuNCA4LjhoOC45Yy0zLjEtOC44LTMuNy0xOC40LTEuNC0yNy44bDE1LTYwLjFjMi44LTExLjMgOC42LTIxLjUgMTYuOC0yOS43TDM4NCAyMDMuNlYxNjBIMjU2Yy0xNy43IDAtMzItMTQuMy0zMi0zMlYwSDY0ek0yNTYgMFYxMjhIMzg0TDI1NiAwek01NDkuOCAxMzkuN2MtMTUuNi0xNS42LTQwLjktMTUuNi01Ni42IDBsLTI5LjQgMjkuNCA3MSA3MSAyOS40LTI5LjRjMTUuNi0xNS42IDE1LjYtNDAuOSAwLTU2LjZsLTE0LjQtMTQuNHpNMzExLjkgMzIxYy00LjEgNC4xLTcgOS4yLTguNCAxNC45bC0xNSA2MC4xYy0xLjQgNS41IC4yIDExLjIgNC4yIDE1LjJzOS43IDUuNiAxNS4yIDQuMmw2MC4xLTE1YzUuNi0xLjQgMTAuOC00LjMgMTQuOS04LjRMNTEyLjEgMjYyLjdsLTcxLTcxTDMxMS45IDMyMXoiLz48L3N2Zz4=',
    // https://fontawesome.com/icons/signal?s=solid&f=classic
    signal: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NzYgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMi4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNTQ0IDBjMTcuNyAwIDMyIDE0LjMgMzIgMzJWNDgwYzAgMTcuNy0xNC4zIDMyLTMyIDMycy0zMi0xNC4zLTMyLTMyVjMyYzAtMTcuNyAxNC4zLTMyIDMyLTMyek00MTYgOTZjMTcuNyAwIDMyIDE0LjMgMzIgMzJWNDgwYzAgMTcuNy0xNC4zIDMyLTMyIDMycy0zMi0xNC4zLTMyLTMyVjEyOGMwLTE3LjcgMTQuMy0zMiAzMi0zMnpNMzIwIDIyNFY0ODBjMCAxNy43LTE0LjMgMzItMzIgMzJzLTMyLTE0LjMtMzItMzJWMjI0YzAtMTcuNyAxNC4zLTMyIDMyLTMyczMyIDE0LjMgMzIgMzJ6TTE2MCAyODhjMTcuNyAwIDMyIDE0LjMgMzIgMzJWNDgwYzAgMTcuNy0xNC4zIDMyLTMyIDMycy0zMi0xNC4zLTMyLTMyVjMyMGMwLTE3LjcgMTQuMy0zMiAzMi0zMnpNNjQgNDE2djY0YzAgMTcuNy0xNC4zIDMyLTMyIDMycy0zMi0xNC4zLTMyLTMyVjQxNmMwLTE3LjcgMTQuMy0zMiAzMi0zMnMzMiAxNC4zIDMyIDMyeiIvPjwvc3ZnPg==',
    // https://fontawesome.com/icons/wifi?s=solid&f=classic
    wifi: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMi4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNTQuMiAyMDIuOUMxMjMuMiAxMzYuNyAyMTYuOCA5NiAzMjAgOTZzMTk2LjggNDAuNyAyNjUuOCAxMDYuOWMxMi44IDEyLjIgMzMgMTEuOCA0NS4yLS45czExLjgtMzMtLjktNDUuMkM1NDkuNyA3OS41IDQ0MC40IDMyIDMyMCAzMlM5MC4zIDc5LjUgOS44IDE1Ni43Qy0yLjkgMTY5LTMuMyAxODkuMiA4LjkgMjAyczMyLjUgMTMuMiA0NS4yIC45ek0zMjAgMjU2YzU2LjggMCAxMDguNiAyMS4xIDE0OC4yIDU2YzEzLjMgMTEuNyAzMy41IDEwLjQgNDUuMi0yLjhzMTAuNC0zMy41LTIuOC00NS4yQzQ1OS44IDIxOS4yIDM5MyAxOTIgMzIwIDE5MnMtMTM5LjggMjcuMi0xOTAuNSA3MmMtMTMuMyAxMS43LTE0LjUgMzEuOS0yLjggNDUuMnMzMS45IDE0LjUgNDUuMiAyLjhjMzkuNS0zNC45IDkxLjMtNTYgMTQ4LjItNTZ6bTY0IDE2MGMwLTM1LjMtMjguNy02NC02NC02NHMtNjQgMjguNy02NCA2NHMyOC43IDY0IDY0IDY0czY0LTI4LjcgNjQtNjR6Ii8+PC9zdmc+',
    // https://fontawesome.com/icons/clock?s=solid&f=classic
    clock: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMi4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMjU2IDUxMkMxMTQuNiA1MTIgMCAzOTcuNCAwIDI1NlMxMTQuNiAwIDI1NiAwUzUxMiAxMTQuNiA1MTIgMjU2cy0xMTQuNiAyNTYtMjU2IDI1NnpNMjMyIDEyMFYyNTZjMCA4IDQgMTUuNSAxMC43IDIwbDk2IDY0YzExIDcuNCAyNS45IDQuNCAzMy4zLTYuN3M0LjQtMjUuOS02LjctMzMuM0wyODAgMjQzLjJWMTIwYzAtMTMuMy0xMC43LTI0LTI0LTI0cy0yNCAxMC43LTI0IDI0eiIvPjwvc3ZnPg==',
    // https://fontawesome.com/icons/arrows-rotate?s=solid&f=classic
    update: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMi4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMTA1LjEgMjAyLjZjNy43LTIxLjggMjAuMi00Mi4zIDM3LjgtNTkuOGM2Mi41LTYyLjUgMTYzLjgtNjIuNSAyMjYuMyAwTDM4Ni4zIDE2MEgzMzZjLTE3LjcgMC0zMiAxNC4zLTMyIDMyczE0LjMgMzIgMzIgMzJINDYzLjVjMCAwIDAgMCAwIDBoLjRjMTcuNyAwIDMyLTE0LjMgMzItMzJWNjRjMC0xNy43LTE0LjMtMzItMzItMzJzLTMyIDE0LjMtMzIgMzJ2NTEuMkw0MTQuNCA5Ny42Yy04Ny41LTg3LjUtMjI5LjMtODcuNS0zMTYuOCAwQzczLjIgMTIyIDU1LjYgMTUwLjcgNDQuOCAxODEuNGMtNS45IDE2LjcgMi45IDM0LjkgMTkuNSA0MC44czM0LjktMi45IDQwLjgtMTkuNXpNMzkgMjg5LjNjLTUgMS41LTkuOCA0LjItMTMuNyA4LjJjLTQgNC02LjcgOC44LTguMSAxNGMtLjMgMS4yLS42IDIuNS0uOCAzLjhjLS4zIDEuNy0uNCAzLjQtLjQgNS4xVjQ0OGMwIDE3LjcgMTQuMyAzMiAzMiAzMnMzMi0xNC4zIDMyLTMyVjM5Ni45bDE3LjYgMTcuNSAwIDBjODcuNSA4Ny40IDIyOS4zIDg3LjQgMzE2LjcgMGMyNC40LTI0LjQgNDIuMS01My4xIDUyLjktODMuN2M1LjktMTYuNy0yLjktMzQuOS0xOS41LTQwLjhzLTM0LjkgMi45LTQwLjggMTkuNWMtNy43IDIxLjgtMjAuMiA0Mi4zLTM3LjggNTkuOGMtNjIuNSA2Mi41LTE2My44IDYyLjUtMjI2LjMgMGwtLjEtLjFMMTI1LjYgMzUySDE3NmMxNy43IDAgMzItMTQuMyAzMi0zMnMtMTQuMy0zMi0zMi0zMkg0OC40Yy0xLjYgMC0zLjIgLjEtNC44IC4zcy0zLjEgLjUtNC42IDF6Ii8+PC9zdmc+',
    // https://fontawesome.com/icons/unlock?s=solid&f=classic
    auth: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMi4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMTQ0IDE0NGMwLTQ0LjIgMzUuOC04MCA4MC04MGMzMS45IDAgNTkuNCAxOC42IDcyLjMgNDUuN2M3LjYgMTYgMjYuNyAyMi44IDQyLjYgMTUuMnMyMi44LTI2LjcgMTUuMi00Mi42QzMzMSAzMy43IDI4MS41IDAgMjI0IDBDMTQ0LjUgMCA4MCA2NC41IDgwIDE0NHY0OEg2NGMtMzUuMyAwLTY0IDI4LjctNjQgNjRWNDQ4YzAgMzUuMyAyOC43IDY0IDY0IDY0SDM4NGMzNS4zIDAgNjQtMjguNyA2NC02NFYyNTZjMC0zNS4zLTI4LjctNjQtNjQtNjRIMTQ0VjE0NHoiLz48L3N2Zz4=',
    // https://fontawesome.com/icons/circle-question?s=solid&f=classic
    question: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMi4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMjU2IDUxMmMxNDEuNCAwIDI1Ni0xMTQuNiAyNTYtMjU2UzM5Ny40IDAgMjU2IDBTMCAxMTQuNiAwIDI1NlMxMTQuNiA1MTIgMjU2IDUxMnpNMTY5LjggMTY1LjNjNy45LTIyLjMgMjkuMS0zNy4zIDUyLjgtMzcuM2g1OC4zYzM0LjkgMCA2My4xIDI4LjMgNjMuMSA2My4xYzAgMjIuNi0xMi4xIDQzLjUtMzEuNyA1NC44TDI4MCAyNjQuNGMtLjIgMTMtMTAuOSAyMy42LTI0IDIzLjZjLTEzLjMgMC0yNC0xMC43LTI0LTI0VjI1MC41YzAtOC42IDQuNi0xNi41IDEyLjEtMjAuOGw0NC4zLTI1LjRjNC43LTIuNyA3LjYtNy43IDcuNi0xMy4xYzAtOC40LTYuOC0xNS4xLTE1LjEtMTUuMUgyMjIuNmMtMy40IDAtNi40IDIuMS03LjUgNS4zbC0uNCAxLjJjLTQuNCAxMi41LTE4LjIgMTktMzAuNiAxNC42cy0xOS0xOC4yLTE0LjYtMzAuNmwuNC0xLjJ6TTI4OCAzNTJjMCAxNy43LTE0LjMgMzItMzIgMzJzLTMyLTE0LjMtMzItMzJzMTQuMy0zMiAzMi0zMnMzMiAxNC4zIDMyIDMyeiIvPjwvc3ZnPg==',
    // https://fontawesome.com/icons/microchip?s=solid&f=classic
    chip: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMi4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMTc2IDI0YzAtMTMuMy0xMC43LTI0LTI0LTI0cy0yNCAxMC43LTI0IDI0VjY0Yy0zNS4zIDAtNjQgMjguNy02NCA2NEgyNGMtMTMuMyAwLTI0IDEwLjctMjQgMjRzMTAuNyAyNCAyNCAyNEg2NHY1NkgyNGMtMTMuMyAwLTI0IDEwLjctMjQgMjRzMTAuNyAyNCAyNCAyNEg2NHY1NkgyNGMtMTMuMyAwLTI0IDEwLjctMjQgMjRzMTAuNyAyNCAyNCAyNEg2NGMwIDM1LjMgMjguNyA2NCA2NCA2NHY0MGMwIDEzLjMgMTAuNyAyNCAyNCAyNHMyNC0xMC43IDI0LTI0VjQ0OGg1NnY0MGMwIDEzLjMgMTAuNyAyNCAyNCAyNHMyNC0xMC43IDI0LTI0VjQ0OGg1NnY0MGMwIDEzLjMgMTAuNyAyNCAyNCAyNHMyNC0xMC43IDI0LTI0VjQ0OGMzNS4zIDAgNjQtMjguNyA2NC02NGg0MGMxMy4zIDAgMjQtMTAuNyAyNC0yNHMtMTAuNy0yNC0yNC0yNEg0NDhWMjgwaDQwYzEzLjMgMCAyNC0xMC43IDI0LTI0cy0xMC43LTI0LTI0LTI0SDQ0OFYxNzZoNDBjMTMuMyAwIDI0LTEwLjcgMjQtMjRzLTEwLjctMjQtMjQtMjRINDQ4YzAtMzUuMy0yOC43LTY0LTY0LTY0VjI0YzAtMTMuMy0xMC43LTI0LTI0LTI0cy0yNCAxMC43LTI0IDI0VjY0SDI4MFYyNGMwLTEzLjMtMTAuNy0yNC0yNC0yNHMtMjQgMTAuNy0yNCAyNFY2NEgxNzZWMjR6TTE2MCAxMjhIMzUyYzE3LjcgMCAzMiAxNC4zIDMyIDMyVjM1MmMwIDE3LjctMTQuMyAzMi0zMiAzMkgxNjBjLTE3LjcgMC0zMi0xNC4zLTMyLTMyVjE2MGMwLTE3LjcgMTQuMy0zMiAzMi0zMnptMTkyIDMySDE2MFYzNTJIMzUyVjE2MHoiLz48L3N2Zz4=',
};

function getIcon(key) {
    return icons?.[key] ? `data:image/svg+xml;base64,${icons[key]}` : '';
}

/**
 * Celsius to Fahrenheit
 * @param {number} celsius - 10
 */
function celsiusToFahrenheit(celsius) {
    try {
        const fahrenheit = celsius * 1.8 + 32;
        return Math.round(fahrenheit * 100) / 100;
    } catch {
        return undefined;
    }
}

/**
 * Fahrenheit to Celsius
 * @param {number} fahrenheit - 20
 */
function fahrenheitToCelsius(fahrenheit) {
    try {
        const celsius = (fahrenheit - 32) * 5 / 9;
        return Math.round(celsius * 100) / 100;
    } catch {
        return undefined;
    }
}

/**
 *
 * @param {*} self
 * @param {*} name - Name of the device
 */
async function setDeviceName(self, name) {
    const deviceId = self.getDeviceId();
    const obj = await self.adapter.getObjectAsync(deviceId);

    if (name && obj && obj.common && name !== obj.common.name) {
        await self.adapter.extendObjectAsync(deviceId, {
            common: {
                name: name,
            },
        });
    }

    return name;
}

/**
 *
 * @param {*} self
 * @param {*} id - channel id like Relay0
 * @param {*} name - Name of the channel
 */
async function setChannelName(self, id, name) {
    const channelId = `${self.getDeviceId()}.${id}`;
    const obj = await self.adapter.getObjectAsync(channelId);

    if (name && obj && obj.common && name !== obj.common.name) {
        await self.adapter.extendObjectAsync(channelId, {
            common: {
                name: name,
            },
        });
    }

    return name;
}

/**
 * Get external temperature for device with key in unit C or F
 * @param {*} value - like JSON.parse(value)
 * @param {*} key  - '0', '1', ....
 * @param {*} unit . 'C' or 'F'
 */
function getExtTemp(value, key, unit) {
    let unitkey = '';
    switch (unit) {
        case 'C':
            unitkey = 'tC';
            break;
        case 'F':
            unitkey = 'tF';
            break;
        default:
            return 0;
    }
    if (value?.ext_temperature?.[key]?.[unitkey]) {
        return value.ext_temperature[key][unitkey];
    } else {
        return null;
    }
}

/**
 * Get external humidity for device with key
 * @param {*} value - like JSON.parse(value)
 * @param {*} key  - '0', '1', ....
 */
function getExtHum(value, key) {
    if (value?.ext_humidity?.[key]?.['hum']) {
        return value.ext_humidity[key]['hum'];
    } else {
        return null;
    }
}

/**
 *
 * @param {*} self
 */
async function getLightsObjectColor(self) {
    const id = self.getDeviceId();
    const obj = {
        'ison': 'lights.Switch',
        'mode': 'lights.mode',
        'red': 'lights.red',
        'green': 'lights.green',
        'blue': 'lights.blue',
        'white': 'lights.white',
        'gain': 'lights.gain',
        'temp': 'lights.temp',
        'brightness': 'lights.brightness',
        'effect': 'lights.effect',
    };

    for (const i in obj) {
        const stateId = `${id}.${obj[i]}`;
        const state = await self.adapter.getStateAsync(stateId);
        obj[i] = state ? state.val : undefined;
    }
    return obj;
}

async function getLightsObjectWhite(self) {
    const id = self.getDeviceId();
    const obj = {
        'ison': 'lights.Switch',
        'white': 'lights.white',
        'temp': 'lights.temp',
        'brightness': 'lights.brightness',
    };

    for (const i in obj) {
        const stateId = `${id}.${obj[i]}`;
        const state = await self.adapter.getStateAsync(stateId);
        obj[i] = state ? state.val : undefined;
    }
    return obj;
}

/**
 * get the hex value for an integer value
 * @param {*} number like 10 or 99
 */
function intToHex(number) {
    if (!number) number = 0;
    let hex = number.toString(16);
    hex = ('00' + hex).slice(-2).toUpperCase(); // 'a' -> '0A'
    return hex;
}

/**
 * get the integer value for a hex value
 * @param {*} hex like 0A or FF
 */
function hextoInt(hex) {
    if (!hex) hex = '00';
    return parseInt(hex, 16);
}

/**
 * get the RGBW value for red, green, blue, white value
 * @param {*} self
 */
async function getRGBW(self) {
    const id = self.getDeviceId();
    let stateId;
    let state;
    stateId = id + '.lights.red';
    state = await self.adapter.getStateAsync(stateId);
    const valred = state ? state.val : 0;
    stateId = id + '.lights.green';
    state = await self.adapter.getStateAsync(stateId);
    const valgreen = state ? state.val : 0;
    stateId = id + '.lights.blue';
    state = await self.adapter.getStateAsync(stateId);
    const valblue = state ? state.val : 0;
    stateId = id + '.lights.white';
    state = await self.adapter.getStateAsync(stateId);
    const valwhite = state ? state.val : 0;
    return '#' + intToHex(valred) + intToHex(valgreen) + intToHex(valblue) + intToHex(valwhite);
}

function getColorsFromRGBW(value) {
    value = value || '#00000000';
    const obj = {
        red: hextoInt(value.substr(1, 2) || '00'),
        green: hextoInt(value.substr(3, 2) || '00'),
        blue: hextoInt(value.substr(5, 2) || '00'),
        white: hextoInt(value.substr(7, 2) || '00'),
    };
    return obj;
}

async function getHsvFromRgb(self) {
    const value = await getRGBW(self);
    const rgbw = getColorsFromRGBW(value);
    const hsv = colorconv.rgbToHsv(rgbw.red, rgbw.green, rgbw.blue);
    return {
        hue: hsv[0],
        saturation: hsv[1],
        brightness: hsv[2],
    };
}

async function getColorsFromHue(self) {
    const id = self.getDeviceId();
    let stateId;
    let state;
    stateId = id + '.lights.hue';
    state = await self.adapter.getStateAsync(stateId);
    const valhue = state ? state.val : 0;
    stateId = id + '.lights.saturation';
    state = await self.adapter.getStateAsync(stateId);
    const valsaturation = state ? state.val : 0;
    // stateId = id + '.lights.value';
    stateId = `${id}.lights.gain`;
    state = await self.adapter.getStateAsync(stateId);
    const valvalue = state ? state.val : 0;
    const rgb = colorconv.hsvToRgb(valhue, valsaturation, valvalue);
    const obj = {
        red: rgb[0],
        green: rgb[1],
        blue: rgb[2],
    };
    return obj;
}

async function getPowerFactor(self, channel) {
    // let stateVoltage = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter' + channel + '.Voltage');
    const statePower = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter' + channel + '.Power');
    const stateReactivePower = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter' + channel + '.ReactivePower');
    let pf = 0.00;
    if (statePower && stateReactivePower) {
        // let voltage = stateVoltage.val;
        const power = statePower.val;
        const reactive = stateReactivePower.val;
        if (Math.abs(power) + Math.abs(reactive) > 1.5) {
            pf = power / Math.sqrt(power * power + reactive * reactive);
            pf = Math.round(pf * 100) / 100;
        }
    }
    return pf;
}

/**
 * For EM3, it was not a good idea to implement this function. To far away from standard
 * @param {*} self
 */
async function getTotalSumm(self) {
    let calctotal = 0.00;
    const TotalPhase1 = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter0.Total');
    const TotalPhase2 = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter1.Total');
    const TotalPhase3 = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter2.Total');
    calctotal = (TotalPhase1.val + TotalPhase2.val + TotalPhase3.val);
    calctotal = Math.round(calctotal * 100) / 100;
    return calctotal;
}

async function getTotalReturnedSumm(self) {
    let calctotal = 0.00;
    const TotalPhase1 = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter0.Total_Returned');
    const TotalPhase2 = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter1.Total_Returned');
    const TotalPhase3 = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter2.Total_Returned');
    calctotal = (TotalPhase1.val + TotalPhase2.val + TotalPhase3.val);
    calctotal = Math.round(calctotal * 100) / 100;
    return calctotal;
}

/**
 * For EM3, it was not a good idea to implement this function. To far away from standard
 * @param {*} self
 */
async function getCurrentSumm(self) {
    let calccurrent = 0.00;
    const CurrentPhase1 = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter0.Current');
    const CurrentPhase2 = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter1.Current');
    const CurrentPhase3 = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter2.Current');
    calccurrent = (CurrentPhase1.val + CurrentPhase2.val + CurrentPhase3.val);
    calccurrent = Math.round(calccurrent * 100) / 100;
    return calccurrent;
}

/**
 * For EM3, it was not a good idea to implement this function. To far away from standard
 * @param {*} self
 */
async function getPowerSumm(self) {
    let calcPower = 0.00;
    const PowerPhase1 = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter0.Power');
    const PowerPhase2 = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter1.Power');
    const PowerPhase3 = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter2.Power');
    calcPower = (PowerPhase1.val + PowerPhase2.val + PowerPhase3.val);
    calcPower = Math.round(calcPower * 100) / 100;
    return calcPower;
}

/**
 * For EM3, it was not a good idea to implement this function. To far away from standard
 * @param {*} self
 */
async function getVoltageCalc(self, vtype) {
    let calcVoltage = 0.00;
    const VoltagePhase1 = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter0.Voltage');
    const VoltagePhase2 = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter1.Voltage');
    const VoltagePhase3 = await self.adapter.getStateAsync(self.getDeviceId() + '.Emeter2.Voltage');
    if (vtype == 'mean') {
        calcVoltage = ((VoltagePhase1.val + VoltagePhase2.val + VoltagePhase3.val) / 3);
    } else {
        calcVoltage = ((VoltagePhase1.val + VoltagePhase2.val + VoltagePhase3.val) / Math.sqrt(3));
    }
    calcVoltage = Math.round(calcVoltage * 100) / 100;
    return calcVoltage;
}

/**
 * Timer
 * @param {*} self
 * @param {string} id - e.g. 'Relay0.Timer'
 * @param {number} [newVal] - e.g. 10
 */
async function getSetDuration(self, id, newVal) {
    try {
        id = self.getDeviceId() + '.' + id;
        const state = await self.adapter.getStateAsync(id);
        let value;

        if (state) {
            value = state.val > 0 ? state.val : 0;
        }

        if (newVal !== undefined && newVal >= 0) {
            await self.adapter.setStateAsync(id, { val: newVal, ack: true });
        }

        return value;
    } catch {
        return 0;
    }
}

/**
 * Get favorite position
 * @param {*} self
 * @param {*} id
 */
async function getFavoritePosition(self, id) {
    const node = self.getDeviceId() + '.' + id;
    const state = await self.adapter.getStateAsync(node);
    return state ? state.val : undefined;
}

module.exports = {
    getIcon,
    celsiusToFahrenheit,
    fahrenheitToCelsius,
    setDeviceName,
    setChannelName,
    getExtTemp,
    getExtHum,
    getLightsObjectColor,
    getLightsObjectWhite,
    intToHex,
    hextoInt,
    getHsvFromRgb,
    getColorsFromHue,
    getColorsFromRGBW,
    getPowerFactor,
    getTotalSumm,
    getTotalReturnedSumm,
    getCurrentSumm,
    getPowerSumm,
    getVoltageCalc,
    getSetDuration,
    getFavoritePosition,
    getRGBW,
};
