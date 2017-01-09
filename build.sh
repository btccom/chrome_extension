#!/bin/bash

set -e

cd "$(dirname "$0")"

BASE=`pwd`
VERSION=`jq -r .version manifest.json`
OUTPUT_DIR="build_${VERSION}";

rm -rf "$OUTPUT_DIR" && mkdir "$OUTPUT_DIR"

npm run clean
./node_modules/.bin/webpack -p

cp -R build _locales fonts images lib config.js manifest.json "$OUTPUT_DIR"

( mkdir -p "$OUTPUT_DIR"/{components,components/popup,components/option};
  cp -r components/i18n.js components/lookup "$OUTPUT_DIR"/components
  cp components/option/option.html "$OUTPUT_DIR"/components/option/
  cp components/popup/popup.html "$OUTPUT_DIR"/components/popup/
)

echo "{
    \"version\": \"$VERSION\"
}" > "$OUTPUT_DIR"/LATEST