#!/bin/bash

# runs ESLint each time a file changes or is added/deleted
source `dirname $0`/files
while true; do 
  ls ${files}  | entr -d npx eslint ${files}
  echo "ENTR RESTART"
  sleep 1
done
