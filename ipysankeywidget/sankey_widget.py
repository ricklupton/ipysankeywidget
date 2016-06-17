import base64

import ipywidgets as widgets
from traitlets import Unicode, Dict, CInt


class SankeyWidget(widgets.DOMWidget):
    """Sankey widget"""
    _view_name = Unicode('SankeyView').tag(sync=True)
    _model_name = Unicode('SankeyModel').tag(sync=True)
    _view_module = Unicode('jupyter-sankey-widget').tag(sync=True)
    _model_module = Unicode('jupyter-sankey-widget').tag(sync=True)

    value = Dict({}).tag(sync=True)

    margins = Dict({}).tag(sync=True)

    # Get image data back
    png = Unicode('').tag(sync=True)

    def __init__(self, **kwargs):
        """Constructor"""
        super(SankeyWidget, self).__init__(**kwargs)
        self._selected_handlers = widgets.CallbackDispatcher()
        self._auto_png_filename = None
        self.on_msg(self._handle_sankey_msg)
        self.observe(self._on_png_data, names=['png'])

    def on_selected(self, callback, remove=False):
        """Register a callback to execute when a node is selected.

        The callback will be called with one argument,
        the Sankey widget instance.

        Parameters
        ----------
        remove : bool (optional)
            Set to true to remove the callback from the list of callbacks."""
        self._selected_handlers.register_callback(callback, remove=remove)

    def _handle_sankey_msg(self, _, content, buffers):
        """Handle a msg from the front-end.

        Parameters
        ----------
        content: dict
            Content of the msg."""
        if content.get('event', '') == 'selected':
            self._selected_handlers(self, content.get('node'))

    def _on_png_data(self, change):
        if change['type'] != 'change': return
        if self._auto_png_filename:
            self.save_png(self._auto_png_filename)
            self._auto_png_filename = None

    def set_scale(self, scale=None):
        self.send({"method": "set_scale", "value": scale})

    def save_png(self, filename):
        data = base64.decodebytes(bytes(self.png, 'ascii'))
        with open(filename, 'wb') as f:
            f.write(data)

    def auto_save_png(self, filename):
        self._auto_png_filename = filename
        return self
