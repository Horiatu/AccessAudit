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

    restore_options($.Deferred());
});

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
        

// Restores select box state to saved value from localStorage.
function restore_options(optionsDfr) {
    chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
        switch (req.type) {
            case 'defaults':
                optionsDfr.resolve(req);
                break;
        }
    });

    var Background = chrome.extension.getBackgroundPage().Background;
    Background.getDefaults().done(function(options) {
    //getOptions(optionsDfr).done(function(options) {
        console.log(options);
        $('#testPageUrl').val(options.testPageUrl);
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

