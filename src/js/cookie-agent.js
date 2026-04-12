// Agent to control, manage and apply cookie decisions

const GA_MEASUREMENT_ID = 'G-VF7BT5N0F7';
let gaInitialized = false;

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

    if (getCookieStatus() == "allowed") {
        enableAnalytics();
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
    if (banner) {
        banner.classList.add('hide');
    }

    if (userInteraction) {
        enableAnalytics();
    }

}

function enableAnalytics() {
    if (gaInitialized) {
        return;
    }

    gaInitialized = true;

    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(gtagScript);

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
}