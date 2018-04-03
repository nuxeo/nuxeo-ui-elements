#!/bin/bash -

set -e

VERSION=$1
if [ -z "$VERSION" ]; then
  echo 'Usage: ./doc.sh VERSION'
  exit 1
fi

git checkout v$VERSION

# generate doc
npm run doc
cp -r doc /tmp/nuxeo.js-doc
git checkout gh-pages
# copy doc for the released version
cp -r /tmp/nuxeo.js-doc $VERSION
# copy doc for the latest version
rm -rf latest
cp -r /tmp/nuxeo.js-doc latest

git add $VERSION
git add latest
git commit -m "Add documentation for release $VERSION"
git push origin gh-pages

rm -r /tmp/nuxeo.js-doc
