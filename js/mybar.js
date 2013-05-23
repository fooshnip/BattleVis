var xScale = d3.scale.ordinal()
                .domain(d3.range(dataset.length))
                .rangeRoundBands([0, w], 0.05);



//Create SVG element
var svg = d3.select("#mybar")
            .append("svg")
            .attr("width", w + xpad)
            .attr("height", h)
            .style("pointer-events", "all")
            .on("mousemove", particle);;

svg.selectAll("rect")
   .data(dataset)
   .enter()
   .append("rect")
   .attr("x", function(d, i) {
    return xScale(i);
})
   .attr("y", function(d) {
    return h - d * 7;  //Height minus data value
})
   .attr("width", xScale.rangeBand())
   .attr("height", function(d) {
    return d * 7;  //Just the data value
})
   .attr("fill", function(d) {
    return "rgb(" + (d * 2) + ", " + (d * 13) + ", " + (d * 2) + ")";
})
   .on("mouseover", function() {
        d3.select(this)
                .attr("fill", "orange");
})
   .on("mouseout", function(d) {
        d3.select(this)
          .transition()
          .duration(500)
          .attr("fill", "rgb(" + (d * 2) + ", " + (d * 13) + ", " + (d * 2) + ")");
});

svg.selectAll("text")
   .data(dataset)
   .enter()
   .append("text")
   .text(function(d) {
        return d;
   })
   .attr("x", function(d, i) {
        return xScale(i)+ 16;
    })
   .attr("y", function(d) {
        return h - (d * 7) + 16;             
   })
   .attr("font-family", "sans-serif")
   .attr("font-size", "11px")
   .attr("fill", "#FFFFFF")
   .attr("text-anchor", "middle");

d3.select("circle")
  .on("click", function(){
    sortBars();
  });

//On click, update with new data
d3.select("p")
    .on("click", function() {

        var numValues = dataset.length;                     //Count original length of dataset
        dataset = [];                                       //Initialize empty array
        for (var i = 0; i < numValues; i++) {               //Loop numValues times
            var newNumber = Math.round(Math.random() * 35); //New random integer (0-35)
            dataset.push(newNumber);                        //Add new number to array
        }

        //Update all rects
        svg.selectAll("rect")
           .data(dataset)
           .transition()    // <-- This is new! Everything else here is unchanged.
           .duration(1000)
           .ease("elastic")
           .attr("y", function(d) {
                return h - d * 7;
           })
           .attr("height", function(d) {
                return d * 7;
           })
           .attr("fill", function(d) {
                return "rgb(" + (d * 2) + ", " + (d * 13) + ", " + (d * 2) + ")";
           });

        svg.selectAll("text")
           .data(dataset)
           .transition()    // <-- This is new! Everything else here is unchanged.
           .duration(1000)
           .ease("elastic")
           .text(function(d) {
                return d;
           })
           .attr("x", function(d, i) {
                return xScale(i) + xScale.rangeBand() / 2;
           })
           .attr("y", function(d) {
                return h - (d * 7) + 16;
           });   

    });

var sortBars = function() {

        svg.selectAll("rect")
           .sort(function(a, b) {
                   return d3.descending(a, b);
                })
           .transition()
           .duration(1000)
           .attr("x", function(d, i) {
                        return xScale(i);
           });

         svg.selectAll("text")
           .sort(function(a, b) {
                   return d3.descending(a, b);
                })
           .transition()
           .duration(1000)
           .attr("x", function(d, i) {
                        return xScale(i) + xScale.rangeBand() / 2;
           });  

};