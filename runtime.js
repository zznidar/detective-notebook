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
    while(true) {
        let 
    }
}

rounds = []; // Array of all rounds
const players = new Map(); // Array of players added in order, starting with yourself


players.set("Me", new Player());
players.set("Player1", new Player());
players.set("Player2", new Player());
players.set("Player3", new Player());
players.set("Player4", new Player());
players.set("Player5", new Player());


