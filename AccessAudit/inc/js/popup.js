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

    openTestPage = function(e) {
        window.open((options.testPageUrl=='') ? options.defaultTestPage : options.testPageUrl,'_blank');
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

                            var apiCode = '';
                            $.ajax({
                                url : "/inc/js/axs_testing.js",
                                    //"https://raw.githubusercontent.com/GoogleChrome/accessibility-developer-tools/stable/dist/js/axs_testing.js",
                                    //"F:/GitHub/AccessAudit/AccessAudit/inc/js/axs_testing.js",
                                dataType: "text",
                                success : function (apiCode) {
                                    loadScripts(tab.id, [{
                                        allFrames: true,
                                        file: true,
                                        content: "/inc/js/jquery-2.1.4.min.js"
                                    }, {
                                        allFrames: true,
                                        file: false,
                                        content: apiCode
                                    }, {
                                        allFrames: true,
                                        file: true,
                                        content: "/inc/js/audit.js"
                                    }
                                    ], $.Deferred()).done(
                                function() {
                                    try {
                                        chrome.tabs.sendMessage(tabId, {type:'Audit', banned:options.banned}, function(results) { 
                                            showResults(results); 
                                        });
                                    } catch (e) {alert(e.message);}
                                });
                                }
                            });
                        }
                    }
                );
            }
        );
    }

    camel2Words = function(str) {
        var arr = str.split("");

        for (var i = arr.length - 1; i >= 0; i--) {
            if (arr[i].match(/[A-Z]/)) {
                arr.splice(i, 0, " ");
            }
        }
        arr[0] = arr[0].toUpperCase();    
        return arr.join("");
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

            r[rule.status] += '<li data-name="'+rule.name+'" data-index="'+rule.id+'" data-url="'+rule.url+'" class="'+className+(!options[rule.status] ? ' hide' : '')+'" title="'+rule.title+'">';
            r[rule.status] += '<table><tr>';
            r[rule.status] += '<td class="ruleSeverity">';
            var brokeRules = rule.elements ? (': '+rule.elements.length+' element'+(rule.elements.length>0?'s':'')+' broke this rule.') : '';
            var title = rule.status=='FAIL' ? '' : 'Would be ';
            var img ='';
            switch (rule.severity) {
                case 'Severe' : 
                    title +='Severe';
                    img = 'severe';
                    break;
                case 'Warning' :
                    title +='Warning';
                    img = 'warning';
                    break;
            }
            r[rule.status] += '<img src="/images/'+img+'.png" title="'+title+brokeRules+'"></img>'
            r[rule.status] += '</td>';
            r[rule.status] += '<td class="ruleName">'+camel2Words(rule.name)+'</td>';
            //r[rule.status] += '<td class="ruleMenu"><img src="/images/menu.png" title="Options"></img></td>'
            r[rule.status] += '</tr></table>';
            r[rule.status] += '</li>\n';
        })

        if(r.FAIL+r.PASS+r.NA != '') {
            $('#resultsWrapper').removeClass('hide');
        }
        $('#resultsList').html('<ul>'+r.FAIL+r.PASS+r.NA+'</ul>');
        $('.fail .ruleSeverity').click(showClick);
        $('.fail .ruleName').click(showClick);

        $('.pass .ruleSeverity img').css('opacity', 0.25);
        $('.na .ruleSeverity img').css('opacity', 0.25);

         $(function() {
            var context = $('#resultsList').nuContextMenu({

                items: '.ruleName',

                callback: function(key, element) {
                    switch (key) {
                        case 'info' :
                            window.open($(element).closest('li').data('url'),'_blank');
                            break;
                        case 'remove' :
                            console.log($(element));
                            options.banned.push($(element).closest('li').data('name'));
                            saveOption('banned', options.banned);

                            alert('Rule "'+element.innerHTML+'" '+
                                'has been removed from further audits.\n\n'+
                                'To restore it, open the Options Page.\n');
                            $(element).closest('li').remove();
                            context.nuContextMenu('close');
                            break;
                        case 'cancel' :
                            context.nuContextMenu('close');
                            break;
                    }
                },

                menu: {
                    'info': {
                        title: 'Show More Info',
                        // Font awesome icons here
                        //icon: 'archive',
                    },

                    'remove': {
                        title: 'Remove from Tests',
                    },

                    'void': 'separator',

                    'cancel': {
                        title: 'Cancel',
                    },
                }
            });
        });
    }

    showClick = function(e) {
        var $e = $(e.toElement).closest('li');
        var hide = $e.hasClass('hideElements');
        var index = $e.data('index');
        chrome.tabs.sendMessage(tabId, {
                type:'Lookup', 
                index:index, 
                hide: hide,
            }, function(results) { 
                $e.toggleClass('hideElements');
            }
        );
    }

    showStat = function($cb) {
        var cls = $cb.attr('id').substr(2).toLowerCase();
        var $rows= $('#resultsList .'+cls);
        var show = $cb.is(':checked');

        if(show) $rows.removeClass('hide') 
        else $rows.addClass('hide');

        saveOption(cls.toUpperCase(), show);
    }

    saveOption = function(key, value) {
        var obj = {};
        obj[key] = value;
        chrome.storage.sync.set(obj);
        //chrome.storage.sync.get(null, function (data) { console.info(data) })
        options[key] = value;
    }

    $.each($('img'), function(index, value) {
        $value = $(value);
        $value.attr('src', chrome.extension.getURL($value.attr('src'))).attr('alt', '');
    })

    $('#closeBtn').click(function(e) { window.close(); });
    $('#optionsBtn').click(openOptionsPage);
    $('#homeBtn').click(openHomePage);
    $('#sampleBtn').click(openTestPage);
    
    var options = null;

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