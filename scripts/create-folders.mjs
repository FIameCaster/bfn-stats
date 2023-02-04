import * as fs from 'fs'
import * as path from 'path'


if (!fs.existsSync('./classes')) {
	fs.mkdirSync('./classes')

	for (const folder of [
		"peashooter", "chomper", "kernel-corn", "night-cap", "snapdragon", "cactus", "citron", 
		"acorn", "sunflower", "rose", "wildflower", "foot-soldier", "imp", "super-brainz", 
		"80s-action-hero", "electric-slide", "captain-deadbeard", "all-star", "space-cadet", 
		"scientist", "engineer", "wizard", "tv-head", "oak", "z-mech", "space-station", 
		"acorn-passenger", "space-cadet-passenger", "wizard-co-star"
	]) {
		fs.mkdirSync('./classes/' + folder)
	}

}

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

if (!fs.existsSync('./build')) {
	fs.mkdirSync('./build')
	fs.mkdirSync('./build/css')
	fs.mkdirSync('./build/dest')
	copyDir('./classes', './build/classes')
	copyDir('./fonts', './build/fonts')
	copyDir('./images', './build/images')
}

fs.writeFileSync('./classes/content.txt', getClassesContent())

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
				<label for="starz"> </label>
				<input type="checkbox" id="starz">
			</div>
		</div>
	</div>
</div>`
}

