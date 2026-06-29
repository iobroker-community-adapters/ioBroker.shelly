# HTTP-Polling

Das HTTP-Polling-Protokoll ist fuer Installationen gedacht, in denen ioBroker die Shelly-Geraete per TCP/80 erreichen kann, CoAP-Pakete oder ein MQTT-Rueckkanal aber nicht sauber funktionieren. Das ist typisch, wenn ioBroker in Docker auf einem NAS laeuft.

HTTP-Polling erfordert kein aktiviertes MQTT auf den Shelly-Geraeten. Die Shelly-Cloud-Verbindung kann daher aktiv bleiben.

## Architektur

Wenn `HTTP-Polling` als Adapter-Protokoll gewaehlt ist, startet der Adapter einen HTTP-Polling-Server statt eines CoAP- oder MQTT-Listeners.

Der HTTP-Polling-Server baut seine Geraeteliste aus zwei Quellen:

- Manuell konfigurierte Geraete in `HTTP polling devices`
- Optionale HTTP-Discovery ueber konfigurierte IP-Bereiche

Fuer jedes Geraet ruft der Adapter zuerst `/shelly` auf. Die Antwort entscheidet, wie die normalen ioBroker-Objekte angelegt werden:

- Gen1-Geraete verwenden das bestehende CoAP/classic-REST-Profil und pollen klassische Endpunkte wie `/status` und `/settings`.
- Gen2 und neuer verwenden das bestehende MQTT/RPC-Profil und pollen Endpunkte unterhalb von `/rpc`, zum Beispiel `/rpc/Shelly.GetStatus`.
- Unbekannte Geraete bekommen ein generisches Fallback-Profil mit Raw-JSON-States.

Die Implementierung nutzt so weit wie moeglich die bestehenden Datenpunktdefinitionen des Adapters. Dadurch entsteht kein zweites, abweichendes State-Modell nur fuer HTTP.

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

Administrative RPC-Methoden sind gesperrt, solange `Allow administrative HTTP functions` nicht aktiviert ist.

## Grenzen

HTTP-Discovery ist ein aktiver IP-Scan. Auf grossen Netzen sollten die Bereiche eng gehalten werden.

Das Fallback-Profil ist bewusst konservativ. Unbekannte Shelly-Geraete liefern zuerst Raw-JSON; eine dedizierte Geraetedefinition in `lib/devices` ergibt weiterhin das beste Objektmodell.
