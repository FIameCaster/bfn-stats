import '../../assets/ttk.css'
import { stats } from "../../data/stats"
import { Character } from "../.."
import { useUrlState } from "../../hooks/useUrlState"
import { calcTTK } from "./calcTTK"
import { round, clamp, getSettingsParam } from "../../utils"
import { useStore } from "../../components/Navbar/settingStore"
import { useMemo, useRef } from "react"
import { getCompareLink } from "../../utils/getCompareLink"
import { useWidth } from '../../hooks/useWidth'
import { updateTitle } from '../../utils/updateTitle'
import { Link } from 'react-router-dom'
import { useColumnLayout } from '../../hooks/useColumnLayout'

const characters = stats.compareChars

const getHealthValue = (num: number) => clamp(0, num, 999) || 125,
getArmorValue = (num: number) => Math.abs(num) || 1

export function Ttk() {
	const [{ distance, crit, move }] = useStore()
	const [armor, setArmor] = useUrlState(1, 'a', n => n+'', s => +s, { replace: true })
	const [health, setHealth] = useUrlState(125, 'h', n => n+'', s => +s, { replace: true })
	const [defOnly, setDefOnly] = useUrlState(false, 'e', b => b ? '1' : '', s => !!s, { replace: true })
	const [team, setTeam] = useUrlState('0', 't', str => str, str => str, { replace: true })

	const params = getSettingsParam(distance, crit, move)

	const health2 = getHealthValue(health)
	const armor2 = getArmorValue(armor)

	const rows = useMemo(() => {
		const ttk: [Character, number, string][] = []
		const activeTeam = [,'Plant', 'Zombie'][team]
		for (let i = 0; i < 34; i++) {
			if (activeTeam && activeTeam != characters[i].team) continue
			ttk.push(...calcTTK(characters[i], distance, crit, move, health2, armor2, defOnly))
		}
		return ttk.sort((a, b) => a[1] - b[1]).map(data => {
			const [char, ttk, notes] = data
			const fullName = char.fullName

			return <div className="row_t" key={fullName + notes.split('(')[0]} >
				<Link to={getCompareLink(char, params)} title={fullName} style={{
					backgroundPositionX: -3 * char.iconId + 'rem'
				}} />
				<div className="ttk">{ttk == Infinity ? '' : round(Math.floor(ttk * 30) / 30) + 's'}</div>
				{notes + (char.type ? notes ? notes[notes.length - 1] == ')' ? '' : `, ${char.type}` : char.type : '')}
			</div>
		})
	}, [distance, crit, move, health2, team, armor2, defOnly])
	
	const rowCount = rows.length
	const colCount = useColumnLayout(300, 16, Math.min(Math.floor(rowCount ** .77 / 4.2), 4))

	const columns: JSX.Element[] = []
	for (let i = 0; i < colCount; i++) {
		columns[i] = <div key={i}>
			{rows.slice(Math.ceil(i * rowCount / colCount), Math.ceil((i + 1) * rowCount / colCount))}
		</div>
	}
	const maxWidth = clamp(42, colCount * 40 + 1.6, 150)

	updateTitle('TTK Calculator')

	const updateHealth = (e: React.FormEvent, updateURL?: boolean) => {
		const target = e.target as HTMLInputElement
		setHealth(updateURL ? getHealthValue(+target.value) : +target.value, updateURL)
	}
	const updateArmor = (e: React.FormEvent, updateURL?: boolean) => {
		const target = e.target as HTMLInputElement
		setArmor(updateURL ? getArmorValue(+target.value) : +target.value, updateURL)
	}
	
	return (
		<div id="ttk">
			<div className="options_t" style={{
				maxWidth: Math.max(78.4, maxWidth - 3.2) + 'rem'
			}}>
				<div>
					<label htmlFor="team">Team</label>
					<div className="select">
						<select id="team" value={team} onChange={e => setTeam(e.target.value)}>
							<option value="0">Both</option>
							<option value="1">Plants</option>
							<option value="2">Zombies</option>
						</select>
					</div>
				</div>
				<div>
					<label htmlFor="default">Default TTK only</label>
					<input type="checkbox" id="default" checked={defOnly} onChange={() => setDefOnly(!defOnly)} />
				</div>
				<div className="health_t">
					<label htmlFor="health">Target Health</label>
					<input 
						type="number" id="health" min="0" max="999" value={health} placeholder="125" step="5"
						onChange={e => updateHealth(e, false)}
						onKeyUp={e => {
							e.keyCode > 36 && e.keyCode < 41 && updateHealth(e)
						}}
						onBlur={e => updateHealth(e)}
					/>
					<label htmlFor="armor">Armor Multiplier</label>
					<input 
						type="number" id="armor" min="0" value={armor} placeholder="1" step="0.05"
						onChange={e => updateArmor(e, false)}
						onKeyUp={e => {
							e.keyCode > 36 && e.keyCode < 41 && updateArmor(e)
						}}
						onBlur={e => updateArmor(e)}
					/>
				</div>
			</div>
			<div className="cards_t" style={{
				maxWidth: maxWidth + 'rem'
			}}>
				{columns}
			</div>
		</div>
	)
}