import { stats } from "./stats.js"

type Upgrade = [
	number, number, number, number, UpgradeValue?, UpgradeValue[]?
]

type UpgradeValue = {
	[key: string]: number | any[] | {
		[key: string]: number | any[]
	}
}

const getUpgPoints = (selected: Set<number>, upgs: Upgrade[]) => {
	let cost = 0
	for (const index of selected) cost += upgs[index][1]
	return cost
}

const addUpgrade = (char: Character, upgrade: UpgradeValue) => {
	for (const key in upgrade) {
		let value = upgrade[key], object: Object = char

		const keys = key.split('_'), l = keys.length - 1
		for (let i = 0; i < l && object; i++) object = object[keys.shift()]
		if (!object) return
		const finalKey = keys[0]
		// Returns true if value is a number or null
		// This won't cause issues since value won't be a length 1 array or Infinity
		if (value < Infinity) object[finalKey] = value
		else if (Array.isArray(value)) {
			if (finalKey == 'primary' || finalKey == 'alt') object[finalKey] = new stats.Weapon(value, finalKey == 'alt' ? 2 : 0, char)
			else object[finalKey] = value
		}
		else Object.assign(object[finalKey], value)
	}
}

const commonUpgrades: Upgrade[] = [
	[0, 1, 3, 0], // Refreshing Revive
	[1, 1, 7, 0], // Rough Patch
	[2, 2, 11, 0], // Leveling Up
	[3, 3, 3, 0], // Critical Blow
	[4, 3, 9, 0, { "movement_0": 7 } ] // Speedy
],
offensiveUpgrades: Upgrade[] = [
	[5, 2, 3, 1], // Combo
	[6, 2, 7, 1], // Fearless
	[7, 2, 7, 1], // Fearless
	[8, 2, 7, 1], // Low Life
	[9, 2, 6, 1, { "sprintExit": .05 }], // Ready Up
	[10, 3, 7, 1] // Vampiric
],
defensiveUpgrades: Upgrade[] = [
	[11, 2, 7, 1, { // Health Regeneration
		"regenRate": 40,
		"vehicle_regenRate": 40,
		"passenger_regenRate": 40
	}],
	[12, 2, 7, 1, { // Health Regeneration Delay
		"regenDelay": 4,
		"vehicle_regenDelay": 4,
		"passenger_regenDelay": 4
	}], 
	[13, 3, 9, 1], // Adrenaline Rush
	[14, 3, 7, 1, , [ // Best Defense
		{ armor: 0, "passenger_armor": 0, "vehicle_armor": 0 },
		{ armor: 10, "passenger_armor": 10, "vehicle_armor": 10 },
		{ armor: 19, "passenger_armor": 19, "vehicle_armor": 19 },
		{ armor: 27.1, "passenger_armor": 27.1, "vehicle_armor": 27.1 }
	]],
	[15, 3, 9, 1] // Fallback
],
supportUpgrades: Upgrade[] = [
	[16, 1, 11, 1], // Super Savior
	[17, 2, 7, 1], // Revive Reward
	[18, 2, 9, 1], // Rollout
	[19, 3, 7, 1], // Hard Target
	[20, 3, 4, 1] // Combat Aura
],
knockback = (y: number, z: number, m?: number) => ["Knockback",,m,y,z]

const upgrades: Upgrade[][] = [
	// Peashooter
	[
		[21, 1, 6, 3, {
			"abilities_0_object": {
				0: 13.875, 1: 3.375
			}
		}],
		commonUpgrades[0],
		commonUpgrades[1],
		offensiveUpgrades[0],
		offensiveUpgrades[1],
		[22, 2, 4, 2, {
			"primary_projectiles_0": {
				"impactDmg": 23.294,
				"splashDmg": 16.306
			} 
		}],
		commonUpgrades[2],
		offensiveUpgrades[3],
		offensiveUpgrades[4],
		[23, 2, 0, 4],
		[24, 3, 3, 3],
		commonUpgrades[3],
		[25, 3, 9, 2],
		[26, 3, 4, 4],
		[27, 3, 3, 5],
		commonUpgrades[4],
		offensiveUpgrades[5],
		[28, 4, 5, 5],
		[29, 4, 6, 2, {
			"primary_homing": [0.75, 1/3, 0.45, 43, 1]
		}],
		[30, 5, 4, 2]
	],
	// Chomper
	[
		[31, 1, 4, 2, {
			"modifiers_2": 1.29593
		}],
		commonUpgrades[0],
		commonUpgrades[1],
		[32, 1, 7, 3],
		offensiveUpgrades[0],
		offensiveUpgrades[1],
		[33, 2, 9, 4],
		commonUpgrades[2],
		offensiveUpgrades[3],
		offensiveUpgrades[4],
		[34, 2, 11, 3],
		[35, 2, 5, 5, {
			"abilities_2_duration": 12
		}],
		[36, 3, 7, 2, {
			"regenDelay": 2.4
		}],
		commonUpgrades[3],
		[37, 3, 4, 5, ,[{
			"primary_rof": 120,
			"alt_rof": 78.261,
			"modifiers_3": 1.2
		}]],
		[38, 3, 4, 2, {
			"alt_projectiles_0": {
				"splashDmg": 9,
				"blastRadius": 2.25
			}
		}],
		commonUpgrades[4],
		offensiveUpgrades[5],
		[39, 3, 5, 4, {
			"abilities_1": {
				"decayRate": 4.5,
				"decayRateM": 16.5
			}
		}],
		[40, 4, 5, 4]
	],
	// Kernel Corn
	[
		[41, 1, 6, 4],
		commonUpgrades[0],
		commonUpgrades[1],
		[42, 2, 1, 3, {
			"abilities_0_object_2_0": 30
		}],
		[43, 2, 9, 2, {
			"zoomSpeed": 1
		}],
		offensiveUpgrades[0],
		offensiveUpgrades[1],
		[44, 2, 9, 5, {
			"abilities_2_buff_2": 1.5
		}],
		commonUpgrades[2],
		offensiveUpgrades[3],
		[45, 2, 4, 2, ,[{
			"modifiers_1": 1.25
		}]],
		offensiveUpgrades[4],
		[46, 3, 3, 5],
		commonUpgrades[3],
		[47, 3, 4, 4, {
			"abilities_1_weapon_projectiles_0_impactDmg": 12
		}],
		[48, 3, 3, 3],
		commonUpgrades[4],
		offensiveUpgrades[5],
		[49, 4, 0, 2, {
			"primary_reload": 0.275
		}],
		[50, 4, 4, 2, ,[
			{ "primary_rof": 650 },
			{ "primary_rof": 695.5 },
			{ "primary_rof": 744.19 },
			{ "primary_rof": 796.28 }
		]],
		[51, 5, 12, 2, stats.upgrades[0]]
	],
	// Night Cap
	[
		commonUpgrades[0],
		commonUpgrades[1],
		offensiveUpgrades[0],
		offensiveUpgrades[1],
		[52, 2, 10, 3],
		commonUpgrades[2],
		offensiveUpgrades[3],
		[53, 2, 0, 2, ,[20,30,40,50,60].map(ammo => ({ "primary_ammoCapacity": ammo }))],
		offensiveUpgrades[4],
		[54, 3, 7, 2],
		[55, 3, 11, 3],
		commonUpgrades[3],
		[56, 3, 9, 4, {
			"abilities_1_buff_2": 9/7
		}],
		[57, 3, 9, 2, {
			"movement_9": 2.125
		}],
		[58, 3, 5, 5],
		commonUpgrades[4],
		[59, 3, 6, 2, {
			"primary_projectiles_0_startSpeed": 600
		}],
		[60, 3, 8, 4, {
			"abilities_1_debuff": knockback(7,15)
		}],
		offensiveUpgrades[5],
		[61, 4, 9, 5, {
			"abilities_2_warpDist": 7
		}]
	],
	// Snap Dragon
	[
		commonUpgrades[0],
		commonUpgrades[1],
		offensiveUpgrades[0],
		[62, 2, 0, 2],
		[63, 2, 5, 5, {
			"abilities_2_duration": 10
		}],
		[64, 2, 5, 2, {
			"alt_dot_2": 4
		}],
		offensiveUpgrades[1],
		[65, 2, 6, 4, {
			"abilities_1_weapon_homing": [
				0, 0.1, 12.5, 112.5, 1, 0.35
			]
		}],
		commonUpgrades[2],
		offensiveUpgrades[3],
		[66, 2, 8, 3, {
			"abilities_0_debuff": knockback(7,15,0.25)
		}],
		[67, 2, 1, 2, {
			"alt_projectiles_0_blastRadius": 2.75
		}],
		offensiveUpgrades[4],
		[68, 3, 0, 5, {
			"abilities_2_object_0": 24
		}],
		[69, 3, 4, 2],
		commonUpgrades[3],
		commonUpgrades[4],
		offensiveUpgrades[5],
		[70, 3, 3, 4],
		[71, 4, 4, 3]
	],
	// Cactus
	[
		commonUpgrades[0],
		commonUpgrades[1],
		[72, 2, 4, 5],
		defensiveUpgrades[0],
		defensiveUpgrades[1],
		commonUpgrades[2],
		[73, 2, 6, 2],
		[74, 2, 4, 2],
		[75, 2, 2, 4],
		[76, 2, 2, 3],
		defensiveUpgrades[2],
		defensiveUpgrades[3],
		[77, 3, 11, 5],
		commonUpgrades[3],
		defensiveUpgrades[4],
		[78, 3, 0, 2],
		commonUpgrades[4],
		[79, 4, 4, 2, ,[
			{ "modifiers_0": 1 },
			{ "modifiers_0": 0.8425 },
			{ "modifiers_0": 0.685 },
			{ "modifiers_0": 0.5275 },
			{ "modifiers_0": 0.37 },
			{ "modifiers_0": 0.2125 },
			{ "modifiers_0": 0.1 },
		]],
		[80, 4, 11, 3],
		[81, 4, 5, 4]
	],
	// Citron
	[
		[82, 1, 9, 4],
		commonUpgrades[0],
		commonUpgrades[1],
		[83, 2, 9, 2],
		defensiveUpgrades[0],
		defensiveUpgrades[1],
		commonUpgrades[2],
		[84, 2, 7, 3],
		[85, 2, 0, 2],
		defensiveUpgrades[2],
		defensiveUpgrades[3],
		commonUpgrades[3],
		defensiveUpgrades[4],
		[86, 3, 6, 5, {
			"abilities_2_weapon_projectiles_0": {
				"impactDmg": 12.67, "critMultiplier": 1, "radius": 0.15
			}
		}],
		[87, 3, 7, 2],
		[88, 3, 5, 3],
		[89, 3, 9, 2, {
			"shield": [600, 54, 2.5, 1.08, 1.08]
		}],
		commonUpgrades[4],
		[90, 4, 8, 4],
		[91, 4, 5, 5]
	],
	// Acorn
	[
		commonUpgrades[0],
		commonUpgrades[1],
		defensiveUpgrades[0],
		defensiveUpgrades[1],
		commonUpgrades[2],
		[92, 2, 0, 2, {
			"primary_ammoCapacity": 56,
			"vehicle_primary_ammoCapacity": 14
		}],
		[93, 2, 1, 8, {
			"vehicle_abilities_2_weapon_ammoCapacity": 9, 
			"vehicle_abilities_2_weapon_projectiles_0": { startSpeed: 25, endSpeed: 25 }
		}],
		[94, 2, 11, 3, {
			"abilities_0_object_3": [5,,60],
			"vehicle_abilities_0_object_3": [5,,60],
			"passenger_abilities_0_object_3": [5,,60],
		}],
		[95, 2, 8, 8, {
			"vehicle_abilities_2_debuff": knockback(7,25,0.25)
		}],
		[96, 2, 8, 3, {
			"abilities_0_debuff": knockback(7,-15,0),
			"vehicle_abilities_0_debuff": knockback(7,-25,0),
			"passenger_abilities_0_debuff": knockback(7,-15,0)
		}],
		defensiveUpgrades[2],
		defensiveUpgrades[3],
		commonUpgrades[3],
		defensiveUpgrades[4],
		[97, 3, 7, 2, {
			"health": 100,
			"vehicle_health": 375,
			"passenger_health": 100
		}],
		[98, 3, 7, 11],
		[99, 3, 0, 5],
		[100, 3, 3, 3],
		commonUpgrades[4],
		[101, 4, 0, 2]
	],
	// Sunflower
	[
		commonUpgrades[0],
		commonUpgrades[1],
		supportUpgrades[0],
		commonUpgrades[2],
		[102, 2, 9, 3],
		[103, 2, 0, 4],
		supportUpgrades[1],
		supportUpgrades[2],
		[104, 2, 8, 3, {
			"abilities_0": {
				"debuff": knockback(6,15,0.25),
				"spreadRad": 7.5
			}
		}],
		[105, 2, 7, 2],
		[106, 3, 11, 5],
		commonUpgrades[3],
		[107, 3, 6, 5, {
			"abilities_2_beam": [26.25, 30, 20.85]
		}],
		supportUpgrades[3],
		supportUpgrades[4],
		[108, 3, 7, 2],
		commonUpgrades[4],
		[109, 3, 7, 2],
		[110, 4, 7, 4],
		[111, 5, 11, 5]
	],
	// Rose
	[
		commonUpgrades[0],
		commonUpgrades[1],
		supportUpgrades[0],
		[112, 2, 5, 4, ,[
			{ "abilities_1_buff_1": 7 },
			{ "abilities_1_buff_1": 8.62 },
			{ "abilities_1_buff_1": 11.2 },
			{ "abilities_1_buff_1": 16 },
			{ "abilities_1_buff_1": 28 }
		]],
		commonUpgrades[2],
		[113, 2, 4, 3],
		supportUpgrades[1],
		supportUpgrades[2],
		[114, 2, 9, 2],
		commonUpgrades[3],
		[115, 3, 5, 5, {
			"abilities_2_debuff_1": 12
		}],
		supportUpgrades[3],
		supportUpgrades[4],
		[116, 3, 6, 2, {
			"primary_homing_6": 2
		}],
		[117, 3, 7, 3],
		[118, 3, 11, 5, {
			"abilities_2_debuff": {
				19: 0.9, 20: 0.8, 21: 5
			}
		}],
		commonUpgrades[4],
		[119, 3, 11, 2],
		[120, 4, 7, 4],
		[121, 4, 6, 2, {
			"primary_projectiles_0_startSpeed": 160
		}],
		[122, 5, 12, 2, {
			zoomFov: null,
			alt: [,,,1,.5,,[[20,1,,5,3,0,42.5,95]],[,[8.5,8.5,.145,-.4,0,15.3],.1,1,-2.75,2.75,.5,100],,,,,,[0,.1,10,50,1]]
		}]
	],
	// Wildflower
	[
		commonUpgrades[0],
		commonUpgrades[1],
		[123, 1, 2, 3],
		[124, 2, 7, 2],
		[125, 2, 9, 4, {
			"abilities_1_vehicle": {
				1: 12, 2: 12, 3: 12
			}
		}],
		[126, 2, 2, 4],
		commonUpgrades[2],
		[127, 2, 7, 3, {
			"abilities_1_object_2": 125
		}],
		[128, 2, 4, 2],
		commonUpgrades[3],
		[129, 3, 3, 5],
		[130, 3, 8, 2],
		commonUpgrades[4],
		[131, 4, 7, 2, {
			"health": 125,
			"abilities_1_vehicle_0": 25
		}],
		[132, 4, 4, 5, {
			"abilities_2_charges": 2
		}]
	],
	// Foot Soldier
	[
		commonUpgrades[0],
		commonUpgrades[1],
		[133, 2, 0, 2, {
			"primary_ammoCapacity": 58
		}],
		offensiveUpgrades[0],
		offensiveUpgrades[2],
		commonUpgrades[2],
		[134, 2, 4, 4, {
			"abilities_1_explosion": [50, 3]
		}],
		offensiveUpgrades[3],
		[135, 2, 6, 5, {
			"abilities_2_weapon_projectiles_0_startSpeed": 100
		}],
		[136, 2, 6, 2, {
			"zoomFov": 25
		}],
		offensiveUpgrades[4],
		[137, 2, 9, 4, {
			"abilities_1_buff_4": 14
		}],
		[138, 2, 8, 5, {
			"abilities_2_debuff": knockback(7,-12,0.25)
		}],
		[139, 2, 10, 3],
		[140, 3, 0, 2],
		commonUpgrades[3],
		commonUpgrades[4],
		[141, 3, 11, 3],
		offensiveUpgrades[5],
		[142, 4, 4, 2, {
			"primary": {
				"rofInc": 6, "maxRof": 680
			}
		}]
	],
	// Imp
	[
		[143, 1, 9, 2, {
			"movement_8": 2
		}],
		[144, 1, 9, 7],
		commonUpgrades[0],
		commonUpgrades[1],
		[145, 2, 8, 8, {
			"vehicle_abilities_2_debuff": knockback(12,0)
		}],
		offensiveUpgrades[0],
		offensiveUpgrades[2],
		commonUpgrades[2],
		offensiveUpgrades[3],
		[146, 2, 3, 6],
		offensiveUpgrades[4],
		[147, 2, 4, 5, {
			"abilities_2_weapon_rof": 1750
		}],
		[148, 2, 1, 3, {
			"abilities_0_object_3_0": 5.75
		}],
		[149, 3, 6, 2, {
			"primary_recoil": {
				0: [5.25, 0.75, 0.116, -0.3, 0.3, 12],
				1: [3.563, 0.75, 0.135, -0.15, 0.15, 12]
			}
		}],
		commonUpgrades[3],
		[150, 3, 5, 8],
		commonUpgrades[4],
		offensiveUpgrades[5],
		[151, 4, 9, 5, {
			"abilities_2_buff_1": 1.4
		}],
		[152, 4, 3, 4]
	],
	// Super Brainz
	[
		[153, 1, 6, 3],
		commonUpgrades[0],
		commonUpgrades[1],
		offensiveUpgrades[0],
		offensiveUpgrades[2],
		commonUpgrades[2],
		offensiveUpgrades[3],
		[154, 2, 4, 2, ,[{
			"modifiers_4": 2/3
		}]],
		offensiveUpgrades[4],
		[155, 2, 9, 2],
		[156, 2, 8, 3, {
			"abilities_0": {
				"spreadRad": 3,
				"debuff": knockback(5,12)
			}
		}],
		commonUpgrades[3],
		[157, 3, 3, 4],
		[158, 3, 7, 3],
		[159, 3, 4, 5],
		commonUpgrades[4],
		[160, 3, 4, 2, {
			"primary_burstSize": 4,
			"primary_trapezoid_0": 39.25
		}],
		offensiveUpgrades[5],
		[161, 4, 7, 4],
		[162, 4, 4, 2, ,[
			{ "primary_rof": 144, "modifiers_0": 1, "primary_burstInterval": .7 },
			{ "primary_rof": 157, "modifiers_0": 0.69, "primary_burstInterval": .642 },
			{ "primary_rof": 170, "modifiers_0": 0.476, "primary_burstInterval": .593 },
			{ "primary_rof": 182.6, "modifiers_0": 0.3285, "primary_burstInterval": .552 },
		]],
		[163, 5, 12, 2, {
			shield: null,
			dashes: [
				[0,1.2,30,1/3,50,5,5,3.4,1.5,7],
				[.75,1.1,30,2/3,90,5,5,3.4,2,12],
				[1.5,1,30,1,125,5,5,3.4,2.5,18]
			],
			primary: {
				trapezoid: null,
				projectiles: [],
				charges: null,
				gunSway: null,
				rof: null,
				recoil: [[8,8,.136,-.376,0,14.4],,.1,1]
			}
		}]
	],
	// 80s Action Hero
	[
		commonUpgrades[0],
		commonUpgrades[1],
		[164, 1, 11, 2],
		offensiveUpgrades[0],
		offensiveUpgrades[2],
		[165, 2, 9, 3, {
			"abilities_0_dash_0": 28
		}],
		commonUpgrades[2],
		offensiveUpgrades[3],
		offensiveUpgrades[4],
		commonUpgrades[3],
		[166, 3, 11, 2],
		[167, 3, 0, 4],
		[168, 3, 11, 5],
		[169, 3, 11, 4],
		commonUpgrades[4],
		[170, 3, 11, 3],
		offensiveUpgrades[5],
		[171, 4, 4, 2, ,[{
			"modifiers_0": 0.25
		}]],
		[172, 4, 4, 5, {
			"abilities_2_weapon": {
				"shotsPerShell": 8,
				"dispersion": [,,,,,,,1,12.93]
			}
		}],
		[173, 4, 11, 2]
	],
	// Electric Slide
	[
		commonUpgrades[0],
		commonUpgrades[1],
		[174, 2, 1, 3, {
			"abilities_0_object_3_0": 6
		}],
		offensiveUpgrades[0],
		offensiveUpgrades[2],
		commonUpgrades[2],
		offensiveUpgrades[3],
		[175, 2, 4, 2],
		offensiveUpgrades[4],
		[176, 2, 11, 5],
		[177, 3, 11, 2, {
			"primary_arcs_2": 3
		}],
		[178, 3, 3, 3],
		[179, 3, 3, 5],
		commonUpgrades[3],
		[180, 3, 11, 2],
		[181, 3, 1, 2, {
			"primary_arcs_1": 12
		}],
		[182, 3, 4, 4],
		commonUpgrades[4],
		offensiveUpgrades[5],
		[183, 4, 0, 4]
	],
	// Captain Deadbeard
	[
		[184, 1, 9, 3, {
			"abilities_0_buff2_3": 11.5
		}],
		commonUpgrades[0],
		commonUpgrades[1],
		[185, 2, 6, 2],
		defensiveUpgrades[0],
		defensiveUpgrades[1],
		[186, 2, 4, 5],
		commonUpgrades[2],
		[187, 2, 8, 2],
		[188, 2, 9, 5],
		defensiveUpgrades[2],
		defensiveUpgrades[3],
		commonUpgrades[3],
		defensiveUpgrades[4],
		[189, 3, 0, 2],
		[190, 3, 9, 3, {
			"abilities_0_buff_2": 1.575,
			"abilities_0_buff2_2": 2.244,
		}],
		[191, 3, 6, 2, {
			"primary_dispersion_8": 0.713
		}],
		[192, 3, 3, 4],
		commonUpgrades[4],
		[193, 3, 0, 4, {
			"abilities_1_weapon_overheat": {
				1: 0.16, 2: 0.44
			},
		}]
	],
	// All-Star
	[
		commonUpgrades[0],
		commonUpgrades[1],
		defensiveUpgrades[0],
		defensiveUpgrades[1],
		[194, 2, 10, 5],
		commonUpgrades[2],
		[195, 2, 6, 3, {
			"abilities_0_object": {
				0: 17.15, 1: 5.1513
			}
		}],
		[196, 2, 9, 4, {
			"abilities_1_dash": {
				0: 40, 1: 0.65
			}
		}],
		[197, 2, 6, 2, {
			"primary_primeTime": 0.297
		}],
		defensiveUpgrades[2],
		[198, 3, 11, 2],
		defensiveUpgrades[3],
		commonUpgrades[3],
		defensiveUpgrades[4],
		[199, 3, 8, 4, {
			"abilities_1_debuff": knockback(12,20,0)
		}],
		commonUpgrades[4],
		[200, 3, 8, 5, {
			"abilities_2": {
				"spreadRad": 10,
				"debuff": knockback(7,15,0.25)
			}
		}],
		[201, 3, 0, 2],
		[202, 3, 9, 2, {
			"primary_primeSpeed": [1,1,1]
		}],
		[203, 4, 4, 3]
	],
	// Space Cadet
	[
		commonUpgrades[0],
		commonUpgrades[1],
		[204, 2, 9, 8, {
			"vehicle_abilities_2_buff_2": 1.8
		}],
		[205, 2, 0, 9],
		[206, 2, 4, 5],
		[207, 2, 4, 2, , [{
			primary_rof: 480
		}]],
		defensiveUpgrades[0],
		defensiveUpgrades[1],
		commonUpgrades[2],
		[208, 2, 5, 11, {
			"passenger_abilities_2_weapon_projectiles_0_timeToLive": 30
		}],
		[209, 2, 9, 3, {
			"abilities_0_buff_2": 1.5
		}],
		[210, 2, 11, 11, {
			"passenger_abilities_2_object_2": 25
		}],
		defensiveUpgrades[2],
		[211, 3, 0, 8],
		defensiveUpgrades[3],
		commonUpgrades[3],
		[212, 3, 0, 2, ,[
			{ "primary_reload": 2.5, "passenger_primary_reload": 2.5, "vehicle_primary_reload": 1.5 },
			{ "primary_reload": 2, "passenger_primary_reload": 2, "vehicle_primary_reload": 1.2 },
			{ "primary_reload": 1.5, "passenger_primary_reload": 1.5, "vehicle_primary_reload": 0.9 },
			{ "primary_reload": 1, "passenger_primary_reload": 1, "vehicle_primary_reload": 0.6 }
		]],
		defensiveUpgrades[4],
		[213, 3, 6, 2, {
			"primary_homing_6": 2,
			"passenger_primary_homing_6": 2
		}],
		commonUpgrades[4]
	],
	// Scientist
	[
		commonUpgrades[0],
		commonUpgrades[1],
		supportUpgrades[0],
		[214, 2, 7, 5],
		[215, 2, 7, 2],
		commonUpgrades[2],
		[216, 2, 0, 4],
		[217, 2, 10, 3],
		[218, 2, 6, 5, {
			"abilities_2_zoomSpray": [29.6, 20.75, 0.625, 4.375]
		}],
		supportUpgrades[1],
		supportUpgrades[2],
		[219, 2, 9, 4, {
			"abilities_1_warpDist": 27
		}],
		commonUpgrades[3],
		[220, 3, 1, 3],
		supportUpgrades[3],
		supportUpgrades[4],
		[221, 3, 6, 2, {
			"primary_dispersion_7": 0.1652
		}],
		[222, 3, 7, 2],
		commonUpgrades[4],
		[223, 4, 4, 2, ,[
			{ "primary_rof": 90 },
			{ "primary_rof": 103.5 },
			{ "primary_rof": 117 },
			{ "primary_rof": 144 }
		]],
		[224, 5, 12, 2, stats.upgrades[1]]
	],
	// Engineer
	[
		commonUpgrades[0],
		commonUpgrades[1],
		supportUpgrades[0],
		[225, 2, 9, 2],
		commonUpgrades[2],
		[226, 2, 3, 5],
		[227, 2, 11, 3, {
			"abilities_0_object_2": 25
		}],
		supportUpgrades[1],
		supportUpgrades[2],
		[228, 2, 6, 2],
		[229, 2, 8, 2],
		[230, 2, 9, 5, {
			"abilities_2": {
				"buff": [,3.5,1.5],
				"debuff": knockback(5,10)
			}
		}],
		[231, 3, 6, 2, {
			"primary_projectiles_0": { startSpeed: 78, endSpeed: 78 }
		}],
		commonUpgrades[3],
		[232, 3, 1, 3],
		supportUpgrades[3],
		supportUpgrades[4],
		[233, 3, 2, 4],
		[234, 3, 1, 4, {
			"abilities_1_spreadRad": 9
		}],
		commonUpgrades[4]
	],
	// Wizard
	[
		commonUpgrades[0],
		commonUpgrades[1],
		supportUpgrades[0],
		[235, 1, 10, 2],
		[236, 2, 4, 4],
		commonUpgrades[2],
		supportUpgrades[1],
		supportUpgrades[2],
		[237, 2, 4, 4, {
			"abilities_1_explosion": [50, 8],
			"passenger_abilities_1_explosion": [50, 8]
		}],
		[238, 2, 0, 2, {
			"primary_ammoCapacity": 20,
			"passenger_primary_ammoCapacity": 55
		}],
		[239, 3, 6, 2],
		commonUpgrades[3],
		[240, 3, 7, 11],
		[241, 3, 7, 3],
		supportUpgrades[3],
		supportUpgrades[4],
		[242, 3, 6, 2, {
			"primary_cloud": [1,5,1/12,1.4,[60,30]]
		}],
		commonUpgrades[4],
		[243, 3, 5, 5],
		[244, 4, 6, 3]
	],
	// TV Head
	[
		[245, 1, 2, 3],
		commonUpgrades[0],
		commonUpgrades[1],
		[246, 2, 4, 2],
		[247, 2, 7, 3, {
			"abilities_0_object_2": 125
		}],
		[248, 2, 2, 4],
		commonUpgrades[2],
		[249, 2, 7, 2],
		[250, 2, 9, 4, {
			"abilities_1_vehicle": {
				1: 15, 2: 15, 3: 15
			}
		}],
		[251, 3, 8, 2],
		commonUpgrades[3],
		[252, 3, 3, 5],
		commonUpgrades[4],
		[253, 4, 0, 5, {
			"abilities_2_weapon": {
				rof: 320,
				ammoCapacity: 2,
				dispersion: [0,8,3.05,12,1,0.65,0.65,1],
				recoil: [[5,5,.3,-.15,.15,12],,.1,1],
				ammoPerShot: 1
			}
		}],
		[254, 4, 7, 2, {
			"health": 125,
			"abilities_1_vehicle_0": 30
		}]
	]
]

export { upgrades, Upgrade, UpgradeValue, knockback, getUpgPoints, addUpgrade }