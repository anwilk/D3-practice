//Get vars for scaling
var width = document.getElementById("control_panel_and_map").offsetWidth;
var height = document.getElementById("control_panel_and_map").offsetHeight;
var aspect = width / height;
var min_val = Math.min(width, height);
var scale = min_val - 100;

console.log([width, height]);

//Create projector
const projection = d3
  .geoMercator()
  .scale(scale)
  .center([-97.35, 39.5]) //Approximate Visual Center of US
  .translate([width / 2, height / 2]); //Plot center @ center of window viewbox
const geoGenerator = d3.geoPath().projection(projection);

//Create zoom function ----------
function handleZoom(e) {
  var pt_rad = Math.min(3, 10 / (e.transform.k * e.transform.k * 0.25) + 0.25);
  console.log(pt_rad);

  d3.select(this).selectAll("g").attr("transform", e.transform);

  d3.selectAll("path")
    .attr("d", geoGenerator.pointRadius(pt_rad))
    .attr("stroke-width", function (s) {
      return pt_rad / 4;
    });

  d3.selectAll(".inst")
    .selectAll("path")
    .attr("d", geoGenerator.pointRadius(pt_rad * 1.75))
    .attr("stroke-width", function (s) {
      return pt_rad / 4;
    });
}
let zoom = d3
  .zoom()
  .scaleExtent([1, 15])
  .on("zoom", handleZoom)
  .on("end", handleZoom); //Min and Max zoom bounds

//Details on click section --------
function showDetails(event, datum) {
  //Remove existing table first
  d3.select("table").remove();

  //Get data
  var table = d3.select("#tables_and_summary_figs").append("table");
  //Create table in the detials <div>
  thead = table.append("thead").append("tr");
  tbody = table.append("tbody");

  const obj = datum.properties;
  const entries = Object.entries(obj);
  const values = Object.values(obj);

  //Create row for each "data"
  var rows = tbody
    .selectAll("tr") //select rows
    .data(entries) //Bind Data to DOM
    .enter() //Make selection of missing elements
    .append("tr"); //Append a row to the selection (so that it creates a row)

  console.log(entries);
  console.log(values);
  //Create table cells
  var td = rows
    .selectAll("tr")
    .data(function (d) {
      return d;
    })
    .enter()
    .append("td")
    .append("a")
    .attr("href", function (b) {
      if (`${b}`.startsWith("ht")) {
        return `${b}`;
      }
    }) //access text contents, add href if it starts with "http"
    .attr("title", function (B) {
      return `${B}`;
    })
    .attr("target", "_blank")
    .text(function (t) {
      return t;
    });
}

//Function to show layers on checkbox
function getToggleVisibilityHandler(d3LayerSelector) {
  return function layer_display() {
    lyr_tochange = d3.select(d3LayerSelector);

    if (this.checked === true) {
      lyr_tochange.classed("hidden", false);
    } else {
      lyr_tochange.classed("hidden", true);
    }
  };
}

//Function to filter adta on Cbox
function getFilterSamplesHandler() {
  d3.selectAll(".samples_filt_cb");
  //Check to see what checkboxes statuses are
}

// Set up DOM with JS function
function dom_setup() {
  //Create the container itself
  var contain = d3.select("#control_panel_and_map");

  var svgcontain = d3.select("#svg-map").call(zoom);

  //States Container, we make this a canvas to speed up zoom and pan
  svgcontain.append("g").attr("class", "baselyr").attr("id", "states");

  //Wshed container
  svgcontain
    .append("g")
    .attr("class", "baselyr")
    .attr("id", "wsheds")
    .classed("hidden", true);
  //Create container for streams
  svgcontain.append("g").attr("class", "baselyr").attr("id", "streams");

  //Other institutions
  svgcontain.append("g").attr("class", "geofeat").attr("id", "samples");

  //ID for institute that belongs to map class
  svgcontain.append("g").attr("class", "geofeat").attr("id", "institute");

  //ID for institute that belongs to map class
  svgcontain.append("g").attr("class", "geofeat").attr("id", "ngrrec");

  // We add a <div> container for the tooltip, which is hidden by default.
  contain.append("div").attr("id", "tooltip").attr("class", "tooltip hidden");

  //Manpulating checkboxes by ID
  //Rivers
  d3.select("#streams_cb")
    .property("checked", true)
    .on("change", getToggleVisibilityHandler("#streams"));

  //Watersheds
  d3.select("#wsheds_cb")
    .property("checked", false)
    .on("change", getToggleVisibilityHandler("#wsheds"));

  //States
  d3.select("#states_cb")
    .property("checked", true)
    .on("change", getToggleVisibilityHandler("#states"));

  //Institutions
  d3.select("#institutions_cb")
    .property("checked", true)
    .on("change", getToggleVisibilityHandler("#institute"));

  //Samples
  d3.select("#samples_cb")
    .property("checked", true)
    .on("change", getToggleVisibilityHandler("#samples"));

  //Samples Filter
  d3.selectAll(".samples_filt_cb").property("checked", true);
}

//Loading and Plotting
async function load_and_plot() {
  //Pause until we read state topojson
  var states_topo = await d3.json("./features_simplified/conus_topojs.json");
  var states = topojson.feature(states_topo, states_topo.objects.conus_topojs);

  //Pause until we get institute geojson
  const institute = await d3.json(
    "./features_simplified/institute_poi.geojson"
  );
  const samples = await d3.json("./features_simplified/mpweb_dummy.geojson");
  const ngrrec = await d3.json("./features_simplified/ngrrec.geojson");

  //Pause while we get streams
  const streams = await d3.json(
    "./features_simplified/MS_riv_simplified.geojson"
  );

  //Wait for watersheds
  var watersheds_topo = await d3.json("./features_simplified/huc2_topojs.json");
  console.log(watersheds_topo);
  var watersheds = topojson.feature(
    watersheds_topo,
    watersheds_topo.objects.huc2_simplified
  );

  // Join the FeatureCollection's features array to path elements =======
  d3.select("#states") //Identify what html element to plot into
    .selectAll("path") //select (or create) path element for svg block
    .data(states.features) //use the features of the states
    .join("path") //join states data to the path
    .attr("d", geoGenerator) //Use geo generator to assign value to "d" attribute
    .attr("fill", "none");

  //Watersheds
  d3.select("#wsheds") //Identify what html element to plot into
    .selectAll("path") //select (or create) path element for svg block
    .data(watersheds.features) //use the features of the states
    .join("path") //join states data to the path
    .attr("d", geoGenerator) //Use geo generator to assign value to "d" attribute
    .attr("fill", "none");

  //Fill streams container with data
  d3.select("#streams")
    .selectAll("path")
    .data(streams.features)
    .join("path")
    .attr("d", geoGenerator)
    .attr("fill", "none");

  //Separate element used so that mouseover interaction is only applied to institute
  d3.select("#institute")
    .attr("class", "inst")
    .selectAll("path")
    .data(institute.features)
    .join("path")
    .attr("d", geoGenerator.pointRadius(5))
    .on("mouseenter", showTooltip)
    .on("mouseout", hideTooltip)
    .on("click", showDetails);

  //Samples
  d3.select("#samples")
    .selectAll("path")
    .data(samples.features)
    .join("path")
    .attr("d", geoGenerator.pointRadius(3))
    .on("click", showDetails);

  //Duplicate section for Ngrrec
  d3.select("#ngrrec")
    .attr("class", "inst")
    .selectAll("path")
    .data(ngrrec.features)
    .join("path")
    .attr("d", geoGenerator.pointRadius(5))
    .on("mouseenter", showTooltip)
    .on("mouseout", hideTooltip)
    .on("click", showDetails);

  // Tooltip on mouseover section ==========
  //Define tooltip object and context container
  var tooltip = d3.select("#tooltip");
  var container = d3.select("#control_panel_and_map");

  //Function to hide tooltip on mouse out
  function hideTooltip() {
    tooltip.classed("hidden", true);
  }
  //Create a function to display data in tooltip
  function showTooltip(event, datum) {
    // Get the ID of the feature.
    var id = datum.properties;

    // Get location of mouse
    // Get the current mouse position (as integer)
    var mouse_pos = d3.pointer(event, container).map((d) => parseInt(d));

    // Calculate the absolute left and top offsets of the tooltip. If the
    // mouse is close to the right border of the map, show the tooltip on
    // the left.
    var left = Math.min(width + 4 * id.location.length, mouse_pos[0] + 20);
    var top = mouse_pos[1] - 30;

    // Use the ID to get the string in 'location'
    tooltip
      .classed("hidden", false)
      .attr("style", "left:" + left + "px; top:" + top + "px")
      .text(id.location)
      .attr("id", "tooltip");
  }

  //Adding samples options to the Samples Filter Header
  console.log(samples.properties);
}

//Function to pull current plastic types selection

dom_setup();
load_and_plot();
console.log("Load and Plot Executed");
console.log("checked");
console.log(d3.selectAll(".samples_filt_cb").property("checked"));
