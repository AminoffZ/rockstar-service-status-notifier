let MINUTES = 5;
let HOURS = 0;

function saveMinutes(minutes) {
    //chrome.runtime.sendMessage(["save-minutes ", minutes]);
    localStorage.setItem("saved-minutes", minutes);
    chrome.storage.sync.set({"input-minutes": {"minutes": minutes}});
}

function saveHours(hours) {
    //chrome.runtime.sendMessage(["save-hours", hours]);
    localStorage.setItem("saved-hours", hours);
    chrome.storage.sync.set({"input-hours": {"hours": hours}});
}

function setIntervalInfo(minutes, hours) {
    const prettifyTime = (num, places) => String(num).padStart(places, '0');
    document.getElementById("input-info").innerHTML = prettifyTime(hours, 2) + ":" + prettifyTime(minutes, 2) + ":" + "00";
}

function getMinutes() {
    return document.getElementById("input-minutes").value;
}

function getHours() {
    return document.getElementById("input-hours").value;
}

function setInterval() {
    var minutes = getMinutes();
    var hours = getHours();
    setIntervalInfo(minutes, hours);
    saveMinutes(minutes);
    saveHours(hours);
}

function popupLoad() {
    const minutes = getMinutes();
    const hours = getHours();
    setIntervalInfo(minutes, hours);
}

function getSaved() {
    chrome.storage.sync.get(['input-minutes'], function(result) {
        var inputMinutes = document.getElementById("input-minutes");
        if (result) {
            inputMinutes.value = parseInt(result["input-minutes"]["minutes"]);
        } else {
            inputMinutes.value = MINUTES;
        }
    });
    
    chrome.storage.sync.get(['input-hours'], function(result) {
        var inputHours = document.getElementById("input-hours");
        if (result) {
            inputHours.value = parseInt(result["input-hours"]["hours"]);
            popupLoad();
        } else {
            inputHours.value = HOURS;
        }
    });
}

function updateIntervalInfo() {
    minutes = getMinutes();
    hours = getHours();
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": ["update-interval-info", minutes, hours]});
   });
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("save-interval").addEventListener("click", function() {
        setInterval();
        updateIntervalInfo();
    });
});

getSaved();
