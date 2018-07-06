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
    setHandPosition(y = 0, x = 0, r = 0) {

        model.handPosition = { y, x, r };
        view.hand.render();
    },

    getDealtCards() { return model.dealtCards },
    getFlattenedDealtCards() { return [].concat.apply([], model.dealtCards) },
    dealCard(x, y) {

        // create new card el
        let new_card = document.createElement('IMG');
        new_card.classList.add('dealt-card');
        new_card.src = "assets/card.svg";

        let card = {
            x: x,
            y: y,
            el: new_card
        };

        if (model.dealtCards.length === 0) {

            console.log('Created First Pile');
            model.dealtCards.push([card]);
        }
        else {

            let inRangePiles = [];
            var newDealtCards = [];
            model.dealtCards.forEach(pile => {

                let isWithinRangeOfPile = pile.some(card => {
                    
                    let xd = x - card.x;
                    let yd = y - card.y;
                    let distance =  Math.sqrt(xd ** 2 + yd ** 2);

                    let maximumDistance = 170;
                    let isWithinRangeOfCard = Boolean(distance < maximumDistance);
                    return isWithinRangeOfCard;
                });

                if (isWithinRangeOfPile) {

                    inRangePiles.push(pile);
                }
                
                else {

                    newDealtCards.push(pile);
                }
            });

            if (inRangePiles.length === 0) {
                
                newDealtCards.push([card]);
                console.log('Created Pile');
            }
            else {
    
                // only matches one pile
                if (inRangePiles.length === 1) {

                    inRangePiles[0].push(card);
                    newDealtCards.push(inRangePiles[0]);
                    console.log(`Added to Pile: ${inRangePiles[0].length} in pile.`);
                }

                // matches multiple piles
                else {

                    let merged = [].concat.apply([], [...inRangePiles, card]);
                    newDealtCards.push(merged);
                    console.log(`Merged ${inRangePiles.length} piles: ${merged.length} in newly created pile.`);
                }
            }

            model.dealtCards = newDealtCards;
        }

        // console.log(`x: ${x}, y: ${y}`);
        // console.log(model.dealtCardsPiles);

        view.dealtCards.render();
    },
}

var view = {

    dealtCards: {

        els: {
            card: document.querySelector('.card'),
            dealt_cards: document.querySelector('.dealt-cards'),
        },

        init() {

            // keeps track of cards currently rendered on screen
            this.renderedDealtCards = [];

            this.els.dealt_cards.addEventListener('click', e => {
                
                const numberOfCardsInHand = controller.getNumberOfCardsInHand();

                if (numberOfCardsInHand > 0) {

                    controller.setNumberOfCardsInHand(numberOfCardsInHand - 1);
                    controller.dealCard(e.clientX, e.clientY, this.els.card.getBoundingClientRect());
                }
            });

            this.render();
        },

        render() { 

            const dealtCards = controller.getFlattenedDealtCards();
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
                    card.el.style.transform = `translate(${invertX}px, ${invertY}px) rotate(${handPosition.r}deg) scale(1)`;

                    // put new card in dom
                    this.els.dealt_cards.appendChild(card.el);

                    // undo transform, causing new card to move to cursors position
                    // note: for some reason this raf does not wait for the next frame
                    // adding a second raf does wait for the next frame
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            
                            card.el.style.transform = `rotate(${handPosition.r + Math.random() * 180}deg) scale(0.6)`;
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
                const y = 100 * percY - 100;

                const x = e.clientX;

                const percX = 1 - (window.innerWidth - e.clientX) / window.innerWidth;
                const rotationRange = 14;
                const r = rotationRange * percX - (rotationRange / 2);

                controller.setHandPosition(y, x, r);
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
            if (numberOfCardsInHand <= 0) this.els.deck.style.opacity = '0';

            // move and rotate hand
            this.els.hand.style.transform = `translate(${handPosition.x}px, ${handPosition.y}px) rotate(${handPosition.r}deg)`;
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