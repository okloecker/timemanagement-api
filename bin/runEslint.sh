#!/bin/bash

# runs ESLint each time a file changes or is added/deleted
while true; do 
  ls  routes/*js errors/*js validations/*js | entr -d npx eslint . 
  echo "ENTR RESTART"
  sleep 1
done
