/* perfidies.js
  
  There are two layers - The UI and the PFS2 API
  
  This file will (evetually) only host the PFS API. Other JS files will host
  the MoCo whatsnew UI, the SFx Up Your Plug Badges, etc
  
*/
function compare(v1, v2) {
    var v1c = parseVersion(v1);
}
/**
 * Ghetto BNF:
 * A Version = description? version comment?
 * version = versionPart | versionChain
 * versionPart = digit | character
 * versionChain = versionPart (seperator versionPart)+
 * seperator = .
 * 
 * v - string like "Quicktime 3.0.12"
 * return a VersionChain example - [3, 0, 12]
 */
function parseVersion(v) {
    var tokens = v.split(' ');
    var inVersion = false;
    var inNumericVersion = false;
    var inCharVersion = false;
    var versionChain = [];
    var currentVersionPart = "";
    for(var i=0; i < tokens.length; i++){
        var token = tokens[i].trim();
        if (token.length == 0) {
            continue;
        }
        //console.info('outter loop ', i, token, inVersion);
        if (inVersion) {
            if (isNumeric(token[j])) {
                inNumericVersion = true;
                currentVersionPart += token[j];
            } else if(isSeperator(token[j])) {
                finishVersionPart();
            } else {
                return versionChain;
            }
        } else {
            for(var j=0; j < token.length; j++) {
                //console.info('inner loop ', j, inVersion);
                if (inVersion) {
                    if (isNumeric(token[j])) {
                        inNumericVersion = true;
                        currentVersionPart += token[j];
                    //TODO isChar...
                    } else if(isSeperator(token[j])) {
                        finishVersionPart();
                    } else {
                        return versionChain;
                    }
                } else {
                    startVersion(token, j);
                }
            }
        }
    }
    if (inVersion) {
        finishVersionPart();
        console.info("Looking good", versionChain);
    } else {
        if (window.console) console.warn("Unable to parseVersion from " + v);
    }
    return versionChain;
    function startVersion(token, j) {
        if (isNumeric(token[j])) {
            inVersion = true;
            inNumericVersion = true;
            currentVersionPart += token[j];
        } else {
            //skip we are in the description
            //console.info(token[j]);
        }
    }
    function finishVersionPart() {
        //cleanup this versionPart
        console.info("Pushing", currentVersionPart, versionChain);
        if (inNumericVersion) {
            versionChain.push(parseInt(currentVersionPart));
            inNumericVersion = false;
        } else if (inCharVersion) {
            versionChain.push(currentVersionPart);
            inCharVersion = false;
        } else {
            if (window.console) console.error("This should never happen", currentVersionPart, inNumericVersion, inCharVersion);
        }
        console.info("Pushed", currentVersionPart, versionChain);
        currentVersionPart = "";
    }
}

function isNumeric(c) { return ! isNaN(parseInt(c)); }
function isSeperator(c) { return c === '.'; }
function pluginData() {
    
}

var findPluginQueue = [];

var currentPlugins = [];
var outdatedPlugins = [];
var vulnerablePlugins = [];
var unknownPlugins = [];

