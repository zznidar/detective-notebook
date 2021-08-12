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

    lacksUnUnion(union) {
        for(let l of Object.keys(this.lacks)) {
            if(!union.has(l)) {
                // Card is outside union; player lacks it for sure
                this.lacks[l] = true;
                this.holds[l] = false;
            }
        }
    }

    clues() {
        let clues = [];
        let lasko = []; // Add elemets, later dedupe them to get union
            // Note: we could have simply used [].concat(...this.showed);
        let intersection = [];

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
        /* This thing is false and leads to wrong conclusions. The intersection clue catches all clues, anyway.
        if(union.size >= 3*NCards) {
            // player lacks all cards outside of the union
            // Actually, we could test combinations of unions of _NCards_ shows.
                // This should give us more information. TOBEDONE
            this.lacksUnUnion(union);
            helper.add(`${this.name}: Showed ${NCards} of ${union.size} unique cards; Lacks all cards outside of [${
                [...union].join(", ")
            }].`);

            updateTable();
        }
        */

        // Find intersection
        if(this.showed.length >= NCards) {
            console.group("Intersection");
            console.log("Ready to find intersection.")
            // when we get NCard unique shows, all cards are contained in their union; unUnion is lacked.
            // First, get (shows over NCard) combinations
            let combos = k_combinations(this.showed, NCards);
            console.log("combos", combos);
            for(let c of combos) {
                // Now find out whether each two cards are unique.
                let isOk = true;
                let comb2s = k_combinations(c, 2);
                console.log("c: ", c, "comb2s: ", comb2s);
                for(let c2 of comb2s) {
                    if(!this.areUnique(...c2)) {
                        isOk = false;
                        console.log("c2 not unique", c2)
                        break;
                    }  // All pairs inside combination must be unique, else try next combo.
                }
                console.log("*****");
                if(isOk === false) continue; // We also need to skip to the next iteration.
                console.log("#####");
                // All pairs inside this combination are unique.
                    // All unUnion cards are lacked (union contains all cards this player holds)
                let cunion = new Set([].concat(...c)); // Union of this combination
                console.log("cunion", cunion);
                console.groupEnd();
                this.lacksUnUnion(cunion);
                helper.add(`${this.name}: ${NCards} unique* shows; lacks all cards outside of [${
                    [...cunion].join(", ")
                }].`);
                helper.add(`*Shows are considered unique if their intersection is lacked or empty.`);

                updateTable();
            }


            /*
            intersection = intersect(...this.showed);
            if(intersection.length == 1) { // TODO: We also need to figure out the rules if intersection is larger
                if(this.lacks[intersection[0]]) {
                    // Lacks intersection; all cards outside union are lacked as well.
                    this.lacksUnUnion(union);
                    helper.add(`${this.name}: Lacks intersected ${intersection[0]} _nekiNeki_; lacks all cards outside of [${
                        [...union].join(", ")
                    }].`);
                    updateTable();

                    // CRITICAL: This is only true if holds are disjunct but for this one element!
                    // TODO: when we get NCard unique holds, all cards are contained in their union; unUnion is lacked.
                }
            }
            */
        }

        

        return(clues);
    }

    
    areUnique(first, second) {
        // Find out if two arrays are unique.
        // DEF: Two arrays are unique if their intersection is lacked or empty.
        let intersection = intersect(first, second);
        if(intersection.length == 0) return(true); // they are truly unique by all means
        for(let i of intersection) {
            if(!this.lacks[i]) {
                return(false); // Holds this card or is not yet known; not necessarily unique
            }
        }
        return(true); // User lacks intersection; holds are unique
        // F4T: Are two empty sets unique?
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

function intersect(first, ...rest) {
    // Check for each element of the first array if it also exists in all other arrays.
    let intersection = [];
    intersection = first.filter((el) => { 
        for(r of rest) {
            if(!r.includes(el)) {
                return(false);
            }
        }
        return(true);
    })
    return(intersection);
}

function sameArray(first, second) {
    return(first.length == second.length
        && (new Set(first.concat(second))).size == first.length
        );
}

// k_combinations function by luispaulorsl: https://gist.github.com/axelpale/3118596#gistcomment-2751797
const k_combinations = (set, k) => {
    if (k > set.length || k <= 0) {
      return []
    }
    
    if (k == set.length) {
      return [set]
    }
    
    if (k == 1) {
      return set.reduce((acc, cur) => [...acc, [cur]], [])
    }
    
    let combs = [], tail_combs = []
    
    for (let i = 0; i <= set.length - k + 1; i++) {
      tail_combs = k_combinations(set.slice(i + 1), k - 1)
      for (let j = 0; j < tail_combs.length; j++) {
        combs.push([set[i], ...tail_combs[j]])
      }
    }
    
    return combs
}
  


rounds = []; // Array of all rounds
const players = new Map(); // Array of players added in order, starting with yourself

helper = new Set(); // Contains clues/suggestions once known
// Show helper log: [...helper].join("\n");

