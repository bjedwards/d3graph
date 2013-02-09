window.onload=init()

var default_node_size = 5;
// size of graph viewport
var graph_width = 1024;
var graph_height = 768;
var gd;
var node;
var svg;
var e;

var force = d3.layout.force()
                     .gravity(.1)
                     .charge(-120)
                     .linkDistance(30)
                     .friction(.9)
                     .theta(.1)
                     .linkStrength(1)
                     .alpha(.1)
                     .size([graph_width, graph_height]);

function init(){
  
  $("#layout_legend").click(function(){
                              $("#layout_list").slideToggle("slow");
                            });
  
  $("#node_color_legend").click(function(){
                                 $("#node_color_list").slideToggle("slow");
                                });

  $("#gravity").change(function(){
                         force.gravity(Number($('#gravity').val())).resume();
                       });

  var charge_cons = function(n){
                      if ((n<=0) && (typeof n == "number"))
                        return true; 
                      else 
                        return false;
                    };
  var charge_func = function() {
                      var c_def = $("#charge").val();
                      var c;
                      if ($("#charge_prop").is(':checked')){
                        $("#charge_select").removeAttr("disabled");
                        prop = $("#charge_select").val()
                        c = safe_val(prop,c_def,charge_cons);
                      }
                      else {
                        $("#charge_select").attr("disabled",true);
                        c = c_def;
                      }
                      force.charge(c).stop().start();
                    };
  $("#charge").change(charge_func);
  $("#charge_prop").change(charge_func);
  $("#charge_select").change(charge_func);
 
  var ld_cons = function(l) {
                  if ((l>=0) && (typeof l =="number"))
                    return true;
                  else
                    return false;
                };

  var ld_func = function() {
                  var ld_def = $("#link_distance").val();
                  var ld;
                  if ($("#link_distance_prop").is(':checked')){
                    $("#ld_select").removeAttr("disabled");
                    prop = $("#ld_select").val()
                    ld = safe_val(prop,ld_def,ld_cons);
                  }
                  else {
                      $("#ld_select").attr("disabled",true);
                      ld = ld_def;
                    }
                  force.linkDistance(ld).stop().start();
                };

  $("#link_distance").change(ld_func);
  $("#link_distance_prop").change(ld_func);
  $("#ld_select").change(ld_func);

  $("#friction").change(function(){
                          force.friction(Number($('#friction').val())).resume();
                        });

  $("#theta").change(function(){
                       force.theta(Number($('#theta').val())).resume();
                     });

  var ls_cons = function(l) {
                  if ((l>=0) && (l<=1) && (typeof l== "number"))
                    return true;
                  else
                    return false;
                  };

  var ls_func = function() {
                  var ls_def = $("#link_strength").val();
                  var ls;
                  if ($("#link_strength_prop").is(':checked')){
                    $("#ls_select").removeAttr("disabled");
                    prop = $("#ls_select").val()
                    ls = safe_val(prop,ls_def,ls_cons);
                  }
                  else {
                      $("#ls_select").attr("disabled",true);
                      ls = ls_def;
                    }
                  force.linkStrength(ls).stop().start();
                };
  
  $("#link_strength").change(ls_func);

  $("#link_strength_prop").change(ls_func);

  $("#ls_select").change(ls_func);

  $("#alpha").change(function(){
                       force.alpha(Number($('#alpha').val())).resume();
                     });
   
  
  $("#graph_select").change(function(){
                              $('svg#graph_svg').empty();
                              if ($('#graph_select').val() == "none")
                                return;
                              else
                                d3.json('data/'+$('#graph_select').val(),draw_graph);
                            });
   
  $.ajax({url: "http://127.0.0.1:8000/data",
           success: function(data){
                      $(data).find("a:contains(.json)")
                             .each(function(n){
                                    var f = $(this).attr("href");
                                    $('#graph_select')
                                    .append($('<option>',{f:n})
                                            .text(f));
                                   });},
           complete:init_graph });
  
  var node_color_change = function() {
    var def_c = $("#node_color_pick").val();
    var prop_c = $("#nc_select").val();
    var type = $('input[name=node_color_rad]:checked').val();
    console.log(type);
    if (type == "static")
    {
      node.style("fill", function(d) {
                           return def_c;
                         });
      $("#nc_select").attr("disabled",true)
    }
    else if (type == "color")
    {
      console.log(def_c);
      console.log(prop_c);
      node.style("fill", safe_val(prop_c,def_c,colorsafe));
      $("#nc_select").removeAttr("disabled");
    }
    else
    {
      node.style("fill", function(d) {
                           return def_c;
                         });
    }
  };

  $("input[name=node_color_rad]").change(node_color_change);
  $("#nc_select").change(node_color_change);

  $("#node_color_pick").change(node_color_change);
};

function colorsafe(c) {
  return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(c)
}
function safe_val(property,def,cons){
  return function(d) {
    if ((typeof d[property] == "undefined") || (!cons(d[property])))
      return def;
    else
      return d[property];
  };
};

function get_keys(objs){
    var all_keys = {};
    var keys;
    objs.forEach(function(n){
                     Object.keys(n).forEach(function(k){
                                              all_keys[k]=true;});});
    return Object.keys(all_keys);
}

function init_graph(){
// grab the graph data, and parse it into ) })
// Then it calls the draw_graph function
// if the request for json fails, it will give
// an error(passed to draw_graph), otherwise
// it sends the json to draw_graph
  if ($('#graph_select').val() == "none")
    return;
  d3.json('data/'+$('#graph_select').val(),draw_graph);
}

function draw_graph(error, graph_data) {
  if (error !== null)
  {
    console.log("Could not parse data");
    return;
  }
  gd = graph_data;
  // Look in the webpage for the chart id
  // Once found (t)is is a div) I have no idea
  // we then append an svg element to it with the 
  // appropriate graph.
  svg = d3.select("svg#graph_svg")
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


    var ks_l = get_keys(graph_data.links);
    $("#ls_select").empty();
    ks_l.forEach(function(n){$('#ls_select')
                              .append($('<option>',{n:n}).text(n));});
    $("#ld_select").empty();
    ks_l.forEach(function(n){$('#ld_select')
                              .append($('<option>',{n:n}).text(n));});

    var ks_n = get_keys(graph_data.nodes);
    $("#charge_select").empty();
    ks_n.forEach(function(n){$('#charge_select')
                              .append($('<option>',{n:n}).text(n));});

    $("#nc_select").empty();
    ks_n.forEach(function(n){$('#nc_select')
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

