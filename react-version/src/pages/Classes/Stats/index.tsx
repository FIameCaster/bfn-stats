import { useMemo } from "react"
import { useOutletContext, useParams } from "react-router-dom"
import { Card, classData, createCards, getCharID, getColCount, getMaxColCount, getSpecialUpg, unitText } from ".."
import { Bullet, Character, Missile } from "../../.."
import { useStore } from "../../../components/Navbar/settingStore"
import { stats } from "../../../data/stats"
import { useColumnLayout } from "../../../hooks/useColumnLayout"
import { useWidth } from "../../../hooks/useWidth"
import { clamp, getSettingsParam, round } from "../../../utils"
import { updateTitle } from "../../../utils/updateTitle"
import { Cards } from "../Cards"
import { Options } from "../Options"

let dist: number, crit: boolean, move: boolean, zoom: boolean

export function Stats() {
	[{ distance: dist, crit, move }] = useStore()

	const param = getSettingsParam(dist, crit, move)

	const [
		[upgs], [temp], [newZoom], [btnIndex, setIndex], [noSpecial], charID
	] = (useOutletContext() as [
		[Set<number>, (newState: Set<number> | ((state: Set<number>) => Set<number>)) => void],
		[number[], (newState: number[] | ((state: number[]) => number[])) => void],
		[boolean, (newState: boolean | ((state: boolean) => boolean)) => void],
		[number, (newState: number | ((state: number) => number)) => void],
		[boolean, (newState: boolean | ((state: boolean) => boolean)) => void],
		number
	])
	const char = classData.getClass(charID),
	baseChar = stats.characters[charID]
	zoom = newZoom
	updateTitle(char.fullName + ' stats', charID)


	// Using this memo for its sideaffects when dependencies change,
	// since adding upgrades can be an expensive operation
	useMemo(() => classData.addUpgrades(charID, upgs, temp, getSpecialUpg(noSpecial, char.owner?.id || charID)), [charID, upgs, temp, noSpecial])

	const [heights, cards] = createCards(
		allCards, char, baseChar, btnIndex, setIndex, 
		upgs, temp, dist, crit, move, zoom, noSpecial
	)

	const colCount = useColumnLayout(266, 16, getMaxColCount(heights)),
	maxWidth = clamp(colCount == 1 ? 146.8 : 54.4, colCount * 37.5 - 1.6, 146.8) + 'rem'

	return <>
		<Options ability={null} param={param} maxWidth={maxWidth}/>
		<Cards colCount={colCount} heights={heights} >{cards}</Cards>
	</>
}

const getWeapon = (char: Character) => char[zoom ? 'alt' : 'primary'] || char.primary

const damageCard: Card<number, Character> = [
	[char => getWeapon(char).getDamage(0, 0, crit, move)],
	() => 'Damage output',
	['DPS', 'Damage/shot', 'Rate of fire', 'Shots/burst', 'Burst interval', 'Shots/shell', 'Base RoF', 'Splash damage', 'Splash radius'],
	[[
		(_, char) => getWeapon(char).getDPS(dist, crit, move),
		(_, char) => getWeapon(char).getDamage(dist, 0, crit, move),
		(_, char) => getWeapon(char).effectiveRof * 60 || null,
		(_, char) => getWeapon(char).burstSize,
		(_, char) => getWeapon(char).burstInterval,
		(_, char) => getWeapon(char).shotsPerShell == 1 ? null : getWeapon(char).shotsPerShell,
		(_, char) => getWeapon(char).rof,
		(_, char) => getWeapon(char).getSplash(0),
		(_, char) => getWeapon(char).projectiles[0]?.blastRadius || null
	]],
	[],
	[,,,,1],
	[,,,,2,,,,1]
],
bulletCard: Card<Bullet | Missile, Character> = [
	[char => getWeapon(char).projectiles[0]],
	() => 'Bullet speed',
	[
		'Launch velocity', 'Launch velocity Y', 'Drag start', 'Drag end', 'Post-drag velocity', 
		'Acceleration', 'Max velocity', 'Travel time', 'Max range', 'Gravity', 'Bullet radius',
		'Bullet height', 'Bullet width'
	],
	[[
		prop => prop.startSpeed,
		prop => prop.startSpeedY || null,
		prop => (prop as Bullet).dragStart || null,
		prop => (prop as Bullet).dragEnd || null,
		prop => (prop as Bullet).endSpeed,
		prop => (prop as Missile).engineAccel,
		prop => (prop as Missile).maxSpeed,
		(_, char) => getWeapon(char).travelTime(2, 0) ? getWeapon(char).travelTime(dist, 0) ?? 'n/a' : null,
		(_, char) => getWeapon(char).getMaxRange(0),
		prop => prop.gravity,
		prop => prop.radius,
		prop => (prop as Bullet).width,
		prop => (prop as Bullet).height
	]],
	[,,,,,,,3,1],
	[,,,,,,,1,,1],
	[3,3,1,1,3,6,3,2,1,6,1,1,1]
],
trapezoidCard: Card<number[], Character> = [
	[char => getWeapon(char).trapezoid],
	() => 'Trapezoid',
	[
		'Damage', 'Length', 'Offset Z', 'Height', 'Near Width', 'Far Width', 'Area'
	],
	[[
		(_, char) => getWeapon(char).getSpray(dist, crit),
		trap => trap[1],
		trap => trap[2],
		trap => trap[3] * 2,
		trap => trap[4],
		trap => trap[5],
		trap => (trap[4] + trap[5]) * 0.5 * trap[1],
	]],
	[],
	[],
	[,1,1,1,1,1,4]
],
chargeCard: Card<number[], Character> = [
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
],
dashCard: Card<number[], Character> = [
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
],
uppercutCard: Card<boolean, Character> = [
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
],
stunCard: Card<boolean, Character> = [
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
],
swarmCard: Card<boolean, Character> = [
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
],
ammoCard: Card<number, Character> = [
	[char => getWeapon(char)?.ammoCapacity],
	() => 'Ammo & Reload',
	[
		'Ammo capacity', 'Ammo/shot', 'Reload time', 'Damage/clip', 'Sustainable RoF', 'Sustainable DPS'
	],
	[[
		(_, char) => getWeapon(char).ammo,
		(_, char) => getWeapon(char).ammoPerShot,
		(_, char) => getWeapon(char).reload,
		(_, char) => getWeapon(char).getDmgPerClip(dist, crit, move),
		(_, char) => getWeapon(char).sustainableRof * 60 || null,
		(_, char) => getWeapon(char).getDPS(dist, crit, move, true)
	]],
	[],
	[,1,1],
	[,,2]
],
overheatCard: Card<number[], Character> = [
	[char => getWeapon(char)?.overheat],
	() => 'Overheating',
	[
		'Overheat time', 'Heat/bullet', 'Heat-gain/sec', 'Heat-drop/sec', 'Heat-drop delay', 'Penalty time', 
		'Overheat threshold', 'Cooldown time', 'Damage/overheat', 'Sustainable RoF', 'Sustainable DPS'
	],
	[[
		(_, char) => getWeapon(char).overheatTime,
		prop => prop[0],
		prop => prop[1],
		prop => prop[2],
		prop => prop[3],
		prop => prop[4],
		prop => prop[5],
		(_, char) => getWeapon(char).cooldown,
		(_, char) => getWeapon(char).getDmgPerOverheat(dist, crit, move),
		(_, char) => getWeapon(char).sustainableRof * 60 || null,
		(_, char) => getWeapon(char).getDPS(dist, crit, move, true)
	]],
	[,3],
	[,1,1,,1,1,1,1],
	[2,,,,2,2,,2]
],
mobilityCard: Card<number[], Character> = [
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
],
gunSwayCard: Card<number[], Character> = [
	[char => getWeapon(char)?.[zoom ? 'gunSwayZoom' : 'gunSway'] || getWeapon(char)?.gunSway],
	() => 'Gunsway',
	[
		'Min angle', '… moving', '… jumping', 'Max angle', '… moving', '… jumping', 
		'Bloom/shot', '… moving', '… jumping', 'Decrease/sec', 'Aim time'
	],
	[[
		...[0,1,2,3,4,5,6,7,8,9].map(i => (gunSway: number[]) => gunSway[i]),
		(_, char) => getWeapon(char).aimTime
	]],
	[3,3,3,3,3,3,3,3,3,2,3],
	[1,1,1,1,1,1,1,1,1,,1],
	[5,5,5,5,5,5,5,5,5,5,2]
],
recoilAmpCard: Card<number[], Character> = [
	[char => getWeapon(char)?.getRecoil(zoom)],
	() => 'Recoil amplitude',
	[
		'Max amplitude Y', 'Max amplitude X', 'Increase/shot Y', 'Average inc/shot X',
		'Max deviation/shot X', 'Decrease factor', '… shooting', 'First shot inc scale'
	],
	[[0,1,2,3,4,5,6,7].map(i => recoil => recoil[i])],
	[3,3,3,3,3,3,3,3],
	[1,1,1,1,1,,,1],
	[5,5,5,5,5]
],
dispersionCard: Card<number[], Character> = [
	[char => getWeapon(char)?.getDispersion(zoom)],
	() => 'Dispersion',
	[
		'Min angle', 'Max angle', 'Increase/shot', '… including decrease',
		'Decrease/sec', 'Jump dispersion', 'Move dispersion', 'Avg shell dispersion'
	],
	[[0,1,2,3,4,5,6,7].map(i => disp => disp[i])],
	[3,3,3,3,3,3,3,3],
	[1,1,1,1,,1,1,1],
	[5,5,5,5,5,5,5,5]
],
generalCard: Card<Character, Character> = [
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
],
homingCard: Card<number[], Character> = [
	[char => getWeapon(char)?.homing],
	() => 'Homing',
	[
		'Lock-on range', 'Lock-on angle', 'Lock-on time', 'Release time', 
		'Turnangle multiplier', 'Time to activate', 'Distance to activate'
	],
	[[
		homing => homing[3] * (zoom && homing[6] || 1),
		homing => homing[2],
		homing => homing[0],
		homing => homing[1],
		homing => homing[4],
		homing => homing[5],
		(homing, char) => homing[5] && getWeapon(char).projectiles[0].travelDistance(homing[5]) + getWeapon(char).offsetZ
	]],
	[],
	[,,1,,,1,1],
	[1,5,2,2,,2,1]
],
shieldCard: Card<number[], Character> = [
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
],
recoilAngleCard: Card<number[], Character> = [
	[char => getWeapon(char)?.recoilAngle],
	() => 'Recoil angle',
	['Max recoil angle Y', 'Max recoil angle X', 'Recovery time'],
	[[0,1,2].map(i => recoil => recoil[i] * (zoom && i < 2 ? recoil[3] / 100 : 1))],
	[3,3,3],
	[1,1,1],
	[5,5,2]
],
fireCard: Card<number[], Character> = [
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
],
arcCard: Card<number[], Character> = [
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
],
cloudCard: Card<[number, number, number, number, [number, number]], Character> = [
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
]

const allCards = [
	damageCard, bulletCard, trapezoidCard,
	chargeCard, dashCard, uppercutCard,
	stunCard, swarmCard, ammoCard, 
	overheatCard, mobilityCard, gunSwayCard, 
	recoilAmpCard, dispersionCard, generalCard, 
	homingCard, shieldCard, recoilAngleCard, 
	fireCard, arcCard, cloudCard
]
