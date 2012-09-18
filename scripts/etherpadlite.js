var ep = { };

ep.imgBase = null;
ep.config = etherpad_lite_config;
ep.aceWasEnabled = false;
ep.isOwner = false;
ep.readOnly = false;
ep.isSaveable = false;
ep.timer = null;
ep.lang = null;
ep.password = "";

ep.on_disable = function() {
  if (ep.isOwner) {
  jQuery.post(
      DOKU_BASE + 'lib/exe/ajax.php',
      { 'id' : ep.config["id"], "rev" : ep.config["rev"], "call" : "pad_getText", "isSaveable" : ep.isSaveable, "readOnly"   : false },
      function(data) {
          if (data.error) {
             alert(data.error);
          } else {
             jQuery('#wiki__text').val(data.text);
             jQuery('.pad-toggle').hide();
             jQuery('.pad-toggle-off').show();
             jQuery('.etherpad').html("");
             jQuery('.etherpad').hide();
             jQuery('#bodyContent').show();
             ep.on_disable_close();
          }
      }
    );
  } else {
     jQuery('.pad-toggle').hide();
     jQuery('.pad-toggle-off').show();
     jQuery('.etherpad').html("");
     jQuery('.etherpad').hide();
     jQuery('#bodyContent').show();
     if (ep.aceWasEnabled) {
        jQuery('img.ace-toggle[src*="off"]:visible').click();
     }
  }
};

ep.on_disable_close = function() {
  window.clearInterval(ep.timer); ep.timer = null;
  jQuery.post(
    DOKU_BASE + 'lib/exe/ajax.php',
    { "id"         : ep.config["id"], "rev" : ep.config["rev"], "call" : "pad_close",
      "prefix"     : jQuery('#dw__editform').find('input[name=prefix]').val(),
      "suffix"     : jQuery('#dw__editform').find('input[name=suffix]').val(),
      "date"       : jQuery('#dw__editform').find('input[name=date]').val(),
      "isSaveable" : ep.isSaveable,
      "readOnly"   : false
    },
    function(data) {
        if (data.error) {
           alert(data.error);
        } else {
           jQuery('#wiki__text').val(data.text);
           if (ep.aceWasEnabled) {
              jQuery('img.ace-toggle[src*="off"]:visible').click();
           }
        }
    }
  );
};

ep.on_password_cancel = function(event) {
  ep.pwdlg.dlg.dialog('close');
  return false;
}

ep.on_password_submit = function() {
  ep.password = ep.pwdlg.inp.val();
  ep.pwdlg.dlg.dialog('close');
  ep.on_re_enable(true);
  return false;
}
ep.on_password_click = function() {
  if (!ep.readOnly) {
    alert(ep.lang.alreadywriteable);
  } else {
    ep.on_password();
  }
  return false;
}

ep.on_password = function() {
    ep.pwdlg.inp.val(ep.password);
    ep.pwdlg.dlg.dialog('open');
}

ep.init_password = function() {
  ep.pwdlg = {};
  ep.pwdlg.dlg = jQuery('<div/>').attr('title',ep.lang.password);
  ep.pwdlg.frm = jQuery('<form/>').addClass('pad-form').submit(ep.on_password_submit).appendTo(ep.pwdlg.dlg);
  jQuery('<label/>').attr('for','password').text(ep.lang.passwordforpad).appendTo(ep.pwdlg.frm);
  ep.pwdlg.inp = jQuery('<input/>').attr('name','password').attr('type','password').appendTo(ep.pwdlg.frm);
  jQuery('<input/>').attr('type','submit').val(ep.lang.submit).click(ep.on_password_submit).appendTo(ep.pwdlg.frm);
  jQuery('<input/>').attr('type','reset').val(ep.lang.reset).click(ep.on_password_cancel).appendTo(ep.pwdlg.frm);
  ep.pwdlg.dlg.dialog({modal: true, width: 500,height:150, autoOpen: false});
}

ep.init_security = function() {
  ep.dlg = {};
  ep.dlg.dlg = jQuery('<div/>').attr('title',ep.lang.securitymanager);
  ep.dlg.frm = jQuery('<form/>').addClass('pad-form').submit(ep.on_security_submit).appendTo(ep.dlg.dlg);
  var encLabel = jQuery('<label/>').attr('for','encMode').text(ep.lang.encryption+':');
  ep.dlg.encMode = jQuery('<select/>').attr('name','encMode').attr('size',1).change(ep.on_security_encmode_changed);
   ep.dlg.encMode.append(jQuery('<option/>').val('enc').text(ep.lang.padIsEncrypted));
   ep.dlg.encMode.append(jQuery('<option/>').val('noenc').text(ep.lang.padIsUnencrypted));
  ep.dlg.encPassword = jQuery('<span/>').show();
  var encALabel = jQuery('<label/>').attr('for','encAccessMode').text(ep.lang.accessRequires+':');
  ep.dlg.encAMode = jQuery('<select/>').attr('name','encAccessMode').attr('size',1);
   ep.dlg.encAMode.append(jQuery('<option/>').val('wikiread').text(ep.lang.permToReadWiki));
   ep.dlg.encAMode.append(jQuery('<option/>').val('wikiwrite').text(ep.lang.permToWriteWiki));
  jQuery('<label/>').attr('for','encpw').text(ep.lang.password+':').appendTo(ep.dlg.encPassword);
  ep.dlg.encPasswordFrm = jQuery('<input/>').attr('name','encpw').attr('type','password').appendTo(ep.dlg.encPassword);

  var readLabel = jQuery('<label/>').attr('for','readMode').text(ep.lang.readAccessRequires+':');
  ep.dlg.readMode = jQuery('<select/>').attr('name','readMode').attr('size',1).change(ep.on_security_readmode_changed);
   ep.dlg.readMode.append(jQuery('<option/>').val('wikiread').text(ep.lang.permToReadWiki));
   ep.dlg.readMode.append(jQuery('<option/>').val('wikiread+password').text(ep.lang.permToReadWikiPlusPassword));
   ep.dlg.readMode.append(jQuery('<option/>').val('wikiwrite').text(ep.lang.permToWriteWiki));
   ep.dlg.readMode.append(jQuery('<option/>').val('wikiwrite+password').text(ep.lang.permToWriteWikiPlusPassword));
  ep.dlg.readPassword = jQuery('<span/>').hide();
  jQuery('<label/>').attr('for','readpw').text(ep.lang.readPassword+':').appendTo(ep.dlg.readPassword);
  ep.dlg.readPasswordFrm = jQuery('<input/>').attr('name','readpw').attr('type','password').appendTo(ep.dlg.readPassword);

  var writeLabel = jQuery('<label/>').attr('for','writeMode').text(ep.lang.writeAccessRequires+':');
  ep.dlg.writeMode = jQuery('<select/>').attr('name','writeMode').attr('size',1).change(ep.on_security_writemode_changed);
   ep.dlg.writeMode.append(jQuery('<option/>').val('wikiwrite').text(ep.lang.permToWriteWiki));
   ep.dlg.writeMode.append(jQuery('<option/>').val('wikiwrite+password').text(ep.lang.permToWriteWikiPlusPassword));
  ep.dlg.writePassword = jQuery('<span/>').hide();
  jQuery('<label/>').attr('for','writepw').text(ep.lang.writePassword+':').appendTo(ep.dlg.writePassword);
  ep.dlg.writePasswordFrm = jQuery('<input/>').attr('name','writepw').attr('type','password').appendTo(ep.dlg.writePassword);

  ep.dlg.frm.append(encLabel).append(ep.dlg.encMode);
  ep.dlg.enc = jQuery('<span/>').show();
  ep.dlg.enc.append(encALabel).append(ep.dlg.encAMode).append(ep.dlg.encPassword);
  ep.dlg.frm.append(ep.dlg.enc);
  ep.dlg.noEnc = jQuery('<span/>').hide();
  ep.dlg.noEnc.append(readLabel).append(ep.dlg.readMode).append(ep.dlg.readPassword);
  ep.dlg.noEnc.append(writeLabel).append(ep.dlg.writeMode).append(ep.dlg.writePassword);
  ep.dlg.frm.append(ep.dlg.noEnc);

  jQuery('<input/>').attr('type','submit').val(ep.lang.submit).click(ep.on_security_submit).appendTo(ep.dlg.frm);
  jQuery('<input/>').attr('type','reset').val(ep.lang.reset).click(ep.on_security_cancel).appendTo(ep.dlg.frm);

  ep.dlg.encMode.val('noenc');
  ep.dlg.encAMode.val('wikiwrite');
  ep.dlg.readMode.val('wikiwrite');
  ep.dlg.writeMode.val('wikiwrite');
  ep.dlg.encPasswordFrm.val('');
  ep.dlg.readPasswordFrm.val('');
  ep.dlg.writePasswordFrm.val('');

  ep.dlg.dlg.dialog({modal: true, width: 600,height:300, autoOpen: false});
}

ep.on_security = function() {
  ep.dlg.dlg.dialog('open');
  return false;
}

ep.on_security_submit = function() {
  jQuery.post(
    DOKU_BASE + 'lib/exe/ajax.php',
    { 'id' : ep.config["id"], "rev" : ep.config["rev"], "call" : "pad_security",
      "encMode"    : ep.dlg.encMode.val(),
      "encAMode"   : ep.dlg.encAMode.val(),
      "readMode"   : ep.dlg.readMode.val(),
      "writeMode"  : ep.dlg.writeMode.val(),
      "encpw"      : ep.dlg.encPasswordFrm.val(),
      "readpw"     : ep.dlg.readPasswordFrm.val(),
      "writepw"    : ep.dlg.writePasswordFrm.val(),
      "isSaveable" : ep.isSaveable,
      "readOnly"   : false
    },
    function(data) {
      if (data.error) {
        alert(data.error);
      } else {
        ep.security_fill(data);
        ep.dlg.dlg.dialog('close');
        jQuery('.pad-iframe').attr("src",data.url);
      }
    }
  );
  return false;
}

ep.security_fill = function(data) {
  if (!data.canPassword) {
    jQuery('.pad-security').hide();
  } else {
    jQuery('.pad-security').show();
  }

  ep.dlg.encMode.val(data.encMode);
  ep.dlg.encAMode.val(data.encAMode);
  ep.dlg.readMode.val(data.readMode);
  ep.dlg.writeMode.val(data.writeMode);
  if (data.hasPassword) {
    ep.dlg.encPasswordFrm.val('');
  } else {
    ep.dlg.encPasswordFrm.val('***');
  }
  ep.dlg.readPasswordFrm.val(data.readpw);
  ep.dlg.writePasswordFrm.val(data.writepw);
  ep.readOnly = data.isReadonly;

  ep.on_security_encmode_changed();
  ep.on_security_readmode_changed();
  ep.on_security_writemode_changed();

  if (data.encMode == "enc") {
    jQuery(".pad-security").attr("src",ep.imgBase+"lock.png");
  } else if (ep.dlg.writePasswordFrm.val() != "") {
    jQuery(".pad-security").attr("src",ep.imgBase+"lock2.png");
  } else if (ep.dlg.readPasswordFrm.val() != "") {
    jQuery(".pad-security").attr("src",ep.imgBase+"lock1.png");
  } else {
    jQuery(".pad-security").attr("src",ep.imgBase+"nolock.png");
  }
  if (ep.readOnly) {
    jQuery(".pad-saveable").attr("src",ep.imgBase+"no-saveable.png");
  } else {
    jQuery(".pad-saveable").attr("src",ep.imgBase+"saveable.png");
  }

}

ep.refresh = function() {
  jQuery.post(
      DOKU_BASE + 'lib/exe/ajax.php',
      { 'id' : ep.config["id"], "rev" : ep.config["rev"], "call" : "pad_getText", "isSaveable" : ep.isSaveable, "readOnly"   : false },
      function(data) {
          if (data.error) {
             alert(data.error);
          } else {
             jQuery('#wiki__text').val(data.text);
             if (dw_locktimer) {
               dw_locktimer.refresh();
             }
          }
      }
    );
};

ep.on_security_encmode_changed = function() {
  if (ep.dlg.encMode.val() == "enc") {
    ep.dlg.enc.show();
    ep.dlg.noEnc.hide();
  } else {
    ep.dlg.enc.hide();
    ep.dlg.noEnc.show();
  }
}

ep.on_security_writemode_changed = function() {
  if(ep.dlg.writeMode.val().indexOf('password') == -1) {
    ep.dlg.writePassword.hide();
  } else {
    ep.dlg.writePassword.show();
  }
}

ep.on_security_readmode_changed = function() {
  if(ep.dlg.readMode.val().indexOf('password') == -1) {
    ep.dlg.readPassword.hide();
  } else {
    ep.dlg.readPassword.show();
  }
}

ep.on_enable_password = function(txt) {
  alert(txt);
  ep.on_password();
}

ep.on_enable = function() {
  return ep.on_re_enable(false);
}

ep.on_re_enable = function(reopen) {
  if (!reopen) {
    /* disable ACE, cache it => text is in wiki__text, ace can be restored. */
    ep.aceWasEnabled = (jQuery('img.ace-toggle[src*="on"]:visible').length > 0);
  }
  var text = "";
  if (ep.isSaveable) {
      jQuery('img.ace-toggle[src*="on"]:visible').click();
      text = jQuery('#wiki__text').val();
  }
  /* set cookie domain for wiki.stura + box.stura */
  document.domain = "stura.tu-ilmenau.de";
  /* commit */
  jQuery.post(
      DOKU_BASE + 'lib/exe/ajax.php',
      { 'id' : ep.config["id"], "rev" : ep.config["rev"], "call" : "pad_open", "text" : text,
        "isSaveable" : ep.isSaveable, "accessPassword" : ep.password },
      function(data) {
          if (data.error) {
             if (data.askPassword) {
               ep.on_enable_password(data.error);
             } else {
               alert(data.error);
             }
          } else {
             ep.isOwner = data.isOwner;
             document.cookie="sessionID="+data.sessionID+";domain=stura.tu-ilmenau.de;path=/";
             jQuery('.pad-toggle').hide();
             jQuery('.pad-toggle-on').show();
             jQuery('.etherpad').html("");
	     jQuery('.etherpad').show();
             var htext = (ep.isOwner ? ep.lang.padowner : ep.lang.padnoowner);
             htext = htext.replace(/%s/, ep.config["id"]);
             htext = htext.replace(/%d/, ep.config["rev"]);

             h = screen.height - 500;
	     if (h < 300) {
	       h = 300;
	     }
             jQuery('<div/>').addClass("pad-resizable").css('height',h).appendTo(jQuery('.etherpad'));
             jQuery('<div/>').addClass("pad-toolbar").html(htext).appendTo(jQuery('.pad-resizable'));
             jQuery("<img/>").addClass("pad-close").attr("src",ep.imgBase+"close.png").appendTo(jQuery(".pad-toolbar")).click(ep.on_disable);
             jQuery("<img/>").addClass("pad-security").attr("src",ep.imgBase+"nolock.png").appendTo(jQuery(".pad-toolbar")).click(ep.on_security);
             jQuery("<img/>").addClass("pad-saveable").attr("src",ep.imgBase+"no-saveable.png").appendTo(jQuery(".pad-toolbar")).click(ep.on_password_click);
             jQuery('#bodyContent').hide();
             jQuery('<div/>').addClass("pad-iframecontainer").appendTo(jQuery('.pad-resizable'));
             jQuery('<iframe/>').addClass("pad-iframe").attr("src",data.url).appendTo(jQuery('.pad-iframecontainer'));
	     jQuery('.pad-resizable').resizable();
             ep.security_fill(data);
             if (ep.isOwner) {
                 ep.timer = window.setInterval(ep.refresh, 5 * 60 * 1000);
             }
          }
      }
  );
};

ep.initialize = function() {
  ep.lang = LANG.plugins.etherpadlite;
  ep.imgBase = ep.config["base"] + "/img/";
  ep.isSaveable = (ep.config["act"] != "locked");
  jQuery("<img/>").addClass("pad-toggle pad-toggle-off").attr("src",ep.imgBase+"toggle_off.png").insertAfter(jQuery("#size__ctl")).click(ep.on_enable);
  jQuery("<img/>").addClass("pad-toggle pad-toggle-on").attr("src",ep.imgBase+"toggle_on.png").insertAfter(jQuery("#size__ctl")).click(ep.on_disable);
  jQuery("<div/>").addClass("etherpad").insertAfter(jQuery("#bodyContent"));
  jQuery('.pad-toggle').hide();
  jQuery('.pad-toggle-off').show();
  jQuery('.etherpad').hide();
  ep.init_security();
  ep.init_password();
};

jQuery(document).ready(ep.initialize);
