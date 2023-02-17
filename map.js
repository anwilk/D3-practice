//Get vars for scaling
var width = window.innerWidth;
var height = window.innerHeight;
var min_val = Math.min(width, height);
var scale = min_val / 1;

//Create projector
const projection = d3
  .geoAlbers()
  .scale(scale)
  .translate([width / 3.5, height / 4.25]); //specify projection to use
const geoGenerator = d3.geoPath().projection(projection);

//Create zoom function ----------
function handleZoom(e) {
  d3.select(this).selectAll("g").attr("transform", e.transform);
  d3.select(this).selectAll("canvas").attr("transform", e.transform);
}
let zoom = d3.zoom().on("zoom", handleZoom).scaleExtent([1, 10]); //Min and Max zoom bounds

//Details on click section --------
function showDetails(event, datum) {
  //Remove existing table first
  d3.select("table").remove();

  //Get data
  var table = d3.select("#details-table").append("table");

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
    }) //access text contents, add href if it starts with "http"
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

// Set up DOM with JS function
function dom_setup() {
  //Create divider for map
  var map_space = d3
    .select("#visualization_area")
    .append("div")
    .attr("id", "map");
  //Create the container itself
  var contain = d3.select("#map");

  var svgcontain = d3
    .select("#map")
    .append("svg") //Make an svg within the HTML <div> with id:map
    .attr("id", "svg-map")
    .call(zoom);

  //Create visual bounding box for the map
  var bounds = svgcontain
    .append("rect")
    .attr("stroke", "black")
    .attr("width", "70vw")
    .attr("height", "50vh")
    .attr("fill", "none")
    .attr("stroke-width", "2px")
    .attr("stroke", "#656565");

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

  // We add a <g> container for the tooltip, which is hidden by default.
  map_space.append("div").attr("id", "tooltip").attr("class", "tooltip hidden");

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

  //Create Divider for details section to populate
  map_space.append("div").attr("id", "details-table");
}

//Loading and Plotting
async function load_and_plot() {
  //Pause until we read state json
  const states = await d3.json("./features_simplified/conus_geo.json");

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
  const watersheds = await d3.json(
    "./features_simplified/huc2_simplified.json"
  );
  // ====================================================================

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
    .selectAll("path")
    .data(institute.features)
    .join("path")
    .attr("d", geoGenerator.pointRadius(3))
    .on("mouseenter", showTooltip)
    .on("mouseout", hideTooltip)
    .on("click", showDetails);

  //Samples
  d3.select("#samples")
    .selectAll("path")
    .data(samples.features)
    .join("path")
    .attr("d", geoGenerator.pointRadius(1.5))
    .on("click", showDetails);

  //Duplicate section for Ngrrec
  d3.select("#ngrrec")
    .selectAll("path")
    .data(ngrrec.features)
    .join("path")
    .attr("d", geoGenerator.pointRadius(3.5))
    .on("mouseenter", showTooltip)
    .on("mouseout", hideTooltip)
    .on("click", showDetails);

  // Tooltip on mouseover section ==========
  //Define tooltip object and context container
  var tooltip = d3.select("#tooltip");
  var container = d3.select("#map");
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

dom_setup();
load_and_plot();
console.log("Load and PLot Executed")
