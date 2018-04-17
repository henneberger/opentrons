SHELL := /bin/bash

# add yarn CLI dev deps to PATH (for cross platform POSIX commands via shx)
PATH := $(shell cd .. && yarn bin):$(PATH)

python := pipenv run python
pipenv_opts := --dev
pipenv_opts += $(and $(CI),--ignore-pipfile)

.PHONY: install
install:
	pipenv install $(pipenv_opts)

.PHONY: clean
clean:
	shx rm -rf \
		build \
		dist \
		.coverage \
		coverage.xml \
		'*.egg-info' \
		'**/__pycache__' \
		'**/*.pyc'

.PHONY: test
test:
	$(python) -m pytest \
		--cov=opentrons \
		--cov-report term-missing:skip-covered \
		--cov-report xml:coverage.xml \
		tests

.PHONY: lint
lint:
	$(python) -m pylama opentrons tests

.PHONY: dev
dev:
	$(python) -m ot2update

.PHONY: wheel
wheel: clean
	$(python) setup.py bdist_wheel
	shx rm -rf build
	shx ls dist
