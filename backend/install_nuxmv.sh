#!/bin/bash

url="https://nuxmv.fbk.eu/theme/download.php?file=nuXmv-2.0.0-linux64.tar.gz"
destination="nuXmv/nuXmv-2.0.0-Linux/"

mkdir -p "$destination"
echo "Downloading nuXmv..."
wget -O nuXmv.tar.gz "$url"
echo "Unpacking nuXmv..."
tar -xzvf nuXmv.tar.gz -C "$destination" --strip-components=1
rm nuXmv.tar.gz
echo "Done. nuXmv is installed in $destination"
