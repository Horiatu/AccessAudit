var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-109917224-1']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();

var Background = Background || {};

Background.getOptionOrDefault = function(data, option, value) {
    if (data[option] === undefined) {
        data[option] = value;
    }
    return data[option];
};

Background.getDefaults = function() {
    var dfr = $.Deferred();
    chrome.storage.sync.get(null,
        function(data) {
            options = {
                type: 'defaults',
                defaultTestPage: 'https://horiatu.github.io/ColorContrast/',
                testPageUrl: Background.getOptionOrDefault(data, 'testPageUrl', ''),
                FAIL: true,
                PASS: Background.getOptionOrDefault(data, 'PASS', true),
                NA: Background.getOptionOrDefault(data, 'NA', false),
                banned: Background.getOptionOrDefault(data, 'banned', []),
                API: Background.getOptionOrDefault(data, 'API', 'Internal'),
                InternalAPI: "/inc/js/axs_testing.js",
                LatestAPI: "https://raw.github.com/GoogleChrome/accessibility-developer-tools/stable/dist/js/axs_testing.js",
                CustomAPI: Background.getOptionOrDefault(data, 'CustomAPI', ''),
                controlKeys: Background.getOptionOrDefault(data, 'controlKeys', ['keyCtrl']),
                expandHiddenElements: Background.getOptionOrDefault(data, 'expandHiddenElements', true),
                minWHExpandHiddenElements: Background.getOptionOrDefault(data, 'minWHExpandHiddenElements', 10),
                hightlightWithSemiTransparentCover: Background.getOptionOrDefault(data, 'hightlightWithSemiTransparentCover', false),
                expandInstructions: Background.getOptionOrDefault(data, 'expandInstructions', true),
                version: chrome.runtime.getManifest().version,
                versionMessage: Background.VersionMessage
            };
            dfr.resolve(options);
        });
    return dfr.promise();
};

Background.openReport = function(page, report, header, footer) {
    var wnd = window.open('/inc/html/report.html', '_blank');
    setTimeout(function() {
        Background.makeDocument($(wnd.document), page, report, header, footer);
    }, 500);
};

Background.makeDocument = function($doc, page, report, header, footer) {
    var $header = $doc.find('#header');
    var $report = $doc.find('#report');
    var $footer = $doc.find('#footer');

    if (header && header !== undefined && header !== '') {
        $header.html(header);
    }
    $header.append('<b>' + page.title + '</b>');
    if (page.favIconUrl && page.favIconUrl !== undefined && page.favIconUrl !== '') {
        $header.append('<img src="' + page.favIconUrl + '" style="float:right; width:16px; height:16px;" alt="Original Page FavIcon"/>');
    }
    $header.append('<br/>' + page.url);

    if (report && report !== undefined && report !== '') {
        $report.html(report);
    }

    if (footer && footer !== undefined && footer !== '') {
        $footer.html(footer);
    }
};

Background.VersionMessage = 'Current Version ' + chrome.runtime.getManifest().version;

chrome.runtime.onInstalled.addListener(function(details) {
    chrome.runtime.openOptionsPage(function() {
        var thisVersion = chrome.runtime.getManifest().version;
        if (details.reason === "install") {
            Background.VersionMessage = "Installed version " + thisVersion;
        } else if (details.reason === "update" && thisVersion !== details.previousVersion) {
            Background.VersionMessage = "Version updated from " + details.previousVersion + " to " + thisVersion;
        }
    });
});