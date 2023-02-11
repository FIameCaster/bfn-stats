import { qs, qsa, navbar, element, round, clamp, text, router, width } from './router.js'
import { stats, getCompareLink } from './stats.js'

let rowCount = 0, timeout: number, prevRowCount = 0
const characters = stats.compareChars,
settings = navbar.settings, url = router.url
const rows: {
	el?: HTMLDivElement,
	update: (data: [Character, number, string]) => void,
	updateLink: () => void
}[] = new Array(55)

for (let i = 0; i < 55; i++) {
	let oldData: [Character, number, string],
	ttkNode: Text, notesText: Text, initialized: boolean, 
	link: HTMLAnchorElement, ttkEl: HTMLDivElement

	const init = () => {
		if (initialized == (initialized = true)) return

		rows[i].el = element('div', { className: 'row_t' }, [
			link = element('a', { onclick() {
				router.goTo(link.href)
			}}),
			ttkEl = element('div', { className: 'ttk' }, [ttkNode = text('')]),
			element('div', { className: 'notes' }, [notesText = text('')])
		])
	}

	rows[i] = {
		update(data) {
			init()
			let [char, ttk, notes] = data
			data[2] = notes += char.type ? notes ? notes[notes.length - 1] == ')' ? '' : `, ${char.type}` : char.type : ''
			if (oldData?.[0] != char) {
				link.style.backgroundPositionX = `-${3 * char.iconId}rem`
				link.title = char.fullName
			}
			if (oldData?.[1] != ttk) {
				ttkNode.data = ttk == Infinity ? 'n/a' : round(Math.floor(ttk * 30) / 30, 2) + 's'
				ttkEl.className = ttk == Infinity ? 'ttk na' : 'ttk'
			}
			if (oldData?.[2] != notes) notesText.data = notes
			oldData = data
		},
		updateLink() {
			if (link) link.href = getCompareLink(oldData[0])
		}
	}
}

const updateLinks = () => {
	settings.updateLinks()
	for (let i = 0; i < 55; i++) rows[i].updateLink()
}

const updateRows = () => {
	const hp = clamp(0, +health.value, 999) || 125,
	armor2 = Math.abs(+armor.value) || 1,
	defOnly = defaultOnly.checked, activeTeam = [,'Plant', 'Zombie'][team.value],
	ttk: [Character, number, string][] = []
	for (let i = 0; i < 34; i++) {
		if (activeTeam && activeTeam != characters[i].team) continue
		ttk.push(...calcTTK(characters[i], distance, crit, move, hp, armor2, defOnly))
	}
	ttk.sort((a, b) => a[1] - b[1]).forEach((data, i) => rows[i].update(data))
	if (rowCount != (rowCount = ttk.length)) createColumns()
	clearTimeout(timeout)
	timeout = setTimeout(updateLinks, 200)
}

const columns = [element('div'), element('div'), element('div'), element('div')]
let prevColCount = 0

const createColumns = () => {
	const colCount = clamp(1, Math.floor(Math.min((width - 16) / 300, rowCount ** .77 / 4.2)), 4),
	maxWidth = clamp(42, colCount * 40 + 1.6, 150)

	if (colCount == prevColCount && prevRowCount == rowCount) return

	const sizeRatio = (prevRowCount * colCount) / (rowCount * prevColCount) || 0
	
	if (sizeRatio != 1) for (let i = 0; i < colCount; i++) {
		const column = columns[i], firstChild = column.firstChild
		const max = rowCount / colCount * (i + 1)
		for (let j = Math.ceil(i * rowCount / colCount), k = 0; j < max; j++, k++) {
			const row = rows[j].el
			if (row.parentElement != column) {
				if (sizeRatio < 1 || !firstChild) column.append(row)
				else firstChild.before(row)
			}
		}
		if (i >= prevColCount) cards.append(columns[i])
	}
	for (let i = rowCount; i < prevRowCount; i++) rows[i].el.remove()
	for (let i = colCount; i < prevColCount; i++) columns[i].remove()
	prevRowCount = rowCount
	prevColCount = colCount
	options.style.maxWidth = Math.max(78.4, maxWidth - 3.2) + 'rem'
	cards.style.maxWidth = maxWidth + 'rem'
}

let distance: number, crit: boolean, move: boolean
const container = <PageContainer>qs('#ttk'),
cards = <HTMLDivElement>qs('.cards_t', container),
options = <HTMLDivElement>qs('.options_t', container),
team = <HTMLSelectElement>qs('#team'),
defaultOnly = <HTMLInputElement>qs("#default"),
health = <HTMLInputElement>qs('#health'),
armor = <HTMLInputElement>qs("#armor")

team.onchange = () => {
	updateRows()
	url.setParam('t', team.value, '0', false)
}
armor.oninput = health.oninput = () => updateRows()
armor.onblur = () =>{
	url.setParam('a', armor.value = `${Math.abs(+armor.value) || 1}`, '1', false)
}
health.onblur = () =>{
	url.setParam('h', health.value = `${clamp(0, +health.value, 999) || 125}`, '125', false)
}
defaultOnly.onchange = () => {
	updateRows()
	url.setParam('e', +defaultOnly.checked+'', '0', false)
}

const setState = () => {
	onresize = () => createColumns()
	let [dist, crit2, move2, filter, def, hp, armor2] = url.getParams('d','c','m','t','e','h','a') as any[]

	distance = dist = clamp(0, +dist, 100) || 0
	settings.state = [dist, move = !!move2, crit = !!crit2]
	team.value = `${clamp(0, +filter, 2) || 0}`
	defaultOnly.checked = !!def
	health.value = `${clamp(0, +hp, 999) || 125}`
	armor.value = `${Math.abs(+armor2) || 1}`

	settings.updateCallbacks = [
		newVal => (distance = newVal, updateRows()),
		newVal => (crit = newVal, updateRows()),
		newVal => (move = newVal, updateRows()),
	]
	updateRows()
	settings.updateLinks()
}

container.addEventListener('navigated', setState)

const calcTTK = (char: Character, distance: number, crit: boolean, move: boolean, health: number, armor: number, defOnly: boolean) => {
	const weapon = char.primary, burstSize = weapon.burstSize,
	ammo = weapon.ammo || 0, overheat = weapon.overheat,
	result: [Character, number, string][] = [], range = weapon.getMaxRange(0)

	health /= armor
	const periodLength = ammo ? ammo / weapon.ammoPerShot : overheat ? weapon.shotsToOverheat - 1 : 0,
	firingPeriodTime = periodLength / weapon.sustainableRof,
	dmg = weapon.getDamage(distance, 0, crit, move),
	splash = weapon.projectiles[0]?.splashDmg,
	rof = weapon.rof

	const getTime = (shots: number) => burstSize ? burstTime(shots) : (shots - 1) * 60 / rof
	const burstTime = (shots: number) => {
		const bursts = Math.ceil(shots / burstSize)
		return (bursts - 1) * weapon.burstInterval + (shots - bursts) * 60 / rof
	}
	const totalTime = (shots: number) => {
		let time = Math.ceil((shots / periodLength) - 1) * firingPeriodTime,
		remaining = shots % periodLength || periodLength
		if (time) {
			let remainingTime = getTime(remaining)
			return time + remainingTime - (!overheat ? 0 : 
				Math.floor(30 * (1 - (overheat[0] * remaining || overheat[1] * remainingTime)) / overheat[2]) / 30)
		}
		return getTime(shots)
	}

	// Snapdragon
	if (weapon.dot) {
		if (dmg) {
			if (health <= 15 / armor) result.push([
				char, totalTime(Math.ceil(health / dmg)), ''
			])
			else {
				const targetDmg = health - 15 / armor
				const getDot = (time: number) => Math.floor(time / .75) * 9
				let shots = Math.ceil(targetDmg / dmg), 
				totalDmg = dmg * shots + getDot(totalTime(shots))
				shots -= Math.ceil((totalDmg - targetDmg) / dmg)
				totalDmg = 0
				while (totalDmg < targetDmg) {
					totalDmg = dmg * ++shots + getDot(totalTime(shots))
				}
				result.push([
					char, totalTime(shots + (totalDmg - dmg >= targetDmg ? Math.ceil(15 / armor / dmg) - 1 : Math.max(0, Math.ceil((health - totalDmg) / dmg)))), ''
				])
			}
		}
		else result.push([char, Infinity, ''])
		if (defOnly) return result
	}

	// Steam blaster
	else if (rof == 58) {
		if (dmg) {
			const mags = Math.ceil((Math.ceil(health / dmg) / periodLength) - 1),
			cloud: number[][] = [], l = move ? 2 : 6
			for (let i = 0; i < l; i++) cloud[i] = [.3 + .25 * i, 10]
			if (!move) cloud.push([1.65, 6], [1.9, 6])
	
			const dmgArr: number[][] = []
			for (let i = 0; i < periodLength; i++) {
				const time = i * 60 / 58
				dmgArr.push(
					[time, 12], ...cloud.map(arr => [arr[0] + time, arr[1]])
				)
			}
	
			let hp = health - (mags * ammo * dmg), totalDmg = 0, i = -1
			while (totalDmg < hp) totalDmg += dmgArr[++i][1]
			result.push([
				char, dmgArr[i][0] + mags * firingPeriodTime, 'Steam Blaster'
			])
		}
		else result.push([char, Infinity, 'Steam Blaster'])
		return result
	}

	// Super brainz first
	if (!ammo && burstSize) {
		const burstDmg = dmg * burstSize, hp = health % burstDmg
		result.push([
			char, (hp <= 30 ? 0 : hp <= 65 ? 1 : 2) / rof * 60 + (Math.ceil(health / burstDmg) - 1) * burstSize / weapon.sustainableRof, ''
		])
	}
	else result.push([
		char, totalTime(Math.ceil(health / dmg)), result[0] ? 'No DoT' : char.name == 'Shogun-Guard' ? 'Shogun-Guard' : ''
	])
	if (defOnly) return result

	if (char.id == 9) result.push([
		char, totalTime(Math.ceil(health / dmg / 1.3)), 'With jinx'
	])
	if (splash) result.push([char, totalTime(Math.ceil(health / (range >= distance ? splash : 0))), 'Splash only'])
	if (char.role == 'Swarm') result.push([char, distance > 5 ? Infinity : health > 50 ? totalTime(Math.ceil((health - 50) / dmg)) + 1 / 30 : 0, 'Melee finish'])

	// Charge TTK
	if (weapon.charges && rof != 165) {
		const damages = [burstSize ? 0 : dmg], l = weapon.charges.length, levels = ['1st', '2nd', '3rd']
		const roundUp = (num: number) => Math.ceil(Math.round(num * 1e6) / 1e6 * 30) / 30
		for (let i = 1; i <= l; i++) damages[i] = weapon.getDamage(distance, i, crit, move)
		for (let i = 0; i < l; i++) {
			const [, recovery, ammoPerShot] = weapon.charges[i],
			chargeDmg = damages[i + 1], 
			shots: number[] = new Array(l + 1).fill(0)

			shots[i + 1]++
			if (chargeDmg >= health) {
				result.push([char, 0, `${levels[i]} charge (${shots.reverse()})`])
				continue
			}
			let minTime = Infinity, bestCombo: number[]
			for (let j = 0; j <= l; j++) {
				const currentDmg = damages[j]
				if (!currentDmg) continue
				let tempHP = health - chargeDmg, 
				time = 0, 
				tempShots = shots.slice(),
				delay = recovery || j ? recovery + 1 / 30 : 60 / rof,
				tempShotCount = Math.ceil(tempHP / currentDmg) - 1, 
				tempAmmo = ammo - ammoPerShot,
				[chargeTime, ,ammoPerShot1] = weapon.charges[j - 1] || [0, weapon.ammoPerShot]
				
				for (let i = 0; i < tempShotCount; i++) {
					time = ammo && tempAmmo <= 0 ? roundUp(time + weapon.reload + 1 / 30) : time + delay
					if (j) time = roundUp(time + chargeTime)
					tempHP -= currentDmg
					tempShots[j]++
					tempAmmo -= ammoPerShot1
				}

				for (let k = 0; k <= l; k++) {
					const currentDmg = damages[k]
					if (!currentDmg) continue
					let tempHP2 = tempHP, 
					tempAmmo2 = tempAmmo, 
					tempTime = time,
					delay = recovery || k ? recovery + 1 / 30 : 60 / rof, 
					tempShots2 = tempShots.slice(),
					[chargeTime, ,ammoPerShot1] = weapon.charges[k - 1] || [0, weapon.ammoPerShot]


					for (let i = 0;;i++) {
						tempTime = ammo && tempAmmo2 <= 0 ? roundUp(tempTime + weapon.reload + 1 / 30) : tempTime + delay
						if (k) tempTime = roundUp(tempTime + chargeTime)
						tempShots2[k]++
						if ((tempHP2 -= currentDmg) <= 0) {
							if (tempTime < minTime) minTime = tempTime, bestCombo = tempShots2
							break
						}
						tempAmmo2 -= ammoPerShot1
					}
				}
			}
			result.push([char, minTime, `${levels[i]} charge${bestCombo ? ` (${bestCombo?.reverse()})` : ''}`])
		}
	}
	return result
}

setState()
container.removeAttribute('style')