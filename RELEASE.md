- To release a new version of ipysankeywidget on PyPI:

Update _version.py (set release version, remove 'dev')
git add and git commit
python setup.py sdist
python setup.py bdist_wheel
twine upload dist/...
git tag -a X.X.X -m 'comment'
Update _version.py (add 'dev' and increment minor)
git add and git commit
git push
git push --tags

- To release a new version of jupyter-sankey-widget on NPM:

git clean -fdx   # nuke the  `dist` and `node_modules`
cd js
npm install
npm publish
