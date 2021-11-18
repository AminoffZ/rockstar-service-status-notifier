let MINUTES = 5;
let HOURS = 0;
let INTERVAL = HOURS * 60 * 60 * 1000 + MINUTES * 60 * 1000;

const audioUrl = "https://static.wikia.nocookie.net/ageofempires/images/7/7b/Blame_your_isp.ogg"
const audio = new Audio(audioUrl);

let statusChanged = false;

function setMinutes() {
    var element = document.getElementById("input-minutes");
    if (element) {
        if(element.getAttribute("value")) {
            MINUTES = element.getAttribute("value");
        }
    }
}

function setHours() {
    var element = document.getElementById("input-hours");
    if (element) {
        if(element.getAttribute("value")) {
            HOURS = element.getAttribute("value");
        }
    }
}

function setInterval() {
    INTERVAL = HOURS * 60 * 60 * 1000 + MINUTES * 60 * 1000;
}

function getMinutes() {
    return MINUTES;
}

function getHours() {
    return HOURS;
}

function getInterval() {
    return INTERVAL/1000;
}

/* Wait until we can interact with desired elements */
function waitForLoad() {
    setTimeout(() => {
        tryReading();
    }, 250);
}

function tryReading() {
    const platforms = document.querySelectorAll(".platform");
    if (platforms) {
        if (platforms.length >= 16 && platforms[0].ariaLabel) {
            startExtension();
        } else {
            waitForLoad();
        }
    } else {
        waitForLoad();
    }
}

/* Get the status of all services */
function getServiceStatus() {
    platforms = document.querySelectorAll(".platform");
    let currentServiceStatus = [];
    for (item of platforms) {
        currentServiceStatus.push(item.ariaLabel);
    }
    return currentServiceStatus;
}

/* Check for differences */
function statusUpdate(oldStatus, currentStatus) {
    const joldStatus = JSON.stringify(oldStatus);
    const jcurrentStatus = JSON.stringify(currentStatus);
    if (joldStatus === jcurrentStatus) {
        return "";
    } else {
        const differences = getDifferences(oldStatus, currentStatus);
        statusChanged = true;
        return differences;
    }
}

/* Get the differences */
function getDifferences(oldStatus, currentStatus) {
    let differences = [];
    oldStatus.forEach((item, index) => {
        if (item === currentStatus[index]) {
            return;
        } else {
            differences.push(currentStatus[index]);
        }
      });
      return differences;
}

function playExtensionAudio() {
    /* We need this because google requires user interaction to play sound */
    var promise = audio.play();
    if (promise !== undefined) {
        promise.then(_ => {
        }).catch(error => {
            addAudioErrorMessage();
            document.getElementById("extension-button").innerHTML = "Audio is OFF";
        });
    }
}

function addExtensionElement(type, text, id) {
    let element = document.createElement(type);
    element.innerHTML = text;
    element.setAttribute("id", id);
    if (type === "div") {
        referenceElement = document.querySelector("div.updated");
        referenceElement.appendChild(element);
    } else {
        document.getElementById("extension-header").appendChild(element);
    }
}

function addIntervalInfo() {
    const prettifyTime = (num, places) => String(num).padStart(places, '0');
    const paragraph = "Refresh Interval: " + prettifyTime(HOURS, 2) + ":" + prettifyTime(MINUTES, 2) + ":" + "00<br />";
    addExtensionElement("span", paragraph, "interval-info");
}

function addExtensionHeader() {
    const header = "<br /><h3><b>Rockstar Service Status Notifier</b></h3>\n";
    addExtensionElement("div", header, "extension-header");
}

function addExtensionNotification() {
    const notification = setExtensionNotification();
    addExtensionElement('span', notification, "extension-notification");
}

function addAudioErrorMessage() {
    const message = "<br />" + "Permission required to play sound, you can change this in the site settings. (Click the lock on the left side of the url.)";
    addExtensionElement('span', message, "audio-error-message");
}

function addExtensionButton() {
    let btn = document.createElement("button");
    btn.setAttribute("id", "extension-button");
    const onState = "Audio is ON";
    const offState = "Audio is OFF";
    let buttonState = offState;
    if (localStorage.getItem("extensionButton")) {
        buttonState = localStorage.getItem("extensionButton");
    }
    btn.innerHTML = buttonState;
    document.getElementById("extension-header").appendChild(btn);
    btn.addEventListener("click", function() {
        if (btn.innerHTML === offState) {
            localStorage.setItem("extensionButton", onState);
            btn.innerHTML = onState;
            audio.muted = false;
            playExtensionAudio();
        } else {
            btn.innerHTML = offState;
            localStorage.setItem("extensionButton", offState);
            audio.pause();
            audio.currentTime = 0;
            audio.muted = true;
        }
    });
}

function setExtensionNotification() {
    let notification = "";
    const joldStatus = localStorage.getItem("oldStatus");
    if (joldStatus) {
        const oldStatus = localStorage.getItem("oldStatus").split(",").sort();
        const currentStatus = getServiceStatus().sort();
        const differences = statusUpdate(oldStatus, currentStatus);
        if (!differences) {
            notification = "Nothing's Changed.";
        } else {
            let statusChanges = {"UP":0,"LIMITED":0,"DOWN":0};
            for (difference of differences) {
                /* Add service category only once */
                let differenceSplit = difference.split(" - ");
                if (!notification.includes(difference.split(" - ")[0])) {
                    notification += "<b>" + differenceSplit[0] + "</b><br />";
                }
                /* Add platform and status */
                notification += differenceSplit[1] + " went " + differenceSplit[2] + "<br />";
                switch(differenceSplit[2]) {
                    case ("UP"):
                        statusChanges["UP"]++;
                        break;
                    case ("LIMITED"):
                        statusChanges["LIMITED"]++;
                        break;
                    case ("DOWN"):
                        statusChanges["DOWN"]++;
                        break;
                }
            }
            showNotification(statusChanges);
        }
    } else {
        /* If no localStorage, add localStorage */
        localStorage.setItem("oldStatus", getServiceStatus());
    }
    return notification + "<br />";
}

function showNotification(statusChanges) {
    let notification = "";
    for (change of Object.keys(statusChanges)) {
        if (!statusChanges[change]) {
            continue;
        } else {
            notification += statusChanges[change] + " services went " + change + "!\n";
        }
    }
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
    }
    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var pushNotification = new Notification(
            "Rockstar Service Status Notifier",
            {icon: "icon.png", body: notification});
    }
    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
            var pushNotification = new Notification(
                "Rockstar Service Status Notifier",
                {icon: "icon.png", body: notification});
        }
        });
    }
}

function startExtension() {
    addExtensionHeader();
    addIntervalInfo();
    addExtensionNotification();
    addExtensionButton();
    if (statusChanged) {
        playExtensionAudio();
    }
    /* Save current status and refresh after set time */
    setTimeout(function() {
        localStorage.setItem("oldStatus", getServiceStatus());
        location.reload();
    }, INTERVAL);
}

setMinutes();
setHours();
setInterval();
waitForLoad();
