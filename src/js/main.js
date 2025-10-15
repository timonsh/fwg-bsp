"use strict";

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
    }

});