# Compass website

This website's purpose is to demo Compass's PR reviewer tool for IBM BOB Hack

## Get Compass setup

The homepage now includes a provider selector, validated repository settings links,
and the downloadable `assets/compass-auto.yml` workflow. No credentials are collected.
Use the reviewed full Compass commit SHA shown on the homepage when
configuring the workflow. Enabling COMPASS_ENABLED authorizes paid analysis.

For Vercel, import this static folder/repository with framework preset Other, no
build command, and the project root as output. No model secrets are needed on Vercel.
