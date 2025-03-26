## Development

We recommend using [uv](https://github.com/astral-sh/uv) for development. It will automatically manage virtual environments and dependencies for you.

```sh
ANYWIDGET_HMR=1 uv run jupyter lab examples/Simple\ example.ipynb
```

Alternatively, create and manage your own virtual environment:

```sh
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
ANYWIDGET_HMR=1 jupyter lab examples/Simple\ example.ipynb
```

The widget front-end code bundles it's JavaScript dependencies. After setting up Python, make sure to install these dependencies locally:

```sh
npm install
```

While developing, you can run the following in a separate terminal to automatically rebuild JavaScript as you make changes:

```sh
npm run dev
```

Open `examples/Simple example.ipynb` in JupyterLab, VS Code, or your favorite editor to start developing. Changes made in `js/` will be reflected in the notebook (note, the environment variable `ANYWIDGET_HMR=1` shown above is needed to enable this).
