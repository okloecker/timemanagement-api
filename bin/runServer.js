#!/bin/bash

# runs node.js with debug messages

INSPECT="--inspect"
# INSPECT=

export TZ="UTC"
export NODE_ENV=development
# export NODE_ENV=production
export PORT=3001
export DEBUG=tm:*,mongoist
export MONGODB_URL="localhost:27017/timemanagement"
nodemon ${INSPECT} . 
