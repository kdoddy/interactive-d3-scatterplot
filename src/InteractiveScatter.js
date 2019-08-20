import * as d3 from 'd3';
import * as math from 'mathjs';

export default function(svg, width, height) {


function randomData(samples) {
  var data = [];

  for (var i = 0; i < samples; i++) {
    data.push({
      x: i,
      y: i%12 === 0 && i !== 0 ? 50 : i+10*Math.random()
    });
  }

  data.sort(function(a, b) {
    return a.x - b.x;
  })
  return data;
}

var data = randomData(10);

//create x y array

function createXArray(d) {
  let xArray = [];
  for (var i = 0; i < d.length; i++) {
    xArray.push(d[i].x)
  }
  return xArray;
}
function createYArray(d) {
  let yArray = [];
  for (var i = 0; i < d.length; i++) {
    yArray.push(d[i].y)
  }
  return yArray;
}

// Set Color Scale
// let color = d3.scaleOrdinal(d3.schemeCategory20);

/*********************** Plot Below *********************/
var margin = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 50
};

// var width = 800 - margin.left - margin.right,
//   height = 400 - margin.top - margin.bottom;

var xScale = d3.scaleLinear()
  .range([0, width])
  .domain(d3.extent(data, function(d) {
    return d.x;
  })).nice();

var yScale = d3.scaleLinear()
  .range([height, 0])
  .domain(d3.extent(data, function(d) {
    return d.y;
  })).nice();

var xAxis = d3.axisBottom(xScale).ticks(12),
  yAxis = d3.axisLeft(yScale).ticks(12 * height / width);

    /*
  Russ's Function start
  */
 let d = createYArray(data) // y
 let context = createXArray(data) // x
 console.log('d(y)', d)
 console.log('context(x)', context)
 // length of d must be greater than 1 to plot line
 let xPlotLine = math.range(0, 10, 0.1);
 
 function lq_line(context, d){
   //returns 2 values ( slope and intercept of line ) as matrix object
   let num_obs = context.length;
   let g = math.ones(num_obs, 2)
 
   for (let i = 0; i < num_obs; i++){
     g.subset(math.index(i, 0), context[i])
   }
 
   const gt = math.transpose(g);
   const ggen = math.multiply(gt, g);
   const inv = math.inv(ggen);
   const gd = math.multiply(gt, d);
   const mest = math.multiply(inv, gd);
   console.log('mest:', mest);
 
   return mest
 }
 let mest = lq_line(context,d);
 let slope;
 function generate_line(mest,x ){
 
   slope = mest.subset(math.index(0));
   let intercept = mest.subset(math.index(1));
   let y = math.add(math.multiply(slope, x), intercept);
   console.log('typof', typeof intercept)
   console.log('here', math.add(math.multiply(slope, x), intercept));
   console.log('this is what i want:', y._data)
   return y._data
 }
 var yPlotLine = generate_line(mest, xPlotLine)

 console.log('y length:', yPlotLine.length)
 console.log('x:', xPlotLine)
 var lineData = createPlotLineObj(xPlotLine._data, yPlotLine)
 function createPlotLineObj(x, y) {
   console.log('xxxx', x)
   console.log('yyyy', y)
  let data = [];

  for (var i = 0; i < x.length; i++) {
    data.push({
      x: x[i],
      y: y[i]
    });
  }

  data.sort(function(a, b) {
    return a.x - b.x;
  })
  console.log('THISISIIIS', data)

  return data;
 }

 
  /*
  Russ's Function end
  */

var plotLine = d3.line()
  .curve(d3.curveMonotoneX)
  .x(function(d) {
    return xScale(d.x);
  })
  .y(function(d) {
    return yScale(d.y);
  });

d3.select("#plot").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);
/*new
*/
svg.append("text")
  .attr('id', 'slope')
  .attr("x", margin.left + 10)
  .attr("y", margin.top + 10)
  .text("Slope: " + slope)

svg.append("g")
  .attr("class", "x axis ")
  .attr('id', "axis--x")
  .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
  .call(xAxis);

svg.append("g")
  .attr("class", "y axis")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .attr('id', "axis--y")
  .call(yAxis);

var clickZone = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	.append("g").append("rect")
    .attr("class", "click-zone")
    .attr("width", width)
    .attr("height", height)
    .style("opacity", 0)
    .on("click", function() {
    	let clickArea = d3.select(this).node();
      
      addPoint(clickArea);			
      update();
    });
  
var line = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var dot = svg.append("g")
  .attr("id", "scatter")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add line plot
line.append("g")
    .attr("id", "line-1")
    .attr("clip-path", "url(#clip)")
      .append("path")
      .data([lineData])
      .attr("class", "pointlines")
      .attr("d", plotLine)
      .style("fill", "none")
      .style("stroke", "brown");
    
dot.append("g")
  .attr("id", "scatter-1")
  .attr("clip-path", "url(#clip)")
  .selectAll(".dot")
  .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 5)
    .attr("cx", function(d) {
      return xScale(d.x);
    })
    .attr("cy", function(d) {
      return yScale(d.y);
    })
    .attr("stroke", "white")
    .attr("stroke-width", "2px")
    .style("fill", function(d) {
    	return d.y > 45 ? "gold" : "brown";
    })
    .on("click", function(d,i) {
    	let s = d3.select(this);
      remove(s,i);
    });

/************ Add/Remove Point Below **************************/
function addPoint(clickArea) {
			var pos = d3.mouse(clickArea);
      var xPos = xScale.invert(pos[0]);
      var yPos = yScale.invert(pos[1]);
      
      data.push({x: xPos, y: yPos});
      data.sort(function(a,b) { return a.x - b.x});
}

function remove(sel,index) {	 
  data.splice(index,1);
  update();
}
  
/************ Update Below **************************/
function update() {  
  // update line
  console.log(data.length);
  
  // Update line
  /*
  new stuff
  */
 d = createYArray(data); // y
 context = createXArray(data); // x
 mest = lq_line(context,d);
 yPlotLine = generate_line(mest, xPlotLine);
 lineData = createPlotLineObj(xPlotLine._data, yPlotLine);


  d3.select("#line-1").select("path")
 		.data([lineData])
    .transition().duration(1000)
    .attr("d", plotLine);

    d3.select("#slope")
      .text("Slope: " + slope)
    
   // Remove old line data
   d3.select("#line-1").select("path").data([lineData]).exit().remove();
   	
  //Update all circles
  d3.select("#scatter-1").selectAll("circle")
    .data(data)
    .transition()
    .duration(1000)
    .attr("cx", function(d) {
      return xScale(d.x);
    })
    .attr("cy", function(d) {
      return yScale(d.y);
    })
    .style("fill", function(d) {
    	return d.y > 45 ? "gold" : "brown";
    });

  //Enter new circles
  d3.select("#scatter-1").selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", function(d) {
      return xScale(d.x);
    })
    .attr("cy", function(d) {
      return yScale(d.y);
    })
    .attr("r", 5)
    .attr("stroke", "white")
    .attr("stroke-width", "2px")
    .style("fill", function(d) {
    	return d.y > 45 ? "gold" : "brown";
    })
    .on("click", function(d,i) {
    	let s = d3.select(this);
      remove(s,i);
    });

  // Remove old
  d3.selectAll("circle")
    .data(data)
    .exit()
    .remove()
}
}