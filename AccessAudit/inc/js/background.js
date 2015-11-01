var Background = Background || {};

Background.getOptionOrDefault = function(a, option, value) {
    if(a[option] == undefined) {
        a[option] = value;
    }
    return a[option];
};

Background.getDefaults = function() {
    var dfr = $.Deferred();
    chrome.storage.sync.get(null,
    function(a) {
        options = {
            testPageUrl : Background.getOptionOrDefault(a, 'testPageUrl', 'http://apps.esri.ca/templates/WCAGViewer/index.html'),
            PASS : Background.getOptionOrDefault(a, 'PASS', true),
            NA : Background.getOptionOrDefault(a, 'NA', false),
            FAIL : true
        };
        dfr.resolve(options);
    });
    return dfr.promise();
};


chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
    //sendResponse(req);
    switch (req.type) {
        case 'get-defaults':
            //sendResponse(req);
            //Background.
            Background.getDefaults().done(function(options) {
                console.log(options)
                sendResponse(options);
            });
            break;
    }}
);


