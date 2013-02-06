window.onload=init()

var default_node_size = 5;
// size of graph viewport
var graph_width = 1024;
var graph_height = 768;

var node;
var svg;

var force = d3.layout.force()
    .gravity(.1)
    .charge(-120)
    .linkDistance(30)
    .friction(.9)
    .theta(.1)
    .linkStrength(1)
    .alpha(.1)
    .size([graph_width, graph_height]);

//Color for groupings
//returns a coloring for 1-20
function init(){
 
  $('<div></div>')
   .attr({"id":"layout_inputs"})
   .css({"float":"left"})
   .prependTo('body');
  
  $('<label for=gravity>Gravity: </label>').appendTo('#layout_inputs');
  $('<input></input>')
   .attr({"id":"gravity",
          "type":"range",
          "min":0,
          "max":1,
          "step":0.01,
          "size":5,
          "value":0.1})
   .change(function(){
             force.gravity(Number($('#gravity').val())).resume();
           })
   .appendTo('#layout_inputs');

  $('<br><label for=charge>Charge: </label>').appendTo('#layout_inputs');
  $('<input></input>')
   .attr({"id":"charge",
          "type":"number",
          "max":0,
          "step":10,
          "size":6,
          "value":-120,
          "class":"int"})
   .change(function(){
             force.charge(Number($('#charge').val())).stop().start();
           })
   .appendTo('#layout_inputs');

  $('<br><label for=linkDistance>linkDistance: </label>').appendTo('#layout_inputs');
  $('<input></input>')
   .attr({"id":"linkDistance",
          "type":"number",
          "min":0,
          "step":5,
          "value":30,
          "class":"int"})
   .change(function(){
             force.linkDistance(Number($('#linkDistance').val())).stop().start();
           })
   .appendTo('#layout_inputs');

  $('<br><label for=friction>Friction: </label>').appendTo('#layout_inputs');
  $('<input></input>')
   .attr({"id":"friction",
          "type":"range",
          "min":0,
          "max":1,
          "step":.01,
          "value":0.9,
          "class":"float"})
   .change(function(){
             force.friction(Number($('#friction').val())).resume();
           })
   .appendTo('#layout_inputs');

  $('<br><label for=friction>Theta: </label>').appendTo('#layout_inputs');
  $('<input></input>')
   .attr({"id":"theta",
          "type":"range",
          "min":0,
          "max":1,
          "step":.01,
          "value":0.1,
          "class":"float"})
   .change(function(){
             force.theta(Number($('#theta').val())).resume();
           })
   .appendTo('#layout_inputs');
  
  $('<br><label for=linkStrength>Link Strength: </label>').appendTo('#layout_inputs');
  $('<input></input>')
   .attr({"id":"linkStrength",
          "type":"range",
          "min":0,
          "max":1,
          "step":.01,
          "value":1,
          "class":"float"})
   .change(function(){
             force.linkStrength(Number($('#linkStrength').val())).stop().start();
           })
   .appendTo('#layout_inputs');

  $('<br><label for=linkStrengthProp>Link Strength Proportional: </label>')
    .appendTo('#layout_inputs');
  $('<input></input>')
    .attr({"id":"linkStrengthProp",
           "type":"checkbox",
           "value":"off"})
    .change(function(){
              force.linkStrength(meta_link_strength(Number($('#linkStrength').val()))).stop().start();
            })
    .appendTo('#layout_inputs');

  $('<br><label for=alpha>Alpha: </label>')
    .appendTo('#layout_inputs');
  $('<input></input>')
    .attr({"id":"alpha",
           "type":"range",
           "min":0,
           "max":1,
           "step":0.01,
           "value":0.1})
    .change(function(){
              force.alpha(Number($('#alpha').val())).resume();})
    .appendTo('#layout_inputs');
   

  $('<div></div>')
   .attr({"id":"prop_select"})
   .css({"float":"right"})
   .appendTo('body');
  
  $('<label for=graph_select>Select Graph: </label>')
    .appendTo('#prop_select')
  $('<select></select>')
   .attr({"id":"graph_select"})
   .appendTo('#prop_select')
   .change(function(){
             $('#svg').remove();
             $('#node_title').children().remove().end();
             d3.json($('#graph_select').val(),draw_graph);});

  $('<br><label for=node_color_pick>Node Color: </label>')
    .appendTo('#prop_select')

  $('<input></input>')
   .attr({"id":"node_color_pick",
          "type":"color",
          "value":"#ff0000"})
   .change(function(){ node.style("fill", function(d){return $('#node_color_pick').val();}); })
   .appendTo("#prop_select");


   $.ajax({url: "http://127.0.0.1:8000",
           success: function(data){
                      $(data).find("a:contains(.json)")
                             .each(function(n){
                                    var f = $(this).attr("href");
                                    $('#graph_select')
                                    .append($('<option>',{f:n})
                                            .text(f));
                                   });},
           complete:init_graph });
};

function meta_link_strength(n){
  return function(d) {
    if ($("#linkStrengthProp").prop("checked"))
      if (typeof d.strength == "undefined")
        return n;
      else
        return d.strength
    else
      return n;
  };
};

function init_graph(){
// grab the graph data, and parse it into ) })
// Then it calls the draw_graph function
// if the request for json fails, it will give
// an error(passed to draw_graph), otherwise
// it sends the json to draw_graph
  d3.json($('#graph_select').val(),draw_graph);
}

function draw_graph(error, graph_data) {
  $('<div></div>')
   .attr({"id":"svg"})
   .appendTo('body');
  
  // Look in the webpage for the chart id
  // Once found (t)is is a div) I have no idea
  // we then append an svg element to it with the 
  // appropriate graph.
  svg = d3.select("#svg").append("svg")
      .attr("width", graph_width)
      .attr("height", graph_height);
  //The force directed layout, sets up settings for the layout

  // Give the force directed layout the node
  // and link data and start laying things out 
    force
        .nodes(graph_data.nodes)
        .links(graph_data.links)
        .start();

    // Select all the things that have the property
    // line.edge. Then we replace the acutal link json data
    // This then returns an updated selection
    // The append is key, it means for)each element of the
    // array (source, target) we are adding a line
    // Each subsequent call, modifies something
    // IE defines a class, or style
    // Then it returns the whole selection
    var link = svg.selectAll("line.link")
        .data(graph_data.links)//adds the graph data to line
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return d.width; })
        .style("stroke", function(d) {return d.color;});

    // Same thing as the links, except we are adding
    // the circle
    node = svg.selectAll("circle.node")
              .data(graph_data.nodes)
           .enter().append("circle")
             .attr("class", "node")
             .attr("r", function(d) { 
                          if (typeof d.size == "undefined")
                            return default_node_size;
                          else
                            return d.size;
                        })
             .style("stroke-width", function(d){ return d.border_size; })
             .style("stroke", function(d) {return d.border_color; })
             .style("fill", function(d) { return d.color; })
          .call(force.drag);


    var ks = node_keys(graph_data.nodes);
    ks.forEach(function(n){$('#node_title')
                              .append($('<option>',{n:n}).text(n));});
    // Defining a function to grab the name for each node
    //node.append("svg:title")
    //    .text(function(d) { return d[$('#node_title').val()]; });
    node.append("svg:title")
        .text(function(d) { return d['name']; });

    // For each tick in time what the hell do we do with the layout
    // Specifically we want to move the links around
    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    });
};

function node_keys(nodes){
    var all_keys = {};
    var keys;
    nodes.forEach(function(n){
                     Object.keys(n).forEach(function(k){
                                              all_keys[k]=true;});});
    return Object.keys(all_keys);
}
