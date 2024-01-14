import { batch, createMemo, createSignal, Index, onMount } from "solid-js";
import { menuState } from ".";
import { UpgradeContainer } from "../../components/UpgradeMenu";
import { stats } from "../../data/stats";
import '../../assets/compareMenu.css'

const characters = stats.characters
const roleMap = {
	"Attack": 0,
  "Defend": 1,
  "Support": 2,
  "Swarm": 3
}

const [charID, setCharID] = createSignal(0)
const [temp, setTemp] = createSignal<number[]>([])
const [upgs, setUpgs] = createSignal(new Set<number>())

export function Menu(props: { close: (id?: number, upgs?: Set<number>, temp?: number[]) => void }) {

	let shouldClose = false,
	container: HTMLDivElement

	const char = () => characters[charID()]
	const owner = createMemo(() => char().owner || char())
	const linkTargets = createMemo(() => [
		owner().passenger ? char().type ? owner() : owner().passenger : null,
		owner().vehicle ? char().health > 200 ? owner() : owner().vehicle : null
	])
	const selectedID = () => owner().id
	const getLinkText = (str: string) => str.length < 9 ? str : str.slice(6)

	const updateChar = (newID: number, resetUpgs?: boolean) => batch(() => {
		setCharID(newID)
		if (resetUpgs && upgs().size) {
			setTemp([])
			setUpgs(new Set<number>())
		}
	})

	onMount(() => container.focus())

	if (menuState) {
		setCharID(menuState[0])
		setUpgs(new Set(menuState[1]))
		setTemp(menuState[2].slice())
	}

	return <div
		tabIndex="0" ref={container}
		class="menu-container"
		onKeyDown={e => {
			const el = e.currentTarget
			const colCount = Math.floor(Math.min(520, el.getBoundingClientRect().width - 19) / 65)
  		let tempID = selectedID()
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
						props.close(charID(), upgs(), temp())
						e.preventDefault()
					}
					break
				case 'Escape':
					props.close()
			}
			tempID != charID() && updateChar(tempID, true)
		}}
		onClick={e => {
			if (e.target == e.currentTarget && shouldClose) props.close()
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
		<div class="options_co">
			<div class="icon_co">
				<img
					src="/images/all-icons-large.webp"
					title={char().fullName}
					style={{
						"object-position": `${-8.2 * char().iconId}rem 0`
					}}
				/>
				<div>
					<h1>{ char().fullName }</h1>
					<p>
						Role: { char().role }
						<span style={{
							"background-position-x": -2.1 * roleMap[char().role] + 'rem'
						}}>
						</span>
					</p>
				</div>
			</div>
			<UpgradeContainer
				upgs={[upgs, setUpgs]} temp={[temp, setTemp]}
				owner={owner} class="upgs_co"
			/>
			<div class="links_co">
				<Index each={linkTargets()} >{
					(char, i) => <button
						class="btn" style={
							char() ? {} : { visibility: "hidden" }
						}
						onClick={() => {
							updateChar(char().id)
						}}
					>
						{ char() ? char().type || getLinkText(char().name) : 'Text' }
					</button>
				}</Index>
				<button
					class="btn" onClick={() => props.close(charID(), upgs(), temp())}
				>Save</button>
			</div>
		</div>
		<div class="classes_co">
			<Index each={characters.slice(0, 23)}>{
				(char, i) => <button
					class={i == selectedID() ? "selected" : ""}
					title={char().name}
					onClick={() => {
						updateChar(i, true)
					}}
					style={{
						"background-position": -5.34 * i + .33 + 'rem .33rem'
					}}
				/>
			}</Index>
			<div>
				<button class="btn" onClick={() => props.close()}>
					Close
				</button>
			</div>
		</div>
	</div>
}