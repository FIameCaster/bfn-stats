import { useLocation, useSearchParams } from "@solidjs/router";
import { Accessor, createMemo, For, Index, Setter, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { Signal1 } from ".";
import { getUpgPoints, Upgrade, upgrades } from "../../data/upgrades";
import { createStorageSignal } from "../../hooks/createStorageSignal";
import { useDropdownState } from "../../hooks/useDropdownState";
import { Character } from "../../data/stats";
import { getTempParam, getUpgParam, parseTempParam, parseUpgParam } from "../../utils/params";
import { upgradeNames, upgradeText } from "./constants";
import '../../assets/upgradeMenu.css'

const staticRoles = [
	'none',
	'url("/images/Perk_Attack.webp")',
	'url("/images/Perk_Defend.webp")',
	'url("/images/Perk_Support.webp")',
	'url("/images/all-icons-large.webp")',
]

export function PerkList(props: { upgs: Signal1<Set<number>>, temp: Signal1<number[]>, owner: Accessor<Character>, class: string, cost: Accessor<number>, maxHeight: number, setOpen: Setter<boolean> }) {
	const roleImages = createMemo(() => [
		props.owner(), props.owner().vehicle, props.owner().passenger
	].map(char => {
		return char && `url("/images/abilities/set${char.id}.webp")`
	}))

	const charUpgrades = createMemo(() => upgrades[props.owner().id])
	const [open, setOpen] = createStore<boolean[]>([])
	const getRoleImg = (num: number) => {
		return staticRoles[num] || roleImages()[Math.floor((num - 5) / 3)]
	}
	const upgs = () => props.upgs[0]()
	const cost = () => props.cost()
	const [buildOpen, setBuildOpen] = useDropdownState("#builds")

	const getOffset = (num: number) => {
		if (num < 4) return 0
		if (num > 4) return -1.625 * ((num - 2) % 3)
		return -1.625 * props.owner().iconId
	}
	let buildContainer: HTMLDivElement

	return <ul class="perk-list" style={{"max-height": props.maxHeight + 'px'}}>
		<Index each={charUpgrades()}>{
			(upg, i) => <li classList={{
				expanded: open[i], none: !upg()[3], selected: upgs().has(i), expensive: cost() + upg()[1] > 7
			}}>
				<div class="perk">
					<button
						onClick={() => {
							if (!upgs().delete(i)) {
								if (cost() + upg()[1] > 7) return
								upgs().add(i)
							}
							props.upgs[1](new Set(upgs()))
						}}
					>
						<span 
							class="perk-type" style={{
								"background-position-x": -2 * upg()[2] + 'em'
							}}
						/>
						{ upgradeNames[upg()[0]] }
						<span class="perk-role-container">
							<span
								class="perk-role"
								style={{
									"background-image": getRoleImg(upg()[3]),
									"background-position-x": getOffset(upg()[3]) + 'em'
								}}
							/>
						</span>
						<span class="cost">{ upg()[1] }</span>
					</button>
					<button 
						class="perk-toggle"
						onClick={e => {
							setOpen(i, open => !open)
							e.currentTarget.parentElement.nextElementSibling.scrollIntoView({ "block": "nearest" })
						}}
					/>
				</div>
				<div class="perk-info">{ upgradeText[upg()[0]] }</div>
			</li>
		}</Index>
		<li>
			<div
				class="select" id="builds"
				ref={buildContainer}
				onkeydown={e => {
					e.code == 'Escape' && setBuildOpen(false)
					e.stopPropagation()
				}}
			>
				<button>Builds</button>
				<Show when={buildOpen()}>
					<ul class="build-list" style={{
						"max-height": props.maxHeight - buildContainer.getBoundingClientRect().height - 10 + 'px'
					}}>
						<For each={[0,1,2]}>{
							i => <BuildItem 
								key={() => `build${props.owner().id.toString(36)}${i}`}
								upgs={props.upgs} temp={props.temp} upgrades={charUpgrades}
							/>
						}</For>
					</ul>
				</Show>
			</div>
			<button class="btn perk-close" onClick={() => props.upgs[1](new Set())}>
				Clear
			</button>
			<button class="btn perk-close" onClick={() => props.setOpen(false)}>
				Close
			</button>
		</li>
	</ul>
}

function BuildItem(props: { key: Accessor<string>, upgrades: Accessor<Upgrade[]>, upgs: Signal1<Set<number>>, temp: Signal1<number[]> }) {
	const [build, setBuild] = createStorageSignal(props.key)
	const upgs = createMemo(() => parseUpgParam(build().split('.')[0]))

	const [, setSearch] = useSearchParams()
	const useSearch = useLocation().pathname.includes('classes')

	return <li>
		<div class="build">
			<Show when={upgs().size} fallback="Empty build">
				<Index each={[...upgs()].slice(0, 6)}>{
					id => <div style={{
						"background-position-x": -2 * props.upgrades()[id()][2] + 'em'
					}}/>
				}</Index>
			</Show>
		</div>
		<button
			class="btn"
			onClick={() => {
				const upgs = props.upgs[0]()
				setBuild(upgs.size ? `${getUpgParam(upgs)}.${getTempParam(props.temp[0]())}` : '')
			}}
		>
			Overwrite
		</button>
		<button
			class="btn"
			onClick={() => {
				const params = build().split('.')
				props.upgs[1](upgs(), false)
				props.temp[1](parseTempParam(params[1] || ''), false)
				if (useSearch) setSearch({ u: params[0], t: params[1] }, { replace: true })
			}}
		>
			Select ({ getUpgPoints(upgs(), props.upgrades()) }/7)
		</button>
	</li>
}

export function TempList(props: { upgs: Signal1<Set<number>>, temp: Signal1<number[]>, owner: Accessor<Character>, class: string }) {

	const charUpgrades = createMemo(() => upgrades[props.owner().id])
	const getTemp = (id: number) => charUpgrades()[id][5]
	const updateTemp = (id: number, value: number) => {
		const newTemp = props.temp[0]().slice()
		newTemp[id] = value
		props.temp[1](newTemp)
	}

	return <ul class="temp-list">
		<For each={[...props.upgs[0]()]}>{
			(id, i) => <li class={getTemp(id)?.[1] ? 'range' : 'input-group'}>
				<label for={"input" + i()}>{ upgradeNames[charUpgrades()[id][0]] }</label>
				<Show when={getTemp(id)?.[1]} fallback={
					<input 
						type="checkbox" id={"input" + i()} checked={props.temp[0]()[id] == 0}
						onInput={e => updateTemp(id, e.currentTarget.checked ? 0 : null)}
					/>
				}>
					<label for={'input' + i}>Stage: {props.temp[0]()[id] || 0}</label>
					<input 
						type="range" id={"input" + i()} 
						max={getTemp(id).length - 1}
						value={props.temp[0]()[id] || 0}
						onInput={e => updateTemp(id, +e.currentTarget.value)}
					/>
				</Show>
			</li>
		}</For>
	</ul>
}
