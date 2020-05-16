#!/bin/bash

# runs node.js with debug messages

INSPECT="--inspect"
INSPECT=

DEBUG=tm:* nodemon ${INSPECT} . 
