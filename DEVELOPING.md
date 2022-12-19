# Developing

For a development installation (requires [Node.js](https://nodejs.org) and [Yarn version 1](https://classic.yarnpkg.com/)),

    $ git clone https://github.com/ricklupton/ipysankeywidget.git
    $ cd ipysankeywidget
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --overwrite --sys-prefix ipysankeywidget
    $ jupyter nbextension enable --py --sys-prefix ipysankeywidget

Set up JS packages:

    $ cd js
    $ yarn install

When actively developing your extension for JupyterLab, run the command:

    $ jupyter labextension develop --overwrite ipysankeywidget

Then you need to rebuild the JS when you make a code change:

    $ cd js
    $ yarn run build

You then need to refresh the JupyterLab page when your javascript changes.
