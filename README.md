dokuwikietherpadlite
====================

Etherpad-Lite plugin for dokuwiki

All documentation for this plugin can be found at https://github.com/michael-dev/dokuwikietherpadlite and at https://www.dokuwiki.org/plugin:etherpadlite .

What does it do?
----------------

This dokuwiki plugin lets you edit your pages using an existing etherpad lite instance. Using an appropiate configuration of the etherpad lite server, the plugin will enforce dokuwiki acl permissions for pages onto the pads for editing the page and additionally lets you protect the pads using read and read-write passwords. Further, it integrates tightly with the dokuwiki toolbar so that most buttons will work the the etherpad lite editor as well.

Benefits
--------

* multiple persons can edit the same page at the same time
* almost realtime backups of edits typed
* tight toolbar integration
* mapping of dokuwiki permissions
* extra password protection for read/readwrite pad access

Usage
-----

The user who is in (dokuwiki) "edit"-Mode can create a PAD to edit and save the content. Users in "lock"-Mode can join this PAD, but not save nor delete the PAD.

How does it work?
-----------------

The dokuwiki plugin adds javascript code to the edit page that hooks into the toolbar javascript and adds an extra pad-toogle icon just below the textedit field. This code obviously depends on the template used and has *not* been tested with the most recent dokuwiki default template. The dokuwiki plugin further adds an ajax handler that calls the etherpad lite api as needed and stores the pad details in the dokuwiki page metadata object.

The etherpad lite gets its pads assigned to groups, group membership managed and pad passwords assigned by the dokuwiki plugin. Further, the dokuwiki plugin sets browser cookies to authorize the client to use the pad. The latter leads to some cross-domain requirements, though this could as well be fixed by adding extra code to etherpad lite.

The tight integration works using javascript cross-domain message posting, so it is more or less cross-domain independend. The dokuwiki plugin sends edit-messages (i.e. past text xx at current cursor) and the etherpad lite plugin receives and processes it. Therefore the etherpad lite plugin is just some javascript code loaded into the browser. Messages in the inverse directions are used to indicate the presenc of the plugin. Please note that there currently is no synchronous messaging possible, so the dokuwiki javascript code cannot read the current selection from the pad.

Installation
------------
### etherpad lite ###

Please refer to the etherpad lite dokumentation for its installation steps and remember to use a production-ready backend.

To ensure pad permissions and cleanup, I recommend the following etherpad lite settings. They ensure that only users authorized by the dokuwiki plugin can edit a pad and that there are only pads created using the dokuwiki plugin.
* "requireSession" : true,
* "editOnly" : true,

#### Example apache config ####

    RewriteEngine On
    RewriteRule ^/pad$ /pad/ [R]
    <Proxy http://localhost:9001/>
      Order allow,deny
      Allow from all
    </Proxy>
    ProxyPass /pad/ http://localhost:9001/
    ProxyPassReverse /pad/ http://localhost:9001/
    ProxyPreserveHost on

### dokuwiki plugin ###

If you install this plugin manually, make sure it is installed in
lib/plugins/etherpadlite/ - if the folder is called different it
will not work!

Please refer to http://www.dokuwiki.org/plugins for additional info
on how to install plugins in DokuWiki.

### etherpad lite plugin ###

For better integration, see the ep\_iframeinsert etherpad lite plugin.
https://github.com/michael-dev/ep%5Fiframeinsert

Shortcomings
------------

* Please note that password protection only works for group pads. Additionally, there is a single master group for alle wiki pages. So the temporary page id is a secret.
* The dokuwiki plugin sets a browser cookie read by the etherpad lite (session identifier). This leads to some cross-domain restrictions.
* Group sessions last for one week or shorter (if user uses logout button). So after one week, you'll need to reconnect.
* Encrypted pages are not really encrypted but the etherpad-lite builtin password manager is used.
* Pads are owned by the user who created it. Ownership cannot be transfered. If a pad exists for a page revision, there cannot be another pad for the same/a different page revision.
* the dokuwiki integration depends on the template used and is not tested with the most recent dokuwiki default template.

Licence
-----------
* Icons: http://openclipart.org/detail/35197/tango-accesories-text-editor-by-warszawianka (public domain)
* Icons: http://openclipart.org/detail/74881/cerrar-by-nomade
* Icons: http://openclipart.org/detail/22179/lock-by-nicubunu

----
Copyright (C) Michael Braun <michael-dev@fami-braun.de>

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; version 2 of the License

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

