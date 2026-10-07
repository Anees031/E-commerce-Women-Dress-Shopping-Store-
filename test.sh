#!/bin/sh

echo "=============================="
echo "Running Women Shopping Cart tests"
echo "=============================="

if [ ! -f "index.html" ]; then
    echo "ERROR: index.html not found"
    exit 1
fi

if [ ! -f "script.js" ]; then
    echo "ERROR: script.js not found"
    exit 1
fi

if [ ! -f "styles.css" ]; then
    echo "ERROR: styles.css not found"
    exit 1
fi

echo "Checking JavaScript syntax..."

node --check script.js

if [ $? -ne 0 ]; then
    echo "ERROR: JavaScript syntax check failed"
    exit 1
fi

echo "=============================="
echo "ALL TESTS PASSED"
echo "=============================="

exit 0