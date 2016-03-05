;(function(require, define) {
  'use strict';
  /**
   * The browser-side counterpart to SankeyWidget
   *
   * @author Rick Lupton
   * @copyright Rick Lupton 2015
   * @version 0.1.0
   * @license BSD
   */

  define([
    // ipython API
    'widgets/js/widget',

    // local imports
    './view',
  ], function(widget, createView) {
    console.log('LOADED', widget, createView);
    return {
      SankeyWidgetView: createView(widget),
    };
  });
}).call(this, require, define);
