/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Plugin Check.
 *
 * The Initial Developer of the Original Code is
 * The Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2___
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Austin King <aking@mozilla.com> (Original Author)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * UI code for http://mozilla.com/en-US/plugincheck/
 */
(function(){
    
    var icons = {
        flash:     "/img/tignish/plugincheck/icon-flash.png",
        java:      "/img/tignish/plugincheck/icon-java.png",
        quicktime: "/img/tignish/plugincheck/icon-quicktime.png",
        divx: "/img/tignish/plugincheck/icon-divx.png",
        totem: "/img/tignish/plugincheck/icon-totem.png",
        generic: "/img/tignish/plugincheck/icon-flip.png"
    };
    var iconFor = function(pluginName) {
        if (pluginName.indexOf("Flash") >= 0) {
            return icons.flash;
        } else if (pluginName.indexOf("Java") >= 0) {
            return icons.java;
        } else if (pluginName.indexOf("QuickTime") >= 0) {
            return icons.quicktime;
        } else if(pluginName.indexOf("DivX") >= 0) {
            return icons.divx;
        } else if(pluginName.indexOf("Totem") >= 0) {
            return icons.totem;
        } else {
            return icons.generic;
        }
    };
    
    var loadingCopy = Pfs_internal[0];
    var loadingAlt = Pfs_internal[1];
    Pfs.$('#pfs-status').html(loadingCopy + " <img class='progress' src='/img/tignish/plugincheck/ajax-loader.gif' alt='" + loadingAlt + "' />");    
    var states = {};
    states[Pfs.VULNERABLE] = {c:"orange", l: Pfs_internal[5],  s: Pfs_internal[6], code:  Pfs.VULNERABLE};
    states[Pfs.DISABLE] =    {c:"orange", l: Pfs_internal[3],  s: Pfs_internal[4], code:  Pfs.DISABLE};
    states[Pfs.OUTDATED] =   {c:"yellow", l: Pfs_internal[7],  s: Pfs_internal[8], code:  Pfs.OUTDATED};
    // no plugin_latest_status... It is set to the Version number detected
    states[Pfs.CURRENT] =    {c:"green",  l: Pfs_internal[9],  s: undefined, code:        Pfs.CURRENT}; 
    states[Pfs.UNKNOWN] =    {c:"grey",   l: Pfs_internal[10], s: Pfs_internal[11], code: Pfs.UNKNOWN};
    
    var reportPlugins = function(pInfo, status) {
        if (status == Pfs.NEWER) {
            Pfs.i("Report Weird, we are newer", browserPlugins, pInfo);
        } else {
            Pfs.i("Report Unkown: ", status, pInfo);
        }
        var plugin = pInfo.raw;
        var reportData = {name: plugin.name, description: plugin.description};
        var detectedVersion = Pfs.parseVersion(
                                Pfs.UI.namePlusVersion(plugin.name, plugin.description)).join('.');
        Pfs.$.extend(reportData, Pfs.UI.navInfo, {version: detectedVersion, mimes: pInfo.mimes});        
        if (plugin) { 
            Pfs.$('body').append("<img src='" + Pfs.endpoint + status + "_plugin.gif?" + Pfs.$.param(reportData) +
                             "' width='1' height='1' />");
        }           
    }
    Pfs.reportPluginsFn = reportPlugins;
    var updateDisplayId = undefined;
    var showAll = false;
    var updateDisplay = function() {
        if (updateDisplayId !== undefined) {
            var criticalPlugins = Pfs.$('tr.plugin.' + Pfs.DISABLE).add('tr.plugin.' + Pfs.VULNERABLE).add('tr.plugin.' + Pfs.OUTDATED);
            criticalPlugins.show();
            if (showAll == false && criticalPlugins.size() > Pfs.UI.MAX_VISIBLE) {
                Pfs.$('tr.plugin.' + Pfs.CURRENT).hide();
            }
            Pfs.$('tr.plugin').removeClass('odd')
                          .filter(':visible')
                          .filter(':odd')
                          .addClass('odd');
            
            updateDisplayId = undefined;
        }
    }
    var addBySorting = function(el, status) {
        if (Pfs.DISABLE == status) {
            //worst
            var r = Pfs.$('tr.plugin.' + Pfs.DISABLE + ':first').before(el).size();
            if (r == 0) {
                // no disabled yet, go before any other plugin
                r = Pfs.$('tr.plugin:first').before(el).size();
                if (r == 0) {
                    //no other plugins, be the first plugin
                    Pfs.$('#plugin-template').parent().append(el);
                }
            }
        } else if(Pfs.VULNERABLE == status) {
            //bad
            var r = Pfs.$('tr.plugin.' + Pfs.DISABLE + ':last').after(el).size();
            if (r == 0) {
                // no disabled yet, go before any other vulnerable plugin
                r = Pfs.$('tr.plugin.' + Pfs.VULNERABLE + ':first').before(el).size();
                if (r == 0) {
                    // no vulnerable yet, go before any other outdated plugin
                    r = Pfs.$('tr.plugin.' + Pfs.OUTDATED + ':first').before(el).size();
                    if (r==0) {
                        // no outdated yet, go before all others
                        var r = Pfs.$('tr.plugin:first').before(el).size();
                        if (r == 0) {
                            //no other plugins, be the first plugin
                            Pfs.$('#plugin-template').parent().append(el);                
                        }
                    }
                    
                }
            }
        } else if(Pfs.OUTDATED == status) {
            //meh
            var r = Pfs.$('tr.plugin.' + Pfs.OUTDATED + ':first').before(el).size();
            if (r == 0) {
                var r = Pfs.$('tr.plugin.' + Pfs.CURRENT + ':first').before(el).size();
                if (r == 0) {
                    r = Pfs.$('tr.plugin:last').after(el).size();
                    if (r == 0) {
                        //no other plugins, be the first plugin
                        Pfs.$('#plugin-template').parent().append(el);
                    }
                }
            }
        } else if(Pfs.CURRENT == status) {
            //best case we are up to date, stick it after the last non unknown plugin in the list
            var r = Pfs.$('tr.plugin').not('.' + Pfs.UNKNOWN).filter(':last').after(el).size();
            if (r == 0) {
                r = Pfs.$('tr.plugin').filter(':first').before(el).size();
                if (r == 0) {
                    //no other plugins, be the first plugin
                    Pfs.$('#plugin-template').parent().append(el);                    
                }
                
            }
        } else if(Pfs.UNKNOWN == status) {
            //unknown plugins go last, not much help to the user
            var r = Pfs.$('tr.plugin:last').after(el).size();
            if (r == 0) {
                //no other plugins, be the first plugin
                Pfs.$('#plugin-template').parent().append(el);                
            }
        } else {
            Pfs.e("Sorting to display, unknown status", status);
        }
        if (updateDisplayId === undefined) {
            updateDisplayId = setTimeout(updateDisplay, 300);
        }
    }
    var displayPlugins = function(plugin, statusCopy, url, rowCount) {
        var html = Pfs.$('#plugin-template').clone();
        html.removeAttr('id')
            .addClass('plugin')
            .addClass(statusCopy.code);
        var rowClass;
        
        if (rowCount % 2 == 0) {
            html.addClass('odd');            
        }        
        
        Pfs.$('.name a', html).text(plugin.name);        
        Pfs.$('.version', html).html(plugin.description);
        Pfs.$('.icon', html).attr('src', iconFor(plugin.name));
        
        Pfs.$('.status', html).text(statusCopy.s);
         
        Pfs.$('.action a', html).addClass(statusCopy.c);
        Pfs.$('.action a span', html).text(statusCopy.l);
        if (url !== undefined) {
            Pfs.$('.name a', html).attr('href', url);
            Pfs.$('.action a', html).attr('href', url);                
        }            
        
        
        addBySorting(html, statusCopy.code);
        
        if (Pfs.UI.MAX_VISIBLE > total) {
            html.show();                
        }        
        /*<tr id="plugin-template" class="odd" style="display: none">
                    <td>
                        <img class="icon" src="/img/tignish/plugincheck/icon-divx.png" alt="DivX Icon" />
                        <h4 class="name">DivX</h4><span class="version">6.0, DivX, Inc.</span>
                    </td>
                    <td class="status">Vulnerable</td>
                    <td class="action"><a class="orange button"><span>Update Now</span></a></td>
                </tr>*/
    }
    
    var browserPlugins = Pfs.UI.browserPlugins(navigator.plugins);
    /* track plugins in the UI */
    var total = 0; var disabled = 0; var vulnerables = 0; var outdated = 0;
    
    /**
     * incremental callback function
     */
    var incrementalCallbackFn = function(data){
        if (data.status == Pfs.UNKNOWN) {
            //ping the server
            reportPlugins(data.pluginInfo, Pfs.UNKNOWN);
            if (data.pluginInfo.raw && data.pluginInfo.raw.name) {
                data.url = unknownPluginUrl(data.pluginInfo.raw.name);    
            }
            
        }
        if (data.status == Pfs.NEWER) {
            //ping the server and then treat as current
            reportPlugins(data.pluginInfo, Pfs.NEWER);
            data.status = Pfs.CURRENT;
        }
        if (states[data.status]) {
            switch (data.status) {
                case Pfs.DISABLE:
                    disabled++;
                    // Anchor tag for instructions on how to disable a plugin
                    url = "#howto-disable";
                    break;
                case Pfs.VULNERABLE:
                    vulnerables++;
                    break;
                case Pfs.OUTDATED:
                    outdated++;
                    break;
            }
            
            var copy = states[data.status];
            if (Pfs.CURRENT === data.status) {
                copy.s = Pfs.parseVersion(data.pluginInfo.plugin).join('.');;
            }
            var plugin = data.pluginInfo.raw;                
            displayPlugins(plugin, copy, data.url, total);
            total++;
            
        } else {
            Pfs.e("We have an unknown status code when displaying UI.", data);
        }        
    };
        
    var unknownPluginUrl = function(pluginName) { return Pfs_internal[18] + escape(Pfs_internal[19] + " " + pluginName);}
    
    var finishedCallbackFn = function(){
        for(var i=0; i < Pfs.UI.unknownVersionPlugins.length; i++) {
            var unknownPlugin = Pfs.UI.unknownVersionPlugins[i];
            displayPlugins(unknownPlugin, states[Pfs.UNKNOWN], unknownPluginUrl(unknownPlugin.name), total);
            total++;
        }
        
        Pfs.UI.unknownVersionPlugins = [];
        var worstCount = 0;
        
        var worstStatus = undefined;
        if (disabled > 0) {
            worstCount = disabled;
            worstStatus = Pfs_internal[13];
        } else if (vulnerables > 0) {
            worstCount = vulnerables;
            worstStatus = Pfs_internal[14];
        } else if (outdated > 0) {
            worstCount = outdated;
            worstStatus = Pfs_internal[15];
        }
        
        if (worstStatus !== undefined) {
            Pfs.$('#pfs-status').html(worstCount + " " + Pfs_internal[12] + " " + total + " " + worstStatus)
                            .addClass(Pfs.VULNERABLE);
        } else if (Pfs.$('.plugin').size() == 0) {
            Pfs.$('#pfs-status').html(Pfs_internal[17]);
        } else {
            Pfs.$('#pfs-status').html(Pfs_internal[16]);
        }
        if (Pfs.$('.plugin:hidden').size() > 0) {
            Pfs.$('.view-all-toggle').html("<a href='#'>" + Pfs_internal[2] + "</a>").click(function(){
                if (updateDisplayId === undefined) {
                    updateDisplayId = setTimeout(updateDisplay, 300);
                }
                showAll = true;
                Pfs.$('tr.plugin:hidden').show();
                Pfs.$('.view-all-toggle').remove();
                return false;    
            });    
        }
            
    };
    //Used in regression testing
    Pfs.UI.displayPlugin = incrementalCallbackFn;
    
    window.checkPlugins = function(endpoint) {        
        if (endpoint.indexOf("http://") == 0) {
            endpoint = endpoint.substring(7);
        } else if (endpoint.indexOf("https://") == 0) {
            endpoint = endpoint.substring(8);
        }
        Pfs.endpoint = window.location.protocol + "//" + endpoint;
        Pfs.UI.navInfo = Pfs.UI.browserInfo();
        Pfs.findPluginInfos(Pfs.UI.navInfo, browserPlugins, incrementalCallbackFn, finishedCallbackFn);
    }
})();