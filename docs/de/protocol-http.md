# HTTP-Polling

Das HTTP-Polling-Protokoll ist fuer Installationen gedacht, in denen ioBroker die Shelly-Geraete per TCP/80 erreichen kann, CoAP-Pakete oder ein MQTT-Rueckkanal aber nicht sauber funktionieren. Das ist typisch, wenn ioBroker in Docker auf einem NAS laeuft.

HTTP-Polling erfordert kein aktiviertes MQTT auf den Shelly-Geraeten. Die Shelly-Cloud-Verbindung kann daher aktiv bleiben.

## Architektur

Wenn `HTTP-Polling` als Adapter-Protokoll gewaehlt ist, startet der Adapter einen HTTP-Polling-Server statt eines CoAP- oder MQTT-Listeners.

Der HTTP-Polling-Server baut seine Geraeteliste beim Start aus drei Quellen:

- Manuell konfigurierte Geraete in `HTTP polling devices`
- Bestehende Shelly-Geraeteobjekte in der ioBroker-Registry, wenn sie einen `hostname`- oder `Network.ip`-State besitzen
- Optionale HTTP-Discovery ueber konfigurierte IP-Bereiche

`Discover devices by HTTP scan` steuert nur den aktiven Netzwerkscan. Bereits bekannte HTTP-Geraete werden dadurch nicht deaktiviert. Nachdem eine Discovery die Geraeteobjekte angelegt hat, kann der Scan ausgeschaltet werden; beim naechsten Adapterstart werden diese Geraete aus der ioBroker-Registry geladen, vollstaendig als HTTP-Polling-Clients initialisiert und ihre writable Command-States wieder registriert.

Fuer jedes Geraet ruft der Adapter zuerst `/shelly` auf. Danach liest er Status- und Konfigurationsendpunkte, um die vorhandenen Funktionen zu analysieren:

- Gen1-Geraete werden ueber klassische Endpunkte wie `/status` und `/settings` analysiert.
- Gen2, Gen3 und Gen4 werden ueber RPC-Endpunkte wie `/rpc/Shelly.GetStatus` und `/rpc/Sys.GetConfig` analysiert. Wenn `Sys.GetConfig` nicht verfuegbar ist, verwendet der Adapter `Shelly.GetConfig` als Fallback.
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

Nutze die HTTP-Authentifizierungsfelder in den HTTP-Polling-Einstellungen. Der Adapter erkennt das vom Geraet angebotene Verfahren und unterstuetzt Basic Auth und HTTP Digest Auth fuer Gen1 classic REST und Gen2+ RPC-Requests.

HTTP-spezifische Einstellungen:

- `Use global HTTP authentication`: Aktiviert globale HTTP-Zugangsdaten fuer alle HTTP-Polling-Geraete.
- `Default HTTP username` und `Default HTTP password`: Globale Zugangsdaten. Das ist die empfohlene Variante, wenn alle Shelly-Geraete dasselbe Restricted-Login-Passwort verwenden.
- `Discover devices by HTTP scan`: Sucht in konfigurierten IP-Bereichen nach Shelly-Geraeten.
- `Automatically create discovered devices`: Startet Polling-Clients fuer gefundene Geraete. Deaktivieren, wenn der Scan nur ins Log schreiben soll und Geraete manuell eingetragen werden.
- `HTTP discovery network ranges`: IP-Bereiche fuer den Scan. Unterstuetzt werden einzelne IPs, `192.168.1.10-192.168.1.30`, `192.168.1.10-30` und CIDR-Bereiche von `/24` bis `/32`.
- `HTTP timeout in ms`: Timeout fuer HTTP-Requests.
- `HTTP retries`: Anzahl der Wiederholungen nach einem fehlgeschlagenen Request.
- `Parallel discovery probes`: Maximale Anzahl paralleler Discovery-Requests.
- `Create raw JSON states`: Speichert zusaetzlich Raw-Info/Status/Config-Payloads unterhalb des Geraets.
- `Allow administrative HTTP functions`: Erlaubt potenziell invasive Aufrufe wie Firmware-Update, Reboot, Netzwerk-Konfiguration, MQTT/Cloud-Konfiguration und Script-Schreibzugriffe.

Manuelle HTTP-Geraete unterstuetzen einen Authentifizierungsmodus:

- `No auth`: Fuer dieses Geraet werden nie Zugangsdaten gesendet.
- `Use global auth`: Das Geraet verwendet die globalen Standard-Zugangsdaten.
- `Custom auth`: Das Geraet verwendet Benutzername/Passwort aus dem manuellen Geraeteeintrag.

Eigene Geraete-Zugangsdaten haben Vorrang vor globalen Zugangsdaten. Wenn weder eigene noch globale Zugangsdaten aktiv sind, werden Requests ohne Authentifizierung gesendet.

Bei der Discovery versucht der Adapter zuerst einen Request ohne Zugangsdaten. Wenn dieser Request fehlschlaegt oder `401` liefert und globale HTTP-Authentifizierung aktiv ist, wird mit den globalen Zugangsdaten erneut versucht.

Passwoerter und Authorization-Header werden nicht in Logs, Objekt-IDs, State-Namen oder Raw-JSON-States geschrieben. Raw-JSON-Payloads werden vor dem Speichern maskiert.

## Befehle

Gen1-Command-States verwenden die bestehenden classic-REST-Befehlsdefinitionen.

Gen2+-Command-States verwenden die bestehenden MQTT-Command-Funktionen weiter. Das erzeugte JSON-RPC-Payload wird in einen HTTP-RPC-Request uebersetzt, zum Beispiel wird `Switch.Set` zu `/rpc/Switch.Set?id=0&on=true`.

Generische Commands werden nur erzeugt, wenn die analysierten Statusdaten die jeweilige Komponente enthalten. Das generische Profil unterstuetzt:

- Switch/Relay an, aus und toggle
- Light an/aus und Helligkeit
- RGB/RGBW an/aus, Helligkeit, Farbe, Weisskanal, Gain, Effekt und Transition
- Cover open, close, stop und Position

Administrative RPC-Methoden sind gesperrt, solange `Allow administrative HTTP functions` nicht aktiviert ist. Fuer bekannte Adapterprofile setzt die HTTP-Schicht Konfigurations- und Maintenance-Command-States standardmaessig zusaetzlich auf nicht schreibbar. Factory-Reset-, WLAN-Reset- oder Firmware-Update-Commands werden vom generischen Profil nicht automatisch angeboten.

## Device Manager

HTTP-Polling-Geraete werden im ioBroker Device Manager zusammen mit CoAP-, MQTT- und BLE-Geraeten angezeigt. Die Karten verwenden die vorhandenen ioBroker-States und koennen Online/Offline, aktuellen Schaltzustand, Leistung, Energie, Temperatur, RSSI, IP/Hostname, Modell, Firmware und den zuletzt beobachteten Poll-Zeitpunkt anzeigen, sofern diese States vorhanden sind.

Direkte Bedienelemente werden nur angezeigt, wenn die erkannte Capability vorhanden ist:

- Switch/Relay und Plug: an, aus und toggle
- Light/Dimmer: an/aus und Helligkeit
- RGB/RGBW: an/aus, Helligkeit/Gain, Farbe, Weisskanal, Effekt und Transition, sofern unterstuetzt
- Cover/Rollladen: open, close, stop und Position
- Sensoren: nur Werte, keine Schaltflaechen

Device-Manager-Befehle schreiben auf dieselben writable ioBroker-States, die auch ausserhalb des Device Managers verwendet werden. Die HTTP-Schicht fuehrt danach das bestehende Gen1-REST- oder Gen2+-RPC-Command-Mapping aus und loest Zugangsdaten mit derselben Custom/Global/No-Auth-Logik auf wie beim Polling.

Ein Device-Manager-Befehl wird erst als erfolgreich gemeldet, wenn der Ziel-State mit `ack=true` bestaetigt wurde. Wenn kein Command-Handler registriert ist oder der HTTP/RPC-Befehl nicht abgeschlossen wird, zeigt der Ergebnisdialog einen Fehler statt eines erfolgreichen State-Writes.

Das Geraetemenue enthaelt HTTP-spezifische Diagnoseaktionen:

- HTTP-Verbindung testen: prueft Erreichbarkeit, Authentifizierung, erkannte Generation, Status-Endpunkt, Config-Endpunkt, Antwortzeit und eine maskierte Fehlermeldung.
- Geraet neu erkennen: startet den HTTP-Polling-Client fuer dieses Geraet neu und fuehrt die Capability-Erkennung erneut aus.
- Konfiguration neu laden: aktualisiert Status-/Config-Daten ohne kompletten Adapter-Neustart.
- States neu erzeugen: fuehrt die Objektanlage fuer das aktuelle HTTP-Geraet erneut aus.

Der Detaildialog zeigt Device Info, erkannte Capabilities, aktuelle Werte, aus State-Zeitstempeln abgeleiteten Polling-Status und maskierte letzte Fehler, sofern vorhanden. Raw-Info/Status/Config-JSON wird nur angezeigt, wenn `Create raw JSON states` aktiviert ist.

## Polling und Offline-Erkennung

Polling verwendet das konfigurierte Adapter-Pollintervall. HTTP-Timeout, Retry-Anzahl und Discovery-Parallelitaet sind konfigurierbar. State-Werte werden gecacht und nur erneut geschrieben, wenn sie sich geaendert haben, ausser `Update objects even if there is no value change` ist aktiv.

Ein fehlgeschlagener Request betrifft nur das jeweilige Geraet. Nach wiederholten Fehlern wird dieses Geraet offline gesetzt. Ein spaeter erfolgreicher Request setzt es wieder online. Alle Polling-Timer werden beim Stoppen der Adapterinstanz beendet.

## Grenzen

HTTP-Discovery ist ein aktiver IP-Scan. Auf grossen Netzen sollten die Bereiche eng gehalten werden.

Das Fallback-Profil ist bewusst konservativ. Eine dedizierte Geraetedefinition in `lib/devices` ergibt weiterhin das vollstaendigste Objektmodell fuer ein Geraet.
