var color = d3.scale.linear()
              .domain([0, 10])
              .range(["blue", "purple"]);

var trans=[75,120],
    scale=1;

var margin = {top: -20, right: 20, bottom: 20, left: 20},
    padding = {top: 60, right: 60, bottom: 60, left: 60},
    outerWidth = 450,
    outerHeight = 300,
    innerWidth = outerWidth - margin.left - margin.right,
    innerHeight = outerHeight - margin.top - margin.bottom,
    width = innerWidth - padding.left - padding.right,
    height = innerHeight - padding.top - padding.bottom; /////MINIMAP

var projection1 = d3.geo.albersUsa()
    .scale(475)
    .translate([width / 1.1, height / 1]);///MINIMAP

var projection  = d3.geo.albersUsa();////MAINMAP

var margin1 = {top: -50, right: 0, bottom: 0, left: 0},
    width1 = 900 - margin1.left - margin1.right,
    height1 = 500 - margin1.top - margin1.bottom,
    padding = 3;////MAINMAP

var path = d3.geo.path()
    .projection(projection1);

var radius = d3.scale.sqrt()
    .domain([0, 10])
    .range([0, 35]);

var force = d3.layout.force()
    .friction(0)
    .charge(20)
    .gravity(0)
    .size([width1, height1]);

var svg = d3.select("#mymap").append("svg")
    .attr("width", 500)
    .attr("height", 300)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");//MINIMAP

// var svg2 = d3.select("#mymap2").append("svg")
//     .attr("width", 960)
//     .attr("height", 200);//TITLE SCREEN

var svg1 = d3.select("#mymap2").append("svg")
    .attr("width", "100%")
    .attr("height", "75%")
    .attr("viewBox", "0 0 900 700");//MAIN MAP

queue()
    .defer(d3.json, "data/us.json")
    .defer(d3.json, "data/statedata2.json")
    .defer(d3.json, "data/countylevel.json")
    .defer(d3.json, "data/us-counties.json")
    .await(ready);    

function ready(error, us, states, counties, countymap) {
  
  //LET'S GET IT ON
  d3.select("#fight")
    .on("click", fight);

  var nodesStates = states.features

      .map(function(d) {
        var point = projection(d.geometry.coordinates),
            abb = d.id,
            namestate = d.properties.abb,
            namecomp = d.properties.name,
            ATT = d.properties.ATT,
            Cellco = d.properties.Cellco,
            Clearwire = d.properties.Clearwire,
            LeapWireless = d.properties.LeapWireless,
            MetroPCS = d.properties.MetroPCS,
            NewCin = d.properties.NewCingularWireless,
            Sprint = d.properties.Sprint,
            TMobile = d.properties.TMobile,
            USCellular = d.properties.UnitedStatesCellular,
            Verizon = d.properties.Verizon; 
       
        return {
  
          x: point[0]-120, 
          y: point[1]+90,
          x0: point[0]-120, 
          y0: point[1]+90,
          winner: 0,
          r: 30,
          ATT: ATT,
          Cellco: Cellco,
          Clearwire: Clearwire,
          LeapWireless: LeapWireless,
          MetroPCS: MetroPCS,
          NewCin: NewCin,
          Sprint: Sprint,
          TMobile: TMobile,
          USCellular: USCellular,
          Verizon: Verizon,
          namecomp: namecomp, 
          name: namestate          
        };
  });

  force
      .nodes(nodesStates)
      .on("tick", tick)
      .start();

  var node = svg1.selectAll(".feature")
      .data(nodesStates)
      .enter()
      .append("g")
      .call(force.drag);

    node.append("rect")
      .attr("class", 'squares')
      .attr("id", function(d) {return d.name;})
      .attr("width", function(d) { return d.r * 2; })
      .attr("height", function(d) { return d.r * 2; })
      .style("stroke", "white")
      .style("fill", 'url(#pattern)')
      .style("fill-opacity", 0.4)
      .on("mouseover",minimouseover)
      .on("mouseout",minimouseout);


    node.append("text")
      .attr("dx", function(d) { return d.r/2;})
      .attr("dy", function(d) { return d.r;})
      .text(function(d) { return d.name; })
      .style("font-family", "Arial")
      // .style("font-size", function(d) {return (d.value + 100) + " px";})
      .style("font-size", 16)
      .style("fill", "black")
      .style("cursor", "default");


////////////////MINIMAP/////////////////////


          // .on("mouseover",minimouseover)
          // .on("mouseout",minimouseout);

  function minimouseover(d){

      var name = d.name;
      console.log(name);
      d3.select(this)
        .style("stroke","black");

      d3.selectAll("."+d.name)
        .style("stroke-width", 1);

      $("#pop-up").fadeOut(100,function () {
          // Popup content
          $("#pop-up-title").html(d.namecomp);
          $("#pop-img").html(name);
          $("#pop-desc").html("In "+name+", the winner is: "+d.ATT);

          // Popup position
          var popLeft = (d.x*scale)+trans[0]+20;//lE.cL[0] + 20;
          var popTop = (d.y*scale)+trans[1]+20;//lE.cL[1] + 70;
          $("#pop-up").css({"left":popLeft,"top":popTop});
          $("#pop-up").fadeIn(100);
      });
  }

  function minimouseout(d){

      var name = d.name;
      d3.select(this)
        .style("stroke","white");

      d3.selectAll("."+name)
        .style("stroke-width", 1);

      $("#pop-up").fadeOut(50);
        d3.select("."+name).attr("fill","url(#ten1)");
  }
//////////////MINIMAP END////////////////////

  function tick(e) {
    node.each(gravity(e.alpha * .1))
        .each(collide(.5));
    node.attr("transform", function(d) { return "translate(" + (d.x ) + "," + (d.y) + ")"; });
  }

  function gravity(k) {
    return function(d) {
      d.x += (d.x0 - d.x) * k;
      d.y += (d.y0 - d.y) * k;
    };
  }

  function collide(k) {
    var q = d3.geom.quadtree(nodesStates);
    return function(node) {
      var nr = node.r + padding,
          nx1 = node.x - nr,
          nx2 = node.x + nr,
          ny1 = node.y - nr,
          ny2 = node.y + nr;
      q.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
          var x = node.x - quad.point.x,
              y = node.y - quad.point.y,
              lx = Math.abs(x),
              ly = Math.abs(y),
              r = nr + quad.point.r;
          if (lx < r && ly < r) {
            if (lx > ly) {
              lx = (lx - r) * (x < 0 ? -k : k);
              node.x -= lx;
              quad.point.x += lx;
            } else {
              ly = (ly - r) * (y < 0 ? -k : k);
              node.y -= ly;
              quad.point.y += ly;
            }
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }

  function fight(){  

        var Player1 = document.getElementById('firstbox').value;
        var Player2 = document.getElementById('secondbox').value;
        // var Player1k = document.getElementById('myselection1').innerHTML;
        // var Player2k = document.getElementById('myselection2').innerHTML;
        var PointsPlayer1 =0; 
        var PointsPlayer2 = 0;
        var Diff = {};
        

        if(Player1!=Player2 & Player1!=-1 & Player2!=-1){

            // var force1 = d3.layout.force()
            // .friction(0)
            // .charge(10000)
            // .gravity(0)
            // .size([width1, height1]);
          
                        
            svg1.selectAll("g")
            .remove();

            var nodesStates = states.features

                  .map(function(d) {
                    var point = projection(d.geometry.coordinates),
                        abb = d.id,
                        namestate = d.properties.abb,
                        namecomp = d.properties.name,
                        ATT = d.properties.ATT,
                        Cellco = d.properties.Cellco,
                        Clearwire = d.properties.Clearwire,
                        LeapWireless = d.properties.LeapWireless,
                        MetroPCS = d.properties.MetroPCS,
                        NewCin = d.properties.NewCingularWireless,
                        Sprint = d.properties.Sprint,
                        TMobile = d.properties.TMobile,
                        USCellular = d.properties.UnitedStatesCellular,
                        Verizon = d.properties.Verizon; 
                   
                    return {
              
                      x: point[0]-120, 
                      y: point[1]+90,
                      x0: point[0]-120, 
                      y0: point[1]+90,
                      winner: 0,
                      r: 25,
                      ATT: ATT,
                      Cellco: Cellco,
                      Clearwire: Clearwire,
                      LeapWireless: LeapWireless,
                      MetroPCS: MetroPCS,
                      NewCin: NewCin,
                      Sprint: Sprint,
                      TMobile: TMobile,
                      USCellular: USCellular,
                      Verizon: Verizon,
                      namecomp: namecomp, 
                      name: namestate          
                    };
              });

            for (key in nodesStates){         
            nodesStates[key]['winner']= Math.max(nodesStates[key][Player1],nodesStates[key][Player2]);
            console.log(nodesStates[key]['winner']);
            console.log(nodesStates[key]['r']);
            }

            force
              .nodes(nodesStates)
              .on("tick", tick)
              .start();

            var node = svg1.selectAll(".feature")
              .data(nodesStates)
              .enter()
              .append("g");

            node.append("rect")
              .attr("class", 'squares')
              .attr("id", function(d) {return d.name;}) 
              .attr("width", function(d) { if(d.winner ==0){return 60;} else{return d.winner*3+60;}})
              .attr("height", function(d) { if(d.winner ==0){return 60;} else{return d.winner*3+60;}})
              .style("stroke", "white")
              .style("fill", function(d) { if(d.winner ==0){return 'url(#pattern)';}else if(d[Player1]==d[Player2]&&d[Player1]!=0){return 'yellow';}else if(d[Player1]>d[Player2]){return 'blue';} else{return 'red';}})
              .on("mouseover",minimouseover)
              .on("mouseout",minimouseout);

            node.append("text")
              .attr("dx", function(d) { if(d.winner ==0){return 60/2;} else{return (d.winner+60)/2;}})
              .attr("dy", function(d) { if(d.winner ==0){return 60/2;} else{return d.winner+60/2;}})
              .text(function(d) { return d.name; })
              .style("font-family", "Arial")
              .style("font-size", 16)
              .style("fill", "black")
              .style("cursor", "default");

            Total = [50, 25];
            SumTotal = PointsPlayer1+ PointsPlayer2;

            /////////MINI MAP//////////////////////

              var g = svg.selectAll(".minimap")
                    .data(us.features)
                    .enter()
                    .append("g");

              g.selectAll("path")
                  .data(us.features)
                  .enter()
                  .append("path")
                  .attr("d", path)
                  .attr("class", "feature")
                  .style("stroke", "white");

              g.selectAll("path")
                  .data(nodesStates)
                  .style("fill", "orange")
                  .on('click', onclick);

            /////////TITLE DATA//////////////////////

            var yadjust=60;
            
            svg1.selectAll(".titletext")
              .transition()
                .remove();

            svg1.append("text")
              .attr("class","titletext")
              .text(Player1k)
              .style("font-size", "66px")
              .style("font-family", "Yanone Kaffeesatz")
              .style("fill","green")
              .attr("dx", -100)
              .attr("dy", 70+yadjust)
            .transition()
              .delay(500)
              .ease("bounce")
              .duration(2500)
              .attr("dx", 300)
              .attr("dy", 70+yadjust)
            .transition()
              .ease("linear")
              .attr("dx", 200)
              .attr("dy", 70+yadjust);

            svg1.append("text")
              .attr("class","titletext")
              .text("vs.")
              .style("font-size", "136px")
              .style("font-family", "Yanone Kaffeesatz")
              .style("fill","grey")
              .attr("dx", 350)
              .attr("dy", -100+yadjust)
            .transition()
              .ease("backs")
              .delay(1250)
              .duration(4000)
              .attr("dx", 350)
              .attr("dy", 80+yadjust);

            svg1.append("text")
              .text(Player2k)
              .attr("class","titletext")
              .style("font-size", "66px")
              .style("font-family", "Yanone Kaffeesatz")
              .style("fill","blue")
              .attr("dx", 1000)
              .attr("dy", 80+yadjust)
            .transition()
              .delay(500)
              .ease("bounce")
              .duration(2500)
              .attr("dx", 400)
              .attr("dy", 80+yadjust)
            .transition()
              .ease("linear")
              .attr("dx", 500)
              .attr("dy", 80+yadjust);

          // setInterval(4000,fireworks());

          // function fireworks() {
          //   var transforms = ["100,190","100,220","100,20","-100,200","-100,30","-100,220","-100,20","-200,90",
          //   "-200,180","-200,80","200,90","200,190","200,170","200,70","-50,180","-50,80",
          //   "50,180","50,150"];
          //   for (var i = 0; i < transforms.length; i++) {
          //     svg1.append("svg:circle")
          //       .attr("cx",400).attr("cy",45).attr("r",0)
          //       .style("stroke","yellow").style("fill","grey").style("stroke-opacity",0.5)
          //       .transition()
          //         .attr("transform","translate("+transforms[i]+")").delay(5000).duration(2000).ease(Math.sqrt).attr("r",Math.random()*30)
          //         .style("stroke-opacity",1e-6).style("fill-opacity",1e-6).remove();
          //   }
          // }

          /////////////////TITLE DATA END/////////////////
        
          function tick(e) {
            node.each(gravity(e.alpha * .2))
                .each(collide(.5));
            node.attr("transform", function(d) { return "translate(" + (d.x ) + "," + (d.y) + ")"; });
          }

          function gravity(k) {
            return function(d) {
              d.x += (d.x0 - d.x) * k;
              d.y += (d.y0 - d.y) * k;
            };
          }

          function collide(k) {
            var q = d3.geom.quadtree(nodesStates);

            return function(node) {
              var nr = node.r + padding + 20,
                  nx1 = node.x - nr,
                  nx2 = node.x + nr,
                  ny1 = node.y - nr,
                  ny2 = node.y + nr;
              q.visit(function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== node)) {
                  var x = node.x - quad.point.x,
                      y = node.y - quad.point.y,
                      lx = Math.abs(x),
                      ly = Math.abs(y),
                      r = nr + quad.point.r;
                  if (lx < r && ly < r) {
                    if (lx > ly) {
                      lx = (lx - r) * (x < 0 ? -k : k);
                      node.x -= lx;
                      quad.point.x += lx;
                    } else {
                      ly = (ly - r) * (y < 0 ? -k : k);
                      node.y -= ly;
                      quad.point.y += ly;
                    }
                  }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
              });
            };
          }


        function onclick(d){

            var Statename = d.name;
            console.log(Statename);

            svg1.selectAll("g")
                  .remove();

            // force.stop();

              var nodesCounties = counties.features
                  .filter(function(d){return d.properties.abb==Statename;})
                  .map(function(d) {
                      var point = projection(d.geometry.coordinates),
                        abb = d.id,
                        namestate = d.properties.abb,
                        namecomp = d.properties.countyname,
                        ATT = d.properties.ATT,
                        Cellco = d.properties.Cellco,
                        Clearwire = d.properties.Clearwire,
                        LeapWireless = d.properties.LeapWireless,
                        MetroPCS = d.properties.MetroPCS,
                        NewCin = d.properties.NewCingularWireless,
                        Sprint = d.properties.Sprint,
                        TMobile = d.properties.TMobile,
                        USCellular = d.properties.UnitedStatesCellular,
                        Verizon = d.properties.Verizon; 
                   
                    return {
                      x: point[0]-120, 
                      y: point[1]+90,
                      x0: point[0]-120, 
                      y0: point[1]+90,
                      winner: 0,
                      r: radius(5),
                      ATT: ATT,
                      Cellco: Cellco,
                      Clearwire: Clearwire,
                      LeapWireless: LeapWireless,
                      MetroPCS: MetroPCS,
                      NewCin: NewCin,
                      Sprint: Sprint,
                      TMobile: TMobile,
                      USCellular: USCellular,
                      Verizon: Verizon,
                      abb:abb,
                      namecomp: namecomp, 
                      name: namestate          
                    };
              });

            force
              .nodes(nodesCounties)
              .on("tick", tick)
              .start();

            var node = svg1.selectAll(".feature")
              .data(nodesCounties)
              .enter()
              .append("g")
              .call(force.drag);

            node.append("rect")
              .attr("class", 'squares')
              .attr("id", function(d) {return d.name;})
              .attr("width", function(d) { return d.r*2; })
              .attr("height", function(d) { return d.r*2; })
              //.attr("transform", function(d) { return "translate(" + (d.x ) + "," + (d.y) + ")"; })
              .style("stroke", "white")
              .style("fill", "blue")
              .on("mouseover",minimouseover)
              .on("mouseout",minimouseout);

            node.append("text")
              .attr("dx", function(d) { return d.r/2;})
              .attr("dy", function(d) { return d.r;})
              //.attr("transform", function(d) { return "translate(" + (d.x ) + "," + (d.y) + ")"; })
              .text(function(d) { return d.namecomp; })
              .style("font-family", "Arial")
              .style("font-size", function(d) {return (d.value + 50) + " px";})
              .style("fill", "white")
              .style("cursor", "default");

          var miniCounty = countymap.features
                  .filter(function(d){return countymap.id==counties.features.id && counties.features.map(function(d){var abb=d.properties.abb
                              return abb;})==Statename;});
          console.log(miniCounty);
          console.log(counties.features.map(function(d){var abb=d.properties.abb
                              return abb}));
          //console.log(counties.features.properties.abb);
          // console.log(nodesCounties);
        
          function tick(e) {
            node.each(gravity(e.alpha * .1))
                .each(collide(.5));
            node.attr("transform", function(d) { return "translate(" + (d.x) + "," + (d.y) + ")"; });
          }

          function gravity(k) {
            return function(d) {
              d.x += (d.x0 - d.x) * k;
              d.y += (d.y0 - d.y) * k;
            };
          }

          function collide(k) {
            var q = d3.geom.quadtree(nodesCounties);
            return function(node) {
              var nr = node.r + padding,
                  nx1 = node.x - nr,
                  nx2 = node.x + nr,
                  ny1 = node.y - nr,
                  ny2 = node.y + nr;
              q.visit(function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== node)) {
                  var x = node.x - quad.point.x,
                      y = node.y - quad.point.y,
                      lx = Math.abs(x),
                      ly = Math.abs(y),
                      r = nr + quad.point.r;
                  if (lx < r && ly < r) {
                    if (lx > ly) {
                      lx = (lx - r) * (x < 0 ? -k : k);
                      node.x -= lx;
                      quad.point.x += lx;
                    } else {
                      ly = (ly - r) * (y < 0 ? -k : k);
                      node.y -= ly;
                      quad.point.y += ly;
                    }
                  }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
              });
            };
          }

        }

        }
        else {
                alert("Please Select Player 1 and Player 2");
        }




  }

};
