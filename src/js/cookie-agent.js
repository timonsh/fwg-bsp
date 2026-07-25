// Agent to control, manage and apply cookie decisions

const GA_MEASUREMENT_ID = 'G-VF7BT5N0F7';
const CONSENT_KEY = 'cookieStatus';
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180; // 180 Tage
let gaInitialized = false;


/* *** Entscheidung lesen & speichern *** */

// Jeder Speicherzugriff ist einzeln abgesichert: Ist localStorage gesperrt
// (privater Modus, restriktive Browser-Einstellungen, In-App-Browser), wirft
// bereits der Zugriff selbst. Ungefangen ging dabei die Entscheidung verloren
// und das Banner erschien auf jeder Seite erneut. Zusätzlich wird die
// Entscheidung in einem eigenen Cookie gespiegelt — technisch notwendig zum
// Speichern der Entscheidung selbst und daher einwilligungsfrei.

function parseDecision(raw) {

    if (raw == null || raw === '') {
        return null;
    }

    try {
        let parsed = JSON.parse(raw);

        if (parsed && typeof parsed === 'object' && typeof parsed.decision === 'boolean') {
            return parsed.decision;
        }

        if (typeof parsed === 'boolean') {
            return parsed;
        }
    } catch (error) {
        // Kein JSON — unten als Klartext prüfen
    }

    if (raw === 'allowed' || raw === 'true') {
        return true;
    }

    if (raw === 'notAllowed' || raw === 'false') {
        return false;
    }

    return null; // beschädigter Wert wird wie "keine Entscheidung" behandelt

}

function readDecision() {

    try {
        let decision = parseDecision(window.localStorage.getItem(CONSENT_KEY));
        if (decision !== null) {
            return decision;
        }
    } catch (error) {
        // localStorage nicht verfügbar — Cookie-Fallback versuchen
    }

    try {
        let match = document.cookie.match(/(?:^|;\s*)cookieStatus=([^;]*)/);
        if (match) {
            let decision = parseDecision(decodeURIComponent(match[1]));
            if (decision !== null) {
                return decision;
            }
        }
    } catch (error) {
        // Cookies nicht verfügbar
    }

    return null;

}

function writeDecision(decision) {

    let persisted = false;

    let entry = {
        decision: decision,
        date: new Date().toISOString()
    }

    try {
        window.localStorage.setItem(CONSENT_KEY, JSON.stringify(entry));
        persisted = true;
    } catch (error) {
        // ignorieren — Cookie unten ist der zweite Versuch
    }

    try {
        document.cookie = CONSENT_KEY + '=' + (decision ? 'allowed' : 'notAllowed') +
            ';path=/;max-age=' + CONSENT_MAX_AGE + ';SameSite=Lax';
        persisted = true;
    } catch (error) {
        // ignorieren
    }

    return persisted;

}

function clearDecision() {

    try {
        window.localStorage.removeItem(CONSENT_KEY);
    } catch (error) {
        // ignorieren
    }

    try {
        document.cookie = CONSENT_KEY + '=;path=/;max-age=0;SameSite=Lax';
    } catch (error) {
        // ignorieren
    }

}

function getCookieStatus() {

    let decision = readDecision();

    if (decision === null) {
        return "notSet";
    }

    if (decision) {
        return "allowed";
    } else {
        return "notAllowed";
    }

}


/* *** Banner ein- und ausblenden *** */

function showBanner() {

    const banner = document.getElementById('cookie-request');
    if (!banner) {
        return;
    }

    banner.hidden = false;
    banner.classList.remove('hide');
    banner.style.visibility = 'visible';
    banner.classList.add('show');

}

function hideBanner(animated) {

    const banner = document.getElementById('cookie-request');
    if (!banner) {
        return;
    }

    if (!animated) {
        banner.classList.remove('show');
        banner.classList.remove('hide');
        banner.style.visibility = 'hidden';
        banner.hidden = true;
        return;
    }

    // 'show' muss weg, sonst laufen beide Animationen gleichzeitig und nur die
    // Reihenfolge im Stylesheet entscheidet, welche gewinnt.
    banner.classList.remove('show');
    banner.classList.add('hide');

    banner.addEventListener('animationend', function () {
        banner.style.visibility = 'hidden';
        banner.hidden = true;
    }, { once: true });

}


/* *** Ablauf *** */

function checkCurrentDecisionOnPageLoad() {

    let status = getCookieStatus();

    if (status == "notSet") {
        showBanner();
    } else {
        hideBanner(false);
    }

    if (status == "allowed") {
        enableAnalytics();
    } else {
        disableAnalytics();
    }

}

document.addEventListener('DOMContentLoaded', checkCurrentDecisionOnPageLoad);

function setCookieStatus(userInteraction) {

    let decision = userInteraction === true;

    if (!writeDecision(decision)) {
        console.warn('Cookie-Einwilligung konnte nicht gespeichert werden — die Abfrage erscheint erneut.');
    }

    hideBanner(true);

    if (decision) {
        enableAnalytics();
    } else {
        disableAnalytics();
    }

}

// Widerruf: DSGVO verlangt, dass die Einwilligung so einfach zurückgenommen
// werden kann, wie sie erteilt wurde. Aufgerufen aus dem Impressum.
function resetCookieStatus() {

    clearDecision();
    disableAnalytics();
    showBanner();

}


/* *** Google Analytics *** */

function enableAnalytics() {
    if (gaInitialized) {
        return;
    }

    gaInitialized = true;
    window['ga-disable-' + GA_MEASUREMENT_ID] = false;

    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(gtagScript);

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
}

// Offizieller Opt-out-Schalter von GA. Ein bereits geladenes gtag lässt sich
// nicht entfernen, hört damit aber auf zu senden.
function disableAnalytics() {
    window['ga-disable-' + GA_MEASUREMENT_ID] = true;
}
