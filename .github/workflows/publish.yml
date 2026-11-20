name: Publish Extension

on:
  workflow_dispatch:
  push:
    branches:
      - main

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    if: github.event_name == 'workflow_dispatch'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npx @vscode/vsce publish --oidc
