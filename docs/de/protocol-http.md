# HTTP-Polling

Das HTTP-Polling-Protokoll ist fuer Installationen gedacht, in denen ioBroker die Shelly-Geraete per TCP/80 erreichen kann, CoAP-Pakete oder ein MQTT-Rueckkanal aber nicht sauber funktionieren. Das ist typisch, wenn ioBroker in Docker auf einem NAS laeuft.

HTTP-Polling erfordert kein aktiviertes MQTT auf den Shelly-Geraeten. Die Shelly-Cloud-Verbindung kann daher aktiv bleiben.

## Architektur

Wenn `HTTP-Polling` als Adapter-Protokoll gewaehlt ist, startet der Adapter einen HTTP-Polling-Server statt eines CoAP- oder MQTT-Listeners.

Der HTTP-Polling-Server baut seine Geraeteliste aus zwei Quellen:

- Manuell konfigurierte Geraete in `HTTP polling devices`
- Optionale HTTP-Discovery ueber konfigurierte IP-Bereiche

Fuer jedes Geraet ruft der Adapter zuerst `/shelly` auf. Danach liest er Status- und Konfigurationsendpunkte, um die vorhandenen Funktionen zu analysieren:

- Gen1-Geraete werden ueber klassische Endpunkte wie `/status` und `/settings` analysiert.
- Gen2, Gen3 und Gen4 werden ueber RPC-Endpunkte wie `/rpc/Shelly.GetStatus` und `/rpc/Sys.GetConfig` analysiert.
- Bekannte Geraete verwenden weiterhin die bestehenden Adapterprofile, damit Objektnamen konsistent zu MQTT/CoAP bleiben.
- Unbekannte Geraete bekommen ein generisches HTTP-Capability-Profil.

Die Implementierung nutzt so weit wie moeglich die bestehenden Datenpunktdefinitionen des Adapters. Dadurch entsteht kein zweites, abweichendes State-Modell nur fuer HTTP.

## Capability-Erkennung

Das generische HTTP-Profil kann States erzeugen fuer:

- Schalter und Relais
- Eingaenge
- Licht
- RGB/RGBW-Licht
- Cover/Rollladen
- Leistung, Spannung, Strom und Energie
- Temperatur und Luftfeuchtigkeit
- Netzwerkstatus
- Systemstatus
- Basis-Konfiguration und Diagnose

Raw-JSON-States werden nur angelegt, wenn `Create raw JSON states` aktiviert ist. Unbekannte Geraete bekommen auch bei deaktiviertem Raw-JSON generische Capability-States.

## Konfiguration

Nutze die normalen HTTP-Credentials in den allgemeinen Adapter-Einstellungen. Der Adapter verwendet das konfigurierte Passwort fuer Gen2+ Digest-Auth und Benutzername/Passwort fuer Gen1 Basic-Auth.

HTTP-spezifische Einstellungen:

- `Discover devices by HTTP scan`: Sucht in konfigurierten IP-Bereichen nach Shelly-Geraeten.
- `Automatically create discovered devices`: Startet Polling-Clients fuer gefundene Geraete. Deaktivieren, wenn der Scan nur ins Log schreiben soll und Geraete manuell eingetragen werden.
- `HTTP discovery network ranges`: IP-Bereiche fuer den Scan. Unterstuetzt werden einzelne IPs, `192.168.1.10-192.168.1.30`, `192.168.1.10-30` und CIDR-Bereiche von `/24` bis `/32`.
- `HTTP timeout in ms`: Timeout fuer HTTP-Requests.
- `HTTP retries`: Anzahl der Wiederholungen nach einem fehlgeschlagenen Request.
- `Parallel discovery probes`: Maximale Anzahl paralleler Discovery-Requests.
- `Create raw JSON states`: Speichert zusaetzlich Raw-Info/Status/Config-Payloads unterhalb des Geraets.
- `Allow administrative HTTP functions`: Erlaubt potenziell invasive Aufrufe wie Firmware-Update, Reboot, Netzwerk-Konfiguration, MQTT/Cloud-Konfiguration und Script-Schreibzugriffe.

## Befehle

Gen1-Command-States verwenden die bestehenden classic-REST-Befehlsdefinitionen.

Gen2+-Command-States verwenden die bestehenden MQTT-Command-Funktionen weiter. Das erzeugte JSON-RPC-Payload wird in einen HTTP-RPC-Request uebersetzt, zum Beispiel wird `Switch.Set` zu `/rpc/Switch.Set?id=0&on=true`.

Generische Commands werden nur erzeugt, wenn die analysierten Statusdaten die jeweilige Komponente enthalten. Das generische Profil unterstuetzt:

- Switch/Relay an, aus und toggle
- Light an/aus und Helligkeit
- RGB/RGBW an/aus, Helligkeit, Farbe, Weisskanal, Gain, Effekt und Transition
- Cover open, close, stop und Position

Administrative RPC-Methoden sind gesperrt, solange `Allow administrative HTTP functions` nicht aktiviert ist. Fuer bekannte Adapterprofile setzt die HTTP-Schicht Konfigurations- und Maintenance-Command-States standardmaessig zusaetzlich auf nicht schreibbar. Factory-Reset-, WLAN-Reset- oder Firmware-Update-Commands werden vom generischen Profil nicht automatisch angeboten.

## Polling und Offline-Erkennung

Polling verwendet das konfigurierte Adapter-Pollintervall. HTTP-Timeout, Retry-Anzahl und Discovery-Parallelitaet sind konfigurierbar. State-Werte werden gecacht und nur erneut geschrieben, wenn sie sich geaendert haben, ausser `Update objects even if there is no value change` ist aktiv.

Ein fehlgeschlagener Request betrifft nur das jeweilige Geraet. Nach wiederholten Fehlern wird dieses Geraet offline gesetzt. Ein spaeter erfolgreicher Request setzt es wieder online. Alle Polling-Timer werden beim Stoppen der Adapterinstanz beendet.

## Grenzen

HTTP-Discovery ist ein aktiver IP-Scan. Auf grossen Netzen sollten die Bereiche eng gehalten werden.

Das Fallback-Profil ist bewusst konservativ. Eine dedizierte Geraetedefinition in `lib/devices` ergibt weiterhin das vollstaendigste Objektmodell fuer ein Geraet.
