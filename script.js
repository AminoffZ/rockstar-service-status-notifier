const cheerUrl = "https://static.wikia.nocookie.net/ageofempires/images/5/5f/Aoe1_taunt009.mp3";
const groanUrl = "https://static.wikia.nocookie.net/ageofempires/images/8/86/Aoe1_taunt011.mp3";
var cheer = new Audio(cheerUrl);
var groan = new Audio(groanUrl);

function waitForLoad() {
    setTimeout(() => {
        tryObserving();
    }, 100);
}

function tryObserving() {
    if (!!document.querySelector("div.platform")) {
        console.log("observer started");
        startObserver();
    } else {
        console.log("wasnt ready");
        waitForLoad();
    }
}

/* Options for the observer (which mutations to observe) */
const observerConfig = { attributes: true, childList: true, subtree: true };
/* Callback function to execute when mutations are observed */
const observerCallback = function(mutationsList, observer) {
    /* Check when service status changes */
    let notificationMessage = "";
    for(const mutation of mutationsList) {
        const status = mutation["target"].className.split(" ")[1];
        const platform = mutation["target"].parentElement.innerText;
        const service = mutation["target"].parentElement.parentElement.previousSibling.innerText;
        if (status === "up") {
            cheer.play();
        } else {
            groan.play();
        }
        const serviceUpdate = service + " on " + platform + ": " + status.charAt(0).toUpperCase() + status.slice(1);
        notificationMessage += serviceUpdate;
    }
    setTimeout(() => {
        alert(notificationMessage);
    }, 1000);
};

function startObserver() {
    console.log ("DOMContentLoaded");
    const observerElement = document.querySelector("div.flex.services")
    /* Create an observer instance linked to the callback function */
    const statusObserver = new MutationObserver(observerCallback);
    /* Start observing the target node for configured mutations */
    statusObserver.observe(observerElement, observerConfig);
}

waitForLoad();