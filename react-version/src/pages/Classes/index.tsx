import { Outlet, useParams } from 'react-router-dom'
import { stats } from '../../data/stats'
import '../../assets/classes.css'
import { Character } from '../..'
import { addUpgrade, upgrades, UpgradeValue } from '../../data/upgrades'
import { getTempParam, getUpgParam, parseTempParam, parseUpgParam } from '../../utils/params'
import { useUrlState } from '../../hooks/useUrlState'
import { Suspense, useMemo, useState } from 'react'
import { clamp, round } from '../../utils'

export function Classes() {
	const upgs = useUrlState(new Set<number>(), 'u', getUpgParam, parseUpgParam, { replace: true })
	const temp = useUrlState<number[]>([], 't', getTempParam, parseTempParam, { replace: true })
	const zoom = useUrlState(false, 'z', b => b ? '1' : '', s => !!s, { replace: true })
	const btnState = useState(0)
	const special = useUrlState(false, 's', b => b ? '1' : '', s => !!s, { replace: true })
	const charID = getCharID(useParams().name)

	return <div id="classes">
		<Suspense fallback={<div></div>}>
			<Outlet context={[upgs, temp, zoom, btnState, special, charID]} />
		</Suspense>
	</div>
}

const characters = stats.characters

export const getCharID = (() => {
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

export const classData = (() => {
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

export const getMaxColCount = (heights: number[]) => Math.min(5, Math.floor(heights.reduce((a, b) => a + b, 0) ** .75 / 55))

export const getColCount = (heights: number[], width: number) => {
	const totalHeight = heights.reduce((a, b) => a + b, 0)
	return clamp(1, Math.floor(Math.min((width - 16) / 266, totalHeight ** .75 / 55)), 5)
}

export const unitText = [
	'', 'm', 's', 'm/s', 'm²', '°', 'm/s²', '%'
]

export type Card<T, S> = [
	((char: S) => T)[],
	(prop?: T) => string,
	string[],
	((prop: T, char: S) => number | string)[][],
	number[], number[], number[]
]

export const specialUpgs: [string, UpgradeValue][] = [
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

export function createCards<T>(
	cards: Card<unknown, T>[], source: T, baseSource: T, btnIndex: number, 
	setIndex: (val: number) => void, upgs: Set<number>, temp: number[], dist: number, 
	crit: boolean, move: boolean, zoom: boolean, noSpecial: boolean, keyPrefix = ''
) {
	return useMemo(() => {
		const heights: number[] = []
		return [heights, cards.map((card, i) => {
			const [
				prop, getName, labels,
				getStats, decimals, colors, units
			] = card
	
			let index = 0
	
			const btn = !prop[1]?.(source) || (() => {
				const maxIndex = prop[2]?.(source) ? 2 : 1
				index = Math.min(btnIndex, maxIndex)
	
				return <button 
					className="btn card-toggle"
					onClick={() => setIndex(index == maxIndex ? 0 : index + 1)}
				>
					{btnText[index]}
				</button>
			})()
	
			// Typecasting here won't cause issues since the cards are typed properly
			const currentProp = prop[index](source) as never
			if (!currentProp) return
			heights[i] = 45
			const baseProp = prop[index](baseSource) as never
	
			return <div className="card_c" key={keyPrefix + i}>
				<div className="category_c">{btn}{getName(currentProp)}</div>
				<div>{
					labels.map((label, j) => {
						const statFunc = getStats[index][j]
						const stat = statFunc(currentProp, source)
						if (stat == null) return
						heights[i] += 28
	
						const baseStat = baseProp ? statFunc(baseProp, baseSource) : null
						const noColor = baseStat == null || baseStat == stat || typeof baseStat == 'string' || typeof stat == 'string'
	
						const color: React.CSSProperties = noColor ? {} : {
							backgroundColor: (
								colors[j] ^ +(Math.abs(stat) > Math.abs(baseStat)) ? 'rgba(30, 100, 0, ' : 'rgba(120, 40, 0, '
							) + Math.min(1, (Math.max(Math.abs(baseStat / stat), Math.abs(stat / baseStat)) - 1) * .9 + .1) + ')'
						}
	
						const statText = typeof stat == 'string' ? stat : round(stat, decimals[j]) + unitText[units[j] || 0]
	
						return <div className="row_c" key={j}>
							<label>{label}</label>
							<span style={color}>{statText}</span>
						</div>
					})
				}</div>
			</div>
		})] as const
	}, [upgs, temp, btnIndex, zoom, dist, move, crit, baseSource, noSpecial])
}