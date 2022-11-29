
function setBadgeText(text) {
  switch (text)
  {
    case "N":
      browser.browserAction.setBadgeText({text: "N"});
      browser.browserAction.setBadgeTextColor({color: "#fff"});
      browser.browserAction.setBadgeBackgroundColor({color: "#c23c37"});
      break;
    case "S":
      browser.browserAction.setBadgeText({text: "S"});
      browser.browserAction.setBadgeTextColor({color: "#fff"});
      browser.browserAction.setBadgeBackgroundColor({color: "#12bc00"});
      break;
    case "A":
      browser.browserAction.setBadgeText({text: "A"});
      browser.browserAction.setBadgeTextColor({color: "#fff"});
      browser.browserAction.setBadgeBackgroundColor({color: "#5FC1A6"});
      break;
    case "M":
      browser.browserAction.setBadgeText({text: "M"});
      browser.browserAction.setBadgeTextColor({color: "#fff"});
      browser.browserAction.setBadgeBackgroundColor({color: "#075389"});
      break;
    default:
      return;

  }
}

function alertUser(msg) {
    // TODO nicer?
    alert(msg);
}
function getProxyConfigFromUrl(proxyUrl) {
    if (proxyUrl.indexOf('socks') == 0) {
        proxyUrl = proxyUrl.substring(5);
        if (proxyUrl.length < 4) {
            alertUser(`Proxy URL is too short: ${proxyUrl}`)
            return null
        }
        if (proxyUrl[0] == '5') {
            proxyUrl = proxyUrl.substring(4);
            var type = 'socks';
        } else {
            proxyUrl = proxyUrl.substring(3);
            var type = 'socks4';
        }

        let parts = proxyUrl.split(':');
        if (parts.length != 2) {
            alertUser(`Proxy URL should contain host and port, found: ${proxyUrl}`)
            return null
        }
        
        let host = parts[0];
        let port = parseInt(parts[1]);
        proxyConfig = {
            type: type,
            host: host,
            port: port,
            proxyDNS: true
        };
    } else if (proxyUrl.indexOf('http') == 0) {
        proxyUrl = new URL(proxyUrl);
        proxyConfig = {
            type: proxyUrl.protocol.split(':')[0],
            host: proxyUrl.hostname,
            port: parseInt(proxyUrl.port)
        };
    } else {
        alertUser(`Invalid proxy URL: ${proxyUrl}`);
        return null;
    }

    if (proxyConfig.port == NaN || proxyConfig.port < 0 || proxyConfig.port > 65536) {
        alertUser(`Invalid proxy port: ${proxyConfig.port}`)
        return null
    }

    return proxyConfig;
}

function proxySetupRowClicked(e) {
    var proxyConfig = {};
    var badge = "";
    var iconStatus = "";
    var noProxyText = "";
    var manProxyText = "";
    var liNode = e.srcElement;
    if (e.srcElement.nodeName != "LI") {
        liNode = e.srcElement.parentElement
    }
    var rowid = liNode.id;

    if (rowid.indexOf('noproxy') == 0) {
        proxyConfig = {type: "direct"}
        badge = "N";
        iconStatus = "./images/icons/set_noproxy.png";
        noProxyText = ""; // TODO
        manProxyText = ""; // TODO
    } else if (e.srcElement.id.indexOf('systemproxy') == 0) {
        // TODO needed?
    } else {
        proxyConfig = getProxyConfigFromUrl(liNode.querySelector('input').value)
        if (proxyConfig == null) return

        badge = "M";
        iconStatus = "./images/icons/set_noproxy.png"; // TODO
        noProxyText = ""; // TODO
        manProxyText = ""; // TODO
    }

    // TODO change icon
    // highlight row
    // set settings
    browser.storage.local.set({selectedSettings: proxyConfig, rowid: rowid}).then(() => 
        console.log('proxy set successfully')
    ).catch((x) => {
        console.log("failed to set " + x)
        alertUser("Failed to store proxy config in local storage: " + JSON.stringify(x))
    });

    setBadgeText(badge);
    try {
        document.querySelector('.active').classList.remove('active')
    } catch {}
    liNode.classList.add('active')

}


//--------------------------------------------------------------------------
//--------------------------------------------------------------------------

document.onreadystatechange = function() {
    document.getElementById("noproxy-id").addEventListener("click", proxySetupRowClicked);
    //document.getElementById("systemproxy-id").addEventListener("click", proxySetupRowClicked);
    document.getElementById("manualproxy-id1").addEventListener("click", proxySetupRowClicked);
    document.getElementById("manualproxy-id2").addEventListener("click", proxySetupRowClicked);
    document.getElementById("manualproxy-id3").addEventListener("click", proxySetupRowClicked);
    document.getElementById("manualproxy-id4").addEventListener("click", proxySetupRowClicked);
    document.getElementById("manualproxy-id5").addEventListener("click", proxySetupRowClicked);
}
browser.storage.local.get(null).then((c) => {
    console.log('eiiii, got local storage');
    if (c == null) return;
    console.log('current config in storage: ' + JSON.stringify(c))

    try {
        document.querySelector(`#${c.rowid}`).classList.add('active')
        console.log("highlighting row");
    } catch {
        console.log("failed to highligh row")
    }
});


/*
//Fire 2th : gotProxyType get proxy type then pass type to currentProxyType function
function gotProxyType(popupURL) {
  browser.proxy.settings.get({}).then(function(proxyInfo){ setupSwitcher(proxyInfo.value.proxyType); });
}

//Fire 1th : gettingPopup call gotProxyType function and pass popupURL
var gettingPopup = browser.browserAction.getPopup({});
gettingPopup.then(gotProxyType);


function resetActiveRow() {
    document.querySelector('.active').classList.remove('active');
}

//Fire when user clicked on noproxy button
function setNoProxySetting() {

    let noProxySetting = {
        proxyType: "none",
    };

    browser.proxy.settings.set({value: {settings: noProxySetting}}, function (e) {
        try { document.querySelector('.active-proxy').classList.remove('active-proxy') } catch (e) {}
        e.srcElement.classList.add('active-proxy')
    });

    let noproxy = document.getElementById("noproxy-id");
    noproxy.classList.add("active");

    // call setBadgeText function from browse_actions.js
    setBadgeText("N");

    let noProxySetIcon = document.getElementsByClassName("Switcher-icon-status");
    noProxySetIcon[0].src = "../images/icons/set_noproxy.png";

    let noproxyText = document.getElementsByClassName("noproxy-text");
    noproxyText[0].innerText = "No Proxy Mode Is Set";

    let systemproxyText = document.getElementsByClassName("systemproxy-text");
    systemproxyText[0].innerText = "Switch To System Proxy";

    resetActiveRow();

    //panel shortcut handeling
    let systemproxyShortcut = document.getElementById("systemproxy-shortcut");
    systemproxyShortcut.classList.add("shortcut-active");

    let noproxyShortcut = document.getElementById("noproxy-shortcut");
    noproxyShortcut.classList.remove("shortcut-active");
}

//Fire when user clicked on systemproxy button
function setSystemProxySetting() {

    let systemProxySetting = {
        proxyType: "system",
    };

    browser.proxy.settings.set({value: systemProxySetting}, function (e) {
        try { document.querySelector('.active-proxy').classList.remove('active-proxy') } catch (e) {}
        e.srcElement.classList.add('active-proxy')
    });

    let systemproxy = document.getElementById("systemproxy-id");
    systemproxy.classList.add("active");

    // call setBadgeText function from browserAction.js
    setBadgeText("S");

    let systemProxySetIcon = document.getElementsByClassName("Switcher-icon-status");
    systemProxySetIcon[0].src = "../images/icons/set_systemproxy.png";

    let noproxyText = document.getElementsByClassName("noproxy-text");
    noproxyText[0].innerText = "Switch To No Proxy";

    let systemproxyText = document.getElementsByClassName("systemproxy-text");
    systemproxyText[0].innerText = "System Proxy Is Set ";

    resetActiveRow();

    //panel shortcut handeling
    let systemproxyShortcut = document.getElementById("systemproxy-shortcut");
    systemproxyShortcut.classList.remove("shortcut-active");

    let noproxyShortcut = document.getElementById("noproxy-shortcut");
    noproxyShortcut.classList.add("shortcut-active");
}


//Fire when user clicked on manualproxy button
function setManualProxySetting(e) {
   // completed in next version 
    let url = e.srcElement.querySelector('input').value;
    if (url.indexOf('socks') == 0) {
        url = url.substring(5);
        // TODO length check
        if (url[0] == '5') {
            url = url.substring(4);
            var type = 'socks';
        } else {
            url = url.substring(3);
            var type = 'socks4';
        }

        // TODO length check
        let parts = url.split(':');
        if (parts.length != 2) {
            // TODO
        }
        
        let host = parts[0];
        let port = parseInt(parts[1]);
        proxyConfig = {
            type: type,
            host: host,
            port: port
        };
    } else if (url.indexOf('http') == 0) {
        url = new URL(url);
        proxyConfig = {
            type: url.protocol.split(':')[0],
            host: url.hostname,
            port: parseInt(url.port)
        };
    } else {
        alertUser(`Invalid proxy URL: ${url}`);
        return;
    }

    browser.storage.local.set({settings: proxyConfig}).then(() => console.log('set successfully')).catch((x) => console.log("failed to set " + x));

    try {
        console.log('will set:' + JSON.stringify(proxyConfig));
        //browser.proxy.onRequest.hasListener(proxyRequest) && browser.proxy.onRequest.removeListener(proxyRequest);
        //browser.proxy.onRequest.addListener(proxyRequest, {urls: ["<all_urls>"]});
        //browser.proxy.settings.set({value: manualProxySetting}, function (e) {
        //    console.log('error or set?')
        //    setBadgeText("M");
        //    resetActiveRow();
        //    console.log(e)
        //    try { document.querySelector('.active-proxy').classList.remove('active-proxy') } catch (e) {}
        //    e.srcElement.classList.add('active-proxy')
        //});
    } catch (e) {
        alertUser(`Failed to set proxy. Did you allow extension in private mode?\n${e}`);
    }
    //console.log("setManualProxySetting: " + JSON.stringify(manualProxySetting));
}



//Fire 3th and checked current proxy type and update popup button list current proxy used
function setupSwitcher(proxyType) {
  
  //Setup swithcer for current proxy mode
  if(proxyType == "none")
  {
    let noproxy = document.getElementById("noproxy-id");
    noproxy.classList.add("active");

    let noproxyText = document.getElementsByClassName("noproxy-text");
    noproxyText[0].innerText = "No Proxy Mode Is Set";

    // call setBadgeText function from browserAction.js
    setBadgeText("N");

    let noProxySetIcon = document.getElementsByClassName("Switcher-icon-status");
    noProxySetIcon[0].src = "../images/icons/set_noproxy.png";

    let systemproxyText = document.getElementsByClassName("systemproxy-text");
    systemproxyText[0].innerText = "Switch To System Proxy";
	
	let systemproxyShortcut = document.getElementById("systemproxy-shortcut");
	systemproxyShortcut.classList.add("shortcut-active");
  
	let noproxyShortcut = document.getElementById("noproxy-shortcut");
	noproxyShortcut.classList.remove("shortcut-active");
  }
  else if(proxyType == "system")
  {
    let systemproxy = document.getElementById("systemproxy-id");
    systemproxy.classList.add("active");

    let noproxyText = document.getElementsByClassName("noproxy-text");
    noproxyText[0].innerText = "Switch To No Proxy";

    // call setBadgeText function from browserAction.js
    setBadgeText("S");

    let systemProxySetIcon = document.getElementsByClassName("Switcher-icon-status");
    systemProxySetIcon[0].src = "../images/icons/set_systemproxy.png";

    let systemproxyText = document.getElementsByClassName("systemproxy-text");
    systemproxyText[0].innerText = "System Proxy Is Set";
	
	let systemproxyShortcut = document.getElementById("systemproxy-shortcut");
	systemproxyShortcut.classList.remove("shortcut-active");
  
	let noproxyShortcut = document.getElementById("noproxy-shortcut");
	noproxyShortcut.classList.add("shortcut-active");
	
  }
  else if(proxyType == "manual")
  {
    // todo add manual config
    let manualproxy = document.getElementById("manualproxy-id");
    manualproxy.classList.add("active");

    // call setBadgeText function from browser_action.js
    setBadgeText("M");

  }

}


*/
