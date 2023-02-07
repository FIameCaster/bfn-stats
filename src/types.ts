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
	draggable?: boolean | "true" | "false"
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

type Character = {
	id: number
	iconId: number
	name: string
	type?: string
	role: "Attack" | "Defend" | "Support" | "Swarm"
	team: "Plant" | "Zombie" 
	primary: Weapon
	alt: Weapon | null
	health: number
	regenRate: number
	regenDelay: number | null
	movement: number[] | null
	zoomSpeed: number
	zoomFov?: number
	shield: number[] | null
	sprintExit?: number
	vehicle?: Character
	owner?: Character
	passenger?: Character
	moveCache?: [number?, number?, number?, number?, number?, number?, number?, number?, number?, number?, number?] | null
	modifiers: number[]
	armor?: number
	abilities?: AbilityType[]
	dashes?: number[][]
	folderName: string
	
	resetStats(): void
	resetCache(): void
	partiallyReset(): void 
	addAbility(): void 

	get moveData(): [number?, number?, number?, number?, number?, number?, number?, number?, number?, number?, number?] | null
	get fullName(): string
}

type Weapon = {
	rof: number
	maxRof?: number
	rofInc: number
	ammoCapacity: number
	reload: number
	ammoPerShot: number
	shotsPerShell: number
	burstSize: number
	burstInterval: number | null
	offsetZ: number
	type: 0 | 1 | 2
	aimTime: number | null
	projectiles: (null | Bullet | Missile)[]
	recoil?: [null | number[], null | number[], ...number[]]
	gunSway?: number[]
	gunSwayZoom?: number[]
	dispersion?: number[]
	charges?: number[][]
	overheat?: number[]
	homing?: number[]
	trapezoid?: number[]
	primeTime?: number
	primeSpeed?: number[]
	cache: [number[], number[]?, number[]?, number[]?, number[]?, number[]?, number?, number?]
	dot?: number[]
	cloud?: [number, number, number, number, [number, number]]
	sideArrows?: number[][]
	arcs?: number[]
	ignoreGrav?: boolean
	multipliers: number[]

	get ammo(): number | null
	get timeToFireClip(): number
	get effectiveRof(): number
	get sustainableRof(): number
	get shotsToOverheat(): number
	get overheatTime(): number | null
	get cooldown(): number | null
	getDamage(distance: number, index: number, crit: boolean, move: boolean): number
	getCloud(distance: number, index: number, move: boolean): number
	getSideArrows(distance: number, index: number): number
	getDmgPerClip(distance: number, crit: boolean, move: boolean): number | null
	getDmgPerOverheat(distance: number, crit: boolean, move: boolean): number | null
	get sprayRange(): number
	travelTime(distance: number, index: number): number | null
	getMaxRange(index: number): number
	getChargeRof(index: number): number
	get dotPS(): number
	getDPS(distance: number, crit: boolean, move: boolean, sustainable?: boolean): number
	getChargeDPS(distance: number, index: number, crit: boolean, move: boolean): number | null
	get splashDPS(): number
	getRecoil(zoom?: boolean): number[]
	get recoilAngle(): number[]
	getDispersion(zoom?: boolean): number[]
}

type Missile = {
	impactDmg: number
	critMultiplier: number
	splashDmg: number
	innerBlastRadius: number
	blastRadius: number
	shockwaveDmg: number
	shockwaveRadius: number
	timeToLive: number
	startSpeed: number
	startSpeedY: number
	engineAccel: number
	maxSpeed: number
	gravity?: number
	radius?: number

	travelTime(distance: number): number
	travelDistance(time: number): number
}

type Bullet = {
	impactDmg: number
	critMultiplier: number
	timeToLive: number
	startSpeed: number
	radius?: number
	splashDmg: number
	innerBlastRadius: number
	blastRadius: number
	shockwaveDmg: number
	shockwaveRadius: number
	gravity: number
	startSpeedY: number
	endSpeed: number
	dragStart: number
	dragEnd: number
	width: number | null
	height: number | null
	maxBounces?: number
	afterBounceGravity?: number
	bounceSpeed?: number

	travelTime(distance: number): number
	travelDistance(time: number): number
}

type Buff = [
	string?, ...number[]
]

type AbilityType = {
	name: string
	cooldown?: number
	deployTime?: number
	backDelay?: number
	duration?: number
	weapon?: Weapon
	object?: [
		number?, number?, number?, number?, number?, number?, number?, number?, number?
	]
	buff?: Buff
	debuff?: Buff
	spreadRad?: number
	buff2?: Buff
	buffZone?: number[]
	charges?: number
	stamina?: number
	decayRate?: number
	decayRateM?: number
	explosion?: [number, number, number?]
	explosionDelay?: number
	vehicle?: [
		number, number, number, number, number?, number?, number?, Weapon?, 
		number?, number?, number?, number?, number?, number?, number?, number?
	]
	beam?: number[]
	healSpray?: number[]
	warpDist?: number
	healRate?: number
	healRad?: number
	linkUpRange?: number
	spottingRange?: number
	allyArmor?: number
}

interface PageContainerEventMap {
	"navigated": CustomEvent<unknown>
}
interface PageContainer extends HTMLDivElement { 
  addEventListener<K extends keyof PageContainerEventMap>(type: K, listener: (this: PageContainer, ev: PageContainerEventMap[K]) => void): void
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: PageContainer, ev: HTMLElementEventMap[K]) => void): void
	dispatchEvent<K extends keyof PageContainerEventMap>(ev: PageContainerEventMap[K]): boolean
}
