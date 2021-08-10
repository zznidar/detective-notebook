guests = ["mustard", "plum", "green", "peacock", "scarlet", "white"];
weapons = ["knife", "candlestick", "pistol", "poison", "rope", "dumbbell"];
rooms = ["hall", "dinningRoom", "kitchen", "patio", "observatory", "theatre", "livingRoom", "spa", "guestHouse"];

class Cards {
    constructor(defaultState = undefined) {
        for(let g of guests) {
            this[g] = defaultState;
        }
        
        for(let w of weapons) {
            this[w] = defaultState;
        }
        
        for(let r of rooms) {
            this[r] = defaultState;
        }
    }
}

class Player {
    constructor(name, defaultLacks = undefined, defaultHolds = undefined) {
        this.name = name;
        this.lacks = new Cards(defaultLacks);
        this.holds = new Cards(defaultHolds);
        this.showed = [];
    }

    clues() {
        let clues = [];
        // We know for each round the cards called.
        // Combine this knowledge wih lacking cards to determine possible holds.
        for(let t of this.showed) {
            // Find possible holds for each round
            clues.push(t.filter((el) => { return !this.lacks[el] }));
        }
        helper.push(`${this.name}: `);
        return(clues);
    }
}

class Round {
    constructor(caller, calledCards, witness = undefined, card = undefined) {
        this.caller = caller;
        this.calledCards = calledCards;
        this.witness = witness;
        this.card = card;    
    }
}

function writeRound(r) {
    rounds.push(r);
}

function* order() {
    //let playersOrder = players.keys();
    NPlayers = playersOrder.length;
    let current = 0;

    while(true) {
        console.log("plO : ", playersOrder);
        let jump = yield playersOrder[current];
        if(!isNaN(jump)) current = jump;
        current = (++current)%NPlayers;
        console.log(current);
    }
}

function knownCard(player, card) {
    for(const [playerName, hand] of players) {
        hand.lacks[card] = !(playerName == player);
        hand.holds[card] = (playerName == player);
    }
}

function holdsCards(player, cards, really) {
    if(really) {
        players.get(player).showed.push(cards);
    } else {
        for(c of cards) {
            players.get(player).lacks[c] = true;
            players.get(player).holds[c] = false;
        }
    }
}

function init(inNames, inNCards) {
    alert(inNames + inNCards);
    playersOrder = inNames.split(",");
    for(let playername of playersOrder) {
        players.set(playername, new Player(playername));
    }

    currentIndex = 0; // your turn
    const playerGen = order();
    currentPlayer = playerGen.next().value;


    // If there are fewer than 6 players, cards are split evenly, 3 are put into envelope, 
    // and excess cards are shown to public. Assign them to a "publiclyKnown" player, but 
    // don't add that player into the playersOrder
    const PUBLICLY_KNOWN = "publiclyKnown";
    players.set(PUBLICLY_KNOWN, new Player(PUBLICLY_KNOWN, true, false));
}

rounds = []; // Array of all rounds
const players = new Map(); // Array of players added in order, starting with yourself

helper = new Set(); // Contains clues/suggestions once known
// Show helper log: [...helper].join("\n");

