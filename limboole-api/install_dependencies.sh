#!/bin/bash

url="https://fmv.jku.at/limboole/limbooleAPE.exe"
destination="lib/"

mkdir -p "$destination"
echo "Downloading limboole..."
curl -o ${destination}limbooleAPE.exe $url
chmod +x "$destination"limbooleAPE.exe
echo "Done!"
