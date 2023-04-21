import React, { Suspense, useEffect, useLayoutEffect, useRef, useState, lazy } from 'react'
import '../../assets/compare.css'
import { useUrlState } from '../../hooks/useUrlState'
import { categories, toggleText, categorySizes, decimalData, unitData, colorData, unitText, MenuState } from './constants'
import { parseCharParam, getCharParam, getStateStr, getUpgradedClass } from './constants'
import { getUpgParam, getTempParam } from '../../utils/params'
import { Bullet, Character, Missile, Weapon } from '../..'
import { useStore } from '../../components/Navbar/settingStore'
import { getParamStr, getSettingsParam, round } from '../../utils'
import { Link } from 'react-router-dom'
import { updateTitle } from '../../utils/updateTitle'

const Menu = lazy(() => import('./menu').then(module => ({ default: module.Menu })))

let menuIndex: number, menuState: MenuState,
dist: number, crit: boolean, move: boolean, zoom: boolean

// Live collection used to focus the buttons after closing the menu
const btns = document.getElementsByClassName('change_co') as HTMLCollectionOf<HTMLButtonElement>

export function Compare() {
	const [categoryIndexes, setIndexes] = useState([,,,0])
	const [zoomState, setZoom] = useUrlState(false, 'z', b => b ? '1' : '', s => !!s, { replace: true })
	const [chars, setChars] = useUrlState<MenuState[]>([], 'g', getCharParam, parseCharParam, { replace: false })
	const [menuOpen, setOpen] = useState(false);

	([{ distance: dist, crit, move}] = useStore())

	zoom = zoomState
	
	const closeMenu = (state?: MenuState) => {
		if (state) {
			const newState = chars.slice()
			newState[menuIndex] = state
			setChars(newState)
		}
		setOpen(false)
		// Column order might change after rerender, so the button needs to be focused after the render
		setTimeout(() => {
			const btn = btns[menuIndex] || addRef.current
			btn.focus()
			btn.scrollIntoView({ block: "nearest" })
		})
	}

	updateTitle('Compare')
	
	const ruleRef = useRef<CSSStyleDeclaration[]>(null)
	const observerRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const addRef = useRef<HTMLButtonElement>(null)

	// Ensures different columns get different keys even if 
	// getStateStr returns the same string for multiple columns
	const keyMap: {[key: string]: number} = {}
	const getColumnKey = (state: MenuState) => {
		const key = getStateStr(state)
		if (key in keyMap)
			return key + ++keyMap[key]

		return key + (keyMap[key] = 0)
	}

	const params = getSettingsParam(dist, crit, move)

	useEffect(() => {
		const style = document.createElement('style')
		const sheet = document.head.appendChild(style).sheet
		for (let i = 14; i;) sheet.insertRule(`.group_co${--i} { display:grid; }`)
		ruleRef.current = [].map.call(sheet.cssRules, (rule: CSSStyleRule) => rule.style)
		
		const timeout = setTimeout(() => import('./menu'), 500)

		return () => {
			style.remove()
			clearTimeout(timeout)
		}
	}, [])

	useLayoutEffect(() => {
		const observer = new IntersectionObserver(entries => {
			contentRef.current.classList.toggle('show-names', !entries[0].isIntersecting)
		}, {
			rootMargin: '0px 0px 0px 99999px',
			threshold: 1
		})

		observer.observe(observerRef.current)

		return () => observer.disconnect()
	}, [])

	const labelColumn: JSX.Element[] = [],
	visibilityBtns: JSX.Element[] = [
		<button ref={addRef} className="add_co btn" key={0}
			onClick={e => {
				menuIndex = chars.length
				menuState = null
				setOpen(true)
			}}
		>Add</button>
	]

	for (let i = 0; i < 14; i++) {
		const category = categories[i]
		const l = categorySizes[i], labelEls: JSX.Element[] = []

		for (let i = 0; i < l;) labelEls[i] = <div key={i}>{category[++i]}</div>

		labelColumn.push(
			<div key={2 * i} className="category_co">
				{
					categoryIndexes[i] != null && <button
						className='btn toggle-category'
						onClick={() => {
							const newState = categoryIndexes.slice()
							newState[i] = newState[i] == 2 ? 0 : newState[i] + 1
							setIndexes(newState)
						}}
					>
						{toggleText[categoryIndexes[i]]}
					</button>
				}
				{category[0]}
			</div>,
			<div key={2 * i + 1} className={'group_co group_co' + i}>{labelEls}</div>
		)

		visibilityBtns.push(
			<button
				key={2 * i + 1}
				className="toggle_co"
				title='Toggle category visibility'
				onClick={e => {
					ruleRef.current[i].display = e.currentTarget.classList.toggle('hidden_co') ? 'none' : 'grid'
				}}
			/>,
			<div
				key={2 * i + 2}
				className={'group_co group_co' + i}
				style={{
					height: l * 2.8 + 'rem'
				}}
			/>
		)
	}

	const currentStats = chars.map(state => {
		const char = getUpgradedClass(state)
		const stats: number[][] = new Array(14)
		for (let i = 0; i < 14; i++) {
			const l = categorySizes[i], funcs = statFuncs[i], 
			category = categoryFuncs[i](char), btnIndex = categoryIndexes[i],
			nums: number[] = stats[i] = new Array(l)

			for (let j = 0; j < l; j++)
				nums[j] = category && funcs[j](category, char, btnIndex)
		}
		return stats
	})
	const baseStats = currentStats[0]

	return (
		<div id="compare">
			<div id="observer" ref={observerRef}></div>
			<div className="container_co">
				<div className="btns_co">
					<div className="input-group">
						<label htmlFor="zoom">Zooming</label>
						<input type="checkbox" id="zoom" checked={zoomState} onChange={() => setZoom(!zoomState)} />
					</div>
				</div>
				<div className="labels_co">
					{labelColumn}
				</div>
				<div className="content_co" ref={contentRef}>
					{
						chars.map((state, i) => {
							const char = state[3], href = getColumnLink(params, state),
							key = getColumnKey(state), stats = currentStats[i], isFirstCol = !i

							const categories: JSX.Element[] = new Array(14)

							for (let i = 0; i < 14; i++) {
								const l = categorySizes[i]
								const rows: JSX.Element[] = new Array(l),
								categoryStats = stats[i], base = baseStats[i],
								units = unitData[i], colors = colorData[i],
								decimals = decimalData[i]

								for (let j = 0; j < l; j++) rows[j] = (
									<div key={j} style={getColor(base[j], categoryStats[j], colors[j], isFirstCol)}>
										{categoryStats[j] == null ? '' : round(categoryStats[j], decimals[j]) + unitText[units[j] || 0]}
									</div>
								)

								categories.push(
									<div key={2 * i} className="group-spacer"></div>,
									<div key={2 * i + 1} className={'group_co group_co' + i}>
										{rows}
									</div>
								)
							}

							return <div className="column_co" key={key}>
								<Link to={href} className="name_co">
									<span>{char.fullName}</span>
								</Link>
								<div className="header_co">
									<Link to={href} className="icon_co" style={{
										backgroundPositionX: -8.2 * char.iconId + 'rem'
									}}/>
									<button 
										className="remove_co"
										onClick={() => {
											const newState = chars.slice()
											newState.splice(i, 1)
											setChars(newState)
										}}
									/>
									<button 
										className="btn change_co"
										onClick={() => {
											menuIndex = i
											menuState = state
											setOpen(true)
										}}
									>Change</button>
								</div>
								{categories}
							</div>
						})
					}
					<div>{visibilityBtns}</div>
				</div>
			</div>
			{ 
				menuOpen && <Suspense fallback={<div className='menu-container'></div>}>
					<Menu closeMenu={closeMenu} state={menuState} />
				</Suspense>
			}
		</div>
	)
}

const getColor = (baseStat: number, stat: number, color = 0, isFirstCol: boolean): React.CSSProperties => {
	if (isFirstCol || baseStat == null || stat == null) return {}
	if (color == 3) {
		baseStat = Math.abs(baseStat)
		stat = Math.abs(stat)
		color = 1 // Else the XOR always returns a truthy value
	}
	if (baseStat == stat) return {}

	// Poor readability due to being overly optimized
	return {
		backgroundColor: `${
			(color == 2 ? stat < baseStat : color ^ +(stat > baseStat)) ? 'rgba(30, 100' : 'rgba(120, 40'
		}, 0, ${color == 2 && stat * baseStat <= 0 ? 1 : Math.min(1, (Math.max(baseStat / stat, stat / baseStat) - 1) * .9 + .1)})`
	}
}

const getColumnLink = (param: string, state: MenuState) => {
	const tempParam = getTempParam(state[2])
	const upgParam = getUpgParam(state[1])
	return `/classes/${state[3].folderName}/${getParamStr(param + (zoom ? '&z=1' : '') + (upgParam && '&u=' + upgParam) + (tempParam && '&t=' + tempParam))}`
}

const getWeapon = (char: Character) => char[zoom ? 'alt' : 'primary'] || char.primary

const categoryFuncs: ((char: Character) => unknown)[] = [
	char => getWeapon(char),
	char => getWeapon(char).projectiles[0],
	char => getWeapon(char).trapezoid,
	char => getWeapon(char).charges,
	char => getWeapon(char),
	char => getWeapon(char).overheat,
	char => char.moveData,
	char => char,
	char => char.shield,
	char => getWeapon(char).homing,
	char => getWeapon(char)[zoom ? 'gunSwayZoom' : 'gunSway'],
	char => getWeapon(char).getDispersion(zoom),
	char => getWeapon(char).getRecoil(zoom),
	char => getWeapon(char).recoilAngle
]

const statFuncs: ((category: unknown, char: Character, buttonState?: number) => number)[][] = [
	[
		(weapon: Weapon) => weapon.getDPS(dist, crit, move),
		(weapon: Weapon) => weapon.getDamage(dist, 0, crit, move),
		(weapon: Weapon) => weapon.effectiveRof * 60 || null,
		(weapon: Weapon) => weapon.burstSize,
		(weapon: Weapon) => weapon.burstInterval,
		(weapon: Weapon) => weapon.shotsPerShell == 1 ? null : weapon.shotsPerShell,
		(weapon: Weapon) => weapon.rof,
		(weapon: Weapon) => weapon.getSplash(0),
		(weapon: Weapon) => weapon.projectiles[0]?.blastRadius || null
	],
	[
		(bullet: Bullet | Missile) => bullet.startSpeed,
		(bullet: Bullet | Missile) => bullet.startSpeedY || null,
		(bullet: Bullet) => bullet.dragStart || null,
		(bullet: Bullet) => bullet.dragEnd || null,
		(bullet: Bullet) => bullet.endSpeed,
		(bullet: Missile) => bullet.engineAccel,
		(bullet: Missile) => bullet.maxSpeed,
		(_, char) => getWeapon(char).travelTime(dist, 0),
		(_, char) => getWeapon(char).getMaxRange(0),
		(bullet: Bullet | Missile) => bullet.gravity,
		(bullet: Bullet | Missile) => bullet.radius,
		(bullet: Bullet) => bullet.width,
		(bullet: Bullet) => bullet.height
	],
	[
		(_, char) => getWeapon(char).getSpray(dist, crit),
		(trap: number[]) => trap[1],
		(trap: number[]) => trap[2],
		(trap: number[]) => trap[3] * 2,
		(trap: number[]) => trap[4],
		(trap: number[]) => trap[5],
		(trap: number[]) => (trap[4] + trap[5]) * 0.5 * trap[1],
	],
	[
		(charge: number[][], char, i) => (charge[i]?.[0] * char.modifiers[0] * char.modifiers[4]) || null,
		(charge: number[][], char, i) => charge[i]?.[1],
		(charge: number[][], char, i) => getWeapon(char).getChargeDPS(dist, i, crit, move),
		(charge: number[][], char, i) => getWeapon(char).getDamage(dist, i + 1, crit, move),
		(charge: number[][], char, i) => charge[i]?.[2],
		(charge: number[][], char, i) => getWeapon(char).getSplash(i + 1),
		(charge: number[][], char, i) => getWeapon(char).projectiles[i + 1]?.startSpeed,
		(charge: number[][], char, i) => (getWeapon(char).projectiles[i + 1] as Bullet)?.dragStart || null,
		(charge: number[][], char, i) => (getWeapon(char).projectiles[i + 1] as Bullet)?.dragEnd || null,
		(charge: number[][], char, i) => (getWeapon(char).projectiles[i + 1] as Bullet)?.endSpeed,
		(charge: number[][], char, i) => (getWeapon(char).projectiles[i + 1] as Missile)?.engineAccel,
		(charge: number[][], char, i) => (getWeapon(char).projectiles[i + 1] as Missile)?.maxSpeed,
		(charge: number[][], char, i) => getWeapon(char).travelTime(dist, i + 1),
		(charge: number[][], char, i) => getWeapon(char).getMaxRange(i + 1) || null,
		(charge: number[][], char, i) => (getWeapon(char).projectiles[i + 1])?.radius,
		(charge: number[][], char, i) => charge[i]?.[zoom ? 3 : 5],
		(charge: number[][], char, i) => charge[i]?.[zoom ? 4 : 6],
		(charge: number[][], char, i) => charge[i]?.[7] * 100 || 0 
	],
	[
		(weapon: Weapon) => weapon.ammo,
		(weapon: Weapon) => weapon.ammoPerShot,
		(weapon: Weapon) => weapon.reload,
		(weapon: Weapon) => weapon.getDmgPerClip(dist, crit, move),
		(weapon: Weapon) => weapon.sustainableRof * 60 || null,
		(weapon: Weapon) => weapon.getDPS(dist, crit, move, true)
	],
	[
		(_, char) => getWeapon(char).overheatTime,
		(overheat: number[]) => overheat[0],
		(overheat: number[]) => overheat[1],
		(overheat: number[]) => overheat[2],
		(overheat: number[]) => overheat[3],
		(overheat: number[]) => overheat[4],
		(overheat: number[]) => overheat[5],
		(_, char) => getWeapon(char).cooldown,
		(_, char) => getWeapon(char).getDmgPerOverheat(dist, crit, move),
		(_, char) => getWeapon(char).sustainableRof * 60 || null,
		(_, char) => getWeapon(char).getDPS(dist, crit, move, true)
	],
	[
		...[0,1,2,3,4,5,6,7,8,9,10].map(i => (mobility: number[]) => mobility[i]),
		...[0,1,2].map(i => (mobility: number[], char: Character) => char.primary.primeSpeed && mobility[i] * char.primary.primeSpeed[i]),
	],
	[
		(char: Character) => char.health,
		(char: Character) => char.armor || 0,
		(char: Character) => char.regenRate,
		(char: Character) => char.regenDelay,
		(char: Character) => char.sprintExit,
		(char: Character) => char.zoomFov,
		(char: Character) => char.primary.primeTime
	],
	[
		(shield: number[]) => shield[0],
		(shield: number[]) => shield[1],
		(shield: number[]) => shield[2],
		(_, char) => char.moveData[4],
		(shield: number[], char) => char.moveData[2] * shield[4] * char.zoomSpeed
	],
	[
		(homing: number[]) => homing[3] * (zoom && homing[6] || 1),
		(homing: number[]) => homing[2],
		(homing: number[]) => homing[0],
		(homing: number[]) => homing[1],
		(homing: number[]) => homing[4],
		(homing: number[]) => homing[5],
		(homing: number[], char) => homing[5] && getWeapon(char).projectiles[0].travelDistance(homing[5]) + getWeapon(char).offsetZ
	],
	[
		...[0,1,2,3,4,5,6,7,8,9].map(i => (gunSway: number[]) => gunSway[i]),
		(_, char) => getWeapon(char).aimTime
	],
	[0,1,2,3,4,5,6,7].map(i => (disp: number[]) => disp[i]),
	[0,1,2,3,4,5,6,7].map(i => (recoil: number[]) => recoil[i]),
	[0,1,2].map(i => (recoil: number[]) => recoil[i] * (zoom && i < 2 ? recoil[3] / 100 : 1))
]