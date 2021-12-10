![Logo](../../admin/shelly.png)

# ioBroker.shelly

## Anforderungen

1. nodejs 12.0 (oder neuer)
2. js-controller 3.3.0 (oder neuer)
4. Admin Adapter 5.1.25 (oder neuer)

## Geräte-Generationen

Für mehr Informationen, siehe *supported devices*.

- Gen1: ESP8266 Geräte, CoAP oder MQTT
- Gen2: ESP32 Geräte, RCP oder MQTT

## General

Der Adapter kann über CoAP oder MQTT mit den Geräten kommunizieren. Der Standard ist CoAP - in diesem Fall muss nichts weiter konfiguriert werden. **Falls Gen2-Geräte integriert werden sollen, muss MQTT konfiguriert werden!**

![iobroker_general](../iobroker_general.png)

## Konfiguration

### Geschützter Login

Um die Shelly-Geräte vor unbefugtem Zugriff zu schützen, setze in der ioBroker Konfiguration einen beliebigen Benutzernamen und Passwort im Tab *Allgemeine Einstellungen*.

![iobroker_general_restrict_login](../iobroker_general_restrict_login.png)

Aktiviere den geschützten Zugriff auf allen Shelly-Gerätem:

1. Öffne die Shelly-Webkonfiguration in einem Browser (nicht in der Shelly App!)
2. Gehe zu ```Internet & Security settings -> Restricted Login```
3. Setze den Haken für den gesicherten Zugriff und gib die gerade konfigurierten Zugangsdaten ein
4. Speichere die Konfiguration - der Shelly startet automatisch neu
5. Stelle sicher, dass auf allen Shelly-Geräten die identischen Zugangsdaten konfiguriert werden

![shelly_restrict_login](../shelly_restrict_login.png)

### Zustandsänderungen

Im Standard wird ein Zustand nur aktualisiert, wenn sich der Wert ändert. In diesem Fall ist *Objekte aktualisieren, auch wenn keine Wertänderung vorliegt* deaktiviert.

Beispiel:

* shelly.0.SHBTN-1#A4CF12F454A3#1.Button.Event = 'S' (Zeitpunkt letzte Änderung: 01.02.2020 10:20:00)
* shelly.0.SHBTN-1#A4CF12F454A3#1.Button.Event = 'S' (Zeitpunkt letzte Änderung: 01.02.2020 **10:20:00**) - es erfolgt keine Aktualisierung des Zustandes im ioBroker
* shelly.0.SHBTN-1#A4CF12F454A3#1.Button.Event = 'L' (Zeitpunkt letzte Änderung: 01.02.2020 10:22:00)

Falls Du *Objekte aktualisieren, auch wenn keine Wertänderung vorliegt* aktivierst, werden alle Zustände ständig aktualisiert, selbst wenn keine Wertänderung stattfindet. Es ändert sich also nur der Zeitpunkt der letzten Aktualisierung.

Beispiel:

* shelly.0.SHBTN-1#A4CF12F454A3#1.Button.Event = 'S' (Zeitpunkt letzte Änderung: 01.02.2020 10:20:00)
* shelly.0.SHBTN-1#A4CF12F454A3#1.Button.Event = 'S' (Zeitpunkt letzte Änderung: 01.02.2020 **10:21:00**) - der Zeitpunkt wird aktualisiert, obwohl es keine Wertänderung gab
* shelly.0.SHBTN-1#A4CF12F454A3#1.Button.Event = 'L' (Zeitpunkt letzte Änderung: 01.02.2020 10:22:00)

### CoAP

Im Standard wird das CoAP-Protokoll verwendet.

Falls Du einen Shelly mit einer Firmware kleiner oder gleich 1.9.4 verwendest, ist keine weitere Konfiguration notwendig. Deine Geräte werden automatisch vom Adapter gefunden.

**Falls Du eine Version größer als 1.9.4 verwendest, musst Du einen CoIoT-Server für CoAP auf den Shelly-Geräten konfigurieren.** Trag als CoIoT-Server die IP-Adresse von deinem ioBroker Server ein - gefolgt von Port 5683. Wenn dein ioBroker beispielsweise unter der Adresse ```192.168.1.2``` erreichbar ist, trage dort ```192.168.1.2:5683``` ein und aktiviere CoIoT.

**Wichtig: Da CoAP Multicast UDP Pakete verwendet, müssen deine Shelly-Geräte im gleichen Subnetz wie dein ioBroker Server sein.**

Falls Du ioBroker in einem Docker-Container laufen hast, muss der Container im Netzwerkmodus ```host``` oder ```macvlan``` konfiguriert sein. Sollte der Docker-Container im Netzwerkmodus ```bridge``` laufen, werden keine Shelly-Geräte gefunden.

![iobroker_restrict_login](../iobroker_general_coap.png)

CoAP fügt alle Geräte in deinem Netzwerk hinzu. Falls Du einzelne Geräte ausschließen möchtest, kannst Du diese in der Blacklist konfigurieren. Füge dafür die Seriennummern in die Tabelle ein:

![iobroker_coap](../iobroker_coap.png)

#### Fehlersuche

In manchen Fällen kann es vorkommen, dass der Shelly-Adapter nicht alle Geräte im CoAP-Modus findet. Versuche dann folgendes:

1. Stoppe deine Instanz des Shelly-Adapters. **Es ist nicht nötig, den Adapter zu deinstallieren!**
2. Öffne ein Terminal-Fenster und führe die folgenden Befehle auf dem ioBroker-Server aus:

```
cd /opt/iobroker/node_modules/iobroker.shelly/
node coaptest.js 
```

Alternativ kann ```tcpdump``` verwendet werden:

```
# Install tcpdump if it is not installed
sudo apt-get update
sudo apt-get install tcpdump

# tcpdump with IP address of Shelly device on network device eth1
sudo tcpdump -i eth1 src <IP-OF-SHELLY> and port 5683 -A   

# tcpdump with IP address of Shelly device 
sudo tcpdump src <IP-OF-SHELLY> and port 5683 -A

# tcpdump of all Shelly devices on network device eth1
sudo tcpdump  -i eth1 port 5683 -A

 # tcpdump of all Shelly devices
sudo tcpdump port 5683 -A
```

Nun solltest Du alle CoAP-Nachrichten von den Shelly-Geräten sehen. Solltest Du keine Nachrichten sehen, hast Du ein Netzwerkproblem mit UDP oder Multicast-Nachrichten.

CoAP-Nachrichten sehen wie folgt aus:

``` 
UDP Server listening on 0.0.0.0:5683
2020-08-19T19:33:29.484Z - 192.168.20.233:5683 - P-B3citsml	SHBTN-1#AXXXXXXXXXX#2RC{"G":[[0,9103,0],[0,2102,"S"],[0,2103,1],[0,3115,0],[0,3112,0],[0,3111,100],[0,9102,["button"]]]}
2020-08-19T19:33:29.827Z - 192.168.20.233:5683 - P-C3citsml	SHBTN-1#AXXXXXXXXXX#2RC{"G":[[0,9103,0],[0,2102,"S"],[0,2103,1],[0,3115,0],[0,3112,0],[0,3111,100],[0,9102,["button"]]]}
2020-08-19T19:33:33.942Z - 192.168.20.233:5683 - P-D3citsml	SHBTN-1#AXXXXXXXXXX#2RC{"G":[[0,9103,0],[0,2102,"S"],[0,2103,1],[0,3115,0],[0,3112,0],[0,3111,100],[0,9102,["button"]]]}
``` 

### MQTT

1. Öffne die Shelly-Adapter Konfiguration im ioBroker
2. Wähle ```MQTT und HTTP``` als *Protokoll* in den *Allgemeinen Einstellungen*
3. Öffne das Tab **MQTT Einstellungen**
4. Wähle einen Benutzernamen und ein sicheres Passwort (Du musst diese Informationen auf den Shelly-Geräten hinterlegen)

![iobroker_general](../iobroker_general_mqtt.png)

![iobroker_mqtt](../iobroker_mqtt.png)

Aktiviere MQTT auf deinen Shelly-Geräten:

1. Öffne die Shelly-Webkonfiguration in einem Browser (nicht in der Shelly App!)
2. Gehe zu ```Internet & Security settings -> Advanced - Developer settings```
3. Aktiviere MQTT und gib die gerade konfigurierten Benutzerdaten und die IP-Adresse deiner ioBroker-Installation ein - gefolgt von Port 1882 (beispielsweise ```192.168.20.242:1882```)
4. Speichere die Konfiguration - der Shelly startet automatisch neu

- Bei Gen1-Geräten: Ändere nicht den ```custom MQTT prefix``` (der Adapter wird nicht funktionieren, wenn Du diesen Wert anpasst)

![shelly_mqtt1](../shelly_mqtt1.png)

![shelly_mqtt2](../shelly_mqtt2.png)
