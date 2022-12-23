![Logo](../../admin/shelly.png)

# ioBroker.shelly

## Geschützter Login

Um die Shelly-Geräte vor unbefugtem Zugriff zu schützen, setze in der ioBroker Konfiguration einen beliebigen Benutzernamen und Passwort im Tab *Allgemeine Einstellungen*.

![iobroker_general_restrict_login](./img/iobroker_general_restrict_login.png)

Aktiviere danach den geschützten Zugriff auf allen Shelly-Geräten.

**Wichtig:**

- Geräte der Generation 2 bieten keine Option für einen Benutzernamen - der Benutzername kann frei gewählt werden, aber ist nur für Geräte der Generation 1 relevant
- Konfiguriere auf allen Geräten das gleiche Passwort, welches in der Shelly-Instanz festgelegt wurde
    - Generation 1: Konfiguriere Benutzername UND Passwort aus der Instanz
    - Generation 2: Konfiguriere nur das Passwort aus den Instanz-Einstellungen

### Warnungen

Ist ein Geräte-Passwort im ioBroker konfiguriert, wird der Adapter Warnungen ins Log schreiben, falls einige Shelly-Geräte ungeschützt sind!

Um keine Warnungen mehr zu erhalten, kann entweder

- das Passwort in der Konfiguration des Adapters entfernt werden (= kein Passwort nötig) oder
- auf allen Shelly-Geräten der geschützte Zugriff aktiviert werden

### Generation 2 Geräte (Plus und Pro)

1. Öffne die Shelly-Webkonfiguration in einem Browser (nicht in der Shelly App!)
2. Gehe zu ```Settings -> Authentication```
3. Aktiviere das Passwort-Feature und gib das gerade konfigurierte Passwort ein
4. Speichere die Konfiguration

![shelly gen2](./img/shelly_restrict_login-gen2.png)

Ältere Firmware-Versionen (`< 0.12`) haben eine andere Benutzeroberfläche:

1. Öffne die Shelly-Webkonfiguration in einem Browser (nicht in der Shelly App!)
2. Gehe zu ```Device -> Authentication```
3. Aktiviere das Passwort-Feature und gib das gerade konfigurierte Passwort ein
4. Speichere die Konfiguration

![shelly gen2 old](./img/shelly_restrict_login-gen2-old.png)

### Generation 1 Geräte

1. Öffne die Shelly-Webkonfiguration in einem Browser (nicht in der Shelly App!)
2. Gehe zu ```Internet & Security settings -> Restricted Login```
3. Setze den Haken für den gesicherten Zugriff und gib die gerade konfigurierten Zugangsdaten ein
4. Speichere die Konfiguration - der Shelly startet automatisch neu
5. Stelle sicher, dass auf allen Shelly-Geräten die identischen Zugangsdaten konfiguriert werden

![shelly gen1](./img/shelly_restrict_login-gen1.png)
