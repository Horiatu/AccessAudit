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

    loadScripts = function(scripts, dfr) {
        var options = scriptDesc(scripts.shift());
        chrome.tabs.executeScript(page.id, options, function() {
            if (scripts.length != 0)
                loadScripts(scripts, dfr);
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

    page = {id:null, title:null, url:null, favIconUrl:null}

    runAudits = function(e) {
        getSelectedTab().done(
            function(tab) {
                validateTab(tab).always(
                    function(err) {
                        if (err) {
                            alert(err);
                        } else {
                            page.id = tab.id;

                            var apiCode = '';
                            $.ajax({
                                url : (options.API=="Internal") ? options.InternalAPI : (options.API=="Latest") ? options.LatestAPI : options.CustomAPI,
                                    //"/inc/js/axs_testing.js",
                                    //"https://raw.githubusercontent.com/GoogleChrome/accessibility-developer-tools/stable/dist/js/axs_testing.js",
                                    //"F:/GitHub/AccessAudit/AccessAudit/inc/js/axs_testing.js",
                                dataType: "text",
                                success : function (apiCode) {
                                    loadScripts([{
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
                                        chrome.tabs.sendMessage(page.id, {type:'Audit', banned:options.banned}, function(results) { 
                                            showResults(results); 
                                        });
                                    } catch (e) {alert(e.message);}
                                });
                                },
                                error : function(e) { console.log({ajax:e})}
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

        var openReport = function() {
            var addRule = function(rule) {
                //reportBody+='<h4>'+camel2Words(rule.name)+'</h4>';
                reportBody+='<h4 class="description '+rule.status.toLowerCase()+' '+rule.severity+'">'+rule.title+'</h4>';
                reportBody+='<a class="ruleUrl" href="'+rule.url+'" target="_blank">'+rule.url+'</a>';
                if(rule.paths) {
                    reportBody += '<p>'+rule.paths.length+' element'+(rule.paths.length!=1?'s':'')+' break'+(rule.paths.length==1?'s':'')+' this rule:</p>';
                    reportBody += '<ol start="1">'
                    $.each(rule.paths, function(i, p){
                        reportBody += '<li>'+p+'</li>'
                    });
                    reportBody += '</ol>'
                }
            }
            if(!results || results == undefined || results.length == 0)
                return;

            var reportBody = "";

            var statLbls = ['FAIL'];
            if(options.PASS) statLbls.push('PASS');
            if(options.NA) statLbls.push('NA');

            var comments = 
            {
                FAIL:'This implies that there were elements on the page that did not pass this audit rule. This is the only result you will probably be interested in.',
                PASS:'This implies that there were elements on the page that may potentially have failed this audit rule, but they passed. Congratulations!',
                NA:'This implies that there were no elements on the page that may potentially have failed this audit rule. For example, an audit rule that checks video elements for subtitles would return this result if there were no video elements on the page.'
            };

            $.each(statLbls, function(l, stat) {
                var fs = $(results).filter(function(i,r) {return r.status==stat});
                if(fs.length>0) {
                    reportBody += '<h2>There are '+fs.length+' '+stat.toLowerCase()+'-rule'+(fs.length==1?'':'s')+':</h2>';
                    reportBody += '<p class="note">'+comments[stat]+'</p>'

                    $.each(['Severe','Warning'], function(j, svr) {
                        var svrRules = $(fs).filter(function(i,r) {return r.severity==svr});
                        if(svrRules.length>0) {
                            reportBody += '<h3>'+svrRules.length+(stat!='FAIL'?' would be ':' ')+svr+':</h2>';

                            $.each(svrRules, function(k, rule){
                                addRule(rule);
                            });
                        }
                    })
                }
            })

            Background.openReport(page, reportBody,'',new Date());
        };

        $('#exportBtn').unbind('click').bind('click', openReport);
    }

    showClick = function(e) {
        var $e = $(e.toElement).closest('li');
        var hide = $e.hasClass('hideElements');
        var index = $e.data('index');
        chrome.tabs.sendMessage(page.id, {
                type:'Lookup', 
                index:index, 
                hide: hide,
                controlKeys : options.controlKeys,
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
    var Background = null;

    getSelectedTab().done(
        function(tab) {
            validateTab(tab).always(
                function(err) {
                    if (err) {
                        alert(err);
                    } else {

                        page.id = tab.id;
                        page.title = tab.title;
                        page.url = tab.url;
                        page.favIconUrl = tab.favIconUrl;

                        Background = chrome.extension.getBackgroundPage().Background;
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

                            chrome.tabs.sendMessage(page.id, {type:'RefreshAudit'}, function(results) { 
                                showResults(results); 
                            });
                        });
                    }
                }
            )
        }
    )
})