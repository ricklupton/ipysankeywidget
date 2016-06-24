var widgets = require('jupyter-js-widgets');
var _ = require('underscore');

var d3 = require('d3');
window.d3 = d3;  // for d3-sankey-diagram

// var utils = require('./utils');
var sankeyDiagram = require('d3-sankey-diagram');
var saveSvgAsPng = require('save-svg-as-png');

var _serializer = new XMLSerializer();
var serialize = function(node){
  return '<?xml version="1.0" standalone="no"?>'
    + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
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
    value : {},
    margins : {},
    png : '',
    svg : '',
  })
});


// Custom View. Renders the widget model.
var SankeyView = widgets.DOMWidgetView.extend({
  render: function() {
    var layout = this.model.get('layout'),
        width = parseInt(layout.get('width') || "600", 10),
        height = parseInt(layout.get('height') || "400", 10);

    var color = d3.scale.category20();

    this.diagram = sankeyDiagram()
      .width(width)
      .height(height)
      .margins(this.model.get('margins'))
      .nodeTitle(function(d) { return d.data.title !== undefined ? d.data.title : d.id; })
      .linkTypeTitle(function(d) { return d.data.title; })
      .linkColor(function(d) { return d.data.color !== undefined ? d.data.color : color(d.data.type); });

    this.diagram.on('selectNode', this.node_selected.bind(this));

    this.value_changed();
    this.model.on('change:value', this.value_changed, this);
    this.model.on('change:margins', this.margins_changed, this);
    this.model.on('change:slice_titles', this.titles_changed, this);
    this.model.on('msg:custom', this.handle_custom_message, this);
  },

  value_changed: function() {
    var value = this.model.get('value');

    var layout = this.model.get('layout'),
        width = parseInt(layout.get('width') || "600", 10),
        height = parseInt(layout.get('height') || "400", 10);

    var el = d3.select(this.el)
          .datum(value)
          .call(this.diagram);

    // put default styles inline
    el.select('svg')
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .style('font-family',
             '"Helvetica Neue", Helvetica, Arial, sans-serif');

    el.selectAll('.link')
      .style('opacity', 0.8);

    el.selectAll('line')
      .style('stroke', d => style(d) === 'process' ? '#888' : '#000')
      .style('stroke-width', d => style(d) === 'process' ? '4px' : '1px');

    el.selectAll('rect')
      .style('fill', 'none');

    el.selectAll('.group').select('rect')
      .style('fill', '#eee')
      .style('stroke', '#bbb')
      .style('stroke-width', '0.5');

    el.selectAll('.group').select('text')
      .style('fill', '#999');

    // get svg - after a delay, so animations have finished
    setTimeout(() => {
      saveSvgAsPng.svgAsPngUri(el.select('svg').node(), {}, (uri) => {
        this.model.set('png', uri.slice(22));
        this.touch();
      });

      // create a file blob of our SVG.
      this.model.set('svg', serialize(el.select('svg').node()));
      this.touch();
    }, 800);
  },

  margins_changed: function() {
    var margins = this.model.get('margins');
    this.diagram.margins(margins);
    var el = d3.select(this.el)
          .call(this.diagram);
  },

  titles_changed: function() {
    var el = d3.select(this.el)
          .call(this.diagram);
  },

  node_selected: function(node) {
    this.send({event: 'selected', node: (node ? {id: node.id} : null)});
  },

  handle_custom_message: function(content) {
    if (content.method === "set_scale") {
      this.diagram.scale(content.value);
      this.value_changed();
    }
  },
});


function style(d) {
  return (d.data || {}).style;
}


module.exports = {
    SankeyModel : SankeyModel,
    SankeyView: SankeyView
};
