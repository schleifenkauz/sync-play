## Wie es funktioniert

Im lokalen WLAN wird ein Server gestartet, der die Audio-Datei hostet und synchronisierte Start/Stop-Nachrichten an die Handys schickt. 
Über zwei kleine Webseiten kann man sich im Smartphone-Browser mit dem Server verbinden.
Entweder als "Client", ausgelöst von einer Nachricht des Servers die Audio-Datei abspielt;
oder als "Admin", der die Start/Stop-Nachrichten auslöst, die dann an alle Clients geschickt werden. 
Damit das funktioniert, müssen der Computer, auf dem der Server läuft und das/die Smartphone(s) im selben WLAN sein. 

### Node.js installieren

Der Server läuft auf Node.js. Das kann man [hier](https://nodejs.org/en/download) herunterladen.

### Repository klonen

Im Terminal: 

`git clone https://github.com/schleifenkauz/sync-play` 

### Server starten

- `cd sync-play`
- `npm install`
- `node server.js`

Auf der Konsole wird die Adresse der lokalen Webseite ausgegeben. 
Die müsste ungefähr so aussehen: `http://192.168.xx.xx:8080`. 

### Clients verbinden

Im Smartphone-Browser die Adresse von der Konsole eingeben. 
Es erscheint ein blauer `Connect`-Button; diesen anklicken.

### Playback starten

An die Client-Adresse das Suffix `/admin.html` anhängen. 
Das sollte ungefähr so aussehen: `http://192.168.xx.xx:8080/admin.html`
Auf den blauen `Connect`-Button klicken; dann erscheint ein Play-Button. 
Wenn man diesen anklickt, startet genau zwei Sekunden später die Wiedergabe der Audio-Datei auf allen verbundenen Smartphones. 
