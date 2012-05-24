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
require_once DOKU_PLUGIN.'etherpadlite/externals/etherpad-lite-client/etherpad-lite-client.php';

class action_plugin_etherpadlite_etherpadlite extends DokuWiki_Action_Plugin {

    public function register(Doku_Event_Handler &$controller) {
        $controller->register_hook('TPL_METAHEADER_OUTPUT', 'BEFORE', $this, 'handle_tpl_metaheader_output');
        $controller->register_hook('AJAX_CALL_UNKNOWN', 'BEFORE', $this, 'handle_ajax');
        $controller->register_hook('ACTION_ACT_PREPROCESS', 'BEFORE', $this, 'handle_logoutconvenience');
    }

    public function handle_logoutconvenience(&$event,$param) {
        global $ACT;
        if ($ACT=='logout' && isset($_SESSION["ep_sessionID"])) {
             $ep_url = trim($this->getConf('etherpadlite_url'));
             $ep_key = trim($this->getConf('etherpadlite_apikey'));
             $ep_group = trim($this->getConf('etherpadlite_group'));
             $ep_instance = new EtherpadLiteClient($ep_key, $ep_url."/api");
             if (!empty($ep_group)) {
                 $ep_instance->deleteSession($_SESSION["ep_sessionID"]);
                 unset($_SESSION["ep_sessionID"]);
             }
        }
    }

    public function handle_ajax(&$event, $param) {
        $call = $event->data;
        if(method_exists($this, "handle_ajax_$call")) {
           $json = new JSON();

           header('Content-Type: application/json');
           print $json->encode($this->{"handle_ajax_$call"}());
           $event->preventDefault();
        }
    }

    public function handle_ajax_pad_setpassword() {
        global $conf;
        global $lang;
        global $ID;
        global $REV;
        global $INFO;

        $ID = cleanID($_POST['id']);
        if(empty($ID)) return;
        $REV = (int) $_POST["rev"];
        $password = $_POST["password"];
        if (empty($password)) $password = NULL;

        $INFO = pageinfo();

        if (!$INFO['writable']) {
           return array("file" => __FILE__, "line" => __LINE__, "error" => 'Permission denied');
        }

        $rev = (int) (($INFO['rev'] == '') ? $INFO['lastmod'] : $INFO['rev']);
        $meta = p_get_metadata($ID, "etherpadlite", METADATA_DONT_RENDER);

        if (!is_array($meta)) return Array("file" => __FILE__, "line" => __LINE__, "error" => "Permission denied");
        if (!isset($meta[$rev])) return Array("file" => __FILE__, "line" => __LINE__, "error" => "Permission denied");
        if ($meta[$rev]["owner"] != $_SERVER["REMOTE_USER"]) return Array("file" => __FILE__, "line" => __LINE__, "error" => "Permission denied");

        $ep_url = trim($this->getConf('etherpadlite_url'));
        $ep_key = trim($this->getConf('etherpadlite_apikey'));
        $ep_group = trim($this->getConf('etherpadlite_group'));
        $ep_instance = new EtherpadLiteClient($ep_key, $ep_url."/api");

        if (!empty($ep_group)) {
            try {
    	        $groupid = $ep_instance->createGroupIfNotExistsFor($ep_group);
		        $groupid = (string) $groupid->groupID;
            } catch (Exception $e) {
                return Array("file" => __FILE__, "line" => __LINE__, "error" => $e->getMessage());
            }
            $pageid = $groupid."\$".$meta[$rev]["pageid"];
            $canPassword = ($meta[$rev]["owner"] == $_SERVER["REMOTE_USER"]);
        } else {
            $pageid = $meta[$rev]["pageid"];
            $canPassword = false;
        }

        $hasPassword = false;
        try {
            $ep_instance->setPassword($pageid, $password);
            $hasPassword = (bool) ($ep_instance->isPasswordProtected($pageid)->isPasswordProtected);
        } catch (Exception $e) {
            return Array("file" => __FILE__, "line" => __LINE__, "error" => $e->getMessage());
        }

        return Array("hasPassword" => $hasPassword, "canPassword" => $canPassword);
    }

    public function handle_ajax_pad_getText() {
        global $conf;
        global $lang;
        global $ID;
        global $REV;
        global $INFO;

        $ID = cleanID($_POST['id']);
        if(empty($ID)) return;
        $REV = (int) $_POST["rev"];

        $INFO = pageinfo();

        if (!$INFO['writable']) {
           return array("file" => __FILE__, "line" => __LINE__, "error" => 'Permission denied');
        }

        $rev = (int) (($INFO['rev'] == '') ? $INFO['lastmod'] : $INFO['rev']);
        $meta = p_get_metadata($ID, "etherpadlite", METADATA_DONT_RENDER);

        if (!is_array($meta)) return Array("file" => __FILE__, "line" => __LINE__, "error" => "Permission denied");
        if (!isset($meta[$rev])) return Array("file" => __FILE__, "line" => __LINE__, "error" => "Permission denied");

        $ep_url = trim($this->getConf('etherpadlite_url'));
        $ep_key = trim($this->getConf('etherpadlite_apikey'));
        $ep_group = trim($this->getConf('etherpadlite_group'));
        $ep_instance = new EtherpadLiteClient($ep_key, $ep_url."/api");

        if (!empty($ep_group)) {
            try {
    	        $groupid = $ep_instance->createGroupIfNotExistsFor($ep_group);
		        $groupid = (string) $groupid->groupID;
            } catch (Exception $e) {
                return Array("file" => __FILE__, "line" => __LINE__, "error" => $e->getMessage());
            }
            $pageid = $groupid."\$".$meta[$rev]["pageid"];
        } else {
            $pageid = $meta[$rev]["pageid"];
        }

        try {
            $text = $ep_instance->getText($pageid);
            $text = (string) $text->text;
        } catch (Exception $e) {
            return Array("file" => __FILE__, "line" => __LINE__, "error" => $e->getMessage(), "pageid" => $pageid);
        }

        return Array("status" => "OK", "text" => $text);
    }

    public function handle_ajax_pad_close() {
        global $conf;
        global $lang;
        global $ID;
        global $REV;
        global $INFO;

        $ID = cleanID($_POST['id']);
        if(empty($ID)) return;
        $REV = (int) $_POST["rev"];

        $INFO = pageinfo();

        if (!$INFO['writable']) {
           return array("file" => __FILE__, "line" => __LINE__, "error" => 'Permission denied');
        }

        $rev = (int) (($INFO['rev'] == '') ? $INFO['lastmod'] : $INFO['rev']);
        $meta = p_get_metadata($ID, "etherpadlite", METADATA_DONT_RENDER);

        if (!is_array($meta)) return Array("file" => __FILE__, "line" => __LINE__, "error" => "Permission denied");
        if (!isset($meta[$rev])) return Array("file" => __FILE__, "line" => __LINE__, "error" => "Permission denied");
        if ($meta[$rev]["owner"] != $_SERVER["REMOTE_USER"]) return Array("file" => __FILE__, "line" => __LINE__, "error" => "Permission denied");

        $ep_url = trim($this->getConf('etherpadlite_url'));
        $ep_key = trim($this->getConf('etherpadlite_apikey'));
        $ep_group = trim($this->getConf('etherpadlite_group'));
        $ep_instance = new EtherpadLiteClient($ep_key, $ep_url."/api");

        if (!empty($ep_group)) {
            try {
    	        $groupid = $ep_instance->createGroupIfNotExistsFor($ep_group);
		        $groupid = (string) $groupid->groupID;
            } catch (Exception $e) {
                return Array("file" => __FILE__, "line" => __LINE__, "error" => $e->getMessage());
            }
            $pageid = $groupid."\$".$meta[$rev]["pageid"];
        } else {
            $pageid = $meta[$rev]["pageid"];
        }

        try {
            $text = $ep_instance->getText($pageid);
            $text = (string) $text->text;
            $ep_instance->deletePad($pageid);
        } catch (Exception $e) {
            return Array("file" => __FILE__, "line" => __LINE__, "error" => $e->getMessage(), "pageid" => $pageid);
        }

        unset($meta[$rev]);
        p_set_metadata($ID, Array("etherpadlite" => $meta));

        return Array("status" => "OK", "text" => $text);
    }

    public function handle_ajax_pad_open() {
        global $conf;
        global $lang;
        global $ID;
        global $REV;
        global $INFO;
        global $USERINFO;

        $ID = cleanID($_POST['id']);
        if(empty($ID)) return;
        $REV = (int) $_POST["rev"];
        $readOnly = ($_POST['readOnly'] == 'true');
        $INFO = pageinfo();

        if (!$INFO['writable']) {
           return array("file" => __FILE__, "line" => __LINE__, "error" => 'Permission denied');
        }

        $ep_url = trim($this->getConf('etherpadlite_url'));
        $ep_key = trim($this->getConf('etherpadlite_apikey'));
        $ep_group = trim($this->getConf('etherpadlite_group'));
        $ep_instance = new EtherpadLiteClient($ep_key, $ep_url."/api");
        if (!empty($ep_group)) {
	        try {
	            $groupid = $ep_instance->createGroupIfNotExistsFor($ep_group);
		        $groupid = (string) $groupid->groupID;
                if (!isset($_SESSION["ep_sessionID"])) {
		            $authorid = $ep_instance->createAuthorIfNotExistsFor($_SERVER['REMOTE_USER'], $USERINFO['name']);
		            $authorid = (string) $authorid->authorID;
		            $cookies = $ep_instance->createSession($groupid, $authorid, time() + 7 * 24 * 60 * 60);
		            $sessionID = (string) $cookies->sessionID;
		            $host = parse_url($ep_url, PHP_URL_HOST);
		            $_SESSION["ep_sessionID"] = $sessionID;
                }
		        setcookie("sessionID",$_SESSION["ep_sessionID"], 0, "/", $host);
	        } catch (Exception $e) {
	            return Array("file" => __FILE__, "line" => __LINE__, "error" => $e->getMessage());
	        }
        }

        $rev = (int) (($INFO['rev'] == '') ? $INFO['lastmod'] : $INFO['rev']);
        $meta = p_get_metadata($ID, "etherpadlite", METADATA_DONT_RENDER);
        if (!is_array($meta)) $meta = Array();
        if (!isset($meta[$rev])) {
            if ($readOnly)
                return Array("file" => __FILE__, "line" => __LINE__, "error" => "There is no such pad.");
            /** new pad */
            if (isset($_POST["text"])) {
                $text = $_POST["text"];
            } else {
                $text = rawWiki($ID,$rev);
                if(!$text) {
                    $text = pageTemplate($ID);
                }
            }
            $pageid = md5(uniqid("dokuwiki:".md5($ID).":$rev:", true));
            try {
                if (!empty($ep_group)) {
                    $ep_instance->createGroupPad($groupid, $pageid, $text);
                } else {
                    $ep_instance->createPad($pageid, $text);
                }
            } catch (Exception $e) {
                return Array("file" => __FILE__, "line" => __LINE__, "error" => $e->getMessage());
            }
            $meta[$rev] = Array("pageid" => $pageid, "owner" => $_SERVER['REMOTE_USER']);
            p_set_metadata($ID, Array("etherpadlite" => $meta));
        } else {
            $pageid = $meta[$rev]["pageid"];
            /* in case pad is already deleted, recreate it */
            try {
                if (!empty($ep_group)) {
                    $ep_instance->createGroupPad($groupid, $pageid, "");
                } else {
                    $ep_instance->createPad($pageid, "");
                }
            } catch (Exception $e) {
            }
        }

        $hasPassword = false;
        if (!empty($ep_group)) {
            $pageid = "$groupid\$$pageid";
            $canPassword = ($meta[$rev]["owner"] == $_SERVER["REMOTE_USER"]);
            try {
                $hasPassword = (bool) ($ep_instance->isPasswordProtected($pageid)->isPasswordProtected);
            } catch (Exception $e) {
                return Array("file" => __FILE__, "line" => __LINE__, "error" => $e->getMessage());
            }
        } else {
            $canPassword = false;
        }

        $isOwner = ($meta[$rev]["owner"] == $_SERVER["REMOTE_USER"]);

        return Array("name" => "$pageid", "url" => $ep_url."/p/".$pageid, "sessionID" => $_SESSION["ep_sessionID"], "hasPassword" => $hasPassword, "canPassword" => $canPassword, "isOwner" => $isOwner);
    }

    public function handle_tpl_metaheader_output(Doku_Event &$event, $param) {
        global $ACT, $INFO;

        if (!in_array($ACT, array('edit', 'create', 'preview',
                                  'locked', 'draft', 'recover'))) {
            return;
        }
        $config = array(
            'id' => $INFO['id'],
            'rev' => (($INFO['rev'] == '') ? $INFO['lastmod'] : $INFO['rev']),
            'base' => DOKU_BASE.'lib/plugins/etherpadlite/',
            'act' => $ACT
        );
        $path = 'scripts/etherpadlite.js';

        $json = new JSON();
        $this->include_script($event, 'var etherpad_lite_config = '.$json->encode($config));
        $this->link_script($event, DOKU_BASE.'lib/plugins/etherpadlite/'.$path);

    }

    private function include_script($event, $code) {
        $event->data['script'][] = array(
            'type' => 'text/javascript',
            'charset' => 'utf-8',
            '_data' => $code,
        );
    }

    private function link_script($event, $url) {
        $event->data['script'][] = array(
            'type' => 'text/javascript',
            'charset' => 'utf-8',
            'src' => $url,
        );
    }
}

// vim:ts=4:sw=4:et:
