import { A, useSearchParams } from '@solidjs/router'
import { createMemo, createRenderEffect, createSignal, For, Index, lazy, onCleanup, onMount, Show, Signal } from 'solid-js'
import '../../assets/compare.css'
import { getNavbarSettings } from '../../components/Navbar'
import { createParamSignal } from '../../hooks/createParamSignal'
import { Bullet, Character, Missile, Weapon } from '../../types'
import { getBaseParam, getParamStr, round } from '../../utils'
import { getTempParam, getUpgParam } from '../../utils/params'
import { updateTitle } from '../../utils/updateTitle'
import { categories, toggleText, categorySizes, MenuState, getStateStr, parseCharParam, getUpgradedClass, getSetters, getAccessors, decimalData, colorData, unitData, unitText } from './constants'

const Menu = lazy(() => import('./menu').then(module => ({ default: module.Menu })))
const [menuOpen, setOpen] = createSignal(false)
export let menuState: MenuState

let dist: number, crit: boolean, move: boolean, zoom: boolean,
menuIndex: number

export function Compare() {
	const [chargeLvl, setChargeLvl] = createSignal(0)
	const [zoomState, setZoom] = createParamSignal<boolean>('z', '', b => b ? '1' : '', s => !!s, true)
	
	updateTitle('Compare')
	
	let obsEl: HTMLDivElement, 
	content: HTMLDivElement,
	addBtn: HTMLButtonElement
	
	const observer = new IntersectionObserver(entries => {
		content.classList.toggle('show-names', !entries[0].isIntersecting)
	}, {
		rootMargin: '0px 0px 0px 99999px',
		threshold: 1
	})
	onMount(() => {
		observer.observe(obsEl)
		setTimeout(() => import('./menu'), 500)
	})
	
	const style = document.createElement('style')
	const sheet = document.head.appendChild(style).sheet
	for (let i = 14; i;) sheet.insertRule(`.group_co${--i} { display:grid; }`)
	const rules = [].map.call(sheet.cssRules, (rule: CSSStyleRule) => rule.style) as CSSStyleDeclaration[]
	
	onCleanup(() => style.remove())
	
	// Live collection used to focus the buttons after closing the menu
	const btns = document.getElementsByClassName('change_co') as HTMLCollectionOf<HTMLButtonElement>
	
	const close = (charID?: number, upgs?: Set<number>, temp?: number[]) => {
		setOpen(false)
		if (!upgs) return
		const params = param()
		params[menuIndex] = getStateStr([charID, upgs, temp])
		setSearch({ g: params.join('_') })

		const isAddBtn = !btns[menuIndex]
		setTimeout(() => {
			const btn = isAddBtn ? addBtn : btns[menuIndex]
			btn.focus()
			btn.scrollIntoView({ block: "nearest" })
		})
	}

	const [search, setSearch] = useSearchParams()
	const param = createMemo(() => (search.g || '').split('_'))

	// This causes memory leaks unfortunitely but is required to make the list of columns keyed
	const stringStateMap = new Map<string, MenuState>()
	const columns = createMemo(() => {
		const keyMap: {[key: string]: number} = {}
		const getColumnKey = (key: string) => {
			if (key in keyMap)
				return key + ++keyMap[key]

			return key + (keyMap[key] = 0)
		}
		if (!param()[0]) return []
		return param().map(str => {
			const key = getColumnKey(str), state = stringStateMap.get(key)
			if (state) return state
			const newState = parseCharParam(str)
			stringStateMap.set(key, newState)
			return newState
		})
	})

	// Updates all the setters and returns the accessors for the first column
	const baseStats = createMemo(() => {
		[dist, crit, move] = getNavbarSettings()
		zoom = zoomState()
		const charge = chargeLvl()
		for (const state of columns()) {
			const setters = getSetters(state), char = getUpgradedClass(state)
			for (let i = 0; i < 14; i++) {
				const l = categorySizes[i], stats: number[] = new Array(l),
				category = categoryFuncs[i](char), btnState = charge,
				funcs = statFuncs[i]
				for (let j = 0; j < l; j++) {
					stats[j] = category && funcs[j](category, char, btnState)
				}
				setters[i](stats)
			}
		}
		return columns()[0]?.[4]
	})
	const baseParam = getBaseParam()

	const getColumnLink = (param: string, char: Character) => {
		return `/classes/${char.folderName}/${getParamStr(baseParam() + param + (zoomState() ? '&z=1' : ''))}`
	}


	return <div id="compare">
		<div id="observer" ref={obsEl}></div>
		<div class="container_co">
			<div class="btns_co">
				<div class="input-group">
					<label for="zoom">Zooming</label>
					<input type="checkbox" id="zoom" checked={zoomState()} onInput={() => setZoom(!zoomState())} />
				</div>
			</div>
			<div class="labels_co">
				<For each={categories}>{
					(category, i) => <>
						<div class="category_co">
							<Show when={i() == 3}>
								<button class="btn toggle-category" onClick={() => {
									setChargeLvl(lvl => lvl == 2 ? 0 : lvl + 1)
								}}>
									{ toggleText[chargeLvl()] }
								</button>
							</Show>
							{ category[0] }
						</div>
						<div class={"group_co group_co" + i()}>
							<For each={category.slice(1)}>{
								label => <div>{ label }</div>
							}</For>
						</div>
					</>
				}</For>
			</div>
			<div class="content_co" ref={content}>
				<For each={columns()}>{
					(state, i) => {
						const tempParam = getTempParam(state[2])
						const upgParam = getUpgParam(state[1])
						const char = getUpgradedClass(state)
						const accessors = getAccessors(state)
						const colParam = (upgParam && '&u=' + upgParam) + (tempParam && '&t=' + tempParam)

						return <div class="column_co">
							<A class="name_co" href={getColumnLink(colParam, char)}>
								<span>{ char.fullName }</span>
							</A>
							<div class="header_co">
								<A 
									href={getColumnLink(colParam, char)}
									class="icon_co" style={{
										"background-position-x": -8.2 * char.iconId + 'rem'
									}}
								/>
								<button
									class="remove_co"
									onClick={() => {
										const params = param()
										params.splice(i(), 1)
										setSearch({ g: params.join('_') })
									}}
								/>
								<button
									class="btn change_co"
									onClick={() => {
										menuIndex = i()
										menuState = state
										setOpen(true)
									}}
								>Change</button>
							</div>
							<Index each={accessors}>{
								(stats, i) => {
									const decimals = decimalData[i],
									colors = colorData[i], units = unitData[i]

									return <>
										<div class="group-spacer"></div>
										<div class={"group_co group_co" + i}>
											<Index each={stats()()}>{
												(stat, j) => <div style={
													accessors == baseStats() ? {} : getColor(baseStats()[i]()[j], stat(), colors[j])
												}>{ stat() == null ? '' : round(stat() as number, decimals[j]) + unitText[units[j] || 0] }</div>
											}</Index>
										</div>
									</>
								}
							}</Index>
						</div>
					}
				}</For>
				<div>
					<button 
						class="add_co btn"
						ref={addBtn}
						onClick={() => {
							menuIndex = columns().length
							menuState = null
							setOpen(true)
						}}
					>Add</button>
					<For each={categorySizes}>{
						(size, i) => <>
							<button 
								class="toggle_co"
								title="toggle category visibility"
								onClick={e => {
									rules[i()].display = e.currentTarget.classList.toggle('hidden_co') ? 'none' : 'grid'
								}}
							/>
							<div 
								class={'group_co group_co' + i()}
								style={{ height: size * 2.8 + 'rem' }}
							/>
						</>
					}</For>
				</div>
			</div>
		</div>
		<Show when={menuOpen()}>
			<Menu close={close} />
		</Show>
	</div>
}

const getColor = (baseStat: number, stat: number, color = 0) => {
	if (baseStat == null || stat == null) return {}
	if (color == 3) {
		baseStat = Math.abs(baseStat)
		stat = Math.abs(stat)
		color = 1 // Else the XOR always returns a truthy value
	}
	if (baseStat == stat) return {}

	// Poor readability due to being overly optimized
	return {
		"background-color": `${
			(color == 2 ? stat < baseStat : color ^ +(stat > baseStat)) ? 'rgba(30, 100' : 'rgba(120, 40'
		}, 0, ${color == 2 && stat * baseStat <= 0 ? 1 : Math.min(1, (Math.max(baseStat / stat, stat / baseStat) - 1) * .9 + .1)})`
	}
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