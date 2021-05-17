#!/bin/bash

mkdir -p www && \
  cp -r ../platform/viewer/dist/* www/ && \
  gcloud app deploy

