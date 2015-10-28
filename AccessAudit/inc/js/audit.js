if(AccessAudit == undefined) {
	var AccessAudit = function() {
	    var _private = {
	 		camel2Words: function(str) {
			    var arr = str.split("");

			    for (var i = arr.length - 1; i >= 0; i--) {
			        if (arr[i].match(/[A-Z]/)) {
			            arr.splice(i, 0, " ");
			        }
			    }
			    arr[0] = arr[0].toUpperCase();    
			    return arr.join("");
			},

			results: [],

			injectCss: function() {
	            if(!document.getElementById("AccessAuditCss")) {
	                _private._injectCss('<link id="AccessAuditCss" rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('/inc/css/AccessAudit.css') + '" />');
	            }
	        },

	        _injectCss : function(css) {
	            if ($("head").length == 0) {
	                    $("body").before(css);
	                } else {
	                    $("head").append(css);
	                }
	        },

		}

	    var _public = {
	 		init: function() {
	 			_private.injectCss();

				chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
				    switch (req.type) {
				        case 'Audit':
							var configuration = new axs.AuditConfiguration();
							//configuration.ignoreSelectors('lowContrastElements', '.pretty');
							configuration.showUnsupportedRulesWarning = false;
							var audits = axs.Audit.run(configuration);
							//console.log(audits);

							var results = [];
							var id = 0;
							$.each(audits, function(index, audit){
								var elementsCount = 0;
								var title = audit.result+': '+audit.rule.heading;
							    if(audit.elements && audit.elements != undefined && audit.elements.length>0) {
							    	elementsCount = audit.elements.length;
							    //     title+= ' ('+elementsCount+')';
							    };
							    var result = {
							    	id: 'AccessAudit'+id++,
									status: audit.result, 
									name: _private.camel2Words(audit.rule.name),
									title: title,
									url: audit.rule.url
								}
								if(elementsCount>0) {
									result.elements = audit.elements;
								}
								results.push(result);
							});

							console.log(results);        	
							sendResponse(_private.results = results);
				            break;
				        case 'Lookup' :
				        	var ndx = req.index;
				        	switch (req.hide) {
				        		case true :
				        			$('.'+ndx).removeClass('AccessAuditWrapper').removeClass(ndx)//.unwrap();
						        	sendResponse(0);
				        			break;
				        		case false :
						        	var audits = _private.results.filter(function(a) { return a.id === ndx; });
						        	if(audits && audits.length > 0) {
							        	var $elements = $(audits[0].elements);	
						        		var title = audits[0].name;
					        			var $els = $elements.filter(function(e) { return !$(e).hasClass(ndx)}) 
					        			$els.addClass(ndx);
					        			$els.addClass('AccessAuditWrapper');
					        			//$els.wrap('<div class="AccessAuditWrapper" title="'+title+'">');
						        		sendResponse(1);
					        		}
				        			break;
				        	}
				        	break;
				    }
				});
			}
		}

	    return _public;
	}();

	AccessAudit.init();
}
