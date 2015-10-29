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

	        elMouseEnter : function(e) {
	        	//debugger;
	        },

	        elMouseLeave : function(e) {
	        	//debugger;
	        },

	        getElementsAtPoint : function(ev) {
			    var els = _private.elementsFromPoint(ev.clientX, ev.clientY, ".AccessAuditMarker");
			    if (els.length > 0) {
			        console.log(els);
			    }
	        },

	        elementsFromPoint : function (x, y, selector) {
				var elements = [], previousPointerEvents = [], current, i, d;

			    // get all elements via elementFromPoint, and remove them from hit-testing in order
				while ((current = document.elementFromPoint(x,y)) && elements.indexOf(current)===-1 && current != null) {
			        
			        // push the element and its current style
					elements.push(current);
					
					previousPointerEvents.push({
		                value: current.style.getPropertyValue('pointer-events'),
		                priority: current.style.getPropertyPriority('pointer-events')
		            });
			          
			        // add "pointer-events: none", to get to the underlying element
					current.style.setProperty('pointer-events', 'none', 'important');
				}

			    // restore the previous pointer-events values
				for(i = previousPointerEvents.length; d=previousPointerEvents[--i]; ) {
					elements[i].style.setProperty('pointer-events', d.value?d.value:'', d.priority); 
				}
			      
			    if(selector && selector != undefined && selector !='') {
			    	elements = $(elements).filter(selector).toArray();
			    }
			    return elements;
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
								var title = audit.rule.heading;
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
				        			$('.'+ndx).removeClass('AccessAuditMarker').removeClass(ndx)//.unwrap();
					        			.removeAttr('data-AAtitle')
										.removeAttr('data-AAdescription')
					        			.unbind("mouseenter")
										.unbind("mouseleave");
						        	sendResponse(0);
				        			break;
				        		case false :
						        	var audits = _private.results.filter(function(a) { return a.id === ndx; });
						        	if(audits && audits.length > 0) {
							        	var $elements = $(audits[0].elements);	
						        		var title = audits[0].name;
					        			var $els = $elements.filter(function(e) { return !$(e).hasClass(ndx)}) 
					        			$els.addClass(ndx);
					        			$els.addClass('AccessAuditMarker')
					        			    .attr('title', audits[0].name)
										    .attr('data-AAtitle', audits[0].name)
										    .attr('data-AAdescription', audits[0].title)
					        			    .bind('mouseenter', _private.elMouseEnter)
					        			    .bind('mouseleave', _private.elMouseLeave);
					        			
					        			//$els.wrapInner('<div class="AccessAuditWrapper" title="'+title+'">');
										
										document.addEventListener("click", _private.getElementsAtPoint);

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
