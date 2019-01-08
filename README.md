# IPython Sankey diagram widget [![Binder](https://mybinder.org/badge.svg)](https://mybinder.org/v2/gh/ricklupton/ipysankeywidget/master?filepath=examples)

Display Sankey diagrams in IPython / Jupyter notebook using [d3-sankey-diagram](https://github.com/ricklupton/d3-sankey-diagram).

Installation
------------

**Prerequesites**: You need to have installed and enabled [`ipywidgets`](https://github.com/jupyter-widgets/ipywidgets). If installing with pip, make sure to have enabled it by running `jupyter nbextension enable --py --sys-prefix widgetsnbextension`. Installing using conda does this automatically.

To install using pip:

    $ pip install ipysankeywidget
    $ jupyter nbextension enable --py --sys-prefix ipysankeywidget
    
To install using conda:

    $ conda install -c big_cake ipysankeywidget

For a development installation (requires npm),

    $ git clone https://github.com/ricklupton/ipysankeywidget.git
    $ cd ipysankeywidget
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --user ipysankeywidget
    $ jupyter nbextension enable --py --user ipysankeywidget
    
Browser support
---------------

Tested in Firefox and Chrome. [There have been reports](https://github.com/ricklupton/ipysankeywidget/issues/2) that it's not working in Safari.
    
Documentation
-------------

See the
[d3-sankey-diagram API docs](https://github.com/ricklupton/d3-sankey-diagram/wiki):
the `value` of the `SankeyWidget` is exactly the same as the `sankey` object
described there.

To change the figure size, use the ipywidgets Layout object:

```python
layout = Layout(width="1000", height="1200")
SankeyWidget(links=data, layout=layout)
```

Examples
--------

See notebooks in examples folder for usage examples. You can try these online
using
[Binder](https://mybinder.org/v2/gh/ricklupton/ipysankeywidget/master?filepath=examples), or follow the links to static versions on nbviewer:
- [Simple example](http://nbviewer.jupyter.org/github/ricklupton/ipysankeywidget/blob/master/examples/Simple%20example.ipynb)
- [Advanced examples](http://nbviewer.jupyter.org/github/ricklupton/ipysankeywidget/blob/master/examples/More%20examples.ipynb)
- [Linking and Layout](http://nbviewer.jupyter.org/github/ricklupton/ipysankeywidget/blob/master/examples/Linking%20and%20Layout.ipynb)
- [Exporting Images](http://nbviewer.jupyter.org/github/ricklupton/ipysankeywidget/blob/master/examples/Exporting%20Images.ipynb)

Changelog
-----------

## Unreleased

- ipysankeywidget can now be installed using conda (thanks to Ali Alsabbah #33)
- Add a check for duplicate links (thanks to Remi Bois #23)

## v0.2.4

- Add events for clicking on nodes and links: `on_node_clicked` and
  `on_link_clicked`. These replace the `on_selected` event.

Contributors
------------

- Nicholas Bollweg
- Ali Alsabbah
- Remi Bois
- Miguel Mendez
