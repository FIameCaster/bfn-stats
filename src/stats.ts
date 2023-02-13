import { navbar } from './router.js'

export const stats = (() => {

	let getAbilities: (index: number, modifiers: number[]) => AbilityType[]

	const defaultSpeed = [6.2, 1.5, .95, .75]
	const defaultMovement = [6.2, 1.5, .95, .75, 2.8, .83, .45]
	const effectiveTime = (time: number) => Math.floor(time * 30) / 30

	const roles = ["Attack", "Defend", "Support", "Swarm"] as const

	const weaponData = [
		[100,10,1.5,,,,[[20,1,1.5,170,,[14,3.25]]],[[1.25,2.5,.375,-.25,-.125,3.75],[1.25,2.5,.375,-.25,-.125,3.75],1,1,3.25,-.25,.275,100]],
		[100,,,,,,,[,,0,0,5,-.05,.05,100],,,,,,,[40.55,4.5,.5,2.25,5,3.4]],
		[72,,,,.02,,[[34,1.2,2.2,400,,,34,,250,20,35]],[,,0,0,0,-.417,.3,50],,,[0,1,1,.85,.5,.125,.125,1]],
		[650,52,1.1,,,2/75,[[5.2,1.2,2,500,,,10,,350,30,60]],[[4.2,7,.046,-.154,.154,12.6],[4.5,7.5,.049,-.112,.112,13.5],.1,2.5,3.5,0,.0055,50],[.24,.24,1.2,.6,.6,1.2,.012,.012,0,9],[0,0,.6,.24,.24,.6,.006,.006,0,4.5],[0,0,0,7,3,0,0,.25]],
		[200,20,1.5,,.65,,[[18,1,3,300,,,10,1.3,75,15,20,.5,.1]],[,,1,1,.1,0,.1,100],,,[0,4.5,2.8,10,1,1,.5,1]],
		[525,,,,.5,.1,[[6.5,1,.5,75,.55,,,,32,12,19]],[[1.25,2.5,.55,-.188,.188,3.75],,1,1,0,0,0,100],,,,,[.018,0,.3,.5,.75,.05]],
		[85,,,,.5,.1,[[21,1.2,1.5,320,,[10,1.25],20,,80,20,35]],[,[.625,2.5,.375,-.25,-.125,3.75],1,1,6,-2,.05,100],,[.063,.063,.063,.088,.088,.088,.025,.025,.025,1.25],,,[.1,0,.3,1,.75,.05]],
		[480,40,2,,.2,.37,[[6.5,1.2,3,450,,,10,.3,170,20,50]],[[.34,.6,.02,-.05,.05,3],,0,1,-1.8,.0075,.01,100],[0,.1,.5,.4,.4,2,.05,.07,.095,1.5],,[0,3.5,1.65,12,3,0,0,1]],
		[150,40,2,,,.37,[[4.5,1.4,5,4000],[14.13,1.4,5,4000],[34,1.4,5,4000],[61.2,1.61,5,4000]],[,[7.5,5,.055,-.075,.075,2.2],0,1,1.25,0,.4,45],,[-.04,.2,.21,1,.4,.8,.1,.05,.05,2],,[[.5,0,4,10],[1,0,7,20],[1.5,0,8,40]]],
		[400,50,2,3,.25,,[[3,1.2,2.2,550,,,10,.1,350,50,80]],[[10,10,.05,-.1,.1,18],,.1,2.5,.85,-.45,.008,100],[-.25,0,0,1.3,1.55,2,.02,.04,.55,12],,[0,2.2,.8,12,3,0,0,1],,,,[3,8,1,1.5,1,2]],
		[525,45,1.3,,,.08,[[6.6,1.2,3,390,,,10,,250,40,70]],[[2.15,1.6,.17,-.225,.225,10.5],[6.6,1.6,.19,-.2,.2,10.5],.1,3.5,-.6,.3,.015,30],[0,.4,.75,.35,1,1.5,.065,.08,.03,5],[-.4,.2,.4,.15,.5,.85,.015,.05,.03,5],[0,3,1.2,15,1.25,0,0,.25]],
		[85,10,1.5,,,,[[24,1,4,120,.17,[16,3.25],,,60,30,50]],[[8,8,2,-.24,.08,14.4],[8.5,8.5,1.594,-.255,.085,15.3],.1,1,-10,0,.01,25]],
		[420,40,1.85,,,1/75,[[8,1.2,2,650,,,10,,300,20,40]],[[4,3,.065,-.07,.07,12],[4,3,.025,-.035,.035,15],.1,2.5,2.5,-.05,.0075,75],[0,.094,.225,.1,.138,.5,.004,.006,.021,3.75],[-.05,.045,.225,.075,.1,.5,.003,.004,.021,3.75],[.15,2.5,1.75,12,0,0,0,.25]],
		[200,20,1.9,,,2/75,[[12,1.2,0,5,80,0,15,250]],[[8,8,.136,-.376,0,14.4],[8.5,8.5,.128,-.085,.085,15.3],.1,1,3.5,15,.0027,25],[.16,.16,.16,.16,.16,.16,0,0,0,.16],,[.5,7.5,5.15,15,3,0,0,.25],,,[0,.2,2,45,1]],
		[284,35,1.5,,,,[[11,1.2,3,350,,,15,,180,20,50]],[[.9,1.8,.012,-.18,.18,12],[1.8,3,.015,-.06,.06,12],1,1,0,0,0,100],,,[0,5.3,4.15,20,.7,.2,0,.25]],
		[550,40,2,,,.005,[[5.67,1.2,1.5,450,,,36,,350,20,40]],[[10.2,8.5,.136,-.111,.111,8.5],[10.2,8.5,.14,-.111,.111,5.95],.05,1.25,2.75,0,.008,50],[0,.4,1.5,1.65,2.05,2.15,.079,.079,.079,10],[-.05,.2,.75,1.65,2.05,2.15,.039,.039,.039,10],[0,1.65,.0785,10,1.5,.4,-1.5,.5]],
		[725,56,1.125,,,,[[4.5,1.2,3,500,,,10,,150,15,25]],[[7,1,.155,-.4,.4,16],[4.75,1,.18,-.2,.2,16],.1,2.5,3,-.1,.008,65],,,[0,3,.98,8,.75,.2,0,.65]],
		[816,,,,,0,[[5,1.2,1.25,600,,,10,,400,20,50]],[[5,5,.08,-.125,.125,20],[5,5,.08,-.125,.125,20],.1,2.5,-1.5,-.8,.008,30],[.4,.6,3,1.4,1.6,3,.05,.075,0,5],[.4,.4,3,1.4,1.1,3,.05,.05,0,5],[.5,3,.1,5,0,0,0,.25],,[0,.23,.57,.3,1,.05]],
		[144,,,,,,[,[22.9,1,.26,105,.35],[50,1,.26,105,.425],[71.4,1,.26,105,.6]],[[4,8,2,-.8,.8,16],,.1,1,1.5,0,.1,100],[0,.08,.24,.32,.4,.24,.08,.08,0,.8],,,[[.35,.6],[.8,.6],[1.5,.6]],,,[107/3,4.5,.5,2.25,5,3.4]],
		[180,,,,,0,[[17,1.2,3,350,,,10,,220,50,80],[32,1.2,3,400,,,10,,320,50,80],[50,1.2,3,450,,[15,2.75],10,,400,50,80]],[[10,10,.5,-.35,.35,10],[10,10,.125,-.088,.088,10],.1,1,0,0,0,100],[.35,.35,.35,.35,.35,.35,0,0,0,5.25],[.088,.088,.088,.088,.088,.088,0,0,0,1.313],,[[.5,.3,,3,2,7,2],[1.75,.3,,6,4,14,12,1/3]]],
		[190,18,1.395,,,0,[[14.9,1.2,5,650,,,,,400,20,40]],[[7,3.5,.75,-.09,.09,18],[5,1.5,.35,-.025,.025,18],.1,1,.8,0,.29,30],[0,.2,.2,.85,1,1,.25,.1,.1,15],[0,.2,.2,.85,1,1,.125,.1,.1,15],[0,2.25,.65,15,1.75,0,0,.25]],
		[90,20,1.975,13,,.37,[[2.36,1.2,.4,450,,,10,,160,10,20]],[[2.5,2.5,1.875,-.088,.088,3.75],,2,1,0,-.25,.3,100],,,[,,,,,,,1,2.088],,,,[4.72,8.5,1,3,1,3]],
		[150,20,1.975,,,.37,[[4.5,1.4,5,4000],[14.13,1.4,5,4000],[34,1.4,5,4000],[61.2,1.61,5,4000]],[,[7.5,5,.055,-.075,.075,2.2],0,1,1.25,0,.4,45],,[-.04,.2,.21,1,.4,.8,.1,.05,.05,2],,[[.5,0,2,10],[1,0,3,20],[1.5,0,4,40]]],
		[570,,,,-.45,.006,[[7,1.2,2.2,480,,,20,.3,200,25,45]],[[10,10,.032,-.185,.185,18],[10,10,.035,-.25,.25,18],.1,1.8,3,-1,.008,70],[0,.25,1.2,.4,1.2,2,.003,.008,.03,25],[-.15,.15,.85,.75,1.85,2,.003,.008,.03,25],[.22,2.75,2.53,7.5,0,.65,0,.575],,[0,.135,.4,.4,1,.05]],
		[400,42,2.5,,,,[[6.5,1.2,0,5,300,0,0,300]],,,,[.1,5,2.55,16,3,0,0,.25],,,[2/3,1/3,2.5,35,1]],
		[700,54,1.5,,,0,[[9.2,1.2,1.5,620,,,,,400,20,50]],[[3.2,1.04,.64,-.12,.12,12],[1.7,.85,.34,-.085,.085,12.75],1,1,0,0,0,25],[0,0,0,1.48,1.8,6.4,.2,.368,.8,6.8],[0,0,0,.75,1,3.25,.063,.13,.25,4.25]],
		[90,10,2.2,11,,,[[2.84,1.2,2.2,300,,,10,2,100,12,20]],[[1.25,2.5,.375,-.25,-.125,3.75],[1.25,2.5,.375,-.25,-.125,3.75],1,1,0,-.25,.3,30],,,[,,,,,,,.4,1.352]],
		[90,10,1.9,,.15,,[[12.8,1,4,48,.35,[25,2.5],20,2.5,,,]],[[1.25,2.5,.375,-.25,-.125,3.75],[.625,2.5,.375,-.25,-.125,3.75],1,1,6,-2,.3,100]],
		[165,16,1.5,,,,[[18,1.2,1.5,500,,,,,200,15,35],[0,1,0,5,7.5,0,10,15]],[[10,10,.05,-.05,.05,18],[10,10,.05,-.05,.05,18],.1,1,.8,0,.29,25],,,,[[1.6,11/30,4]]],
		[330,45,2,,,,[[2.75,1.2,[5,1.8],1.5,200,0,0,200]],[,,1,1,.5,-.1,.1,100],,,[0,1,1,15,0,0,0,.25],,,[0,.1,2.5,30,1]],
		[280,25,1.5,,.1,.01,[[11,1.2,5,350,,,15,,180,20,50]],[[12,10,.25,-.18,.18,20],[12,10,.225,-.165,.165,20],.1,1.15,1.5,.05,.002,60],[.038,.12,.25,.25,.3,.75,.008,.01,.038,3.75],[0,.023,.12,.075,.083,.3,.002,.002,.015,2.25],[0,10,4.07,20,3.5,1.25,0,.75]],
		[800,,,,,,[[5,1.2,2.2,500,,,9.8]],,,,[0,1.85,.975,15,0,0,0,.25],,[.0115,0,2/3,2/3,.75,.05]]
	]
	
	const charData: [string, string | undefined, number | undefined, number, number | undefined, number, number[] | undefined, number, number | undefined, number[]?][] = [
		["Peashooter",,,1,,125,defaultMovement,.5,35],
		["Chomper",,,2,3,175,defaultMovement,.5,35],
		["Kernel Corn",,,4,,125,defaultMovement,.5,35],
		["Night Cap",,,5,,75,[...defaultMovement,.7,.25,1.5178],.5,45],
		["Snapdragon",,,6,7,175,[...defaultSpeed,2.8,.28],.5,35],
		["Cactus",,1,8,9,100,defaultMovement,.5,20],
		["Citron",,1,10,,200,[6.2,1071/620,.95,.75,2.8,.83,.45],1,,[600,54,2.5,.8,.8]],
		["Acorn",,1,11,,75,defaultMovement,.5,35],
		["Sunflower",,2,13,,100,defaultMovement,.5,35],
		["Rose",,2,14,,100,[...defaultSpeed, 3.75,.1,.95],.5,35],
		["Wildflower",,3,15,,100,defaultMovement,.5,35],
		["Foot Soldier",,,16,,125,defaultMovement,.5,35],
		["Imp",,,17,,75,[...defaultSpeed,1.65,.83,.45,1.1,1],.5,45],
		["Super Brainz",,,19,,175,defaultMovement,1,,[160,32/3,0,1.25,.9]],
		["80s Action Hero",,,20,,150,defaultMovement,.5,30],
		["Electric Slide",,,21,,125,defaultMovement,.5,30],
		["Captain Deadbeard",,1,22,23,100,[...defaultSpeed,2.782,.83,.45],.5,20],
		["All-Star",,1,24,,200,defaultMovement,1,35],
		["Space Cadet",,1,25,,125,[...defaultSpeed,2.8,.28,,1.9],.5,25],
		["Scientist",,2,27,,100,defaultMovement,.5,45],
		["Engineer",,2,28,,125,defaultMovement,.5,40],
		["Wizard",,2,29,,125,defaultMovement,.5,40],
		["TV Head",,3,31,,100,defaultMovement,.5,35],
		["Oak",,1,12,,300,[6.2,0,.95,.75,1.3,.83,.45],.5,35],
		["Z-Mech",,,18,,350,defaultMovement,1,35],
		["Space Station",,1,26,,275,[6.2,,.95,.75,1.5,.28,,1.7],.5,35],
		["Acorn","Passenger",1,32,,75,,1,35],
		["Space Cadet","Passenger",1,25,,100,,1,35],
		["Wizard","Co‑Star",2,30,,65,,1,35]
	]

	const addExplosion = (obj: Missile | Bullet, data: number | number[]): void => {
		if (Array.isArray(data)) {
			obj.splashDmg = data[0]
			obj.blastRadius = data[1]
			obj.innerBlastRadius = data[2] ?? data[1]
			obj.shockwaveDmg = data[4] ?? 5
			obj.shockwaveRadius = data[3] ?? data[1] + .25
		}
		else obj.splashDmg = obj.blastRadius = obj.innerBlastRadius = obj.shockwaveDmg = obj.shockwaveDmg = 0
	}

	class Bullet {
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

		constructor(data: any[]) {
			[
				this.impactDmg,
				this.critMultiplier,
				this.timeToLive,
				this.startSpeed,
			] = data

			addExplosion(this, data[5])

			this.radius = data[4] || 0
			this.gravity = data[6] || 0
			this.startSpeedY = data[7] || 0
			this.endSpeed = data[8] || this.startSpeed
			this.dragStart = data[9] || 0
			this.dragEnd = data[10] || 0
			this.width = data[11]
			this.height = data[12]
		}
		travelTime(distance: number): number {
			const fs = this.dragStart, fe = this.dragEnd,
			ss = this.startSpeed, se = this.endSpeed
			if (!ss || distance <= 0) return 0
			if (distance <= fs || ss == se) return distance / ss
			if (distance >= fe) return fs / ss + (fe - fs) / (ss + se) * 2 + (distance - fe) / se
			const ss2se2 = (ss + se) * (ss - se)
			// Solved quadratic
			return fs / ss + 2 * (fs - fe) * ((ss * ss + ss2se2 * (distance - fs) / (fs - fe)) ** .5 - ss) / ss2se2
		}
		travelDistance(time: number): number {
			const fs = this.dragStart || 0, fe = this.dragEnd || 0,
			ss = this.startSpeed, se = this.endSpeed
			if (ss == se || time <= fs / ss) return ss * time
			time -= fs / ss
			const dragTime = (fe - fs) / (ss + se) * 2
			if (time >= dragTime) return fe + (time - dragTime) * se
			return fs + time * (ss - time * (ss + se) * (ss - se) / (4 * (fe - fs)))
		}
	}
	
	class Missile {
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
		
		constructor(data: number[]) {
			[
				this.impactDmg,
				this.critMultiplier,,
				this.timeToLive,
				this.startSpeed,
				this.startSpeedY,
				this.engineAccel,
				this.maxSpeed
			] = data

			addExplosion(this, data[2])
			this.radius = data[0] == 50 ? .5 : data[0] == 100 ? .525 : 0
		}
		
		travelTime(distance: number): number {
			const ss = this.startSpeed, 
			se = this.maxSpeed, 
			a = this.engineAccel
			
			if (distance <= 0) return 0
			if (!a) return distance / ss
			const accelDist = (se + ss) * (se - ss) / (2 * a)
			if (distance >= accelDist) return (distance - accelDist) / se + (se - ss) / a
			return ((ss * ss + 2 * a * distance) ** .5 - ss) / a
		}
		travelDistance(time: number): number {
			const ss = this.startSpeed, 
			se = this.maxSpeed, 
			a = this.engineAccel
			
			if (!a) return ss * time
			if (time > (se - ss) / a) return (se + ss) * (se - ss) / (2 * a) + se * (time + (ss - se) / a)
			return time * (ss + time * a * .5)
		}
		
	}
	
	const weaponPropData: [string, number?][] = [
		["recoil", 2],
		["gunSway"],
		["gunSwayZoom"],
		["dispersion"],
		["charges",3],
		["overheat"],
		["homing"],
		["trapezoid"]
	]

	class Weapon {
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

		constructor(data: any[], type: 0 | 1 | 2, modifiers: number[]) {
			[
				this.rof,
				this.ammoCapacity,
				this.reload,,,
				this.aimTime
			] = data
			this.rofInc = 0
			this.offsetZ = data[4] || 0
			this.shotsPerShell = data[3] || 1
			this.ammoPerShot = data[3] == 13 || data[0] == 150 && data[1] == 40 ? 2 : data[1] ? 1 : null
			this.burstSize = data[0] == 700 || data[0] == 144 ? 3 : null
			this.burstInterval = data[0] == 700 ? .2 : data[0] == 144 ? .7 : null
			this.cache = [[]]
			if (data[0] == 570) {
				this.primeSpeed = [.6, 0.5, 19/30]
				this.primeTime = .9
			}
			this.sideArrows = data[0] == 180 ? [[4,30,1.5],[2,30,4.1]] : null
			this.cloud = data[0] == 165 ? [1,5,1/12,1.4,[25,20]] : data[0] == 58 ? [0,10,.25,1.4,[72,20]] : null
			this.multipliers = modifiers
			if (data[0] == 190) this.arcs = [14,6,2]
			
			// 0 for normal weapon, 1 for no-zoom only, 2 for zoom only
			this.type = type
			this.projectiles = data[6] ? data[6].map((arr: number[]) => new (arr.length == 8 ? Missile : Bullet)(arr)) : []
			// Ensuring weapon can be modified without mutating the weaponData array
			for (let i = 0; i < 8; i++) {
				if (!data[i + 7]) continue
				const [prop, index1] = weaponPropData[i]
				this[prop] = data[i + 7].slice()
				if (index1) for (let i = 0; i < index1; i++) {
					if (this[prop][i]) this[prop][i] = this[prop][i].slice()
				}
			}
		}

		get ammo(): number | null {
			return this.ammoCapacity ? Math.floor(this.ammoCapacity * this.multipliers[5]) : null
		}

		get timeToFireClip(): number {
			if (this.cache[6]) return this.cache[6]
			const ammo = this.ammo / this.ammoPerShot
			if (!ammo) return 0
			if (this.burstInterval) {
				const bursts = Math.ceil(ammo / this.burstSize)
				return this.cache[6] = (bursts - 1) * this.burstInterval + (ammo - bursts) * 60 / this.rof
			}
			if (this.rofInc) {
				let time = 0, inc = this.rofInc, rof = this.rof + inc
				for (let i = 1; i < ammo; i++) {
					time += 60 / (rof = Math.min(rof + inc, this.maxRof))
				}
				return this.cache[6] = time
			}
			return this.cache[6] = (ammo - 1) / this.rof * 60 
		}

		get effectiveRof(): number {
			const burst = this.burstSize
			if (burst) return burst / ((burst - 1) / this.rof * 60 + this.burstInterval)
			if (this.rofInc) return (this.ammo - 1) / this.timeToFireClip 
			return this.rof / 60
		}

		get sustainableRof(): number {
			if (this.cache[7]) return this.cache[7]
			if (this.ammo) return this.cache[7] = this.ammo / this.ammoPerShot / effectiveTime(this.timeToFireClip + this.reload + 1 / 30)
			if (!this.overheat) return this.cache[7] = this.effectiveRof
			const shots = this.shotsToOverheat - 1, heat = this.overheat
			return this.cache[7] = shots / Math.ceil(2 + shots * 1800 / this.rof + 30 * (heat[3] + (heat[0] ? heat[0] * shots : (shots - 1) * 60 / this.rof * heat[1] / heat[2]))) * 30
		}

		get shotsToOverheat(): number {
			const heat = this.overheat
			if (!heat) return Infinity
			return Math.ceil(heat[0] ? 1 / heat[0] : 1 / (60 * heat[1]) * this.rof + 1)
		}

		get overheatTime(): number | null {
			const shots = this.shotsToOverheat - 1
			if (shots == Infinity) return null
			return Math.floor(shots / this.rof * 1800) / 30
		}

		get cooldown(): number | null {
			const heat = this.overheat
			if (!heat) return null
			return heat[4] + (1 - heat[5]) / heat[2]
		}

		getSplash(index: number) {
			return this.projectiles[index] && this.projectiles[index].splashDmg * this.shotsPerShell * this.multipliers[6]
		}

		getDamage(distance: number, index: number, crit: boolean, move: boolean): number {
			const bullet = this.projectiles[index], 
			trapezoid = index ? null : this.trapezoid,
			critMultiplier = crit && bullet?.critMultiplier || 1
			
			return !trapezoid && !bullet ? null : ((this.getMaxRange(index) >= distance ? 
				((bullet?.splashDmg || 0) + (bullet ? bullet.impactDmg * critMultiplier : 0)) * this.shotsPerShell : 0)
				+ (trapezoid && this.sprayRange >= distance ? trapezoid[0] * (crit ? this.multipliers[7] : 1) : 0)
				+ this.getCloud(distance, index, move) + this.getSideArrows(distance, index) * critMultiplier) * this.multipliers[6]
		}

		getCloud(distance: number, index: number, move: boolean): number {
			if (index != this.cloud?.[0] || distance > this.getMaxRange(index) + this.cloud[3]) return 0
			return this.cloud[4][move ? 1 : 0]
		}

		getSideArrows(distance: number, index: number): number {
			if (!this.sideArrows?.[index]) return 0
			const [min, dist, dmg] = this.sideArrows[index]
			return Math.min(min, Math.floor(dist / distance)) * dmg
		}

		getDmgPerClip(distance: number, crit: boolean, move: boolean): number | null {
			return this.ammoCapacity ? this.ammo * this.getDamage(distance, 0, crit, move) / this.ammoPerShot : null
		}

		getDmgPerOverheat(distance: number, crit: boolean, move: boolean): number | null {
			if (!this.overheat) return null
			return this.shotsToOverheat * this.getDamage(distance, 0, crit, move)
		}

		get sprayRange(): number {
			return this.trapezoid ? this.trapezoid[1] + this.trapezoid[2] : 0
		}

		travelTime(distance: number, index: number): number | null {
			return this.getMaxRange(index) >= distance ? this.projectiles[index]?.travelTime(distance - this.offsetZ) : null
		}

		getMaxRange(index: number): number {
			const cache = this.cache[0], 
			projectile = this.projectiles[index]
			if (cache[index] != null) return cache[index]
			if (!projectile) return cache[index] = 0
			if (!projectile.startSpeed) return cache[index] = projectile.timeToLive
			const time = projectile.timeToLive, grav = this.ignoreGrav ? 0 : projectile.gravity,
			distance = projectile.travelDistance(time)
			return cache[index] = this.offsetZ + (grav ? (distance * distance - (grav / 2 * time * time - projectile.startSpeedY * time) ** 2) ** .5 : distance)
		}

		getChargeRof(index: number): number {
			const charge = this.charges?.[index]
			if (!charge) return 0
			return Math.min(this.rof / 60, 30 / Math.ceil((charge[0] * this.multipliers[0] * this.multipliers[1] + charge[1]) * 30 + 1))
		}

		get dotPS(): number {
			return this.dot ? this.dot[0] / this.dot[1] : 0
		}

		getDPS(distance: number, crit: boolean, move: boolean, sustainable?: boolean): number {
			if (!this.rof || sustainable && !this.sustainableRof) return null
			const dmg = this.getDamage(distance, 0, crit, move)
			return dmg * (sustainable ? this.sustainableRof : this.effectiveRof) + (dmg && this.dotPS)
		}

		getChargeDPS(distance: number, index: number, crit: boolean, move: boolean): number | null {
			if (!this.charges?.[index] || !this.projectiles[index + 1]) return null
			return this.getChargeRof(index) * this.getDamage(distance, index + 1, crit, move)
		}

		get splashDPS(): number {
			return (this.projectiles[0]?.splashDmg || 0) * this.effectiveRof
		}

		getRecoil(zoom?: boolean) {
			const index = zoom ? 1 : 0
			if (this.cache[index + 1]) return this.cache[zoom ? 2 : 1]
			const recoil = this.recoil?.[index] || (this.type ? null : this.recoil?.[0])
			if (!recoil) return this.cache[index + 1] = null
			const [maxAmpY, maxAmp, ampIncY, minAmpInc, maxAmpInc, decFactor] = recoil

			return this.cache[index + 1] = [
				maxAmpY, maxAmp, ampIncY, (minAmpInc + maxAmpInc) / 2, 
				Math.abs((maxAmpInc - minAmpInc) / 2), decFactor, 
				decFactor * this.recoil[2], this.recoil[3]
			]
		}

		get recoilAngle(): number[] {
			const recoil = this.recoil
			if (this.cache[5]) return this.cache[5]
			if (recoil?.[4] == null) return this.cache[5] = null
			const scale = (this.rof / 60 || 1) * recoil[6]
			return this.cache[5] = [
				recoil[4] * scale, recoil[5] * scale, recoil[6], recoil[7]
			]
		}

		getDispersion(zoom?: boolean) {
			const index = zoom ? 4 : 3
			if (this.cache[index]) return this.cache[index]
			if (!this.dispersion || (this.type && this.type + 2 != index)) return this.cache[index] = null
			const [minAngle, maxAngle, incPerShot, decrease, jumpDisp, moveDisp, moveDispZoom, zoomScale, shellDisp] = this.dispersion
			const result = [
				minAngle, maxAngle, incPerShot, incPerShot && Math.max(0, incPerShot - decrease * 60 / this.rof), 
				decrease, jumpDisp, zoom ? moveDispZoom : moveDisp, shellDisp
			]

			return this.cache[index] = zoom ? result.map(num => num && num * zoomScale) : result
		}

	}

	class Character {
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

		constructor(id: number) {
			this.id = id
			this.iconId = id > 25 ? [7,18,21][id - 26] : id
			this.resetStats()
			this.folderName = this.fullName.replace(/[  ‑]/g, '-').toLowerCase()
		}

		resetStats() {
			const id = this.id, data = charData[id];
			[
				this.name,
				this.type,,,,
				this.health,,
				this.zoomSpeed,
				this.zoomFov
			] = data;

			[this.regenRate, this.regenDelay] = id == 24 ? [0, null] : [20, 8]
			this.team = id > 10 && id != 23 && id != 26 ? "Zombie" : "Plant"
			this.role = roles[data[2] || 0]
			// [Charge, Charge, Movement, Movement, Movement, Ammo, Damage, Special]
			this.primary = new Weapon(weaponData[data[3] - 1], data[4] ? 1 : 0, this.modifiers = [1,1,1,1,1,1,1,1])
			this.alt = data[4] ? new Weapon(weaponData[data[4] - 1], 2, this.modifiers) : null
			this.movement = data[6]?.slice() || null
			this.shield = data[9]?.slice() || null
			this.dashes = null
			if (data[6]?.[1]) this.sprintExit = 1 / 3
			if (id == 4) this.primary.dot = this.alt.dot = [9,.75,1.5]
			if (data[5] > 300) this.armor = 15
			this.addAbility()
			this.resetCache()
		}

		resetCache() {
			delete this.moveCache
			this.primary.cache = [[]]
			if (this.alt) this.alt.cache = [[]]

			if (this.abilities) for (const ability of this.abilities) {
				if (ability.weapon) ability.weapon.cache = [[]]
			}
		}

		partiallyReset() {
			delete this.moveCache
			this.primary.cache.splice(6,2)
			this.alt?.cache.splice(6,2)
		}

		addAbility() {
			this.abilities = getAbilities?.(this.id, this.modifiers)
		}

		get moveData(): [number?, number?, number?, number?, number?, number?, number?, number?, number?, number?, number?] | null {
			if (this.moveCache) return this.moveCache
			if (!this.movement) return this.moveCache = null
			let multiplier = this.modifiers[2] * this.modifiers[3] * this.modifiers[4]
			let [speed, sprint, strafe, back, jump, hoverGrav, hoverDuration, airJump, hoverTime, hoverStrafe] = this.movement
			speed *= multiplier

			return this.moveCache = [
				speed, speed * strafe, speed * back, sprint && 6.2 * sprint * multiplier,
				speed * this.zoomSpeed * (this.shield?.[3] || 1) * (this.primary.primeSpeed?.[0] || 1), 
				hoverGrav * 100, hoverDuration || null, jump, airJump, hoverTime, hoverStrafe && hoverStrafe * speed
			]
		}

		get fullName() {
			return `${this.name}${this.type ? ` ${this.type}` : ''}`
		}
	}

	const upgrades = [
		{ shield: [75, 12.5, 1, 1, 1], primary: [300,25,1.5,1,0,2/75,[[11.25,1.2,2,620,0,,36,,500,40,70]],[weaponData[3][7][0],[4.5,7.5,.015,-.075,.075,13.5],.1,2.5,1,-.2,.06,40],[.24,.42,1.2,.6,1.02,1.2,.012,.042,0,9],[0,.09,.6,.24,.33,.6,.006,.012,0,4.5],weaponData[3][10]] },
		{ primary: [58,4,2.2,1,2.2,,[[0,1,.2,70,.56]],weaponData[26][7],,,,,,,[12,16,1.85,3,1,2]] }
	]

	const characters: Character[] = [],
	getStats = (id: number) => new Character(id)
	let compareChars: Character[]
	for (let i = 0; i < 29; i++) characters[i] = getStats(i);

	// Linking acorns/oaks and acorn passenger etc.
	[7,12,18,7,18,21].forEach((id, i) => {
		const char1 = characters[id], char2 = characters[i + 23];
		(char1[char2.type ? 'passenger' : 'vehicle'] = char2).owner = char1
	})

	return {
		characters, getStats,
		get compareChars() {
			if (compareChars) return compareChars
			compareChars = characters.slice();
			[1,2,4,5,16,19].forEach((id, i) => {
				const char = new Character(id)
				compareChars.splice(id + i + 1, 0, char)
				if (!char.alt) return
				char.primary = char.alt
				char.type = 'Zoom'
			})
			compareChars[4].shield = upgrades[0].shield
			compareChars[4].name = "Shogun-Guard"
			compareChars[4].primary = new Weapon(upgrades[0].primary, 0, compareChars[4].modifiers)
			compareChars[25].primary = new Weapon(upgrades[1].primary, 0, compareChars[25].modifiers)
			compareChars[21].name = "Deadbeard"
			compareChars[25].name = "Steam Blaster"
			compareChars.splice(33, 1)
			return compareChars
		},
		setAbilities(func: typeof getAbilities) {
			getAbilities = func
		},
		Weapon, Bullet, Missile,
		upgrades
	}
})()

export const getCompareLink = (char: Character) => {
	const baseChar = stats.characters[char.id],
	param = navbar.settings.searchStr + (baseChar == char ? '' : baseChar.name.endsWith(char.name) ? '&z=1' : '&u=k')

	return `/classes/${baseChar.folderName}/${param && '?' + param.slice(1)}`
}
