import * as CSS from '../node_modules/csstype/index'

type HTMLAttributes<T> = {
	accessKey?: string
	action?: string
	allowFullscreen?: boolean
	alt?: string
	ariaAtomic?: string
	ariaAutoComplete?: "none" | "inline" | "list" | "both"
	ariaBusy?: boolean
	ariaChecked?: boolean
	ariaColCount?: number
	ariaColIndex?: number
	ariaColSpan?: number
	ariaCurrent?: "page" | "step" | "location" | "date" | "time" | boolean
	ariaDescription?: string
	ariaDisabled?: boolean
	ariaExpanded?: boolean
	ariaHasPopup?: boolean
	ariaHidden?: boolean
	ariaInvalid?: boolean
	ariaKeyShortcuts?: string
	ariaLabel?: string
	ariaLevel?: number
	ariaLive?: "assertive" | "off" | "polite"
	ariaModal?: boolean
	ariaMultiLine?: boolean
	ariaMultiSelectable?: boolean
	ariaOrientation?: "horizontal" | "vertical" | "undefined"
	ariaPlaceholder?: string
	ariaPosInSet?: number
	ariaPressed?: boolean  | "mixed"
	ariaReadOnly?: boolean
	ariaRelevant?: "additions" | "all" | "removals" | "text" | "additions text"
	ariaRequired?: boolean
	ariaRoleDescription?: string
	ariaRowCount?: number
	ariaRowIndex?: number
	ariaRowSpan?: number
	ariaSelected?: boolean
	ariaSetSize?: number
	ariaSort?: "ascending" | "descending" | "none" | "other"
	ariaValueMax?: number
	ariaValueMin?: number
	ariaValueNow?: number
	ariaValueText?: string
	as?: string
	async?: boolean
	autoCapitalize?: string
	autoComplete?: string
	autoFocus?: boolean
	autoPlay?: boolean
	checked?: boolean
	className?: string
	cols?: number
	colSpan?: number
	contentEditable?: boolean | "true" | "false" | "inherit"
	contextMenu?: string
	crossOrigin?: string
	defer?: boolean
	dir?: string
	dirName?: string
	disabled?: boolean
	download?: string
	draggable?: boolean
	form?: string
	formAction?: string
	formEnctype?: string
	formMethod?: string
	formNoValidate?: boolean
	formTarget?: string
	enterKeyHint?: "enter" | "done" | "go" | "next" | "previous" | "search" | "send"
	height?: number
	hidden?: boolean
	href?: string
	hrefLang?: string
	htmlFor?: string
	id?: string
	imagesizes?: string
	imageSrcset?: string
	incremental?: boolean
	indeterminate?: boolean
	inert?: boolean
	innerText?: string
	innerHTML?: string
	inputMode?: "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url"
	is?: string
	isMap?: boolean
	kind?: "subtitles" | "captions" | "desciptions" | "chapters" | "metadata"
	label?: string
	lang?: string
	loop?: boolean
	max?: number | string
	method?: "post" | "get" | "dialog"
	min?: number | string
	muted?: boolean
	name?: string
	nonce?: string
	noValidate?: boolean
	outerHTML?: string
	outerText?: string
	pattern?: string
	placeholder?: string
	poster?: string
	preload?: string
	referrerPolicy?: string
	rel?: string
	required?: boolean
	rows?: number
	rowSpan?: number
	sizes?: string
	slot?: string
	spellCheck?: boolean | "true" | "false"
	src?: string
	srcLang?: string
	srcSet?: string
	step?: number
	tabIndex?: number
	target?: "_self" | "_blank" | "_parent" | "_top"
	textContent?: string
	title?: string
	translate?: boolean
	type?: string
	value?: number | string
	volume?: number
	width?: number
	onabort?: (this: T, ev: UIEvent) => any
	onblur?: (this: T, ev: FocusEvent) => any
	oncancel?: (this: T, ev: Event) => any
	oncanplay?: (this: T, ev: Event) => any
	oncanplaythrough?: (this: T, ev: Event) => any
	onchange?: (this: T, ev: Event) => any
	onclick?: (this: T, ev: MouseEvent) => any
	onclose?: (this: T, ev: Event) => any
	oncontextmenu?: (this: T, ev: MouseEvent) => any
	oncuechange?: (this: T, ev: Event) => any
	ondblclick?: (this: T, ev: MouseEvent) => any
	ondrag?: (this: T, ev: DragEvent) => any
	ondragend?: (this: T, ev: DragEvent) => any
	ondragenter?: (this: T, ev: DragEvent) => any
	ondragleave?: (this: T, ev: DragEvent) => any
	ondragover?: (this: T, ev: DragEvent) => any
	ondragstart?: (this: T, ev: DragEvent) => any
	ondrop?: (this: T, ev: DragEvent) => any
	ondurationchange?: (this: T, ev: Event) => any
	onemptied?: (this: T, ev: Event) => any
	onended?: (this: T, ev: Event) => any
	onerror?: (this: T, ev: Event) => any
	onfocus?: (this: T, ev: FocusEvent) => any
	onformdata?: (this: T, ev: FormDataEvent) => any
	oninput?: (this: T, ev: Event) => any
	oninvalid?: (this: T, ev: Event) => any
	onkeydown?: (this: T, ev: KeyboardEvent) => any
	onkeypress?: (this: T, ev: KeyboardEvent) => any
	onkeyup?: (this: T, ev: KeyboardEvent) => any
	onload?: (this: T, ev: Event) => any
	onloadeddata?: (this: T, ev: Event) => any
	onloadedmetadata?: (this: T, ev: Event) => any
	onloadstart?: (this: T, ev: Event) => any
	onmousedown?: (this: T, ev: MouseEvent) => any
	onmouseenter?: (this: T, ev: MouseEvent) => any
	onmouseleave?: (this: T, ev: MouseEvent) => any
	onmousemove?: (this: T, ev: MouseEvent) => any
	onmouseout?: (this: T, ev: MouseEvent) => any
	onmouseover?: (this: T, ev: MouseEvent) => any
	onmouseup?: (this: T, ev: MouseEvent) => any
	onpause?: (this: T, ev: Event) => any
	onplay?: (this: T, ev: Event) => any
	onplaying?: (this: T, ev: Event) => any
	onprogress?: (this: T, ev: ProgressEvent<EventTarget>) => any
	onratechange?: (this: T, ev: Event) => any
	onreset?: (this: T, ev: Event) => any
	onresize?: (this: T, ev: UIEvent) => any
	onscroll?: (this: T, ev: Event) => any
	onsecuritypolicyviolation?: (this: T, ev: SecurityPolicyViolationEvent) => any
	onseeked?: (this: T, ev: Event) => any
	onseeking?: (this: T, ev: Event) => any
	onselect?: (this: T, ev: Event) => any
	onslotchange?: (this: T, ev: Event) => any
	onstalled?: (this: T, ev: Event) => any
	onsubmit?: (this: T, ev: SubmitEvent) => any
	onsuspend?: (this: T, ev: Event) => any
	ontimeupdate?: (this: T, ev: Event) => any
	ontoggle?: (this: T, ev: Event) => any
	onvolumechange?: (this: T, ev: Event) => any
	onwaiting?: (this: T, ev: Event) => any
	onwheel?: (this: T, ev: WheelEvent) => any
	onauxclick?: (this: T, ev: MouseEvent) => any
	ongotpointercapture?: (this: T, ev: PointerEvent) => any
	onlostpointercapture?: (this: T, ev: PointerEvent) => any
	onpointerdown?: (this: T, ev: PointerEvent) => any
	onpointermove?: (this: T, ev: PointerEvent) => any
	onpointerup?: (this: T, ev: PointerEvent) => any
	onpointercancel?: (this: T, ev: PointerEvent) => any
	onpointerover?: (this: T, ev: PointerEvent) => any
	onpointerout?: (this: T, ev: PointerEvent) => any
	onpointerenter?: (this: T, ev: PointerEvent) => any
	onpointerleave?: (this: T, ev: PointerEvent) => any
	onselectstart?: (this: T, ev: Event) => any
	onselectionchange?: (this: T, ev: Event) => any
	onanimationend?: (this: T, ev: AnimationEvent) => any
	onanimationiteration?: (this: T, ev: AnimationEvent) => any
	onanimationstart?: (this: T, ev: AnimationEvent) => any
	ontouchcancel?: (this: T, ev: TouchEvent) => any
	ontouchend?: (this: T, ev: TouchEvent) => any
	ontouchmove?: (this: T, ev: TouchEvent) => any
	ontouchstart?: (this: T, ev: TouchEvent) => any
	ontransitionrun?: (this: T, ev: TransitionEvent) => any
	ontransitionstart?: (this: T, ev: TransitionEvent) => any
	ontransitionend?: (this: T, ev: TransitionEvent) => any
	ontransitioncancel?: (this: T, ev: TransitionEvent) => any
	oncopy?: (this: T, ev: ClipboardEvent) => any
	oncut?: (this: T, ev: ClipboardEvent) => any
	onpaste?: (this: T, ev: ClipboardEvent) => any
}

// Class types

interface PageContainerEventMap {
	"navigated": CustomEvent<unknown>
}
interface PageContainer extends HTMLDivElement { 
  addEventListener<K extends keyof PageContainerEventMap>(type: K, listener: (this: PageContainer, ev: PageContainerEventMap[K]) => void): void
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: PageContainer, ev: HTMLElementEventMap[K]) => void): void
	dispatchEvent<K extends keyof PageContainerEventMap>(ev: PageContainerEventMap[K]): boolean
}


const element = <T extends keyof HTMLElementTagNameMap>(tagName: T, props?: HTMLAttributes<HTMLElementTagNameMap[T]> | 0, children?: (string | Node)[] | 0, attributes?: object | 0, styles?: CSS.Properties) => {
	const el = document.createElement<T>(tagName)
	children && el.append(...children)
	props && Object.assign(el, props)
	styles && Object.assign(el.style, styles)
	if (attributes) for (const attr in attributes) el.setAttribute(attr, attributes[attr])
	return el
}

const qs = <T extends keyof HTMLElementTagNameMap>(selector: T | string, parent: ParentNode = document) => {
	return parent.querySelector<HTMLElementTagNameMap[T]>(selector)
}

const qsa = <T extends keyof HTMLElementTagNameMap>(selector: T | string, parent: ParentNode = document) => {
	return parent.querySelectorAll<HTMLElementTagNameMap[T]>(selector)
}

const text = (data: string) => document.createTextNode(data)

const round = (num: number, decimals = 2) => Math.round(num * 10 ** decimals) / 10 ** decimals

const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(value, max))

const navbar = (() => {
	const nav = qs('nav', document.body),
	links = qsa('a', nav),
	settings = (() => {
		const labels = ['Distance', 'Crit damage', 'Moving target']
		let distanceCallback: (newVal: number) => any, 
		critCallback: (newVal: boolean) => any, 
		moveCallback: (newVal: boolean) => any,
		searchStr = ''

		const el = qs('.settings', nav),
		updateDistance = () => {
			const val = clamp(0, +distance.value, 100)+''
			distance.value = val
			router.url.setParam('d', val, '0', false)
			updateLinks()
		},
		distance = element('input', {
			type: 'number', id: 'dist', min: 0, max: 100, step: 1, value: 0,
			onkeyup(e) {
				if (e.keyCode > 36 && e.keyCode < 41) updateDistance()
			}, 
			onblur: updateDistance,
			oninput() {
				distanceCallback?.(+distance.value)
			}
		}),
		crit = element('input', {
			type: 'checkbox', id: 'crit',
			onchange() {
				critCallback?.(crit.checked)
				router.url.setParam('c', +crit.checked+'', '0', false)
				updateLinks()
			}
		}),
		move = element('input', {
			type: 'checkbox', id: 'move',
			onchange() {
				moveCallback?.(move.checked)
				router.url.setParam('m', +move.checked+'', '0', false)
				updateLinks()
			}
		}),
		updateLinks = () => {
			searchStr = ((distance.value != '0' ? '&d=' + distance.value : '') + (crit.checked ? '&c=1' : '') + (move.checked ? '&m=1' : '')).replace('&', '?')
			links.forEach(link => link.href = link.getAttribute('href').split('?')[0] + searchStr)
		};

		el.onclick = e => {
			if ((<HTMLElement>e.target).tagName == 'BUTTON') el.classList.toggle('open')
			e.stopPropagation()
		}
		addEventListener('click', () => el.className = 'settings')
		addEventListener('click', e => {
			// Preventing link navigation site wide

			if ((<HTMLElement>e.target).tagName != 'A' || (<HTMLAnchorElement>e.target).target) return
			if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) e.stopPropagation()
			else e.preventDefault()

		}, { capture: true })

		el.append(
			element('ul', 0, [distance, crit, move].map((input, i) => (
				element('li', { className: 'input-group' }, [
					element('label', {
						htmlFor: input.id, textContent: labels[i]
					}),
					input
				])
			)))
		)
		
		links.forEach(link => link.onclick = e => {
			router.goTo(link.href)
		})

		return {
			el, updateLinks,
			get searchStr() { return searchStr }, 
			get state(): [number, boolean, boolean] { return [+distance.value, crit.checked, move.checked] },
			set state(newState: [unknown, boolean, boolean]) { 
				[distance.value, crit.checked, move.checked] = <[string, boolean, boolean]>newState
			},
			set updateCallbacks(callbacks: [(newVal: number) => any, (newVal: boolean) => any, (newVal: boolean) => any]) {
				[distanceCallback, critCallback, moveCallback] = callbacks
			}
		}

	})()

	return {
		nav, links,
		settings
	}

})()

const router = (() => {
	const getPath = (url: string) => url.split('?')[0].slice(originLength),
	getKey = (path = pathname) => path.split('/')[1],
	fireEvent = (target: PageContainer) => void target.dispatchEvent(new CustomEvent('navigated',))

	// Saving reference to link elements so their rel-attribute can be changed to "stylesheet" later to load them
	const prefetchedStylesheets: {
		[key: string]: HTMLLinkElement
	} = {},

	prefetchStylesheets = (names: string[]) => names.map(name => {
		return prefetchedStylesheets[name] = element('link', { rel: 'prefetch', href: `/css/${name}.css`, as: 'style' })
	}),

	prefetchScripts = (names: string[]) => names.map(name => {
		return element('link', { rel: 'prefetch', href: `/dest/${name}.js`, as: 'script' })
	}),

	prefetch = (names: string[]) => {
		if (!prefetchedStylesheets[names[0]]) document.head.append(...prefetchStylesheets(names), ...prefetchScripts(names))
	}
	
	// Keeping html extensions so it still works with them
	const scriptNames = {
		'': 'list',
		'index.html': 'list',
		'ttk': 'ttk',
		'ttk.html': 'ttk',
		'classes': 'classes',
		'about': 'about',
		'about.html': 'about',
		'compare.html': 'compare',
		'compare': 'compare'
	} as const,
	documents: {
		[key: string]: string
	} = {},
	originLength = location.origin.length

	let params = new URLSearchParams(location.search),
	pathname = location.pathname, prevKey = getKey(),
	disallowNav = false, cancelledNav = false
	const cache: {
		[key: string]: [PageContainer, string]
	} = {
		[prevKey]: [
			<PageContainer>navbar.nav.nextElementSibling,
			document.title
		]
	}
	const icon = <HTMLLinkElement>qs('[sizes]'), icon2 = <HTMLLinkElement>icon.nextElementSibling

	onload = () => setTimeout(() => {
		const names: string[] = []

		navbar.links.forEach(async link => {
			const key = getKey(getPath(link.href))
			if (prevKey == key) return
			names.push(scriptNames[key])
			const res = await fetch(key == 'classes' ? '/classes/content.txt' : link.href)
			documents[key] = await res.text()
		})
		document.head.append(...['Medium', 'Bold'].map(text =>
			element('link', { rel: 'prefetch', href: `/fonts/Roboto-${text}.woff2`, as: 'font', type: 'font/woff2', crossOrigin: '' })
		))
		prefetch(names)
		if (!pathname.includes('abilities')) document.head.append(prefetchScripts(['abilities'])[0])
		if (prevKey[0] != 'c') document.head.append(prefetchScripts(['upgrades'])[0])
		if (prevKey.startsWith('about'))document.head.append(prefetchScripts(['stats'])[0])
	})

	addEventListener('popstate', () => {
		if (disallowNav) return cancelledNav = true
		pathname = location.pathname
		params = new URLSearchParams(location.search)
		router.goTo(location.href, true)
	})

	return {
		goTo(url: string, dontScroll?: boolean): void {
			const path = getPath(url), key = getKey(path), search = url.split('?')[1]
			if (url != location.href) {
				history.pushState({}, '', url)
				pathname = path
				params = new URLSearchParams(location.search)
			}
			if (search) params = new URLSearchParams(search)
			if (prevKey != key && prevKey == 'classes') router.updateIcon('Peashooter')
			if (prevKey == (prevKey = key)) return fireEvent(<PageContainer>navbar.nav.nextElementSibling)
			const currentCache = cache[key]
			if (currentCache) {
				navbar.nav.nextElementSibling.replaceWith(currentCache[0])
				if (currentCache[1]) document.title = currentCache[1]
				if (!dontScroll) scrollTo(0, 0)
				return fireEvent(currentCache[0])
			}
		
			const html = documents[key]
			if (!html) return void setTimeout(router.goTo, 500, url, dontScroll)
			const content = <HTMLDivElement>document.createRange().createContextualFragment(html.slice(html.indexOf('<div id='), html.lastIndexOf('</div>') + 6)).firstChild,
			title = html.startsWith('<div') ? '' : document.title = html.slice(html.indexOf('<title>') + 7, html.indexOf('</title>'))

			disallowNav = true

			const script = element('script', { type: 'module', onload() {
				disallowNav = false
				if (cancelledNav != (cancelledNav = false)) router.goTo(location.href, dontScroll)
			}, src: `/dest/${scriptNames[key]}.js` }),

			styleSheet = prefetchedStylesheets[scriptNames[key]]

			styleSheet.onload = () => {
				navbar.nav.nextElementSibling.replaceWith(content)
				if (!dontScroll) scrollTo(0, 0)
				document.head.append(script)
			}
			styleSheet.rel = 'stylesheet'

			cache[key] = [
				content, title
			]
		},
		prefetch,
		prefetchedStylesheets,
		url: {
			getParam(name: string) {
				return params.get(name)
			},
			getParams(...names: string[]) {
				return names.map(name => params.get(name))
			},
			setParam(name: string, value: string, defaultValue: string, pushState?: boolean) {
				if (value == defaultValue) params.delete(name)
				else params.set(name, value)
				if (pushState != null) history[pushState ? 'pushState' : 'replaceState']({}, '', pathname + (params+'' && `?${params}`))
			},
			goTo(href: string) {
				// Only used on classes pages since they have their own router
				const url = new URL(location.origin + href)
				pathname = url.pathname
				params = url.searchParams
				history.pushState({}, '', href)
			}
		},
		updateIcon(name: string) {
			icon.href = `/images/icons/small/${name}.png`
			icon2.href = `/images/icons/medium/${name}.png`
		}
	}
})()

const setWidth = () => width = document.documentElement.getBoundingClientRect().width
let width: number
setWidth()
addEventListener('resize', setWidth)

export { qs, qsa, element, navbar, round, clamp, text, router, width, PageContainer }