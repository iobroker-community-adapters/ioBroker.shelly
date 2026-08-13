# HTTP-Polling

HTTP-Polling ist eine Alternative zu CoAP und MQTT, wenn ioBroker Shelly-Geräte über TCP-Port 80 erreicht, Multicast, eingehende Rückkanäle oder ein MQTT-Broker aber nicht verfügbar sind.

## Discovery, Registry-Start und Polling

Diese Funktionen sind getrennt:

- **Discovery** prüft ausschließlich die konfigurierten IPv4-Adressen oder Bereiche und findet neue Geräte. Sie ist optional.
- **Registry-Start** liest bekannte Geräte und deren `hostname`-State aus dem ioBroker-Objektbaum. Er funktioniert auch bei deaktivierter Discovery.
- **Polling** liest periodisch die HTTP-Endpunkte aus den vorhandenen Device Definitions und aktualisiert die normalen Shelly-States.

Nach der ersten Erkennung darf die Discovery deaktiviert werden. Bekannte Geräte starten und pollen nach einem Adapter-Neustart weiter; beschreibbare States bleiben funktionsfähig. Es wird keine zweite Device Registry angelegt.

Als Protokoll wird `HTTP-Polling` gewählt. Das historische `both` bedeutet weiterhin MQTT plus CoAP und schließt HTTP nicht ein.

## Konfiguration

- Discovery nur aktivieren, wenn neue Geräte gesucht werden sollen.
- Einzelne IPv4-Adressen, Bindestrich-Bereiche oder CIDR-Bereiche von `/24` bis `/32` konfigurieren.
- Discovery ist auf 1.024 Hosts begrenzt und verwendet eine begrenzte Parallelität.
- Polling-Intervall und HTTP-Timeout passend zum Netzwerk wählen.
- Geräte können ohne Discovery manuell eingetragen werden.

## Authentifizierung

Globale Zugangsdaten können für alle Geräte aktiviert werden. Ein manuelles Gerät kann globale, eigene oder keine Zugangsdaten verwenden. Gen1 nutzt bei entsprechender Challenge Basic Auth; Gen2 und neuer verwenden Shelly-RPC-Digest-Auth. Digest unterstützt MD5 und SHA-256, `qop=auth`, Nonce Count und cnonce sowie höchstens einen authentifizierten Wiederholungsversuch pro Request.

Passwörter und Authorization-Header werden nie protokolliert. Redirects sind deaktiviert und Antwortgrößen begrenzt.

## Steuerung und Device Manager

Der HTTP-Client verwendet die aktuellen TypeScript-Device-Definitions und dasselbe Objektmodell. Beschreibbare Relay-, Switch-, Light-, RGB/RGBW- und Cover-States nutzen dadurch die vorhandenen Gen1-REST- beziehungsweise Gen2+-RPC-Abbildungen. Das ACK-Verhalten bleibt im gemeinsamen ObjectHelper-Pfad.

Der Device Manager erzeugt Bedienelemente weiterhin aus beschreibbaren States und ergänzt im HTTP-Modus Verbindungstest, Rediscovery und das Neuladen bekannter Geräte.

## Fehlerbehebung

- Erreichbarkeit der Geräte-IP von ioBroker auf TCP-Port 80 prüfen.
- Nach einer 401-Antwort Benutzername und Passwort kontrollieren.
- Scan-Bereiche klein halten; Bereiche unter `/24` werden abgelehnt.
- HTTP-Discovery-Debuglogging nur zur Diagnose aktivieren. Zugangsdaten bleiben maskiert.
- Offline-Geräte werden in späteren Polling-Zyklen erneut versucht und nach einem erfolgreichen Request wieder online gesetzt.

Beim Adapter-Shutdown werden Discovery-Worker und Polling-Timer beendet. Polling-Zyklen eines Geräts laufen sequenziell, sodass langsame Requests keine überlappenden Zyklen ansammeln.
