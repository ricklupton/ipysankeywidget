# IPython Sankey diagram widget

Display Sankey diagrams in IPython / Jupyter notebook using [d3-sankey-diagram](https://github.com/ricklupton/d3-sankey-diagram).

Installation
------------

To install use pip:

    $ pip install ipysankeywidget
    $ jupyter nbextension enable --py --sys-prefix ipysankeywidget


For a development installation (requires npm),

    $ git clone https://github.com/ricklupton/ipysankeywidget.git
    $ cd ipysankeywidget
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --user ipysankeywidget
    $ jupyter nbextension enable --py --user ipysankeywidget
    
Documentation
-------------

See the
[d3-sankey-diagram API docs](https://github.com/ricklupton/d3-sankey-diagram/wiki):
the `value` of the `SankeyWidget` is exactly the same as the `sankey` object
described there.

Examples
--------

See notebooks in examples folder for usage:
- [Basic usage](https://github.com/ricklupton/ipysankeywidget/blob/master/examples/SankeyWidget%20Example.ipynb)
- [More examples](https://github.com/ricklupton/ipysankeywidget/blob/master/examples/More%20examples.ipynb)
