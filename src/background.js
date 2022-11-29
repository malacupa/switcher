function proxyRequest(req) {
    //console.log("Called proxyRequest: " +JSON.stringify(req));
    //console.log("Will return= " + JSON.stringify(proxyConfig));
    return proxyConfig;
}

function onStorageChange(changes, namespace) {
    if (namespace != 'local') return;

    //console.log('changes: ' + JSON.stringify(changes));
    //console.log('namespace: ' + JSON.stringify(namespace));

    proxyConfig = changes.selectedSettings.newValue;
    //console.log("chaning proxyConfig to " + JSON.stringify(proxyConfig));
    //console.log('proxyConfigVar = ' + JSON.stringify(proxyConfig))

    browser.proxy.onRequest.hasListener(proxyRequest) && browser.proxy.onRequest.removeListener(proxyRequest);
    browser.proxy.onRequest.addListener(proxyRequest, {urls: ["<all_urls>"]});
}

browser.commands.onCommand.addListener(function(command){
    if (command === "switch") {
        browser.proxy.settings.get({}).then(function(proxyInfo) {
            switch(proxyInfo.value.proxyType) {
                case "none":
                    setBadgeText("S");
                    let systemProxySetting = {
                        proxyType: "system",
                    };

                    browser.proxy.settings.set({value: systemProxySetting});
                    break;

                case "system":
                    setBadgeText("N");
                    let noProxySetting = {
                        proxyType: "none",
                    };

                    browser.proxy.settings.set({value: noProxySetting});
                    break;

                default:
                    break;
            }
        });

    }
});

var proxyConfig = {};
browser.storage.onChanged.addListener(onStorageChange);

browser.storage.local.get(null).then((conf) => {
    console.log('initial settings:')
    console.log(conf)

    if (!conf.hasOwnProperty('settings')) {
        // invalid config, set manual as default
        proxyConfig = {type: 'direct'}
        browser.storage.local.set({selectedSettings: proxyConfig, rowid: 'noproxy-id', allSettings: allSettings}).then(() =>
            console.log('initial proxy set successfully')
        ).catch((x) => {
            console.log("failed to set " + x)
            alert("Failed to store proxy config in local storage: " + JSON.stringify(x))
        });
    } else {
        proxyConfig = conf
    }

    browser.proxy.onRequest.hasListener(proxyRequest) && browser.proxy.onRequest.removeListener(proxyRequest);
    browser.proxy.onRequest.addListener(proxyRequest, {urls: ["<all_urls>"]});
});

//Suggest Switcher ADD-ONS home page in omnibox     
browser.omnibox.onInputStarted.addListener(function() {	
    browser.omnibox.setDefaultSuggestion({
  description: "Go to Switcher ADD-ONS page"
	});
});    

//Go to Switcher ADD-ONS home page on firefox ADD-ONS
browser.omnibox.onInputEntered.addListener(function() {
	browser.tabs.update({url:"http://addons.mozilla.org/en-US/firefox/addon/switcher_proxy/"});
});


