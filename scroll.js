// Get the elements
const leftArrow = document.querySelector('.arrow-left');
const rightArrow = document.querySelector('.arrow-right');
const cardsContainer = document.querySelector('.cards-container');
const cards = document.querySelectorAll('.card');

// Calculate scroll amount (width of one card + gap)
// Using the first card's width plus the gap (1em converted to pixels)
const cardStyle = window.getComputedStyle(cards[0]);
const cardWidth = cards[0].offsetWidth + parseInt(cardStyle.marginLeft) + parseInt(cardStyle.marginRight);
const gap = parseInt(window.getComputedStyle(cardsContainer).gap);
const scrollAmount = cardWidth + gap;

// Right arrow click handler
rightArrow.addEventListener('click', function () {
    cardsContainer.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
    });
});

// Left arrow click handler
leftArrow.addEventListener('click', function () {
    cardsContainer.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
    });
});

// Optional: Disable arrows when at the ends
function checkScrollPosition() {
    const maxScroll = cardsContainer.scrollWidth - cardsContainer.clientWidth;

    leftArrow.style.visibility = cardsContainer.scrollLeft <= 0 ? 'hidden' : 'visible';
    rightArrow.style.visibility = cardsContainer.scrollLeft >= maxScroll ? 'hidden' : 'visible';
}

// Initial check
checkScrollPosition();

// Check on scroll
cardsContainer.addEventListener('scroll', checkScrollPosition);