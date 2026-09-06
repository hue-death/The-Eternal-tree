let modInfo = {
	name: "The Eternal Tree",
	author: "Hue-death",
	id: '11',
	pointsName: "points",
	pointsNameSingular: "point",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 0.05,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1.1",
	name: "Hard Rebalancing and Intital Release",
}

let changelog = `<h1>Changelog:</h1><br>
    <h3>v0.1.1</h3><Br>
	- Added Atomic Power!<br>
	- Added Prestige Power!<br>
	- Added 2 Atom Buyables.<br>
	- Added 9 Prestige Upgrades.<br>
	- Added 6 Prestige Buyables.<br>
	- Added A Display For PP in Atomic Power Tab.<br>
	- Added 4 Prestige Challenges.<br>
	- Added 2 Prestige Milestones.<br>
	- Added 1 Atom Milestones.<br>
	- Changed some Pres Upgrade Costs.<br>
	- Changed the req for Atom Chal 3 (1e139 -> 1e137).<br>
	<h4 style="color: #ff0000; font-weight: bold;">WARNING: GAME OVERINFLATION BUG AFTER 1e16000 PP!<h4>
    <h2 style="color: green">v0.1</h2><br>
	- Added Atoms.<br>
	- Added Atom Challenges.<br>
	- Added 23 Upgrades.<br>
	- Added 7 Milestones.<br>
	- Added 2 Challenges.<br>
	<h3>v0.0001</h3><br>
	    - Added some things.<br>
		- Added stuff.<br>
		<h3>v0.0</h3><br>
		- Added things.<br>
		- Added stuff.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...<br> Tell Me if you Encountered Any Bugs In the game`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	let can=false
	if (hasUpgrade('p', 11)) can=true
	return can
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	if (hasUpgrade('p', 11)) gain = gain.times(2)
	if (hasUpgrade('p', 12)) gain = gain.times(upgradeEffect('p', 12))
	if (hasUpgrade('p', 13) && hasChallenge('p', 11)) gain = gain.times(upgradeEffect('p', 13))
	if (inChallenge('p', 11)) {gain = gain.pow(0.5);}
	if (challengeCompletions('p', 11) > 0) gain = gain.pow(challengeEffect('p', 11))
	if (hasUpgrade('p', 15)) gain = gain.times(upgradeEffect('p', 15))
	if (hasUpgrade('p', 22)) gain = gain.times(upgradeEffect('p', 22))
	if (hasUpgrade('p', 23)) gain = gain.times(upgradeEffect('p', 23))
	if (hasMilestone('p', 0)) gain = gain.times(milestoneEffect('p', 0))
	if (hasUpgrade('p', 42)) gain = gain.pow(1.025)
	gain = gain.mul(tmp.p.buyables[11].effect)
    gain = gain.pow(tmp.p.buyables[13].effect)
		gain = gain.times(tmp.a.effect)
	if (inChallenge('a', 22)) {
		gain = gain.root(3)
	}
	if (inChallenge('p', 21)) {
		gain = gain.root(2.5)
	}
	if (inChallenge('p', 31)) {
		gain = gain.root(2.5)
	}
	if (inChallenge('p', 32)) {
		gain = gain.root(135)
	}

	gain = gain.mul(tmp.p.powerEff)
	
	let displayScStart = new Decimal(1e20)

if (hasUpgrade('p', 25)) {
	displayScStart = displayScStart.mul(upgradeEffect('p', 25))
}
if (hasChallenge('a', 12)) {
	displayScStart = displayScStart.mul(challengeEffect('a', 12))
}
if (hasChallenge('p', 21)) {
	displayScStart = displayScStart.mul(challengeEffect2('p', 21))
}
if (hasMilestone('p', 2)) {
	displayScStart = displayScStart.mul(milestoneEffect('p', 2))
}
    let displayScSeverity = new Decimal(2)
	if (hasUpgrade('p', 23)) displayScSeverity = displayScSeverity.sub(0.05)
	if (hasUpgrade('a', 15)) displayScSeverity = displayScSeverity.sub(upgradeEffect('a', 15))
	if (hasChallenge('a', 21)) displayScSeverity = displayScSeverity.sub(challengeEffect('a', 21))
	if (inChallenge('a', 11)) displayScSeverity = displayScSeverity.mul(2)
	if (inChallenge('p', 21)) displayScSeverity = displayScSeverity.mul(5)
	if (inChallenge('p', 31)) displayScSeverity = displayScSeverity.mul(5)
	if (inChallenge('p', 32)) displayScSeverity = displayScSeverity.times(16)

    if (gain.gte(displayScStart)) {
        let excess = gain.div(displayScStart)
        gain = displayScStart.times(excess.pow(Decimal.dOne.div(displayScSeverity))).mul(tmp.p.buyables[12].effect)
    }
	if (inChallenge('p', 12)) {
		gain = softcap(gain, new Decimal(1), 0.4, 0)
		displayScStart = displayScStart.div(displayScStart)
	}
	if (inChallenge('a', 12)) {
		gain = gain.root(5)
		displayScStart = displayScStart.div(displayScStart)
	} // dude i know this was a fake nerf but i must do this because cant allow non-this layer chals at once.
	if (inChallenge('a', 13)) {
		displayScStart = displayScStart.div(displayScStart)
	}
	if (inChallenge('p', 21)) {
		displayScStart = displayScStart.div(displayScStart)
	}
	if (inChallenge('p', 31)) {
		displayScStart = displayScStart.div(displayScStart)
	}
	if (inChallenge('p', 32)) {
		displayScStart = displayScStart.div(displayScStart)
	}
	if (hasUpgrade('a', 11)) {
		gain = gain.times(upgradeEffect('a', 11))
	}

	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
    function() {
        // 1. Added safety checks to make sure the TMT layer system is fully initialized
        if (player && player.points && layers.p && layers.p.upgrades) {
            let displayScStart = new Decimal(1e20)
            
            // 2. Safe check: only get effect if the upgrade system is active
            if (hasUpgrade('p', 25)) {
                displayScStart = displayScStart.times(upgradeEffect('p', 25))
            }
			if (hasChallenge('a', 12)) {
	        displayScStart = displayScStart.mul(challengeEffect('a', 12))
			}
			if (inChallenge('p', 12)) {
				displayScStart = displayScStart.div(displayScStart)
			}
			if (inChallenge('p', 21)) {
		        displayScStart = displayScStart.div(displayScStart)
	        }
            
            let displayScSeverity = new Decimal(2)
			if (hasUpgrade("p", 23)) displayScSeverity = displayScSeverity.sub(0.05)
			if (hasUpgrade('a', 15)) displayScSeverity = displayScSeverity.sub(upgradeEffect('a', 15))
			if (inChallenge('a', 11)) displayScSeverity = displayScSeverity.mul(2)
			if (hasChallenge('a', 21)) displayScSeverity = displayScSeverity.sub(challengeEffect('a', 21))
			if (inChallenge('p', 21)) displayScSeverity = displayScSeverity.mul(5)
			if (inChallenge('p', 31)) displayScSeverity = displayScSeverity.mul(5)
	        if (inChallenge('p', 32)) displayScSeverity = displayScSeverity.times(16)


            if (player.points.gte(displayScStart)) {
                 return `
                 <span style="color: #5e0202; font-weight: bold; font-size: 20px;">You are currently softcapped at ${format(displayScStart)} points.</span>
                 <br>
                 <span style="color: brown; font-size: 20px;">Softcap Power: ${format(displayScSeverity)}</span>
                 `
            }
        }
        return "";
    },
]
// Determines when the game "ends"
function isEndgame() {
		return player.points.gte("ee10") // because the bug intented to be in 1e15000 then tetrational overinflation.
}


// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(1) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}