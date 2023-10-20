import '../../assets/ttk.css'
import { createMemo, createSignal, For, Index, Signal } from "solid-js"
import { getNavbarSettings } from "../../components/Navbar"
import { createParamSignal } from "../../hooks/createParamSignal"
import { useWidth } from "../../hooks/useWidth"
import { updateTitle } from "../../utils/updateTitle"
import { stats, Character } from '../../data/stats'
import { clamp, round } from '../../utils'
import { calcTTK } from './calcTTK'
import { A } from '@solidjs/router'
import { getCompareLink } from '../../utils/getCompareLink'
import { getBaseParam } from '../../utils'

export const Ttk = () => {
	const [armor, setArmor] = createParamSignal<string>('a', '1', s => s, s => s, true)
	const [health, setHealth] = createParamSignal<string>('h', '125', s => s, s => s, true)
	const [defOnly, setDefOnly] = createParamSignal<boolean>('e', '', b => b ? '1' : '', s => !!s, true)
	const [team, setTeam] = createParamSignal<string>('t', '0', s => s, s => s)
	const width = useWidth()

	updateTitle('TTK Calculator')

	const characters = stats.compareChars
	const signals: [Signal<Character>, Signal<number>, Signal<string>][] = Array.from({ length: 55 }, () => [createSignal(), createSignal(), createSignal()])

	const ttk = createMemo(() => {
		const health2 = clamp(0, +health(), 999) || 125
		const armor2 = Math.abs(+armor()) || 1
		const [distance, crit, move] = getNavbarSettings()
		const ttk: [Character, number, string][] = []
		const activeTeam = [,'Plant', 'Zombie'][+team()]
		for (let i = 0; i < 34; i++) {
			if (activeTeam && activeTeam != characters[i].team) continue
			ttk.push(...calcTTK(characters[i], distance, crit, move, health2, armor2, defOnly()))
		}
		
		return ttk.sort((a, b) => a[1] - b[1]).map((ttk, i) => {
			const [[, char], [, time], [, notes]] = signals[i]
			char(ttk[0])
			time(ttk[1])
			notes(ttk[2])

			return signals[i]
		})
		
		// <For each={
			
		// }>{
		// 	ttk => {
		// 		const [[char], [time], [notes]] = ttk

		// 		return <div class="row_t">
		// 			<A href={getCompareLink(char(), '')} title={char().fullName} style={{
		// 				"background-position-x": -3 * char().iconId + 'rem'
		// 			}} />
		// 			<div class="ttk">{time() == Infinity ? '' : round(Math.floor(time() * 30) / 30) + 's'}</div>
		// 			{notes() + (char().type ? notes() ? notes()[notes().length - 1] == ')' ? '' : `, ${char().type}` : char().type : '')}
		// 		</div>
		// 	}
		// }</For>
	})

	// Maybe not a good idea, but i need to get the rows
	const rowCount = createMemo(() => ttk().length)
	const colCount = createMemo(() => clamp(1, Math.floor(Math.min((width() - 16) / 300, rowCount() ** .77 / 4.2)), 4))

	const columns = createMemo(() => {
		const rows = ttk(),
		l = colCount(), cols: [Signal<Character>, Signal<number>, Signal<string>][][] = new Array(l),
		count = rowCount()

		for (let i = 0; i < l; i++)
			cols[i] = rows.slice(Math.ceil(i * count / l), Math.ceil((i + 1) * count / l))

		return cols
	})

	const settingsParam = getBaseParam()

	return <div id="ttk">
		<div class="options_t" style={{
			"max-width": Math.max(78.4, clamp(42, colCount() * 40 + 1.6, 150) - 3.2) + 'rem'
		}}>
			<div>
				<label for="team">Team</label>
				<div class="select">
					<select id="team" value={team()} onInput={e => setTeam(e.currentTarget.value)}>
						<option value="0">Both</option>
						<option value="1">Plants</option>
						<option value="2">Zombies</option>
					</select>
				</div>
			</div>
			<div>
				<label for="default">Default TTK only</label>
				<input type="checkbox" id="default" checked={defOnly()} onInput={() => setDefOnly(!defOnly())} />
			</div>
			<div class="health_t">
				<label for="health">Target Health</label>
				<input 
					type="number" id="health" min="0" max="999" value={health()} placeholder="125" step="5"
					onInput={e => setHealth(e.currentTarget.value, false)}
					onKeyUp={e => {
						e.keyCode > 36 && e.keyCode < 41 && setHealth(e.currentTarget.value)
					}}
					onBlur={e => setHealth(e.currentTarget.value)}
				/>
				<label for="armor">Armor Multiplier</label>
				<input 
					type="number" id="armor" min="0" value={armor()} placeholder="1" step="0.05"
					onInput={e => setArmor(e.currentTarget.value, false)}
					onKeyUp={e => {
						e.keyCode > 36 && e.keyCode < 41 && setArmor(e.currentTarget.value)
					}}
					onBlur={e => setArmor(e.currentTarget.value)}
				/>
			</div>
		</div>
		<div class="cards_t" style={{
			"max-width": clamp(42, colCount() * 40 + 1.6, 150) + 'rem'
		}}>{
			<Index each={columns()}>{
				rowData => <div>
					<For each={rowData()}>{
						ttk => {
							const [[char], [time], [notes]] = ttk
			
							return <div class="row_t">
								<A href={getCompareLink(char(), settingsParam())} title={char().fullName} style={{
									"background-position-x": -3 * char().iconId + 'rem'
								}} />
								<div class="ttk">{time() == Infinity ? '' : round(Math.floor(time() * 30) / 30) + 's'}</div>
								{notes() + (char().type ? notes() ? notes()[notes().length - 1] == ')' ? '' : `, ${char().type}` : char().type : '')}
							</div>
						}
					}</For>
				</div>
			}</Index>
		}</div>
	</div>
}