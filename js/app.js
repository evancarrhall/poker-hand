var model = {
    numberOfCardsInHand: 52,
    handPosition: { top: window.innerHeight, left: 0, rotate: 0 },
    dealtCards: [],
};

var controller = {

    init() {

        view.dealtCards.init();
        view.cardCounter.init();
        view.hand.init();
    },

    getNumberOfCardsInHand() { return model.numberOfCardsInHand },
    setNumberOfCardsInHand(numberOfCardsInHand = 52) {

        numberOfCardsInHand = parseInt(numberOfCardsInHand);

        if (numberOfCardsInHand > 52 || numberOfCardsInHand < 0) console.warn(`Expected a number between 0 and 52. Was given ${numberOfCardsInHand}`);
        else {
            model.numberOfCardsInHand = numberOfCardsInHand;
            view.cardCounter.render();
            view.hand.render();
        }
    },

    getHandPosition() { return model.handPosition },
    setHandPosition(top = 0, left = 0, rotate = 0) {

        model.handPosition = { top, left, rotate };
        view.hand.render();
    },

    getDealtCards() { return model.dealtCards },
    dealCard(x, y) {

        // create new card el
        let new_card = document.createElement('IMG');
        new_card.classList.add('dealt_card');
        new_card.src = "assets/card.svg";

        model.dealtCards.push({
            x: x,
            y: y,
            el: new_card,
            isDealt: false
        });

        view.dealtCards.render();
    },
}

var view = {

    dealtCards: {

        els: {
            card: document.querySelector('.card'),
            table: document.querySelector('.table'),
        },

        init() {

            // keeps track of cards currently rendered on screen
            this.renderedDealtCards = [];

            this.els.table.addEventListener('click', e => {
                
                const numberOfCardsInHand = controller.getNumberOfCardsInHand();

                if (numberOfCardsInHand > 0) {

                    controller.setNumberOfCardsInHand(numberOfCardsInHand - 1);
                    controller.dealCard(e.clientX, e.clientY, this.els.card.getBoundingClientRect());
                }
            });

            this.render();
        },

        render() {

            const dealtCards = controller.getDealtCards();
            const handPosition = controller.getHandPosition();

            // throw any newly dealt cards
            for (let card of dealtCards) {

                if (!this.renderedDealtCards.includes(card)) {

                    this.renderedDealtCards.push(card);

                    const first = this.els.card.getBoundingClientRect();

                    // offset card by width/height to center on cursor
                    const lastX = card.x - first.width / 2;
                    const lastY = card.y - first.height / 2;

                    // place new card at x and y
                    card.el.style.top = `${lastY}px`;
                    card.el.style.left = `${lastX}px`;

                    // calculate delta between card and new card
                    const invertY = first.top - lastY;
                    const invertX = first.left - lastX;

                    // move new card ontop of card in hand
                    card.el.style.transform = `translate(${invertX}px, ${invertY}px) rotate(${handPosition.rotate}deg) scale(1)`;

                    // put new card in dom
                    this.els.table.appendChild(card.el);

                    // undo transform, causing new card to move to cursors position
                    // note: for some reason this raf does not wait for the next frame
                    // adding a second raf does wait for the next frame
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            
                            card.el.style.transform = `rotate(${handPosition.rotate + Math.random() * 180}deg) scale(0.6)`;

                            console.log(card.el.getBoundingClientRect());
                        });
                    });

                    card.el.addEventListener('transitionend', () => {
                        card.el.style.zIndex = '8';
                    });
                }
            }
        }
    },

    hand: {

        els: {
            table: document.querySelector('.table'),
            deck: document.querySelector('.deck'),
            hand: document.querySelector('.hand'),
            deck_depth: document.querySelector('.deck-depth'),
        },

        init() {
            
            this.els.table.addEventListener('mousemove', e => {

                const percY = 1 - (window.innerHeight - e.clientY) / window.innerHeight;
                const top = window.innerHeight - (-300 * percY + 300);

                const left = (e.clientX - 600);

                const percX = 1 - (window.innerWidth - e.clientX) / window.innerWidth;
                const rotationRange = 14;
                const rotate = rotationRange * percX - (rotationRange / 2);

                controller.setHandPosition(top, left, rotate);
            });

            this.render();
        },

        render() {

            const numberOfCardsInHand = controller.getNumberOfCardsInHand();
            const handPosition = controller.getHandPosition();

            // calculate deck depth
            this.els.deck_depth.style.top = (28 * ( numberOfCardsInHand / 52) - 28) + 'px';
            this.els.deck_depth.style.right = (28 * (numberOfCardsInHand / 52) - 28) + 'px';

            // hide deck depth if there are no more  cards
            if (numberOfCardsInHand <= 1) this.els.deck.style.opacity = '0';

            // move and rotate hand
            this.els.hand.style.top =  handPosition.top + 'px';
            this.els.hand.style.left = handPosition.left + 'px';
            this.els.hand.style.transform = 'rotate(' + handPosition.rotate + 'deg)';
        }
    },

    deckDepth: {

        els: {

        },

        init() {

        },

        render() {

        }
    },
    
    cardCounter: {

        init() {

            this.card_counter = document.querySelector('.card-counter');
            this.render();
        },

        render() {

            this.card_counter.textContent = controller.getNumberOfCardsInHand();
        }
    }
}

controller.init();


// function setNumberOfPlayers(num) {

//     while(dealing_decks.firstChild) {
//         dealing_decks.removeChild(dealing_decks.firstChild);
//     }

//     for (let i = 0; i < num; i++) {

//         let deck = document.createElement('DIV');
//         deck.classList.add('table-overlay-dealing-deck');
        
//         console.log(deck);

//         dealing_decks.appendChild(deck);
//     }

    
// }