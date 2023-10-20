import { useRef, useState } from "react"
import { Character } from "../../data/stats"
import '../../assets/upgradeMenu.css'
import { upgrades, Upgrade } from "../../data/upgrades"
import { useDropdownState } from "../../hooks/useDropdownState"
import { useStorageState } from "../../hooks/useStorageState"
import { getTempParam, getUpgParam, parseTempParam, parseUpgParam } from "../../utils/params"
import { upgradeNames, upgradeText } from "./constants"

const staticRoles = [
	'none',
	'url("/images/Perk_Attack.webp")',
	'url("/images/Perk_Defend.webp")',
	'url("/images/Perk_Support.webp")',
	'url("/images/all-icons-large.webp")',
]

export function PerkList({ cost, setCost, upgs, owner, maxHeight, setOpen, temp, updateTemp }: { cost: number, setCost: (val: number) => void, upgs: Set<number>, owner: Character, maxHeight: number, setOpen: (val: boolean) => void, temp: number[], updateTemp: (newVal: number[]) => void }) {
	const roleImages = [owner, owner.vehicle, owner.passenger].map(char => {
		return char && `url("/images/abilities/set${char.id}.webp")`
	})

	const charUpgrades = upgrades[owner.id]
	const [opened, setOpened] = useState<boolean[]>(new Array(charUpgrades.length).fill(false))

	const getRoleImg = (num: number) => {
		return staticRoles[num] || roleImages[Math.floor((num - 5) / 3)]
	}

	const getOffset = (num: number) => {
		if (num < 4) return 0
		if (num > 4) return -1.625 * ((num - 2) % 3)
		return -1.625 * owner.iconId
	}

	return <ul className="perk-list" style={{
		maxHeight: maxHeight + 'px'
	}} >
		{
			charUpgrades.map((upg, i) => (
				<li key={i} className={
					`${opened[i] ? 'expanded ' : ''}${upg[3] ? '' : 'none '}${upgs.has(i) ? 'selected ' : ''}${cost + upg[1] > 7 ? 'expensive' : ''}`.trim()
				}>
					<div className="perk">
						<button
							onClick={() => {
								if (upgs.delete(i)) setCost(cost - upg[1])
								else {
									if (cost + upg[1] > 7) return
									upgs.add(i)
									setCost(cost + upg[1])
								}
							}}
						>
							<span 
								className="perk-type" style={{
									backgroundPositionX: -2 * upg[2] + 'em'
								}}
							/>
							{upgradeNames[upg[0]]}
							<span className="perk-role-container">
								<span 
									className="perk-role"
									style={{
										backgroundImage: getRoleImg(upg[3]),
										backgroundPositionX: `${getOffset(upg[3])}em`
									}}
								/>
							</span>
							<span className="cost">{upg[1]}</span>
						</button>
						<button 
							className="perk-toggle"
							onClick={e => {
								const newOpen = opened.slice()
								newOpen[i] = !newOpen[i]
								setOpened(newOpen)
								if (newOpen[i]) setTimeout(() => {
									(e.target as Element).parentElement.nextElementSibling.scrollIntoView({ "block": "nearest" })
								})
							}}
						/>
					</div>
					<div className="perk-info">{upgradeText[upg[0]]}</div>
				</li>
			))
		}
		<li>
			<BuildContainer 
				id={owner.id} upgs={upgs} temp={temp} updateTemp={updateTemp}
				setCost={setCost} maxHeight={maxHeight}
			/>
			<button className="btn perk-close" onClick={() => {
				upgs.clear()
				setCost(0)
			}}>
				Clear
			</button>
			<button className="btn perk-close" onClick={() => setOpen(false)}>
				Close
			</button>
		</li>
	</ul>
}

export function TempList({ upgs, owner, temp, updateTemp }: { upgs: Set<number>, owner: Character, temp: number[], updateTemp: (newVal: number[]) => void }) {
	const controls: JSX.Element[] = []
	const charUpgs = upgrades[owner.id]
	const [tempState, setTemp] = useState(temp)

	let i = 0
	for (const id of upgs) {
		const tempUpg = charUpgs[id][5]
		if (!tempUpg) continue
		
		controls[i++] = (
			<li key={id} className={tempUpg[1] ? 'range' : 'input-group'}>
				<label htmlFor={'input' + i}>{upgradeNames[charUpgs[id][0]]}</label>
				{ !!tempUpg[1] && <label htmlFor={'input' + i}>Stage: {tempState[id] || 0}</label> }
				<input 
					type={tempUpg[1] ? 'range' : 'checkbox'}
					id={'input' + i}
					max={tempUpg.length - 1}
					{
						...(tempUpg[1] ? { value: tempState[id] || 0 } : { checked: tempState[id] == 0 })
					}
					onChange={e => {
						const newTemp = tempState.slice()
						newTemp[id] = tempUpg[1] ? +e.target.value : e.target.checked ? 0 : null
						updateTemp(newTemp)
						setTemp(newTemp)
					}}
				/>
			</li>
		)
	}

	return <ul className="temp-list">
		{controls}
	</ul>
}

function BuildContainer({ id, upgs, temp, updateTemp, setCost, maxHeight }: { id: number, upgs: Set<number>, temp: number[], updateTemp: (newVal: number[]) => void, setCost: (val: number) => void, maxHeight: number }) {
	const [open, setOpen] = useDropdownState('#builds')

	const elRef = useRef<HTMLDivElement>(null)

	return <div
		ref={elRef}
		className="select" id="builds"
		onKeyDown={e => {
			e.code == 'Escape' && setOpen(false)
			e.stopPropagation()
		}}
	>
		<button>Builds</button>
		{
			open && <ul className="build-list" style={{
				maxHeight: maxHeight - elRef.current.getBoundingClientRect().height - 10 + 'px'
			}}>{
				[0,1,2].map(i => <BuildItem key={i} i={i} id={id} upgs={upgs} temp={temp} setCost={setCost} updateTemp={updateTemp} />)
			}</ul>
		}
	</div>
}

function BuildItem({ i, id, temp, upgs, setCost, updateTemp }: { i: number, id: number, upgs: Set<number>, temp: number[], updateTemp: (newVal: number[]) => void, setCost: (val: number) => void }) {
	const icons: JSX.Element[] = [],
	[build, setBuild] = useStorageState(`build${id.toString(36)}${i}`),
	buildUpgs = parseUpgParam(build.split('.')[0]),
	charUpgrades = upgrades[id]
	let cost = 0, count = 0

	for (const num of buildUpgs) {
		if (count++ < 5) icons[count - 1] = <div key={count} style={{
			backgroundPositionX: `${-2 * charUpgrades[num][2]}em`
		}}/>
		cost += charUpgrades[num][1]
	}

	return <li>
		<div className="build">{
			count ? icons : "Empty build"
		}</div>
		<button 
			className="btn"
			onClick={() => {
				setBuild(upgs.size ? `${getUpgParam(upgs)}.${getTempParam(temp)}` : '')
			}}
		>
			Overwrite
		</button>
		<button
			className="btn"
			onClick={() => {
				upgs.clear()
				for (const num of buildUpgs) upgs.add(num)
				updateTemp(parseTempParam(build.split('.')[1] || ''))
				setCost(cost)
			}}
		>
			Select ({cost}/7)
		</button>
	</li>
}
