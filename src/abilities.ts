import { stats } from './stats.js'
import { classData, dist, move, crit, zoom, createStatCard, getWeaponCards } from './classes.js'
import { knockback } from './upgrades.js'

const abilityData = [
	() => ["Chilli Bean Bomb",15,.275,0,,,[9.25,2.25,,3],,,,,,,,,,,[125,8]],
	() => ["Pea Gatling",30,1.4,1.5,,[875,100,,,,.04,[[10,1.2,2.5,550,,,10,1,550]],[[4,5.2,.06,-.1,.1,12],[2.975,3.4,.038,-.106,.106,12.75],.1,2.5,-.6,.3,.01,100],[.32,,,.8,,,.012,,,4],[.1,,,.35,,,.005,,,2.5]]],
	() => ["Pea Suped",20,.1,0,7.5,,,[,,1.1,,,,1.2,,,,,2.4]],
	() => ["Spikeweed",20,0,0,,,[35,2.25,10,,1,.085],,[,2,,,,,,,,9.375,.25],,,,,2],
	() => ["Burrow",15,0,0,,,,[,,2.25],,,,,,,100,9,21],
	() => ["Grody Goop",10,0,0,6,,[60,2],,[,13,,,,,,,40,4,1,,,,5],,,[3.25,,22,1,.1]],
	() => ["Butter Beacon",18,0,.1,6,,[35,2.25],,,,,[19,1.25]],
	() => ["Husk Hop",17,.1,1.3,,[1080,24,,,,,[[0,1.2,2,25,,[9,3.5]]]],,[,,,5,11.5]],
	() => ["Shuck Shot",28,1.1,1.8,,[100,2,,,,,[[55,1,[35,4.75],10,35,0,10,100]],[[8,8,1.2,-.24,.08,8],,.1,2.5,0,0,0,50]],,[,,1]],
	() => ["Casting Shadows",20,.2,.3,5,,[35,2.25],,[,,.75,,,,,,,,,,,,,,,,,.05,1.5,2,.2,1.8,1],,,[4.425]],
	() => ["Fung Fu",20,.8,0,2,,,[,,.9,,,.8,,.4],,,,,,,,,,[24,5.2]],
	() => ["Shadow Sneak",14,,,,,,[,,2],,,,,,2,5,.85,1.85],
	() => ["Swoop Slam",17,0,0,,,,[,,,7,3.5],,,,,[33,2,,,,100,4.75,50,11,2,7.5]],
	() => ["Blue Blazes",14.25,1.07,.35,,[,,,,,,[[65,1,[35,2.35],10,6,0,3.8,20]],,,,,,,[0,.1,10,75,1,.35]]],
	() => ["Blazing Trail",18,.4,.5,5,,[12,0],,,,,[1.72,,,,,5,.23]],
	() => ["Potato Mine",30,0,0,,,[,,10,,1.85,1],,,,,,,3,,,,[175,2.75]],
	() => ["Garlic Drone",25,.1,0,60,[312,,,,,1/60,[[10,1.2,1.5,450,,,10]],[[8.5,8.5,.043,-.042,.043,15.3],[8.5,8.5,.043,-.042,.043,15.3],.1,2.5,0,0,0,100],[.5,.75,,.75,1,,.1,.1,,15],[.25,.5,,.5,.75,,.1,.1,,15],,,[,.18,.4,.4,1,.05]],,,,,,,,,,,,,[5,8.75,8.75,8.75,1.6,4,,[200,7,,,,,[[20,1,10,50,,[25,3.25]]]],1.25,2,18]],
	() => ["Petal Propeller",10,.45,0,,,,[,,,,7.5],,,,,,,4,1,3],
	() => ["E.M.Peach",20,.8,.15,,[,,,,.5,,[[,,,3,35,2.25,45,90]]],,,["Stun",1.4,.33],7.5],
	() => ["Spin Dash",13,1.3,.6,,,,,knockback(5,7,0),,,,[45,.55,,.1,,,,75,5,3.5,2.75]],
	() => ["Naval Laser",18,1.2,.4,6,[400,,,,,,[[10.56,1.2,2,2000]]]],
	() => ["Sap Trap",9,0,0,,,[50,2.5,5,,.35],,knockback(5,-7,0),3.25,,,,,,,,[65,3.25]],
	() => ["Invoke Oak",20,.1,,3],
	() => ["Acorn Dash",10,.07,0,,,,,,,,,[35,.7,,.3],2],
	() => ["Sunny Side Up",16,0,.25,,,,,,,,,,3],
	() => ["Sunbeam",30,2,1,,[625,100,,,,1/150,[[10,1.2,.1,2000]],[[10,10,.1,-.05,.05,18],[10,10,.05,-.05,.05,18],.1,2.5,5,0,.003,100],[.05,,,.05,,,,,,],[.025,,,.025,,,,,,]]],
	() => ["Heal Beam",,,,,,,,,,,,,,,,,,,,[17.5,18.5,20.85]],
	() => ["Jinx",9,1/3,.2,,[,,,,.5,,[[,,5,100]],,,,,,,[0,.1,15,75,1]],,,[,9,,,,,,1.3],2],
	() => ["Arcane Enigma",60,.95,0,,,,[,7,2.25],,7,["Ally Buff",1.75,1.5]],
	() => ["Goatify",30,.85,.2,,[,,,,,,[[,,,10,1,0,12.5,12.5]]],,,["Goat Buff",7],,,[5.5,,,1.9,.9]],
	() => ["Wild Life",45,.5,.33,,,[,,30]],
	() => ["Weed Out",20,.1,3,,,,,,,,,,,9,.5,1,[110,5.5],[15,8,7.6,6,,,2.8]],
	() => ["Bloom Boom",18.5,.1,.3,,[,,,,,,[[35,1,4.96,35,,[40,3.25],10,2.25,35]]],,,knockback(5,-7,0),3.5],
	() => ["Super Stink Cloud",30,.1,0,10,,[35,2.25],,,,,[4,,,,,3,1/3]],
	() => ["Rocket Jump",12,0,0,,,,[,.5,2,9.05]],
	() => ["ZPG",24,1.25,.4,,[,,,,,,[[125,1,[50,5],10,35,0,10,100]],[[6,8,6,-.24,.08,80],,.1,1,-1.667,1.667,1,100]],,[,,.5]],
	() => ["Gravity Grenade",16,.1,.35,2.5,,[35,2.25],,[,,0,,,.05],,,[4]],
	() => ["Robo Call",90,2,0,90],
	() => ["Impkata",20,.3,.35,,[1400,100,,,,,[[2.262,1.2,8.75]],[[10,10,.075,0,0,18],,.1,2.5,6.5,-1,.008,65]],,[,,.7,,,,,.8]],
	() => ["Super Ultra Ball",17.85,1.15,0,,[,,,,,,[[100,1,[25,5],10,45,0,10,100]],[[8,8,3,-.24,.08,8],,.1,1,0,0,0,100]]],
	() => ["Turbo Twister",18.5,.25,.8,1.8,,,[,,1.4,,,,,,,16,.2,,,,,4.25,7.5]],
	() => ["Hyper Jump Thump",11,.3,.25,,,,[,,1.5,9,15],knockback(3.25,6.25,0),10,,,,,,,,[40,6]],
	() => ["Dynamite Dodge",9,.01,0,,,[4.25,0,,1.6],[,,,,5],,,,,[17,.65],,,,,[70,4]],
	() => ["Rocket Ride",18,1.125,1.2,4.5,[300,,,,,,[[20,1.2,[12,2],3,65,0,0,65]],[[10,7,1.1,-1,1,500],,.1,1,0,0,0,100],,,[0,5,2.9,10,,2,0,1],,,[0,.2,.01,10,1,.075]],,[,,.621,7.35,2.5]],
	() => ["Can't Miss-ile",9,.8,.4,,[,,,4,,,[[0,1,[10,1.75],5,3,0,42.5,95]],[[10,10,.3,-.3,.1,18],,.1,1,6.875,0,1/3,100],,,[,,,,,,,1,11.408],,,[0,0,7,40,15,.4]]],
	() => ["Funky Bouncer",18,0,0,4,,[15,2.25],,[,,0,,,.05],,,[3.85]],
	() => ["Outta Fight!",20,.8,1,4.167,,,[,,1.8]],
	() => ["Disco Tornado",25,0,0,3.5,,[12,0,,,,,,10],,,,,[2.25,,,,,3,.125],,,,,,[30,5.5]],
	() => ["Barrel Blast",15,1,.6,,,[,,100],[,,.9],,,["Fuse",3,1.283,6],,,,100,3,9,[150,4.75]],
	() => ["Parrot Pal",25,.1,0,60,[390,,,,,.005,[[8,1.2,2,400,,,10,0,225,50,80]],[[8.5,8.5,.043,-.042,.043,15.3],[8.5,8.5,.043,-.042,.043,15.3],.05,1.25,0,0,0,100],[0,.4,,1.65,2.05,,.079,.079,,10],[-.05,.2,,1.65,2.05,,.039,.039,,10],,,[,.2,.4,.2,1,.05]],,,,,,,,,,,,,[5,8.75,8.75,8.75,1.6,4,,[,,,,,,[[0,1,10,35,,[50,5]]]],.75,.4,18,.5,10,15,2.25,1.75]],
	() => ["Anchor's Away",10,.4,.5,,[,,,,,,[[50,1,1.5,25,,,15,2.5,,,,.25,.65]]],,[,,,4,12.5]],
	() => ["Imp Punt",20,.2,0,,,[14,4.5,,1.5],,,,,,,,,,,[100,4.5]],
	() => ["Sprint Tackle",14,.25,.5,,,,,knockback(7,7,0),,,,[35,.45,,,25,50,3.9]],
	() => ["Dummy Shield",28,.2,.35,14,,[,,25,,,,300,,,7]],
	() => ["Gravity Smash",15,0,0,2.9,,,[,,1,5],knockback(7,7,0),4.5,,,[25,10,,,,125,3.5]],
	() => ["Station Inflation",,.1,0,1,,,[,,0]],
	() => ["Big Bang Beam",15,1.067,.4,,[,,,,,,[[250/3,1.2,5,2000]]],,[,,.25]],
	() => ["Sticky Healy Thingy",32,0,0,5,[,,,,,,[[0,1,,10,50,0,0,50]],,,,,,,[0,.1,5.5,60,1]],,,,,,,,,,,,,,,,,,91/3,3],
	() => ["Warp",9.5,0,.3,,,,,,,,,,3,,,,,,,,,15],
	() => ["Healing Hose",,0,0,,,,,,,,,,,,,,,,,,[20.85,12.75,.5,3.5]],
	() => ["Bullhorn Swarm",20,,,15,,[35,2.25,10,,,,,,12],["Stun",.35,.33]],
	() => ["Heavy Helper",12,0,.5,,[550,,,,,,[[3.3,1.2,1.25,550]]],[,,100],["Combat Buff",,,,,,1.25,,,,,,,,,,,.5,5],,7.5],
	() => ["Double Time",18,0,.33,,,[,,50],[,2.5,1.5],,2.75],
	() => ["Zee-lixir",21,.25,.4,,,[48,2.5],[,1.25],[,3,,,,,,,,,,0],3.9],
	() => ["Spell Disaster",18,.8,.7,,[,6,,,,,[[80,1,,4,3,0,7,31]],,,,,,,[,,180,11.5,15,.15]]],
	() => ["Co-Star",15,.8,,45,,,,,,,,,,,,,,,,,,,,,40,42,25],
	() => ["Commercial Break",45,.5,.33,,,[,,30]],
	() => ["Yeti, Set, GO!",20,.1,3,,,,,,,,,,,10.5,.5,1,[110,5.5],[20,10,9.5,7.5,,,1.65]],
	() => ["Overheated Dinner",18.5,.1,.3,,[,,,,,,[[0,1,4.96,35,,[75,3.25],10,2.25,35]]],,,knockback(5,-7,0),3.5,,,,,,,,,,1],
	() => ["Super Sap Trap",19,0,0,,,[35,2.25,15,,.85],,knockback(5,-15,0),3.25,,,,,,,,[125,3.25]],
	() => ["Treeject",,.1,,,,,[,,1.5,5.5,-2.2,.5]],
	() => ["Roll for Damage",9,.25,.55,,[,5,,,,,[[60,1,4.6,15,.5,,30]]]],
	() => ["Missile Madness",20,1.25,0,3.5,[350,,,,,,[[14,1,5,40,,[14,2.8]]],[[8,4,.08,-.08,.08,3.2],,.1,1,6.5,-1,.02,100],[0,0,0,2.52,2.52,2.52,.09,.09,.09,9],,[2,7,1.2,5,,,,1]]],
	() => ["Explosive Escape",,0,0,,,,[,,1.5,5.5,-2.2,.5],knockback(7,7,0),15,,,,,,,,[250,14.75,7.5],,3],
	() => ["Bionic Bash",8.5,.8,0,,,,,,,,,,,,,,[75,5.5]],
	() => ["Space Force",22,0,0,7.5,,,[,,1.25,,,,1.3,,,,,,,2.8],,,["Passenger Buff",15,,,,,1.15,,,,,,,2.8]],
	() => ["Escape Pod",,.1,,,,,[,,1.5,5.5,-2.2,.5]],
	() => ["Crater Maker",20,.75,0,4,[750,,,,,,[[5,1,2,75,.65,[10,1.45,1,2.2]]]],,[,,1.25,,,.1]],
	() => ["Lumber Support",12,.1,0,2.5,,,[,,,,,,,.5,,,,,40],,,["Oak Buff",3,,,,,,.5,,,,,75]],
	() => ["Asteroid Shield",22,0,.4,,,[,,,,,,100]],
	() => ["Hands-On Torpedo",20,0,1.7,,[,,,,,,[[50,1,[50,2.5],10,15,0,40,25]]],[,,1]],
	() => ["Hasty Hexit",,0,.8,,,,[,,,2,-10]]
]

const abilityIDs: number[][] = []

for (let i = 0; i < 78; ) {
	abilityIDs[i / 3] = [i++, i++, i++]
}

abilityIDs.push([21,70,78],[79,76,80],[63,64,81])

class Ability {
	name: string
	cooldown?: number
	deployTime?: number
	backDelay?: number
	duration?: number
	weapon?: Weapon
	object?: [
		number?, number?, number?, number?, number?, number?, number?, number?, number?
	]
	buff?: Buff
	debuff?: Buff
	spreadRad?: number
	buff2?: Buff
	buffZone?: number[]
	dash?: number[]
	charges?: number
	stamina?: number
	decayRate?: number
	decayRateM?: number
	explosion?: [number, number, number?]
	vehicle?: [
		number, number, number, number, number?, number?, number?, Weapon?, 
		number?, number?, number?, number?, number?, number?, number?, number?
	]
	explosionDelay?: number
	beam?: number[]
	healSpray?: number[]
	zoomSpray?: number[]
	warpDist?: number
	healRate?: number
	healRad?: number
	linkUpRange?: number
	spottingRange?: number
	allyArmor?: number
	modifiers: number[]

  constructor(data: any[], id: number, modifiers: number[]) {
		[
			this.name,
			this.cooldown,
			this.deployTime,
			this.backDelay,
			this.duration,,
			this.object,
			this.buff,
			this.debuff,
			this.spreadRad,
			this.buff2,
			this.buffZone,
			this.dash,
			this.charges,
			this.stamina,
			this.decayRate,
			this.decayRateM,
			this.explosion,
			this.vehicle,
			this.explosionDelay,
			this.beam,
			this.healSpray,
			this.warpDist,
			this.healRate,
			this.healRad,
			this.linkUpRange,
			this.spottingRange,
			this.allyArmor
		] = data
		this.modifiers = modifiers
		if (data[5]) this.weapon = new stats.Weapon(data[5], 0, modifiers)
		if (id == 71) this.weapon.ignoreGrav = true
		if (data[18]?.[7]) this.vehicle[7] = new stats.Weapon(data[18][7], 0, modifiers)
  }
}

stats.setAbilities((index: number, modifiers: number[]) => abilityIDs[index].map((id: number) => new Ability(abilityData[id](), id, modifiers)))

const classes = classData.classes, upgradedClasses = classData.upgraded,
getWeapon = (ability: Ability) => ability.weapon,
weaponCards = getWeaponCards<Ability>(getWeapon),
createBuffCard = (getBuff: (ability: Ability) => Buff, colors: number[], defaultText: string) => {
	return createStatCard<Buff, Ability>(
		[getBuff],
		buff => buff[0] || defaultText,
		[
			'Duration', 'Speed multiplier', 'Launch force Y', 'Launch force Z', 'Gravity multiplier',
			'RoF multiplier', 'Armor multiplier', 'Damage', 'DoT', 'Period', 'Jump height scale',
			'Heal rate (hp/s)', 'Cooldown speed (×)', 'Spread radius', 'Inner dmg radius', 'Outer dmg radius',
			'Charge time scale', 'Ammo replenish', 'Move lag', 'Push strength', 'Push period',
			'Min aim scale', 'Max aim scale', 'Aim scale period'
		],
		[
			[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24].map(i => buff => <number>buff[i])
		],
		[],
		colors,
		[2,,,,,,,,,2,,,,1,1,1,,,,,2,,,2]
	)
}
export const abilityCards = [
	createStatCard<Ability, Ability>(
		[ability => ability],
		() => 'Ability',
		[
			'Cooldown', 'Charges', 'Deploy time', 'Switch back delay', 'Duration',
			'Buffspread radius', 'Stamina', 'Decay rate (/sec)', '… moving', 'Explosion delay',
			'Warp distance', 'Heal rate (hp/s)', 'Healing radius', 'Link-up range', 
			'Spotting range', 'Ally armor'
		],
		[[
			ability => ability.cooldown || '',
			ability => ability.charges,
			ability => ability.deployTime,
			ability => ability.backDelay,
			ability => ability.duration,
			ability => ability.spreadRad,
			ability => ability.stamina,
			ability => ability.decayRate,
			ability => ability.decayRateM,
			ability => ability.explosionDelay,
			ability => ability.warpDist,
			ability => ability.healRate,
			ability => ability.healRad,
			ability => ability.linkUpRange,
			ability => ability.spottingRange,
			ability => ability.allyArmor
		]],
		[],
		[],
		[2,,2,2,2,1,,,,2,1,,1,1,1,7]
	),
	createStatCard<boolean, Ability>(
		[ability => ability.name == 'Fung Fu'],
		() => 'Damage output',
		[
			'Damage', 'Crit damage', 'Total damage', '… no-crit', 'Radius', 'Crit radius'
		],
		[[
			() => 6,
			() => 8,
			() => 256,
			() => 96,
			() => 7,
			() => 3
		]],
		[],
		[],
		[,,,,1,1]
	),
	weaponCards[1],
	weaponCards[0],
	weaponCards[2],
	weaponCards[3],
	weaponCards[4],
	weaponCards[5],
	weaponCards[6],
	weaponCards[7],
	createBuffCard(ability => ability.buff, [,,,,,,,1,1], 'Buff'),
	createBuffCard(ability => ability.buff2, [,,,,,,,1,1], 'Buff'),
	createBuffCard(ability => ability.debuff, [], 'Debuff'),
	createStatCard<number[], Ability>(
		[ability => ability.explosion],
		() => 'Explosion',
		['Blast damage', 'Blast radius', 'Inner blast radius', 'DoT', 'Period', 'DoT radius'],
		[[
			(explosion, ability) => explosion[0] * ability.modifiers[6],
			explosion => explosion[1],
			explosion => explosion[2],
			(_, ability) => ability.name == 'Disco Tornado' ? 10 : null,
			(_, ability) => ability.name == 'Disco Tornado' ? 0.25 : null,
			(_, ability) => ability.name == 'Disco Tornado' ? 5.7 : null
		]],
		[],
		[],
		[,1,1,,2,1]
	),
	createStatCard<Ability['vehicle'], Ability>(
		[ability => ability.vehicle],
		() => 'Drone',
		[
			'Health', 'Movement speed', '… strafing', '… backwards', 
			'… ascending', '… descending', 'Jump height', 
		],
		[
			[0,1,2,3,4,5,6].map(i => vehicle => <number>vehicle[i])
		],
		[],
		[],
		[,3,3,3,3,3,1]
	),
	createStatCard<Weapon, Ability>(
		[ability => ability.vehicle?.[7]],
		() => 'Airstrike firing',
		[
			'Damage/shot', 'Rate of fire', 'DPS', 'Ammo capacity', 'Total damage', 'Splash damage', 
			'Blast radius', 'Launch speed', 'Travel time'
		],
		[[
			weapon => weapon.getDamage(dist, 0, crit, move),
			weapon => weapon.rof,
			weapon => weapon.getDPS(dist, crit, move),
			weapon => weapon.ammo,
			weapon => weapon.getDmgPerClip(dist, crit, move),
			weapon => weapon.projectiles[0].splashDmg,
			weapon => weapon.projectiles[0].blastRadius,
			weapon => weapon.projectiles[0].startSpeed,
			weapon => weapon.travelTime(dist, 0)
		]],
		[,,,,,,,,3],
		[],
		[,,,,,,1,3,2]
	),
	createStatCard<Weapon, Ability>(
		[ability => ability.vehicle?.[7]],
		() => 'Airstrike',
		[
			'Cooldown', 'Deploy time', 'Switch back delay', 'Speed multiplier'
		],
		[
			[10,8,9,11].map(i => (_, ability) => <number>ability.vehicle[i])
		],
		[],
		[],
		[2,2,2]
	),
	createStatCard<number, Ability>(
		[ability => ability.vehicle?.[14]],
		() => 'Carpet Bomb',
		[
			'Explosion count', 'Blast damage', 'Blast radius', 'Explosion delay'
		],
		[
			[12,13,14,15].map(i => (_, ability) => <number>ability.vehicle[i])
		],
		[],
		[],
		[2,,2]
	),
	createStatCard<Ability['object'], Ability>(
		[ability => ability.object],
		() => 'Object',
		[
			'Launch speed', 'Launch speed Y', 'Health', 'Fuse', 'Arming time', 
			'Trigger radius', 'Shield HP', 'Max time to live', 'Swarm size', 'Shield radius'
		],
		[
			[0,1,2,3,4,5,6,7,8,9].map(i => obj => obj[i])
		],
		[],
		[],
		[3,3,,2,2,1,,2,,1]
	),
	createStatCard<number[], Ability>(
		[ability => ability.dash],
		() => 'Dash',
		[
			'Dash speed', 'Dash duration', 'Bleedoff time', 'Collision damage', 'Blast damage',
			'Blast radius', 'Cone damage', 'Cone length', 'Near width', 'Far width'
		],
		[
			[0,1,3,4,5,6,7,8,9,10].map(i => dash => dash[i])
		],
		[],
		[],
		[3,2,2,,,1,,1,1,1]
	),
	createStatCard<number[], Ability>(
		[ability => ability.buffZone],
		() => 'Buff Zone',
		[
			'Zone radius', 'Armor multiplier', 'Speed penalty', 
			'Debuff charge (/sec)', 'Debuff decay (/sec)', 'DoT', 'Period'
		],
		[
			[0,1,2,3,4,5,6].map(i => zone => zone[i])
		],
		[,,,,,3],
		[],
		[1,,7,,,,2]
	),
	createStatCard<number[], Ability>(
		[ability => zoom && ability.zoomSpray || ability.healSpray],
		() => 'Healing Hose',
		[
			'Heal rate (hp/s)', 'Heal range', 'Near width', 'Far width'
		],
		[[
			hose => hose[0],
			hose => hose[1],
			hose => hose[2],
			hose => hose[3]
		]],
		[],
		[],
		[,1,1,1]
	),
	createStatCard<number[], Ability>(
		[ability => ability.beam],
		() => 'Healbeam',
		[
			'Heal rate (hp/s)', 'Application range', 'Max range', 
		],
		[[
			beam => beam[2],
			beam => beam[0],
			beam => beam[1]
		]],
		[],
		[],
		[,1,1]
	),
	createStatCard<boolean, Ability>(
		[ability => ability.name == 'Sunny Side Up'],
		() => 'Sundrops',
		[
			'Group size', 'Spawn period', 'Healing per sundrop'
		],
		[[
			() => 3,
			() => 0.5,
			() => 2.4
		]],
		[],
		[],
		[,2]
	),
	weaponCards[8]
]

for (let i = 0; i < 29; i++) {
	stats.characters[i].addAbility()
	const char = classes[i]
	if (!char || char.owner) continue
	if (upgradedClasses.delete(i)) classData.reset(char)
	else [char, char.vehicle, char.passenger].forEach(char => char?.addAbility())
}

