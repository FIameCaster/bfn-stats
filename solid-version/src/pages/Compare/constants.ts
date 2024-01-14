import { Accessor, createSignal, Setter } from "solid-js"
import { stats, Character } from "../../data/stats"
import { addUpgrade, upgrades } from "../../data/upgrades"
import { getTempParam, getUpgParam, parseTempParam, parseUpgParam } from "../../utils/params"

export type MenuState = [
  number, Set<number>, number[], Character?, Accessor<number[]>[]?, Setter<number[]>[]?
]

const categories = [
	[
		'Damage output', 'DPS', 'Damage/shot', 'Rate of fire', 'Shots/burst',
		'Burst interval', 'Shots/shell', 'Base RoF', 'Splash damage', 'Splash radius'
	],
	[
		'Bullet speed', 'Launch velocity', 'Launch velocity Y', 'Drag start','Drag end',
		'Post-drag velocity', 'Acceleration', 'Max velocity', 'Travel time', 'Max range',
		'Gravity', 'Bullet radius','Bullet height', 'Bullet width'
	],
	[
		'Trapezoid', 'Damage', 'Length', 'Offset Z', 'Height', 'Near Width', 'Far Width', 'Area'
	],
	[
		'Charge', 'Charge time', 'Recovery time', 'Charge DPS', 'Damage/shot', 'Ammo/shot',
		'Splash damage','Launch velocity', 'Drag start', 'Drag end', 'Post-drag velocity',
		'Acceleration', 'Max velocity', 'Travel time', 'Max range', 'Bullet radius',
		'Recoil amp scale Y', 'Recoil amp scale X', 'Speed penalty'
	],
	[
		'Ammo & Reload', 'Ammo capacity', 'Ammo/shot', 'Reload time',
		'Damage/clip', 'Sustainable RoF', 'Sustainable DPS'
	],
	[
		'Overheating', 'Overheat time', 'Heat/bullet', 'Heat-gain/sec', 'Heat-drop/sec',
		'Heat-drop delay', 'Penalty time', 'Overheat threshold', 'Cooldown time',
		'Damage/overheat', 'Sustainable RoF', 'Sustainable DPS'
	],
	[
		'Mobility', 'Movement speed', '… strafing', '… backwards', '… sprinting', '… aiming',
		'Hover gravity', 'Max hover time', 'Jump height', 'In-air jump height',
		'Jump hover time', 'Hover strafe speed', 'Priming speed', '… strafing', '… backwards'
	],
	[
		'General', 'Max health', 'Armor', 'Regen rate (hp/s)', 'Regen delay',
		'Sprint exit delay', 'Zoom FOV', 'Priming duration'
	],
	[
		'Shield', 'Health', 'Regen rate (hp/s)', 'Regen delay', 'Movement speed', 'Backwards speed'
	],
	[
		'Homing', 'Lock-on range', 'Lock-on angle', 'Lock-on time', 'Release time',
		'Turnangle multiplier', 'Time to activate', 'Distance to activate'
	],
	[
		'Gunsway', 'Min angle', '… moving', '… jumping', 'Max angle', '… moving',
		'… jumping', 'Bloom/shot', '… moving', '… jumping', 'Decrease/sec', 'Aim time'
	],
	[
		'Dispersion', 'Min angle', 'Max angle', 'Increase/shot', '… including decrease',
		'Decrease/sec', 'Jump dispersion', 'Move dispersion', 'Avg shell dispersion'
	],
	[
		'Recoil amplitude', 'Max amplitude Y', 'Max amplitude X', 'Increase/shot Y',
		'Average inc/shot X','Max deviation/shot X', 'Decrease factor', '… shooting',
		'First shot inc scale'
	],
	[
		'Recoil angle', 'Max recoil angle Y', 'Max recoil angle X', 'Recovery time'
	]
]

const decimalData = [
	[],
	[,,,,,,,3,1],
	[],
	[,,,,,,,,,,,,3,1,,,,1],
	[],
	[,3],
	[,,,,,1],
	[],
	[],
	[],
	[3,3,3,3,3,3,3,3,3,2,3],
	[3,3,3,3,3,3,3,3],
	[3,3,3,3,3,3,3,3],
	[3,3,3]
]

const colorData = [
	[,,,,1],
	[,,,,,,,1,,1],
	[],
	[1,1,,,1,,,,,,,,1],
	[,1,1],
	[,1,1,,1,1,1,1],
	[,,,,,1],
	[,,,1,1,1,1],
	[],
	[,,1,,,1,1],
	[2,1,1,1,1,1,1,1,1,,1],
	[1,1,1,1,,1,2,1],
	[1,1,1,3,1,,,1],
	[3,3,1]
]

const unitData = [
	[,,,,2,,,,1],
	[3,3,1,1,3,6,3,2,1,6,1,1,1],
	[,1,1,1,1,1,4],
	[2,2,,,,,3,1,1,3,6,3,2,1,1,,,7],
	[,,2],
	[2,,,,2,2,,2],
	[3,3,3,3,3,7,2,1,1,2,3,3,3,3],
	[,7,,2,2,5,2],
	[,,2,3,3],
	[1,5,2,2,,2,1],
	[5,5,5,5,5,5,5,5,5,5,2],
	[5,5,5,5,5,5,5,5],
	[5,5,5,5,5],
	[5,5,2]
]

const categorySizes = [
	9,13,7,18,6,11,14,7,5,7,11,8,8,3
]

const unitText = ['', 'm', 's', 'm/s', 'm²', '°', 'm/s²', '%']

const toggleText = ['1st', '2nd', '3rd']

const addUpgrades = (baseChar: Character, selected: Set<number>, temp: number[]) => {
	const char = stats.getStats(baseChar.owner?.id ?? baseChar.id)
	if (baseChar.owner) {
		char[baseChar.owner.vehicle == baseChar ? 'vehicle' : 'passenger'] = stats.getStats(baseChar.id)
	}
	const upgs = upgrades[char.id]
	for (const upgID of selected) {
		const upg = upgs[upgID]
		if (upg[4]) addUpgrade(char, upg[4])
		if (upg[5]?.[temp[upgID]]) addUpgrade(char, upg[5][temp[upgID]])
	}
	return baseChar.owner ? char.vehicle || char.passenger : char
}

const getUpgradedClass = (state: MenuState) => {
	const [id, selected, temp] = state,
	baseChar = stats.characters[id]
	if (!selected.size) return state[3] = baseChar
	const upgs = upgrades[baseChar.owner?.id ?? id]
	for (const upgID of selected) {
		const upg = upgs[upgID][4] || upgs[upgID][5]?.[temp[upgID]]
		if (upg) for (const key in upg) {
			if (key.startsWith('abilities')) break
			return state[3] = addUpgrades(baseChar, selected, temp)
		}
	}
	return state[3] = baseChar
}

const getAccessors = (state: MenuState) => {
	if (!state[4]) addSignals(state)
	return state[4]
}

const getSetters = (state: MenuState) => {
	if (!state[5]) addSignals(state)
	return state[5]
}

const addSignals = (state: MenuState) => {
	const accessors: Accessor<number[]>[] = new Array(14)
	const setters: Setter<number[]>[] = new Array(14)

	for (let i = 0; i < 14; i++)
		[accessors[i], setters[i]] = createSignal<number[]>()

	state[4] = accessors
	state[5] = setters
}

const getStateStr = (state: MenuState) => {
	const upgParam = getUpgParam(state[1]), tempParam = getTempParam(state[2])
	return `${state[0].toString(36)}${upgParam && ' ' + upgParam}${tempParam && ' ' + tempParam}`.trimEnd().replace(/ /g, '-')
}

const parseCharParam = (str: string): MenuState => {
	const arr = str.split('-')
	return [
		parseInt(arr[0], 36), parseUpgParam(arr[1]), parseTempParam(arr[2])
	]
}

export { categories, colorData, unitData, decimalData, unitText, categorySizes, toggleText, getUpgradedClass, parseCharParam, getStateStr, getAccessors, getSetters }