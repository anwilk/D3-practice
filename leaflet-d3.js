//Create Leaflet Basemap
//References div id map
var basemap = L.map("map").setView([38.805, -90], 4);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(basemap);

function projectPoint(x, y) {
  var point = basemap.L(new L.LatLng(y, x));
  this.stream.point(point.x, point.y);
}

// Add SVG to leaflet overlay pane

var svg = d3
  .select(basemap.getPanes().overlayPane)
  .append("svg")
  .attr("id", "vector_map");
var g = d3.select("#vector_map").append("g").attr("class", "leaflet-zoom-hide");

console.log(svg);

//States Data
async function load_vectors() {
  var states_topo = await d3.json("./features_simplified/conus_topojs.json");
  var states = topojson.feature(states_topo, states_topo.objects.conus_topojs);
  g.selectAll("path")
    .data(states.features)
    .join("path")
    .attr("d", geoGenerator);

  console.log(states);
}

load_vectors();
