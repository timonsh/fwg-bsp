"use strict";

/* ****************************************************************************
 *
 *  Lightbox — wiederverwendbarer Bild-Viewer
 *
 *  Ein Bild groß anzeigen:
 *
 *      <img src="bild.jpg" alt="Beschreibung" data-lightbox="galerie-name">
 *
 *  Alle Elemente mit demselben data-lightbox-Wert bilden zusammen eine
 *  Galerie und lassen sich im Viewer durchblättern — in Dokumentreihenfolge.
 *
 *  Bilder, die nur im Viewer erscheinen sollen (z. B. die Rückseite eines
 *  Flyers), kommen in ein <template> mit demselben Namen. Der Browser lädt
 *  sie erst beim Öffnen:
 *
 *      <template data-lightbox="galerie-name">
 *          <img src="rueckseite.jpg" alt="Rückseite">
 *      </template>
 *
 *  Optional je Bild:
 *
 *      data-lightbox-src      größere Fassung für den Viewer (Standard: src)
 *      data-lightbox-caption  Bildunterschrift (Standard: alt)
 *
 *  Bedienung: Pfeiltasten oder Wischen zum Blättern, Esc oder Klick auf den
 *  Hintergrund zum Schließen. Es wird kein Markup in den Seiten benötigt —
 *  der Viewer baut sich beim ersten Öffnen selbst auf.
 *
 * ************************************************************************** */

(() => {

    const GROUP_ATTR = 'data-lightbox';
    const TRIGGER_SELECTOR = `img[${GROUP_ATTR}]`;
    const SWIPE_THRESHOLD = 50;

    let viewer = null;
    let gallery = [];
    let position = 0;
    let lastFocused = null;

    // Galerie aus dem Dokument lesen

    const readImage = img => ({
        src: img.dataset.lightboxSrc || img.getAttribute('src'),
        caption: img.dataset.lightboxCaption || img.getAttribute('alt') || ''
    });

    const readGallery = group => {

        const images = [];
        const indexOfTrigger = new Map();

        document.querySelectorAll(`[${GROUP_ATTR}="${group}"]`).forEach(node => {

            if (node instanceof HTMLTemplateElement) {
                node.content.querySelectorAll('img').forEach(img => images.push(readImage(img)));
                return;
            }

            indexOfTrigger.set(node, images.length);
            images.push(readImage(node));

        });

        return { images, indexOfTrigger };

    };

    // Viewer aufbauen — einmalig, beim ersten Öffnen

    const buildViewer = () => {

        const element = document.createElement('div');

        element.id = 'lightbox';
        element.hidden = true;
        element.tabIndex = -1;
        element.setAttribute('role', 'dialog');
        element.setAttribute('aria-modal', 'true');
        element.setAttribute('aria-label', 'Bildansicht');

        element.innerHTML = `
            <button type="button" class="lightbox-btn close" aria-label="Schließen">
                <span class="material-icon">close</span>
            </button>
            <button type="button" class="lightbox-btn prev" aria-label="Vorheriges Bild">
                <span class="material-icon">chevron_left</span>
            </button>
            <figure class="lightbox-stage">
                <img src="" alt="">
                <figcaption>
                    <span class="caption"></span>
                    <span class="counter"></span>
                </figcaption>
            </figure>
            <button type="button" class="lightbox-btn next" aria-label="Nächstes Bild">
                <span class="material-icon">chevron_right</span>
            </button>
        `;

        element.querySelector('.close').addEventListener('click', close);
        element.querySelector('.prev').addEventListener('click', () => step(-1));
        element.querySelector('.next').addEventListener('click', () => step(1));

        // Nur ein Klick auf den Hintergrund schließt, nicht einer auf Bild oder Knöpfe
        element.addEventListener('click', event => {
            if (event.target === element) close();
        });

        document.body.appendChild(element);

        return element;

    };

    // Anzeige aktualisieren

    const render = () => {

        const image = gallery[position];
        const hasMultiple = gallery.length > 1;
        const stage = viewer.querySelector('.lightbox-stage img');

        stage.src = image.src;
        stage.alt = image.caption;

        viewer.querySelector('.caption').textContent = image.caption;
        viewer.querySelector('.counter').textContent = hasMultiple ? `${position + 1} / ${gallery.length}` : '';

        viewer.querySelector('.prev').hidden = !hasMultiple;
        viewer.querySelector('.next').hidden = !hasMultiple;

    };

    // Öffnen, Blättern, Schließen

    const open = trigger => {

        const { images, indexOfTrigger } = readGallery(trigger.dataset.lightbox);
        if (!images.length) return;

        viewer = viewer || buildViewer();
        gallery = images;
        position = indexOfTrigger.get(trigger) ?? 0;
        lastFocused = document.activeElement;

        document.body.classList.add('lightbox-open');
        viewer.hidden = false;
        render();

        // Fokus in den Dialog holen, damit Tab und Esc dort landen
        viewer.focus();

    };

    const step = delta => {

        if (gallery.length < 2) return;

        position = (position + delta + gallery.length) % gallery.length;
        render();

    };

    function close() {

        if (!viewer || viewer.hidden) return;

        viewer.hidden = true;
        document.body.classList.remove('lightbox-open');

        if (lastFocused) lastFocused.focus();

    }

    const isOpen = () => viewer !== null && !viewer.hidden;

    // Auslöser — per Delegation, damit auch nachträglich eingefügte Bilder greifen

    document.addEventListener('click', event => {

        const trigger = event.target.closest?.(TRIGGER_SELECTOR);
        if (!trigger) return;

        event.preventDefault();
        open(trigger);

    });

    // Tastatur: im Viewer blättern und schließen, sonst Auslöser bedienen

    document.addEventListener('keydown', event => {

        if (isOpen()) {
            if (event.key === 'Escape') close();
            else if (event.key === 'ArrowLeft') step(-1);
            else if (event.key === 'ArrowRight') step(1);
            return;
        }

        const trigger = document.activeElement;
        if (!trigger?.matches?.(TRIGGER_SELECTOR)) return;

        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            open(trigger);
        }

    });

    // Wischgeste auf Touchgeräten

    let touchStartX = null;

    document.addEventListener('touchstart', event => {
        touchStartX = isOpen() ? event.changedTouches[0].clientX : null;
    }, { passive: true });

    document.addEventListener('touchend', event => {

        if (touchStartX === null) return;

        const distance = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(distance) > SWIPE_THRESHOLD) step(distance < 0 ? 1 : -1);

        touchStartX = null;

    }, { passive: true });

    // Bilder sind von Haus aus nicht fokussierbar — für die Tastaturbedienung nachrüsten

    document.addEventListener('DOMContentLoaded', () => {

        document.querySelectorAll(TRIGGER_SELECTOR).forEach(trigger => {
            trigger.tabIndex = 0;
            trigger.setAttribute('role', 'button');
        });

    });

})();
