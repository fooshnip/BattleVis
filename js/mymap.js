// Ratio of Obese (BMI >= 30) in U.S. Adults, CDC 2008
var valueById = [
   NaN, .187, .198,  NaN, .133, .175, .151,  NaN, .100, .125,
  .171,  NaN, .172, .133,  NaN, .108, .142, .167, .201, .175,
  .159, .169, .177, .11, .163, .117, .182, .153, .195, .189,
  .134, .163, .133, .151, .145, .130, .139, .169, .164, .175,
  .135, .152, .169,  NaN, .132, .167, .139, .184, .159, .140,
  .146, .157,  NaN, .139, .183, .160, .143
];

var active, inactive;

var color = d3.scale.linear()
              .domain([0, 10])
              .range(["blue", "purple"]);

var margin = {top: -20, right: 20, bottom: 20, left: 20},
    padding = {top: 60, right: 60, bottom: 60, left: 60},
    outerWidth = 350,
    outerHeight = 300,
    innerWidth = outerWidth - margin.left - margin.right,
    innerHeight = outerHeight - margin.top - margin.bottom,
    width = innerWidth - padding.left - padding.right,
    height = innerHeight - padding.top - padding.bottom;

var projection1 = d3.geo.albersUsa()
    .scale(475)
    .translate([width / 1.1, height / 1]);

var path = d3.geo.path()
    .projection(projection1);    

var svg = d3.select("#mymap").append("svg")
    .attr("width", outerWidth)
    .attr("height", outerHeight)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

queue()
    .defer(d3.json, "data/us.json")
    .defer(d3.csv, "data/fakedata.csv")
    .defer(d3.json, "data/us-state-centroids1.json")
    .await(ready);

function ready(error, us, data, states) {

  var nodes2 = states.features
      .map(function(d) {
        var id = d.id,
            point = projection1(d.geometry.coordinates),
            namestate = d.properties.name,
            ATT = d.properties.ATT;
        if (isNaN(ATT)) fail();
        return {
          id: id,
          name: namestate,
          att: ATT
        };
      });

  var g = svg.selectAll(".minimap")
            .data(us.features)
            .enter()
            .append("g");

      g.selectAll("path")
          .data(us.features)
        .enter().append("path")
          .attr("d", path)
          .attr("class", "feature")
          .style("stroke", "white");

      g.selectAll("path")
          .data(nodes2)
          .style("fill", function(d) { return color(d.att); });
    }

function minimouse(d) {
  d3.select(this)
    .style("stroke","black")
    .style("stroke-width", .2)
    .classed("tooltip", true);

  d3.selectAll(".tooltip")
    .transition()        
    .duration()
    .text(function(d){return d;})      
    .style("opacity", .9)
    .attr("dx",0)
    .attr("dy",0); 
}
function minimouseout(d) {
  d3.select(this)
    .style("stroke","white")
    .style("stroke-width",1)
    .transition()        
    .duration(200)      
    .style("opacity", 0)
    .classed("tooltip", false);
}


function click(d) {
  if (active === d) return reset();
  g.selectAll(".active")
    .classed("active", false);
  g.selectAll(".feature")
    .classed("inactive", true);
  d3.select(this).classed("active", active = d);
  

  var b = path.bounds(d);
  g.transition().duration(750).attr("transform",
      "translate(" + projection.translate() + ")"
      + "scale(" + .85 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height) + ")"
      + "translate(" + -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1]) / 2 + ")");
}

function reset() {
  
  g.transition().duration(750).attr("transform", "");
  g.selectAll(".feature.inactive")
    .classed("inactive", inactive = false);
  g.selectAll(".active")
    .classed("active", active = false);

}