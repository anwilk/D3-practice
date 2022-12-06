//Create an asynchronous function which allows us to use keword 'await'
async function load_and_plot() {
  
  //Pause until we read state json
  const states = await d3.json("./features_simplified/states_reduced.json"); 
  
  //Pause until we get institute geojson
  const points = await d3.json("./features_simplified/institute_poi.geojson");

  const projection = d3.geoAlbers(); //specify projection to use

  //Combine projection with our builder function
  const geoGenerator = d3.geoPath(projection);

  //Clicker state object with location attribute
  let state = {
	mouseLocation: null
  }

  //handle click by updating state
  function institute_mouse(e) {
	  let pos = d3.pointer(e, this)
	  state.mouseLocation = projection.invert(pos)
    console.log("mouseover")
    console.log(JSON.stringify(state.mouseLocation))
  }

  // Join the FeatureCollection's features array to path elements
  d3.select("#content g.map") //Identify what html element to plot into
    .selectAll("path") //select (or create) path element for svg block
    .data(states.features) //use the features of the states
    .join("path")
    .attr("d", geoGenerator) //Use geo generator to assign value to "d" attribute 
    .attr("fill", "none")
    .attr("stroke", "black");

  //Separate element used so that mouseover interaction is only applied to points
  d3.select("#content #points")
    .selectAll("path")
    .data(points.features)
    .join("path")
    .attr("d", geoGenerator)
    .attr("fill", "black")
  .on("mouseover", institute_mouse)
    
}

load_and_plot();