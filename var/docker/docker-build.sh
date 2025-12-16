#!/bin/bash

# Build the docker image locally
docker build -f Dockerfile.dev -t postiz-app:latest .
