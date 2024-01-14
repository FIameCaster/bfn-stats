import { upgrades, getUpgPoints } from '../../data/upgrades'
import { Character } from '../../data/stats'
import { useDropdownState } from '../../hooks/useDropdownState'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'

const PerkList = lazy(() => import('./lists').then(module => ({ default: module.PerkList })))
const TempList = lazy(() => import('./lists').then(module => ({ default: module.TempList })))

export function UpgradeContainer({ upgs, owner, className, temp, updateTemp, updateUpgs }: { upgs: Set<number>, owner: Character, className: string, temp: number[], updateTemp: (newVal: number[]) => void, updateUpgs?: (newVal: Set<number>) => void }) {
	// Adding cost here instead of in UpgradeMenu so both components rerender every time
	const newCost = getUpgPoints(upgs, upgrades[owner.id])
	const [cost, setCost] = useState(newCost)
	if (newCost != cost) setCost(newCost)

	const updateCost = (newVal: number) => {
		setCost(newVal)
		updateUpgs?.(new Set(upgs))
	}

	useEffect(() => {
		const timeout = setTimeout(() => import('./lists'), 500)
		return () => clearTimeout(timeout)
	}, [])

	return <div className={className}>
		<UpgradeMenu upgs={upgs} owner={owner} cost={cost} setCost={updateCost} temp={temp} updateTemp={updateTemp} />
		<TempMenu upgs={upgs} owner={owner} temp={temp} updateTemp={updateTemp} />
	</div>
}

function UpgradeMenu({ upgs, owner, cost, setCost, temp, updateTemp }: { upgs: Set<number>, owner: Character, cost: number, setCost: (val: number) => void, temp: number[], updateTemp: (newVal: number[]) => void }) {
	const [open, setOpen] = useDropdownState('#upg')
	const elRef = useRef<HTMLDivElement>(null)

	return <div
		ref={elRef}
		className="select" id="upg"
		onKeyDown={e => {
			e.code == 'Escape' && setOpen(false)
			e.stopPropagation()
		}}
	>
		<button>Upgrades ({cost}/7)</button>
		{
			open && <Suspense fallback={<ul className='perk-list'></ul>}>
				<PerkList
					cost={cost} setCost={setCost} upgs={upgs} owner={owner}
					setOpen={setOpen} temp={temp} updateTemp={updateTemp} maxHeight={
						Math.min(innerHeight - elRef.current.getBoundingClientRect().top - 40, 532)
				}/>
			</Suspense>
		}
	</div>
}

function TempMenu({ upgs, owner, temp, updateTemp }: { upgs: Set<number>, owner: Character, temp: number[], updateTemp: (newVal: number[]) => void }) {
	const [open, setOpen] = useDropdownState('#temp')
	let isHidden = true
	for (const id of upgs) if (upgrades[owner.id][id]?.[5]) {
		isHidden = false
		break
	}

	return <div
		className="select" id="temp"
		onKeyDown={e => {
			e.code == 'Escape' && setOpen(false)
			e.stopPropagation()
		}}
		style={
			isHidden ? { visibility: 'hidden' } : {}
		}
	>
		<button>Temporary upgrades</button>
		{
			open && <Suspense fallback={<ul className='temp-list'></ul>}>
				<TempList upgs={upgs} temp={temp} owner={owner} updateTemp={updateTemp} />
			</Suspense>
		}
	</div>
}

