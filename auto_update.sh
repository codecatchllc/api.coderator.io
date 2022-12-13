#!/bin/sh

if [ -z $1 ]; then
    echo "A valid repository path must be passed to this function";
    exit 1;
fi

if [ -z $2 ]; then
    echo "A valid systemd service name must be passed to this function";
    exit 1;
fi

changed=0
cd $1 && git remote update && git status -uno | grep -q 'Your branch is behind' && changed=1
if [ $changed = 1 ]; then
    sudo systemctl restart $2
    echo "Auto building now...";
else
    echo "Nothing to pull"
fi