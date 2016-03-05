#!/usr/bin/env python
# -*- coding: utf-8 -*-

from setuptools import (
    setup,
    find_packages,
)

try:
    from jupyterpip import cmdclass
except:
    import importlib
    import pip
    pip.main(['install', 'jupyter-pip'])
    cmdclass = importlib.import_module('jupyterpip').cmdclass


# load version without side-effects
__version__ = None
with open('ipysankeywidget/version.py') as f:
    exec(f.read())


setup(
    name='ipysankeywidget',
    version=__version__,
    description='IPython Sankey diagram widget',
    long_description=open('README.rst').read(),
    author='Rick Lupton',
    author_email='rcl33@cam.ac.uk',
    url='https://github.com/ricklupton/ipysankeywidget',
    packages=find_packages(include=['ipysankeywidget']),
    include_package_data=True,
    license='BSD',
    zip_safe=False,
    keywords='ipysankeywidget ipython jupyter sankey diagram widget',
    classifiers=[
        'Development Status :: 2 - Pre-Alpha',
        'Framework :: IPython',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Natural Language :: English',
        'Programming Language :: Python :: 2.6',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3',
        'Topic :: Software Development :: Widget Sets',
        "Programming Language :: Python :: 2",
    ],
    tests_require=[
        "nose",      # ???
    ],
    setup_requires=[
        "requests",  # ???
    ],
    install_requires=[
        "jupyter-pip",
    ],
    test_suite='nose.collector',
    cmdclass=cmdclass('ipysankeywidget/static/ipysankeywidget')
)
