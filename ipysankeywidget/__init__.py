from ._version import version_info, __version__

from .sankey_widget import *

def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'static',
        'dest': 'jupyter-sankey-widget',
        'require': 'jupyter-sankey-widget/extension'
    }]
