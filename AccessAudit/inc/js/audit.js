if(AccessAudit === undefined) {
	var AccessAudit = function() {
	    var _private = {

			results: [],

			injectCss: function() {
		        var _injectCss = function(css) {
		            if ($("head").length === 0) {
	                    $("body").before(css);
	                } else {
	                    $("head").append(css);
	                }
		        };

	            if(!document.getElementById("AccessAuditCss")) {
	            	_injectCss('<link id="AccessAuditCss" rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('/inc/css/AccessAudit.css') + '" />');
	            }
	     	},

			els : [],

	        getElementsAtPoint : function(ev) {
		        var x = ev.clientX;
		        var y = ev.clientY;
	        	ev.stopPropagation();
	        	ev.preventDefault();
	        	if (
					(ev.ctrlKey || controlKeys.indexOf("keyCtrl")==-1) &&
					(ev.altKey || controlKeys.indexOf("keyAlt")==-1) &&
					(ev.shiftKey || controlKeys.indexOf("keyShift")==-1)
				) {
					$('#AccessAuditOvr').hide();
					$('#AccessAuditInfo').remove();
					var el = document.elementFromPoint(x, y);
					el.click();
					$('#AccessAuditOvr').show();
					return;
				}

			    _private.els = _private.elementsFromPoint(x, y, ".AccessAuditMarker");
			    if (_private.els.length > 0) {
			        //console.log(els);
			        if($('#AccessAuditInfo').length===0) {
			        	$('body').append('<div id="AccessAuditInfo"/>');
			        }
			        $('#AccessAuditInfo>*').remove();
			        var plural = ( _private.els.length>1?"s":"");
			    	$('#AccessAuditInfo').append("<div class='infoHeader' title='Look in Console.Info for element selector"+plural+".'>"+ _private.els.length+" Broken Rule"+plural+"</div>" );
			    	$('.infoHeader').append('<img id="infoClose" src="'+chrome.extension.getURL('/images/x.png')+'" title="close">');
			    	$('#infoClose').click(function() {
			    		$('#AccessAuditInfo').remove();
			    	});
			    	$.each(_private.els, function(index, element) {
			    		console.info(element);
			    		var code = '';
			    		var aatitle = element.attributes['data-aatitle'].value;
			    		code += '<div style="max-width:300px;">'+element.attributes['data-aadescription'].value+'</div>';

			    		switch(aatitle) {
			    			case 'imagesWithoutAltText':
			    			 	code += _private.forceAltText(index);
			    			 	break;
			    			case 'lowContrastElements':
			    				code += _private.forceLowContrast(element, index);
			    				break;
			    			case 'tableHasNoAppropriateHeaders':
			    				code += _private.forceNoHeaders(element, index);
			    				break;
			    		}

			    		$('#AccessAuditInfo').append("<div class='infoElement' data-AAtitle='"+aatitle+"'>"+code+"</div>");
			    	});

			    	_private.addForceButtonsEvents();

			    	$.each($('.infoElement'), function(i, element){
			    		var $el = $(_private.els[i]);
			    		$(element).hover(
			    			function() {
			    				$(_private.els).removeClass("AccessAuditMarker");
						    	$(this).addClass("highlightInfo");
						    	$el.addClass("AccessAuditHighlight");
							},
							function() {
								$(_private.els).addClass("AccessAuditMarker");
								$(this).removeClass("highlightInfo");
						    	$el.removeClass("AccessAuditHighlight");
							}
						);
			    	});

			        var d = 4;
			        var W = window.innerWidth;
			        var H = window.innerHeight;
			        var w = $('#AccessAuditInfo').width() + d;
			        var h = $('#AccessAuditInfo').height() + d;

			        $('#AccessAuditInfo')
			        	.css('left',(ev.pageX + (x+w<W ? d : -w))+'px')
			        	.css('top',(ev.pageY + (y+h<H ? d : -h))+'px');
			    } else {
			    	$('#AccessAuditInfo').remove();
			    }
	        },

	        processOvrKeys: function(ev) {
	        	console.log(ev);
	        	switch (ev.keyCode) {
	        		case 13 :
	        			$('.ovrInstructions h1, .ovrInstructions div').toggle('hide');
			        	ev.stopPropagation();
			        	ev.preventDefault();
	        			break;
	        		case 27 :
	        			_private.clearOvr();
			        	ev.stopPropagation();
			        	ev.preventDefault();
	        			break;
	        	}
	        },
	        //hoverInfoElement : null,

	        addForceButtonsEvents : function() {
		    	$.each($('.forceAltText'), function(i, element){
		    		var $btnShow = $(this);
		    		$btnShow.click(function() {
			    		// $btnShow.parent("label").hide();
			    		var $radios = $btnShow.closest("div").find("label, br, img:not(.forceAltTextExecute)").hide();
			    		var $forceAltTextDiv = $radios.closest("div").find(".forceAltTextDiv");
			    		$forceAltTextDiv.show();
			    		$forceAltTextDiv.find('input').focus().keyup(function(e) {
			    			if(e.keyCode===13) {
			    				e.stopPropagation();
			        			e.preventDefault();
			    				$forceAltTextDiv.find('.forceAltTextExecute').trigger('click');
			    			}
			    		});
		    		});
		    	});
		    	$.each($('.addRolePresentation'), function(i, element){
		    		var $btnShow = $(this);
		    		$btnShow.click(function() {
			    		// $btnShow.parent("label").hide();
			    		var $radios = $btnShow.closest("div").find("label, br, img:not(.forceAltTextExecute)").hide();
			    		// var $forceAltTextDiv = $radios.closest("div").find(".forceAltTextDiv");
			    		// $forceAltTextDiv.show();
			    		// $forceAltTextDiv.find('input').focus().keyup(function(e) {
			    		// 	if(e.keyCode===13) {
			    		// 		e.stopPropagation();
			      //   			e.preventDefault();
			    		// 		$forceAltTextDiv.find('.forceAltTextExecute').trigger('click');
			    		// 	}
			    		// });
		    		});
		    	});

		    	$.each($('.forceAltTextExecute'), function(i, element){
		    		$(this).click(function() {
		    			var index = Number($(this).attr('data-index'));
		    			var el = _private.els[index];
		    			if(el!==null)
		    			{
		    				var altText = $(this).parent('.forceAltTextDiv').find('input[type=text]').val();
		    				if(altText==='') {
		    					$(el).removeAttr('alt');
		    				} else {
		    					$(el).attr('alt', altText.trim());
		    					$(el).attr('data-comment', 'add Alt Text: "'+altText.trim()+'"');
		    				}
		    				//console.info(el);
		    			}
		    		});
		    	});
		    	$('#suggestBtn').unbind('click').bind('click', function() {
	        		$(this).parent('div').parent('div').find('#suggestions').show();
	        		$(this).hide();
	        	});
				$.each($('.forceColor img'), function(i, element){
		    		$(this).click(function() {
		    			var index = Number($(this).attr('data-index'));
		    			var el = _private.els[index];
		    			if(el!==null)
		    			{
		    				var $div = $(this).closest('div');
		    				$(el).css('color', $div.css('color'));
		    				$(el).css('background-color', $div.css('background-color'));
		    				$(el).attr('data-comment', 'set colors to'+$div.text()+'.');
		    			}
		    		});
		    	});

		    	$.each($('.forceNoHeaders img'), function(i, element){
		    		$(this).click(function() {
		    			var index = Number($(this).attr('data-index'));
		    			var el = _private.els[index];
		    			if(el!==null)
		    			{
		    				var $table = $(this).closest('table');
		    				$(el).attr('role', 'presentation');
		    				$(el).attr('data-comment', 'set role to "presentation"');
		    			}
		    		});
		    	});
		    },

	        forceAltText : function(index) {
	        	var addInCode =
	        	'<img src="'+chrome.extension.getURL("/images/suggest.png")+'" class="forceButton" title="Choose an option"/>'+
	        	'<label>'+
	        	'<input type="radio" name="imgWithoutAlt" value="altText" class="forceAltText">Force Alt Text'+
	        	'</label><br/>'+
	        	'<label>'+
	        	'<input type="radio" name="imgWithoutAlt" value="rolePresentation" class="addRolePresentation">Add Presentational Role'+
	        	'</label>'+
	        	'<div class="forceAltTextDiv">'+
	        	'<input type="text" placeholder="enter Alt text here"></input>'+
				'<img src="'+chrome.extension.getURL("/images/force.png")+'" class="forceButton forceAltTextExecute" title="force Alt text" data-index="'+index+'"/>'+
				'</div>';
	        	return addInCode;
	        },

	        forceLowContrast : function(element, index) {
	        	var b = axs.properties.getContrastRatioProperties(element);
	        	var code = '<div class="contrast">';
	        	code += '<div>This';
	        	code += '&nbsp;<span ';
	        	code += 'style="background-color:'+b.backgroundColor+'; color:'+b.foregroundColor+'; border:solid 1px '+b.foregroundColor+';" ';
				code += 'title="'+b.foregroundColor+' on '+b.backgroundColor+'"';
	        	code += '>&nbsp;Element&nbsp;</span>&nbsp;';
	        	code += 'has the contrast: '+b.value+':1';
	        	if(b.suggestedColors && b.suggestedColors !== undefined){
		        	code += '<img id="suggestBtn" src="'+chrome.extension.getURL('/images/suggest.png')+'" title="suggest colors">';
		        	code += '</div>';
	        		code += '<div id="suggestions" style="display:none;">';
	        		code += '<Span>Suggestions:</Span><br/>';
	        		for (var k in b.suggestedColors) {
	        			var bg = b.suggestedColors[k].bg;
	        			var fg = b.suggestedColors[k].fg;
	        			code += '<div style="background-color:'+bg+'; color:'+fg+'; border:solid 1px '+fg+'; " class="forceColor">&nbsp;';
	        			code += fg+' on '+bg+' - '+b.suggestedColors[k].contrast+':1 (for '+k+')&nbsp;';
	        			code += '<img src="'+chrome.extension.getURL("/images/force.png")+'" class="forceButton" title="force color" data-index="'+index+'"/>';
	        			code += '</div>';
	        		}
	        		code += '</div>';
	        	}
	        	else
	        		code += '</div>';
	        	//code += '</div>';

	        	return code;
	        },

	        forceNoHeaders : function(element, index) {
	        	var code = '<br/><div class="forceNoHeaders">';
	        	code += 'Add "Presentation" role to table';
      			code += '<img src="'+chrome.extension.getURL("/images/force.png")+'" class="forceButton" title="add Presentation role" data-index="'+index+'"/>';
	        	code += '</div>';
	        	return code;
	        },

	        elementsFromPoint : function (x, y, selector) {
				var elements = [], previousPointerEvents = [], current, i, d;

			    // get all elements via elementFromPoint, and remove them from hit-testing in order
				while ((current = document.elementFromPoint(x,y)) && elements.indexOf(current)===-1 && current !== null) {

			        // push the element and its current style
					elements.push(current);

					previousPointerEvents.push({
						element: current,
		                value: current.style.getPropertyValue('pointer-events'),
		                priority: current.style.getPropertyPriority('pointer-events')
		            });

			        // add "pointer-events: none", to get to the underlying element
					current.style.setProperty('pointer-events', 'none', 'important');
				}

			    // restore the previous pointer-events values
				for(var ii = previousPointerEvents.length; --ii>=0; ) {
					var dd = previousPointerEvents[ii];
					if(dd && dd.element)
					{
						if(dd.value && dd.value !== "")
						{
							dd.element.style.setProperty('pointer-events', dd.value?dd.value:'', dd.priority);
						}
						else
						{
			                dd.element.style.removeProperty ('pointer-events');
						}
					}
				}

			    if(selector && selector !== undefined && selector !=='') {
			    	elements = $(elements).filter(selector).toArray();
			    }
			    return elements;
			},

	        addFilters: function() {
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
	                    "</svg>";

	                $("body").append(s);
	            }
	        },

	        createXPathFromElement: function(elm) {
			    var allNodes = document.getElementsByTagName('*');
			    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode)
			    {
			    	if(elm.tagName.toLowerCase()=='html')
			    		continue; // !!! make it an option
			        if (elm.hasAttribute('id')) {
			                var uniqueIdCount = 0;
			                for (var n=0; n < allNodes.length; n++) {
			                    if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++;
			                    if (uniqueIdCount > 1) break;
			                }
			                if ( uniqueIdCount == 1) {
			                    segs.unshift('id("' + elm.getAttribute('id') + '")');
			                    return segs.join('/');
			                } else {
			                    segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
			                }
			        } else if (elm.hasAttribute('class')) {
			            segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]');
			        } else {
			            for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
			                if (sib.localName == elm.localName)  i++;
			            }
			            segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
			        }
			    }
			    return segs.length ? '/' + segs.join('/') : null;
			},

			getResultData: function(result) {
				return $(result.elements).map(function(i,e) {
					var d = {path:_private.createXPathFromElement(e)};
					var comment = $(e).attr('data-comment');
					if(comment && comment!==undefined) {
						d.comment = comment;
					}
					return d;
				});
			},

			clearOvr: function() {
				$('.AccessAuditMarker')
        			.removeAttr('data-AAtitle')
					.removeAttr('data-AAdescription')
    				.removeClass('AccessAuditMarker')
    				.removeClass('AccessAuditHighlight')
    				.removeClass('forceVisible')
	        		.removeClass('.AccessAudit*');
	    		$('#AccessAuditOvr').remove();

	    		$('#AccessAuditInfo').remove();
	    		$('#svgFilters').remove();
	    		$('#AccessAuditCss').remove();
	    		//$('#AccessAuditPlusCss').remove();
			}
		};

	    var _public = {
	 		init: function() {
	 			_private.injectCss();

	 			_private.addFilters();

	 			chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
				    switch (req.type) {
				    	case 'dumpElements' :
				    		var resultsByRule = _private.results.filter(function(r) { return r.name === req.rule; });
				    		if(resultsByRule && resultsByRule.length>=1)
				    		{
					    		var elementsByRule = resultsByRule[0].elements;
					    		$.each(elementsByRule, function(index, element) {
	                                console.info(element);
	                            });
					    		sendResponse(elementsByRule);
					    	}
					    	else {
				    			sendResponse(null);
				    		}
				    		break;
				    	case 'RefreshAudit':
				    		_private.clearOvr();

				    		if(_private.results !== undefined && _private.results && _private.results.length>0)
				    			$.each(_private.results, function(i, result) {
				    				result.data = _private.getResultData(result);
				    			});
				    			sendResponse(_private.results);
				    		break;
				        case 'Audit':
							var configuration = new axs.AuditConfiguration();
							$.each(req.banned, function(i, rule) {
								configuration.ignoreSelectors(rule,'*');
							});

							configuration.showUnsupportedRulesWarning = false;

							$('.AccessAuditMarker')
			        			.removeAttr('data-AAtitle')
								.removeAttr('data-AAdescription')
		        				.removeClass('AccessAuditMarker')
		        				.removeClass('AccessAuditHighlight')
		        				.removeClass('forceVisible')
		        				.removeClass('.AccessAudit*');
		        			$('#AccessAuditOvr').remove();

							var audits = axs.Audit.run(configuration);
							var results = [];
							var id = 0;
							$.each(audits, function(index, audit){
								var elementsCount = 0;
								var title = audit.rule.heading;
							    if(audit.elements && audit.elements !== undefined && audit.elements.length>0) {
							    	elementsCount = audit.elements.length;
							    //     title+= ' ('+elementsCount+')';
							    }

							    var result = {
							    	id: 'AccessAudit'+id++,
									status: audit.result,
									name: audit.rule.name,
									title: title,
									severity: audit.rule.severity,
									url: audit.rule.url
								};

								if(elementsCount>0) {
									result.elements = audit.elements;
									result.data = _private.getResultData(result);
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
				        				.removeClass('AccessAuditHighlight')
				        				.removeClass('forceVisible')
				        				.removeClass(ndx);
				        			if($('.AccessAuditMarker, .AccessAuditHighlight').length===0 && document.getElementById("AccessAuditOvr")) {
				        				$('#AccessAuditOvr').unbind("click");
				        				$('#AccessAuditOvr').remove();
				        				$('#AccessAuditInfo').remove();
				    					$('#svgFilters').remove();
				    					$('#AccessAuditCss').remove();
				    					//$('#AccessAuditPlusCss').remove();
				        			}
						                jQuery(document).unbind('keydown').unbind('keyup');
						        	sendResponse(0);
				        			break;
				        		case false :
						        	var auditss = _private.results.filter(function(a) { return a.id === ndx; });
						        	if(auditss && auditss.length > 0) {
							        	var $elements = $(auditss[0].elements);
						        		var $els = $elements.filter(function(e) { return !$(e).hasClass(ndx); });
					        			$els.addClass(ndx)
					        			    .addClass('AccessAuditMarker')
					        			    .attr('data-AAtitle', auditss[0].name)
										    .attr('data-AAdescription', auditss[0].title);

										$.each($('.AccessAuditMarker'), function(i, hid) {
											try {
												//console.log(hid);
												if(axs.utils.isElementOrAncestorHidden(hid)) {
													$(hid).addClass('forceVisible');
												}
											} catch (e) {}
										});

					        			//debugger;
										if(!document.getElementById("AccessAuditOvr")) {
						                    $("body").append('<div id="AccessAuditOvr" tabindex="0">'+
						                    	'<div class="ovrInstructions left">'+
						                    	'<img src="'+chrome.extension.getURL('images/logos/32.png')+
						                    	'" alt="Access Audit">'+
						                    	'<h1>Access Audit Inspect Mode</h1>'+
						                    	'<div class="clear"/>'+
						                    	'<div class="ovrInstructionsText">'+
						                    	'<ul>'+
						                    	'<li>Type <myKey>Return</myKey> to toggle these instructions.</li>'+
						                    	'<li>Type <myKey>Esc</myKey> to end Access Audit Inspect Mode.</li>'+
						                    	'<li>Use configured <myKey>Pass Through</myKey> key(s) to send mouse events to the web page.'+
						                    	'<li>Click&nbsp;<span class="AccessAuditMarker">&nbsp;Highlighted&nbsp;</span>&nbsp;elements to popup a menu of options.'+
						                    	'</ul>'+
						                    	'</div>'+
						                    	'</div></div>');
											$('#AccessAuditOvr').bind("click", _private.getElementsAtPoint);
											var $logo=$("#AccessAuditOvr .ovrInstructions div, #AccessAuditOvr .ovrInstructions img");
											$logo.mouseover(function(event) {
												// console.log("mouseOver", event);
												$('.ovrInstructions').toggleClass('left').toggleClass('right');
											});
											$('#AccessAuditOvr').keyup(_private.processOvrKeys);
											_private.injectCss();
											_private.addFilters();
						                }
						                controlKeys = req.controlKeys;
						        		sendResponse(1);
					        		}
				        			break;
				        	}
				        	break;
				    }
				});
			}
		};

	    return _public;
	};

	AccessAudit().init();
}
