/**
 * The browser-side counterpart to SankeyWidget
 *
 * @author Rick Lupton
 * @copyright Rick Lupton 2015
 * @version 0.1.0
 * @license BSD
 */

var d3 = require('d3');
var utils = require('./utils');
var sankeyDiagram = require('d3-sankey-diagram');


module.exports = function createView(widget) {
  var SankeyWidgetView = widget.DOMWidgetView.extend({
    // namespace your CSS so that you don't break other people's stuff
    className: 'ipysankeywidget SankeyWidgetView',
    loadCss: utils.loadCss,

    render: function(){

      // add a stylesheet, if defined in `_view_style`
      this.loadCss();

      var model = this.model;

      this.diagram = sankeyDiagram()
        .width(this.model.get('width'))
        .height(this.model.get('height'))
        .margins(this.model.get('margins'));

      this.diagram.on('selectNode', this.node_selected.bind(this));

      this.value_changed();
      this.model.on('change:value', this.value_changed, this);
      this.model.on('change:margins', this.margins_changed, this);
      this.model.on('change:slice_titles', this.titles_changed, this);
      this.model.on('msg:custom', this.handle_custom_message, this);
      // this.listenTo(this.model, 'msg:custom', $.proxy(this._handle_textarea_msg, this));

    },

    value_changed: function() {
      // clone so that cyclic references created by layout don't upset
      // ipywidgets' state-saving machinery.
      var value = this.model.get('value');

      console.log('value', value);

      var el = d3.select(this.$el[0])
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
      // el.selectAll('line')
      //   .style('stroke', 'black')
      //   .style('stroke-width', '1px');
      el.selectAll('rect')
        .style('fill', 'none');
    },

    margins_changed: function() {
      var margins = this.model.get('margins');
      this.diagram.margins(margins);
      var el = d3.select(this.$el[0])
            .call(this.diagram);
    },

    titles_changed: function() {
      var el = d3.select(this.$el[0])
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

  return SankeyWidgetView;
};
