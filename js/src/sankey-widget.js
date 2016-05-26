var widgets = require('jupyter-js-widgets');
var _ = require('underscore');

var d3 = require('d3');
window.d3 = d3;  // for d3-sankey-diagram

// var utils = require('./utils');
var sankeyDiagram = require('d3-sankey-diagram');
var saveSvgAsPng = require('save-svg-as-png');

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
    width : 900,
    height : 500,
    margins : {},
    png : '',
  })
});


// Custom View. Renders the widget model.
var SankeyView = widgets.DOMWidgetView.extend({
  render: function() {
    // // add a stylesheet, if defined in `_view_style`
    // this.loadCss();

    var model = this.model;

    var color = d3.scale.category20();

    this.diagram = sankeyDiagram()
      .width(this.model.get('width'))
      .height(this.model.get('height'))
      .margins(this.model.get('margins'))
      .nodeTitle(function(d) { return d.data.title !== undefined ? d.data.title : d.id; })
      .materialTitle(function(d) { return d.data.title; })
      .linkColor(function(d) { return d.data.color !== undefined ? d.data.color : color(d.data.material); });

    this.diagram.on('selectNode', this.node_selected.bind(this));

    this.value_changed();
    this.model.on('change:value', this.value_changed, this);
    this.model.on('change:margins', this.margins_changed, this);
    this.model.on('change:slice_titles', this.titles_changed, this);
    this.model.on('msg:custom', this.handle_custom_message, this);
  },

  value_changed: function() {
    var value = this.model.get('value');

    var el = d3.select(this.el)
          .datum(value)
          .call(this.diagram);

    // put default styles inline
    el.select('svg')
      .attr('viewBox', '0 0 ' + this.model.get('width') +
            ' ' + this.model.get('height'))
      .style('font-family',
             '"Helvetica Neue", Helvetica, Arial, sans-serif');

    el.selectAll('.link')
    // .style('fill', '#333')
      .style('opacity', 0.5);
    el.selectAll('line')
      .style('stroke', 'black')
      .style('stroke-width', '1px');
    el.selectAll('rect')
      .style('fill', 'none');

    // get svg - after a delay, so animations have finished
    setTimeout(() => {
      saveSvgAsPng.svgAsPngUri(el.select('svg').node(), {}, (uri) => {
        this.model.set('png', uri.slice(22));
        this.touch();
      });
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


module.exports = {
    SankeyModel : SankeyModel,
    SankeyView: SankeyView
};
