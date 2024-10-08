#!/bin/bash

url="https://nuxmv.fbk.eu/theme/download.php?file=nuXmv-2.0.0-linux64.tar.gz"
destination="lib/"

mkdir -p "$destination"
echo "Downloading nuXmv..."
wget -O nuXmv.tar.gz "$url"
echo "Unpacking nuXmv..."
mkdir -p $destination/tmp
tar -xzvf nuXmv.tar.gz -C $destination/tmp --strip-components=1
mv "$destination/tmp/bin/nuXmv" "$destination"
rm nuXmv.tar.gz
rm -r $destination/tmp
echo "Done. nuXmv Linux is downloaded in $destination"
