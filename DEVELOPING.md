# Development installation

For a development installation (requires npm),

    $ git clone https://github.com/ricklupton/ipysankeywidget.git
    $ cd ipysankeywidget
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --sys-prefix ipysankeywidget
    $ jupyter nbextension enable --py --sys-prefix widgetsnbextension   # <-- you might have already done this,
    $ jupyter nbextension enable --py --sys-prefix ipysankeywidget
    $ jupyter labextension install js @jupyter-widgets/jupyterlab-manager
    
When actively developing your extension, build Jupyter Lab with the command:

    $ jupyter lab --watch

This take a minute or so to get started, but then allows you to hot-reload your
javascript extension. To see a change, save your javascript, watch the terminal
for an update.

Note on first `jupyter lab --watch`, you may need to touch a file to get Jupyter
Lab to open.
