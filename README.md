dokuwikietherpadlite
====================

Etherpad-Lite plugin for dokuwiki

Edit using Etherpad-Lite

All documentation for this plugin can be found at
https://github.com/michael-dev/dokuwikietherpadlite

If you install this plugin manually, make sure it is installed in
lib/plugins/etherpadlite/ - if the folder is called different it
will not work!

Please refer to http://www.dokuwiki.org/plugins for additional info
on how to install plugins in DokuWiki.

Icons: http://openclipart.org/detail/35197/tango-accesories-text-editor-by-warszawianka (public domain)
Icons: http://openclipart.org/detail/74881/cerrar-by-nomade
Icons: http://openclipart.org/detail/22179/lock-by-nicubunu

Please note that password protection only works for group pads. Additionally, there is a single master group for alle wiki pages. So the temporary page id is a secret.

FIXME: Group sessions last for one week or shorter (if user uses logout button). So after one week, you'll need to reconnect.
Note: Encrypted pages are not really encrypted but the etherpad-lite builtin password manager is used.

Etherpad-Lite config:
  "requireSession" : true,
  "editOnly" : true,
  mysql

Etherpad-Lite apache config:
  RewriteEngine On
  RewriteRule ^/pad$ /pad/ [R]
  <Proxy http://localhost:9001/>
    Order allow,deny
    Allow from all
  </Proxy>
  ProxyPass /pad/ http://localhost:9001/
  ProxyPassReverse /pad/ http://localhost:9001/
  ProxyPreserveHost on

Usage: Der User who is in "edit"-Mode can create a PAD to edit and save the content. Users in "lock"-Mode can join this PAD, but not save nor delete the PAD.

----
Copyright (C) Michael Braun <michael-dev@fami-braun.de>

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; version 2 of the License

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

See the COPYING file in your DokuWiki folder for details
