# -*- coding: utf-8 -*-

__author__ = 'Rick Lupton'
__email__ = 'rcl33@cam.ac.uk'

from .widget_nbsankey import SankeyWidget

# Jupyter Extension points
def _jupyter_nbextension_paths():
    return [dict(
        section="notebook",
        # the path is relative to the `ipysankeywidget` directory
        src="static/ipysankeywidget",
        # directory in the `nbextension/` namespace
        dest="ipysankeywidget",
        # _also_ in the `nbextension/` namespace
        require="ipysankeywidget/js/view")]
