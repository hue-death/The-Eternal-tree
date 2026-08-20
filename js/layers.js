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
    resourceSingular: "prestige point",
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
    softcap: new Decimal(1e40),
    softcapPower: 0.9,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        let mult = new Decimal(1)
    if (hasUpgrade('p', 13)) mult = mult.times(upgradeEffect('p', 13))
    if (hasUpgrade('p', 21)) mult = mult.times(upgradeEffect('p', 21))
    if (player.a && player.a.unlocked && player.a.points.gt(0)) {
    mult = mult.times(tmp.a.effect)
    if (hasUpgrade('a', 11)) mult = mult.times(upgradeEffect('a', 11))
}

        return mult
    }, // good
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
tabFormat: {
    "Main": {
        content: [
            "main-display",
            "prestige-button",
            "resource-display",
            "blank",
            "upgrades",
            "blank"
        ]
    },
    "Milestones": {
        unlocked() {
            // Added parentheses around player checks to guarantee proper logical evaluation
            return hasUpgrade('p', 22) || hasMilestone('a', 0)
        },
        content: [
            "main-display",
            "prestige-button",
            "blank",
            "milestones"
        ]
    },
    "Challenges": {
        /* Safety wrap: Only show the Challenges tab button if the player can actually run challenges
        after this, you was the retard
        i suck cuz im new to this
        */
        unlocked() {
            return hasUpgrade('p', 14)
        },
        content: [
            "main-display",
            "prestige-button",
            "blank",
            "challenges"
        ]
    },
    "Buyables": {
        unlocked() {
            return hasUpgrade('a', 12)
        },
        content: [
            "main-display",
            "prestige-button",
            "blank",
            "buyables"
        ]
    }
},
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    update(diff) {
        if (hasMilestone('a', 2)) generatePoints("p", diff)
    },
doReset(resettingLayer) {
    let keep = []
    if (hasMilestone('a', 0) && resettingLayer=="a") keep.push("milestones")
    if (hasMilestone('a', 1) && resettingLayer=="a") keep.push("upgrades", "challenges")
    if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
},

    layerShown(){return true},
     upgrades: {
        rows: 2,
        cols: 5,
        11: {
            name: "an upgrade name",
            title: "the start",
            description: "Multiply your points",
            cost: new Decimal(1),


        },
        12: {
            name: "another upgrade name",
            title: "multipling",
            description: "Multiply your points based on your prestige points",
            cost: new Decimal(4),
            unlocked() { return hasUpgrade('p', 11) },
            effect() {
                let pp = player[this.layer].points.add(1)
                let exponent = hasChallenge('p', 12) ? 0.45 : 0.333
                let effectOne = pp.pow(exponent)
                
                // Softcap hits at 1e10 (10,000,000,000)
                let softcapStart = new Decimal(1e10)
                if (effectOne.gte(softcapStart)) {
                    let ppAtSoftcap = softcapStart.pow(1 / exponent)
                    let excessPP = pp.div(ppAtSoftcap).max(1)
                    // Growth slows down past 1e10 without dropping
                    effectOne = softcapStart.times(excessPP.pow(0.15))
                }
                return effectOne;
            },
            effectDisplay() { 
                let eff = upgradeEffect(this.layer, this.id)
                return format(eff) + "x" + (eff.gte(1e10) ? " (softcapped)" : "")
            }, 
        },
        13: {
            name: "yet another upgrade name",
            title: "reverse multipling",
            description: "Multiply PP based on your points",
            cost: new Decimal(10),
            unlocked() { return hasUpgrade('p', 12) },
            effect() {
                let isBeaten = hasChallenge('p', 12)
                let sourceCurrency = isBeaten ? player[this.layer].points.add(1) : player.points.add(1)
                let exponent = isBeaten ? 0.4 : 0.2
                
                let effectTwo = sourceCurrency.pow(exponent)
                
                // Softcap hits at 1e7 (10,000,000)
                let softcapStart = new Decimal(1e7)
                if (effectTwo.gte(softcapStart)) {
                    let sourceAtSoftcap = softcapStart.pow(1 / exponent)
                    let excessSource = sourceCurrency.div(sourceAtSoftcap).max(1)
                    // Growth slows down past 1e7 without dropping
                    effectTwo = softcapStart.times(excessSource.pow(0.1))
                }
                return effectTwo;
            },
            effectDisplay() { 
                let eff = upgradeEffect(this.layer, this.id)
                return format(eff) + "x" + (eff.gte(1e7) ? " (softcapped)" : "")
            },
        },            
        14: {
            name: "yet another upgrade name",
            title: "The challenging day",
            description: "Unlock a challenge.",
            cost: new Decimal(50),
            unlocked() { return hasUpgrade('p', 13) },
        },
        15: {
            name: "the Expansion",
            title: "An Expansion",
            description: "multiply points by themselves",
            cost: new Decimal(1e3),
            unlocked() { return hasChallenge('p', 11)},
            effect() {
                let points = player.points.add(1)
                
                // 1. Determine base exponent (Upgrade 23 overrides 0.33 to 0.28)
                let exponent = hasUpgrade('p', 23) ? 0.28 : 0.33
                let effect = points.pow(exponent)
                
                let effectSoftcap = new Decimal(1e3) 
                
                // 2. Smooth point-anchored softcap to prevent drops
                if (effect.gte(effectSoftcap)) {
                    let pointsAtSoftcap = effectSoftcap.pow(1 / exponent)
                    let excessPoints = points.div(pointsAtSoftcap).max(1)
                    effect = effectSoftcap.times(excessPoints.pow(0.25)) // Smoothly scales at 0.25 power past 4e4
                }
                
                return effect;
            },
            effectDisplay() {
                let currentEffect = upgradeEffect(this.layer, this.id) 
                let effectSoftcap = new Decimal(1e3) 
                
                let display = format(currentEffect) + "x"
                if (currentEffect.gte(effectSoftcap)) {
                    display += " (softcapped)"
                }
                return display
            },
        },
        21: {
            name: "the mid power",
            title: "Close to create an softcap.",
            description: "Multiply PP by themselves",
            cost: new Decimal(2.5e4),
            unlocked() {return hasUpgrade('p', 15)},
            effect() { return player.p.points.add(1).pow(0.20)},
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x"}
        },
        22: {
            title: "Almost there!",
            description: "Multiply points based on upgrades",
            cost: new Decimal(1e6),
            unlocked() {return hasUpgrade('p', 21)},
            effect() {
                if (!hasUpgrade('p', 22)) return new Decimal(1)

                let ups = 0;
                if (hasUpgrade('p', 11)) ups++;
                if (hasUpgrade('p', 12)) ups++;
                if (hasUpgrade('p', 13)) ups++;
                if (hasUpgrade('p', 14)) ups++;
                if (hasUpgrade('p', 15)) ups++;
                if (hasUpgrade('p', 21)) ups++;
                if (hasUpgrade('p', 22)) ups++;
                if (hasUpgrade('p', 23)) ups++;
                if (hasUpgrade('p', 24)) ups++;
                if (hasUpgrade('p', 25)) ups++;

                return Decimal.pow(2, ups)
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
        },
        23: {
            title: "Pushing even further",
            description: "Muitiply points based on your prestige points and weaken softcaps a bit. (exculuding the challenge effect)",
            cost: new Decimal(2.5e23),
            unlocked() {return hasMilestone('p', 0) && hasUpgrade('p', 22)},
            effect() {
                let effect = player.p.points.add(1).pow(0.3)
                if (effect.gte(1e5)) effect = player.p.points.add(1).pow(0.20) // to prevent inflation
                return effect;
            },
             effectDisplay() {
        let eff = upgradeEffect(this.layer, this.id);
        let display = format(eff) + "x";
        
        if (eff.gte(1e5)) display += " (softcapped)";
        return display;
    },
            onBuy() {

            },
        },
        24: {
            title: "another challenging day",
            description: "Unlock another challenge.",
            cost: new Decimal(2.5e28),
            unlocked() {return hasUpgrade('p', 23) && hasMilestone('p', 0)},
        },
        25: {
            title: "The final Upgrade.",
            description: "Extend the point softcap start by your PP amount.",
            cost: new Decimal(1e35),
            unlocked() {return hasChallenge('p', 12)},
effect() {
    let points = player[this.layer].points.add(1)
    let baseEffect = points.pow(0.15)
    let maxEffect = new Decimal(4e4)
    
    if (baseEffect.gte(maxEffect)) {
        // 1. Find exactly how many points are needed to reach 4e4 effect
        // Formula: 4e4^(1 / 0.15)
        let pointsAtSoftcap = maxEffect.pow(1 / 0.15) 
        
        // 2. Get your excess points above that threshold
        let excessPoints = points.div(pointsAtSoftcap).max(1)
        
        // 3. Scale ONLY the excess points by your new 0.1 exponent 
        // and multiply it safely by your 4e4 baseline anchor
        baseEffect = maxEffect.times(excessPoints.pow(0.1))
    }
    
    return baseEffect
},
           effectDisplay() {
    // 1. Correctly pull the live value from TMT's cache system
    let currentEffect = upgradeEffect(this.layer, this.id) 
    
    // 2. Perform your display checks using the correct variable name
    if (currentEffect.gte(4e4)) {
        return format(currentEffect) + "x (softcapped)"
    }
    return format(currentEffect) + "x"
}
        },
    },
    challenges: {
        11: {
            name: "The first challenge",
            challengeDescription: "Points is square rooted.",
            goal: new Decimal(100),
            rewardDescription: "Raise your points by your prestige points and unlock more prestige upgrades.",
            unlocked() { return hasUpgrade('p', 14) },
            canComplete() { return player.points.gte(this.goal) },
            completionLimit: 1,
            rewardEffect() {
                let challengeEffect = player[this.layer].points.add(10).log10().pow(0.2)
                let softcap = new Decimal(1.5)
                let maxEffect = new Decimal(1.7)
                if (challengeEffect.lte(softcap)) return challengeEffect
                let exccess = challengeEffect.sub(softcap).max(0)
                let allowedGrowth = maxEffect.sub(softcap)
                let softcappedExcess = allowedGrowth.times(exccess.div(exccess.add(allowedGrowth)))
                if (challengeEffect = 1.5) challengeEffect = player[this.layer].points.add(10).log10().pow(0.1).min(1.5) // to prevent inflation
                return softcap.add(softcappedExcess)
            },
            rewardDisplay() { 
        let effectVal = this.rewardEffect()
        let display = "^" + format(effectVal)
        
        if (effectVal.gte(1.7)) {
            display += " (hardcapped)"
        } else if (effectVal.gte(1.5)) {
            display += " (softcapped)"
        }
        
        return display;
        keepOnReset: return hasMilestone('a', 1)
    }, // Add formatting to the effect
        },
        12: {
    name: "The serious challenge",
    challengeDescription: "point gain is rooted by 2.5 and softcap starts instantly.",
    goal: new Decimal(2.5e11),
    rewardDescription() {
        return `Strengthen both multipliers and reverse ones' formula and unlock the final Upgrade.`
    },
    completionLimit: 1,
    unlocked() { return hasUpgrade('p', 24) },
    canComplete() {
        return player.points.gte(this.goal)
    },
    // Dynamically calculates the rewards whenever called
    rewardEffect() {
        if (!hasChallenge(this.layer, this.id)) return { eff1: new Decimal(1), eff2: new Decimal(1) }
        
        // Use .pow() instead of .exp() for formulas
        let effectOne = player[this.layer].points.add(1).pow(0.4)
        let effectTwo = player[this.layer].points.add(1).pow(0.333)
        
        return { eff1: effectOne, eff2: effectTwo }
    },
},

    },
     milestones: {
    0: {
        requirementDescription: '1e22 PP',
        requires: new Decimal(1e22),
        effectDescription() { 
            return `Unlock 3 more upgrades and unlock a new layer and multiply points by itself at a reduced rate. Currently: ${format(this.effect())}x`
        },
        done() { return player[this.layer].points.gte(1e22) },
        unlocked() { return hasUpgrade('p', 22) || hasMilestone('a', 0) },
        effect() {
            let points = player.points.add(1)
            let baseEffect = points.pow(0.075)
            let softcapStart = new Decimal(1e3)
            
            // Fixed the drop-back bug using the point-anchor method
            if (baseEffect.gte(softcapStart)) {
                let pointsAtSoftcap = softcapStart.pow(1 / 0.075)
                let excessPoints = points.div(pointsAtSoftcap).max(1)
                baseEffect = softcapStart.times(excessPoints.pow(0.045))
            }
            return baseEffect
        },
    },
},
     Buyables: {
        rows: 3,
        cols: 3,
        11: {
            title: "??? Empowerer",
            cost(x=player.p.buyables) {
                let cost = new Decimal(1e50).mul(Decimal.pow(50, 1.1, x).pow(1.5))
                return cost.floor()
            },
            display() { return "Multiply ??? by ???x"},
            unlocked() {return hasUpgrade('a', 12)},
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect() {return Decimal.pow(2, player.p.buyables)}
        },
     }
})
addLayer("a", {
    name: "Atom",
    symbol: "A",
    position: 1,
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
    }},
    color: "#08a336",
    requires: new Decimal(1e43),
    resource: "Atoms",
    resourceSingular: "Atom", // Fixed typo here
    baseResource: "points",
    baseAmount() {return player.points},
    type: "static",
    exponent: 1.5,
    branches: ["p"],
    directMult() {
        let mult = new Decimal(1)
        return mult;
    },
    row: 2,
tabFormat: {
    "Main": {
        content: [
            "main-display",
            "prestige-button",
            "resource-display",
            "blank",
            "upgrades",
            "blank"
        ]
    },
    "Milestones": {
        unlocked() {
            // Added parentheses around player checks to guarantee proper logical evaluation
            return hasMilestone('p', 0) || hasMilestone('a', 0) || (player.a && player.a.unlocked)
        },
        content: [
            "main-display",
            "prestige-button",
            "blank",
            "milestones"
        ]
    },
},
    effect() {
        let base = player.a.points
        let eff = Decimal.pow(2, base)
        let capStart = Decimal.pow(2, 1024)
        
        if (eff.gte(capStart)) {
            eff = Decimal.pow(2, base.pow(0.8))
        }
        return eff
    },
    effectDescription() {
        let eff = tmp.a.effect
        
        let styledNumber = `<span style="color: #08a336; font-family: 'Lucida Console', monospace; font-weight: normal; font-size: 22px; text-shadow: 0 0 3px #08a336, 0 0 6px #08a336, 0 0 10px #08a336;">${format(eff)}</span>`
        
        let layerEffect = "which boosts points and prestige points by " + styledNumber
        
        if (eff.gte(Decimal.pow(2, 1024))) {
            layerEffect += " (softcapped)"
        }
        return layerEffect
    },

    

    layerShown() {return hasMilestone('p', 0)},

    upgrades: {
        11: {
            title: "Prestige Pusher",
            description: "Multiply points and PP based on points at a reduced rate.",
            cost: new Decimal(3),
            effect() {
                let base = player.points.add(1).pow(0.05) // because of PP overinflation
                return base
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id))+"x"
            }
        },
        12: {
            title: "Finally! the continus boosts ontop!",
            description: "Unlock a buyable in prestige layer.",
            cost: new Decimal(10),
            unlocked() { return hasUpgrade('a', 11)}, // there is nothing in upgrade 11 because effect is not implemented yet
        }, 
    },

    milestones: {
        0: {
            requirementDescription: "1 Atom (1)",
            effectDescription: "Keep Prestige Milestones on all resets.",
            done() { return player.a.points.gte(1) },
            keepOnReset: true 
        },
        1: {
            requirementDescription: "2 Atoms (2)",
            effectDescription: "Keep all PP upgrades and Challenges in all resets.",
            done() { return player.a.points.gte(2) },
            unlocked() { return hasMilestone('a', 0)},
            keepOnReset: true
        },
        2: {
            requirementDescription: "5 Atoms (3)",
            effectDescription: "Gain 100% of PP on what you've get on reset",
            done() { return player.a.points.gte(5) },
            unlocked() { return hasMilestone('a', 1)},
        }
    },
})