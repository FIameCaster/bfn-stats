import { useEffect, useRef, useState } from 'react'
import '../../assets/compareMenu.css'
import { stats } from '../../data/stats'
import { MenuState } from "./constants"
import { UpgradeContainer } from '../../components/UpgradeMenu'

const roleMap = {
	"Attack": 0,
  "Defend": 1,
  "Support": 2,
  "Swarm": 3
}

const characters = stats.characters
let oldState: MenuState = [0, new Set<number>(), []]

const copyState = (state: MenuState): MenuState => [
  state[0], new Set<number>([...state[1]]), state[2].slice()
]

export function Menu({ state, closeMenu }: { state?: MenuState, closeMenu: (state?: MenuState) => void }) {

	const [tempState, setState] = useState<MenuState>(state ? copyState(state) : oldState)
	const char = characters[tempState[0]]
	const selectedID = char.owner?.id || char.id
	const updateChar = (newID: number, resetUpgs?: boolean) => {
		const newState = copyState(tempState)
		newState[0] = newID
		if (resetUpgs && newState[1].size) {
			newState[1].clear()
			newState[2] = []
		}
		setState(newState)
	}
	oldState = tempState

	const btns: JSX.Element[] = []
	for (let i = 0; i < 23; i++) btns[i] = <button 
		key={i}
		className={i == selectedID ? 'selected' : ''}
		title={characters[i].name}
		onClick={() => {
			updateChar(i, true)
		}}
		style={{
			backgroundPosition: -5.34 * i + .33 + 'rem .33rem'
		}}
	/>
	
	const updateTemp = (newTemp: number[]) => {
		tempState[2] = newTemp
	}
	const owner = char.owner || char
	const linkTargets = [
		owner.passenger ? char.type ? owner : owner.passenger : null,
		owner.vehicle ? char.health > 200 ? owner : owner.vehicle : null
	],
	getLinkText = (str: string) => str.length < 9 ? str : str.slice(6)
	const container = useRef<HTMLDivElement>(null)

	useEffect(() => {
		container.current.focus()
	}, [])

	let shouldClose = false

	return <div
		ref={container} 
		tabIndex={0} className="menu-container"
		onKeyDown={e => {
			const el = e.currentTarget
			const colCount = Math.floor(Math.min(520, el.getBoundingClientRect().width - 19) / 65)
  		let tempID = selectedID
			if (31 < e.keyCode && e.keyCode < 41) e.preventDefault()

			switch (e.code) {
				case 'ArrowRight':
					if ((tempID + 1) % colCount && tempID < 22) tempID++
					break
				case 'ArrowLeft':
					if (tempID % colCount && tempID) tempID--
					break
				case 'ArrowUp':
					if (tempID < colCount) break
					tempID -= colCount
					break
				case 'ArrowDown':
					if (tempID + colCount > 22) break
					tempID += colCount
					break
				case 'PageUp':
				case 'Home':
					tempID = 0
					break
				case 'PageDown':
				case 'End':
					tempID = 22
					break
				case 'Enter':
					if (document.activeElement == el) {
						closeMenu(copyState(tempState))
						e.preventDefault()
					}
					break
				case 'Escape':
					closeMenu()
			}
			tempID != selectedID && updateChar(tempID, true)
		}}
		onClick={e => {
			if (e.target == e.currentTarget && shouldClose) closeMenu()
		}}
		onMouseDown={e => {
			shouldClose = e.target == e.currentTarget && !e.button
		}}
		onTouchStart={e => {
			shouldClose = e.target == e.currentTarget
		}}
		onMouseUp={e => {
			if (e.target != e.currentTarget) shouldClose = false
		}}
		onTouchEnd={e => {
			if (e.target != e.currentTarget) shouldClose = false
		}}
	>
		<div className="options_co">
			<div className="icon_co">
				<img 
					src="/images/all-icons-large.webp"
					title={char.fullName}
					style={{
						objectPosition: `${-8.2 * char.iconId}rem 0`
					}}
				/>
				<div>
					<h1>{char.fullName}</h1>
					<p>
						Role: {char.role}
						<span style={{
							backgroundPositionX: `${-2.1 * roleMap[char.role]}rem`
						}}/>
					</p>
				</div>
			</div>
			<UpgradeContainer 
				className='upgs_co' upgs={tempState[1]} owner={owner} 
				temp={tempState[2]} updateTemp={updateTemp} 
			/>
			<div className="links_co">
				{linkTargets.map((char, i) => (
					<button 
						className="btn" key={i}
						style={
							char ? {} : { visibility: 'hidden' }
						}
						onClick={() => {
							updateChar(char.id)
						}}
					>
						{char ? char.type || getLinkText(char.name) : 'Text'}
					</button>
				))}
				<button 
					className="btn"
					onClick={() => {
						closeMenu(copyState(tempState))
					}}
				>
					Save
				</button>
			</div>
		</div>
		<div className="classes_co">
			{btns}
			<div>
				<button className="btn" onClick={() => closeMenu()}>
					Close
				</button>
			</div>
		</div>
	</div>
}