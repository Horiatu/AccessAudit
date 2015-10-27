var Background = Background || {};

Background.sendMessage = function(message, callback) {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, message, callback);
    });
};

Background.getOptionOrDefault = function(a, option, value) {
    if(a[option] == undefined) {
        a[option] = value;
    }
    return a[option];
};

Background.getDefaults = function() {
    var gdDfr = $.Deferred();
    chrome.storage.sync.get('testPageUrl',
    function(a) {
        defaults = {
            type:'defaults',
            testPageUrl : Background.getOptionOrDefault(a, 'testPageUrl', ''),
        };
        gdDfr.resolve(defaults);
    });
    return gdDfr.promise();
};

chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(req) {
        switch (req.type) {
            case 'get-defaults':
                Background.getDefaults().done(function(defaults) {
                    Background.sendMessage(defaults);
                    //console.log(defaults);
                });
                break;
        }
    });
});

