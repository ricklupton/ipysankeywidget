import {SankeyModel, SankeyView, version} from './index';
import {IJupyterWidgetRegistry} from '@jupyter-widgets/base';

export const sankeyWidgetPlugin = {
  id: 'jupyter-sankey-widget:plugin',
  requires: [IJupyterWidgetRegistry],
  activate: function(app, widgets) {
      widgets.registerWidget({
          name: 'jupyter-sankey-widget',
          version: version,
          exports: { SankeyModel, SankeyView }
      });
  },
  autoStart: true
};

export default sankeyWidgetPlugin;
