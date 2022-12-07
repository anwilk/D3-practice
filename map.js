//Create an asynchronous function which allows us to use keword 'await'
async function load_and_plot() {
  
  //Pause until we read state json
  const states = await d3.json("./features_simplified/states_reduced.json"); 
  
  //Pause until we get institute geojson
  const points = await d3.json("./features_simplified/institute_poi.geojson");

  //Combine projection with our builder function
  const projection = d3.geoAlbers(); //specify projection to use
  const geoGenerator = d3.geoPath(projection);

  //Variables for svg container
  var width = 900,
    height = 600;
  
  //Create the container itself
  var container = d3.select('#content')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  
  //
  
  //id for basemap that belongs to map class
  var basemap = container
    .append('g')
    .attr('class', 'map')
    .attr("id", "base")
  
  //ID for points that belongs to map class
  var point_overlay = container
    .append('g')
    .attr('id', 'points')
    .attr('class', 'point_data')
  
  // Join the FeatureCollection's features array to path elements
  d3.select("#base") //Identify what html element to plot into
    .selectAll("path") //select (or create) path element for svg block
    .data(states.features) //use the features of the states
    .join("path") //join states data to the path
    .attr("d", geoGenerator) //Use geo generator to assign value to "d" attribute 
    .attr("fill", "none")
    
  //Separate element used so that mouseover interaction is only applied to points
  d3.select("#points")
    .selectAll("path")
    .data(points.features)
    .join("path")
    .attr("d", geoGenerator)
    .attr("name", "test")
    .attr("fill", "darkgrey")
    .attr("stroke", "black")
    .on('mouseenter', showTooltip)
    .on('mouseout', hideTooltip)
  .on('click', showDetails)
  
// Tooltip on mouseover section ----------
// We add a <div> container for the tooltip, which is hidden by default.
var tooltip = d3.select("#content")
  .append("div")
  .attr("class", "tooltip hidden");

//Function to hide tooltip on mouse out
function hideTooltip() {
  tooltip.classed('hidden', true);
}
  
  //Create a function to display data in tooltip
function showTooltip(event, datum) {
  // Get the ID of the feature.
  var id = datum.properties;
  
  // Get location of mouse
   // Get the current mouse position (as integer)
  var mouse_pos = d3.pointer(event, this).map(d => parseInt(d))
  
  // Calculate the absolute left and top offsets of the tooltip. If the
  // mouse is close to the right border of the map, show the tooltip on
  // the left.
  var left = Math.min(width - 4 * id.location.length, mouse_pos[0] + 30);
  var top = mouse_pos[1] + 30;

  // Use the ID to get the string in 'location'
  tooltip.classed('hidden', false)
    .attr("style", "left:" + left + "px; top:" + top + "px")
    .html(id.location);
  
  console.log(id.location)
  console.log(id.location.length)
  console.log(mouse_pos)
}

//Details on click section --------
  function showDetails(event, datum) {
    //Get data
    id = datum.properties
    
    d3.select("#locPopup")
    d3.select("#locPopup")
  }
  //handle click by updating state
  function institute_mouse(event, datum) {
    
    console.log(event)
    console.log(datum.properties.location)
    
    
    //var dat = data(points.features)(e.path)

  }
  
  
//   //Tooltip creator
//   function showTooltip(f) {
//   // Calculate the absolute left and top offsets of the tooltip. If the
//   // mouse is close to the right border of the map, show the tooltip on
//   // the left.
//   var left = Math.min(width - 4 * d.name.length, mouse[0] + 5);
//   var top = mouse[1] + 25;

//   // Show the tooltip (unhide it) and set the name of the data entry.
//   // Set the position as calculated before.
//   tooltip.classed('hidden', false)
//     .attr("style", "left:" + left + "px; top:" + top + "px")
//     .html(d);
// }
  
  
//     // Define the zoom and attach it to the map
//   var zoom = d3.behavior.zoom()
//     .scaleExtent([1, 10])
//     .on('zoom', doZoom);
//     svg.call(zoom);
  
//   function doZoom() {
//   mapFeatures.attr("transform",
//     "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
//   } 

//   // Functions to deal with later ---------
//   //Clicker state object with location attribute
//   let state = {
// 	mouseLocation: null
//   }

  

    
}

load_and_plot();