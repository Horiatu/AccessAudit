//alert(0);
if(AccessAudit == undefined) {
	var AccessAudit = function() {
	    var _private = {
	 	// 	camel2Words: function(str) {
			//     var arr = str.split("");

			//     for (var i = arr.length - 1; i >= 0; i--) {
			//         if (arr[i].match(/[A-Z]/)) {
			//             arr.splice(i, 0, " ");
			//         }
			//     }
			//     arr[0] = arr[0].toUpperCase();    
			//     return arr.join("");
			// },

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

	        addFilters: function(e) {
	            if(!document.getElementById("svgFilters")) {
	                var s = 
	                    "<svg id='svgFilters' xmlns='http://www.w3.org/2000/svg' style='display:none'>\n"+
						// "	<filter id='fancy-goo'>\n"+
						// "	  <feGaussianBlur in='SourceGraphic' stdDeviation='10' result='blur' />\n"+
						// "	  <feColorMatrix in='blur' mode='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9' result='goo' />\n"+
						// "	  <feComposite in='SourceGraphic' in2='goo' operator='atop'/>\n"+
						// "	</filter>\n"+
						"    <filter id='pinkish'>\n"+
	                    "        <feColorMatrix type='matrix' values='0.393 0.769 0.189 0 0  0.272 0.534 0.131 0 0  0.272 0.534 0.131 0 0  0     0     0     0.95 0'/>\n"+
	                    "    </filter>\n"+
						"    <filter id='blueish'>\n"+
	                    "        <feColorMatrix type='matrix' values='0.272 0.534 0.131 0 0  0.272 0.534 0.131 0 0  0.393 0.769 0.189 0 0  0     0     0     0.95 0'/>\n"+
	                    "    </filter>\n"+
						// "    <filter id='protanopia'>\n"+
	     //                "        <feColorMatrix type='matrix' values='0.56667 0.43333 0.00000 0 0 0.55833 0.44167 0.00000 0 0 0.00000 0.24167 0.75833 0 0 0 0 0 1 0'/>\n"+
	     //                "    </filter>\n"+
	     //                "    <filter id='protanomaly'>\n"+
	     //                "        <feColorMatrix type='matrix' values='0.817 0.183 0 0 0 0.333 0.667 0 0 0 0 0.125 0.875 0 0 0 0 0 1 0'/>\n"+
	     //                "    </filter>\n"+
	     //                "    <filter id='deuteranopia'>\n"+
	     //                "        <feColorMatrix type='matrix' values='0.4251 0.6934 -0.1147 0 0 0.3417 0.5882 0.0692 0 0 -0.0105 0.0234 0.9870 0 0 0 0 0 1 0'/>\n"+
	     //                "    </filter>\n"+
	     //                "    <filter id='deuteranomaly'>\n"+
	     //                "        <feColorMatrix type='matrix' values='0.8 0.2 0 0 0 0.258 0.742 0 0 0 0 0.142 0.858 0 0 0 0 0 1 0'/>\n"+
	     //                "    </filter>\n"+
	     //                "    <filter id='tritanopia'>\n"+
	     //                "        <feColorMatrix type='matrix' values='0.95000 0.05000 0.00000 0 0 0.00000 0.43333 0.56700 0 0 0.00000 0.47500 0.52500 0 0 0 0 0 1 0'/>\n"+
	     //                "    </filter>\n"+
	     //                "    <filter id='tritanomaly'>\n"+
	     //                "        <feColorMatrix type='matrix' values='0.967 0.033 0 0 0 0 0.733 0.267 0 0 0 0.183 0.817 0 0 0 0 0 1 0'/>\n"+
	     //                "    </filter>\n"+
	     //                "    <filter id='achromatopsia'>\n"+
	     //                "        <feColorMatrix type='matrix' values='0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0 0 0 1 0'/>\n"+
	     //                "    </filter>\n"+
	     //                "    <filter id='achromatomaly'>\n"+
	     //                "        <feColorMatrix type='matrix' values='0.618 0.320 0.062 0 0 0.163 0.775 0.062 0 0 0.163 0.320 0.516 0 0 0 0 0 1 0'/>\n"+
	     //                "    </filter>\n"+
	     //                "    <filter id='normalFilter'>\n"+
	     //                "        <feColorMatrix type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0'/>\n"+
	     //                "    </filter>\n"+
	                    "</svg>";

	                $("body").append(s);
	            }
	        },


		}

	    var _public = {
	 		init: function() {
	 			_private.injectCss();

	 			_private.addFilters();

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
							$.each(req.banned, function(i, rule) {
								configuration.ignoreSelectors(rule,'*');
							});
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
									name: audit.rule.name,
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
	}

	AccessAudit().init();
}
