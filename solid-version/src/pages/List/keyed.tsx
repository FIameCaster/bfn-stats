import '../../assets/list.css'
import { A, useSearchParams } from '@solidjs/router'
import { For, createMemo, Accessor, Index, Signal, batch } from 'solid-js'
import { createSignal } from 'solid-js'
import { createParamSignal } from '../../hooks/createParamSignal'
import { stats, Bullet, Character, Missile } from '../../data/stats'
import { labels, decimals, units, unitText, categories } from './constants'
import { updateTitle } from '../../utils/updateTitle'
import { getNavbarSettings } from '../../components/Navbar'
import { round } from '../../utils'
import { getCompareLink } from '../../utils/getCompareLink'
import { getBaseParam } from '../../utils'
import { useWidth } from '../../hooks/useWidth'

export function List() {
	const [team, setTeam] = createParamSignal<string>('t', '0', s => s, s => s)
	const [category, setCategory] = createParamSignal<string>('g', '0', s => s, s => s, false)
	const [sort, setSort] = createParamSignal<number>('s', '1', n => ''+n, s => +s)
	const [ascending, setAscending] = createParamSignal<boolean>('o', '', b => b ? '1' : '', s => !!s)
	let options: HTMLHeadingElement

	const [, setSearch] = useSearchParams()
	updateTitle('BFN Stats')

	const width = useWidth()
	const cLabels = createMemo(() => {
		const categoryVal = categories[+category()],
		newLabels = ["Character"]
		for (let i = 0, l = categoryVal.length; i < l; i++) newLabels[i + 1] = labels[categoryVal[i]]
		return newLabels
	})

	return <div id="list">
		<header class="options" ref={options} style={{
			"max-width": width() - 32 + 'px'
		}}>
			<label for="team">Team</label>
			<div class="select">
				<select id="team" value={team()} onChange={e => {
					setTeam(e.currentTarget.value)
				}}>
					<option value="0">Both</option>
					<option value="1">Plants</option>
					<option value="2">Zombies</option>
				</select>
			</div>
			<label for="category">Category</label>
			<div class="select">
				<select id="category" value={category()} onChange={e => {
					batch(() => {
						if (sort()) {
							setAscending(false)
							setSort(1)
						}
						setCategory(e.currentTarget.value)
					})
				}}>
					<option value="0">Damage output</option>
					<option value="1">Bullet speed</option>
					<option value="2">Ammo</option>
					<option value="3">Overheating</option>
					<option value="4">1st charge</option>
					<option value="5">2nd charge</option>
					<option value="6">3rd charge</option>
					<option value="7">Survivability</option>
					<option value="8">Mobility</option>
					<option value="9">Recoil</option>
					<option value="10">Recoil (zoom)</option>
					<option value="11">Recoil angle</option>
					<option value="12">Dispersion</option>
					<option value="13">Dispersion (zoom)</option>
					<option value="14">Gunsway</option>
					<option value="15">Gunsway (zoom)</option>
				</select>
			</div>
		</header>
		<main class="table">
			<table>
				<thead>
					<tr>
						<Index each={cLabels()}>{
							(label, index) => <th
								tabIndex="0" onKeyUp={e => {
									if (e.code == 'Space' || e.code == 'Enter') e.currentTarget.click()
								}}
								onKeyDown={e => {
									e.code == 'Space' && e.preventDefault()
								}}
								aria-sort={sort() == index ? (ascending() ? 'ascending' : 'descending') : 'none'}
								onClick={() => {
									if (sort() == index) setAscending(!ascending())
									else {
										batch(() => {
											setAscending(false, false)
											setSort(index, false)
											// To update multiple parameters at the same time, both need to be set at the same time
											setSearch({ o: '', s: index == 1 ? '' : ''+index }, { replace: true })
										})
									}
								}}
							>
								<div>{ label() }</div>
							</th>
						}</Index>
					</tr>
				</thead>
				<TableBody category={category} sort={sort} ascending={ascending} team={team} />
			</table>
		</main>
	</div>
}

const TableBody = ({ category, sort, ascending, team }: { category: Accessor<string>, sort: Accessor<number>, ascending: Accessor<boolean>, team: Accessor<string> }) => {
	const characters = stats.compareChars

	const currentStats = createMemo(() => {
		[distance, crit, move] = getNavbarSettings()
		const categoryVal = categories[+category()]
		const l = categoryVal.length,
		currentStats: number[][] = new Array(34)
		for (let i = 0; i < 34; i++) {
			currentStats[i] = new Array(l)
			for (let j = 0; j < l; j++)
				currentStats[i][j] = funcs[categoryVal[j]](characters[i])
		}
		return currentStats
	})

	const order = createMemo(() => {
		const order: [string | number, number][] = new Array(34),
		sortID = sort(), ascendingVal = ascending(),
		defaltValue = ascendingVal ? Infinity : -Infinity,
		stats = currentStats()

		if (sortID) for (let i = 0; i < 34; i++)
			order[i] = [stats[i][sortID - 1] ?? defaltValue, i]
		else for (let i = 0; i < 34; i++)
			order[i] = [characters[i].name, i]

		order.sort(sortingFuncs[(sortID ? 0 : 2) + +ascendingVal])

		return order
	})

	const categoryData = createMemo(() => {
		const categoryVal = categories[+category()]
		const l = categoryVal.length,
		currentDecimals: number[] = new Array(l),
		currentUnits: string[] = new Array(l)

		for (let i = 0; i < l; i++) {
			currentDecimals[i] = decimals[categoryVal[i]]
			currentUnits[i] = unitText[units[categoryVal[i]]]
		}
		return [currentDecimals, currentUnits] as const
	})

	const tableData: [Character, Signal<string[]>][] = Array.from({ length: 34 }, (_, i) => [characters[i], createSignal([])])

	const sortedTableData = createMemo(() => {
		const [currentDecimals, currentUnits] = categoryData()
		const newData: [Character, Signal<string[]>][] = []
		const teamStr = [, 'Plant', 'Zombie'][+team()]
		const orderValue = order(), l = currentDecimals.length
		const stats = currentStats()
		for (let i = 0, j = 0; i < 34; i++) {
			const index = orderValue[i][1], char = characters[index]
			if (teamStr && char.team != teamStr) continue
			const charStats = stats[index]
			const [, signal] = newData[j++] = tableData[index]
			const text: string[] = new Array(l)

			for (let j = 0; j < l; j++) {
				const stat = charStats[j]
				text[j] = stat == null ? '' : round(stat, currentDecimals[j]) + currentUnits[j]
			}
			signal[1](text)
		}
		return newData
	})

	const param = getBaseParam()

	return <tbody>
		<For each={sortedTableData()}>{
			data => {
				const [char, text] = data

				return <tr>
					<td>
						<A href={getCompareLink(char, param())} title={char.fullName} style={{
							"background-position-x": -3 * char.iconId + 'rem'
						}} />
					</td>
					<td>{ char.fullName }</td>
					<For each={text[0]()}>{
						text => <td>{text}</td>
					}</For>
				</tr>
			}
		}</For>
	</tbody>
}

// This is just a copy of the state for fast access due to performance
let distance: number, crit: boolean, move: boolean

const sortingFuncs = [
	(a: any, b: any) => b[0] - a[0],
	(a: any, b: any) => a[0] - b[0],
	(a: any, b: any) => b[0] > a[0] ? 1 : -1,
	(a: any, b: any) => a[0] > b[0] ? 1 : -1,
]

const funcs = [
	(char: Character) => char.primary.getDPS(distance, crit, move),//DPS 0
	(char: Character) => char.primary.effectiveRof * 60,//Rate of fire 1
	(char: Character) => char.primary.getDamage(distance, 0, crit, move),//Damage/shot 2
	(char: Character) => char.primary.getDPS(distance, crit, move, true),//Sustainable DPS 3
	(char: Character) => char.primary.projectiles[0]?.startSpeed,//Launch velocity 4
	(char: Character) => char.primary.getSplash(0),//Splash damage 5
	(char: Character) => char.primary.projectiles[0]?.blastRadius || null,//Splash radius 6
	(char: Character) => char.primary.trapezoid?.[0],//Spray damage 7
	(char: Character) => char.primary.sprayRange || null,//Spray range 8
	(char: Character) => (char.primary.projectiles[0] as Bullet)?.dragStart || null,//Drag start 9
	(char: Character) => (char.primary.projectiles[0] as Bullet)?.dragEnd || null,//Drag end 10
	(char: Character) => (char.primary.projectiles[0] as Bullet)?.endSpeed,//Post drag velocity 11
	(char: Character) => (char.primary.projectiles[0] as Missile)?.engineAccel,//Acceleration 12
	(char: Character) => (char.primary.projectiles[0] as Missile)?.maxSpeed,//Max velocity 13
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
		(char: Character) => char.primary.getSplash(i + 1),//Splash damage 37
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