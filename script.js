const minutes = 5;
const hours = 0;
const interval = hours * 60 * 60 * 1000 + minutes * 60 * 1000;

const audioUrl = "https://static.wikia.nocookie.net/ageofempires/images/7/7b/Blame_your_isp.ogg"
const audio = new Audio(audioUrl);

function waitForLoad() {
    setTimeout(() => {
        tryReading(0);
    }, 100);
}

function tryReading(check) {
    if (document.querySelector("div.platform")) {
        if (check >= 20) {
            setTimeout(() => {
                start(interval)
            }, 100);
        } else {
            tryReading(check+1);
        }
    } else {
        waitForLoad();
    }
}

function getServiceStatus() {
    /* All services */
    const services = document.querySelectorAll("div.flex-xxs-12.flex-xs-6.flex-sm-3.service");
    /* Nodes displaying up, down, limited statuses */
    const statusNodes = document.querySelectorAll("span.service-indicator");
    nodeCount = 0;
    let currentServiceStatus = {}
    for (service of services) {
        /* We get the text values for services and platforms */
        const serviceText = service.innerText.split("\n");
        const platforms = serviceText.slice(1);
        /* We add the platforms as keys and statuses as values */
        const platformStatuses = {}
        for (platform of platforms) {
            platformStatuses[platform] = statusNodes[nodeCount].className.split(" ")[1];
            nodeCount++;
        }
        /* We add platforms with statuses under services */
        currentServiceStatus[serviceText[0]] = platformStatuses;
    }
    return currentServiceStatus;
}

function getDifferences(old, current) {
    var differences = "";
    for (service of Object.keys(old)) {
        /* We skip if all platform statuses are the same for a service */
        if (JSON.stringify(old[service]) === JSON.stringify(current[service])) {
            continue;
        } else {
            differences += service + ":\n";
            /* We check which platform statuses differ */
            for (platform of Object.keys(old[service])) {
                if (old[service][platform] === current[service][platform]) {
                    continue;
                } else {
                    /* We add differences */
                    differences += platform + " went " + current[service][platform] + "!" + "\n";
                }
            }
            differences += "\n";
        }
    }
    return differences;
}

function playAudio() {
    var promise = audio.play();
    if (promise !== undefined) {
        promise.then(_ => {
        }).catch(error => {
            addButton();
        });
    }
}

function statusUpdate(jold, jcurrent) {
    if (jold === jcurrent) {
        playAudio();
        return "Nothing's changed.";
    } else {
        playAudio();
        const old = JSON.parse(jold);
        const current = JSON.parse(jcurrent);
        setTimeout(function() {
            return getDifferences(old, current);
        }, 2000);
    }
}

function addButton() {
    let btn = document.createElement("button");
    btn.innerHTML = "Click to enable sound!";
    document.querySelector("h3").appendChild(btn);
    btn.addEventListener("click", function() {
        btn.innerHTML = ":)";
        playAudio();
    });
}

function addHtml() {
    let rssn = document.createElement("h3");
    rssn.innerHTML = "<br />" + "Rockstar Service Status Notifier" + "<br />";
    document.querySelector("div.alert").appendChild(rssn);
}

function addNotification(notification) {
    var notificationSpan = document.createElement('span');
    notificationSpan.innerHTML = "<br />" + "<br />" + notification;
    document.querySelector("div.alert").appendChild(notificationSpan);
}

function start(interval) {
    addHtml();
    const jold = localStorage.getItem("old")
    const jcurrent = JSON.stringify(getServiceStatus());
    if (jold) {
        const notification = statusUpdate(jold, jcurrent);
        addNotification(notification);
    } else {
        const notification = "Rockstar Service Notifier is Live!" + "\n" + "Refresh Interval: " + hours + ":" + minutes + ":" + "00";
        addNotification(notification);
    }
    setTimeout(function() {
        localStorage.setItem("old", JSON.stringify(getServiceStatus()));
        location.reload();
    }, interval);
}

waitForLoad();
