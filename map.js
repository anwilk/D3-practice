//Create an asynchronous function which allows us to use keword 'await'
async function load_and_plot() {
  //Pause until we read state json
  const states = await d3.json("./features_simplified/states_reduced.json");

  //Pause until we get institute geojson
  const points = await d3.json("./features_simplified/institute_poi.geojson");

  //Pause while we get streams
  const streams = await d3.json(
    "./features_simplified/MS_riv_simplified.geojson"
  );

  const ngrrec = await d3.json("./features_simplified/ngrrec.geojson");

  //Get vars for scaling
  var width = window.innerWidth;
  var height = window.innerHeight;

  var min_val = Math.min(width, height);
  var scale = min_val / 1.375;

  //Create projector
  const projection = d3
    .geoAlbers()
    .scale(scale)
    .translate([width / 3.5, height / 4.25]); //specify projection to use
  const geoGenerator = d3.geoPath(projection).pointRadius(3);

  //Create zoom function
  function handleZoom(e) {
    d3.select(this).selectAll("g").attr("transform", e.transform);
  }
  let zoom = d3.zoom().on("zoom", handleZoom);

  //Create divider for map
  var details = d3.select("body").append("div").attr("id", "map");

  //Create the container itself
  var container = d3
    .select("#map")
    .append("svg") //Make an svg within the HTML <div> with id:map
    .attr("id", "svg-map")
    .call(zoom); //Allow us to zoom in on the container

  //Create visual bounding box for the map
  var bounds = container
    .append("rect")
    .attr("stroke", "black")
    .attr("width", "70vw")
    .attr("height", "50vh")
    .attr("fill", "none")
    .attr("stroke-width", "2px")
    .attr("stroke", "#656565");

  //Add containers for the various layers, order matters here =======
  //id for basemap that belongs to map class
  var states_contain = container
    .append("g")
    .attr("class", "geo-feat")
    .attr("id", "states");

  //Create container for streams
  var streams_contain = container
    .append("g")
    .attr("class", "geo-feat")
    .attr("id", "streams");

  //ID for points that belongs to map class
  var points_contain = container
    .append("g")
    .attr("class", "geo-feat")
    .attr("id", "points");

  //ID for points that belongs to map class
  var ngrrec_contain = container
    .append("g")
    .attr("class", "geo-feat")
    .attr("id", "ngrrec");

  // We add a <g> container for the tooltip, which is hidden by default.
  var tooltip = d3
    .select("#map")
    .append("div") //Append a div within <div> id:map, same level as "container"
    .attr("class", "tooltip hidden");

  //Create details section
  var details = d3.select("#map").append("div").attr("id", "details");

  // ====================================================================

  // Join the FeatureCollection's features array to path elements =======
  states_contain //Identify what html element to plot into
    .selectAll("path") //select (or create) path element for svg block
    .data(states.features) //use the features of the states
    .join("path") //join states data to the path
    .attr("d", geoGenerator) //Use geo generator to assign value to "d" attribute
    .attr("fill", "none");

  //Fill streams container with data
  streams_contain
    .selectAll("path")
    .data(streams.features)
    .join("path")
    .attr("d", geoGenerator)
    .attr("fill", "none");

  //Separate element used so that mouseover interaction is only applied to points
  points_contain
    .selectAll("path")
    .data(points.features)
    .join("path")
    .attr("d", geoGenerator)
    .on("mouseenter", showTooltip)
    .on("mouseout", hideTooltip)
    .on("click", showDetails);

  //Duplicate section for Ngrrec
  ngrrec_contain
    .selectAll("path")
    .data(ngrrec.features)
    .join("path")
    .attr("d", geoGenerator.pointRadius(3.5))
    .attr("fill", "#D4AF37")
    .attr("stroke", "#000000")
    .on("mouseenter", showTooltip)
    .on("mouseout", hideTooltip)
    .on("click", showDetails);

  //========================================

  // Tooltip on mouseover section ==========

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

  //Details on click section --------
  async function showDetails(event, datum) {
    //Remove existing table first
    d3.select("table").remove();

    //Get data
    var table = d3.select("#details").append("table");

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

    console.log("Values:");
    console.log(Object.values(obj));
    console.log("Entries:");
    console.log(entries);
  }
}

load_and_plot();
