import '../../assets/classes.css'
import { A, Outlet, useLocation, useParams, useSearchParams } from "@solidjs/router"
import { Accessor, createContext, createMemo, createRenderEffect, createSignal, For, Index, onCleanup, Show } from "solid-js"
import { stats, Bullet, Character, Missile, Weapon } from "../../data/stats"
import { addUpgrade, upgrades, UpgradeValue } from "../../data/upgrades"
import { createParamSignal } from "../../hooks/createParamSignal"
import { clamp, getBaseParam, getParamStr, round } from "../../utils"
import { getTempParam, getUpgParam, parseTempParam, parseUpgParam } from "../../utils/params"
import { UpgradeContainer } from '../../components/UpgradeMenu'
import { useWidth } from '../../hooks/useWidth'

const [btnState, setBtnState] = createSignal(0)
const [colCount, setColCount] = createSignal<number>()
export const Context = createContext<{
	char?: Accessor<Character>, baseChar?: Accessor<Character>, ability?: Accessor<number>
}>({})
const zoomSignal = createSignal<boolean>()

function Classes() {
	const params = useParams()
	const location = useLocation()
	const [search] = useSearchParams()
	const abilityID = createMemo(() => {
		return location.pathname.includes('/abilities') ? 
			search.a ? +search.a : 0 : null
	})

	const upgs = createParamSignal('u', '', getUpgParam, parseUpgParam, true)
	const temp = createParamSignal('t', '', getTempParam, parseTempParam, true)
	const [zoom, setZoom] = createParamSignal<boolean>('z', '', b => b ? '1' : '', s => !!s, true, zoomSignal)
	const [special, setSpecial] = createParamSignal<boolean>('s', '', b => b ? '1' : '', s => !!s, true)
	
	const charID = () => getCharID(params.name)
	const char = createMemo(() => characters[charID()])
	const owner = createMemo(() => char().owner || char())
	const charUpgrades = createMemo(() => upgrades[owner().id])
	const linkTargets = createMemo(() => [
		owner().passenger ? char().type ? owner() : owner().passenger : null,
		owner().vehicle ? char().health > 200 ? owner() : owner().vehicle : null
	])
	const baseParam = getBaseParam()
	const param1 = () => baseParam() + (zoom() ? '&z=1' : '')
	const param2 = createMemo(() => getParamStr(param1() + (search.u ? '&u=' + search.u : '') + (search.t ? '&t=' + search.t : '') + (special() ? '&s=1' : '')))
	const iconTitles = [
		'Left ability', 'Center ability', 'Right ability'
	]
	const getLink = (id: number) => `/classes/${stats.characters[id].folderName}/${abilityID() == null ? '' : 'abilities'}${getParamStr(param1() + (abilityID() ? '&a=' + abilityID() : ''))}`
	const upgChar = createMemo(() => {
		const id = charID(), char = classData.getClass(id)
		classData.addUpgrades(id, upgs[0](), temp[0](), getSpecialUpg(special(), owner().id))
		return char
	}, null, { equals: false })

	let next: HTMLAnchorElement, prev: HTMLAnchorElement

	const keydown = (e: KeyboardEvent) => {
		if (e.repeat || (e.target as HTMLElement).matches('input')) return
		if (e.keyCode == 37) prev.click()
		else if (e.keyCode == 39) next.click()
	}
	addEventListener('keydown', keydown)
	onCleanup(() => removeEventListener('keydown', keydown))

	return <div id="classes">
		<header class="char">
			<div class="icon_c">
				<img src="/images/all-icons-large.webp" alt={char().name} style={{
					"object-position": -8.2 * char().iconId + 'rem 0'
				}} />
				<div>
					<h1>{char().fullName}</h1>
					<p>
						Role: {char().role}
						<span style={{
							"background-position-x": -2.1 * roleMap[char().role] + 'rem'
						}}/>
					</p>
				</div>
			</div>
			<div class="abilities" style={{
				"--icon": `url(/images/abilities/set${charID()}.webp)`
			}}>
				<Index each={[0,1,2].map(i => {
					return abilityID() == i ? './' + param2() : 'abilities' + getParamStr(param2() + (i ? '&a=' + i : ''))
				})}>{
					(link, i) => <A title={iconTitles[i]} href={link()} classList={{ selected: abilityID() == i }} />
				}</Index>
			</div>
			<div class="nav_c">
				<A
					id="next" class="btn" title="(→)" ref={next}
					href={getLink(nextMap[charID()] ?? charID() + 1)}
				>Next</A>
				<A
					id="prev" class="btn" title="(←)" ref={prev}
					href={getLink(prevMap[charID()] ?? charID() - 1)}
				>Prev</A>
			</div>
		</header>
		<div class="options_c" style={{
			"max-width": (colCount() == 1 ? 146.8 : clamp(54.4, colCount() * 37.5 - 1.6, 146.8)) + 'rem'
		}}>
			<UpgradeContainer upgs={upgs} temp={temp} owner={owner} class="upg-container" />
			<div class="group_c2">
				<div class="upgrades">
					<Show when={upgs[0]().size} fallback="No upgrades selected">
						<Index each={[...upgs[0]()].slice(0, 6)}>{
							id => <div style={{
								"background-position-x": -2 * charUpgrades()[id()]?.[2] + 'em'
							}}/>
						}</Index>
					</Show>
				</div>
				<div>
					<Index each={linkTargets()} >{
						(char, i) => <Show when={char()}>
							<A
								id={i ? 'vehicle' : 'passenger'} class="btn"
								href={`/classes/${char().folderName}/${abilityID() == null ? '' : 'abilities'}${param2()}`}
							>{char().type || char().name}</A>
						</Show>
					}</Index>
				</div>
			</div>
			<div class="group_c3">
				<div class="input-group">
					<label for="zoom">Zooming</label>
					<input type="checkbox" id="zoom" checked={zoom()} onInput={() => setZoom(!zoom())} />
				</div>
				<div class="input-group" style={
					specialUpgs[owner().id] ? {} : { visibility: "hidden" }
				}>
					<label for="starz">{specialUpgs[owner().id]?.[0] ?? 'a'}</label>
					<input type="checkbox" id="starz" checked={special()} onInput={() => setSpecial(!special())} />
				</div>
			</div>
		</div>
		<Context.Provider value={{
			char: upgChar, baseChar: char, ability: abilityID
		}}>
			<Outlet />
		</Context.Provider>
	</div>
}

type Card = ReturnType<ReturnType<typeof createWeaponCards>[0]>

function Cards(props: { cards: Card[] }) {
	const heights = createMemo(() => props.cards.map(card => 45 + card[2]().length * 28))
	const width = useWidth()

	createRenderEffect(() => {
		setColCount(getColCount(heights(), width()))
	})

	const columns = createMemo(() => {
		const getShortestColumn = () => {
			let index = 0, smallest = 1e9
			for (let i = 0; i < count; i++) {
				if (colHeights[i] < smallest) smallest = colHeights[index = i]
			}
			return index
		}

		const count = colCount()
		const columns: Card[][] = []
		const colHeights: number[] = []
		const cards = props.cards
		const height = heights()

		for (let i = 0; i < count; i++) {
			colHeights[i] = 0
			columns[i] = []
		}
		for (let i = 0, l = cards.length; i < l; i++) {
			const card = cards[i]
			const index = getShortestColumn()

			columns[index].push(card)
			colHeights[index] += height[i]
		}
		return columns
	})
	return <main class="content_c" style={{
		"max-width": clamp(39, colCount() * 37.5 + 1.6, 150) + 'rem'
	}}>
		<Index each={columns()}>{
			cards => <div>
				<For each={cards()}>{
					card => <div class="card_c">
						<div class="category_c">
							<Show when={card[1]() > 0}>
								<button
									class="btn card-toggle"
									onClick={() => {
										setBtnState(btnState() == card[1]() ? 0 : btnState() + 1)
										card[3]() // Manually updating the card
									}}
								>{btnText[Math.min(card[1](), btnState())]}</button>
							</Show>
							{ card[0]() }
						</div>
						<div>
							<For each={card[2]()}>{
								row => <div class="row_c">
									<label>{row[0]}</label>
									<span style={
										row[2]() ? { "background-color": row[2]() } : {}
									}>{ row[1]() }</span>
								</div>
							}</For>
						</div>
					</div>
				}</For>
			</div>
		}</Index>
	</main>
}

const syncNavbarState = (newVals: readonly [number, boolean, boolean]) => [dist, crit, move] = newVals
const syncZoom = (newZoom: boolean) => zoom = newZoom

const characters = stats.characters

const roleMap = {
	"Attack": 0,
	"Defend": 1,
	"Support": 2,
	"Swarm": 3
}

const nextMap = [,,,,,,,,,,,,,,,,,,,,,,0,8,13,19,8,19,22],
prevMap = [22,,,,,,,,,,,,,,,,,,,,,,,6,11,17,6,17,20]

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
				if (upg?.[4]) addUpgrade(owner, upg[4])
				if (upg?.[5]?.[tempUpgs[id]]) addUpgrade(owner, upg[5][tempUpgs[id]])
			}
			specialUpg && addUpgrade(owner, specialUpg)
		}
	}
})()

const getColCount = (heights: number[], width: number) => {
	const totalHeight = heights.reduce((a, b) => a + b, 0)
	return clamp(1, Math.floor(Math.min((width - 16) / 266, totalHeight ** .75 / 55)), 5)
}

const unitText = [
	'', 'm', 's', 'm/s', 'm²', '°', 'm/s²', '%'
]


const specialUpgs: [string, UpgradeValue][] = [
	['Pea Suped', {
		"primary_rof": 120,
		"modifiers_4": 1.1,
		movement: {...[,1.65,1,1,6.72]},
	}],,
	['Butter Beacon', {
		"modifiers_6": 1.25
	}],,,,,,,
	['Jinxed', {
		"modifiers_7": 1.3
	}],,,
	['Facing target', {
		"abilities_2_weapon_trapezoid": [1,14,0,.5,1,1]
	}],,
	['Tagged', {
		"abilities_2_weapon": {
			rof: 324.3,
			homing: [0,0,180,90,15,1/3]
		},
		"abilities_2_weapon_recoil_4": 1.2719703977798333,
		"abilities_2_weapon_projectiles_0_splashDmg": 25
	}],,,,
	['Space Force', {
		"vehicle_modifiers_4": 1.25,
		"vehicle_primary_rof": 910,
		"vehicle_primary_recoil_0": [1.6,.52,.32,-.06,.06,6],
		"passenger_primary_rof": 460
	}],,
	['Heavy Helper', {
		"primary_rof": 112.5
	}],
	['Unaligned', {
		"passenger_primary": {
			rof: 300,
			homing: null
		},
		"abilities_2": {
			spottingRange: null
		}
	}]
]

export const getSpecialUpg = (special: boolean, id: number) => {
	if (!special) return null
	return specialUpgs[id]?.[1]
}

const btnText = ['1st', '2nd', '3rd']

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
	const [category, setCategory] = createSignal<string>()
	const [maxIndex, setMax] = createSignal<0 | 1 | 2>()
	const rows = labels.map((label, i) => {
		let prevStat: number | string

		const [statText, setStat] = createSignal<string>()
		const [color, setColor] = createSignal<string>()
		const rowData = [label, statText, color] as const
		
		return (char: StatSource, baseChar: StatSource, prop: Category, baseProp: Category, index: number, isSameProp: boolean) => {
			const stat = getStats[index][i](prop, char)
			if (stat == null) return
			if (prevStat == (prevStat = stat) && isSameProp) return rowData
			if (typeof stat == 'string') {
				setStat(stat)
				setColor('')
				return rowData
			}
			setStat(round(stat, decimals[i]) + unitText[units[i] || 0])
			const baseStat = baseProp ? getStats[index][i](baseProp, baseChar) : null
			if (baseStat == null || baseStat == stat || typeof baseStat == 'string') {
				setColor('')
			}
			else setColor((
				colors[i] ^ +(Math.abs(stat) > Math.abs(baseStat)) ? 'rgba(30, 100, 0, ' : 'rgba(120, 40, 0, '
				) + Math.min(1, (Math.max(Math.abs(baseStat / stat), Math.abs(stat / baseStat)) - 1) * .9 + .1) + ')')
				
			return rowData
		}
	})
	let prevBase: Category, rowCount = labels.length,
	char: StatSource, baseChar: StatSource, currentProp: Category

	const [rowData, setRowData] = createSignal<ReturnType<typeof rows[0]>[]>(),
	update = (newChar?: StatSource, newBase?: StatSource) => {
		if (newChar) {
			char = newChar
			baseChar = newBase
			setMax(prop[1]?.(char) ? prop[2]?.(char) ? 2 : 1 : 0)
		}
		const currentIndex = Math.min(maxIndex(), btnState())
		currentProp = prop[currentIndex](char)
		if (!currentProp) return
		setCategory(getName(currentProp))
		const isSameProp = prevBase == (prevBase = prop[currentIndex](baseChar))
		const newData: ReturnType<typeof rows[0]>[] = []
		for (let i = 0, j = 0; i < rowCount; i++) {
			const signal = rows[i](char, baseChar, currentProp, prevBase, currentIndex, isSameProp)
			if (signal) newData[j++] = signal
		}
		setRowData(newData)
		return result
	},
	result = [
		category, maxIndex, rowData, update
	] as const

	return update
}

let dist: number, crit: boolean, move: boolean, zoom: boolean

function createWeaponCards<StatSource>(getWeapon: (char: StatSource) => Weapon) {
	return [
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
				(_, char) => getWeapon(char).getSplash(0),
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
		),
		createStatCard<number[], StatSource>(
			[char => getWeapon(char)?.trapezoid],
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
}

export { classData, dist, move, crit, zoom, createStatCard, createWeaponCards, Classes, getCharID, unitText, getColCount, specialUpgs, syncNavbarState, Cards, syncZoom, zoomSignal }