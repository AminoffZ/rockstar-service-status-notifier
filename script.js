const minutes = 5;
const hours = 0;
const interval = hours * 60 * 60 * 1000 + minutes * 60 * 1000;

const audioUrl = "https://static.wikia.nocookie.net/ageofempires/images/7/7b/Blame_your_isp.ogg"
const audio = new Audio(audioUrl);

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
function statusUpdate(old, current) {
    const jold = JSON.stringify(old);
    const jcurrent = JSON.stringify(current);
    if (jold === jcurrent) {
        return "";
    } else {
        const differences = getDifferences(old, current);
        playExtensionAudio();
        return differences;
    }
}

/* Get the differences */
function getDifferences(old, current) {
    let differences = []
    old.forEach((item, index) => {
        if (item === current[index]) {
            return;
        } else {
            differences.push(current[index]);
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
            addExtensionElement("button", "Click to enable sound!", "extension-button");
        });
    }
}

function addExtensionElement(type, text, id) {
    let element = document.createElement(type)
    element.innerHTML = text;
    element.setAttribute("id", id);
    if (type === "button") {
        addExtensionButton(element);
        return;
    }
    if (type === "div") {
        referenceElement = document.querySelector("div.updated");
        referenceElement.appendChild(element);
    } else {
        document.getElementById("extension-header").appendChild(element);
    }
}

function addExtensionHeader() {
    const text = "<br />" + "<h3><b>Rockstar Service Status Notifier</b></h3>" + "<br />";
    addExtensionElement("div", text, "extension-header");
}

function addExtensionNotification() {
    const notification = setExtensionNotification();
    addExtensionElement('span', notification, "extension-notification");
}

function addExtensionButton(btn) {
    document.getElementById("extension-header").appendChild(btn);
    btn.addEventListener("click", function() {
        btn.innerHTML = "Audio On!";
        playExtensionAudio();
    });
}

function setExtensionNotification() {
    const old = localStorage.getItem("old").split(",").sort();
    const current = getServiceStatus().sort();
    let notification = "";
    if (old) {
        const differences = statusUpdate(old, current);
        if (!differences) {
            notification = "Nothing's Changed.";
        } else {
            for (difference of differences) {
                /* Add service category only once */
                let differenceSplit = difference.split(" - ");
                if (!notification.includes(difference.split(" - ")[0])) {
                    notification += "<b>" + differenceSplit[0] + "</b><br />";
                }
                /* Add platform and status */
                notification += differenceSplit[1] + " went " + differenceSplit[2] + "<br />";
            }
        }
    } else {
        /* If no localStorage, display welcome message */
        notification = "Rockstar Service Notifier is Live!" + "\n" + "Refresh Interval: " + hours + ":" + minutes + ":" + "00";
    }
    return notification + "<br />";
}

function startExtension() {
    addExtensionHeader();
    addExtensionNotification();
    /* Save current status and refresh after set time */
    setTimeout(function() {
        localStorage.setItem("old", getServiceStatus());
        location.reload();
    }, interval);
}

waitForLoad();
