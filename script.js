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
        startObserver();
    } else {
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
        /* Assign on, down or limited depending on new status */
        const status = mutation["target"].className.split(" ")[1];
        /* Assign PC, Xbox PS4 etc. */
        const platform = mutation["target"].parentElement.innerText;
        /* Assign services: Red Dead Online, Grand Theft Auto Online etc. */
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
    /* Parent of mutations */
    const observerElement = document.querySelector("div.flex.services")
    /* Create an observer instance linked to the callback function */
    const statusObserver = new MutationObserver(observerCallback);
    /* Start observing the target node for configured mutations */
    statusObserver.observe(observerElement, observerConfig);
}

waitForLoad();
