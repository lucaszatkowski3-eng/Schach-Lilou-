# Lilous Schachwelt

Eine kinderfreundliche Schach-Lernwebsite mit Spiel gegen einen einfachen Computergegner, kleinen Lektionen und einem Sterneladen für den Pixel-Charakter.

## Starten
- Repository mit GitHub Pages veröffentlichen (Settings → Pages → Deploy from a branch → main → /root).
- Die Website läuft im Browser. Für die Schachregeln wird chess.js als ES-Modul von esm.sh geladen; beim ersten Laden ist daher eine Internetverbindung nötig.
- Fortschritt, Sterne und gekaufte Sachen werden lokal im Browser gespeichert.

## Funktionen
- Schachbrett mit legalen Zügen, Schach, Schachmatt und Remis-Erkennung.
- Computergegner mit legalen Zügen und einfacher taktischer Auswahl.
- Rückgängig-Funktion und neue Partie.
- Sieben kurze Einsteiger-Lektionen.
- Sternesystem und Charakter-Shop.
- Installierbare PWA-Grundlage mit Manifest und Service Worker.

## Später: Android-APK
Die Website ist bereits als PWA vorbereitet. Für eine echte APK kann sie später beispielsweise mit Capacitor in ein Android-Projekt verpackt werden. Vorher sollten Offline-Schachregeln, Touch-Bedienung und Geräte-Tests geprüft werden.

## Hinweise
Das Spiel ist für ein Kind gedacht: Die Oberfläche verwendet kurze Sätze und große Bedienelemente. Der Computergegner ist absichtlich einfach und noch keine starke Schach-KI.