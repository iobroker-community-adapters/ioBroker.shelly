![Logo](../../admin/shelly.png)

# ioBroker.shelly

## Geschützter Login

Um die Shelly-Geräte vor unbefugtem Zugriff zu schützen, setze in der ioBroker Konfiguration einen beliebigen Benutzernamen und Passwort im Tab *Allgemeine Einstellungen*.

![iobroker_general_restrict_login](./img/iobroker_general_restrict_login.png)

Aktiviere den geschützten Zugriff auf allen Shelly-Gerätem:

1. Öffne die Shelly-Webkonfiguration in einem Browser (nicht in der Shelly App!)
2. Gehe zu ```Internet & Security settings -> Restricted Login```
3. Setze den Haken für den gesicherten Zugriff und gib die gerade konfigurierten Zugangsdaten ein
4. Speichere die Konfiguration - der Shelly startet automatisch neu
5. Stelle sicher, dass auf allen Shelly-Geräten die identischen Zugangsdaten konfiguriert werden

![shelly gen 1](../shelly_restrict_login-gen1.png)

![shelly gen 2](../shelly_restrict_login-gen2.png)