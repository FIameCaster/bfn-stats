import { qs, qsa, navbar, element, router, round, clamp, text, width } from './router.js'
import { stats } from './stats.js'
import { UpgradeMenuType, UpgradeMenuElement, TempMenuElement, TempUpgMenuType } from './upgradeMenu.js'
import { upgrades, Upgrade, UpgradeValue, getUpgPoints, addUpgrade } from './upgrades.js'

const container = <PageContainer>qs('#classes'),
characters = stats.characters,
settings = navbar.settings,
url = router.url

// Current character
let char: Character

const pageHeaders = (() => {
	let upgradeMenu: UpgradeMenuType, tempUpgMenu: TempUpgMenuType,
	currentUpgs: Set<number>, tempState: number[] = [],
	charUpgrades: Upgrade[], ability: number
	
	const options = <HTMLDivElement>qs('.options_c', container),
	upgEl = <UpgradeMenuElement>qs('#upg'),
	tempEl = <TempMenuElement>qs('#temp'),
	abilities = qs('.abilities'), 
	abilityIcons: HTMLAnchorElement[] = [].slice.call(abilities.children),
	zoomToggle = <HTMLInputElement>qs('#zoom'),
	specialToggle = <HTMLInputElement>qs('#starz'),
	specialText = <Text>specialToggle.previousElementSibling.firstChild,
	passengerLink = <HTMLAnchorElement>qs('#passenger'),
	vehicleLink = <HTMLAnchorElement>qs('#vehicle'),
	getOwner = (char: Character) => char.owner || char,
	updateChar = () => classData.addUpgrades(id, currentUpgs, tempState, getSpecialUpg()),
	show = (el: HTMLElement) => el.removeAttribute('style'),
	hide = (el: HTMLElement) => el.style.display = 'none',
	hide2 = (el: HTMLElement) => el.style.visibility = 'hidden',
	updateUpgrades = () => {
		upgradeMenu?.open(char, upgEl, currentUpgs)
	},
	updateTemp = () => {
		tempUpgMenu?.open(char, tempEl, currentUpgs, tempState)
	},
	updateTempVisibility = () => {
		for (const id of currentUpgs) if (charUpgrades[id][5]) return show(tempEl)
		hide2(tempEl)
	},
	updateAbilityIcons = (newID: number) => {
		if (ability != null) abilityIcons[ability].className = ''
		ability = ability == newID || newID == null ? null : (abilityIcons[newID].className = 'selected') && newID
	},
	updateUpgPoints = (cost?: number) => {
		(<Text>upgEl.firstChild.firstChild).data = `Upgrades (${cost ?? getUpgPoints(currentUpgs, charUpgrades)}/7)`
	},
	selectedUpgrades = (() => {
		const container = qs('.upgrades', options),
		icons: HTMLDivElement[] = []

		return () => {
			if (!currentUpgs.size) return container.textContent = 'No upgrades selected'
			const newContent: HTMLDivElement[] = []
			
			let i = 0
			for (const num of currentUpgs) {
				newContent[i] = icons[i] || element('div')
				newContent[i++].style.backgroundPositionX = `${-2 * charUpgrades[num][2]}em`
			}
			container.replaceChildren(...newContent)
		}
	})(),
	handleUpgChange = ({ detail: index }) => {
		if (charUpgrades[index][4] || charUpgrades[index][5]) {
			updateTempVisibility()
			updateChar()
			updateContent()
		}
		selectedUpgrades()
		url.setParam('u', getUpgParam(), '', false)
	}

	for (const el of [upgEl, tempEl]) {
		(<HTMLDivElement>el.firstChild).onclick = async e => {
			if (!upgradeMenu) ({ upgradeMenu, tempUpgMenu } = await import('./upgradeMenu.js'))
			if (el == upgEl) {
				if (upgradeMenu.isClosed()) updateUpgrades()
				else upgradeMenu.close()
			}
			else {
				if (tempUpgMenu.isClosed()) updateTemp()
				else tempUpgMenu.close()
			}
		}
	}
	abilityIcons.forEach((icon, i) => {
		icon.onclick = async () => {
			updateAbilityIcons(i)
			if (!abilityCards) {
				({ abilityCards } = await import('./abilities.js'))
				updateChar()
			}
			updatePath()
		}
	})

	upgEl.addEventListener('upgadd', handleUpgChange)
	upgEl.addEventListener('upgremove', handleUpgChange)
	tempEl.addEventListener('tempchange', ({ detail: changedIndex }) => {
		const newState = tempState[changedIndex]
		if (newState == null) {
			updateChar()
			updateContent()
		}
		else {
			addUpgrade(getOwner(char), charUpgrades[changedIndex][5][newState])
			classData.resetCache(char.owner || char)
			updateContent(true)
		}
		url.setParam('t', getTempParam(), '', false)
	})
	for (let i = 0; i < 2; i++) 
		(i ? vehicleLink : passengerLink).onclick = () => {
			setChar(getLinkTargets(char)[i].id)
			updatePath()
		}
	
	zoomToggle.oninput = () => {
		updateContent()
		url.setParam('z', zoomToggle.checked ? '1' : '', '', false)
	}
	specialToggle.oninput = () => {
		updateChar()
		updateContent()
	}
	tempEl.onkeydown = e => { 
		e.code == 'Escape' && tempUpgMenu?.close()
	}
	upgEl.onkeydown = e => {
		e.code == 'Escape' && upgradeMenu?.close()
	}

	const getLinkTargets = (char: Character) => {
		const owner = getOwner(char)
		return [
			owner.passenger ? char.type ? owner : owner.passenger : null,
			owner.vehicle ? char.health > 200 ? owner : owner.vehicle : null
		]
	},
	starzAlignUpg: UpgradeValue = {
		"passenger_primary": {
			rof: 300,
			homing: null
		},
		"abilities_2": {
			spottingRange: null
		}
	},
	tagged80sUpg: UpgradeValue = {
		"abilities_2_weapon": {
			rof: 324.3,
			homing: [0,0,180,90,15,1/3]
		},
		"abilities_2_weapon_recoil_4": 1.2719703977798333,
		"abilities_2_weapon_projectiles_0_splashDmg": 25
	},
	getSpecialUpg = () => {
		if (specialToggle.checked) return null
		if (id == 14) return tagged80sUpg
		if (id == 21 || id == 28) return starzAlignUpg
	}

	let id: number

	const next = <HTMLAnchorElement>qs('#next'),
	prev = <HTMLAnchorElement>qs('#prev'),
	icon = <HTMLImageElement>qs('#icon'),
	names = icon.nextElementSibling.children,
	nameNode = <Text>names[0].firstChild,
	roleNode = <Text>names[1].firstChild,
	roleIcon = <HTMLSpanElement>names[1].lastChild

	const roleMap = {
		"Attack": 0,
		"Defend": 1,
		"Support": 2,
		"Swarm": 3
	}

	const updateTitle = () => {
		router.updateIcon(char.name.replace(/ | /g, '_'))
		document.title = (ability == null ? char.fullName : char.abilities[ability].name) + ' stats'
	}

	const updatePath = (removeUpgrades?: boolean) => {
		const param = new URLSearchParams(location.search)
		if (removeUpgrades) param.delete('u'), param.delete('t')
		param[ability ? 'set' : 'delete']('a', ''+ability);
		updateContent()
		updateTitle()
		
		url.goTo(`/classes/${char.folderName}/${ability == null ? '' : `abilities.html`}${param+'' && '?' + param}`)
	},
	updateLinks = () => {
		const getParamStr = (str: string) => str && '?' + str.slice(1)
		settings.updateLinks()
		const upgParam = getUpgParam(), tempParam = getTempParam()
		const param1 = settings.searchStr + (zoomToggle.checked ? '&z=1' : '')
		const param2 = getParamStr(param1 + (upgParam && '&u=' + upgParam) + (tempParam && '&t=' + tempParam))
		navbar.links[2].href = navbar.links[2].href.split('?')[0] + getParamStr(param1 + `&g=${id.toString(36)}${upgParam && '-' + upgParam}${tempParam && '-' + tempParam}`)

		next.href = `/classes/${characters[nextMap[id] ?? id + 1].folderName}${ability == null ? '' : '/ability'}${getParamStr(param1)}`
		prev.href = `/classes/${characters[prevMap[id] ?? id - 1].folderName}${ability == null ? '' : '/ability'}${getParamStr(param1)}`


		abilityIcons.forEach((icon, i) => {
			icon.href = ability == i ? './' + getParamStr(param2) : 'abilities.html' + getParamStr((i ? '&a=' + i : '') + param2)
		})

		getLinkTargets(char).forEach((char, i) => {
			if (!char) return
			const link = i ? vehicleLink : passengerLink
			link.href = `/classes/${char.folderName}${ability == null ? '' : '/ability'}${param2}`
		})
	},
	getUpgParam = () => {
		let result = ''
		for (const id of currentUpgs) result += '.' + id.toString(36)
		return result.slice(1)
	},
	getTempParam = () => {
		let result = ''
		tempState.forEach((val, i) => {
			if (val != null) result += '.' + i.toString(36) + val
		})
		return result.slice(1)
	}

	const setChar = (newID: number, resetUpgs?: boolean, keepSpecialState?: boolean) => {
		// Updating Header
		char = classData.getClass(id = newID)
		icon.title = nameNode.data = char.fullName
		roleNode.data = `Role: ${char.role}`
		icon.style.objectPosition = `${-8.2 * char.iconId}rem 0`
		roleIcon.style.backgroundPositionX = `${-2.1 * roleMap[char.role]}rem`
		abilities.style.setProperty('--icon', `url(/images/abilities/ability-set${id}.webp)`)

		if (resetUpgs) {
			if (currentUpgs.size) {
				currentUpgs.clear()
				selectedUpgrades()
				tempState = []
				updateTempVisibility()
				updateUpgPoints(0)
			}
			classData.addUpgrades(id, currentUpgs, tempState)
		}
		charUpgrades = upgrades[char.owner?.id || id]
		
		// Updating options
		if (!(id % 7 || id < 9 || keepSpecialState)) {
			show(specialToggle.parentElement)
			specialText.data = id == 14 ? 'Non-tagged' : 'Starz Align'
			specialToggle.checked = true
		}
		else hide2(specialToggle.parentElement)
		const linkTargets = getLinkTargets(char)
		for (let i = 0; i < 2; i++) {
			const link = i ? vehicleLink : passengerLink
			if (linkTargets[i]) {
				link.textContent = linkTargets[i].type || linkTargets[i].name
				show(link)
			}
			else hide(link)
		}
	}

	const nextMap = [,,,,,,,,,,,,,,,,,,,,,,0,8,13,19,8,19,22],
	prevMap = [22,,,,,,,,,,,,,,,,,,,,,,,6,11,17,6,17,20]

	addEventListener('keyup', e => {
		if (!container.parentElement || (<HTMLElement>e.target).matches('input')) return
		if (e.keyCode == 37) prev.click()
		else if (e.keyCode == 39) next.click()
	})

	next.onclick = e => {
		setChar(nextMap[id] ?? id + 1, true)
		updatePath(true)
	}
	prev.onclick = e => {
		setChar(prevMap[id] ?? id - 1, true)
		updatePath(true)
	}

	return { 
		get id() { return id },
		get zoom() { return zoomToggle.checked },
		get ability() { return ability },
		updateLinks, options,
		setState(upg: string, temp: string, charID: number, zoom: boolean, newAbility: number) {
			updateAbilityIcons(newAbility)

			if (document.readyState == 'loading') {
				char = characters[id = charID]
				charUpgrades = upgrades[char.owner?.id || id]
			}
			else {
				setChar(charID)
				upgradeMenu?.close()
				tempUpgMenu?.close()
			}
			zoomToggle.checked = zoom
			
			classData.addUpgrades(
				charID, 
				currentUpgs = parseUpgParam(upg), 
				tempState = parseTempParam(temp),
			)
			
			updateTempVisibility()
			selectedUpgrades()
			updateUpgPoints()
			updateContent()
			if (document.readyState != 'loading' || newAbility != null) updateTitle()
		}
	}
})()

const classData = (() => {
	const classes: Character[] = []
	const upgraded = new Set<number>(),
	addCharacter = (id: number) => classes[id] = stats.getStats(id),
	linkClasses = (id: number) => {
		[characters[id].passenger, characters[id].vehicle].forEach((char, i) => {
			if (char) (classes[id][i ? 'vehicle' : 'passenger'] = classes[char.id]).owner = classes[id]
		})
	}

	return {
		get classes() { return classes },
		get upgraded() { return upgraded },
		getClass(id: number) {
			if (classes[id]) return classes[id]
			const ownerID = characters[id].owner?.id ?? id,
			{ passenger, vehicle } = characters[ownerID]
			
			addCharacter(ownerID)
			if (passenger || vehicle) {
				passenger && addCharacter(passenger.id)
				vehicle && addCharacter(vehicle.id)
				linkClasses(ownerID)
			}
			
			return classes[id]
		},
		resetCache(char: Character) {
			char.resetCache()
			char.vehicle?.resetCache()
			char.passenger?.resetCache()
		},
		reset(char: Character) {
			char.resetStats()
			char.vehicle?.resetStats()
			char.passenger?.resetStats()
			linkClasses(char.id)
		},
		addUpgrades(id: number, upgradeIDs: Set<number>, tempUpgs: number[], specialUpg?: UpgradeValue) {
			const ownerID = characters[id].owner?.id ?? id,
			owner = classes[ownerID]
			classData[upgraded.delete(ownerID) ? 'reset' : 'resetCache'](owner)
			if (!upgradeIDs.size && !specialUpg) return

			const upgs = upgrades[ownerID]
			upgraded.add(ownerID)

			for (const id of upgradeIDs) {
				const upg = upgs[id]
				if (upg[4]) addUpgrade(owner, upg[4])
				if (upg[5]?.[tempUpgs[id]]) addUpgrade(owner, upg[5][tempUpgs[id]])
			}
			specialUpg && addUpgrade(owner, specialUpg)
		}
	}
})()

const parseUpgParam = (param: string) => {
	const set = new Set<number>()
	if (!param) return set
	for (const str of param.split('.'))
		set.add(parseInt(str, 36))
	return set
},
parseTempParam = (param: string) => {
	const arr: number[] = []
	if (!param) return arr
	for (const str of param.split('.'))
		arr[parseInt(str[0], 36)] = +str[1]
	return arr
}

const getCharID = (() => {
	let index = 0
	const cache = new Map<string, number>()

	return (folder: string) => {
		if (cache.get(folder) != null) return cache.get(folder)

		while (1) {
			const folderName = characters[index].folderName
			cache.set(folderName, index++)
			// Subtract 1 since due to incrementing on previous line
			if (folderName == folder) return index - 1
		}
	}

})()

let abilityCards: ReturnType<typeof createStatCard<unknown, AbilityType>>[],
currentCards: ReturnType<typeof createStatCard>[]

const setState = async () => {

	let [distance, crit, move, upg, temp, ability, zoom] = url.getParams('d','c','m','u','t','a','z')
	const path = location.pathname.split('/')

	settings.state = [clamp(0, +distance, 100) || 0, !!crit, !!move]
	
	if (path[3] && !abilityCards) ({ abilityCards } = await import('./abilities.js'))
	settings.updateCallbacks = [() => updateContent(true), () => updateContent(true), () => updateContent(true)]
	
	pageHeaders.setState(upg, temp, getCharID(path[2]), !!zoom, path[3] ? +ability || 0 : null)
	onresize = () => createColumns()
	settings.updateLinks()
}

let timeout: number, dist: number, crit: boolean, move: boolean, zoom: boolean
const updateContent = (smallUpdate?: boolean) => {
	clearTimeout(timeout)
	timeout = setTimeout(pageHeaders.updateLinks, 200);

	[dist, crit, move] = settings.state
	zoom = pageHeaders.zoom
	
	if (smallUpdate) {
		return currentCards.forEach(card => card.update())
	}
	
	const ability = pageHeaders.ability
	const baseChar = characters[char.id]
	
	currentCards = []
	if (ability != null) {
		const baseProp = baseChar.abilities[ability]
		const prop = char.abilities[ability]
		for (let i = 0, j = 0; i < abilityCards.length; i++) {
			if (abilityCards[i].update(prop, baseProp)) currentCards[j++] = abilityCards[i]
		}
	}
	else for (let i = 0, j = 0; i < statCards.length; i++) {
		if (statCards[i].update(char, baseChar)) currentCards[j++] = statCards[i]
	}	
	createColumns(true)
},
getWeapon = (char: Character) => char[zoom ? 'alt' : 'primary'] || char.primary,
createColumns = (forceUpdate?: boolean) => {
	const totalHeight = currentCards.reduce((a, b) => a + b.height, 0),
	colCount = clamp(1, Math.floor(Math.min((width - 16) / 266, totalHeight ** .75 / 55)), 5)

	if (!forceUpdate && colCount == main.childElementCount) return

	const divs: HTMLDivElement[] = [],
	heights: number[] = [],
	getShortestColumn = () => {
		let index = 0, smallest = 1e9
		for (let i = 0; i < colCount; i++) {
			if (heights[i] < smallest) smallest = heights[index = i]
		}
		return index
	},
	maxWidth = clamp(39, colCount * 37.5 + 1.6, 150)

	for (let i = 0; i < colCount; i++) {
		heights[i] = 0
		divs[i] = element('div')
	}

	for (let i = 0; i < currentCards.length; i++) {
		const index = getShortestColumn(), card = currentCards[i]
		// console.log(index, colCount, heights, divs, currentCards)
		divs[index].append(card.el)
		heights[index] += card.height
	}
	main.replaceChildren(...divs)
	pageHeaders.options.style.maxWidth = Math.max(colCount == 1 ? 146.8 : 54.4, maxWidth - 3.2) + 'rem'
	main.style.maxWidth = maxWidth + 'rem'
}

const toggleText = ['1st', '2nd', '3rd']

// Need a second generic type so this function can be used for both characters and abilities
const createStatCard = <Category, StatSource>(
	prop: ((char: StatSource) => Category)[],
	getName: (prop?: Category) => string,
	labels: string[],
	getStats: ((prop: Category, source: StatSource) => number | string)[][],
	decimals: number[],
	colors: number[],
	units: number[]
) => {
	let index = 0, indexState = 0, maxIndex = 0, nameText: Text,
	currentProp: Category, char: StatSource, baseProp: Category, baseChar: StatSource, 
	btn: HTMLButtonElement, rowContainer: HTMLDivElement, currentRows: typeof rows

	const getToggle = () => {
		nameText.before(btn || (btn = element('button', { className: 'btn card-toggle', onclick() {
			btn.textContent = toggleText[index = indexState = index == maxIndex ? 0 : indexState + 1]
			currentProp = prop[index](char)
			baseProp = prop[index](baseChar)
			self.update()
		}})))
	}
	const rows: {
		el?: HTMLDivElement,
		update(alwaysRemoveColor?: boolean): boolean
	}[] = labels.map((label, i) => {
		let statText: Text, statEl: HTMLSpanElement,
		currentStat: number | string

		return {
			update(alwaysUpdateColor?: boolean) {
				const stat = getStats[index][i](currentProp, char)
				if (stat == null) return false
				if (currentStat == (currentStat = stat) && !alwaysUpdateColor) return true
				if (!this.el) this.el = element('div', { className: 'row_c' }, [
					element('label', { textContent: label }),
					statEl = element('span', 0, [
						statText = text('')
					])
				])
				if (typeof stat == 'string') {
					statText.data = stat
					statEl.removeAttribute('style')
					return true
				}
				statText.data = round(stat, decimals[i]) + unitText[units[i] || 0]
				const baseStat = baseProp ? getStats[index][i](baseProp, baseChar) : null
				// console.log(stat, baseStat)
				if (baseStat == null || baseStat == stat || typeof baseStat == 'string') 
					statEl.removeAttribute('style')
				else 
					statEl.style.backgroundColor = (
						colors[i] ^ +(Math.abs(stat) > Math.abs(baseStat)) ? 'rgba(30, 100, 0, ' : 'rgba(120, 40, 0, '
					) + Math.min(1, (Math.max(Math.abs(baseStat / stat), Math.abs(stat / baseStat)) - 1) * .9 + .1) + ')'
				
				return true
			}
		}
	})
	const init = () => {
		self.el = element('div', { className: 'card_c' }, [
			element('div', { className: 'category_c' }, [
				nameText = text('')
			]),
			rowContainer = element('div')
		])
	},
	self: {
		el?: HTMLDivElement
		height?: number
		update(newChar?: StatSource, newBaseChar?: StatSource): boolean
	} = {
		update(newChar?: StatSource, newBaseChar?: StatSource) {
			if (newChar) {
				let appendBtn: boolean
				char = newChar
				baseChar = newBaseChar
				if (prop[1]?.(char)) {
					appendBtn = true
					index = Math.min(indexState, maxIndex = prop[2]?.(char) ? 2 : 1)
				}
				else {
					btn?.remove()
					index = 0
				}
				currentProp = prop[index](char)
				if (!currentProp) return false
				if (!self.el) init()
				if (appendBtn) {
					getToggle()
					btn.textContent = toggleText[index]
				}
				const isNewBase = baseProp != (baseProp = prop[index](baseChar))
				currentRows = []
				nameText.data = getName(currentProp)

				const newRowEls: HTMLDivElement[] = []
				for (let i = 0, j = 0; i < rows.length; i++) {
					const row = rows[i]
					if (row.update(isNewBase))
						newRowEls[j] = (currentRows[j++] = row).el
					
				}
				self.height = 45 + newRowEls.length * 28
				rowContainer.replaceChildren(...newRowEls)
			}
			else {
				currentProp = prop[index](char)
				for (const row of currentRows) row.update()
			}
			return true
		}
	}

	return self
}

const unitText = ['', 'm', 's', 'm/s', 'm²', '°', 'm/s²', '%']

const getWeaponCards = <StatSource>(getWeapon: (char: StatSource) => Weapon) => [
	createStatCard<number, StatSource>(
		[char => getWeapon(char)?.getDamage(0, 0, crit, move)],
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
			(_, char) => getWeapon(char).projectiles[0]?.splashDmg * getWeapon(char).shotsPerShell || 0,
			(_, char) => getWeapon(char).projectiles[0]?.blastRadius || null
		]],
		[],
		[,,,,1],
		[,,,,2,,,,1]
	),
	createStatCard<Bullet | Missile, StatSource>(
		[char => getWeapon(char)?.projectiles[0]],
		() => 'Bullet speed',
		[
			'Launch velocity', 'Launch velocity Y', 'Drag start', 'Drag end', 'Post-drag velocity', 
			'Acceleration', 'Max velocity', 'Travel time', 'Max range', 'Gravity', 'Bullet radius',
			'Bullet height', 'Bullet width'
		],
		[[
			prop => prop.startSpeed,
			prop => prop.startSpeedY || null,
			prop => (<Bullet>prop).dragStart || null,
			prop => (<Bullet>prop).dragEnd || null,
			prop => (<Bullet>prop).endSpeed,
			prop => (<Missile>prop).engineAccel,
			prop => (<Missile>prop).maxSpeed,
			(_, char) => getWeapon(char).travelTime(2, 0) ? getWeapon(char).travelTime(dist, 0) ?? 'n/a' : null,
			(_, char) => getWeapon(char).getMaxRange(0),
			prop => prop.gravity,
			prop => prop.radius,
			prop => (<Bullet>prop).width,
			prop => (<Bullet>prop).height
		]],
		[,,,,,,,3,1],
		[,,,,,,,1,,1],
		[3,3,1,1,3,6,3,2,1,6,1,1,1]
	),
	createStatCard<number, StatSource>(
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
	),
	createStatCard<number[], StatSource>(
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
	),
	createStatCard<number[], StatSource>(
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
	),
	createStatCard<number[], StatSource>(
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
	),
	createStatCard<number[], StatSource>(
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
	),
	createStatCard<number[], StatSource>(
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
	),
	createStatCard<number[], StatSource>(
		[char => getWeapon(char)?.recoilAngle],
		() => 'Recoil angle',
		['Max recoil angle Y', 'Max recoil angle X', 'Recovery time'],
		[[0,1,2].map(i => recoil => recoil[i] * (zoom && i < 2 ? recoil[3] / 100 : 1))],
		[3,3,3],
		[1,1,1],
		[5,5,2]
	)
]

const weaponCards = getWeaponCards<Character>(getWeapon)

const statCards = [
	weaponCards[0],
	weaponCards[1],
	createStatCard<number[], Character>(
		[char => getWeapon(char).trapezoid],
		() => 'Trapezoid',
		[
			'Damage', 'Length', 'Offset Z', 'Height', 'Near Width', 'Far Width', 'Area'
		],
		[[
			trap => trap[0],
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
	),
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
			(charge, char) => charge[0] * char.modifiers[0] * char.modifiers[4],
			(charge, char) => charge[1],
			(charge, char) => getWeapon(char).getChargeDPS(dist, i, crit, move),
			(charge, char) => getWeapon(char).getDamage(dist, i + 1, crit, move),
			(charge, char) => charge[2],
			(charge, char) => getWeapon(char).projectiles[i + 1]?.splashDmg,
			(charge, char) => getWeapon(char).projectiles[i + 1]?.startSpeed,
			(charge, char) => (<Bullet>getWeapon(char).projectiles[i + 1])?.dragStart || null,
			(charge, char) => (<Bullet>getWeapon(char).projectiles[i + 1])?.dragEnd || null,
			(charge, char) => (<Bullet>getWeapon(char).projectiles[i + 1])?.endSpeed,
			(charge, char) => (<Missile>getWeapon(char).projectiles[i + 1])?.engineAccel,
			(charge, char) => (<Missile>getWeapon(char).projectiles[i + 1])?.maxSpeed,
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
			(dash, char) => dash[0] * char.modifiers[4],
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
	weaponCards[2],
	weaponCards[3],
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
	weaponCards[4],
	weaponCards[5],
	weaponCards[6],
	createStatCard<Character, Character>(
		[char => char],
		() => 'General',
		[
			'Max health', 'Armor', 'Regen rate (hp/s)', 'Regen delay', 
			'Sprint exit delay', 'Zoom FOV', 'Priming duration'
		],
		[[
			char => char.health,
			char => char.armor || 0,
			char => char.regenRate,
			char => char.regenDelay,
			char => char.sprintExit,
			char => char.zoomFov,
			char => char.primary.primeTime
		]],
		[],
		[,,,1,1,1,1],
		[,7,,2,2,5,2]
	),
	weaponCards[7],
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
	weaponCards[8],
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

const main = container.appendChild(element('main', { className: 'content_c' }))
const prefetchUpgrades = () => setTimeout(() => router.prefetch(['upgradeMenu']))

container.addEventListener('navigated', setState)
setState()

if (document.readyState != 'loading') {
	prefetchUpgrades()
	container.removeAttribute('style')
}
else addEventListener('load', prefetchUpgrades)

export { getUpgPoints, classData, dist, move, crit, zoom, createStatCard, getWeaponCards } 