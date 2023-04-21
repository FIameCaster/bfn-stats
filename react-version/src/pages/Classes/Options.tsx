import { useEffect, useRef } from "react"
import { Link, useOutletContext } from "react-router-dom"
import { specialUpgs } from "."
import { UpgradeContainer } from "../../components/UpgradeMenu"
import { stats } from "../../data/stats"
import { upgrades } from "../../data/upgrades"
import { getParamStr } from "../../utils"
import { getTempParam, getUpgParam } from "../../utils/params"

const roleMap = {
	"Attack": 0,
	"Defend": 1,
	"Support": 2,
	"Swarm": 3
}

const nextMap = [,,,,,,,,,,,,,,,,,,,,,,0,8,13,19,8,19,22],
prevMap = [22,,,,,,,,,,,,,,,,,,,,,,,6,11,17,6,17,20]

export function Options({ ability, param, maxWidth }: { ability: number, param: string, maxWidth: string }) {

	const [
		[upgs, setUpgs], [temp, setTemp], [zoom, setZoom], , [special, setSpecial], charID
	] = (useOutletContext() as [
		[Set<number>, (newState: Set<number> | ((state: Set<number>) => Set<number>)) => void],
		[number[], (newState: number[] | ((state: number[]) => number[])) => void],
		[boolean, (newState: boolean | ((state: boolean) => boolean)) => void],
		[number, (newState: number | ((state: number) => number)) => void],
		[boolean, (newState: boolean | ((state: boolean) => boolean)) => void],
		number
	])

	if (zoom) param += '&z=1'
	const upgParam = getUpgParam(upgs), tempParam = getTempParam(temp)
	const param2 = getParamStr(param + (upgParam && '&u=' + upgParam) + (tempParam && '&t=' + tempParam) + (special ? '&s=1' : ''))

	const char = stats.characters[charID]
	const owner = char.owner || char
	const charUpgrades = upgrades[owner.id]
	const nextRef = useRef<HTMLAnchorElement>()
	const prevRef = useRef<HTMLAnchorElement>()

	const dots = ability == null ? './' : '../'

	const abilityLinks = [0,1,2].map(i => ability == i ? dots + param2 : dots + 'abilities' + getParamStr(param2 + (i ? '&a=' + i : '')))

	const linkTargets = [
		owner.passenger ? char.type ? owner : owner.passenger : null,
		owner.vehicle ? char.health > 200 ? owner : owner.vehicle : null
	]

	const upgIcons: JSX.Element[] = []

	for (const id of upgs) charUpgrades[id] && upgIcons.push(
		<div key={id} style={{
			backgroundPositionX: -2 * charUpgrades[id][2] + 'em'
		}}/>
	)

	useEffect(() => {
		const keydown = (e: KeyboardEvent) => {
			if (e.repeat || (e.target as HTMLElement).matches('input')) return
			if (e.keyCode == 37) prevRef.current.click()
			else if (e.keyCode == 39) nextRef.current.click()
		}
		addEventListener('keydown', keydown)
		return () => removeEventListener('keydown', keydown)
	}, [])

	return <>
		<header className="char">
			<div className="icon_c">
				<img src="/images/all-icons-large.webp" alt={char.name} style={{
					objectPosition: -8.2 * char.iconId + 'rem 0'
				}}/>
				<div>
					<h1>{char.fullName}</h1>
					<p>
						Role: {char.role}
						<span style={{ backgroundPositionX: -2.1 * roleMap[char.role] + 'rem' }}/>
					</p>
				</div>
			</div>
			<div className="abilities" style={{
				'--icon': `url(/images/abilities/set${char.id}.webp)`
			} as React.CSSProperties}>
				<Link title="Left ability" to={abilityLinks[0]} className={ability == 0 ? 'selected' : ''} />
				<Link title="Center ability" to={abilityLinks[1]} className={ability == 1 ? 'selected' : ''} />
				<Link title="Right ability" to={abilityLinks[2]} className={ability == 2 ? 'selected' : ''} />
			</div>
			<div className="nav_c">
				<Link 
					id="next" className="btn" title="(→)" ref={nextRef}
					to={`/classes/${stats.characters[nextMap[charID] ?? charID + 1].folderName}/${ability == null ? '' : 'abilities'}${getParamStr(param + (ability ? '&a=' + ability : ''))}`}
				>Next</Link>
				<Link
					id="prev" className="btn" title="(←)" ref={prevRef}
					to={`/classes/${stats.characters[prevMap[charID] ?? charID - 1].folderName}/${ability == null ? '' : 'abilities'}${getParamStr(param + (ability ? '&a=' + ability : ''))}`}
				>Prev</Link>
			</div>
		</header>
		<div className="options_c" style={{ maxWidth }}>
			<UpgradeContainer upgs={upgs} owner={owner} className='upg-container' temp={temp} updateTemp={setTemp} updateUpgs={setUpgs} />
			<div className="group_c2">
				<div className="upgrades">{
					upgs.size ? upgIcons.slice(0, 6) : 'No upgrades selected'	
				}</div>
				<div>{
					linkTargets.map((char, i) => char && (
						<Link key={i}
							id={i ? 'vehicle' : 'passenger'} className='btn'
							to={`/classes/${char.folderName}/${ability == null ? '' : 'abilities'}${param2}`}
						>{char.type || char.name}</Link>
					))
				}</div>
			</div>
			<div className="group_c3">
				<div className="input-group">
					<label htmlFor="zoom">Zooming</label>
					<input type="checkbox" id="zoom" checked={zoom} onChange={() => setZoom(!zoom)} />
				</div>
				<div className="input-group" style={
					specialUpgs[owner.id] ? {} : { visibility: 'hidden' }
				}>
					<label htmlFor="starz">{specialUpgs[owner.id]?.[0] ?? 'a'}</label>
					<input type="checkbox" id="starz" checked={special} onChange={() => setSpecial(!special)} />
				</div>
			</div>
		</div>
	</>
}