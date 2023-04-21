import { useDropdownState } from "../../hooks/useDropdownState";
import { clamp } from "../../utils";
import { useStore } from './settingStore'

export function Settings() {
	const [open] = useDropdownState('.settings')

	return (
		<div className='settings'>
			<button className="btn">
				<img src="/images/options.webp" alt="Options"/>
			</button>
			{ open && <List/> }
		</div>
	)
}

function List() {
	const [values, setStore] = useStore()

	const updateDistance = (e: React.FormEvent, updateParam?: boolean) => {
		const value = clamp(0, +(e.target as HTMLInputElement).value, 100)
		if (updateParam) (e.target as HTMLInputElement).value = value+''
		setStore({
			distance: value
		}, updateParam)
	}

	return (
		<ul>
			<li className='input-group'>
				<label htmlFor="dist">Distance</label>
				<input id='dist' type='number' min='0' max='100' step='1' value={values.distance}
					onChange={e => updateDistance(e)}
					onKeyUp={e => {
						e.keyCode > 36 && e.keyCode < 41 && updateDistance(e, true)
					}}
					onBlur={e => updateDistance(e, true)}
				/>
			</li>
			<li className='input-group'>
				<label htmlFor="crit">Crit damage</label>
				<input id='crit' type='checkbox' checked={values.crit} onChange={e => setStore({
					crit: (e.target as HTMLInputElement).checked
				}, true)}/>
			</li>
			<li className='input-group'>
				<label htmlFor="move">Moving target</label>
				<input id='move' type='checkbox' checked={values.move} onChange={e => setStore({
					move: (e.target as HTMLInputElement).checked
				}, true)}/>
			</li>
		</ul>
	)
}