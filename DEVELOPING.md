## Development

We recommend using [uv](https://github.com/astral-sh/uv) for development. It will automatically manage virtual environments and dependencies for you.

```sh
uv run jupyter lab examples/Simple\ example.ipynb
```

Alternatively, create and manage your own virtual environment:

```sh
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
jupyter lab examples/Simple\ example.ipynb
```

The widget front-end code bundles it's JavaScript dependencies. After setting up Python, make sure to install these dependencies locally:

```sh
npm install
```

Note: while npm should work, on Mac OS it encountered errors install fsevents; using yarn via `uv run jlpm` was able to successfully install the dependencies.

While developing, you can run the following in a separate terminal to automatically rebuild JavaScript as you make changes:

```sh
npm run dev
```

Open `examples/Simple example.ipynb` in JupyterLab, VS Code, or your favorite editor to start developing. Changes made in `js/` will be reflected in the notebook.
