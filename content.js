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

function updateIntervalInfo(minutes, hours){
    var intervalInfo = document.getElementById("interval-info");
    const prettifyTime = (num, places) => String(num).padStart(places, '0');
    const paragraph = "Refresh Interval: " + prettifyTime(hours, 2) + ":" + prettifyTime(minutes, 2) + ":" + "00<br />";
    intervalInfo.innerHTML = paragraph;
}

/* function goToSite() {
    window.open("https://support.rockstargames.com/servicestatus");
} */

/* We inject script.js */
var injectScript = document.createElement('script');
injectScript.src = chrome.runtime.getURL('script.js');
injectScript.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(injectScript);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.message[0] === "update-interval-info") {
            const minutes = request.message[1];
            const hours = request.message[2];
            updateIntervalInfo(minutes, hours);
        } /* else if (request.message[0] === "go-to-site") {
            goToSite();
        } */
    }
);
