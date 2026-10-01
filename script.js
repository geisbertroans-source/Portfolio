/* =========================================================
   MOBILE MENU
========================================================= */

const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");

menuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
});


document.querySelectorAll(".mobile-menu a").forEach(link => {

    link.addEventListener("click", () => {
        mobileMenu.classList.remove("active");
    });

});


/* =========================================================
   VIDEO FILTERS
========================================================= */

const filters = document.querySelectorAll(".filter");
const videoCards = document.querySelectorAll(".video-card");

filters.forEach(filter => {

    filter.addEventListener("click", () => {

        filters.forEach(button => {
            button.classList.remove("active");
        });

        filter.classList.add("active");

        const selectedCategory = filter.dataset.filter;

        videoCards.forEach(card => {

            const category = card.dataset.category;

            if (
                selectedCategory === "all" ||
                category === selectedCategory
            ) {
                card.classList.remove("hidden");
            } else {
                card.classList.add("hidden");
            }

        });

    });

});


/* =========================================================
   AUTOMATIC YOUTUBE THUMBNAILS
========================================================= */

/*
    You do NOT need to manually add thumbnail images.

    Each thumbnail comes directly from YouTube
    using the video's ID.

    Example:

    Video ID:
    i6MIycHae5A

    Thumbnail:
    https://img.youtube.com/vi/i6MIycHae5A/maxresdefault.jpg
*/

const thumbnails = document.querySelectorAll(".youtube-thumbnail");

thumbnails.forEach(image => {

    image.addEventListener("error", () => {

        const videoId = image.dataset.videoId;

        /*
            If maxresdefault isn't available,
            automatically use mqdefault instead.
        */

        if (!image.dataset.fallback) {

            image.dataset.fallback = "true";

            image.src =
                `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

        }

    });

});


/* =========================================================
   SCROLL REVEAL
========================================================= */

const revealElements = document.querySelectorAll(
    ".video-card, .process-item, .service-item, .contact-row"
);

const revealObserver = new IntersectionObserver(

    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.style.opacity = "1";

                entry.target.style.transform =
                    "translateY(0)";

                revealObserver.unobserve(entry.target);

            }

        });

    },

    {
        threshold: 0.08
    }

);


revealElements.forEach(element => {

    element.style.opacity = "0";

    element.style.transform =
        "translateY(25px)";

    element.style.transition =
        "opacity 0.7s ease, transform 0.7s ease";

    revealObserver.observe(element);

});


/* =========================================================
   NAVBAR SCROLL EFFECT
========================================================= */

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        navbar.style.background =
            "rgba(7,16,12,0.92)";

    } else {

        navbar.style.background =
            "rgba(7,16,12,0.75)";

    }

});


/* =========================================================
   FORMAL.PNG ERROR HANDLING
========================================================= */

const portrait = document.querySelector(".portrait");

if (portrait) {

    portrait.addEventListener("error", () => {

        console.log(
            "Formal.png could not be found. Make sure it is in the same folder as index.html."
        );

    });

}
