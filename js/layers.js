addLayer("p", { // SOMEONE TELL ME HOW TO HARD MAXIMIZE DISTANT SCALE BUYABLES ONTOP
    name: "Prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
        power: new Decimal(0),
		points: new Decimal(0),
        generatePoints: false,
        autob: false,
        autob2: false,
    }},
    color: "#00d9ff",
    nodeStyle() {return {
        "background": (canReset('p'))?"radial-gradient(#FFFFFF, #1cf7d9, #00d9ff)":"" ,
    }},
    componentStyles: {
        "prestige-button"() {return { "background": (canReset('p'))?"radial-gradient(#FFFFFF, #1cf7d9, #00d9ff)":""}} ,    },
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Prestige points", // Name of prestige currency
    resourceSingular: "Prestige point",
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
    mult = mult.mul(tmp.p.buyables[11].effect)
    if (player.a && player.a.unlocked && player.a.points.gt(0)) {
    mult = mult.times(tmp.a.effect)
    }
    if (hasUpgrade('a', 11)) mult = mult.times(upgradeEffect('a', 11))
    if (hasChallenge('p', 32)) mult = mult.times(challengeEffect('p', 32))
    if (player.p.points.gte(Decimal.pow(10, 2658))) mult = mult.div(10)
    if (player.p.points.gte(new Decimal("1e3195"))) mult=mult.div(1e2)
    if (player.p.points.gte(new Decimal("1e5165"))) mult=mult.div(1e10)
    if (hasMilestone('a', 9)) mult = mult.mul(1e13)
    if (inChallenge('a', 22)) mult = mult.root(3)
    if (inChallenge('p', 32)) mult = mult.root(3)
        return mult
    }, // good
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    powerEff() {
        let resource = player.p.power.add(1)
        let exp = tmp.p.powerEffExp
        let eff = resource.pow(exp)
        if (inChallenge('p', 22)) eff = new Decimal(1)
        if (inChallenge('p', 32)) eff = new Decimal(1)
        let scStart = new Decimal(1e18)
        let sc2Start = new Decimal(1e205)
        if (eff.gte(scStart)) eff = eff.pow(4/6).div(10).mul(1e7)
        if (eff.gte(sc2Start)) eff = eff.pow(0.5).div(1e3).mul(1e105).div(2.15443469003188)
        return eff
    },
    powerEffExp() {
        let exp = new Decimal(2)
        if (hasUpgrade('p', 33)) exp = exp.add(0.05)
        if (hasUpgrade('p', 35)) exp = exp.add(0.05)
        if (hasUpgrade('p', 41)) exp = exp.add(0.05)
        if (hasMilestone('p', 2)) exp = exp.add(0.1)
        if (hasMilestone('a', 6)) exp = exp.add(0.05)
        if (hasMilestone('a', 7)&&player.p.points.gte(new Decimal("1e3161"))) exp=exp.add(0.05)
        if (hasChallenge('p', 32)) exp = exp.add(0.25)
        if (hasUpgrade('p', 45)) exp = exp.add(0.15)
        return exp
    },
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
            "resource-display",
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
            "resource-display",
            "blank",
            "challenges"
        ]
    },
    "Buyables": {
        unlocked() {
            let outsideChal = hasUpgrade('a', 12)
            if (inChallenge('p', 32)) outsideChal=false
            return outsideChal
        },
        content: [
            "main-display",
            "prestige-button",
            "resource-display",
            "blank",
            ["buyables", [1,2,3]]
        ]
    },
    "Power": {
        unlocked() {
            return hasUpgrade('p', 31)
        },
        content: [
            "main-display",
            "prestige-button",

            "resource-display",
            ["display-text", 
                function() {
                  let a = "You have "+`<h2 style="color: #00d9ff; text-shadow: 0 0 10px #00d9ff">${formatWhole(player.p.power)}</h2>`+" Prestige Power, which Boosts Points by "+`<h2 style="color: #00d9ff; text-shadow: 0 0 10px #00d9ff">${(format(tmp.p.powerEff))}</h3>`+" (Hold Shift To See Effect Formula)"
                  let a2 = shiftDown?("<br>Effect: (x+1)<sup>"+format(tmp.p.powerEffExp)+"</sup>"):''
                  let eff = tmp.p.powerEff
                  let disSc = new Decimal(1e18)
                  if (eff.gte(disSc)) a += " (softcapped)"
                  return a+a2
                }
            ],
            "blank",
            ["buyables", [4,5,6]]
        ]
    },
},
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    update(diff) {
        if (hasMilestone('a', 2) && canReset('p')) generatePoints("p", diff, new Decimal(1))
        if (hasUpgrade('p', 31)) player.p.power = player.p.power.add(tmp.p.powerGain.mul(diff))
        if (hasMilestone('a', 6) && player.p.autob){
            layers.p.buyables[11].buy()
            layers.p.buyables[12].buy()
        }
        if (hasMilestone('a', 8) && player.p.autob2)
            layers.p.buyables[41].buy()
    },
    powerGain() {
        let exp = tmp.p.powerExp
        if (hasChallenge('p', 22)) exp = exp.add(challengeEffect2('p', 22))
        if (hasUpgrade('p', 41)) exp = exp.add(upgradeEffect('p', 41))
        if (hasMilestone('a', 6)) exp = exp.add(milestoneEffect('a', 6))
        if (hasMilestone('a', 8)) exp = exp.add(milestoneEffect('a', 8))
        if (player.p.power.gte(1e152)) exp = exp.add(1)
        if (player.p.power.gte(2.5e156)) exp=exp.add(3)
        if (player.p.power.gte(2.5e166)) exp=exp.add(6)
        if (player.p.power.gte(2e210)) exp=exp.add(2.5)
        let base = tmp.p.buyables[41].effect
        let befExpMult = new Decimal(1)
        if (hasUpgrade('p', 32)) befExpMult = befExpMult.times(upgradeEffect('p', 32))
        if (hasUpgrade('p', 34)) befExpMult = befExpMult.times(upgradeEffect('p', 34))
        if (hasUpgrade('p', 35)) befExpMult = befExpMult.times(upgradeEffect('p', 35))
        if (hasChallenge('p', 22)) befExpMult = befExpMult.times(challengeEffect('p', 22))
        if (hasUpgrade('p', 43)) befExpMult = befExpMult.times(upgradeEffect2('p', 43))
        if (hasMilestone('p', 1)) befExpMult = befExpMult.times(milestoneEffect2('p', 1))
        befExpMult = befExpMult.mul(tmp.a.buyables[13].effect2)
        befExpMult = befExpMult.times(tmp.p.buyables[43].effect)
        let fullGain = base.pow(exp).mul(befExpMult)
        if (hasUpgrade('p', 45)) fullGain=fullGain.pow(1.01)
        return fullGain
    },
    powerExp() {
        let exp = tmp.p.buyables[42].effect.add(1)
        return exp
    },
doReset(resettingLayer) {
    let keep = []
    if (hasMilestone('a', 0) && resettingLayer=="a") keep.push("milestones")
    if (hasMilestone('a', 1) && resettingLayer=="a") keep.push("upgrades", "challenges")
    if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
},

    layerShown(){return true},
     upgrades: {
        rows: 4,
        cols: 5,
        11: {
            name: "an upgrade name",
            title: "The Start",
            description: "Generate 2 points per second.",
            cost: new Decimal(1),
            effectDisplay() { return format(getPointGen())+"/s" },

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
            description() {
               let dis = "Multiply PP based on your points."
               if (hasChallenge('p', 11)) dis = "Multiply PP And Points based on your points."
               if (hasChallenge('p', 12)) dis = "Multiply PP And Points based on your Prestige points."
               return dis
            },
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
            cost: new Decimal(1e31),
            unlocked() {return hasUpgrade('p', 23) && hasMilestone('p', 0)},
        },
        25: {
            title: "The final Upgrade.",
            description: "Extend the point softcap start by your PP amount.",
            cost: new Decimal(1e37),
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
        31: {
            title: "Prestige Power Incremental",
            description: "Improve Atom Upgrade 13, Unlock Prestige Power.",
            cost: new Decimal(Decimal.pow(10, 610).mul(3.5)),
            unlocked() { return hasUpgrade('a', 33)},
        },
        32: {
            title: "Pres. Power Booster",
            description: "Multiply Pres. Power Based on PP Before The Exponent at Extremely Reduced rate.",
            cost: new Decimal(Decimal.pow(10, 1123)),
            unlocked() { return tmp.p.buyables[42].total.gte(1)},
            effect() {
                let base = player.p.points.add(1).pow(6e-4)
                return base
            },
            effectDisplay() {
                let eff = upgradeEffect(this.layer, this.id)
                let dis = format(eff)+"x"
                return dis
            }
        },
        33: {
            title: "Prestige Power Empowerer",
            description: "Add 0.05 to 'Pres. Pwer. G.' Base And Prestige Power Effect Exp., Improve Atom Challenge 1 Effect yet Again.",
            cost: new Decimal(Decimal.pow(10, 1128).mul(1.25)),
            unlocked() { return tmp.p.buyables[42].total.gte(3) && hasUpgrade('p', 32)}
        },
        34: {
            title: "True Challenging",
            description: "Unlock a Prestige Challenge, Improve Atom Challenge 2 Effect, Multiply Pres. Pow. Gain Bef. Exp. Based on Points.", // this will unlock an another one upon Complete.
            cost: new Decimal(Decimal.pow(10, 1153)),
            unlocked() { return hasUpgrade('p', 33)},
            effect() {
                let base = player.points.add(1).pow(0.00075)
                return base
            },
            effectDisplay() {
                let upgEff = upgradeEffect('p', 34)
                let dis = format(upgEff)+'x'
                return dis
            }
        },
        35: {
            title: "Complete Disturbions",
            description: "PP Boosts Pres. Pow. Bef Exp, Unlock 2 Miles, first at 5 Pres. Pow. Dup, Pres. Pow. Effect Exp+0.05",
            cost: new Decimal(Decimal.pow(10, 1297)),
            unlocked() { return hasUpgrade('p', 34)},
            effect() {
                let base = player.p.points.add(1).pow(0.001)
                return base
            },
            effectDisplay() {
                let upEff = upgradeEffect('p', 35)
                let dis = format(upEff)+'x'
                return dis
            }
        },
        41: {
            title: "Prestigous Prestige Power", // mile 1 (2) is insanely OVERPOWERED THAT ALMOST MADE PTS REACH 1e2000!, so i need to be Careful in putting effects.
            description: "PP Adds to Pres. Pow. Exp Gain, (max 2), Effect Exp+0.05.",
            cost: new Decimal(Decimal.pow(10, 1750)),
            unlocked() { return tmp.p.buyables[42].total.gte(44)},
            effect() {
                let notBase = player.p.points.add(1).pow(0.00015)
                let base = notBase.sub(1)
                if (upgradeEffect('p', 41) < new Decimal(0)) base = new Decimal(0)
                let hardcap = new Decimal(2)
                if (base.gte(hardcap)) base = new Decimal(2)
                return base
            },
            effectDisplay() {
                let effect = upgradeEffect(this.layer, this.id)
                let dis = "+"+format(effect)
                let hardcap = new Decimal(2)
                if (effect.gte(hardcap)) dis += " (hardcapped)"
                return dis
            }
        },
        42: {
            title: "The Power of Eternity",
            description: "Unlock A Mile (3) And Raise Points gain By 1.025, Unlock Atomic Power (In Atoms Layer).",
            cost: new Decimal("e2168"),
            unlocked() { return tmp.p.buyables[42].total.gte(64)}
        },
        43: {
            title: "Boost Incremental",
            description: "Prestige Power and Atomic Power Boost Each Other Before Their Exp.",
            cost: new Decimal("e5740"),
            unlocked() { return tmp.a.buyables[11].total.gte(74)},
            effect() {
                let base = player.p.power.add(10).log10()
                return base
            },
            effect2() {
                let base = player.a.power.add(1).pow(0.25)
                return base
            },
            effectDisplay() {
                let eff1 = upgradeEffect('p', 43)
                let eff2 = upgradeEffect2('p', 43)
                let dis = "A. Pow: "+format(eff1)+"x"+", "+"P. Pow: "+format(eff2)+"x"
                return dis
            }
        },
        44: {
            title: "Prestigous Challenge Empowerers'", // im starting to feel tired.
            description: "Unlock a Challenge, Boost Atomic P. Gain Bef. Its Exp Based on Pres. Pow, Unlock An Atom Mile, Improve A. Chal 1 yet Again, Atom. Pow. G Exp+2.",
            cost: new Decimal("e6200"),
            unlocked() {return tmp.a.buyables[11].total.gte(103) && tmp.a.buyables[12].total.gte(9)},
            effect() {
                let base = player.p.power.add(1).pow(0.01)
                return base
            },
            effectDisplay() {
                let effect = upgradeEffect('p', 44)
                let dis = format(effect)+'x'
                return dis
            }
        },
        45: {
            title: "Hazard Empowerer",
            description: "Unlock an Atom Buyable, Pres. Pow. Eff Exp+0.15, Raise Prestige Power By 1.01, Add to Atom. Pow. Exp Based On Points, Unlock <h3 style='font-family: consolas;'>THE NEXT ATOM UPGRADE</h3>.",
            cost: new Decimal('e12100'),
            effect() {
                let base = player.points.add(10).log10().pow(0.25).div(2.5)
                return base
            },
            effectDisplay() {
                let eff = upgradeEffect('p', 45)
                let dis = "+"+format(eff)
                return dis
            },
            unlocked() {return player.a.buyables[11].gte(403)}
            // got rid of weird inflation.
        }
    },
    challenges: {
        rows: 3,
        cols: 2,
        11: {
            name: "The first challenge",
            challengeDescription: function() {
                let challengeDis = "Points is Square rooted."
                if (inChallenge('p', 11)) challengeDis = challengeDis + " (In Challenge)"
                if (hasChallenge('p', 11)) challengeDis = challengeDis + " (Completed)"
                return challengeDis
            },
            goal: new Decimal(100),
            rewardDescription: "Raise your points by your prestige points and unlock more prestige upgrades, make the upgrade 13 effect boost points gain too.",
            unlocked() { return hasUpgrade('p', 14) },
            canComplete() { return player.points.gte(this.goal) },
            completionLimit: 1,
            rewardEffect() {
                let challengeEffect = player[this.layer].points.add(10).log10().pow(0.2)
                let softcap = new Decimal(1.5)
                let maxEffect = new Decimal(1.7)
                if (challengeEffect.lte(softcap)) return challengeEffect.min(softcap)
                let exccess = challengeEffect.sub(softcap).max(0)
                let allowedGrowth = maxEffect.sub(softcap)
                let softcappedExcess = allowedGrowth.times(exccess.div(exccess.add(allowedGrowth)))
                if (challengeEffect.gte(1.5)) challengeEffect = player[this.layer].points.add(10).log10().pow(0.1) // to prevent inflation
                return softcap.add(softcappedExcess)
            },
            rewardDisplay() { 
        let effectVal = this.rewardEffect()
        let display = "^" + format(effectVal)
        
        if (effectVal.gte(1.695)) {
            display += " (hardcapped)"
        } else if (effectVal.gte(1.5)) {
            display += " (softcapped)"
        }
        
        return display;
    }, // Add formatting to the effect
        },
        12: {
    name: "The serious challenge",
         challengeDescription: function() {
         let challengeDis = "Points is rooted By 2.5 and It's Softcap starts instantly."
         if (inChallenge('p', 11)) challengeDis = challengeDis + " (In Challenge)"
         if (hasChallenge('p', 11)) challengeDis = challengeDis + " (Completed)"
         return challengeDis
        },
    goal: new Decimal(2.5e12),
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
    21: {
        name: "Death of Softcaps",
         challengeDescription: function() {
         let challengeDis = "'The Serious Challenge' and Point's Softcap is 5x times Powerful, 'After-SC Bster' Does nothing."
         if (inChallenge('p', 21)) challengeDis = challengeDis + " (In Challenge)"
         if (challengeCompletions('p', 21) == 2) challengeDis = challengeDis + " (Completed)"
         challengeDis = challengeDis += "<br>Completed:"+challengeCompletions(this.layer, this.id)+ "/" +tmp.p.challenges[21].completionLimit
         return challengeDis
        },
        goal() {
            if (challengeCompletions(this.layer, this.id) == 0) return new Decimal(1e75)
            if (challengeCompletions(this.layer, this.id) == 1) return new Decimal(1e3080)
        },
        rewardDescription: "Add to Atoms' Base (max 0.05), at 2 Comps. (max 0.15) and Multiply Pt Sc Start Based On PP, After 2 Comps. Unlock a Pres Mile at 108 'Pres. Pow. Exp'",
        completionLimit: 2,
        unlocked() {
            return hasUpgrade('p', 34)
        },
        canComplete() {
            return player.points.gte(this.goal())
        },
        rewardEffect() {
            let baseAdded1 = player.p.points.add(1).pow(1e-5)
            let base=baseAdded1=baseAdded1.sub(1)
            let HC = new Decimal(0.05)
            if (challengeEffect(this.layer, this.id) < new Decimal(0)) base = new Decimal(0)
            if (base.gte(HC)) base = new Decimal(HC)
            return base
        },
        rewardEffect2() {
            let base = player.p.points.add(1).pow(0.0225)
            return base
        },
        rewardDisplay() {
            let chalEff = this.rewardEffect()
            let chalEff2 = this.rewardEffect2()
            let dis = "+"+format(chalEff)+", "+format(chalEff2)+"x"
            let HC = new Decimal(0.05)
            if (challengeCompletions(this.layer, this.id) == 2) HC = new Decimal(0.15)
            if (chalEff.gte(HC)) dis = "+"+format(chalEff)+" (hardcapped)"+" ,"+format(chalEff2)+"x"
            return dis
        },
        onEnter() {
            player.p.buyables[11] = new Decimal(0),
            player.p.buyables[12] = new Decimal(0),
            player.p.buyables[13] = new Decimal(0),
            player.p.points = new Decimal(0)
        },
        onExit() {
            player.p.buyables[11] = new Decimal(0),
            player.p.buyables[12] = new Decimal(0),
            player.p.buyables[13] = new Decimal(0),
            player.p.points = new Decimal(0)
        }
    },
    22: {
        name: "The Universe of No Powers",
        challengeDescription: function() {
            let dis = "'Death of Softcaps' and Power Does Nothing, Plus Atom Effect is ^0.5."
            if (inChallenge('p', 22)) dis += " (In challenge)"
            if (challengeCompletions(this.layer, this.id) == 2) dis += " (Completed)"
            dis = dis += "<br>Completed:"+challengeCompletions(this.layer, this.id)+"/"+tmp.p.challenges[22].completionLimit
            return dis
        },
        goal() {
            if (challengeCompletions('p', 22)==0) return new Decimal(1e55)
            if (challengeCompletions('p', 22)==1) return new Decimal(1e3080)
        },
        canComplete() {return player.points.gte(this.goal())},
        completionLimit: 2,
        unlocked() { return hasUpgrade('p', 35) && tmp.p.buyables[42].total.gte(7)},
        rewardDescription: "<h4 style='font-size: 11px'>Multiply Pres. Pow. Gain Bef. Exp Based on Pts and Add to Pres. Pow. Gain Exp Based on PP at reduced rate, After 2 Comps. Unlock 2 Miles, First at 257 Pres. Pow. ???, Improve Ups 32, 34.</h3>",
        rewardEffect() {
            let base = player.points.add(1).pow(0.0015).div(3.333)
            if (tmp.p.challenges[22].challengeEffect < new Decimal(1)) base = new Decimal(1) // prevent nerf
            return base
        },
        rewardEffect2() {
            let base = player.p.points.add(1).pow(0.0002).mul(2)
            base=base.sub(base.div(2)) //like div(2)
            let c22hc = new Decimal(200)
            if (base.gte(c22hc)) base=new Decimal(200)
            return base
        },
        rewardDisplay() {
            let chalEff1 = this.rewardEffect()
            let chalEff2 = this.rewardEffect2()
            let dis = format(chalEff1)+"x"+", "+"+"+format(chalEff2)
            let dishc = new Decimal(200)
            if (chalEff2.gte(dishc)) dis+=" (hardcapped)"
            return dis
        },
        onEnter() {
            player.p.buyables[11] = new Decimal(0),
            player.p.buyables[12] = new Decimal(0),
            player.p.buyables[13] = new Decimal(0),
            player.p.points = new Decimal(0)
        },
        onExit() {
            player.p.buyables[11] = new Decimal(0),
            player.p.buyables[12] = new Decimal(0),
            player.p.buyables[13] = new Decimal(0),
            player.p.points = new Decimal(0)
        },
        countsAs: [21]
    },
    31: {
    name: "No Atoms",
        challengeDescription: function() {
            let dis = "'The Universe Of No Power' And Atoms Does Nothing"
            if (inChallenge('p', 31)) dis += " (In challenge)"
            if (challengeCompletions(this.layer, this.id) == 2) dis += " (Completed)"
            dis = dis += "<br>Completed:"+challengeCompletions(this.layer, this.id)+"/"+tmp.p.challenges[31].completionLimit
            return dis
        },
        goal() {
            if (challengeCompletions('p', 31)==0) return new Decimal(1e6)
            if (challengeCompletions('p', 31)==1) return new Decimal(1e3080)
        },
    currencyDisplayName: "PP",
        canComplete() {return player.p.points.gte(this.goal())},
        completionLimit: 2,
        unlocked() { return hasUpgrade('p', 44) && tmp.a.buyables[11].total.gte(180)},
        rewardDescription: "<h4 style='font-size: 11px'>Multiply A. Pow. G. Bef. Exp Based on Pres. Pow, Add to It's Expoenent Based On Points, After 2 Comps, Unlock More Miles, Improve Pres 44 And 34 Atom Ups, Pres. Pow. Eff Exp+0.5</h3>",
        rewardEffect() {
            let base = player.p.power.add(1).pow(0.0125).div(3.333)
            return base
        },
        rewardEffect2() {
            let base = player.p.points.add(1).pow(0.00005).mul(2)
            base=base.sub(base.div(2)) //like div(2)
            if (tmp.p.challenges[31].challengeEffect2 < new Decimal(0)) base = new Decimal(0)
            return base
        },
        rewardDisplay() {
            let chalEff1 = this.rewardEffect()
            let chalEff2 = this.rewardEffect2()
            let dis = format(chalEff1)+"x"+", "+"+"+format(chalEff2)
            return dis
        },
        onEnter() {
            player.p.buyables[11] = new Decimal(0),
            player.p.buyables[12] = new Decimal(0),
            player.p.buyables[13] = new Decimal(0),
            player.p.points = new Decimal(0)
        },
        onExit() {
            player.p.buyables[11] = new Decimal(0),
            player.p.buyables[12] = new Decimal(0),
            player.p.buyables[13] = new Decimal(0),
            player.p.points = new Decimal(0)
        },
        countsAs: [22]
    },
    32: {
        name: "Atomic Dropdown",
        challengeDescription: function() {
            let dis = "Atom Effect is 1, Prestige Buyables Does Nothing, Power Does Nothing, You're Trapped In the First 4 Atom Challenges. Also Points Gain Exp is ^0.333"
            if (inChallenge('p', 32)) dis += " (In challenge)"
            if (challengeCompletions(this.layer, this.id) == 2) dis += " (Completed)"
            dis = dis += "<br>Completed:"+challengeCompletions(this.layer, this.id)+"/"+tmp.p.challenges[32].completionLimit
            return dis
        },
        goal() {
            if (challengeCompletions('p', 32)==0) return new Decimal(1e33)
            if (challengeCompletions('p', 32)==1) return new Decimal(1e3080)
        },
        canComplete() {return player.points.gte(this.goal())},
        completionLimit: 2,
        unlocked() { return tmp.a.buyables[11].total.gte(300)},
        rewardDescription: "<h4 style='font-size: 10px'>Multiply Pres. Buyable 1 Base by 1.1, at 2 Comps. Multiply it by 1.25 (not Ontop), Pres. Pow. Eff+0.25, Pres. Pow. Multiplies Prestige Pts By It's Effect^0.1, After 2 Comps. Eff^0.15, After 2 Comps. Unlock More Pres Miles, Improve A. Chal 2 Again, Pres. Pow. Eff Exp+1</h3>",
        rewardEffect() {
            let base = tmp.p.powerEff.pow(0.1)
            return base
        },
        rewardDisplay() {
            let chalEff1 = this.rewardEffect()
            let dis = format(chalEff1)+"x"
            return dis
        },
        onEnter() {
            player.p.buyables[11] = new Decimal(0),
            player.p.buyables[12] = new Decimal(0),
            player.p.buyables[13] = new Decimal(0),
            player.p.points = new Decimal(0)
        },
        onExit() {
            player.p.buyables[11] = new Decimal(0),
            player.p.buyables[12] = new Decimal(0),
            player.p.buyables[13] = new Decimal(0),
            player.p.points = new Decimal(0)
        },
    }
    },
     milestones: {
    0: {
        requirementDescription: format(1e22)+' PP (1)',
        requires: new Decimal(1e22),
        effectDescription() { 
            let dis = `Unlock 3 more upgrades and unlock a new layer and multiply points by itself at a reduced rate.<br> Currently: ${format(this.effect())}x`
            let disSc = new Decimal(1e3)
            let effect = milestoneEffect('p', 0)
            if (effect.gte(disSc)) dis += " (softcapped)"
            return dis
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
    1: {
        requirementDescription: format(1e22)+" Pres. Pow (2)",
        requires: new Decimal(1e22),
        done() { return player.p.power.gte(1e22)},
        unlocked() { return tmp.p.buyables[43].total.gte(5)},
        effectDescription() {
            let dis = `Add 0.05 to Atoms' Base, Multiply Pres Buyable 6 Eff By Pres. Pow at Extremely Reduced rate, Multiply Pres. Pow. Gain Bef. Exp Based on PP. (starts at 1e1400 PP), 'Pres. Pow Exp' base+0.05<br>Currently: ${format(this.effect())}x, ${format(this.effect2())}x`
            let sc = new Decimal(1.6)
            let sc2 = new Decimal(2)
            let HARDCAP = new Decimal(4)
            let eff = milestoneEffect('p', 1)
            let eff2 = milestoneEffect2('p', 1)
            let hc = new Decimal(1e6)
            if (eff.gte(sc)) dis += " (softcapped)"
            if (eff.gte(sc2)) dis = `Add 0.05 to Atoms' Base, Multiply Pres Buyable 6 Eff By Pres. Pow at Extremely Reduced rate, Multiply Pres. Pow. Gain Bef. Exp Based on PP. (starts at 1e1400 PP), 'Pres. Pow Exp' base+0.05<br>Currently: ${format(this.effect())}x (softcapped^2), ${format(this.effect2())}x`
            if (eff.gte(HARDCAP)) dis = `Add 0.05 to Atoms' Base, Multiply Pres Buyable 6 Eff By Pres. Pow at Extremely Reduced rate, Multiply Pres. Pow. Gain Bef. Exp Based on PP. (starts at 1e1400 PP), 'Pres. Pow Exp' base+0.05<br>Currently: ${format(this.effect())}x (hardcapped),  ${format(this.effect2())}x`// TO PREVENT MY FUCKING SUFFOCATION!!!
            if (eff2.gte(hc)) dis += " (hardcapped)"
            return dis
        },
        effect() {
            let base = player.p.power.add(10).log10().div(15)
            let sc = new Decimal(1.6)
            let sc2 = new Decimal(2)
            let HARDCAP = new Decimal(4)
            if (base.gte(sc)) base = player.p.power.add(10).log10().div(30).add(base.div(2))
            if (base.gte(sc2)) base=player.p.power.add(10).log10().div(9).add(base.div(2).pow(2.5)).pow(0.4)
            if (base.gte(HARDCAP)) base= new Decimal(4) // TO PREVENT MY SUFFOCATION!!
            return base
        },
        effect2() {
            if (!player.p.points.gte("1e1600")) return new Decimal(1)
            let base = player.p.points.add(1).pow(0.0025)
            let hc = new Decimal(1e6)
            if (base.gte(hc)) base=new Decimal(hc)
            return base
        }
    },
    2: {
        requirementDescription: format(new Decimal("e3198"))+" PP (3)",
        requires: new Decimal("e3198"),
        done() { return player.p.points.gte(new Decimal("e3198"))},
        unlocked() { return hasUpgrade('p', 42)},
        effectDescription() {
            let dis = "Add 0.1 to Pres. Pow. eff Exp, Multiply Pt Sc Start Based on Pts. Currently: "+format(this.effect())+"x"
            return dis
        },
        effect() {
            let base = player.points.add(1).pow(0.01).mul(1e4)
            return base
        }
    }
},
buyables: {
    rows: 6,
    cols: 3,
    11: {
        title()  {
           let title = "Prestige Empowerer"
           let buyableAmt = getBuyableAmount('p', 11)
           let distStart = new Decimal(335)
           let dist2 = new Decimal(1e3)
           if (buyableAmt.gte(distStart)) title = "Distant Prestige Empowerer"
            if (buyableAmt.gte(dist2)) title = "Distant<h3 style='font-family: Consolas'>^</h3>2 Prestige Empowerer"

           return title
        },
        cost(x) {
             let costScale = new Decimal(1e60).mul(Decimal.pow(2.5, x.pow(1.33))) 
             let distStart = new Decimal(335)
             let dist2 = new Decimal(1000)
             if (x.gte(distStart)) costScale = new Decimal(1e75).mul(Decimal.pow(2.5, distStart.pow(1.33))).mul(Decimal.pow(3, x.pow(1.425).sub(4009)))
             if (x.gte(dist2)) costScale = new Decimal(1e75).mul(Decimal.pow(2.5, distStart.pow(1.33))).mul(Decimal.pow(3, dist2.pow(1.425))).mul(Decimal.pow(4, x.pow(1.475).sub(30000)))

             return costScale
            },
        base() {
            let base = new Decimal(2)
            if (hasUpgrade('a', 22)) base = base.add(0.075)
            if (hasMilestone('a', 5)) base = base.add(milestoneEffect('a', 5))
            if (hasChallenge('a', 22)) base = base.add(challengeEffect('a', 22))
            if (hasUpgrade('a', 31)) base = base.add(upgradeEffect('a', 31))
            if (player.p.points.gte("1e2613")) base=base.mul(1.075)
            if (hasChallenge('a', 32)) base = base.mul(1.1)
            return base
        },
        total() {
            let total = getBuyableAmount("p", 11)
            return total
        },
        display() {
             return "Multiply PP and Points by "+format(this.base())+".\n\
             Cost: " + format(tmp.p.buyables[11].cost) + " Prestige points.\n\
             Effect: "+format(tmp.p.buyables[11].effect)+"x\n\
             Amount: "+formatWhole(getBuyableAmount('p', 11))
            },
        effect() {
            let x = tmp.p.buyables[11].total
            let base = tmp.p.buyables[11].base
            let eff = Decimal.pow(base, x)
            return eff
        },
        unlocked() { return hasUpgrade('a', 12) },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        buy() {
            if (player.p.points.gte(this.cost())) {
            if (!hasMilestone('p', 6)) player[this.layer].points = player[this.layer].points.sub(this.cost())
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.buyMax().add(1)))
        }
            if (layers[this.layer].row > this.row) player.p.buyables = new Decimal(0)
            
        },
        buyMax() {
            let s = player.p.points
            let distStart = new Decimal(335)
            let dist2 = new Decimal(1e3)
            let target = s.div(new Decimal(1e40)).log(2.5).root(1.333) // this getting even more Easier!!, cost base * log(cost scale), invert cost exp to root if exp.
            let buyableAmt = tmp.p.buyables[11].total
            if (target.gte(distStart)) target = s.div(new Decimal(1e-26)).mul(Decimal.pow(2.5, distStart.pow(1.33))).log(3).root(1.425) // this is even harder.../* NO WAY I CANT IMPLEMENT MAX BUY WITHIN' DIST SCALE!
            if (target.gte(dist2)) target = s.div(new Decimal('1e1800')).mul(Decimal.pow(2.5, distStart.pow(1.33))).mul(Decimal.pow(3, dist2.pow(1.425))).log(4).root(1.475)
            return target.floor().sub(buyableAmt)
            if (target.eq(0)) target = new Decimal(1)
        },
    },
    12: {
        title()  {
          let title = "Post-Softcap Booster"
          let buyableAmt = getBuyableAmount('p', 12)
          if (buyableAmt.gte(1.8e308)) title = "Distant Post-Softcap Booster" // weird the cost scaling for buyable 11 is far more powerful than cost scale 12 even base and x exp is more than the 11 one
          return title
        },
        cost(x) {
         let baseCost = new Decimal(1e80).mul(Decimal.pow(4, x.pow(1.4)))
         if (x.gte(1.8e308)) baseCost = new Decimal(1e75).mul(Decimal.pow(4, distStart.pow(1.4))).mul(Decimal.pow(6.25, x.pow(1.5).sub(distStart)))
         return baseCost
        }
        ,
        base() {
            let base = new Decimal(2)
            if (hasMilestone('a', 5)) base = base.add(milestoneEffect('a', 5))
            if (hasChallenge('a', 22)) base = base.add(challengeEffect('a', 22))
            if (hasUpgrade('a', 32)) base = base.add(upgradeEffect('a', 32))
            if (inChallenge('p', 21)) base = new Decimal(1)
            if (inChallenge('p', 31)) base = new Decimal(1)
            if (hasUpgrade('a', 25)) base = base.pow(2)
            return base
        },
        total() {
            let total = getBuyableAmount('p', 12)
            return total
        },
        display() {
            return "Multiply Points after Softcap by "+format(this.base())+".\n\
            Cost: "+format(tmp.p.buyables[12].cost) +" Prestige Points.\n\
            Effect: "+format(tmp.p.buyables[12].effect)+ "x\n\
            Amount: "+formatWhole(getBuyableAmount('p', 12))
        },
        effect() {
            let x = tmp.p.buyables[12].total
            let base = tmp.p.buyables[12].base
            let eff = Decimal.pow(base, x)
            let sc = new Decimal(1e170)
            if (eff.gte(sc)) eff=eff.pow(0.5).mul(sc.pow(0.5))
            return eff
        },
        unlocked() {
             let outsideChal = hasUpgrade('a', 14)
             if (inChallenge('p', 21)) outsideChal = false
             if (inChallenge('p', 31)) outsideChal = false
             return outsideChal
            },
        canAfford() { return player[this.layer].points.gte(this.cost()) },
        buy() {
            if (player.p.points.gte(1e80)){
             if (!hasMilestone('a', 6)) player[this.layer].points = player[this.layer].points.sub(this.cost())
            setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(this.buyMax().add(1)))
            }
        },
        buyMax() {
            let s = player.p.points
            let target = s.div(new Decimal(1e80)).log(4).root(1.4) // this getting even more Easier!!, cost base * log(cost scale), invert cost exp to root if exp.
            let buyableAmt = tmp.p.buyables[12].total
            return target.floor().sub(buyableAmt)
            if (target.lte(0)) target = new Decimal(1)
            if (target.gte(0)) target = new Decimal(1)
            if (target.eq(0)) target = new Decimal(1)
        },
        maxAfford() {
            if (hasMilestone('a', 6)) {
            let s = player.p.points
            let target = s.div(new Decimal(1e80)).log(4).root(1.4) // this getting even more Easier!!, cost base * log(cost scale), invert cost exp to root if exp.
            let buyableAmt = tmp.p.buyables[12].total
            return target.floor().sub(buyableAmt)
            if (target.eq(0)) target = new Decimal(1)
            if (isNaN(target)) target = new Decimal(1)
        }
    }
},
    13: {
        title() {
            let title = "Prestigous Empowerer"
            let buyableAmt = tmp.p.buyables[13].total
            let distStart = new Decimal(40)
            if (buyableAmt.gte(distStart)) title = "Distant Prestigous Empowerer"
            return title
        },
        cost(x) {
            let baseCostScale = new Decimal(Decimal.pow(10, 508)).mul(Decimal.pow(7.5, x.pow(1.5)))
            let distStart = new Decimal(40)
            if (x.gte(distStart)) baseCostScale = new Decimal(1e100).mul(Decimal.pow(7.5, distStart.pow(1.5))).mul(Decimal.pow(10, x.pow(1.65).sub(distStart.sub(1)))) // new Decimal(let "any value") is when u cant calculate it and power it by the cost scale exp.
            return baseCostScale
        },
        base() {
            let base = player.p.points.add(1).pow(1e-6)
            let baseScStart = new Decimal(1.0025) 
            if (base.gte(baseScStart)) base = base.div(1.0025).exp(0.9).add(baseScStart.sub(1)).min(baseScStart)
            let baseHC = new Decimal(1.01)
            if (base.gte(baseHC)) base = new Decimal(1.01)
            return base
        },
        total() {
            let total = getBuyableAmount('p', 13)
            return total
        },
        effect() {
            let base = tmp.p.buyables[13].base
            let effSc = new Decimal(1.1)
            let HC = new Decimal(1.5)
            let x = tmp.p.buyables[13].total
            let effect = Decimal.pow(base, x)
            if (base.gte(effSc)) base = base.div(1.1).pow(0.9).add(effSc.sub(1).add(0.011111))
            if (effect.gte(HC)) effect = new Decimal(1.5)
            return effect
        },
        display() {
            let dis = "Raise Points By "+format(this.base())+" (Based on PP)\n\
            Cost: "+format(tmp.p.buyables[13].cost)+" Prestige Points.\n\
            Effect: "+"^"+format(tmp.p.buyables[13].effect)+"\n\
            Amount: "+formatWhole(getBuyableAmount('p', 13))
            let max = new Decimal(163)
            let buyableAmt = tmp.p.buyables[13].total
            let eff = tmp.p.buyables[13].effect
            let effhc = new Decimal(1.5)
            if (eff.gte(effhc)) dis = "Raise Points By "+format(this.base())+" (Based on PP)\n\
            Cost: "+format(tmp.p.buyables[13].cost)+" Prestige Points.\n\
            Effect: "+"^"+format(tmp.p.buyables[13].effect)+" (hardcapped)\n\
            Amount: "+formatWhole(getBuyableAmount('p', 13))
            if (buyableAmt.gte(max)) dis += "(MAXED)"
            return dis
        },
        purchaseLimit: 163,
        unlocked() { return hasUpgrade('a', 31)},
        canAfford() { return player[this.layer].points.gte(this.cost())},
        buy() {
            player[this.layer].points = player[this.layer].points.sub(this.cost())
            setBuyableAmount(this.layer, this.id, getBuyableAmount('p', 13).add(1))
        },
    },
    21: {
        title: "tester buyable", // which does nothin.
        cost(x) {
             let cost11 = new Decimal('e508').mul(Decimal.pow(7.5, x.pow(1.5)))
             let buyableAmt = tmp.p.buyables[21].total
             let distStart = new Decimal(40)
             if (buyableAmt.gte(distStart)) cost11 = new Decimal(1e100).mul(Decimal.pow(7.5, distStart.pow(1.5))).mul(Decimal.pow(10, x.pow(1.65).sub(distStart.sub(1))))
             return cost11
        },
        canAfford() { return player[this.layer].points.gte(this.cost())},
        buy() {
            if (!hasMilestone('a', 6)) player.p.points = player.p.points.sub(this.cost())
            setBuyableAmount(this.layer, this.id, getBuyableAmount('p', 21).add(this.buyMax().add(1)))
        },
        buyMax() {
            let s = player.p.points
            let target = s.div(new Decimal('1e508')).log(7.5).root(1.5)
            let distStart = new Decimal(40)
            let buyableAmt = tmp.p.buyables[21].total
            if (target.gte(distStart)) target = s.div(new Decimal('1e100')).mul(Decimal.pow(7.5, distStart.pow(1.5))).log10().root(1.65)
            if (target.eq(0)) target = new Decimal(1)
            return target.floor().sub(buyableAmt)
        },
        total() {
            let total = getBuyableAmount('p', 21)
            return total
        },
        maxAfford() {
            let s = player.p.points
            let target = s.div(new Decimal('1e508')).log(7.5).root(1.5)
            let distStart = new Decimal(40)
            let buyableAmt = tmp.p.buyables[21].total
            if (target.gte(distStart)) target = s.div(new Decimal('1e100')).mul(Decimal.pow(7.5, distStart.pow(1.5))).log10().root(1.65)
            if (target.eq(0)) target = new Decimal(1)
            return target.floor().sub(buyableAmt)
        },
        display() {
            let dis = "this is just for testing"+"\n\
            Cost: "+format(tmp.p.buyables[21].cost)+" Prestige Points.\n\
            Amount: "+formatWhole(getBuyableAmount('p', 21))
            return dis
        }
    },
    22: {
        title: "tester buyable", // which does nothin.
        cost(x) {
             let costScale = new Decimal(1e60).mul(Decimal.pow(2.5, x.pow(1.33))) 
             let distStart = new Decimal(335)
             let dist2 = new Decimal(1000)
             if (x.gte(distStart)) costScale = new Decimal(1e75).mul(Decimal.pow(2.5, distStart.pow(1.33))).mul(Decimal.pow(3, x.pow(1.425).sub(4009)))
             if (x.gte(dist2)) costScale = new Decimal(1e75).mul(Decimal.pow(2.5, distStart.pow(1.33))).mul(Decimal.pow(3, dist2.pow(1.425))).mul(Decimal.pow(4, x.pow(1.475).sub(30000)))

             return costScale
        },
        canAfford() { return player[this.layer].points.gte(this.cost())},
        buy() {
            if (!hasMilestone('a', 6)) player.p.points = player.p.points.sub(this.cost())
            setBuyableAmount(this.layer, this.id, getBuyableAmount('p', 22).add(this.buyMax().add(1)))
        },
        buyMax() {
            let s = player.p.points
            let distStart = new Decimal(335)
            let dist2 = new Decimal(1e3)
            let target = s.div(new Decimal(1e40)).log(2.5).root(1.333) // this getting even more Easier!!, cost base * log(cost scale), invert cost exp to root if exp.
            let buyableAmt = tmp.p.buyables[22].total
            if (target.gte(distStart)) target = s.div(new Decimal(1e-26)).mul(Decimal.pow(2.5, distStart.pow(1.33))).log(3).root(1.425) // this is even harder.../* NO WAY I CANT IMPLEMENT MAX BUY WITHIN' DIST SCALE!
            if (target.gte(dist2)) target = s.div(new Decimal('1e1800')).mul(Decimal.pow(2.5, distStart.pow(1.33))).mul(Decimal.pow(3, dist2.pow(1.425))).log(4).root(1.475)
            return target.floor().sub(buyableAmt)
            if (target.eq(0)) target = new Decimal(1)
        },
        total() {
            let total = getBuyableAmount('p', 22)
            return total
        },
        maxAfford() {
            let s = player.p.points
            let distStart = new Decimal(335)
            let dist2 = new Decimal(1e3)
            let target = s.div(new Decimal(1e40)).log(2.5).root(1.333) // this getting even more Easier!!, cost base * log(cost scale), invert cost exp to root if exp.
            let buyableAmt = tmp.p.buyables[11].total
            if (target.gte(distStart)) target = s.div(new Decimal(1e-26)).mul(Decimal.pow(2.5, distStart.pow(1.33))).log(3).root(1.425) // this is even harder.../* NO WAY I CANT IMPLEMENT MAX BUY WITHIN' DIST SCALE!
            if (target.gte(dist2)) target = s.div(new Decimal(1e-21)).mul(Decimal.pow(2.5, distStart.pow(1.33))).mul(Decimal.pow(3, dist2.pow(1.425))).log(4).root(1.475)
            return target.floor().sub(buyableAmt)
            if (target.eq(0)) target = new Decimal(1)
        },
        display() {
            let dis = "this is just for testing"+"\n\
            Cost: "+format(tmp.p.buyables[22].cost)+" Prestige Points.\n\
            Amount: "+formatWhole(getBuyableAmount('p', 22))
            return dis
        }
    },
    41: {
        title: "Pres. Power Gain",
        cost(x) { return new Decimal(Decimal.pow(10, 630)).mul(Decimal.pow(10, x.pow(1.475)))},
        base() {
            let base = new Decimal(1)
            if (hasUpgrade('p', 33)) base = base.add(0.05)
            if (player.p.power.gt(2e244) && hasMilestone('a', 7)) base = base.add(0.05)
            if (player.p.power.gt(1e246)) base = base.add(0.05)
            if (player.p.power.gt(1e248)) base=base.add(0.1)
            return base
        },
        total() {
            let total = getBuyableAmount('p', 41)
            return total
        },
        display() {
            return "Gain "+format(tmp.p.buyables[41].base)+" Prestige Power Per Second.\n\
            Cost: "+format(tmp.p.buyables[41].cost)+" Prestige Points\n\
            Effect: "+"+"+format(tmp.p.buyables[41].effect)+"/s"+"\n\
            Amount: "+format(tmp.p.buyables[41].total)
        },
        effect() {
            let base = tmp.p.buyables[41].base
            let x = tmp.p.buyables[41].total
            return Decimal.mul(base, x)
        },
        unlocked() { return hasUpgrade('p', 31)},
        canAfford() { return player[this.layer].points.gte(this.cost())},
        buy() {
             if (player.p.points.gte(this.cost())) {
             if (!hasMilestone('a', 8))player[this.layer].points = player[this.layer].points.sub(this.cost())
             setBuyableAmount(this.layer, this.id, getBuyableAmount('p', 41).add(this.buyMax().add(1)))
            }
        },
        buyMax() {
            let s = player.p.points
            let target = s.div(new Decimal('e630')).log10().root(1.475)
            let buyableAmt = tmp.p.buyables[41].total
            if (target.eq(0)) target = new Decimal(1)
            return target.floor().sub(buyableAmt)
        }
    },
    42: {
        title() {
            let dis = "Pres. Power Exp"
            let amt = tmp.p.buyables[42].total
            let distStart = new Decimal(275)
            if (amt.gte(distStart)) dis = "Distant Pres. Power Exp"
            return dis
        },
        cost(x) {
             let firstCost = new Decimal(10000).mul(Decimal.pow(2.75, x.pow(1.385)))
             let distStart = new Decimal(275)
            if (x.gte(distStart)) firstCost = new Decimal(1e100).mul(Decimal.pow(3, distStart.pow(1.385))).mul(Decimal.pow(5, x.pow(1.65).sub(10750)))
            return firstCost
        },
        base() {
            let base = new Decimal(0.25)
            if (hasMilestone('p', 1)) base=base.add(0.05)
            if (hasMilestone('a', 7)) base=base.add(0.0333)
            return base
        },
        total() {
            let total = getBuyableAmount('p', 42)
            return total
        },
        display() {
            return "Add "+format(tmp.p.buyables[42].base)+" to the exponent of Prestige Power gain.\n\
            Cost: "+format(tmp.p.buyables[42].cost)+" Prestige Power\n\
            Effect: "+"+"+format(tmp.p.buyables[42].effect)+"\n\
            Amount: "+format(tmp.p.buyables[42].total)
        },
        effect() {
            let base = tmp.p.buyables[42].base
            let x = tmp.p.buyables[42].total
            return Decimal.mul(base, x)
        },
        unlocked() { return tmp.p.buyables[41].total.gte(new Decimal(65))},
        canAfford() { return player.p.power.gte(this.cost())},
        buy() {
             player.p.power = player.p.power.sub(this.cost())
             setBuyableAmount(this.layer, this.id, getBuyableAmount('p', 42).add(1))
            },
    },
    43: {
        title() {
            let title = "Pres. Power Duplicator"
            let distStart = new Decimal(40)
            let distStart2 = new Decimal(49)
            let buyableAmt = tmp.p.buyables[43].total
            if (buyableAmt.gte(distStart)) title = "Distant Pres. Power Duplicator"
            if (buyableAmt.gte(distStart2)) title = "Distant^2 Pres. Power Duplicator"
            return title
        },
        cost(x) {
            let baseScale = new Decimal(1e17).mul(Decimal.pow(3, x.pow(1.35)))
            let distStart=new Decimal(40)
            let distStart2 =new Decimal(49)
            if (x.gte(distStart)) baseScale = new Decimal(1).mul(Decimal.pow(3, distStart.pow(1.35)).div(1e5)).mul(Decimal.pow(4.5, x.div(40).pow(1.8).mul(40)))
            if (x.gte(distStart2)) baseScale = new Decimal(1).mul(Decimal.pow(3, distStart.pow(1.35))).mul(4.5, distStart2.pow(1.8)).mul(Decimal.pow(new Decimal(6).mul(x.div(49)), x.div(49).pow(2).mul(49)))
            return baseScale
        },
        base() {
            let base = player.points.add(1).pow(0.00012).mul(player.p.points.add(1).pow(0.000111)).mul(1.333)
            if (hasMilestone('p', 1)) base = base.mul(milestoneEffect('p', 1))
            if (hasMilestone('a', 6) && player.p.points.gte("1e2078")) base = base.mul(5)
            return base
        },
        total() {
            let total = getBuyableAmount('p', 43)
            return total
        },
        display() {
            let dis = "Multply Pres. Pow gain Bef Exp By "+format(tmp.p.buyables[43].base)+" (Based on PP and Points).\n\
            Cost: "+format(tmp.p.buyables[43].cost)+" Prestige Power\n\
            Effect: "+format(tmp.p.buyables[43].effect)+"x"+"\n\
            Amount: "+format(tmp.p.buyables[43].total)
            let sc = new Decimal(1e80)
            let effect = tmp.p.buyables[43].effect
            if (effect.gte(sc)) dis = 
            "Multply Pres. Pow gain Bef Exp By "+format(tmp.p.buyables[43].base)+" (Based on PP and Points).\n\
            Cost: "+format(tmp.p.buyables[43].cost)+" Prestige Power\n\
            Effect: "+format(tmp.p.buyables[43].effect)+"x"+" (softcapped)\n\
            Amount: "+format(tmp.p.buyables[43].total)
            return dis
        },
        effect() {
            let base = tmp.p.buyables[43].base
            let x = tmp.p.buyables[43].total
            let eff = Decimal.pow(base, x)
            let sc = new Decimal(1e80)
            if (eff.gte(sc)) eff = eff.pow(1/4).mul(sc.div(1e20))
            return eff
        },
        unlocked() { return tmp.p.buyables[41].total.gte(new Decimal(84)) && tmp.p.buyables[42].total.gte(12)},
        canAfford() { return player.p.power.gte(this.cost())},
        buy() {
             player.p.power = player.p.power.sub(this.cost())
             setBuyableAmount(this.layer, this.id, getBuyableAmount('p', 43).add(1))
            },
    },
}
})
addLayer("a", {
    name: "Atom",
    symbol: "A",
    position: 1,
    startData() { return {
        unlocked: true,
        auto: false,
        points: new Decimal(0),
        power: new Decimal(0)
    }},
    color: "#08a336",
    requires: new Decimal(1e46),
    resource: "Atoms",
    resourceSingular: "Atom", // When its only have 1 of the resource
    baseResource: "points",
    baseAmount() {return player.points},
    type: "static",
    exponent: 1.5,
    branches: ["p"],
    gainMult() {
        let costMult = new Decimal(1)
        if (hasChallenge('a', 11)) costMult = costMult.div(challengeEffect('a', 11))
        return costMult
    },
    unlocked() { return player.points.gte(1e46)},
    directMult() {
        let mult = new Decimal(1)
        return mult;
    },
    row: 1,
    resetsNothing() {return hasMilestone('a', 4)},
    automate() {},
    autoPrestige() {
        return (hasMilestone('a', 4) && player.a.auto)
    },
    canBuyMax() {
        return hasMilestone('a', 3)
    },
    hotkeys: [
        {key: "a", description: "A: Reset for Atoms", onPress() {if (canReset(this.layer)) doReset(this.layer)}}
    ],
    update(diff) {
        if (hasUpgrade('p', 42)) player.a.power=player.a.power.add(tmp.a.powerGain.mul(diff))
    },
powerGain() {
    let base = tmp.a.buyables[11].effect
    let exp = tmp.a.buyables[12].effect.add(1)
    if (hasChallenge('p', 31)) exp = exp.add(challengeEffect2('p', 31))
    if (hasMilestone('a', 8)) exp = exp.add(milestoneEffect2('a', 8))
    if (hasUpgrade('p', 44)) exp = exp.add(2)
    if (hasUpgrade('p', 45)) exp = exp.add(upgradeEffect('p', 45))
    if (hasMilestone('a', 9)) exp = exp.add(milestoneEffect('a', 9))
    let aftExpMult = new Decimal(1)
    if (hasUpgrade('p', 43)) aftExpMult=aftExpMult.mul(upgradeEffect('p', 43))
    if (hasUpgrade('p', 44)) aftExpMult=aftExpMult.mul(upgradeEffect('p', 44))
    if (hasChallenge('p', 31)) aftExpMult=aftExpMult.mul(challengeEffect('p', 31))
    if (hasMilestone('a', 9)) aftExpMult=aftExpMult.mul(milestoneEffect2('a', 9))
    let eff = base.pow(exp).mul(aftExpMult)
    return eff
},
powerEff() {
    let resource = player.a.power.add(10)
    let exp = tmp.a.powerExp
    let intenseSc = new Decimal(4)
    let effInLog = resource.pow(exp)
    let eff = effInLog.log10().add(1).sub(new Decimal(exp))
    if (eff < new Decimal(1)) eff = new Decimal(1)
    if (eff.gte(intenseSc)) eff = eff.pow(0.25)
    return eff
},
powerExp() {
    let exp = new Decimal(0.01)
    exp = exp.add(tmp.a.buyables[13].effect)
    return exp
},
powerLog() {
    let logExp = new Decimal(1)
    return logExp
},
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
            "resource-display",
            "blank",
            "milestones"
        ]
    },
    "Challenges": {
        unlocked() {
            return hasUpgrade('a', 21)
        },
        content: [
            "main-display",
            "prestige-button",
            "resource-display",
            "blank",
            "challenges"
        ]
    },
    "Power": {
        unlocked() {
            return hasUpgrade('p', 42)
        },
        content: [
            "main-display",
            "prestige-button",
            "resource-display",
            ["raw-html",
                function() {
                    let resourceDis = "You Have " + layerText("h2", "a", format(player.a.power)) + " Atomic Power, which Boosts Atoms' Base By "+ layerText("h2", "a", format(tmp.a.powerEff))+ " (Hold Shift To See Effect Formula)"
                    let a2 = shiftDown?("<br>Effect: log<sup>"+format(1)+"</sup>(x+10)<sup>"+format(tmp.a.powerExp)+"</sup>+1"):''
                    let presDis = "<br>You Have "+layerText("h2","p",format(player.p.points))+ " Prestige Points"
                    return resourceDis+a2+presDis
                },
            ],
            "display-text",
            "blank",
            "buyables"
        ]
    }
},
    effect() {
        let base = player.a.points
        let expBase = new Decimal(2)
        if (hasUpgrade('a', 13)) expBase = expBase.add(0.1)
        if (hasUpgrade('a', 24)) expBase = expBase.add(upgradeEffect('a', 24))
        if (hasUpgrade('a', 33)) expBase = expBase.add(upgradeEffect('a', 33))
        if (hasChallenge('p', 21)) expBase = expBase.add(challengeEffect('p', 21))
        if (hasMilestone('p', 1)) expBase = expBase.add(0.05)
        if (hasUpgrade('p', 42))expBase=expBase.times(tmp.a.powerEff)
        let eff = Decimal.pow(expBase, base)
        if (inChallenge('p', 22)) eff = eff.pow(0.5)
        if (inChallenge('p', 31)) eff = new Decimal(1)
        if (inChallenge('p', 32)) eff = new Decimal(1)
        let capStart = Decimal.pow(10, 1e3)
        
        if (eff.gte(capStart)) {
            eff = Decimal.pow(expBase.pow(0.85), base.div(1.25)).mul(new Decimal("e320"))
        }
        return eff
    },
    effectDescription() {
        let eff = tmp.a.effect        
        let layerEffect = "which boosts points and prestige points by " + layerText("h2", "a", format(eff))
        let capStart = Decimal.pow(10, 1000)
        if (eff.gte(capStart)) {
            layerEffect += " (softcapped)"
        }
        return layerEffect
    },
    // nvm it has some issues so i changed it and its working!

    
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
            unlocked() { return hasUpgrade('a', 11)}, // there is a buyable in upgrade 11 because the effect is implemented but only if you has upgrade 11.
        },
        13: {
            title: "Base Incremental",
            description: "Boost the atom effect base by 0.1.",
            cost: new Decimal(22),
            unlocked() {return hasUpgrade('a', 12)},
        },
        14: {
            title: "More Buyables",
            description: "Unlock another Buyable.",
            cost: new Decimal(23),
            unlocked() {return hasUpgrade('a', 13)},
        },
        15: {
            title: "Weak Softcap",
            description: "Reduce Point Softcap power based on your atoms. (max 0.1)",
            cost: new Decimal(33),
            unlocked() {return hasUpgrade('a', 14)},
            effect() {
                let effect = player.a.points.div(1000)
                let max = new Decimal(0.1)
                if (effect.gte(max)) effect = new Decimal(max)
                return effect
            },
            effectDisplay() {
                let effectBeforeMax = upgradeEffect(this.layer, this.id)
                let dis = "-"+format(effectBeforeMax)
                let max = new Decimal(0.0999)
                if (effectBeforeMax.gte(max)) dis += " (hardcapped)"
                return dis
            },
        },
        21: {
            title: "Even Stronger Nerfs",
            description: "Unlock Atom Challenges.",
            cost: new Decimal(36),
            unlocked() {return hasUpgrade('a', 15)}
        },
        22: {
            title: "Base Incremental 2",
            description: "Add 0.075 to The first Buyable Base.",
            cost: new Decimal(43),
            unlocked() {return hasChallenge('a', 11)}
        },
        23: {
            title: "Complete Complexity",
            description: "Unlock a Milestone and a Challenge and make Challenge 1 formula better.",
            cost: new Decimal(47),
            unlocked() {return hasUpgrade('a', 22)}
        },
        24: {
            title: "Base Power",
            description: "Add to Atoms' Base based on Points at reduced rate. (Max: 0.4)",
            cost: new Decimal(60),
            unlocked() {return hasChallenge('a', 12)},
            effect() {
                let formula = player.points.add(1).pow(0.00035)
                let fixedFor = formula.sub(1)
                let hardcap = new Decimal(0.4)
                if (fixedFor.gte(hardcap)) fixedFor = new Decimal(hardcap)
                if (upgradeEffect('a', 24) < new Decimal(0)) fixedFor = new Decimal(0)
                return fixedFor
            },
            effectDisplay() {
                let effectBeforeHC = upgradeEffect('a', 24)
                let disBeforeHC = "+"+format(effectBeforeHC)
                let hardcap = new Decimal(0.4)
                if (effectBeforeHC.gte(hardcap)) disBeforeHC += " (hardcapped)"
                return disBeforeHC
            },
        },
        25: {
            title: "Challenge Empower",
            description: "Improve Atom Challenge 1 formula again and Unlock 2 more challenges, After-Softcap Expander base^2",
            cost: new Decimal(65), // wtf inflate bug was a weird tore of tense 2 effective lvls bruh so more hard rebalancing or implementing the eff in this one so less hard rebalancing
            unlocked() { return hasUpgrade('a', 24)}
        },
        31: {
            title: "Overgrowing gains",
            description: "Add 0.0005 to The Base of 'Prestige Empowerer' per 'Prestige Empowerer'.",
            cost: new Decimal(133),
            unlocked() { return hasUpgrade ('a', 25) && hasChallenge('a', 22)},
            effect() {
                let base = tmp.p.buyables[11].total.div(2e3)
                let scStart = new Decimal(0.15)
                if (base.gte(scStart)) base = new Decimal(0.15).add(base.div(1.1)).sub(scStart)
                return base
            },
            effectDisplay() {
                let effect = upgradeEffect(this.layer, this.id)
                let dis = "+"+format(effect)
                let scStart = new Decimal(0.15)
                if (effect.gte(scStart)) dis += " (softcapped)"
                return dis
            }
        },
        32: {
            title: "Overgrowing gains 2",
            unlocked() { return hasUpgrade('a', 31)},
            description: "Add 0.00015 to The Base of 'Post-Sc Bster' per 'Post-Sc Bster'. (max 0.1)",
            cost: new Decimal(148),
            effect() {
                let base = tmp.p.buyables[12].total.div(7.5e3)
                let hc = new Decimal(0.1)
                if (base.gte(hc)) base = new Decimal(hc)
                return base
            },
            effectDisplay() {
                let effect = upgradeEffect(this.layer, this.id)
                let dis = "+"+format(effect)
                let hc = new Decimal(0.1)
                if (effect.gte(hc)) dis += " (hardcapped)"
                return dis
            },
        },
        33: {
            title: "Atomic Prestige Expander",
            description: "Unlock More Prestige Upgrades, More Pres Miles, More Pres Chals, And Add To Atoms' Base based on PP. (max 0.25)", // Pres Ups: 2 rows, Pres chals: 4 ontop, Pres Miles: the amt that it's good for me to set and balance these 2 rows
            effect() {
                let added1Base = player.p.points.add(1).pow(0.000025)
                if (hasUpgrade('p', 31))added1Base = player.p.points.add(1).pow(0.00005)
                let base = added1Base.sub(1)
                if (upgradeEffect(this.layer, this.id) < new Decimal(0)) base = new Decimal(0) // To end Value Break
                let max = new Decimal(0.25)
                if (base.gte(max)) base = new Decimal(max)
                return base
            },
            effectDisplay() {
                let effect = upgradeEffect(this.layer, this.id)
                let dis = "+"+format(effect)
                let max = new Decimal(0.25)
                if (effect.gte(max)) dis += " (hardcapped)"
                return dis
            },
            unlocked() { return hasUpgrade('a', 32)},
            cost: new Decimal(152)

        },
        34: {
            title: "Prestigous Tiers",
            description: "",
            unlocked() { return hasUpgrade('a', 33) && player.a.buyables[13].gte(6)},
            cost: new Decimal(1587)

        },
        35: {
            unlocked() { return hasUpgrade('a', 34)},
            cost: new Decimal(1e3)

        },
    },
    challenges: {
        rows: 3,
        cols: 2,
        11: {
            name: "Harsh Softcaps",
            challengeDescription: function() {
                let challengeDis = "Point's softcap is 2x Stronger."
                if (inChallenge('a', 11)) challengeDis = challengeDis + " (In Challenge)"
                if (challengeCompletions == 2) challengeDis = challengeDis + " (Completed)"
                challengeDis = challengeDis + "<br>Completed:" + challengeCompletions('a', 11)+ "/" + tmp.a.challenges[11].completionLimit
                return challengeDis
            },
            goal()  {
                if (challengeCompletions('a', 11) == 0) return new Decimal(1e47);
                if (challengeCompletions('a', 11) == 1) return new Decimal(1e3080);
            },
            rewardDescription: "Divide Atom Reqirement based on points, Unlock more Atoms upgrades at 1 Completion, and unlock a buyable at 2 Challenge completions.",
            unlocked() {return hasUpgrade('a', 21)},
            canComplete() {return player.points.gte(this.goal())},
            completionLimit: 2,
            rewardEffect() {
                let base = player.points.add(1).pow(0.0875)
                if (hasUpgrade('a', 23)) base = player.points.add(1).pow(0.1)
                if (hasUpgrade('a', 25)) base = player.points.add(1).pow(0.111)
                if (hasUpgrade('p', 33)) base = player.points.add(1).pow(0.1333)
                if (hasUpgrade('p', 44)) base = player.points.add(1).pow(0.1625)
                return base
            },
            rewardDisplay() {
                return "/"+format(this.rewardEffect())
            },
            onEnter() {
                doReset("p"),
                player.p.buyables[11] = new Decimal(0),
                player.p.buyables[12] = new Decimal(0),
                player.p.buyables[13] = new Decimal(0),
                player.p.power = new Decimal(0)
                player.p.points = new Decimal(0)
            },
            onExit() {
                doReset("p"),
                player.p.buyables[11] = new Decimal(0),
                player.p.buyables[12] = new Decimal(0),
                player.p.buyables[13] = new Decimal(0),
                player.p.power = new Decimal(0)
                player.p.points = new Decimal(0)
            },

        },
        12: {
            name: "Powerful Combinations",
            challengeDescription: function() {
                let chalDis = "'The First challenge', 'The Serious challenge' and 'Harsh Softcaps' at once."
                if (inChallenge('a', 12)) chalDis = chalDis + " (In Challenge)"
                if (challengeCompletions == 2) chalDis = chalDis + " (Completed)"
                chalDis = chalDis + "<br>Completed:" + challengeCompletions('a', 12)+ "/" + tmp.a.challenges[12].completionLimit
                return chalDis

            },
            goal() {
                if (challengeCompletions('a', 12) == 0) return new Decimal(1e9)
                if (challengeCompletions('a', 12) == 1) return new Decimal(1e3800)
            },
            rewardDescription: "Extend Point Sc Start based on PP at the first Comp. and unlock more Atom Ups, Unlock a Buyable and more Miles and Ups at 2 Comps.",
            unlocked() {return hasUpgrade('a', 23)},
            canComplete() {
                return player.points.gte(this.goal())
            },
            completionLimit: 2,
            rewardEffect() {
                let base = player.p.points.add(1).pow(0.0625)
                if (hasUpgrade('p', 34)) base = player.p.points.add(1).pow(0.075)
                return base
            },
            rewardDisplay() {
                let dis = format(this.rewardEffect())+"x"
                return dis
            },
            onEnter() {
                doReset("p"),
                player.p.buyables[11] = new Decimal(0),
                player.p.buyables[12] = new Decimal(0),
                player.p.buyables[13] = new Decimal(0),
                player.p.power = new Decimal(0)
                player.p.points = new Decimal(0)
            },
            onExit() {
                doReset("p"),
                player.p.buyables[11] = new Decimal(0),
                player.p.buyables[12] = new Decimal(0),
                player.p.buyables[13] = new Decimal(0),
                player.p.power = new Decimal(0)
                player.p.points = new Decimal(0)
            },
            countsAs: [11]
        },
        21: {
            name: "Immune Softcaps",
            challengeDescription: function() {
                let chalDis = "'Harsh Softcaps' and Point's Softcap starts Instantly."
                if (inChallenge('a', 21)) chalDis = chalDis + " (In Challenge)"
                if (challengeCompletions == 2) chalDis = chalDis + " (Completed)"
                chalDis = chalDis + "<br>Completed:" + challengeCompletions('a', 21)+ "/" + tmp.a.challenges[21].completionLimit
                return chalDis
            },
            unlocked() { return hasUpgrade('a', 25)},
            goal() {
                if (challengeCompletions(this.layer, this.id) == 0) return new Decimal(1e137)
                if (challengeCompletions(this.layer, this.id) == 1) return new Decimal(1e3080)
            },
            canComplete() {
                return player.points.gte(this.goal())
            },
            completionLimit: 2,
            rewardDescription: "Reduce Softcap Power Based on Points. ((max: 0.075), After 2 Comps, max 0.15), At 2 Comps, unlock a buyable and More Atom Ups, More Atom Miles.",
            rewardEffect() {
                let baseOther = player.points.add(1).pow(0.000075)
                let max = new Decimal(0.075)
                let c11ScStart = new Decimal(0.0751)
                let base = baseOther.sub(1)
                if (challengeEffect('a', 21) < new Decimal(0)) base = new Decimal(0) // to prevent any effect breaks
                if (base.gte(c11ScStart)) base = base.div(2).add(c11ScStart)
                if (base.gte(max)) base = new Decimal(max)
                return base
            },
            rewardDisplay() {
                let effectBeforeHC = this.rewardEffect()
                let disBeforeHC = "-"+format(effectBeforeHC)
                let c11ScStart = new Decimal(0.0751)
                let max = new Decimal(0.075)
                if (challengeCompletions('a', 21) == 2) max = new Decimal(0.15)
                if (effectBeforeHC.gte(c11ScStart)) disBeforeHC =+ " (softcapped)"
                if (effectBeforeHC.gte(max)) disBeforeHC += " (hardcapped)"
                return disBeforeHC
            },
            onEnter() {
                doReset("p"),
                player.p.buyables[11] = new Decimal(0),
                player.p.buyables[12] = new Decimal(0),
                player.p.buyables[13] = new Decimal(0),
                player.p.power = new Decimal(0)
                player.p.points = new Decimal(0)
            },
            onExit() {
                doReset("p"),
                player.p.buyables[11] = new Decimal(0),
                player.p.buyables[12] = new Decimal(0),
                player.p.buyables[13] = new Decimal(0),
                player.p.points = new Decimal(0)
            },
            countsAs: [11]
        },
        22: {
            name: "Prestige Dropdown",
            challengeDescription: function() {
                let chalDis = "'Immune Softcaps' and Points and PP is rooted by 3"
                if (inChallenge(this.layer, this.id)) chalDis = chalDis + " (In Challenge)"
                if (challengeCompletions(this.layer, this.id) == 2) chalDis = chalDis =+ " (Completed)"
                chalDis = chalDis + "<br>Completed:" + challengeCompletions(this.layer, this.id) + "/" + tmp.a.challenges[22].completionLimit
                return chalDis
            },
            goal() {
                if (challengeCompletions(this.layer, this.id) == 0) return new Decimal(1e33) // always a big number to test points after nerf and nerfs and calculate the maximum points gain in challenge and set it into a certain goal, after this change the goal to the pt amt in the challenge itself.
                if (challengeCompletions(this.layer, this.id) == 1) return new Decimal(1e3080)
            },
            canComplete() { return player.points.gte(this.goal())},
            completionLimit: 2,
            rewardDescription: `<h4 style="font-size: 11px;">Add Base to both PP Buyables Based on PP at extremely reduced rate. ((max: 0.15), After 2 Comps, (max: 0.25)), After 2 Comps, Unlock Atom Buyables, Unlock a Buyable, More Atom Ups and Miles.</h4>`,
            rewardEffect() {
                let baseOther = player.p.points.add(1).pow(0.00005) // to prevent value breaks
                let chalHardcap = new Decimal(0.15)
                let chalScStart = new Decimal(0.151) // to prevent such Sc decrease and effect weakens'
                let base = baseOther.sub(1)
                let comps = Decimal.min(this.challengeCompletions, 1)
                if (challengeEffect(this.layer, this.id) < new Decimal(0)) base = new Decimal(0) // like the prev chal comment
                if (base.gte(chalHardcap)) base=new Decimal(chalHardcap)
                if (base.gte(chalScStart)) base = base.div(2).add(chalScStart)
                return base
            },
            rewardDisplay() {
                let chalEffect = this.rewardEffect()
                let dis = "+"+format(chalEffect)
                let chalHardcap = new Decimal(0.15)
                let chalScStart = new Decimal(0.151) // for the display
                if (chalEffect.gte(chalHardcap)) dis += " (hardcapped)"
                if (chalEffect.gte(chalScStart)) dis += " (softcapped)"
                return dis
            },
            onEnter() {
                doReset("p"),
                player.p.buyables[11] = new Decimal(0),
                player.p.buyables[12] = new Decimal(0),
                player.p.buyables[13] = new Decimal(0),
                player.p.power = new Decimal(0)
                player.p.points = new Decimal(0)
            },
            onExit() {
                doReset("p"),
                player.p.buyables[11] = new Decimal(0),
                player.p.buyables[12] = new Decimal(0),
                player.p.buyables[13] = new Decimal(0),
                player.p.power = new Decimal(0)
                player.p.points = new Decimal(0)
            },
            countsAs: [21],
            unlocked() {return hasChallenge('a', 21)}
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
            effectDescription: "Gain 100% of PP on what you've get on reset.",
            done() { return player.a.points.gte(5) },
            unlocked() { return hasMilestone('a', 1)},
        },
        3: {
            requirementDescription: "10 Atoms (4)",
            effectDescription: "You can buy max Atoms.",
            done() { return player.a.points.gte(10) },
            unlocked() { return hasMilestone('a', 2)},

        },
        4: {
            requirementDescription: "30 Atoms (5)",
            effectDescription: "Automatically gain Atoms and it resets nothing.",
            done() { return player.a.points.gte(30) },
            toggles: [["a", "auto"]],
            unlocked() { return hasMilestone('a', 3)},
        },
        5: {
            requirementDescription: "50 Atoms (6)",
            effectDescription() {
                 let disBeforeMax = `Add Base to The first 2 Buyables based on your atoms. (Max: 0.25)<br> Currently: +${format(this.effect())}`
                 let max = new Decimal(0.25)
                 let base = milestoneEffect('a', 5)
                 if (base.gte(max)) disBeforeMax += " (hardcapped)"
                 return disBeforeMax
                },
            done() { return player.a.points.gte(50) && hasUpgrade('a', 23) },
            unlocked() { return hasUpgrade('a', 23)},
            effect() {
                let base = player.a.points.div(1000)
                let max = new Decimal(0.25)
                if (base.gte(max)) base = new Decimal(0.25)
                return base
            }
        },
        6: {
            requirementDescription: "390 Atoms (7)",
            effectDescription() {
                let eff = this.effect()
                let dis = "Add to Pres. Pow Exp Based On Pres. Pow (Max +3) At reduced Rate, Autobuy 'After-Sc Bster', 'P-igous Emp.', Pres. Pow. Exp. +1/+3/+6/+2.5 At "+format(1e152)+"/"+format(2.5e156)+"/"+format(2.5e166)+"/"+format(2e210)+" Pres. Pow, Pres. Pow. Dup Base*5 at "+format(Decimal.pow(10, 2078))+" PP"+", Eff. Exp+0.05, But divide PP By "+format(10)+" At "+format("1e2658")+" PP.<br> Currently: "+"+"+format(eff)
                let hc = new Decimal(3)
                if (eff.gte(hc)) dis += " (hardcapped)"
                return dis
            },
            done() { return player.a.points.gte(390)},
            unlocked() { return hasMilestone('a', 5)},
            effect() {
                let base = player.p.power.add(1).pow(0.0025)
                let hc = new Decimal(3)
                if (base.gte(hc)) base = new Decimal(hc)
                return base
            },
            toggles: [['p', 'autob']]
        },
        7: {
            requirementDescription: "490 Atoms (8)",
            effectDescription() {
                let eff = this.effect()
                let dis = "Add 0.033 to 'Pres. Pow. Exp' Base, 'Pres. Pow. Gain' Base+0.05/+0.05/0.1 At "+format(1e244)+"/"+format(1e246)+"/"+format(1e248)+" Pres. Pow, 'P-igous-Pow' base*1.075 at "+format("1e2613")+" PP, Pres. Pow Eff Exp+0.05 At 1.000e3161 PP, But divide PP By 100 At 1e3195 PP, Divide PP Again By 1e10 At 1e5165 PP." // balance reqs' to prevent surpass.
                return dis
            },
            done() {return player.a.points.gte(490)},
            unlocked() {return hasMilestone('a', 6)},
            effect() {
                let base = new Decimal(0)
                return base
            },
        },
        8: {
            requirementDescription: format(1060)+" Atoms (9)",
            effectDescription() {
                let eff1 = milestoneEffect('a', 8)
                let eff2 = milestoneEffect2('a', 8)
                let dis = "Add to P. Pow. G Exp. Based On Atoms, Add to A. Pow. G Exp. Based On PP, Autobuy 'Pres. Pow. G.'. Currently: "+"+"+format(eff1)+", "+"+"+format(eff2)
                return dis
            },
            done() { return player.a.points.gte(1060) && hasUpgrade('p', 44)},
            unlocked() { return hasUpgrade('p', 44)},
            effect() {
                let base = player.a.points.div(250)
                return base
            },
            effect2() {
                let base = player.p.points.add(1).pow(0.00005)
                return base
            },
            toggles: [['p', 'autob2']]
        },
        9: {
            requirementDescription: format('1e160')+" Atom. Power (10)",
            effectDescription() {
                let eff1 = milestoneEffect('a', 9)
                let eff2 = milestoneEffect2('a', 9)
                let dis = 'Multply PP by 1.000e13, Unlock a new mile at ???, Add to A. Pow. G Exp. Based On Atoms, Multiply Its G. Bef Exp based on itself, Unlock a new Challenge At ???, Autobuy "Atom. Pow. G.". Currently: <br>'+"+"+format(eff1)+', '+"x"+format(eff2)
                let sc = new Decimal(1e2)
                let sc2 = new Decimal(1e100)
                if (eff1.gte(sc)) dis ='Multply PP by 1.000e13, Unlock a new mile at ???, Add to A. Pow. G Exp. Based On Atoms, Multiply Its G. Bef Exp based on itself, Unlock a new Challenge At ???, Autobuy "Atom. Pow. G.". Currently: <br>'+"+"+format(eff1)+" (softcapped)"+', '+"x"+format(eff2)
                if (eff2.gte(sc2)) dis ='Multply PP by 1.000e13, Unlock a new mile at ???, Add to A. Pow. G Exp. Based On Atoms, Multiply Its G. Bef Exp based on itself, Unlock a new Challenge At ???, Autobuy "Atom. Pow. G.". Currently: <br>'+"+"+format(eff1)+', '+"x"+format(eff2)+ " (softcapped)"
                if (eff1.gte(sc) && eff2.gte(sc2)) dis ='Multply PP by 1.000e13, Unlock a new mile at ???, Add to A. Pow. G Exp. Based On Atoms, Multiply Its G. Bef Exp based on itself, Unlock a new Challenge At ???, Autobuy "Atom. Pow. G.". Currently: <br>'+"+"+format(eff1)+" (softcapped)"+', '+"x"+format(eff2)+ " (softcapped)"
                return dis
            },
            done() { return player.a.power.gte(1e160) && hasUpgrade('p', 45)},
            unlocked() { return hasMilestone('a', 8) && hasUpgrade('p', 45)},
            effect() {
                let base = player.a.points.div(500)
                let sc = new Decimal(1e2)
                if (base.gte(sc)) base = base.log10().div(2).pow(0.5).mul(100).pow(base.log10().div(2).pow(0.5).max(1))
                return base
            },
            effect2() {
                let base = player.a.power.add(1).pow(0.01)
                let sc11 = new Decimal(1e100)
                if (base.gte(sc11)) base = base.log10().div(100).pow(0.5).mul(10).pow(new Decimal(100).mul(base.log10().div(100).pow(0.5).div(1).max(1)))
                return base
            },
            toggles: [['a', 'autoba']]
        }
 
    },
    buyables: {
        11: {
            title: "Atom. Pow. Gain",
        cost(x) { return new Decimal(Decimal.pow(10, 5174)).mul(Decimal.pow(10, x.pow(1.475)))},
        base() {
            let base = new Decimal(1)
            return base
        },
        total() {
            let total = getBuyableAmount('a', 11)
            return total
        },
        display() {
            return "Gain "+format(tmp.a.buyables[11].base)+" Atomic Power Per Second.\n\
            Cost: "+format(tmp.a.buyables[11].cost)+" Prestige Points\n\
            Effect: "+"+"+format(tmp.a.buyables[11].effect)+"/s"+"\n\
            Amount: "+format(tmp.a.buyables[11].total)
        },
        effect() {
            let base = tmp.a.buyables[11].base
            let x = tmp.a.buyables[11].total
            return Decimal.mul(base, x)
        },
        unlocked() { return hasUpgrade('p', 42)},
        canAfford() { return player.p.points.gte(this.cost())},
        buy() {
             player.p.points = player.p.points.sub(this.cost())
             setBuyableAmount(this.layer, this.id, getBuyableAmount('a', 11).add(1))
            },
        },
        12: {
            title: "Atom. Pow. Exp",
        cost(x) { return new Decimal(1e4).mul(Decimal.pow(4.75, x.pow(1.6)))},
        base() {
            let base = new Decimal(1)
            return base
        },
        total() {
            let total = getBuyableAmount('a', 12)
            return total
        },
        display() {
            return "Add "+format(tmp.a.buyables[12].base)+" To Exp. of Atomic Pow. G.\n\
            Cost: "+format(tmp.a.buyables[12].cost)+" Atomic Power\n\
            Effect: "+"+"+format(tmp.a.buyables[12].effect)+"\n\
            Amount: "+format(tmp.a.buyables[12].total)
        },
        effect() {
            let base = tmp.a.buyables[12].base
            let x = tmp.a.buyables[12].total
            return Decimal.mul(base, x)
        },
        unlocked() { return tmp.a.buyables[11].total.gte(20)},
        canAfford() { return player.a.power.gte(this.cost())},
        buy() {
             player.a.power = player.a.power.sub(this.cost())
             setBuyableAmount(this.layer, this.id, getBuyableAmount('a', 12).add(1))
            },
        },
        13: {
            title: "Atom. Pow. Empower",
        cost(x) { return new Decimal(1e156).mul(Decimal.pow(15, x.pow(1.9)))},
        base() {
            let base = new Decimal(0.0001)
            return base
        },
        base2() {
            let base2= player.a.power.add(1).pow(0.1)
            let sc = new Decimal(1e30)
            if (base2.gte(sc)) base2 = player.a.power.add(1).log10().div(sc.log10().div(10)).pow(sc.log10().div(2))
            return base2
        },
        total() {
            let total = getBuyableAmount('a', 13)
            return total
        },
        display() {
            return "Add "+format(tmp.a.buyables[13].base)+" To Exp. of Atomic Pow. Eff, Multiply Pres. Pow By "+format(tmp.a.buyables[13].base2)+"\n\
            Cost: "+format(tmp.a.buyables[13].cost)+" Atomic Power\n\
            Effect: "+"+"+format(tmp.a.buyables[13].effect)+", "+format(tmp.a.buyables[13].effect2)+"x"+"\n\
            Amount: "+format(tmp.a.buyables[13].total)
        },
        effect() {
            let base = tmp.a.buyables[13].base
            let x = tmp.a.buyables[13].total
            return Decimal.mul(base, x)
        },
        effect2() {
            let base = tmp.a.buyables[13].base2
            let x = tmp.a.buyables[13].total
            return Decimal.pow(base, x)
        },
        unlocked() { return tmp.a.buyables[11].total.gte(426)},
        canAfford() { return player.a.power.gte(this.cost())},
        buy() {
             player.a.power = player.a.power.sub(this.cost())
             setBuyableAmount(this.layer, this.id, getBuyableAmount('a', 13).add(1))
            },
        }
    }
})