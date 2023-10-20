import * as fs from 'fs'
import * as path from 'path'
import { minify } from "terser"
import postcss from 'postcss'
import cssnano from 'cssnano'

// Increment before pushing to production
const cacheParam = '?v=23'

const stats = (() => {
	const charData = [
		["Peashooter", , , 1, , 125],
		["Chomper", , , 2, 3, 175],
		["Kernel Corn", , , 4, , 125],
		["Night Cap", , , 5, , 75],
		["Snapdragon", , , 6, 7, 175],
		["Cactus", , 1, 8, 9, 100],
		["Citron", , 1, 10, , 200],
		["Acorn", , 1, 11, , 75],
		["Sunflower", , 2, 13, , 100],
		["Rose", , 2, 14, , 100],
		["Wildflower", , 3, 15, , 100],
		["Foot Soldier", , , 16, , 125],
		["Imp", , , 17, , 75],
		["Super Brainz", , , 19, , 175],
		["80s Action Hero", , , 20, , 150],
		["Electric Slide", , , 21, , 125],
		["Captain Deadbeard", , 1, 22, 23, 100],
		["All-Star", , 1, 24, , 200],
		["Space Cadet", , 1, 25, , 125],
		["Scientist", , 2, 27, , 100],
		["Engineer", , 2, 28, , 125],
		["Wizard", , 2, 29, , 125],
		["TV Head", , 3, 31, , 100],
		["Oak", , 1, 12, , 300],
		["Z-Mech", , , 18, , 350],
		["Space Station", , 1, 26, , 275],
		["Acorn", "Passenger", 1, 32, , 75],
		["Space Cadet", "Passenger", 1, 25, , 100],
		["Wizard", "Co‑Star", 2, 30, , 65]
	]
	class Character {
		constructor(id) {
			this.id = id;
			this.iconId = id > 25 ? [7, 18, 21][id - 26] : id
			const data = charData[id];
			[
				this.name,
				this.type,,,,
				this.health
			] = data
			this.role = data[2] || 0
			this.folderName = this.fullName.replace(/[  ‑]/g, '-').toLowerCase()
		}
		get fullName() {
			return this.name + (this.type ? ` ${this.type}` : '')
		}
	}
	const characters = []
	for (let i = 0; i < 29; i++) characters[i] = new Character(i);
	// Linking acorns/oaks and acorn passenger etc.
	[7, 12, 18, 7, 18, 21].forEach((id, i) => {
		const char1 = characters[id], char2 = characters[i + 23];
		(char1[char2.type ? 'passenger' : 'vehicle'] = char2).owner = char1
	})
	return {
		characters
	}
})()

const logError = err => err && console.log(err)

// Creating folders if they don't exist
if (!fs.existsSync('./classes')) {
	fs.mkdirSync('./classes')

	stats.characters.forEach((char) => {
		fs.mkdirSync('./classes/' + char.folderName)
	})
}

if (!fs.existsSync('./build')) {
	fs.mkdirSync('./build')
	fs.mkdirSync('./build/css')
	fs.mkdirSync('./build/dest')
	copyDir('./classes', './build/classes')
	copyDir('./fonts', './build/fonts')
	copyDir('./images', './build/images')
}

fs.writeFileSync('./classes/content.txt', getClassesContent())

const round = num => Math.round(num * 1e6) / 1e6

const nextMap = [,,,,,,,,,,,,,,,,,,,,,,0,8,13,19,8,19,22],
prevMap = [22,,,,,,,,,,,,,,,,,,,,,,,6,11,17,6,17,20]
const roles = ["Attack", "Defend", "Support", "Swarm"]
const getLinkTargets = (char) => {
	const owner = char.owner || char
	return [
		owner.passenger ? char.type ? owner : owner.passenger : null,
		owner.vehicle ? char.health > 200 ? owner : owner.vehicle : null
	]
}

const specialUpgs = [
	'Pea Suped',,
	'Butter Beacon',,,,,,,
	'Jinxed',,,,,
	'Tagged',,,,
	'Space Force',,
	'Heavy Helper',
	'Unaligned'
]

const pronouns = [
	'his', 'his', 'his', 'her', 'his', 'her', 'his', 'his', 'her', 'her', 'their', 
	'his', 'his', 'his', 'his', 'her', 'his', 'his', 'her', 'his', 'his', 'his', 'his',
	'his', 'its', 'its', 'his', 'her', 'his'
]

stats.characters.forEach((char, id) => {

	const linkTargets = getLinkTargets(char),
	html1 = getClassesHTML(char, linkTargets),
	html2 = getClassesHTML(char, linkTargets, true)

	fs.writeFile(`classes/${char.folderName}/index.html`, html1, logError)
	fs.writeFile(`classes/${char.folderName}/abilities.html`, html2, logError)

	fs.writeFile(`build/classes/${char.folderName}/index.html`, getBuild(html1), logError)
	fs.writeFile(`build/classes/${char.folderName}/abilities.html`, getBuild(html2), logError)
})

const classContent = fs.readFileSync('classes/content.txt', 'utf-8').replace(/\n|\t|\r/g, '')
fs.writeFile('build/classes/content.txt', classContent, logError)

const options = {
	mangle: {
		properties: {
			keep_quoted: true,
			// Update when shared properties are added
			reserved: [
				'impactDmg','critMultiplier','timeToLive','startSpeed','radius','splashDmg','innerBlastRadius','blastRadius','shockwaveDmg',
				'shockwaveRadius','gravity','startSpeedY','endSpeed','dragStart','dragEnd','width','height','maxBounces','afterBounceGravity',
				'bounceSpeed','engineAccel','maxSpeed','rof','maxRof','rofInc','ammoCapacity','reload','ammoPerShot','shotsPerShell','el',
				'burstSize','burstInterval','offsetZ','aimTime','projectiles','recoil','gunSway','gunSwayZoom','dispersion','charges',
				'overheat','homing','trapezoid','modifiers','cache','dot','iconId','role','team','primary','health','regenRate','regenDelay',
				'movement','zoomSpeed','zoomFov','shield','vehicle','owner','passenger','characters','getStats','initStats','Weapon','Bullet',
				'Missile','nav','settings','distance','crit','move','getParam','getParams','setParam','params','updateCallbacks','fullName',
				'moveData','getDispersion','getRecoil','splashDPS','getChargeDPS','getDPS','getChargeRof','getMaxRange','sprayRange','arcs',
				'getDmgPerOverheat','getDmgPerClip','getCloud','getDamage','cooldown','overheatTime','sustainableRof','effectiveRof',
				'timeToFireClip','ammo','primeTime','primeSpeed','compareChars','travelTime','travelDistance','updateLinks','links','goTo',
				'shotsToOverheat','recoilAngle','searchStr','prefetchedStylesheets','prefetch','partiallyReset','resetCache','addAbility', 
				'folderName','upgrades','armor','dashes','upgradeMenu','tempUpgMenu','abilityCards','isClosed','setAbilities','abilities',
				'classes','upgraded','resetStats','deployTime','backDelay','buff','debuff','spreadRad','buff2','stamina','decayRate',
				'decayRateM','explosion','explosionDelay','beam','healSpray','warpDist','healRate','healRad','linkUpRange','spottingRange',
				'allyArmor','ignoreGrav','weapon','cloud','zoomSpray','dash','openMenu','updateIcon','sprintExit','getSplash','getSpray',
				'buffZone'
			]
		}
	},
	module: true
};

[
	'abilities', 'classes', 'list', 'stats', 'ttk', 'upgrades', 
	'about', 'upgradeMenu', 'compare', 'compareMenu', 'router'
].forEach(async name => {

	let file = fs.readFileSync(`dest/${name}.js`, 'utf-8')
	// Adding v-param and replacing const with let
	file = file.replace(/(?<=\.(css|txt|js))(?=[^\w])/g, cacheParam).replace(/const /g, 'let ')

	if (name == 'classes')
		file = file.replace(/\.html/g, '') // Removing .html extensions

	const result = await minify(file, options)
	fs.writeFile(`build/dest/${name}.js`, result.code, logError)
});

['index.html', 'ttk.html', 'about.html', 'compare.html'].forEach(name => {
	fs.readFile(name, 'utf-8', (err, data) => {
		fs.writeFile('build/' + name, getBuild(data), logError)
	})
})

const prosessor = cssnano([cssnano({ preset: 'default' })]);

['classes.css','list.css','style.css','ttk.css','upgradeMenu.css','about.css','compareMenu.css','compare.css'].forEach(name => {
	fs.readFile(`css/${name}`, async (err, css) => {
		const result = await prosessor.process(css, { from: undefined, to: undefined })
		fs.writeFile(`build/css/${name}`, result.css, logError)
	})
})

async function copyDir(src, dest) {
	await fs.promises.mkdir(dest, { recursive: true })
	const entries = await fs.promises.readdir(src, { withFileTypes: true })

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name)
		const destPath = path.join(dest, entry.name)

		if (entry.isDirectory()) await copyDir(srcPath, destPath)
		else await fs.promises.copyFile(srcPath, destPath)
	}	
}

function getBuild(html) {
	return html.replace(/\.(?:css|js)\b/g, `$&${cacheParam}`).replace(/\t|\n|\r/g, '')
}

function getClassesHTML(char, linkTargets, abilities) {
	const id = char.id,
	ownerID = char.owner?.id || id

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width initial-scale=1.0,minimum-scale=1.0">
	<title>${char.fullName} stats</title>
	<meta name="description" content="View the statistics for ${char.fullName}'s primary and ${pronouns[id]} abilities">
	<meta property="og:description" content="View the statistics for ${char.fullName}'s primary and ${pronouns[id]} abilities">
	<meta property="og:title" content="${char.fullName} ${abilities ? 'abilities' : 'stats'}">
	<link rel="icon" href="/images/icons/small/${char.name.replace(/ | /g, '_')}.png" sizes="32x32">
	<link rel="icon" href="/images/icons/medium/${char.name.replace(/ | /g, '_')}.png" sizes="64x64">
	<link rel="preload" href="/fonts/Roboto.woff2" as="font" type="font/woff2" crossorigin="">
	<link rel="preload" href="/fonts/Roboto-Medium.woff2" as="font" type="font/woff2" crossorigin="">
	<link rel="stylesheet" href="/css/style.css">
	<link rel="stylesheet" href="/css/classes.css">
	<script type="module" src="/dest/router.js"></script>
	<script type="module" src="/dest/stats.js"></script>
	<script type="module" src="/dest/upgrades.js"></script>
	<script type="module" src="/dest/classes.js"></script>${abilities ? `\n\t<script type="module" src="/dest/abilities.js"></script>` : ''}
</head>
<body>
	<div class="bg-pattern"><div></div></div>
	<nav>
		<ul class="main-menu">
			<li class="nav-dropdown">
				<button class="nav-link menu-toggle">Classes</button>
				<ul class="dropdown-list">
					<li><a class="nav-link" href="/">List</a></li>
					<li><a class="nav-link" href="/classes/peashooter/"><span class="dropdown-text">Individual</span><span>Classes</span></a></li>
					<li><a class="nav-link" href="/compare.html">Compare</a></li>
					<li><a class="nav-link" href="/ttk.html">TTK</a></li>
				</ul>
			</li>
			<li><a class="nav-link" href="/about.html">About</a></li>
		</ul>
		<div class="settings">
			<button class="btn">
				<img src="/images/options.webp" alt="Options">
			</button>
		</div>
	</nav>
	<div id="classes">
		<header class="char">
			<div class="icon_c">
				<img src="/images/all-icons-large.webp" alt="${char.name}" id="icon" style="object-position:${round(-8.2 * char.iconId)}rem 0">
				<div>
					<h1>${char.fullName}</h1>
					<p>Role: ${roles[char.role]}<span style="background-position-x:${round(-2.1 * char.role)}rem"></span></p>
				</div>
			</div>
			<div class="abilities" style="--icon:url('/images/abilities/set${id}.webp')">
				<a title="Left ability" href="${abilities ? './' : 'abilities.html'}"></a>
				<a title="Center ability" href="abilities.html?a=1"></a>
				<a title="Right ability" href="abilities.html?a=2"></a>
			</div>
			<div class="nav_c">
				<a href="/classes/${stats.characters[nextMap[id] ?? id + 1].folderName}/${abilities ? 'abilities.html' : ''}" id="next" class="btn" title="(→)">Next</a>
				<a href="/classes/${stats.characters[prevMap[id] ?? id - 1].folderName}/${abilities ? 'abilities.html' : ''}" id="prev" class="btn" title="(←)">Prev</a>
			</div>
		</header>
		<div class="options_c">
			<div class="upg-container">
				<div class="select" id="upg"><button>Upgrades (0/7)</button></div>
				<div class="select" id="temp" style="visibility:hidden"><button>Temporary upgrades</button></div>
			</div>
			<div class="group_c2">
				<div class="upgrades"></div>
				<div>
					<a ${linkTargets[0] ? `href="/classes/${linkTargets[0].folderName}/${abilities ? 'abilities.html' : ''}"` : 'style="display:none"'} class="btn" id="passenger">
						${linkTargets[0] ? linkTargets[0].type || linkTargets[0].name : ''}
					</a>
					<a ${linkTargets[1] ? `href="/classes/${linkTargets[1].folderName}/${abilities ? 'abilities.html' : ''}"` : 'style="display:none"'} class="btn" id="vehicle">
						${linkTargets[1] ? linkTargets[1].type || linkTargets[1].name : ''}
					</a>
				</div>
			</div>
			<div class="group_c3">
				<div class="input-group">
					<label for="zoom">Zooming</label>
					<input type="checkbox" id="zoom">
				</div>
				<div class="input-group"${specialUpgs[ownerID] ? '' : ' style="visibility:hidden"'}>
					<label for="special">${specialUpgs[ownerID] || 'a'}</label>
					<input type="checkbox" id="special">
				</div>
			</div>
		</div>
	</div>
</body>
</html>`
}

function getClassesContent() {
	return `<div id="classes" style="display:none">
	<header class="char">
		<div class="icon_c">
			<img src="/images/all-icons-large.webp" id="icon">
			<div>
				<h1> </h1>
				<p> <span></span></p>
			</div>
		</div>
		<div class="abilities">
			<a title="Left ability"></a>
			<a title="Center ability"></a>
			<a title="Right ability"></a>
		</div>
		<div class="nav_c">
			<a id="next" class="btn" title="(→)">Next</a>
			<a id="prev" class="btn" title="(←)">Prev</a>
		</div>
	</header>
	<div class="options_c">
		<div class="upg-container">
			<div class="select" id="upg"><button>Upgrades (0/7)</button></div>
			<div class="select" id="temp"><button>Temporary upgrades</button></div>
		</div>
		<div class="group_c2">
			<div class="upgrades"></div>
			<div>
				<a class="btn" id="passenger"></a>
				<a class="btn" id="vehicle"></a>
			</div>
		</div>
		<div class="group_c3">
			<div class="input-group">
				<label for="zoom">Zooming</label>
				<input type="checkbox" id="zoom">
			</div>
			<div class="input-group">
				<label for="special">a</label>
				<input type="checkbox" id="special">
			</div>
		</div>
	</div>
</div>`
}