import { qs, qsa, navbar, element, router, round, clamp, text, width } from './router.js'
import { stats, getCompareLink } from './stats.js'

const container = <PageContainer>qs('#list'),
characters = stats.compareChars,
settings = navbar.settings,
url = router.url

const table = (() => {
	let currentCategory: number[], currentDecimals: number[],
	reversedOrder: boolean, filterType: number, sortID: number, 
	currentOrder: [string | number, number][], currentStats: (number | null)[][]

	const el = qs('table', container)

	const head = (() => {
		const chargeLabels = [
			'Charge time','Recovery time','Charge DPS','Ammo/shot','Damage/shot','Splash damage','Launch velocity','Max range','Travel time'
		]
		const recoilLabels = [
			'Max ampli­tude Y','Max ampli­tude X','Increase/shot Y','Average inc/shot X','Max devi­ation/shot X','Decrease factor','… shooting','First shot inc scale'
		]
		const dispersionLabels = [
			'Min angle','Max angle','Increase/shot','… including decrease','Decrease/sec','Jump dispersion','Move dispersion','Avg shell dispersion'
		]
		const gunSwayLabels = [
			'Min angle','… moving','… jumping','Max angle','… moving','Bloom/shot','… moving','Decrease/sec'
		]

		const labels = [
			'DPS','Rate of fire','Damage/shot','Sustain­able DPS','Launch velocity','Splash damage','Splash radius','Spray damage',
			'Spray range', 'Drag start','Drag end','Post‑drag velocity','Accel­eration','Max velocity','Travel time','Max range',
			'Gravity','Ammo capacity','Reload time','Damage/clip','Shots/burst','Burst interval','Ammo/shot','Sustain­able RoF',
			'Overheat time','Heat/bullet','Heat-gain/sec','Heat-drop/sec','Heat‑drop delay','Penalty time','Cooldown time',
			'Damage/overheat',...chargeLabels,...chargeLabels,...chargeLabels,'Max HP','Regen delay','Regen rate','Armor',
			'Shield HP','Shield regen','Shield regen delay','Priming time','Priming speed','Movement speed','Strafe speed', 
			'Backwards speed', 'Sprint speed' ,'Speed (aiming)','Hover gravity','Max hover time','Jump height','In‑air jump height',
			...recoilLabels, ...recoilLabels,'Max recoil angle Y','Max recoil angle X','Recovery time','Zoom scale',
			...dispersionLabels, ...dispersionLabels, ...gunSwayLabels, 'Aim time', ...gunSwayLabels
		]

		const nodes: Text[] = [], cells: HTMLTableCellElement[] = []

		for (let i = 0; i < 10; i++) cells[i] = element('th', { 
			tabIndex: 0, onclick() {
				body.sort(i)
			}, 
			onkeyup(e) {
				if (e.code == 'Space' || e.code == 'Enter') this.click()
			},
			onkeydown(e) {
				e.code == 'Space' && e.preventDefault()
			}
		}, [
			element('div', 0, [i ? nodes[i - 1] = text('') : 'Character'])
		])

		return {
			el: element('thead', 0, [
				element('tr', 0, cells)
			]),
			setHeaders(indexes: number[]) {
				indexes.forEach((id, i) => nodes[i].data = labels[id])
			},
			setSortID(newID: number, forcedOrder?: boolean) {
				if (newID == sortID) reversedOrder = forcedOrder ?? !reversedOrder
				else {
					cells[sortID]?.removeAttribute('aria-sort')
					reversedOrder = !!forcedOrder
				}
				cells[sortID = newID].setAttribute('aria-sort', reversedOrder ? 'ascending' : 'descending')
			}
		}

	})()

	const decimals: number[] = [
		...new Array(76).fill(2), ...new Array(54).fill(3)
	]
	
	const units: number[] = [
		0,0,0,0,3,0,1,0,1,1,1,3,6,3,2,1,6,0,2,0,0,2,0,0,2,0,0,0,2,2,2,0, // ends at Damage/overheat 31
		2,2,0,0,0,0,3,1,2,2,2,0,0,0,0,3,1,2,2,2,0,0,0,0,3,1,2,0,2,0,7,0, // ends at Shield HP 63
		0,2,2,3,3,3,3,3,3,7,2,1,1,5,5,5,5,5,0,0,0,5,5,5,5,5,0,0,0,5,5,2, // ends at Recoil angle 95
		7,...new Array(34).fill(5)
	]
	const unitText = [
		'', 'm', 's', 'm/s', 'm²', '°', 'm/s²', '%'
	]
	
	for (let i of [14,25,40,49,58]) decimals[i] = 3
	units[121] = 2


	const categories = [
		[0,1,2,3,4,5,6,7,8],
		[4,9,10,11,12,13,14,15,16],
		[17,18,19,20,21,22,1,23,3],
		[24,25,26,27,28,29,30,31,23],
		[32,33,34,35,36,37,38,39,40],
		[41,42,43,44,45,46,47,48,49],
		[50,51,52,53,54,55,56,57,58],
		[59,60,61,62,63,64,65,66,67],
		[68,69,70,71,72,73,74,75,76],
		[77,78,79,80,81,82,83,84],
		[85,86,87,88,89,90,91,92],
		[93,94,95,96,0,1,2,3,4],
		[97,98,99,100,101,102,103,104],
		[105,106,107,108,109,110,111,112],
		[113,114,115,116,117,118,119,120,121],
		[122,123,124,125,126,127,128,129,121]
	]

	const body = (() => {
		const el = element('tbody')

		const getStats: [
			((char: Character) => number | null)[],
			(newDistance: number, newCrit: boolean, newMove: boolean) => void,
			[(newVal: number) => any, (newVal: boolean) => any, (newVal: boolean) => any]
		] = (() => {
			let distance: number, crit: boolean, move: boolean

			const funcs = [
				(char: Character) => char.primary.getDPS(distance, crit, move),//DPS 0
				(char: Character) => char.primary.effectiveRof * 60,//Rate of fire 1
				(char: Character) => char.primary.getDamage(distance, 0, crit, move),//Damage/shot 2
				(char: Character) => char.primary.getDPS(distance, crit, move, true),//Sustainable DPS 3
				(char: Character) => char.primary.projectiles[0]?.startSpeed,//Launch velocity 4
				(char: Character) => char.primary.projectiles[0]?.splashDmg,//Splash damage 5
				(char: Character) => char.primary.projectiles[0]?.blastRadius || null,//Splash radius 6
				(char: Character) => char.primary.trapezoid?.[0],//Spray damage 7
				(char: Character) => char.primary.sprayRange || null,//Spray range 8
				(char: Character) => (<Bullet>char.primary.projectiles[0])?.dragStart || null,//Drag start 9
				(char: Character) => (<Bullet>char.primary.projectiles[0])?.dragEnd || null,//Drag end 10
				(char: Character) => (<Bullet>char.primary.projectiles[0])?.endSpeed,//Post drag velocity 11
				(char: Character) => (<Missile>char.primary.projectiles[0])?.engineAccel,//Acceleration 12
				(char: Character) => (<Missile>char.primary.projectiles[0])?.maxSpeed,//Max velocity 13
				(char: Character) => char.primary.travelTime(distance, 0),//Travel time 14
				(char: Character) => char.primary.getMaxRange(0) || null,//Max range 15
				(char: Character) => char.primary.projectiles[0]?.gravity,//Gravity 16
				(char: Character) => char.primary.ammo,//Ammo capacity 17
				(char: Character) => char.primary.reload || null,//Reload time 18
				(char: Character) => char.primary.getDmgPerClip(distance, crit, move),//Damage/clip 19
				(char: Character) => char.primary.burstSize,//Shots/burst 20
				(char: Character) => char.primary.burstInterval,//Burst interval 21
				(char: Character) => char.primary.ammoPerShot,//Ammo/shot 22
				(char: Character) => char.primary.sustainableRof * 60,//Sustainable RoF 23
				(char: Character) => char.primary.overheatTime,//Overheat time 24
				...[0,1,2,3,4].map(i => (char: Character) => char.primary.overheat?.[i]), // Overheating 25 - 29
				(char: Character) => char.primary.cooldown,//Cooldown duration 30
				(char: Character) => char.primary.getDmgPerOverheat(distance, crit, move),//Damage/overheat 31
				...[0,1,2].map(i => [ 
					(char: Character) => char.primary.charges?.[i]?.[0],//Charge time 32
					(char: Character) => char.primary.charges?.[i]?.[1],//Recovery time 33
					(char: Character) => char.primary.getChargeDPS(distance, i, crit, move),//Charge DPS 34
					(char: Character) => char.primary.charges?.[i]?.[2],//Ammo/shot 35
					(char: Character) => char.primary.getDamage(distance, i + 1, crit, move),//Damage/shot 36
					(char: Character) => char.primary.projectiles[i + 1]?.splashDmg,//Splash damage 37
					(char: Character) => char.primary.projectiles[i + 1]?.startSpeed,//Launch velocity 38
					(char: Character) => char.primary.getMaxRange(i + 1) || null,//Max range 39
					(char: Character) => char.primary.travelTime(distance, i + 1),//Travel time 40
				]).flat(), 
				(char: Character) => char.health,//Max HP 59
				(char: Character) => char.regenDelay,//Regen delay 60
				(char: Character) => char.regenRate,//Regen rate 61
				(char: Character) => char.armor,//Armor 62
				(char: Character) => char.shield?.[0],//Shield HP 63
				(char: Character) => char.shield?.[1],//Shield regen 64
				(char: Character) => char.shield?.[2],//Shield regen delay 65
				(char: Character) => char.primary.primeTime,//Priming duration 66
				(char: Character) => char.primary.primeSpeed?.[0] * char.moveData?.[0] || null,//Priming speed 67
				...[0,1,2,3,4,5,6,7,8].map(i => (char: Character) => char.moveData?.[i]), // Mobility 68 - 76
				...[0,1,2,3,4,5,6,7].map(i => (char: Character) => char.primary.getRecoil()?.[i]), // Recoil 77 - 84
				...[0,1,2,3,4,5,6,7].map(i => (char: Character) => char.primary.getRecoil(true)?.[i]), // Recoil (zoom) 85 - 92
				...[0,1,2,3].map(i => (char: Character) => char.primary.recoilAngle?.[i]), // Recoil angle 93 - 96
				...[0,1,2,3,4,5,6,7].map(i => (char: Character) => char.primary.getDispersion()?.[i]), // Dispersion 97 - 104
				...[0,1,2,3,4,5,6,7].map(i => (char: Character) => char.primary.getDispersion(true)?.[i]), // Dispersion (zoom) 105 - 112
				...[0,1,2,3,5,6,7,9].map(i => (char: Character) => char.primary.gunSway?.[i]), // Gunsway 113 - 120
				(char: Character) => char.primary.aimTime, // Aim time 121
				...[0,1,2,3,5,6,7,9].map(i => (char: Character) => char.primary.gunSwayZoom?.[i]), // Gunsway (zoom) 122 - 129
			]

			return [
				funcs,
				// Function to update cache
				(newDistance: number, newCrit: boolean, newMove: boolean) => {
					distance = newDistance
					crit = newCrit
					move = newMove
				},
				// For navbar.settings.updateCallbacks
				[
					(newVal: number) => (distance = newVal, body.updateStats()),
					(newVal: boolean) => (crit = newVal, body.updateStats()),
					(newVal: boolean) => (move = newVal, body.updateStats())
				]
			]
			
		})()

		const rows: {
			el?: HTMLTableRowElement,
			update: (char: Character, data: (number | null)[]) => void,
			updateLink: () => void
		}[] = new Array(34)

		for (let i = 0; i < 34; i++) {
			// Local state for each row making it faster to update
			let oldData: number[], initialized: boolean, 
			nodes: Text[] = [], link: HTMLAnchorElement, oldChar: Character,
			cells: HTMLTableCellElement[] = []

			const init = () => {
				if (initialized == (initialized = true)) return

				for (let i = 0; i < 10; i++)
					cells[i] = element('td', 0, [nodes[i] = text('')])

				rows[i].el = element('tr', 0, [
					element('td', 0, [link = element('a', { onclick() {
						router.goTo(link.href)
					}})]),
					...cells
				])
			}

			rows[i] = {
				update(char, data) {
					init()
					if (oldData == data) return
					if (char != oldChar) {
						link.style.backgroundPositionX = `-${3 * char.iconId}rem`
						nodes[0].data = link.title = char.fullName
					}
					const l = data.length
					for (let i = 0; i < l; i++) {
						const newStat = data[i], oldStat = oldData?.[i]
						if (newStat != oldStat || !oldData)
							nodes[i + 1].data = newStat == null ? '' : round(newStat, currentDecimals[i]) + unitText[units[currentCategory[i]]]
					}
					if (data[8] == null && l > oldData?.length)
						nodes[9].data = ''

					oldData = data
					oldChar = char
				},
				updateLink() {
					if (link) link.href = getCompareLink(oldChar)
				}
			}

		}

		const sortingFuncs = [
			(a: any, b: any) => b[0] - a[0],
			(a: any, b: any) => a[0] - b[0],
			(a: any, b: any) => b[0] > a[0] ? 1 : -1,
			(a: any, b: any) => a[0] > b[0] ? 1 : -1,
		],
		updateLinks = () => {
			settings.updateLinks()
			for (let i = 0; i < 34; i++) rows[i].updateLink()
		}

		let timeout: number

		return {
			el,
			updateStats() {
				let l = currentCategory.length
				currentStats = new Array(34)
				for (let i = 0; i < 34; i++) {
					currentStats[i] = []
					for (let j = 0; j < l; j++) {
						currentStats[i][j] = getStats[0][currentCategory[j]](characters[i])
					}
				}
				body.sort()
			},
			sort(columnIndex?: number) {
				if (columnIndex != null) {
					head.setSortID(columnIndex)
					url.setParam('s', columnIndex+'', '1')
					url.setParam('o', +reversedOrder+'', '0', false)
				}
				currentOrder = []
				const defaultValue = reversedOrder ? Infinity : -Infinity

				if (sortID) for (let i = 0; i < 34; i++)
					currentOrder[i] = [currentStats[i][sortID - 1] ?? defaultValue, i]
				else for (let i = 0; i < 34; i++) 
					currentOrder[i] = [characters[i].name, i]
				
				currentOrder.sort(sortingFuncs[(sortID ? 0 : 2) + +reversedOrder])

				body.update()
			},
			update() {
				const team = [,'Plant', 'Zombie'][filterType],
				newRows = []

				for (let i = 0, j = 0; i < 34; i++) {
					const index = currentOrder[i][1],
					char = characters[index], include = !team || char.team == team, 
					data = currentStats[index], row = rows[include ? i - j : 34 - ++j], isNewRow = !row.el
					if (!include) {
						if (!isNewRow) row.el.style.display = 'none'
						continue
					}
					row.update(char, data)
					if (isNewRow) newRows.push(row.el)
					else if (row.el.style) row.el.removeAttribute('style')
				}
				el.append(...newRows)
				clearTimeout(timeout)
				timeout = setTimeout(updateLinks, 200)
			},
			setCache(distance: number, crit: boolean, move: boolean) {
				getStats[1](distance, crit, move)
				settings.updateCallbacks = getStats[2]
			}
		}
	})()

	el.append(head.el, body.el)
	const setCategory = (index: number) => {
		head.setHeaders(currentCategory = categories[index])
		table.setLastColumnVisibility(currentCategory.length == 9)
		currentDecimals = currentCategory.map(i => decimals[i])
	}

	return {
		setLastColumnVisibility: (() => {
			let currentState = true
			const style = (<CSSStyleRule>(<CSSStyleSheet>[].find.call(document.styleSheets, (sheet: CSSStyleSheet) => sheet.href?.includes('list.css'))).cssRules[0]).style

			return (visibility: boolean) => {
				if (currentState != (currentState = visibility)) style.display = visibility ? 'table-cell' : 'none'
			}
		})(),
		setCategory(index: number) {
			setCategory(index)
			
			if (sortID) {
				head.setSortID(1, false)
				url.setParam('s', '1', '1')
				url.setParam('o', '0', '0')
			}
			body.updateStats()
			url.setParam('g', index+'', '0', false)
		},
		setFilter(type: number) {
			filterType = type
			body.update()
		},
		setState(category: number, reversed: boolean, filter: number, sort: number, distance: number, crit: boolean, move: boolean) {
			body.setCache(distance, crit, move)
			setCategory(category)
			filterType = filter
			head.setSortID(sort, reversed)
			body.updateStats()
		}
	}
})()

const pageOptions = (() => {
	const el = qs('.options', container),
	team = <HTMLSelectElement>qs('#team'),
	category = <HTMLSelectElement>qs('#category')

	team.onchange = () => {
		table.setFilter(+team.value)
		url.setParam('t', team.value, '0', false)
	}
	category.onchange = () => {
		table.setCategory(+category.value)
	}

	return {
		team, category,
		setMaxWidth() {
			el.style.maxWidth = width - 32 + 'px'
		}
	}

})()

const setState = () => {
	let [distance, crit, move, filter, category, sort, order] = url.getParams('d','c','m','t','g','s','o') as any[]

	category = clamp(0, +category, 15) || 0
	filter = clamp(0, +filter, 2) || 0
	sort = sort ? clamp(0, +sort, 9) || 0 : 1
	distance = clamp(0, +distance, 100) || 0

	settings.state = [distance, !!crit, !!move]
	pageOptions.team.value = filter
	pageOptions.category.value = category
	table.setState(category, !!order, filter, sort, distance, !!crit, !!move);
	
	(onresize = pageOptions.setMaxWidth)()
	settings.updateLinks()
}

container.addEventListener('navigated', setState)
setState()
container.removeAttribute('style')
