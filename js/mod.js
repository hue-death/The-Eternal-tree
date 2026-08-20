let modInfo = {
	name: "The Eternal Tree",
	author: "you",
	pointsName: "points",
	pointsNameSingular: "point",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.0001",
	name: "Literally nothing",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.0001</h3><br>
	    - Added some things.<br>
		- Added stuff.<br>
		<h3>v0.0</h3><br>
		- Added things.<br>
		- Added stuff.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

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
	if (hasUpgrade('p', 13)) gain = gain.times(upgradeEffect('p', 13))
	if (inChallenge('p', 11)) {gain = gain.pow(0.5);}
	if (challengeCompletions('p', 11) > 0) gain = gain.pow(challengeEffect('p', 11))
	if (hasUpgrade('p', 15)) gain = gain.times(upgradeEffect('p', 15))
	if (hasUpgrade('p', 22)) gain = gain.times(upgradeEffect('p', 22))
	if (hasUpgrade('p', 23)) gain = gain.times(upgradeEffect('p', 23))
	if (player.a && player.a.unlocked && player.a.points.gt(0)) {
		gain = gain.times(tmp.a.effect)
	}
	
	let displayScStart = new Decimal(1e20)

if (hasUpgrade('p', 25)) {
	displayScStart = displayScStart.times(upgradeEffect('p', 25))
}
    let displayScSeverity = new Decimal(2)
	if (hasUpgrade('p', 23)) displayScSeverity = displayScSeverity.sub(0.05)
    if (gain.gte(displayScStart)) {
        let excess = gain.div(displayScStart)
        gain = displayScStart.times(excess.pow(Decimal.dOne.div(displayScSeverity)))
    }
	if (inChallenge('p', 12)) {
		gain = softcap(gain, new Decimal(1), 0.4, 0)
		displayScStart = new Decimal(1)
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
            
            let displayScSeverity = new Decimal(2)
			if (hasUpgrade("p", 23)) displayScSeverity = displayScSeverity.sub(0.05)

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
	return player.points.gte(1e308)
}


// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}