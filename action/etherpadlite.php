<?php
/**
 * DokuWiki Plugin etherpadlite (Action Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Michael Braun <michael-dev@fami-braun.de>
 */

// must be run within Dokuwiki
if (!defined('DOKU_INC')) die();

if (!defined('DOKU_LF')) define('DOKU_LF', "\n");
if (!defined('DOKU_TAB')) define('DOKU_TAB', "\t");
if (!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');

require_once DOKU_PLUGIN.'action.php';

class action_plugin_etherpadlite_etherpadlite extends DokuWiki_Action_Plugin {

    public function register(Doku_Event_Handler &$controller) {

       $controller->register_hook('DOKUWIKI_STARTED', 'FIXME', $this, 'handle_dokuwiki_started');
       $controller->register_hook('TPL_METAHEADER_OUTPUT', 'FIXME', $this, 'handle_tpl_metaheader_output');
   
    }

    public function handle_dokuwiki_started(Doku_Event &$event, $param) {
    }

    public function handle_tpl_metaheader_output(Doku_Event &$event, $param) {
    }

}

// vim:ts=4:sw=4:et:
