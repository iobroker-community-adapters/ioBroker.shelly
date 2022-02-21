![Logo](../../admin/shelly.png)

# ioBroker.shelly

## Kann man CoAP und MQTT gleichzeitig nutzen?

Nein, aber Du kannst eine zweite Instanz des Shelly-Adapters erstellen, welche dann für MQTT konfiguriert wird (und die andere für CoAP).

## Ich weiß nicht wie MQTT funktioniert, ist es kompliziert zu nutzen?

Nein, Du musst nur die Shelly-Geräte so konfigurieren, wie [hier](protocol-mqtt.md) erklärt. Den Rest erledigt der Shelly-Adapter intern.

## Kann ich zwischen CoAP und MQTT umschalten?

Du kannst die Konfiguration in deiner Shelly-Instanz jederzeit ändern. Alle Objekte und Zustände werden gleich bleiben. Es ändert sich nur die Kommunikation mit den Geräten.

## Ist es möglich, den Shelly-Adapter mit einem bestehenden MQTT-Broker zu verbinden?

Es ist nicht möglich, den Shelly-Adapter mit einem existierenden MQTT-Broker in deinem Netzwerk zu verbinden. Der Shelly-Adapter startet einen eigenen MQTT-Broker, welcher auf dem Port ``1882`` gestartet wird, um einen Konflikt mit anderen MQTT-Brokern auf dem gleichen System zu vermeiden.
