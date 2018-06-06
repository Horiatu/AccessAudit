// On document load
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

$(document).ready(function() {
    // show tabs
    addCssClass('@font-face', 'font-family: "Poiret One";\n\t\tfont-weight: 400;\n\t\tsrc: url("'+chrome.extension.getURL("/fonts/Poiret One.woff2")+'") format("woff2");', 'fonts');

    $('input[id="testPageUrl"]').on('input', function() {
        testPageUrlChanged($(this).val());
    });
    $('#testPageTry').click(function() {
        window.open($('#testPageUrl').val());
    });

    $('#resetBtn').click(function() {
        if(confirm("Are you sure you want to reset all options?")) {
            chrome.storage.sync.clear();
            window.location.reload(false);
        }
    });

    restore_options();
});

function loadAPItext(url) {
    return $.ajax({
        url : url,
        dataType: "text"
    });
}

function addCssClass(className, classValue, styleId) {
    if(!styleId) styleId='css-modifier-container';
    if ($('#'+styleId).length === 0) {
        $('head').prepend('<style id="'+styleId+'"></style>');
    }

    $('#'+styleId).append('\t'+className + "{\n\t\t" + classValue + "\n\t}\n");
}

function getOptions(optionsDfr) {
    chrome.extension.connect().postMessage({type: 'get-defaults'});
    return optionsDfr.promise();
}

var Options = null;
// Restores select box state to saved value from localStorage.
function restore_options() {
    var Background = chrome.extension.getBackgroundPage().Background;
    Background.getDefaults().done(function(options) {
        Options = options;
        console.log(options);
        $('#testPageUrl')
            .attr('placeholder', options.defaultTestPage)
            .val(options.testPageUrl);
        testPageUrlChanged(options.testPageUrl);

        $('#bannedRules option').remove();
        $.each(options.banned, function(i, rule) {
            $('#bannedRules').append('<option value="'+rule+'">'+camel2Words(rule)+'</option>');
        });
        $('#bannedRules').attr('size', Math.min(10, options.banned.length));
        $('#bannedRules').change(function() {
            var $selected = $('#bannedRules option:selected');
            var count = $selected.length;
            $('#deleteBtn').prop("disabled", count === 0);
        });
        $('#deleteBtn').prop("disabled", true);
        $('#deleteBtn').click(function(e) {
            $('#bannedRules option:selected').remove();

            var banned = {};
            banned.banned = $.map($('#bannedRules option'), function(opt) { return opt.value; });
            chrome.storage.sync.set(banned);
        });

        $('#APIcb'+options.API).prop('checked', true);
        $('#CustomAPIdiv')
        .toggle(options.API=='Custom');
        $('#CustomAPI')
        .val(options.CustomAPI)
        .on('input', function() {
            var customAPI = $('#CustomAPI').val();
            try {
                loadAPItext(customAPI)
                .success(function (data) {
                    $("#APItext").text(data).css('color', 'Black');
                    chrome.storage.sync.set({CustomAPI:customAPI});
                })
                .error(function(e) {
                    $("#APItext").text('\nFile not found.').css('color', 'red');
                });
            } catch (e) {
                console.log(e);
                $("#APItext").text('');
            }
        });
        $('input[type=radio][name=api]').change(function() {
            var isChk = $(this).is(':checked');
            chrome.storage.sync.set({API:$(this).val()});
            $('#CustomAPIdiv').toggle($(this).attr('id')=='APIcbCustom' && isChk);
            showAPI($(this).val());
        });
        showAPI(options.API);

        $.each(options.controlKeys, function(i, value) {
            $('input[type=checkbox][id='+value+']').prop('checked', true);
        });
        $('input[type=checkbox][name=controlKeys]').change(function() {
            var isChk = $(this).is(':checked');
            var value = $(this).val();
            var idx = $.inArray(value, options.controlKeys);
            if (idx == -1) {
              if(isChk) options.controlKeys.push(value);
            } else {
              if(!isChk) options.controlKeys.splice(idx, 1);
            }
            chrome.storage.sync.set({controlKeys:options.controlKeys});
        });

        $('#minWH').prop('value', options.minWHExpandHiddenElements);
        $('#expand').prop('checked', options.expandHiddenElements);
        showExpandWH(options.expandHiddenElements);
        $('#expand').change(function() {
            var isChk = $(this).is(':checked');
            showExpandWH(isChk);
            chrome.storage.sync.set({expandHiddenElements:isChk});
            }
        );
        $('#minWH').on('input', function() {
            var n = Number($(this).prop('value'));
            if(n>=$(this).prop('min') && n<=$(this).prop('max')) {
                chrome.storage.sync.set({minWHExpandHiddenElements:n});
                $(this).css('color', 'black');
            }
            else {
                $(this).css('color', 'red');
            }
        });

        $('#highlight').prop('checked', options.hightlightWithSemiTransparentCover);
        $('#highlight').change(function() {
            var isChk = $(this).is(':checked');
            chrome.storage.sync.set({hightlightWithSemiTransparentCover:isChk});
            }
        );
        // $('#version').html(options.version);
        $('#versionMessage').html(options.versionMessage);

    });
}

function showExpandWH(isChk) {
    if(isChk) {
        $('#expandDiv').show();
        $('#collapseDiv').hide();
    }
    else {
        $('#expandDiv').hide();
        $('#collapseDiv').show();
    }
}

function showAPI(option) {
    var file = '';
    switch (option) {
        case 'Internal' :
            file = Options.InternalAPI;
            break;
        case 'Latest' :
            file = Options.LatestAPI;
            break;
        case 'Custom' :
            file = Options.CustomAPI === '' ? Options.InternalAPI : Options.CustomAPI;
            break;
    }
    loadAPItext(file)
    .success(function (data) {
        $("#APItext").text(data).css('color', 'Black');
    })
    .error(function(e) {
        $("#APItext").text('\nFile not found.').css('color', 'red');
    });
}

function camel2Words(str) {
    var arr = str.split("");

    for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i].match(/[A-Z]/)) {
            arr.splice(i, 0, " ");
        }
    }
    arr[0] = arr[0].toUpperCase();
    return arr.join("");
}

function testPageUrlChanged(val) {
    chrome.storage.sync.set({
        'testPageUrl': val
    });
    $('#testPageTry').css('display',(val === '')?'none':'inherit');
}

