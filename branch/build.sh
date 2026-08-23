#!/bin/sh
# Wrap the artifact-format source (no html/head/body tags) into a
# standalone document for local use. Splits at the first markup line.
awk '
  BEGIN{ head=1
    print "<!doctype html>"; print "<html lang=\"en\">"; print "<head>"
    print "<meta charset=\"utf-8\">"
    print "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">"
    print "<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">"
    print "<meta name=\"mobile-web-app-capable\" content=\"yes\">"
    print "<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black-translucent\">"
    print "<meta name=\"apple-mobile-web-app-title\" content=\"BRANCH\">"
    print "<meta name=\"theme-color\" content=\"#000000\">"
    print "<link rel=\"manifest\" href=\"manifest.webmanifest\">" }
  /^<div id="stage">/ && head { print "</head>"; print "<body>"; head=0 }
  { print }
  END{ print "</body>"; print "</html>" }
' src/page.html > index.html
