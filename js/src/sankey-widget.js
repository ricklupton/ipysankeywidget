var widgets = require('jupyter-js-widgets');
var _ = require('underscore');

var select = require('d3-selection').select;
var d3Scale = require('d3-scale');
var d3Transition = require('d3-transition');

// var utils = require('./utils');
var sankeyDiagram = require('d3-sankey-diagram');
var saveSvgAsPng = require('save-svg-as-png');

var _serializer = new XMLSerializer();
var serialize = function(node){
  return '<?xml version="1.0" standalone="no"?>' +
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
    _serializer.serializeToString(node);
};

// Custom Model. Custom widgets models must at least provide default values
// for model attributes, including `_model_name`, `_view_name`, `_model_module`
// and `_view_module` when different from the base class.
//
// When serialiazing entire widget state for embedding, only values different from the
// defaults will be specified.
var SankeyModel = widgets.DOMWidgetModel.extend({
  defaults: _.extend({}, widgets.DOMWidgetModel.prototype.defaults, {
    _model_name : 'SankeyModel',
    _view_name : 'SankeyView',
    _model_module : 'jupyter-sankey-widget',
    _view_module : 'jupyter-sankey-widget',
    _model_module_version : '0.2.0',
    _view_module_version : '0.2.0',

    links: [],
    nodes: [],
    order: null,
    rank_sets: [],
    align_link_types: false,
    scale : null,
    margins : {},
    png : '',
    svg : '',
  })
});


// Custom View. Renders the widget model.
var SankeyView = widgets.DOMWidgetView.extend({
  render: function() {
    var color = d3Scale.scaleOrdinal(d3Scale.schemeCategory20);

    this.sankeyLayout = sankeyDiagram.sankeyLayout();

    this.diagram = sankeyDiagram.sankeyDiagram()
      .nodeTitle(function(d) { return d.data.title !== undefined ? d.data.title : d.id; })
      .linkTypeTitle(function(d) { return d.data.title; })
      .linkColor(function(d) { return d.data.color !== undefined ? d.data.color : color(d.data.type); });

    select(this.el).append('svg');

    this.diagram.on('selectNode', this.node_selected.bind(this));

    this.value_changed();
    this.model.on('change:layout change:links change:nodes change:order change:rank_sets change:align_link_types change:scale change:margins', this.value_changed, this);
    // this.model.on('change:links', this.value_changed, this);
    // this.model.on('change:nodes', this.value_changed, this);
    // this.model.on('change:order', this.value_changed, this);
    // this.model.on('change:rank_sets', this.value_changed, this);
    // this.model.on('change:align_link_types', this.value_changed, this);
    // this.model.on('change:scale', this.value_changed, this);
    // this.model.on('change:margins', this.value_changed, this);
    // this.model.on('change:slice_titles', this.titles_changed, this);
  },

  value_changed: function() {
    var that = this;

    var widgetLayout = this.model.get('layout'),
        width = parseInt(widgetLayout.get('width') || "600", 10),
        height = parseInt(widgetLayout.get('height') || "400", 10);

    var margins = _.extend({top: 10, bottom: 10, left: 100, right: 100},
                           this.model.get('margins'));

    // Set scale if defined; otherwise it will be set automatically
    this.sankeyLayout.scale(this.model.get('scale'));

    // Layout
    this.diagram.margins(margins);
    this.sankeyLayout
      .size([width - margins.left - margins.right, height - margins.top - margins.bottom]);
    // .edgeValue(function (d) { return d.data.values[i]; })

    var G = sankeyDiagram.graphify()(this.model.get('nodes'),
                                     this.model.get('links'));

    var order = this.model.get('order');
    if (order && order.length > 0) {
      G.ordering(order);
    } else {
      G.assignRanks(this.model.get('rank_sets'));
      G.sortNodes();
    }

    this.sankeyLayout.alignLinkTypes(this.model.get('align_link_types'));
    this.sankeyLayout(G);

    var el = select(this.el).select('svg')
        .datum(G)
        .transition()
        .duration(500)
        .call(this.diagram);

    this.model.set('scale', this.sankeyLayout.scale());

    // put default styles inline
    el.attr('width', width)
      .attr('height', height)
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .style('font-family',
             '"Helvetica Neue", Helvetica, Arial, sans-serif');

    el.selectAll('.link')
      .style('opacity', 0.8);

    el.selectAll('line')
      .style('stroke', function(d) { return style(d) === 'process' ? '#888' : '#000'; })
      .style('stroke-width', function(d) { return style(d) === 'process' ? '4px' : '1px'; });

    el.selectAll('rect')
      .style('fill', 'none');

    el.selectAll('.group').select('rect')
      .style('fill', '#eee')
      .style('stroke', '#bbb')
      .style('stroke-width', '0.5');

    el.selectAll('.group').select('text')
      .style('fill', '#999');

    // get svg - after a delay, so animations have finished
    setTimeout(function() {
      saveSvgAsPng.svgAsPngUri(el.node(), {}, function(uri) {
        that.model.set('png', uri.slice(22));
        that.touch();
      });

      // create a file blob of our SVG.
      that.model.set('svg', serialize(el.node()));
      that.touch();
    }, 800);
  },

  // margins_changed: function() {
  //   var margins = this.model.get('margins');
  //   this.diagram.margins(margins);
  //   var el = d3.select(this.el)
  //         .call(this.diagram);
  // },

  titles_changed: function() {
    var el = select(this.el)
          .call(this.diagram);
  },

  node_selected: function(node) {
    this.send({event: 'selected', node: (node ? {id: node.id} : null)});
  },
});


function style(d) {
  return (d.data || {}).style;
}


module.exports = {
    SankeyModel : SankeyModel,
    SankeyView: SankeyView
};
