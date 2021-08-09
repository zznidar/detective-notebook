guests = ["mustard", "plum", "green", "peacock", "scarlet", "white"];
weapons = ["knife", "candlestick", "pistol", "poison", "rope", "dumbbell"];
rooms = ["hall", "dinningRoom", "kitchen", "patio", "observatory", "theatre", "livingRoom", "spa", "guestHouse"];

class Cards {
    constructor() {
        for(let g of guests) {
            this[g] = undefined;
        }
        
        for(let w of weapons) {
            this[w] = undefined;
        }
        
        for(let r of rooms) {
            this[r] = undefined;
        }
    }
}

class Player {
    constructor() {
        this.lacks = new Cards();
        this.holds = new Cards();
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
        return(clues);
    }
}

class Round {
    constructor(caller, calledGuest, calledWeapon, calledRoom, witness = undefined, card = undefined) {
        this.caller = caller;
        this.calledGuest = calledGuest;
        this.calledWeapon = calledWeapon;
        this.calledRoom = calledRoom;
        this.witness = witness;
        this.card = card;    
    }
}

function* order() {
    //let playersOrder = players.keys();
    let NPlayers = playersOrder.length;
    let current = 0;

    while(true) {
        console.log("plO : ", playersOrder);
        let jump = yield playersOrder[current];
        if(!isNaN(jump)) current = jump;
        current = (++current)%NPlayers;
        console.log(current);
    }
}

rounds = []; // Array of all rounds
const players = new Map(); // Array of players added in order, starting with yourself

playersOrder = ["Me", "Player1", "Player2", "Player3", "Player4", "Player5"];
for(let playername of playersOrder) {
    players.set(playername, new Player());
}

// test of clues
players.get("Me").showed.push(["plum", "green", "white"])
players.get("Me").lacks["plum"] = true
players.get("Me").clues()