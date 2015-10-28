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

sendMessage = function(message) {
    chrome.runtime.sendMessage(message);
}

var audits = axs.Audit.run();
//console.log(audits);

var results = [];
var elements = [];
$.each(audits, function(index, audit){
	var tag = null;
	var title = audit.result+': '+audit.rule.heading;
    if(audit.elements && audit.elements != undefined && audit.elements.length>0) {
        title+= ' ('+audit.elements.length+')';
        tag = elements.length;
        elements.push(audit.elements);
    };
    results.push({
    	tag: tag,
		status: audit.result, 
		name: camel2Words(audit.rule.name),
		title: title,
		url: audit.rule.url
	});
});

console.log(results);
console.log(elements);

sendMessage({type:'results', results:results});