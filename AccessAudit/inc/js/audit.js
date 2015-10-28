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
		}

	    var _public = {
	 		init: function() {
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
							        title+= ' ('+elementsCount+')';
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
							sendResponse(results);
				            break;
				    }
				});
			}
		}

	    return _public;
	}();

	AccessAudit.init();
}
