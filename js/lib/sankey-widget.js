var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');

var semver_range = '~' + require('../package.json').version;

var select = require('d3-selection').select;
var d3Scale = require('d3-scale');
var d3Transition = require('d3-transition');
var d3Format = require('d3-format');

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
// for model attributes, including
//
//  - `_view_name`
//  - `_view_module`
//  - `_view_module_version`
//
//  - `_model_name`
//  - `_model_module`
//  - `_model_module_version`
//
//  when different from the base class.
var SankeyModel = widgets.DOMWidgetModel.extend({
  defaults: _.extend({}, widgets.DOMWidgetModel.prototype.defaults(), {
    _model_name : 'SankeyModel',
    _view_name : 'SankeyView',
    _model_module : 'jupyter-sankey-widget',
    _view_module : 'jupyter-sankey-widget',
    _model_module_version : semver_range,
    _view_module_version : semver_range,

    links: [],
    nodes: [],
    order: null,
    groups: [],
    rank_sets: [],
    align_link_types: false,
    scale : null,
    margins : {},
    png : '',
    svg : '',
    linkLabelFormat: '',
    linkLabelMinWidth: 5,
  })
});

function alignLinkTypes(layout, align) {
  return layout
    .sourceId(function(d) { return { id: typeof d.source === "object" ? d.source.id : d.source,
                                     port: align ? d.type : null }; })
    .targetId(function(d) { return { id: typeof d.target === "object" ? d.target.id : d.target,
                                     port: align ? d.type : null }; });
}

function nodeTitle(d) {
  return d.title !== undefined ? d.title : d.id;
}

function linkTypeTitle(d) {
  return d.title !== undefined ? d.title : d.type;
}

var color = d3Scale.scaleOrdinal(d3Scale.schemeCategory20);
function linkColor(d) {
  return d.color !== undefined ? d.color : color(d.type);
}

var fmt = d3Format.format('.3s');

var linkTitle = sankeyDiagram.sankeyLinkTitle(nodeTitle, linkTypeTitle, fmt);

// Custom View. Renders the widget model.
var SankeyView = widgets.DOMWidgetView.extend({
  render: function() {
    // var color = d3Scale.scaleOrdinal(d3Scale.schemeCategory20);

    this.sankeyLayout = sankeyDiagram.sankey();

    this.diagram = sankeyDiagram.sankeyDiagram()
      .nodeTitle(nodeTitle)
      .linkTitle(linkTitle)
      .linkColor(linkColor);

    select(this.el).append('svg');
    select(this.el).append('div').attr('class', 'sankey-element-info');

    this.diagram.on('selectNode', this.node_clicked.bind(this));
    this.diagram.on('selectLink', this.link_clicked.bind(this));

    this.value_changed();
    this.model.on('change:layout change:links change:nodes change:order change:groups change:rank_sets ' +
                  'change:align_link_types change:scale change:margins change:linkLabelFormat ' +
                  'change:linkLabelMinWidth',
                  this.value_changed, this);
  },

  value_changed: function() {
    var that = this;

    var widgetLayout = this.model.get('layout'),
        width = parseInt(widgetLayout.get('width') || "600", 10),
        height = parseInt(widgetLayout.get('height') || "400", 10);

    var margins = _.extend({top: 10, bottom: 10, left: 100, right: 100},
                           this.model.get('margins'));

    // Link format string
    var linkFmtStr = this.model.get('linkLabelFormat'),
        linkMinWidth = this.model.get('linkLabelMinWidth'),
        linkFmt = linkFmtStr ? d3Format.format(linkFmtStr) : function(value) { return null; };

    this.diagram.linkLabel(function(d) {
      return d.dy > linkMinWidth ? linkFmt(d.value) : null;
    });

    // Set scale if defined; otherwise it will be set automatically
    this.sankeyLayout.scale(this.model.get('scale'));

    // Layout
    var order = this.model.get('order');
    this.diagram
      .margins(margins)
      .groups(this.model.get('groups'));
    this.sankeyLayout
      .size([width - margins.left - margins.right, height - margins.top - margins.bottom])
      .ordering(order && order.length ? order : null)
      .rankSets(this.model.get('rank_sets'));

    alignLinkTypes(this.sankeyLayout, this.model.get('align_link_types'));

    var graph = this.sankeyLayout({
      nodes: JSON.parse(JSON.stringify(this.model.get('nodes'))),
      links: JSON.parse(JSON.stringify(this.model.get('links'))),
    });

    var el = select(this.el)
        .select('svg')
        .datum(graph)
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

    // Experimental support for overlaying marks on links
    var scale = this.sankeyLayout.scale();
    el.selectAll('.link')
      .selectAll('.link-marker')
      .selection()  // XXX why can't I call this on the transition?
      .data(d => d.marker ? [d] : [])
      .join('path')
      .attr('class', 'link-marker')
      .style('stroke', 'black')
      .style('fill', 'none')
      .style('opacity', 0.8)
      .attr('transform', d => `translate(${d.points[0].x + 10}, ${d.points[0].y})`)
      .attr('d', d => `M-4,-${d.marker/2*scale} l8,0 m-4,0 l0,${d.marker*scale} m-4,0 l8,0`)

    el.selectAll('line')
      .style('stroke', function(d) { return d.style === 'process' ? '#888' : '#000'; })
      .style('stroke-width', function(d) { return d.style === 'process' ? '4px' : '1px'; });

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

  node_clicked: function(d) {
    var node = d ? {id: d.id} : null;
    this.send({event: 'node_clicked', node: node});
  },

  link_clicked: function(d) {
    var link = d ? {source: d.source.id, target: d.target.id, type: d.type, value: d.value} : null;
    this.send({event: 'link_clicked', link: link});

    // Experimental support for showing info
    var show_info_html = this.model.get('show_link_info_html')
    var el = select(this.el).select('.sankey-element-info');
    if (show_info_html && d && d.info_html) {
      el.html(d.info_html);
    } else {
      el.html('');
    }
  },
});


module.exports = {
    SankeyModel : SankeyModel,
    SankeyView: SankeyView
};
