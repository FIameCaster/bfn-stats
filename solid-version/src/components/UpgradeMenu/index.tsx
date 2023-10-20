import { Accessor, Signal, Show, createMemo, lazy, onMount } from "solid-js";
import { getUpgPoints, upgrades } from "../../data/upgrades";
import { createParamSignal } from "../../hooks/createParamSignal";
import { useDropdownState } from "../../hooks/useDropdownState";
import { Character } from "../../data/stats";

const PerkList = lazy(() => import('./lists').then(module => ({ default: module.PerkList })))
const TempList = lazy(() => import('./lists').then(module => ({ default: module.TempList })))

export type Signal1<T> = Signal<T> | ReturnType<typeof createParamSignal<T>>

export function UpgradeContainer(props: { upgs: Signal1<Set<number>>, temp: Signal1<number[]>, owner: Accessor<Character>, class: string }) {
	const [open, setOpen] = useDropdownState('#upg')
	const [open2, setOpen2] = useDropdownState('#temp')
	const cost = createMemo(() => getUpgPoints(props.upgs[0](), upgrades[props.owner().id]))
	const showTemp = () => {
		const upgs = upgrades[props.owner().id]
		for (const id of props.upgs[0]()) {
			if (upgs[id]?.[5]) return true
		}
		return false
	}
	onMount(() => setTimeout(() => import('./lists'), 500))

	let upgContainer: HTMLDivElement
	return <div class={props.class}>
		<div
			class="select" id="upg"
			ref={upgContainer}
			onKeyDown={e => {
				e.code == "Escape" && setOpen(!open())
				e.stopPropagation()
			}}
		>
			<button>Upgrades ({cost()}/7)</button>
			<Show when={open()}>
				<PerkList {...Object.assign({ cost, setOpen, maxHeight: Math.min(innerHeight - upgContainer.getBoundingClientRect().top - 40, 532) }, props)}  />
			</Show>
		</div>
		<div
			class="select" id="temp"
			onKeyDown={e => {
				e.code == "Escape" && setOpen2(!open2())
				e.stopPropagation()
			}}
			style={
				showTemp() ? {} : { visibility: "hidden" }
			}
		>
			<button>Temporary upgrades</button>
			<Show when={open2()}>
				<TempList {...props} />
			</Show>
		</div>
	</div>
}