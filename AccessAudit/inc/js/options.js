// On document load
$(document).ready(function() {
    // show tabs
    addCssClass('@font-face', 'font-family: "Poiret One";\n\t\tfont-weight: 400;\n\t\tsrc: url("'+chrome.extension.getURL("/fonts/Poiret One.woff2")+'") format("woff2");', 'fonts');
    
    $('input[id="testPageUrl"]').on('input', function() {
        testPageUrlChanged($(this).val());
    })
    $('#testPageTry').click(function() {
        window.open($('#testPageUrl').val());
    })

    restore_options()
});

function loadAPItext(url) {
    return $.ajax({
        url : url,
        dataType: "text"
        //,
        // success : function (data) {
        //     $("#APItext").text(data).css('color', 'Black').removeAttr('data-error');
        // },
        // error: function(e) {
        //     $("#APItext").text('\nFile not found.').css('color', 'red').attr('data-error', 'true');
        // }
    });
}
function addCssClass(className, classValue, styleId) {
    if(!styleId) styleId='css-modifier-container';
    if ($('#'+styleId).length == 0) {
        $('head').prepend('<style id="'+styleId+'"></style>');
    }

    $('#'+styleId).append('\t'+className + "{\n\t\t" + classValue + "\n\t}\n");
};

function getOptions(optionsDfr) {
    chrome.extension.connect().postMessage({type: 'get-defaults'});
    return optionsDfr.promise();
};
        
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
        })
        $('#bannedRules').attr('size', Math.min(10, options.banned.length));
        $('#bannedRules').change(function() {
            var $selected = $('#bannedRules option:selected');
            var count = $selected.length;
            $('#deleteBtn').prop("disabled", count == 0);
        })
        $('#deleteBtn').prop("disabled", true);
        $('#deleteBtn').click(function(e) {
            $('#bannedRules option:selected').remove();

            var banned = {};
            banned['banned'] = $.map($('#bannedRules option'), function(opt) { return opt.value; });
            chrome.storage.sync.set(banned);
        });

        $('#APIcb'+options.API).prop('checked', true);
        $('#CustomAPI')
        .toggle(options.API=='Custom')
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
            $('#CustomAPI').toggle($(this).attr('id')=='APIcbCustom' && isChk);
            showAPI($(this).val());
        });
        showAPI(options.API);
    });
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
            file = Options.CustomAPI;
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
    $('#testPageTry').css('display',(val == '')?'none':'inherit');
}

