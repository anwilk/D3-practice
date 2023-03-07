//Create Leaflet Basemap
//References div id map
var basemap = L.map("map").setView([38.805, -90], 4);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(basemap);

//
