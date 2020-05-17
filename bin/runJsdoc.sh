#!/bin/bash

# runs JSDoc and writes output to doc/index.html

source `dirname $0`/files
npx jsdoc ${files} -r -d doc
