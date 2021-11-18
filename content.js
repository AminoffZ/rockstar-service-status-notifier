/* We inject variables to keep track of saved interval options */
function addSavedInterval(unit) {
    const key = "input-" + unit;
    var element = document.createElement("var");
    element.setAttribute("id", key)
    chrome.storage.sync.get([key], function(result) {
        if (result) {
            element.setAttribute("value", parseInt(result[key][unit]));
            element.onload = function() {
                this.remove();
            };
            (document.head || document.documentElement).appendChild(element);
        }
    });
}

addSavedInterval("minutes");
addSavedInterval("hours");

/* We inject script.js */
var injectScript = document.createElement('script');
injectScript.src = chrome.runtime.getURL('script.js');
injectScript.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(injectScript);
