![Logo](../../admin/shelly.png)

# ioBroker.shelly

This is the German documentation - [🇺🇸 English version](../en/faq.md)

## Kann die Konfiguration auch per Shelly App durchgeführt werden?

Die gesamte Dokumentation basiert auf die Einstellungen der Weboberfläche der Geräte. Manche Optionen fehlen eventuell in der App. Daher ist der Weg nicht empfohlen!

## Kann man CoAP (CoIoT) und MQTT gleichzeitig nutzen?

Nein, es kann jedoch eine zweite Instanz des Shelly-Adapters erstellt werden, welche dann für MQTT konfiguriert wird (und die andere für CoAP/CoIoT).

## Ich weiß nicht wie MQTT funktioniert, ist es kompliziert zu nutzen?

Nein, die Shelly-Geräte müssen nur so konfiguriert werden, wie [hier](protocol-mqtt.md) erklärt. Den Rest erledigt der Shelly-Adapter intern.

## Kann ich zwischen CoAP (CoIoT) und MQTT umschalten?

Die Konfiguration der Shelly-Instanz kann jederzeit geändert werden. Alle Objekte und Zustände bleiben erhalten. Es ändert sich nur die Kommunikation mit den Geräten.

## Ich habe CoAP (CoIoT) konfiguriert, aber der Shelly taucht nicht auf

Höchstwahrscheinlich ist multicast `mcast` konfiguriert. Das funktioniert nicht zuverlässig - daher sollte *unicast* konfiguriert werden. Wie das geht, ist [hier](protocol-coap.md) erklärt.

*CoAP/CoIoT wird nur von Generation 1 (Gen1) Geräten unterstützt!*

## Mein Gerät wird vom Shelly-Adapter nicht erkannt

Entweder ist das Gerät noch nicht in der Liste der unterstützen Geräte des Adapters zu finden, oder die Client-ID wurde in den MQTT-Einstellungen auf dem Shelly geändert. Laut [Dokumentation](protocol-mqtt.md) darf diese nicht verändert werden, da mit dieser ID der Gerätetyp festgestellt wird!

## Ist es möglich, den Shelly-Adapter mit einem bestehenden MQTT-Broker zu verbinden?

Es ist nicht möglich, den Shelly-Adapter mit einem existierenden MQTT-Broker im Netzwerk zu verbinden. Der Shelly-Adapter startet einen eigenen MQTT-Broker intern, welcher auf dem Port ``1882`` gestartet wird, um einen Konflikt mit anderen MQTT-Brokern auf dem gleichen System zu vermeiden.

## Kann die Cloud-Verbindung weiterhin genutzt werden, wenn der Shelly-Adapter verwendet wird?

Bei Geräten der **Generation 1 (Gen1)** ist es nicht möglich, MQTT und die Shelly-Cloud gleichzeitig zu verwenden. In diesem Fall muss CoAP/CoIoT für die ioBroker-Integration genutzt werden, falls die Cloud-Verbindung gleichzeitig bestehen soll.

Geräte der **Generation 2+ (Gen2+)** können per MQTT verbunden werden und gleichzeitig die Cloud-Verbindung aufrecht erhalten.

## Welche Shelly-Geräte können negative Leistung / zurückgespeiste Energie messen ?

Siehe Auflistung im Shelly Forum:  
https://support.shelly.cloud/de/support/solutions/articles/103000316350-welche-shelly-ger%C3%A4te-k%C3%B6nnen-negative-leistung-f%C3%BCr-zur%C3%BCckgespeiste-energie-messen
