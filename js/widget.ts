import type { RenderProps } from "@anywidget/types";

import { select } from 'd3-selection';
import { scaleOrdinal, schemeCategory20 } from 'd3-scale';
// Is the import important? Not used
import * as d3Transition from 'd3-transition';
import { format } from 'd3-format';

import { sankeyLinkTitle, sankey, sankeyDiagram } from 'd3-sankey-diagram';
import { svgAsPngUri } from 'save-svg-as-png';

import "./widget.css";

/* Specifies attributes defined with traitlets in ../src/ipysankeywidget/__init__.py */
interface WidgetModel {
	links: any[];
	nodes: any[];
	order: any | null;
	groups: any[];
	align_link_types: boolean;
	scale: number | null;
	margins: any;
	png: string;  // binary?
	svg: string;  // binary?
	linkLabelFormat: string;
	linkLabelMinWidth: number;
	node_position_attr: string | null;
}

var _serializer = new XMLSerializer();
var serialize = function(node){
  return '<?xml version="1.0" standalone="no"?>' +
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
    _serializer.serializeToString(node);
};

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

var color = scaleOrdinal(schemeCategory20);
function linkColor(d) {
  return d.color !== undefined ? d.color : color(d.type);
}

var fmt = format('.3s');

var linkTitle = sankeyLinkTitle(nodeTitle, linkTypeTitle, fmt);

function render({ model, el }: RenderProps<WidgetModel>) {
  let sankeyLayout = sankey();

  let diagram = sankeyDiagram()
    .nodeTitle(nodeTitle)
    .linkTitle(linkTitle)
    .linkColor(linkColor);

  select(el).append('svg');
  select(el).append('div').attr('class', 'sankey-element-info');

  function value_changed() {
    var widgetLayout = model.get('layout'),
    width = parseInt(widgetLayout.get('width') || "600", 10),
    height = parseInt(widgetLayout.get('height') || "400", 10);

    var margins = {top: 10, bottom: 10, left: 100, right: 100, ...model.get('margins')};

    // Link format string
    var linkFmtStr = model.get('linkLabelFormat'),
    linkMinWidth = model.get('linkLabelMinWidth'),
    linkFmt = linkFmtStr ? format(linkFmtStr) : function(value) { return null; };

    diagram.linkLabel(function(d) {
      return d.dy > linkMinWidth ? linkFmt(d.value) : null;
    });

    // Set scale if defined; otherwise it will be set automatically
    sankeyLayout.scale(model.get('scale'));

    // Layout
    var order = model.get('order');
    diagram
      .margins(margins)
      .groups(model.get('groups'));
    sankeyLayout
      .size([width - margins.left - margins.right, height - margins.top - margins.bottom])
      .ordering(order && order.length ? order : null)
      .rankSets(model.get('rank_sets'));

    alignLinkTypes(sankeyLayout, model.get('align_link_types'));

    // Manual positions?
    var node_position_attr = model.get('node_position_attr');
    if (node_position_attr) {
      sankeyLayout.nodePosition(d => d[node_position_attr]);
      // Set scale if not already set -- it will not be automatically set when
      // using manual layout.
      if (!sankeyLayout.scale()) {
        sankeyLayout.scale(1);
      }
    } else {
      sankeyLayout.nodePosition(null);
    }

    var graph = sankeyLayout({
      nodes: JSON.parse(JSON.stringify(model.get('nodes'))),
      links: JSON.parse(JSON.stringify(model.get('links'))),
    });

    var svg = select(el)
      .select('svg')
      .datum(graph)
      .transition()
      .duration(500)
      .call(diagram);

    model.set('scale', sankeyLayout.scale());

    // put default styles inline
    svg.attr('width', width)
      .attr('height', height)
      .attr('viewBox', '0 0 ' + width + ' ' + height)
      .style('font-family',
             '"Helvetica Neue", Helvetica, Arial, sans-serif');

    svg.selectAll('.link')
      .style('opacity', 0.8);

    // Experimental support for overlaying marks on links
    var scale = sankeyLayout.scale();
    svg.selectAll('.link')
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

    svg.selectAll('line')
      .style('stroke', function(d) { return d.style === 'process' ? '#888' : '#000'; })
      .style('stroke-width', function(d) { return d.style === 'process' ? '4px' : '1px'; });

    svg.selectAll('rect')
      .style('fill', 'none');

    svg.selectAll('.group').select('rect')
      .style('fill', '#eee')
      .style('stroke', '#bbb')
      .style('stroke-width', '0.5');

    svg.selectAll('.group').select('text')
      .style('fill', '#999');

    // get svg - after a delay, so animations have finished
    setTimeout(function() {
      svgAsPngUri(svg.node(), {}, function(uri) {
        model.set('png', uri.slice(22));
        model.save_changes();
      });

      // create a file blob of our SVG.
      model.set('svg', serialize(svg.node()));
      model.save_changes();
    }, 800);
  }

  function titles_changed() {
    select(el)
      .call(diagram);
  }

  function node_clicked (d) {
    var node = d ? {id: d.id} : null;
    model.send({event: 'node_clicked', node: node});
  }

  function link_clicked(d) {
    var link = d ? {source: d.source.id, target: d.target.id, type: d.type, value: d.value} : null;
    model.send({event: 'link_clicked', link: link});

    // Experimental support for showing info
    var show_info_html = model.get('show_link_info_html')
    var infoEl = select(el).select('.sankey-element-info');
    if (show_info_html && d && d.info_html) {
      infoEl.html(d.info_html);
    } else {
      infoEl.html('');
    }
  }
  diagram.on('selectNode', node_clicked);
  diagram.on('selectLink', link_clicked);

  value_changed();

  // Observe and act on future changes to the attributes
  model.on('change:layout change:links change:nodes change:order change:groups change:rank_sets ' +
    'change:align_link_types change:scale change:margins change:linkLabelFormat ' +
    'change:linkLabelMinWidth change:node_position_attr',
           value_changed);

	el.classList.add("ipysankeywidget");
}

export default { render };
