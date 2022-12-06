async function load_and_plot() {
  const Response = await fetch("./features_simplified/states_reduced.json");
  const geojson = await Response.json();

  const points = await d3.json("./features_simplified/institute_poi.geojson");

  let projection = d3.geoAlbers();

  let geoGenerator = d3.geoPath().projection(projection);

  // Join the FeatureCollection's features array to path elements
  d3.select("#content g.map")
    .selectAll("path")
    .data(geojson.features)
    .join("path")
    .attr("d", geoGenerator)
    .attr("fill", "none")
    .attr("stroke", "black");

  d3.select("#content #points")
    .selectAll("path")
    .data(points.features)
    .join("path")
    .attr("d", geoGenerator)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text(function (d) {
      return d.properties.location;
    });
}

load_and_plot();
