$(document).ready(function() {

    getSelectedTab = function() {
        var dfd = $.Deferred();

        chrome.tabs.query({
            "active": true,
            "currentWindow": true
        }, function(tabs) {
            dfd.resolve(tabs[0]);
        });

        return dfd.promise();
    }

    validateTab = function(tab) {
        var dfd = $.Deferred();
        var url = tab.url;

        if (url.indexOf("chrome://") === 0 || url.indexOf("chrome-extension://") === 0) {
            dfd.reject("Warning: Does not work on internal browser pages.");
        } else if (url.indexOf("https://chrome.google.com/extensions/") === 0 || url.indexOf("https://chrome.google.com/webstore/") === 0) {
            dfd.reject("Warning: Does not work on the Chrome Extension Gallery.");
        } else {
            dfd.resolve();
        }

        return dfd.promise();
    }

    scriptDesc = function(script) {
        return (
            script.file ? {
                allFrames: script.allFrames,
                "file": script.content
            } : {
                allFrames: script.allFrames,
                "code": script.content
            }
        )
    }

    loadScripts = function(tabid, scripts, dfr) {
        var options = scriptDesc(scripts.shift());
        chrome.tabs.executeScript(tabid, options, function() {
            if (scripts.length != 0)
                loadScripts(tabid, scripts, dfr);
            else
                dfr.resolve();
        });
        return dfr.promise();
    }

    getTestPageUrl = function() {
        var dfr = $.Deferred();
        var tpu = 'http://apps.esri.ca/templates/WCAGViewer/index.html';
        chrome.storage.sync.get('testPageUrl', function(a) {
            if(a['testPageUrl'] && a['testPageUrl'] != undefined && a['testPageUrl'] != '') {
                tpu = a['testPageUrl'];
            }
            dfr.resolve(tpu);
        });
        return dfr.promise();
    }

    openTestPage = function(e) {
        getTestPageUrl().done(function(testPageUrl) {
            window.open(testPageUrl);
        });
    }

    openOptionsPage = function(e) {
        window.open(chrome.extension.getURL('/inc/html/options.html'),'_blank');
    }

    openHomePage = function(e) {
        window.open('http://pages.pathcom.com/~horiatu/WCAG/index.html','_blank');
    }

    tabId = null

    runAudits = function(e) {
        getSelectedTab().done(
            function(tab) {
                validateTab(tab).always(
                    function(err) {
                        if (err) {
                            alert(err);
                        } else {
                            tabId = tab.id;

                            loadScripts(tab.id, [{
                                allFrames: true,
                                file: true,
                                content: "/inc/js/jquery-2.1.4.min.js"
                            }, {
                                allFrames: true,
                                file: true,
                                content: "/inc/js/axs_testing.js"
                            }, 
                            {
                                allFrames: true,
                                file: true,
                                content: "/inc/js/audit.js"
                            }
                            ], $.Deferred()).done(
                                function() {
                                    try {
                                        chrome.tabs.sendMessage(tabId, {type:'Audit'}, function(results) { 
                                            showResults(results); 
                                        });
                                    } catch (e) {alert(e.message);}
                                });
                        }
                    }
                );
            }
        );
    }

    showResults = function(results) {
        $('#resultsList').html('');
        $('#resultsWrapper').addClass('hide');
        if(!results || results == undefined || results.length == 0)
            return
        var r = {PASS:'', NA:'', FAIL:''};
        $.each(results, function(index, rule){
            //console.log(rule);

            var className = (rule.status=='PASS') ? 'pass' : (rule.status=='FAIL') ? 'fail' : 'na';

            r[rule.status] += '<li class="'+className+(!options[rule.status] ? ' hide' : '')+'" title="'+rule.title+'">';
            r[rule.status] += '<div style="flex-direction: column;">';
            r[rule.status] += '<a href="'+rule.url+'" target="blank">'+rule.name+'</a>';
            if(rule.elements) {
                r[rule.status] += '<div data-index="'+rule.id+'" class="lookup" title="Show '+rule.elements.length+' element'+(rule.elements.length>0?'s':'')+'"></div>'
            }
            r[rule.status] += '</div>';
            r[rule.status] += '</li>\n';
        })

        if(r.FAIL+r.PASS+r.NA != '') {
            $('#resultsWrapper').removeClass('hide');
        }
        $('#resultsList').html('<ul>'+r.FAIL+r.PASS+r.NA+'</ul>');
        $('.lookup').click(showClick);
    }

    showClick = function(e) {
        var hide = $(e.toElement).hasClass('hideElements');
        var index = $(e.toElement).data('index');
        chrome.tabs.sendMessage(tabId, {
                type:'Lookup', 
                index:index, 
                hide: hide,
            }, function(results) { 
                $(e.toElement).toggleClass('hideElements');
            }
        );
    }

    showStat = function($cb) {
        var cls = $cb.attr('id').substr(2).toLowerCase();
        var $rows= $('#resultsList .'+cls);
        var show = $cb.is(':checked');

        if(show) $rows.removeClass('hide') 
        else $rows.addClass('hide');

        var obj = {};
        var key = cls.toUpperCase();
        obj[key] = show;
        chrome.storage.sync.set(obj);
        //chrome.storage.sync.get(null, function (data) { console.info(data) })
        options[key] = show;
    }

    
    $.each($('img'), function(index, value) {
        $value = $(value);
        $value.attr('src', chrome.extension.getURL($value.attr('src'))).attr('alt', '');
    })

    $('#closeBtn').click(function(e) { window.close(); });
    $('#optionsBtn').click(openOptionsPage);
    $('#homeBtn').click(openHomePage);
    $('#sampleBtn').click(openTestPage);

    var options = null

    getSelectedTab().done(
        function(tab) {
            validateTab(tab).always(
                function(err) {
                    if (err) {
                        alert(err);
                    } else {
                        tabId = tab.id;
                        var Background = chrome.extension.getBackgroundPage().Background;
                        Background.getDefaults().done(function(response) {
                        //chrome.runtime.sendMessage({type:'get-defaults'}, function(response) {
                            options = response; 
                            //console.log(options); 

                            if(options.PASS) $('#cbPass').attr('checked','')
                            else $('#cbPass').removeAttr('checked');

                            if(options.NA) $('#cbNA').attr('checked','')
                            else $('#cbNA').removeAttr('checked');

                            $('#filterResults input[type=checkbox]').change(function() {
                                showStat($(this))
                            });

                            $('#runBtn').click(runAudits);

                            chrome.tabs.sendMessage(tabId, {type:'RefreshAudit'}, function(results) { 
                                showResults(results); 
                            });
                        });
                    }
                }
            )
        }
    )

})