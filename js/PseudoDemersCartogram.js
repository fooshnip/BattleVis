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
    .translate([width / .95, height / 1.5]);///MINIMAP

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
      .style("font-size", 16)
      .style("fill", "black")
      .style("cursor", "default");


////////////////MOUSE OVER FUNCTIONS/////////////////////

  function minimouseover(d){

      var name = d.name;
      console.log(name);
      d3.select(this)
        .style("stroke","gray")
        .style("stroke-width", 0.75);

      d3.selectAll("."+d.name)
        .style("stroke-width", 8)
        ;

      // $("#StateName").html(d.namecomp);
  }

  function minimouseout(d){

      var name = d.name;
      d3.select(this)
        .style("stroke","white");

      d3.selectAll("."+name)
        .style("stroke-width", 1);

      // $("#StateName").html("STATE");
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

            $("#default1").show();
            $("#PlayerName1").html(Player1);
            $("#PlayerName2").html(Player2);

            d3.select("#intro")
            .remove();

            d3.selectAll(".minimap")
            .remove();
                        
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
            TotalPlayer1 = 0;
            TotalPlayer2 = 0;
            for (key in nodesStates){         
            nodesStates[key]['winner']= Math.max(nodesStates[key][Player1],nodesStates[key][Player2]);
              if (nodesStates[key][Player1]>nodesStates[key][Player2]){
                TotalPlayer1 = TotalPlayer1+1;
              }
              else{
                TotalPlayer2 = TotalPlayer2+1;
              }
            }

            // $("#Score").html("<p class='Score1'>"+Player1+"</p><p class='ScoreNum1'>"+TotalPlayer1+"</p><p class='ScoreNum2'>"+TotalPlayer2+"</p><p class='Score2'>"+Player2+"</p>");
            $("#Score").html("<p class='Score1'><font COLOR=' blue'>"+Player1+""+TotalPlayer1+"</font>   <font COLOR=' red'>"+TotalPlayer2+" "+Player2+"</font></p>");

          
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
              .attr("width", function(d) { if(d.winner ==0){return 60;} else{return d.winner*3+60;}})
              .attr("height", function(d) { if(d.winner ==0){return 60;} else{return d.winner*3+60;}})
              .style("stroke", "white")
              .style("fill", function(d) { if(d.winner ==0){return 'url(#pattern)';}else if(d[Player1]==d[Player2]&&d[Player1]!=0){return 'yellow';}else if(d[Player1]>d[Player2]){return 'blue';} else{return 'red';}})
              .on("mouseover",minimouseover1)
              .on("mouseout",minimouseout1);

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
                  .attr("class", "minimap")
                  .style("stroke", "white");

              g.selectAll("path")
                  .data(nodesStates)
                  .style("fill", function(d) { if(d.winner ==0){return 'url(#pattern)';}else if(d[Player1]==d[Player2]&&d[Player1]!=0){return 'yellow';}else if(d[Player1]>d[Player2]){return 'blue';} else{return 'red';}})
                  .on('click', onclick)
                  .on("mouseover",minimapmouseover)
                  .on("mouseout",minimapmouseout);

            /////////TITLE DATA//////////////////////

            var Player1k = document.getElementById('myselection1').innerHTML;
            var Player2k = document.getElementById('myselection2').innerHTML;  

            var yadjust=30;
            
            svg1.selectAll(".titletext")
              .transition()
                .remove();

            // svg1.append("text")
            //   .attr("class","titletext")
            //   .text(Player1k+": "+TotalPlayer1)
            //   .style("font-size", "40px")
            //   .style("font-family", "Yanone Kaffeesatz")
            //   .style("fill","blue")
            //   .attr("dx", 100)
            //   .attr("dy", 0+yadjust);

            // svg1.append("text")
            //   .text(Player2k+": "+TotalPlayer2)
            //   .attr("class","titletext")
            //   .style("font-size", "40px")
            //   .style("font-family", "Yanone Kaffeesatz")
            //   .style("fill","red")
            //   .attr("dx", 700)
            //   .attr("dy", 0+yadjust);

            // svg1.append("rect")
            //   .attr("class","p1")
            //   .attr("x", 100-50)
            //   .attr("y", 0)
            //   .attr("width",15)
            //   .attr("height",15)
            //   .style("fill","blue");

            // svg1.append("rect")
            //   .attr("class","p2")
            //   .style("fill","red")
            //   .attr("x", 700-50)
            //   .attr("y", 0)
            //   .attr("width",15)
            //   .attr("height",15);

            svg1.append("text")//TIES
              .attr("class","titletext")
              .text("Ties")
              .style("font-size", "20px")
              .style("font-family", "Yanone Kaffeesatz")
              .style("fill","black")
              .attr("dx", 450)
              .attr("dy", 0+yadjust);

            svg1.append("text")//NOVALUES
              .text("No values")
              .attr("class","titletext")
              .style("font-size", "20px")
              .style("font-family", "Yanone Kaffeesatz")
              .style("fill","black")
              .attr("dx", 450)
              .attr("dy", 20+yadjust);

            svg1.append("rect")
              .attr("class","p1")
              .attr("x", 450-50)
              .attr("y", 0+yadjust/2)
              .attr("width",15)
              .attr("height",15)
              .style("fill","yellow");

            svg1.append("rect")
              .attr("class","p2")
              .style("fill",function(d){return 'url(#pattern)'})
              .attr("x", 450-50)
              .attr("y", 20+yadjust/2)
              .attr("width",15)
              .attr("height",15);

          /////////////////TITLE DATA END/////////////////

          /////////////////MOUSEOVERS/////////////////

            function minimouseover1(d){

                var name = d.name;
                console.log(name);
                d3.select(this)
                  .style("stroke","gray")
                  .style("stroke-width", 0.75);

                d3.selectAll("."+d.name)
                  .style("stroke-width", 8)
                  ;

                $("#StateName").html(d.namecomp);
                $("#AvgSpeed1").html(d[Player1].toFixed(2));
                $("#AvgSpeed2").html(d[Player2].toFixed(2));
            }

            function minimouseout1(d){

                var name = d.name;
                d3.select(this)
                  .style("stroke","white");

                d3.selectAll("."+name)
                  .style("stroke-width", 1);

                $("#StateName").html("State");
                $("#AvgSpeed1").html("-");
                $("#AvgSpeed2").html("-");
            }

          function minimapmouseover(d){
                $("#StateName").html(d.namecomp);
            }

            function minimapmouseout(d){

                $("#StateName").html("State");
            }
        
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
            $("#StateName").html(d.Statename);
            svg1.selectAll("g")
                  .remove();

              var nodesCounties = counties.features
                  .filter(function(d){return d.properties.abb==Statename;})
                  .map(function(d) {
                      var point = projection(d.geometry.coordinates),
                        abb = d.id,
                        namestate = d.properties.abb,
                        namestatecomp = d.properties.name,
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
                      r: 10,
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
                      name: namestate,
                      namestatecomp: namestatecomp          
                    };
              });

            TotalCountiesPlayer1 = 0;
            TotalCountiesPlayer2 = 0;

            for (key in nodesCounties){         
            nodesCounties[key]['winner']= Math.max(nodesCounties[key][Player1],nodesCounties[key][Player2]);
            if (nodesCounties[key][Player1]>nodesCounties[key][Player2]){
              TotalCountiesPlayer1 = TotalCountiesPlayer1+1;
            }
            else{
              TotalCountiesPlayer2 = TotalCountiesPlayer2+1;
            }

            console.log(TotalCountiesPlayer2);
            console.log(TotalCountiesPlayer1);
            }

            $("#Score").html("<p class='Score1'><font COLOR=' blue'>"+Player1+""+TotalCountiesPlayer1+"</font>   <font COLOR=' red'>"+TotalCountiesPlayer2+" "+Player2+"</font></p>");


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
              .attr("width", function(d) { if(d.winner ==0){return 20;} else{return d.winner*3+20;}})
              .attr("height", function(d) { if(d.winner ==0){return 20;} else{return d.winner*3+20;}})
              .style("fill", function(d) { if(d.winner ==0){return 'url(#pattern)';}else if(d[Player1]==d[Player2]&&d[Player1]!=0){return 'yellow';}else if(d[Player1]>d[Player2]){return 'blue';} else{return 'red';}})
              .style("stroke", "white")
              .on("mouseover",minimouseover2)
              .on("mouseout",minimouseout2);

            d3.select("#resetter")
              .remove();

            d3.select("#sp6")
                .append("a")
                .attr("id","resetter")
                .attr("pointer-events","all")
                .text("Back to states")
                .style("margin-left","30px")
                .attr("dx",30)
                .attr("dy",40)
                .on("click",function(d){
            
            d3.select(this)
                .remove();
                fight();});


          var miniCounty = countymap.features
                  .filter(function(d){return countymap.id==counties.features.id && counties.features.map(function(d){var abb=d.properties.abb
                              return abb;})==Statename;});
          console.log(miniCounty);
          console.log(counties.features.map(function(d){var abb=d.properties.abb
                              return abb}));
        
          function minimouseover2(d){

                var name = d.name;
                console.log(name);
                d3.select(this)
                  .style("stroke","gray")
                  .style("stroke-width", 0.75);

                d3.selectAll("."+d.name)
                  .style("stroke-width", 8)
                  ;

                $("#StateName").html(d.namestatecomp+", "+d.namecomp);
                $("#AvgSpeed1").html(d[Player1].toFixed(2));
                $("#AvgSpeed2").html(d[Player2].toFixed(2));
            }

            function minimouseout2(d){

                var name = d.name;
                d3.select(this)
                  .style("stroke","white");

                d3.selectAll("."+name)
                  .style("stroke-width", 1);

                $("#StateName").html(d.namestatecomp);
                $("#AvgSpeed1").html("-");
                $("#AvgSpeed2").html("-");
            }




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
              var nr = node.r + padding+5,
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
