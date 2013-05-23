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
    .charge(10)
    .gravity(0)
    .size([width1, height1]);

var svg = d3.select("#mymap").append("svg")
    .attr("width", "100%")
    .attr("height", "50%")
    .attr("viewBox", "0 0 600 500")
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
    .defer(d3.json, "data/finaltable.json")
    .await(ready);    

function ready(error, us, states) {
  
  //LET'S GET IT ON
  d3.select("#fight")
    .on("click", fight);

  var ProvidersPerState = {};
  var nodes = states.features
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
            ProvidersPerState[namestate] = [ATT, Cellco, Clearwire, LeapWireless, MetroPCS, NewCin, Sprint, TMobile, USCellular,Verizon];
        return {
          x: point[0]-120, 
          y: point[1]+90,
          x0: point[0]-120, 
          y0: point[1]+90,
          diff: 5,
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
          namecomp: namecomp, 
          name: namestate          
        };
      });
  force
      .nodes(nodes)
      .on("tick", tick)
      .start();

  var node = svg1.selectAll(".feature")
      .data(nodes)
      .enter().append("g")
      .call(force.drag);

    // node.append("image")
    //   .attr("xlink:href", "cell.gif")
    //   .attr("x", -8)
    //   .attr("y", -8)
    //   .attr("width", function(d) { return d.r * 2; })
    //   .attr("height", function(d) { return d.r * 2; })

    node.append("rect")
      .attr("class", function(d) { return d.name + ' squares';})
      .attr("id", function(d) {return d.name;})
      .attr("width", function(d) { return d.r * 2; })
      .attr("height", function(d) { return d.r * 2; })
      .style("stroke", "white")
      .style("fill", "orange")
      .on("mouseover",minimouseover)
      .on("mouseout",minimouseout);

    node.append("text")
      .attr("dx", function(d) { return d.r/2;})
      .attr("dy", function(d) { return d.r;})
      .text(function(d) { return d.name; })
      .style("font-family", "Arial")
      .style("font-size", function(d) {return (d.value + 100) + " px";})
      .style("fill", "white")
      .style("cursor", "default");


////////////////MINIMAP/////////////////////

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
          .data(nodes)
          .style("fill", "orange")
          .on("mouseover",minimouseover)
          .on("mouseout",minimouseout);

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
    var q = d3.geom.quadtree(nodes);
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
        var Player1k = document.getElementById('myselection1').innerHTML;
        var Player2k = document.getElementById('myselection2').innerHTML;
        var PointsPlayer1 =0; 
        var PointsPlayer2 = 0;
        var Diff = {};
        // Difference calculation
        
        // for (key in ProvidersPerState){
        //   Diff[key] = ProvidersPerState[key][Player1]-ProvidersPerState[key][Player2]; 
        // }

        for (key in nodes){         
          nodes[key]['diff']=nodes[key][Player1]- nodes[key][Player2];
        }

        console.log(nodes);


        if(Player1!=Player2 & Player1!=-1 & Player2!=-1){
            
            nodes.append("rect")
            .append("rect")
            .attr("width", function(d){ return d.r;})
            .attr("height", function(d){ return d.r;})
            .style("fill", "blue");
                                              



            // for(key in ProvidersPerState){
                



            //     // Chanhing Size and Colors
            //     d3.select("#"+key)
            //     // .transition()
            //     // // .delay(5000)
            //     // .ease("linear")
            //     .attr("width", function(d) { if (ProvidersPerState[key][Player1]==0 & ProvidersPerState[key][Player2]==0){
            //                                   return 80;
            //                                   }
            //                                   else {
            //                                   return Math.abs(ProvidersPerState[key][Player1]-ProvidersPerState[key][Player2])*10;  
            //                                   }})
            //     .attr("height", function(d) { if (ProvidersPerState[key][Player1]==0 & ProvidersPerState[key][Player2]==0){
            //                                   return 80;
            //                                   }
            //                                   else {
            //                                   return Math.abs(ProvidersPerState[key][Player1]-ProvidersPerState[key][Player2])*10;  
            //                                   }}) 
            //     .style("fill", function(d) {  if (ProvidersPerState[key][Player1]==0 & ProvidersPerState[key][Player2]==0){
            //                                   return "purple"
            //                                   }
            //                                   else if (ProvidersPerState[key][Player1]>ProvidersPerState[key][Player2]){
            //                                       return "orange";
            //                                   } 
            //                                   else if (ProvidersPerState[key][Player1]<ProvidersPerState[key][Player2]){
            //                                       return "blue";
            //                                   }
            //                                   else {return "green";}
            //                                   });
                

                // Text
                // d3.select("#"+key+"Text")
                // .attr("dx", function(d) { return Math.abs(ProvidersPerState[key][Player1]-ProvidersPerState[key][Player2]);})
                // .attr("dy", function(d) { return Math.abs(ProvidersPerState[key][Player1]-ProvidersPerState[key][Player2]);})
                // .text(function(d) { return d.key; })
                // .style("font-size", function(d) {return Math.abs(ProvidersPerState[key][Player1]-ProvidersPerState[key][Player2])})
                // .style("fill", "white")
                // .style("cursor", "default");

                    // Defining the winner
                    // if (ProvidersPerState[key][Player1]>ProvidersPerState[key][Player2]){
                    //     PointsPlayer1 = PointsPlayer1+1;
                    // }
                    // else if (ProvidersPerState[key][Player1]<ProvidersPerState[key][Player2]){
                    //     PointsPlayer2 = PointsPlayer2+1;
                    // }

            

            Total = [50, 25];
            SumTotal = PointsPlayer1+ PointsPlayer2;

            node.append("rect")
              .data(Total)
              .attr("class", "TotalPoints")
              .attr("width", function(d) { return d; })
              .attr("height", function(d) { return d; })
              .style("stroke", "white")
              .style("fill", "orange");

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

          setInterval(4000,fireworks());

          function fireworks() {
            var transforms = ["100,190","100,220","100,20","-100,200","-100,30","-100,220","-100,20","-200,90",
            "-200,180","-200,80","200,90","200,190","200,170","200,70","-50,180","-50,80",
            "50,180","50,150"];
            for (var i = 0; i < transforms.length; i++) {
              svg1.append("svg:circle")
                .attr("cx",400).attr("cy",45).attr("r",0)
                .style("stroke","yellow").style("fill","grey").style("stroke-opacity",0.5)
                .transition()
                  .attr("transform","translate("+transforms[i]+")").delay(5000).duration(2000).ease(Math.sqrt).attr("r",Math.random()*30)
                  .style("stroke-opacity",1e-6).style("fill-opacity",1e-6).remove();
            }
          }

          /////////////////TITLE DATA END/////////////////
        }
        else {
                alert("Please Select Player 1 and Player 2");
        }
  }

};
