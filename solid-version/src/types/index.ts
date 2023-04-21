export type Character = {
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

export type Weapon = {
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
	getSplash(index: number): number
	getSpray(distance: number, crit: boolean): number
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

export type Missile = {
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

export type Bullet = {
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

export type Buff = [
	string?, ...number[]
]

export type AbilityType = {
	name: string
	cooldown?: number
	deployTime?: number
	backDelay?: number
	duration?: number
	weapon?: Weapon
	object?: number[]
	buff?: Buff
	debuff?: Buff
	spreadRad?: number
	buff2?: Buff
	buffZone?: number[]
	dash?: number[]
	charges?: number
	stamina?: number
	decayRate?: number
	decayRateM?: number
	explosion?: [number, number, number?]
	vehicle?: [
		number, number, number, number, number?, number?, number?, Weapon?, 
		number?, number?, number?, number?, number?, number?, number?, number?
	]
	explosionDelay?: number
	beam?: number[]
	healSpray?: number[]
	zoomSpray?: number[]
	warpDist?: number
	healRate?: number
	healRad?: number
	linkUpRange?: number
	spottingRange?: number
	allyArmor?: number
	modifiers: number[]
}
