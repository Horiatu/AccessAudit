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
            CustomAPI : Background.getOptionOrDefault(data, 'CustomAPI', ''),
            controlKeys : Background.getOptionOrDefault(data, 'controlKeys', ['keyCtrl'])
        };
        dfr.resolve(options);
    });
    return dfr.promise();
};

Background.openReport = function(page, report, header, footer, cssHref) {

    // var wnd = window.open('/inc/html/report.html', '_blank');
    // if(footer && footer != undefined && footer != '')
    //     $(wnd.document.getElementById('footer')).append(footer);

    $.ajax({
        url : '/inc/html/report.html',
        dataType: "html"
    })
    .success(function(data) {
        $('#work').append(data);
        if(cssHref && cssHref != undefined && cssHref != '')
        {
            $('#work').find('head').append('<link id="reportCss" href="'+cssHref+'" rel="stylesheet" type="text/css">');
        }
        var $header=$('#work').find('#header');
        if(header && header != undefined && header != '')
        {
            $header.html(header);
        }
        $header.append(page.title+'<br/>');
        $header.append(page.url);
        if(page.favIconUrl && page.favIconUrl!=undefined && page.favIconUrl != '') {
            $header.append('<img src="'+page.favIconUrl+'" style="float:right; width:16px; height:16px;"/>');
        }

        if(report && report != undefined && report != '')
        {
            $('#work').find('#report').html(report);
        }
        if(footer && footer != undefined && footer != '')
        {
            $('#work').find('#footer').html(footer);
        }


        var wnd = window.open('','_blank');
        wnd.document.write($('#work').html());
        $('#work').empty();
    })
    .error(function(e) {
        console.log(e);
    });
}

