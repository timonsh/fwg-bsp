"use strict";

// Meta

const meta = {
    id: 'fwg-bsp',
    version: 'v1.0-beta',
    name: 'Freie Wähler Gleichen - Bürger statt Partei e.V.',
    creator: 'webbytestudio',
};

// Button Bounce Effect

document.addEventListener("DOMContentLoaded", () => {

    const bounceButtons = document.querySelectorAll(".bounce");

    bounceButtons.forEach(btn => {

        btn.addEventListener("click", () => {
            btn.classList.add("is-bouncing");
        });

        btn.addEventListener("animationend", () => {
            btn.classList.remove("is-bouncing");
        });

    });

});

// Mobile Nav Toggle

let isNavExtended = false;

function toggleMobileNav() {

    if (isNavExtended) {
        document.querySelector('#mobile-navigation .hidden-container').style.animation = 'slideOut .25s';
        document.querySelector('#mobile-navigation .visible-container').style.border = '2px solid var(--clr-surface-2)';
        setTimeout(() => {
            document.querySelector('#mobile-navigation .hidden-container').style.display = 'none';
        }, 250);
    } else {
        document.querySelector('#mobile-navigation .visible-container').style.border = 'none';
        document.querySelector('#mobile-navigation .hidden-container').style.display = 'flex';
        document.querySelector('#mobile-navigation .hidden-container').style.animation = 'slideIn .25s';
    }

    isNavExtended = !isNavExtended;

}

// Nav Scroll

let hasScrolledDown = false;
let hasTriggeredTop = true;

window.addEventListener('scroll', () => {

    if (!hasScrolledDown && window.scrollY > 0) {
        hasScrolledDown = true;
        hasTriggeredTop = false;

        document.querySelector('#navigation').style.height = '90px';
        document.querySelector('#navigation .top-container').style.height = '50px';
        document.querySelector('#navigation .bottom-container').style.height = '40px';
        document.querySelector('#navigation .top-container > a img').style.height = '35px';
        document.querySelector('#navigation .top-container h1').style.fontSize = '1.15rem';
        document.querySelectorAll('#navigation .bottom-container ul li a').forEach(e => {
            e.style.fontSize = '1rem';
            e.style.height = '22.5px';
        });
        document.querySelector('#navigation .bottom-container a.active').style.borderBottom = '2.5px solid var(--clr-font)';

    }

    if (!hasTriggeredTop && window.scrollY === 0) {
        hasScrolledDown = false;
        hasTriggeredTop = true;
        document.querySelector('#navigation').style.height = '';
        document.querySelector('#navigation .top-container').style.height = '';
        document.querySelector('#navigation .bottom-container').style.height = '';
        document.querySelector('#navigation .top-container > a img').style.height = '';
        document.querySelector('#navigation .top-container h1').style.fontSize = '';
        document.querySelectorAll('#navigation .bottom-container ul li a').forEach(e => {
            e.style.fontSize = '';
            e.style.height = '';
        });
        document.querySelector('#navigation .bottom-container a.active').style.borderBottom = '';
        document.querySelector('#header').style.height = '';
    }

});

// Slideshow + AutoSlide

let currentSlide = 1;
let totalSlideCount = document.querySelectorAll('#slideshow .slides > div').length;
let slideProcessOngoing = false;
let timeoutAutoSlide = 10;
let timeoutCount = 0;

function slideAuto(destination, automated) {

    destination = parseInt(destination);
    if (destination < 1 || destination > totalSlideCount) return;
    if (slideProcessOngoing && automated) return;
    if (slideProcessOngoing && !automated) {
        setTimeout(() => slideAuto(destination, false), 300);
        return;
    }
    slideProcessOngoing = true;
    if (!automated) {
        timeoutAutoSlide = 15;
        timeoutCount = 0;
    } else {
        timeoutAutoSlide = 10;
    }
    if (destination !== currentSlide) {
        const currentSlideElmnt = document.querySelector(`#slideshow .slides > div:nth-of-type(${currentSlide})`);
        const destinationSlideElmnt = document.querySelector(`#slideshow .slides > div:nth-of-type(${destination})`);
        const currentBtn = document.querySelector(`#slideshow .controls > button:nth-of-type(${currentSlide})`);
        const destinationBtn = document.querySelector(`#slideshow .controls > button:nth-of-type(${destination})`);
        if (currentSlideElmnt && destinationSlideElmnt && currentBtn && destinationBtn) {
            currentSlideElmnt.style.animation = 'fadeOut .5s both';
            destinationSlideElmnt.style.animation = 'fadeIn .5s both';
            currentBtn.classList.remove('active');
            destinationBtn.classList.add('active');
            currentSlide = destination;
        }
    }
    setTimeout(() => {
        slideProcessOngoing = false;
    }, 500);

}

function autoSlide() {

    if (timeoutCount >= timeoutAutoSlide) {
        timeoutCount = 0;
        let nextSlide = currentSlide + 1;
        if (totalSlideCount == currentSlide) {
            nextSlide = 1;
        }
        slideAuto(nextSlide, true);
    } else {
        timeoutCount++;
    }

}

let autoSlideAutomation = setInterval(autoSlide, 1000);

function slideTo(destination) {

    let currentSlideElmnt = document.querySelector(`#slideshow .slides > div:nth-of-type(${currentSlide})`);
    currentSlideElmnt.style.animation = 'fadeOut .5s both';

    let destinationSlideElmnt = document.querySelector(`#slideshow .slides > div:nth-of-type(${destination})`);
    destinationSlideElmnt.style.animation = 'fadeIn .5s both';

    setTimeout(() => {
        currentSlideElmnt.style.zIndex = 0;
        destinationSlideElmnt.style.zIndex = 1;
    }, 250);

    document.querySelector(`#slideshow .controls > button:nth-of-type(${currentSlide})`).classList.remove('active');
    document.querySelector(`#slideshow .controls > button:nth-of-type(${destination})`).classList.add('active');

    currentSlide = destination;
    timeoutAutoSlide = 15;
    timeoutCount = 0;

}