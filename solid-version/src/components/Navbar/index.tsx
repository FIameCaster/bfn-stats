import { Outlet, A } from "@solidjs/router" 
import { createSignal, Show } from "solid-js"
import { createParamSignal } from "../../hooks/createParamSignal"
import { useDropdownState } from "../../hooks/useDropdownState"
import { clamp, getBaseParam, getParamStr } from "../../utils"

const distanceSignal = createSignal<string>()
const critSignal = createSignal<boolean>()
const moveSignal = createSignal<boolean>()

export function Navbar() {
	const [open] = useDropdownState('.settings')

	const [distance, setDistance] = createParamSignal<string>('d', '0', s => s, s => s, true, distanceSignal)
	const [crit, setCrit] = createParamSignal<boolean>('c', '', b => b ? '1' : '', s => !!s, true, critSignal)
	const [move, setMove] = createParamSignal<boolean>('m', '', b => b ? '1' : '', s => !!s, true, moveSignal)
	const baseParam = getBaseParam()

	return <>
		<div class="bg-pattern"><div/></div>
		<nav>
			<ul class="main-menu">
				<li class="nav-dropdown">
					<button class="nav-link menu-toggle">Classes</button>
					<ul class="dropdown-list">
						<li>
							<A class="nav-link" href={"/" + getParamStr(baseParam())}>List</A>
						</li>
						<li>
							<A class="nav-link" href={"/classes/peashooter" + getParamStr(baseParam())}>
								<span class="dropdown-text">Individual</span><span>Classes</span>
							</A>
						</li>
						<li>
							<A class="nav-link" href={"/compare" + getParamStr(baseParam())}>Compare</A>
						</li>
						<li>
							<A class="nav-link" href={"/ttk" + getParamStr(baseParam())}>TTK</A>
						</li>
					</ul>
				</li>
				<li>
					<A class="nav-link" href={"/about" + getParamStr(baseParam())}>About</A>
				</li>
			</ul>
			<div class="settings">
				<button class="btn">
					<img src="/images/options.webp" alt="Options" />
				</button>
				<Show when={open()}>
					<ul>
						<li class="input-group">
							<label for="dist">Distance</label>
							<input id="dist" type="number" min="0" max="100" value={distance()}
								oninput={e => setDistance(e.currentTarget.value, false)}
								onkeyup={e => {
									e.keyCode > 36 && e.keyCode < 41 && setDistance(clamp(0, +e.currentTarget.value, 100) + '')
								}}
								onBlur={e => setDistance(clamp(0, +e.currentTarget.value, 100) + '')}
							/>
						</li>
						<li class="input-group">
							<label for="crit">Crit damage</label>
							<input 
								type="checkbox" id="crit" checked={crit()}
								oninput={e => setCrit(e.currentTarget.checked)}
							/>
						</li>
						<li class="input-group">
							<label for="move">Moving target</label>
							<input 
								type="checkbox" id="move" checked={move()}
								oninput={e => setMove(e.currentTarget.checked)}
							/>
						</li>
					</ul>
				</Show>
			</div>
		</nav>
		<Outlet />
	</>
}

export const getNavbarSettings = () => [
	clamp(0, +distanceSignal[0](), 100),
	critSignal[0](),
	moveSignal[0]()
] as const
