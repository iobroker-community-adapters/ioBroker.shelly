![Logo](../../admin/shelly.png)

# ioBroker.shelly

This is the German documentation - [🇺🇸 English version](../en/devicemanager.md)

## Device Manager

Der Adapter ist in den ioBroker Device Manager integriert (erfordert Admin >= 7.8.20) und bietet eine zentrale Benutzeroberfläche zur Verwaltung aller Shelly-Geräte direkt aus der Admin-Oberfläche.

- **Geräteübersicht** - Alle verbundenen Geräte auf einen Blick mit Status, Firmware-Version, Signalstärke (RSSI), Akkustand und Online-/Offline-Status
- **Gerätesteuerung** - Direktes Interagieren mit Geräten: Schalter/Relais umschalten, Helligkeit und Rollladenposition über Schieberegler anpassen, Farben für RGBW-Geräte auswählen
- **Sensordetails** - Echtzeit-Sensordaten (Temperatur, Luftfeuchtigkeit, Helligkeit, Bewegung, Überschwemmung usw.) in einem benutzerdefinierten Infopanel anzeigen
- **Geräteaktionen** - Geräte umbenennen, die Weboberfläche des Geräts öffnen oder Firmware-Updates auslösen
- **Gerätegruppierung** - Geräte werden automatisch nach Typ kategorisiert (Relays, Dimmers, Plugs, Lights, Meters, Sensors, Covers, Inputs, Climate, Gateways, BLE)

### Hintergrundüberwachung für neue Geräte

Der Adapter kann das Netzwerk regelmäßig mithilfe von mDNS-Discovery nach neuen Shelly-Geräten durchsuchen.

- **Konfigurierbares Scan-Intervall** - Das Scan-Intervall in Sekunden kann über die Adapterkonfiguration festgelegt werden (mindestens 60 Sekunden, 0 = deaktiviert)
- **Automatische Erkennung** - Neue Geräte werden durch den Vergleich der gefundenen IP-Adressen mit bereits konfigurierten Geräten identifiziert
- **Admin-Benachrichtigungen** - Wenn neue Geräte gefunden werden, sendet der Adapter eine Benachrichtigung über das ioBroker-Benachrichtigungssystem

### Provisionierung

Gefundene Geräte können direkt aus dem Device Manager mit einem geführten Workflow provisioniert werden.

> [!NOTE]  
> Provisionierung wird im COAP-Modus und für Gen1-Geräte nicht unterstützt.

- **Einrichtung in einem Schritt** - Gefundene Geräte auswählen, benutzerdefinierte Namen vergeben und für MQTT-Kommunikation konfigurieren
- **Gen2+-Unterstützung** - Die Provisionierung unterstützt Gen2+-Geräte (über `/settings` HTTP API) und Gen2/Gen3/Gen4-Geräte (über RPC-Endpunkte) automatisch
- **MQTT-Konfiguration** - Geräte werden mit der MQTT-Server-Adresse, den Zugangsdaten und dem Topic-Präfix des Adapters konfiguriert
- **Gerätebenennung** - Benutzerdefinierte Namen und MQTT-Topic-Präfixe können während der Provisionierung vergeben werden
- **Zeitzonen-Synchronisation** - Die Zeitzone des Geräts wird automatisch auf die Serverzeit eingestellt
- **Authentifizierung** - Unterstützt passwortgeschützte Geräte mit automatischem Fallback: zuerst ohne Authentifizierung, dann mit dem konfigurierten HTTP-Passwort, dann Abfrage eines gerätespezifischen Passworts
- **HTTP-Authentifizierung** - Für Gen2+-Geräte kann die HTTP-Authentifizierung (SHA-256 Digest) automatisch konfiguriert werden, wenn ein HTTP-Passwort in der Adapterkonfiguration festgelegt ist
