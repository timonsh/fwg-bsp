// Agent to control, manage and apply cookie decisions

function getCookieStatus() {

    let status = JSON.parse(localStorage.getItem('cookieStatus'));

    if (status == null) {
        return "notSet";
    }

    if (status.decision) {
        return "allowed";
    } else {
        return "notAllowed";
    }

}

function checkCurrentDecisionOnPageLoad() {

    if (getCookieStatus() == "notSet") {
        const banner = document.getElementById('cookie-request');
        if (banner) {
            banner.style.visibility = 'visible';
            banner.classList.add('show');
        }
    }

}

document.addEventListener('DOMContentLoaded', checkCurrentDecisionOnPageLoad);

function setCookieStatus(userInteraction) {

    let entry = {
        decision: userInteraction,
        date: new Date().toISOString()
    }

    localStorage.setItem('cookieStatus', JSON.stringify(entry));
    const banner = document.getElementById('cookie-request');
    banner.classList.add('hide');

}