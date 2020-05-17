#!/bin/bash

# runs node.js with debug messages

INSPECT="--inspect"
INSPECT=

export NODE_ENV=development
export DEBUG=tm:* 
nodemon ${INSPECT} . 
