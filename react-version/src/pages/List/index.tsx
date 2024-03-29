import '../../assets/list.css'
import { useMemo, useEffect, useRef } from 'react'
import { labels, decimals, units, unitText, categories } from './constants'
import { useStore } from '../../components/Navbar/settingStore'
import { stats, Bullet, Character, Missile } from '../../data/stats'
import { getSettingsParam, round } from '../../utils'
import { useUrlState } from '../../hooks/useUrlState'
import { getCompareLink } from '../../utils/getCompareLink'
import { updateTitle } from '../../utils/updateTitle'
import { Link } from 'react-router-dom'

const getWidth = () => document.documentElement.getBoundingClientRect().width

export function List() {
	const [team, setTeam] = useUrlState('0', 't', str => str, str => str, { replace: true })
	const [category, setCategory] = useUrlState('0', 'g', str => str, str => str, { replace: false })
	const [sort, setSort] = useUrlState(1, 's', v => v + '', s => +s, { replace: true })
	const [ascending, setAscending] = useUrlState(false, 'o', b => b ? '1' : '', s => !!s, { replace: true })
	const options = useRef<HTMLHeadingElement>()

	useEffect(() => {
		const resize = () => options.current.style.maxWidth = getWidth() - 32 + 'px'
		addEventListener('resize', resize)
		return () => removeEventListener('resize', resize)
	}, [])

	return (
		<div id='list'>
			<header className='options' ref={options} style={{
				maxWidth: getWidth() - 32 + 'px'
			}}>
				<label htmlFor="team">Team</label>
				<div className="select">
					<select id="team" value={team} onChange={e => setTeam(e.target.value)}>
						<option value="0">Both</option>
						<option value="1">Plants</option>
						<option value="2">Zombies</option>
					</select>
				</div>
				<label htmlFor="category">Category</label>
				<div className="select">
					<select id="category" value={category} onChange={e => {
						if (sort) {
							setAscending(false)
							setSort(1)
						}
						setCategory(e.target.value)
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
			<Table {...{ category, team, sort, setSort, ascending, setAscending }} />
		</div>
	)
}

function Table({ category, team, sort, setSort, ascending, setAscending }: {category: string, team: string, sort: number, setSort: (newState: number) => void, ascending: boolean, setAscending: (newState: boolean) => void}) {

	const commonProps = {
		categoryID: category, sort, ascending
	}

	return <main className='table'>
		<table>
			<Head {...{ ...commonProps, setSort, setAscending }} />
			<Body {...commonProps} team={team} />
		</table>
	</main>
}

function Head({ categoryID, sort, ascending, setSort, setAscending }: { categoryID: string, sort: number, ascending: boolean, setSort: (state: number) => void, setAscending: (newState: boolean) => void }) {
	const cells: React.ReactElement[] = [],
	category = categories[categoryID], length = category.length + 1

	const headerProps = {
		tabIndex: 0,
		onKeyUp: (e: React.KeyboardEvent) => {
			if (e.code == 'Space' || e.code == 'Enter') (e.target as HTMLTableCellElement).click()
		},
		onKeyDown: (e: React.KeyboardEvent) => {
			e.code == 'Space' && e.preventDefault()
		}
	}

	for (let i = 0; i < length; i++) cells[i] = (
		<th key={i} {...headerProps} colSpan={i ? 1 : 2} aria-sort={sort == i ? (ascending ? 'ascending' : 'descending') : 'none'} onClick={() => {
			if (sort == i) setAscending(!ascending)
			else {
				setAscending(false)
				setSort(i)
			}
		}}>
			<div>{labels[category[i - 1]] || 'Character'}</div>
		</th>
	)

	return <thead>
		<tr>{cells}</tr>
	</thead>
}

const sortingFuncs = [
	(a: any, b: any) => b[0] - a[0],
	(a: any, b: any) => a[0] - b[0],
	(a: any, b: any) => b[0] > a[0] ? 1 : -1,
	(a: any, b: any) => a[0] > b[0] ? 1 : -1,
]

// This is just a copy of the state for fast access due to performance
let distance: number, crit: boolean, move: boolean

function Body({ categoryID, sort, ascending, team }: { categoryID: string, sort: number, ascending: boolean, team: string }) {
	const characters = stats.compareChars
	const [settings] = useStore();

	// Syncing copy of state
	({distance, crit, move} = settings)

	updateTitle('BFN Stats')

	const params = getSettingsParam(distance, crit, move)
	const category = categories[+categoryID]

	const currentStats = useMemo(() => {
		const l = category.length,
		currentStats: number[][] = new Array(34)
		for (let i = 0; i < 34; i++) {
			currentStats[i] = new Array(l)
			for (let j = 0; j < l; j++)
				currentStats[i][j] = funcs[category[j]](characters[i])
		}
		return currentStats
	}, [categoryID, distance, crit, move])


	const order = useMemo(() => {
		const order: [string | number, number][] = [],
		defaltValue = ascending ? Infinity : -Infinity

		if (sort) for (let i = 0; i < 34; i++)
			order[i] = [currentStats[i][sort - 1] ?? defaltValue, i]
		else for (let i = 0; i < 34; i++)
			order[i] = [characters[i].name, i]

		order.sort(sortingFuncs[(sort ? 0 : 2) + +ascending])

		return order
	}, [sort, category, ascending, distance, crit, move ])

	const rows: React.ReactElement[] = [],
	teamStr = [, 'Plant', 'Zombie'][team],
	currentDecimals: number[] = [],
	currentUnits: string[] = []
	for (let i = 0; i < category.length; i++) {
		currentDecimals[i] = decimals[category[i]]
		currentUnits[i] = unitText[units[category[i]]]
	}

	for (let i = 0, j = 0; i < 34; i++) {
		const index = order[i][1],
		char = characters[index], include = !teamStr || char.team == teamStr
		if (!include) continue
		const data = currentStats[index]
		rows[j++] = <Row {...{ char, data, units: currentUnits, decimals: currentDecimals, key: index, params }} />
	}

	return <tbody>
		{rows}
	</tbody>
}


function Row({ char, data, decimals, units, params }: { char: Character, data: number[], decimals: number[], units: string[], params: string}) {
	const cells: React.ReactElement[] = []

	for (let i = 0; i < data.length; i++) cells[i] = (
		<td key={i}>
			{data[i] == null ? '' : round(data[i], decimals[i]) + units[i]}
		</td>
	)

	return <tr>
		<td>
			<Link to={getCompareLink(char, params)} title={char.fullName} style={{
				backgroundPositionX: -3 * char.iconId + 'rem'
			}} />
		</td>
		<td>{char.fullName}</td>
		{cells}
	</tr>

}

const funcs = [
	(char: Character) => char.primary.getDPS(distance, crit, move),//DPS 0
	(char: Character) => char.primary.effectiveRof * 60,//Rate of fire 1
	(char: Character) => char.primary.getDamage(distance, 0, crit, move),//Damage/shot 2
	(char: Character) => char.primary.getDPS(distance, crit, move, true),//Sustainable DPS 3
	(char: Character) => char.primary.projectiles[0]?.startSpeed,//Launch velocity 4
	(char: Character) => char.primary.getSplash(0),//Splash damage 5
	(char: Character) => char.primary.projectiles[0]?.blastRadius || null,//Splash radius 6
	(char: Character) => char.primary.getSpray(distance, crit),//Spray damage 7
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