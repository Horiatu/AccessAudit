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

	        getElementsAtPoint : function(ev) {
	        	ev.stopPropagation();
	        	ev.preventDefault();
		        var x = ev.clientX;
		        var y = ev.clientY;
			    var els = _private.elementsFromPoint(x, y, ".AccessAuditMarker");
			    if (els.length > 0) {
			        //console.log(els);
			        if($('#AccessAuditInfo').length==0) {
			        	$('body').append('<div id="AccessAuditInfo"/>');
			        }
			        $('#AccessAuditInfo>*').remove();
			    	$('#AccessAuditInfo').append("<div class='infoHeader'>"+els.length+" Broken Rule"+(els.length>1?"s":"")+"</div>" );
			    	$.each(els, function(index, element) {
			    		console.info(element);
			    		var code = '';
			    		//code += '<div>'+element.attributes['data-aatitle'].value+'</div>';
			    		code += '<div style="max-width:300px;">'+element.attributes['data-aadescription'].value+'</div>';
			    		$('#AccessAuditInfo').append("<div class='infoElement'>"+code+"</div>");
			    	})
			        
			        var d = 4;
			        var W = window.innerWidth;
			        var H = window.innerHeight;
			        var w = $('#AccessAuditInfo').width() + d;
			        var h = $('#AccessAuditInfo').height() + d;

			        $('#AccessAuditInfo')
			        	.css('left',(ev.pageX + (x+w<W ? d : -w))+'px')
			        	.css('top',(ev.pageY + (y+h<H ? d : -h))+'px')
			    } else {
			    	$('#AccessAuditInfo').remove();
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
				    	case 'RefreshAudit':
		    				$('.AccessAuditMarker')
			        			.removeAttr('data-AAtitle')
								.removeAttr('data-AAdescription')
		        				.removeClass('AccessAuditMarker')
		        				.removeClass('.AccessAudit*');

				    		$('#AccessAuditOvr').remove();
				    		$('#AccessAuditInfo').remove();

				    		if(_private.results != undefined && _private.results && _private.results.length>0)
				    			sendResponse(_private.results);
				    		break;
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
									severity: audit.rule.severity,
									url: audit.rule.url
								}
								if(elementsCount>0) {
									result.elements = audit.elements;
								}
								results.push(result);
							});

							//console.log(results);        	
							sendResponse(_private.results = results);
				            break;
				        case 'Lookup' :
				        	var ndx = req.index;
				        	switch (req.hide) {
				        		case true :
				        			$('.'+ndx)
					        			.removeAttr('data-AAtitle')
										.removeAttr('data-AAdescription')
				        				.removeClass('AccessAuditMarker')
				        				.removeClass(ndx)
				        			if($('.AccessAuditMarker').length==0 && document.getElementById("AccessAuditOvr")) {
				        				$("#AccessAuditOvr").unbind("click");
				        				$("#AccessAuditOvr").remove();
				        			}
						        	sendResponse(0);
				        			break;
				        		case false :
						        	var audits = _private.results.filter(function(a) { return a.id === ndx; });
						        	if(audits && audits.length > 0) {
							        	var $elements = $(audits[0].elements);	
						        		var $els = $elements.filter(function(e) { return !$(e).hasClass(ndx)}) 
					        			$els.addClass(ndx)
					        			    .addClass('AccessAuditMarker')
					        			    .attr('data-AAtitle', audits[0].name)
										    .attr('data-AAdescription', audits[0].title);
					        			
										if(!document.getElementById("AccessAuditOvr")) {
						                    $("body").append('<div id="AccessAuditOvr"></div>');
											$("#AccessAuditOvr").bind("click", _private.getElementsAtPoint);
						                }

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
