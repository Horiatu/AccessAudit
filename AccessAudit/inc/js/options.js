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

    getOptions(optionsDfr).done(function(options) {
        $('#testPageUrl').val(options.testPageUrl);
        testPageUrlChanged(options.testPageUrl);
    });
}

function testPageUrlChanged(val) {
    chrome.storage.sync.set({
        'testPageUrl': val
    });
    $('#testPageTry').css('display',(val == '')?'none':'inherit');
}

