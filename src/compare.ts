import { qs, round, clamp, router, navbar, element, text } from './router.js'
import { stats } from "./stats.js"
import { OpenMenu, CompareMenuContainer, MenuState } from "./compareMenu.js"
import { upgrades, addUpgrade, parseTempParam, parseUpgParam, getTempParam, getUpgParam } from "./upgrades.js"

const container = <CompareMenuContainer & PageContainer>qs('#compare')
let openMenu: OpenMenu, menuIndex: number,
clickedBtn: HTMLButtonElement, 
visibilityStyles: CSSStyleDeclaration[]
const columnState: MenuState[] = [],
settings = navbar.settings,
columns: (ReturnType<typeof createColumn>)[] = [],
url = router.url

let baseStats: number[][]

const updateCallbacks: typeof settings.updateCallbacks = [
	newVal => {
		dist = newVal
		updateColumns()
	},
	newVal => {
		crit = newVal
		updateColumns()
	},
	newVal => {
		move = newVal
		updateColumns()
	}
]

const setState = () => {
	onresize = null

	let [distance, newCrit, newMove, char, zoom] = url.getParams('d','c','m','g','z')

	settings.state = [
		dist = clamp(0, +distance, 100) || 0, 
		crit = !!newCrit, 
		move = !!newMove
	]
	settings.updateCallbacks = updateCallbacks
	content.zoom = !!zoom

	const charArr = char?.split('_')
	trimColumns(columnState.length = charArr?.length || 0)

	charArr?.forEach((str, i) => {
		const arr = str.split('-'),
		state: MenuState = columnState[i] = [
			parseInt(arr[0], 36), parseUpgParam(arr[1]), parseTempParam(arr[2])
		]
		columns[i] ? columns[i].update(state) : columns[i] = createColumn(state)
		columns[i].updateLink()
	})
}

const openCompareMenu = async (state?: MenuState) => {
	openMenu || ({ openMenu } = await import('./compareMenu.js'))
	openMenu(container, state)
}

container.addEventListener('menusave', ({ detail: state }) => {
	columnState[menuIndex] = state
	if (menuIndex == columns.length) {
		columns[menuIndex] = createColumn(state)
	}
	else columns[menuIndex].update(state)
	columns[menuIndex].updateLink()
	clickedBtn.scrollIntoView({ "block": "nearest" })
	clickedBtn.focus()
	url.setParam('g', columns.join('_'), '', true)
})

const content = (() => {
	const zoomToggle = element('input', { type: 'checkbox', id: 'zoom', oninput() {
		zoom = zoomToggle.checked
		updateColumns(true)
		url.setParam('z', zoom ? '1' : '', '', false)
	}})
	
	const labels: HTMLDivElement[] = []

	const visibilityBtns: HTMLElement[] = [
		element('button', { className: 'add_co btn', textContent: 'Add', onclick() {
			menuIndex = columnState.length
			clickedBtn = this
			openCompareMenu()
		}})
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
	const toggleText = ['1st', '2nd', '3rd']
	const observer = window.IntersectionObserver ? new IntersectionObserver(entries => {
		if (!container.parentElement) return
		addCol.parentElement.classList.toggle('show-names', !entries[0].isIntersecting)
	}, {
		rootMargin: `0px 0px 0px 99999px`,
		threshold: 1
	}) : null
	
	for (let i = 0; i < 14; i++) {
		const category = categories[i]
		const l = category.length - 1, els: HTMLDivElement[] = new Array(l)

		for (let i = 0; i < l;) {
			els[i] = element('div', { textContent: category[++i] })
		}

		labels.push(
			element('div', { className: 'category_co', textContent: category[0] }),
			element('div', { className: 'group_co group_co' + i }, els)
		)

		visibilityBtns.push(
			element('button', { className: 'toggle_co', title: 'Toggle category visibility', onclick() {
				visibilityStyles[i].display = this.classList.toggle('hidden_co') ? 'none' : 'grid'
			}}),
			element('div', { className: 'group_co group_co' + i }, 0, 0, { height: l * 2.8 + 'rem' })
		)
	}

	labels[6].prepend(
		element('button', { className: 'btn toggle-category', textContent: '1st', onclick() {
			const newState = categoryState[3] == 2 ? 0 : categoryState[3] + 1
			this.textContent = toggleText[categoryState[3] = newState]
			for (let i = 0; i < columns.length;) columns[i++].updateCategory(3, true)
		}})
	)
	const addCol = element('div', 0, visibilityBtns)
	const contentEl = element('div', { className: 'container_co' }, [
		element('div', { className: 'btns_co' }, [
			element('div', { className: 'input-group' }, [
				element('label', { htmlFor: 'zoom', textContent: 'Zooming' }),
				zoomToggle
			])
		]),
		element('div', { className: 'labels_co' }, labels), 
		element('div', { className: 'content_co', onclick(e) {
			const target = <HTMLElement>e.target
			if (target.tagName == 'A') router.goTo((<HTMLAnchorElement>target).href)
		}}, [addCol])
	])
	container.append(contentEl)
	observer && observer.observe(qs('#observer'))

	return {
		addColumn(element: HTMLDivElement) {
			addCol.before(element)
		},
		set zoom(val: boolean) { zoom = zoomToggle.checked = val }
	}
})()

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
	if (state[3]) return state[3]
	const [id, selected, temp] = state,
	baseChar = stats.characters[id]
	if (!selected.size) return state[3] = baseChar
	const upgs = upgrades[baseChar.owner?.id ?? id]
	for (const upgID of selected) {
		const upg = upgs[upgID][4] || upgs[upgID][5]?.[temp[upgID]]
		if (upg) for (const key in upg) {
			if (key.includes('abilities')) break
			return state[3] = addUpgrades(baseChar, selected, temp)
		}
	}
	return state[3] = baseChar
}

const getParamStr = (str: string) => str && '?' + str.slice(1)

let zoom: boolean, dist = 0, crit: boolean = false, move: boolean = false

const getWeapon = (char: Character) => char[zoom ? 'alt' : 'primary'] || char.primary

const cacheFuncs: ((char: Character) => unknown)[] = [
	char => getWeapon(char),
	char => getWeapon(char).projectiles[0],
	char => getWeapon(char).trapezoid,
	char => getWeapon(char).charges,
	char => getWeapon(char),
	char => getWeapon(char).overheat,
	char => char.moveData,
	char => char,
	char => char.shield,
	char => getWeapon(char).homing,
	char => getWeapon(char)[zoom ? 'gunSwayZoom' : 'gunSway'],
	char => getWeapon(char).getDispersion(zoom),
	char => getWeapon(char).getRecoil(zoom),
	char => getWeapon(char).recoilAngle
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

const categoryState = [
	,,,0
]
const unitText = ['', 'm', 's', 'm/s', 'm²', '°', 'm/s²', '%']

const statFuncs: ((category: unknown, char: Character, buttonState?: number) => number)[][] = [
	[
		(weapon: Weapon) => weapon.getDPS(dist, crit, move),
		(weapon: Weapon) => weapon.getDamage(dist, 0, crit, move),
		(weapon: Weapon) => weapon.effectiveRof * 60 || null,
		(weapon: Weapon) => weapon.burstSize,
		(weapon: Weapon) => weapon.burstInterval,
		(weapon: Weapon) => weapon.shotsPerShell == 1 ? null : weapon.shotsPerShell,
		(weapon: Weapon) => weapon.rof,
		(weapon: Weapon) => weapon.getSplash(0),
		(weapon: Weapon) => weapon.projectiles[0]?.blastRadius || null
	],
	[
		(bullet: Bullet | Missile) => bullet.startSpeed,
		(bullet: Bullet | Missile) => bullet.startSpeedY || null,
		(bullet: Bullet) => bullet.dragStart || null,
		(bullet: Bullet) => bullet.dragEnd || null,
		(bullet: Bullet) => bullet.endSpeed,
		(bullet: Missile) => bullet.engineAccel,
		(bullet: Missile) => bullet.maxSpeed,
		(_, char) => getWeapon(char).travelTime(dist, 0),
		(_, char) => getWeapon(char).getMaxRange(0),
		(bullet: Bullet | Missile) => bullet.gravity,
		(bullet: Bullet | Missile) => bullet.radius,
		(bullet: Bullet) => bullet.width,
		(bullet: Bullet) => bullet.height
	],
	[
		(trap: number[]) => trap[0],
		(trap: number[]) => trap[1],
		(trap: number[]) => trap[2],
		(trap: number[]) => trap[3] * 2,
		(trap: number[]) => trap[4],
		(trap: number[]) => trap[5],
		(trap: number[]) => (trap[4] + trap[5]) * 0.5 * trap[1],
	],
	[
		(charge: number[][], char, i) => (charge[i]?.[0] * char.modifiers[0] * char.modifiers[1]) || null,
		(charge: number[][], char, i) => charge[i]?.[1],
		(charge: number[][], char, i) => getWeapon(char).getChargeDPS(dist, i, crit, move),
		(charge: number[][], char, i) => getWeapon(char).getDamage(dist, i + 1, crit, move),
		(charge: number[][], char, i) => charge[i]?.[2],
		(charge: number[][], char, i) => getWeapon(char).getSplash(i + 1),
		(charge: number[][], char, i) => getWeapon(char).projectiles[i + 1]?.startSpeed,
		(charge: number[][], char, i) => (<Bullet>getWeapon(char).projectiles[i + 1])?.dragStart || null,
		(charge: number[][], char, i) => (<Bullet>getWeapon(char).projectiles[i + 1])?.dragEnd || null,
		(charge: number[][], char, i) => (<Bullet>getWeapon(char).projectiles[i + 1])?.endSpeed,
		(charge: number[][], char, i) => (<Missile>getWeapon(char).projectiles[i + 1])?.engineAccel,
		(charge: number[][], char, i) => (<Missile>getWeapon(char).projectiles[i + 1])?.maxSpeed,
		(charge: number[][], char, i) => getWeapon(char).travelTime(dist, i + 1),
		(charge: number[][], char, i) => getWeapon(char).getMaxRange(i + 1) || null,
		(charge: number[][], char, i) => (getWeapon(char).projectiles[i + 1])?.radius,
		(charge: number[][], char, i) => charge[i]?.[zoom ? 3 : 5],
		(charge: number[][], char, i) => charge[i]?.[zoom ? 4 : 6],
		(charge: number[][], char, i) => charge[i]?.[7] * 100 || 0 
	],
	[
		(weapon: Weapon) => weapon.ammo,
		(weapon: Weapon) => weapon.ammoPerShot,
		(weapon: Weapon) => weapon.reload,
		(weapon: Weapon) => weapon.getDmgPerClip(dist, crit, move),
		(weapon: Weapon) => weapon.sustainableRof * 60 || null,
		(weapon: Weapon) => weapon.getDPS(dist, crit, move, true)
	],
	[
		(_, char) => getWeapon(char).overheatTime,
		(overheat: number[]) => overheat[0],
		(overheat: number[]) => overheat[1],
		(overheat: number[]) => overheat[2],
		(overheat: number[]) => overheat[3],
		(overheat: number[]) => overheat[4],
		(overheat: number[]) => overheat[5],
		(_, char) => getWeapon(char).cooldown,
		(_, char) => getWeapon(char).getDmgPerOverheat(dist, crit, move),
		(_, char) => getWeapon(char).sustainableRof * 60 || null,
		(_, char) => getWeapon(char).getDPS(dist, crit, move, true)
	],
	[
		...[0,1,2,3,4,5,6,7,8,9,10].map(i => (mobility: number[]) => mobility[i]),
		...[0,1,2].map(i => (mobility: number[], char: Character) => char.primary.primeSpeed && mobility[i] * char.primary.primeSpeed[i]),
	],
	[
		(char: Character) => char.health,
		(char: Character) => char.armor || 0,
		(char: Character) => char.regenRate,
		(char: Character) => char.regenDelay,
		(char: Character) => char.sprintExit,
		(char: Character) => char.zoomFov,
		(char: Character) => char.primary.primeTime
	],
	[
		(shield: number[]) => shield[0],
		(shield: number[]) => shield[1],
		(shield: number[]) => shield[2],
		(_, char) => char.moveData[4],
		(shield: number[], char) => char.moveData[2] * shield[4] * char.zoomSpeed
	],
	[
		(homing: number[]) => homing[3] * (zoom && homing[6] || 1),
		(homing: number[]) => homing[2],
		(homing: number[]) => homing[0],
		(homing: number[]) => homing[1],
		(homing: number[]) => homing[4],
		(homing: number[]) => homing[5],
		(homing: number[], char) => homing[5] && getWeapon(char).projectiles[0].travelDistance(homing[5]) + getWeapon(char).offsetZ
	],
	[
		...[0,1,2,3,4,5,6,7,8,9].map(i => (gunSway: number[]) => gunSway[i]),
		(_, char) => getWeapon(char).aimTime
	],
	[0,1,2,3,4,5,6,7].map(i => (disp: number[]) => disp[i]),
	[0,1,2,3,4,5,6,7].map(i => (recoil: number[]) => recoil[i]),
	[0,1,2].map(i => (recoil: number[]) => recoil[i] * (zoom && i < 2 ? recoil[3] / 100 : 1))
]

// const categorySizes = statFuncs.map(a => a.length)
// Can be computed with the line above instead
const categorySizes = [
	9,13,7,18,6,11,14,7,5,7,11,8,8,3
]

const createColumn = (state: MenuState) => {
	let char: Character, upgParam: string, tempParam: string,
	isFirstCol = state == columnState[0], initialized: boolean
	const update = (newState: MenuState) => {
		const newChar = getUpgradedClass(state = newState)
		if (char?.id != newChar.id) {
			nameText.data = icon.title = newChar.fullName
			icon.style.backgroundPositionX = `${-8.2 * newChar.iconId}rem`
		}
		
		const newTemp = tempParam != (tempParam = getTempParam(state[2])),
		newUpg = upgParam != (upgParam = getUpgParam(state[1]))
		
		if (char != (char = newChar) || newUpg || newTemp) {
			updateAllCategories(true)
			if (isFirstCol) for (let i = 1; i < columns.length; i++) columns[i].updateAllColors()
		}
	},
	remove = () => {
		deleteColumn(columnState.indexOf(state))
		url.setParam('g', columns.join('_'), '', true)
	},
	updateLink = () => {
		name.href = icon.href = `/classes/${char.folderName}/${getParamStr(settings.searchStr + (zoom ? '&z=1' : '') + (upgParam && '&u=' + upgParam) + (tempParam && '&t=' + tempParam))}`
	},
	updateStat = (oldStat: number, stat: number, text: Text, decimals: number, unit: number) => {
		if (stat != oldStat || !initialized)
			text.data = stat == null ? '' : round(stat, decimals) + unitText[unit || 0]
	},
	updateColor = (baseStat: number, stat: number, cell: HTMLDivElement, color = 0) => {
		if (isFirstCol || baseStat == null || stat == null) return cell.removeAttribute('style')
		if (color == 3) {
			baseStat = Math.abs(baseStat)
			stat = Math.abs(stat)
			color = 1 // Else the XOR always returns a truthy value
		}
		if (baseStat == stat) return cell.removeAttribute('style')
	
		// Poor readability due to being overly optimized
		return cell.style.backgroundColor = `${
			(color == 2 ? stat < baseStat : color ^ +(stat > baseStat)) ? 'rgba(30, 100' : 'rgba(120, 40'
		}, 0, ${color == 2 && stat * baseStat <= 0 ? 1 : Math.min(1, (Math.max(baseStat / stat, stat / baseStat) - 1) * .9 + .1)})`
	},
	updateAllCategories = (updateCache?: boolean) => {
		for (let i = 0; i < 14; i++) updateCategory(i, updateCache)
	},
	updateCategory = (index: number, updateCache?: boolean) => {
		const l = categorySizes[index], funcs = statFuncs[index],
		stats = columnStats[index], base = baseStats[index],
		colors = colorData[index], decimals = decimalData[index],
		units = unitData[index], nodes = textNodes[index],
		els = statEls[index], btnState = categoryState[index],
		category = updateCache ? categoryData[index] = cacheFuncs[index](char) : categoryData[index]

		for (let i = 0; i < l; i++) {
			updateStat(stats[i], stats[i] = category && funcs[i](category, char, btnState), nodes[i], decimals[i], units[i])
			updateColor(base[i], stats[i], els[i], colors[i])
		}
	},
	updateAllColors = () => {
		for (let i = 0; i < 14; i++) {
			const l = categorySizes[i], 
			stats = columnStats[i], base = baseStats[i],
			colors = colorData[i], els = statEls[i]
	
			for (let j = 0; j < l; j++) updateColor(base[j], stats[j], els[j], colors[j])
		}
	}

	const nameText = text('')
	const name = element('a', { className: 'name_co', tabIndex: -1 }, [
		element('span', 0, [nameText])
	]),
	icon = element('a', { className: 'icon_co' }),
	statEls: HTMLDivElement[][] = [], textNodes: Text[][] = [],
	columnStats: number[][] = new Array(14), categoryData: any[] = []
	if (isFirstCol) baseStats = columnStats

	const children: HTMLElement[] = [
		name, element('div', { className: 'header_co' }, [
			icon, 
			element('button', { className: 'remove_co', onclick: remove}, 0, { 'aria-label': 'Remove column' }),
			element('button', { className: 'btn change_co', textContent: 'Change', onclick() {
				menuIndex = columnState.indexOf(state)
				clickedBtn = this
				openCompareMenu(state)
			}})
		])
	]

	for (let i = 0; i < 14; i++) {
		const l = categorySizes[i]
		const els: HTMLDivElement[] = statEls[i] = new Array(l)
		const nodes: Text[] = textNodes[i] = new Array(l)
		columnStats[i] = new Array(l)

		for (let i = 0; i < l;)
			els[i] = element('div', 0, [nodes[i++] = text('')])

		children.push(
			element('div', { className: 'group-spacer' }),
			element('div', { className: 'group_co group_co' + i }, els)
		)
	}

	const el = element('div', { className: 'column_co' }, children)

	update(state)
	initialized = true
	content.addColumn(el)

	return {
		el, update, updateLink, updateAllColors, 
		updateAllCategories, updateCategory,
		toString() {
			// String representing the state of the column
			// columns.join('_') now gives the url param for all the columns
			return `${state[0].toString(36)}${' ' + upgParam}${' ' + tempParam}`.trimEnd().replace(/ /g, '-')
		},
		setFirstColumn() {
			isFirstCol = true
			baseStats = columnStats
			for (let i = 0; i < columns.length; i++) columns[i].updateAllColors()
		}
	}
}

const updateColumns = (fullUpdate?: boolean) => {
	settings.updateLinks()
	for (let i = 0; i < columns.length;) {
		columns[i].updateAllCategories(fullUpdate)
		columns[i++].updateLink()
	}
}

const deleteColumn = (index: number) => {
	columnState.splice(index, 1)
	columns.splice(index, 1)[0].el.remove()
	if (!index) columns[0]?.setFirstColumn()
},
trimColumns = (newLength: number) => {
	for (let i = columns.length; i > newLength; i--) columns.pop().el.remove()
}

const prefetchMenu = () => setTimeout(() => {
	router.prefetch(['compareMenu'])
	const sheet = document.head.appendChild(element('style')).sheet

	for (let i = 14; i;) sheet.insertRule(`.group_co${--i} { display:grid; }`)

	visibilityStyles = [].map.call(sheet.cssRules, (rule: CSSStyleRule) => rule.style)
})

container.addEventListener('navigated', setState)
setState()

if (document.readyState != 'loading') prefetchMenu()
else addEventListener('load', prefetchMenu)
container.removeAttribute('style')