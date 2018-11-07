var model = {
    numberOfCardsInHand: 26,
    handPosition: { top: window.innerHeight, left: 0, rotate: 0 },
    dealtCards: [],
    gameStartTimestamp: null,
    numberOfDecksToDeal: Math.floor(Math.random() * 5) + 3,
};

var controller = {

    init() {

        dealtCards.init();
        cardCounter.init();
        hand.init();
        dealtCardsCounters.init();
        header.init();
    },

    getNumberOfCardsInHand() { return model.numberOfCardsInHand },
    setNumberOfCardsInHand(numberOfCardsInHand = 52) {

        numberOfCardsInHand = parseInt(numberOfCardsInHand);

        if (numberOfCardsInHand > 52 || numberOfCardsInHand < 0) console.warn(`Expected a number between 0 and 52. Was given ${numberOfCardsInHand}`);
        else {
            model.numberOfCardsInHand = numberOfCardsInHand;
            cardCounter.render();
            hand.render();
        }
    },

    shakeCardCounter() {

        cardCounter.shake();
    },

    getHandPosition() { return model.handPosition },
    setHandPosition(y = 0, x = 0, r = 0) {

        model.handPosition = { y, x, r };
        hand.render();
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

        // check if this is first card dealt
        if (model.dealtCards.length === 0) {
            
            model.dealtCards.push([card]);
            model.gameStartTimestamp = new Date();
            console.log('Created First Pile');
            
        }
        else {

            let newDealtCards = [];
            let inRangePiles = [];
            for (let pile of model.dealtCards) {

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
            };

            // no piles in range, create pile
            if (inRangePiles.length === 0) {
                
                newDealtCards.push([card]);
                console.log('Created Pile');
            }
            else {
    
                // only matches one pile, add to that pile
                if (inRangePiles.length === 1) {

                    inRangePiles[0].push(card);
                    newDealtCards.push(inRangePiles[0]);
                    console.log(`Added to Pile: ${inRangePiles[0].length} in pile.`);
                }

                // matches multiple piles, merge all matching piles
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

        dealtCards.render();
        dealtCardsCounters.render();
    },

    getNumberOfDecksToDeal() { return model.numberOfDecksToDeal },
    setNumberOfDecksToDeal(num) {

        model.numberOfDecksToDeal = num;

        header.render();
    }
}

var dealtCards = {

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
            else {

                controller.shakeCardCounter();
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
}

var hand = {

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

        let distance = numberOfCardsInHand / 2;
        this.els.deck_depth.style.transform = `translate(${-distance}px, ${-distance}px)`;

        // hide deck depth if there are no more  cards
        if (numberOfCardsInHand <= 0) this.els.deck.style.opacity = '0';

        // move and rotate hand
        this.els.hand.style.transform = `translate(${handPosition.x}px, ${handPosition.y}px) rotate(${handPosition.r}deg)`;
    }
}

var cardCounter = {

    els: {
        card_counter: document.querySelector('.card-counter')
    },

    init() {

        this.render();
    },

    shake() {

        this.els.card_counter.classList.add('animated', 'flash');
        this.els.card_counter.addEventListener('animationend', () => {
            this.els.card_counter.classList.remove('animated', 'flash');
        });
    },

    render() {

        this.els.card_counter.textContent = controller.getNumberOfCardsInHand();
    }
}

var dealtCardsCounters = {

    els: {
        pile_counters: document.querySelector('.pile-counters')
    },

    init() {

        this.renderedCounters = [];
        this.render();
    },

    render() {

        const dealtCards = controller.getDealtCards();

        let newRenderedCounters = [];
        for (let counter of this.renderedCounters) {

            // if pile doesnt exist anymore, remove counter
            if (!dealtCards.includes(counter.pile)) {
                counter.el.remove();
            }
            // cards have been added to existing pile
            else if (counter.count !== counter.pile.length) {
                counter.count = counter.pile.length;
                counter.el.textContent = counter.pile.length;
                newRenderedCounters.push(counter);
            }
            // pile has not changed
            else {
                newRenderedCounters.push(counter);
            }
        }

        
        // add a counter for any new piles
        for (let pile of dealtCards) {
            if (!newRenderedCounters.map(counter => counter.pile).includes(pile)) {

                let el = document.createElement('DIV');
                el.classList.add('pile-counter');

                el.style.top = `${pile[0].y}px`;
                el.style.left = `${pile[0].x}px`;
                el.textContent = pile.length;

                this.els.pile_counters.appendChild(el);
                newRenderedCounters.push({
                    el: el,
                    pile: pile,
                    count: pile.length
                });
            };
        }

        this.renderedCounters = newRenderedCounters;
    }
}

var header = {

    els: {
        header: document.querySelector('.header')
    },

    init() {

        this.render();
    },

    render() {

        this.els.header.textContent = `Deal ${controller.getNumberOfDecksToDeal()} even decks`;
    }
}

controller.init();