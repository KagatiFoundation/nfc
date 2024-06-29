#!/bin/sh

tsc --outDir ./build ./main.ts
node ./build/main.js