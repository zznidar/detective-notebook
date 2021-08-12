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
        this.showed = []; // Would it be better if this was not an array of arrays but rather a 1D array,
                // then we would read 3-by-3 elements at once? (NCards-by-NCards)
        this.helped = [];
    }

    clues() {
        let clues = [];
        let lasko = []; // Add elemets, later dedupe them to get union

        // We know for each round the cards called.
        // Combine this knowledge wih lacking cards to determine possible holds.
        for(let t of this.showed) {
            // Find possible holds for each round
            clues.push(t.filter((el) => { return !this.lacks[el] }));

            // Prepare for union
            lasko.push(...t);
        }

        for(let c of clues) {
            if(c.length == 1) {
                // Once showed 3 cards, now 2 of them are knowingly lacked
                if(!this.helped.includes(c[0])) {
                    // This is the first time this clue was suggested by our super-smart AI
                    this.helped.push(c[0]);
                    helper.add(`${this.name}: Once showed 3 cards, now 2 of them are knowingly lacked; holds ${c[0]}${
                        this.lacks[c[0]] === false ? " (though this was already known)" : ""
                    }.`);
                    knownCard(this.name, c[0]);
                }
            }
        }

        let union = new Set(lasko);
        console.log(lasko, union);
        if(union.size >= 3*NCards) {
            // player lacks all cards outside of the union
            // Actually, we could test combinations of unions of _NCards_ shows.
                // This should give us more information. TOBEDONE
            for(let l of Object.keys(this.lacks)) {
                if(!union.has(l)) {
                    // Card is outside union; player lacks it for sure
                    this.lacks[l] = true;
                    this.holds[l] = false;
                }
            }
            helper.add(`${this.name}: Showed ${NCards} of ${union.size} unique cards; Lacks all cards outside of [${
                [...union].join(", ")
            }].`);

            updateTable();
        }

        

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
        //console.log("plO : ", playersOrder);
        let jump = yield playersOrder[current];
        if(!isNaN(jump)) current = jump;
        current = (++current)%NPlayers;
        //console.log(current);
    }
}

function knownCard(player, card) {
    for(const [playerName, hand] of players) {
        hand.lacks[card] = !(playerName == player);
        hand.holds[card] = (playerName == player);
    }
    updateTable();
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
    NCards = Number(inNCards);
    playersOrder = inNames.split(",");
    for(let playername of playersOrder) {
        players.set(playername, new Player(playername));
    }

    currentIndex = 0; // your turn
    playerGen = order();
    currentPlayer = playerGen.next().value;


    // If there are fewer than 6 players, cards are split evenly, 3 are put into envelope, 
    // and excess cards are shown to public. Assign them to a "publiclyKnown" player, but 
    // don't add that player into the playersOrder
    const PUBLICLY_KNOWN = "publiclyKnown";
    players.set(PUBLICLY_KNOWN, new Player(PUBLICLY_KNOWN, true, false));
}

function nextRound() {
    currentIndex++;
    currentPlayer = playerGen.next().value;
}

function updateClues() {
    for([n, p] of players) {
        p.clues();
    }
}

rounds = []; // Array of all rounds
const players = new Map(); // Array of players added in order, starting with yourself

helper = new Set(); // Contains clues/suggestions once known
// Show helper log: [...helper].join("\n");

