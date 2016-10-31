var Background = Background || {};

Background.getOptionOrDefault = function(data, option, value) {
    if(data[option] === undefined) {
        data[option] = value;
    }
    return data[option];
};

Background.getDefaults = function() {
    var dfr = $.Deferred();
    chrome.storage.sync.get(null,
    function(data) {
        options = {
            type:'defaults',
            defaultTestPage: 'http://apps.esri.ca/templates/WCAGViewer/index.html',
            testPageUrl : Background.getOptionOrDefault(data, 'testPageUrl', ''),
            FAIL : true,
            PASS : Background.getOptionOrDefault(data, 'PASS', true),
            NA : Background.getOptionOrDefault(data, 'NA', false),
            banned : Background.getOptionOrDefault(data, 'banned', []),
            API : Background.getOptionOrDefault(data, 'API', 'Internal'),
            InternalAPI : "/inc/js/axs_testing.js",
            LatestAPI: "https://raw.github.com/GoogleChrome/accessibility-developer-tools/stable/dist/js/axs_testing.js",
            CustomAPI : Background.getOptionOrDefault(data, 'CustomAPI', ''),
            controlKeys : Background.getOptionOrDefault(data, 'controlKeys', ['keyCtrl']),
            expandHiddenElements : Background.getOptionOrDefault(data, 'expandHiddenElements', true),
            minWHExpandHiddenElements : Background.getOptionOrDefault(data, 'minWHExpandHiddenElements', 10),
            hightlightWithSemiTransparentCover : Background.getOptionOrDefault(data, 'hightlightWithSemiTransparentCover', false)
        };
        dfr.resolve(options);
    });
    return dfr.promise();
};

Background.openReport = function(page, report, header, footer) {
    var wnd = window.open('/inc/html/report.html','_blank');
    setTimeout(function(){
        Background.makeDocument(wnd.document, page, report, header, footer);
    }, 500);
};

Background.makeDocument = function(doc, page, report, header, footer) {
    var $doc = $(doc); 
    var $header=$doc.find('#header');
    if(header && header !== undefined && header !== '')
    {
        $header.html(header);
    }
    $header.append('<b>'+page.title+'</b>');
    if(page.favIconUrl && page.favIconUrl!==undefined && page.favIconUrl !== '') {
        $header.append('<img src="'+page.favIconUrl+'" style="float:right; width:16px; height:16px;" alt="Original Page FavIcon"/>');
    }
    $header.append('<br/>'+page.url);

    if(report && report !== undefined && report !== '')
    {
         $doc.find('#report').html(report);
    }
    if(footer && footer !== undefined && footer !== '')
    {
        $doc.find('#footer').html(footer);
    }
};
