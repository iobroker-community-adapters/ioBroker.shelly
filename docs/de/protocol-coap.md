![Logo](../../admin/shelly.png)

# ioBroker.shelly

## CoAP

Im Standard wird das CoAP-Protokoll verwendet.

Falls Du einen Shelly mit einer Firmware kleiner oder gleich 1.9.4 verwendest, ist keine weitere Konfiguration notwendig. Deine Geräte werden automatisch vom Adapter gefunden.

**Falls Du eine Version größer als 1.9.4 verwendest, musst Du einen CoIoT-Server für CoAP auf den Shelly-Geräten konfigurieren.** Trag als CoIoT-Server die IP-Adresse von deinem ioBroker Server ein - gefolgt von Port ```5683```. Wenn dein ioBroker beispielsweise unter der Adresse ```192.168.1.2``` erreichbar ist, trage dort ```192.168.1.2:5683``` ein und aktiviere CoIoT.

**Wichtig: Da CoAP Multicast UDP Pakete verwendet, müssen deine Shelly-Geräte im gleichen Subnetz wie dein ioBroker Server sein.**

Falls Du ioBroker in einem Docker-Container laufen hast, muss der Container im Netzwerkmodus ```host``` oder ```macvlan``` konfiguriert sein. Sollte der Docker-Container im Netzwerkmodus ```bridge``` laufen, werden keine Shelly-Geräte gefunden.

![iobroker_restrict_login](./img/iobroker_general_coap.png)

CoAP fügt alle Geräte in deinem Netzwerk hinzu. Falls Du einzelne Geräte ausschließen möchtest, kannst Du diese in der Blacklist konfigurieren. Füge dafür die Seriennummern in die Tabelle ein:

![iobroker_coap](./img/iobroker_coap.png)

![shelly_coap](./img/shelly_coap.png)

### Wichtige Hinweise

#### Shelly Firmware 1.8.0 (oder neuer)

- Falls Du das CoAP-Protokoll nutzt, muss ab dieser Version der Adapter in Version 4.0.0 (oder neuer) genutzt werden.
- Für Geräte mit älterer Firmware (außer Shelly 4 Pro) muss der Adapter in Version 3.3.6 (oder älter) genutzt werden. Die Adapter-Version 4.0.0 (oder neuer) ist nicht mit älteren Firmware-Versionen kompatibel!

#### Shelly Firmware 1.9.4 (oder neuer)

- Ab dieser Version muss ein CoIoT-Server auf jedem Shelly hinterlegt werden, falls das CoAP-Protokoll genutzt wird (unicast).
