const deck = document.querySelector('.deck');
const table = document.querySelector('.table');
const hand = document.querySelector('.hand');
const deck_depth = document.querySelector('.deck-depth');
const dealing_decks = document.querySelector('.table-overlay-dealing-decks');
const card = document.querySelector('.card');
const card_counter = document.querySelector('.card-counter');

let rotate = 0;
let cards = 52;

function setCards(number) {

    cards = number;

    // calculate deck depth
    deck_depth.style.top = (28 * (cards / 52) - 28) + 'px';
    deck_depth.style.right = (28 * (cards / 52) - 28) + 'px';

    // update card counter
    card_counter.textContent = cards;
}

function dealCard(e) {
    
    if (cards > 0) {

        setCards(cards - 1);

        // position of card in hand
        const first = card.getBoundingClientRect();

        // create new card el
        let new_card = document.createElement('IMG');
        new_card.classList.add('dealt_card');
        new_card.src = "card.svg";

        const lastY = e.clientY - first.height/2;
        const lastX = e.clientX - first.width/2;

        // place new card at cursor
        new_card.style.top = `${lastY}px`;
        new_card.style.left = `${lastX}px`;

        // calculate delta between card and new card
        const invertY = first.top - lastY;
        const invertX = first.left - lastX;

        // move new card ontop of card in hand
        new_card.style.transform = `translate(${invertX}px, ${invertY}px) rotate(${rotate}deg) scale(1)`;

        // put new card in dom
        table.appendChild(new_card);
        
        // undo transform, causing new card to move to cursors position
        requestAnimationFrame(() => {
            // for some reason this raf does not wait for the next frame
            // adding a second raf does wait for the next frame
            requestAnimationFrame(() => {
                new_card.style.transform = `rotate(${rotate + Math.random() * 180}deg) scale(0.6)`;
            });
        });

        new_card.addEventListener('transitionend', () => {
            new_card.style.zIndex = '8';
        }) 
    }

    else {
        
        deck.style.opacity = '0';
    }
}

function onMouseMove(e) {

    const percY = 1 - (window.innerHeight - e.clientY) / window.innerHeight;
    const bottom = -300*percY + 300;
    // const bottom = 200;
    
    const percX = 1 - (window.innerWidth - e.clientX) / window.innerWidth;
    const range = 14;
    rotate = range * percX - (range/2);

    requestAnimationFrame(() => {
        hand.style.bottom =  bottom+'px';
        hand.style.left = (e.clientX - 600) + 'px';
        hand.style.transform = 'rotate('+rotate+'deg)';
    });
}

function setNumberOfPlayers(num) {

    while(dealing_decks.firstChild) {
        dealing_decks.removeChild(dealing_decks.firstChild);
    }

    for (let i = 0; i < num; i++) {

        let deck = document.createElement('DIV');
        deck.classList.add('table-overlay-dealing-deck');
        
        console.log(deck);

        dealing_decks.appendChild(deck);
    }

    
}

setCards(cards);
table.addEventListener('click', dealCard);
table.addEventListener('mousemove', onMouseMove);