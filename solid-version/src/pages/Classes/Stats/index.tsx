import { createEffect, createMemo, useContext } from "solid-js"
import { createWeaponCards, zoom, dist, crit, move, createStatCard, Context, syncNavbarState, Cards, syncZoom, zoomSignal } from ".."
import { getNavbarSettings } from "../../../components/Navbar"
import { Bullet, Character, Missile } from "../../../data/stats"
import { updateTitle } from "../../../utils/updateTitle"

export function Stats() {

	const { char, baseChar } = useContext(Context)
	const currentCards = createMemo(() => {
		syncNavbarState(getNavbarSettings())
		syncZoom(zoomSignal[0]())
		const char1 = char(), baseChar1 = baseChar(),
		cards: ReturnType<typeof statCards[0]>[] = []
		for (let i = 0, j = 0, l = statCards.length; i < l; i++) {
			const card = statCards[i](char1, baseChar1)
			if (card) cards[j++] = card
		}
		return cards
	})
	
	createEffect(() => {
		updateTitle(char().fullName + ' stats', char().name)
	})

	return <Cards cards={currentCards()} />
}

const getWeapon = (char: Character) => char[zoom ? 'alt' : 'primary'] || char.primary
const weaponCards = createWeaponCards<Character>(getWeapon)

const statCards = [
	weaponCards[0],
	weaponCards[1],
	weaponCards[2],
	createStatCard<number[], Character>(
		[0,1,2].map(i => (char: Character) => getWeapon(char).charges?.[i]),
		() => 'Charge',
		[
			'Charge time', 'Recovery time', 'Charge DPS', 'Damage/shot', 'Ammo/shot', 'Splash damage',
			'Launch velocity', 'Drag start', 'Drag end', 'Post-drag velocity', 'Acceleration', 
			'Max velocity', 'Travel time', 'Max range', 'Bullet radius', 'Recoil amp scale Y',
			'Recoil amp scale X', 'Speed penalty'
		],
		[0,1,2].map(i => [
			(charge, char) => charge[0] * char.modifiers[0] * char.modifiers[1],
			(charge, char) => charge[1],
			(charge, char) => getWeapon(char).getChargeDPS(dist, i, crit, move),
			(charge, char) => getWeapon(char).getDamage(dist, i + 1, crit, move),
			(charge, char) => charge[2],
			(charge, char) => getWeapon(char).getSplash(i + 1),
			(charge, char) => getWeapon(char).projectiles[i + 1]?.startSpeed,
			(charge, char) => (getWeapon(char).projectiles[i + 1] as Bullet)?.dragStart || null,
			(charge, char) => (getWeapon(char).projectiles[i + 1] as Bullet)?.dragEnd || null,
			(charge, char) => (getWeapon(char).projectiles[i + 1] as Bullet)?.endSpeed,
			(charge, char) => (getWeapon(char).projectiles[i + 1] as Missile)?.engineAccel,
			(charge, char) => (getWeapon(char).projectiles[i + 1] as Missile)?.maxSpeed,
			(charge, char) => getWeapon(char).travelTime(2, i + 1) ? getWeapon(char).travelTime(dist, i + 1) ?? 'n/a' : null,
			(charge, char) => getWeapon(char).getMaxRange(i + 1),
			(charge, char) => (getWeapon(char).projectiles[i + 1])?.radius,
			(charge, char) => charge[zoom ? 3 : 5],
			(charge, char) => charge[zoom ? 4 : 6],
			(charge, char) => charge[7] * 100 || 0 
		]),
		[,,,,,,,,,,,,3,1,,,,1],
		[1,1,,,1,,,,,,,,1],
		[2,2,,,,,3,1,1,3,6,3,2,1,1,,,7]
	),
	createStatCard<number[], Character>(
		[
			char => char.dashes?.[0],
			char => char.dashes?.[1],
			char => char.dashes?.[2]
		],
		() => 'Dash',
		[
			'Charge time', 'Cooldown', 'Dash speed', 'Dash duration', 'Cone damage',
			'Cone length', 'Near width', 'Far width', 'Knockback force Y', 'Knockback force Z'
		],
		[0,1,2].map(i => [
			(dash, char) => dash[0] * char.modifiers[1],
			dash => dash[1],
			dash => dash[2],
			dash => dash[3],
			dash => dash[4],
			dash => dash[5],
			dash => dash[6],
			dash => dash[7],
			dash => dash[8],
			dash => dash[9]
		]),
		[],
		[1],
		[2,2,3,2,,1,1,1]
	),
	createStatCard<boolean, Character>(
		[char => !!char.dashes],
		() => 'Uppercut',
		[
			'Launch force Y', 'Launch force Z', 'Cooldown', 'Trapezoid Damage', 
			'Length', 'Offset Z', 'Height', 'Near Width', 'Far Width', 'Area'
		],
		[[
			() => 5.8,
			() => 3.36,
			() => 3.25,
			() => 40,
			() => 5,
			() => 0.5,
			() => 10,
			() => 5,
			() => 3.4,
			() => 21
		]],
		[],
		[],
		[,,2,,1,1,1,1,1,4]
	),
	createStatCard<boolean, Character>(
		[char => char.id == 15],
		() => "Stun",
		[
			"Charge/shot", "Decay/sec", "Shots to stun", "Time to stun", "Duration", "Cooldown"
		],
		[[
			() => 31.58,
			() => 33.33,
			() => 5,
			() => 24 / 19,
			() => 2 / 3,
			() => 5 / 3
		]],
		[],
		[],
		[7,7,,2,2,2]
	),
	createStatCard<boolean, Character>(
		[char => char.role == 'Swarm'],
		() => 'Meele',
		[
			'Damage', 'Switch back delay', 'Length', 'Offset Z', 'Height', 'Near Width', 'Far Width', 'Area'
		],
		[[
			() => 50,
			() => 1.2,
			() => 4.5,
			() => 0.5,
			() => 4.5,
			() => 5,
			() => 3.4,
			() => 18.9
		]],
		[],
		[],
		[,2,1,1,1,1,1,4]
	),
	weaponCards[3],
	weaponCards[4],
	createStatCard<number[], Character>(
		[char => char.moveData],
		() => 'Mobility',
		[
			'Movement speed', '… strafing', '… backwards', '… sprinting', '… aiming',
			'Hover gravity', 'Max hover time', 'Jump height', 'In-air jump height', 
			'Jump hover time', 'Hover strafe speed', 'Priming speed', '… strafing', '… backwards'
		],
		[[
			...[0,1,2,3,4,5,6,7,8,9,10].map(i => (mobility: number[]) => mobility[i]),
			...[0,1,2].map(i => (mobility: number[], char: Character) => char.primary.primeSpeed && mobility[i] * char.primary.primeSpeed[i]),
		]],
		[,,,,,1],
		[],
		[3,3,3,3,3,7,2,1,1,2,3,3,3,3]
	),
	weaponCards[5],
	weaponCards[6],
	weaponCards[7],
	createStatCard<Character, Character>(
		[char => char],
		() => 'General',
		[
			'Max health', 'Armor', 'Regen rate (hp/s)', 'Regen delay', 
			'Sprint exit delay', 'Zoom FOV', 'Priming duration', 'Health leach (hp/s)'
		],
		[[
			char => char.health,
			char => char.armor || 0,
			char => char.regenRate,
			char => char.regenDelay,
			char => char.sprintExit,
			char => char.zoomFov,
			char => char.primary.primeTime,
			char => char.id == 13 ? 5 : null
		]],
		[],
		[,,,1,1,1,1],
		[,7,,2,2,5,2]
	),
	weaponCards[8],
	createStatCard<number[], Character>(
		[char => char.shield],
		() => 'Shield',
		[
			'Health', 'Regen rate (hp/s)', 'Regen delay', 'Movement speed', 'Backwards speed'
		],
		[[
			shield => shield[0],
			shield => shield[1],
			shield => shield[2],
			(_, char) => char.moveData[4],
			(shield, char) => char.moveData[2] * shield[4] * char.zoomSpeed
		]],
		[],
		[],
		[,,2,3,3]
	),
	weaponCards[9],
	createStatCard<number[], Character>(
		[char => getWeapon(char).dot],
		() => 'Fire DoT',
		['Damage', 'Tick period', 'Duration', 'Min health'],
		[[
			dot => dot[0],
			dot => dot[1],
			dot => dot[2],
			() => 15
		]],
		[],
		[,1,,1],
		[,2,2]
	),
	createStatCard<number[], Character>(
		[char => getWeapon(char).arcs],
		() => 'Electric arcs',
		['Arc DPS', 'Arc damage', 'Max arc length', 'Arc count'],
		[[
			(arc, char) => arc[0] * getWeapon(char).effectiveRof,
			arc => arc[0],
			arc => arc[1],
			arc => arc[2]
		]],
		[],
		[],
		[,,1]
	),
	createStatCard<[number, number, number, number, [number, number]], Character>(
		[char => getWeapon(char).cloud],
		() => 'Cloud',
		['Cloud damage', 'Tick period', 'Radius', 'Total damage'],
		[[
			cloud => cloud[1],
			cloud => cloud[2],
			cloud => cloud[3],
			cloud => cloud[4][+move]
		]],
		[,3],
		[,1],
		[,2,1]
	)
]