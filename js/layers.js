addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#00d9ff",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
    if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13))
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    upgrades: {
        11: {
            name: "an upgrade name",
            title: "the start",
            description: "Multiply your points",
            cost: new Decimal(1)
        },
        12: {
            name: "another upgrade name",
            title: "multipling",
            description: "Multiply your points based on your prestige points",
            cost: new Decimal(4),
            unlocked() { return hasUpgrade('p', 11) },
                effect() {
        return player[this.layer].points.add(1).pow(0.3)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },
        13: {
            name: "yet another upgrade name",
            title: "reverse multipling",
            description: "Multiply PP based on your points",
            cost: new Decimal(10),
            unlocked() { return hasUpgrade('p', 12) },
                effect() {
        return player[this.layer].points.add(1).pow(0.2)
    },
    effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
        },            
        14: {
            name: "yet another upgrade name",
            title: "The challenging day",
            description: "Unlock a challenge.",
            unlocked() { return hasUpgrade('p', 14) },
        }
    },
    challenges: {
        11: {
            name: "The first challenge",
            description: "points is square rooted.",
            goal: new Decimal(100),
            rewardDescription: "Raise your points by your prestige points.",
            unlocked() { return hasUpgrade('p', 14) },
            canComplete() { return player.points.gte(this.goal) },
            completionLimit: 1,
            rewardEffect() {
                return player[this.layer].points.add(1).log10().pow(0.5)
            },
            rewardDisplay() { return format(this.rewardEffect())+"x" }, // Add formatting to the effect
        }
    },
})
