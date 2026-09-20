#!/usr/bin/env sh
# Packs theme/ into hanan-theme.zip, ready for Shopify's
# Online Store → Themes → Add theme → Upload zip file.
#
# Shopify expects the theme's folders (assets, config, layout, locales,
# sections, snippets, templates) at the root of the zip, not inside a
# wrapper folder — so this zips from inside theme/, not from here.
#
# The zip is a build artifact and is not committed; rebuild it any time.
set -eu
cd "$(dirname "$0")/theme"
rm -f ../hanan-theme.zip
zip -rq ../hanan-theme.zip . -x '.*' -x '*/.*'
cd ..
echo "built hanan-theme.zip"
unzip -l hanan-theme.zip | tail -1
