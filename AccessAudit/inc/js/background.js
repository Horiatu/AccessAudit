var Background = Background || {};

Background.getOptionOrDefault = function(data, option, value) {
    if(data[option] == undefined) {
        data[option] = value;
    }
    return data[option];
};

Background.getDefaults = function() {
    var dfr = $.Deferred();
    chrome.storage.sync.get(null,
    function(data) {
        options = {
            defaultTestPage: 'http://apps.esri.ca/templates/WCAGViewer/index.html',
            testPageUrl : Background.getOptionOrDefault(data, 'testPageUrl', ''),
            FAIL : true,
            PASS : Background.getOptionOrDefault(data, 'PASS', true),
            NA : Background.getOptionOrDefault(data, 'NA', false),
            banned : Background.getOptionOrDefault(data, 'banned', []),
            API : Background.getOptionOrDefault(data, 'API', 'Internal'),
            InternalAPI : "/inc/js/axs_testing.js",
            LatestAPI: "https://raw.github.com/GoogleChrome/accessibility-developer-tools/stable/dist/js/axs_testing.js",
            CustomAPI : Background.getOptionOrDefault(data, 'CustomAPI', '')
        };
        dfr.resolve(options);
    });
    return dfr.promise();
};

