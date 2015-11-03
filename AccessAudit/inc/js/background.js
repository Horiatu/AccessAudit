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
            testPageUrl : Background.getOptionOrDefault(data, 'testPageUrl', ''),
            PASS : Background.getOptionOrDefault(data, 'PASS', true),
            NA : Background.getOptionOrDefault(data, 'NA', false),
            banned : Background.getOptionOrDefault(data, 'banned', []),
            FAIL : true
        };
        dfr.resolve(options);
    });
    return dfr.promise();
};

