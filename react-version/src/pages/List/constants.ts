const chargeLabels = [
	'Charge time','Recovery time','Charge DPS','Ammo/shot','Damage/shot','Splash damage','Launch velocity','Max range','Travel time'
]
const recoilLabels = [
	'Max ampli­tude Y','Max ampli­tude X','Increase/shot Y','Average inc/shot X','Max devi­ation/shot X','Decrease factor','… shooting','First shot inc scale'
]
const dispersionLabels = [
	'Min angle','Max angle','Increase/shot','… including decrease','Decrease/sec','Jump dispersion','Move dispersion','Avg shell dispersion'
]
const gunSwayLabels = [
	'Min angle','… moving','… jumping','Max angle','… moving','Bloom/shot','… moving','Decrease/sec'
]

const labels = [
	'DPS','Rate of fire','Damage/shot','Sustain­able DPS','Launch velocity','Splash damage','Splash radius','Spray damage',
	'Spray range', 'Drag start','Drag end','Post‑drag velocity','Accel­eration','Max velocity','Travel time','Max range',
	'Gravity','Ammo capacity','Reload time','Damage/clip','Shots/burst','Burst interval','Ammo/shot','Sustain­able RoF',
	'Overheat time','Heat/bullet','Heat-gain/sec','Heat-drop/sec','Heat‑drop delay','Penalty time','Cooldown time',
	'Damage/overheat',...chargeLabels,...chargeLabels,...chargeLabels,'Max HP','Regen delay','Regen rate','Armor',
	'Shield HP','Shield regen','Shield regen delay','Priming time','Priming speed','Movement speed','Strafe speed',
	'Backwards speed', 'Sprint speed' ,'Speed (aiming)','Hover gravity','Max hover time','Jump height','In‑air jump height',
	...recoilLabels, ...recoilLabels,'Max recoil angle Y','Max recoil angle X','Recovery time','Zoom scale',
	...dispersionLabels, ...dispersionLabels, ...gunSwayLabels, 'Aim time', ...gunSwayLabels
]

const decimals: number[] = [
	...new Array(76).fill(2), ...new Array(54).fill(3)
]

const units: number[] = [
	0,0,0,0,3,0,1,0,1,1,1,3,6,3,2,1,6,0,2,0,0,2,0,0,2,0,0,0,2,2,2,0, // ends at Damage/overheat 31
	2,2,0,0,0,0,3,1,2,2,2,0,0,0,0,3,1,2,2,2,0,0,0,0,3,1,2,0,2,0,7,0, // ends at Shield HP 63
	0,2,2,3,3,3,3,3,3,7,2,1,1,5,5,5,5,5,0,0,0,5,5,5,5,5,0,0,0,5,5,2, // ends at Recoil angle 95
	7,...new Array(34).fill(5)
]
const unitText = [
	'', 'm', 's', 'm/s', 'm²', '°', 'm/s²', '%'
]

const categories = [
	[0,1,2,3,4,5,6,7,8],
	[4,9,10,11,12,13,14,15,16],
	[17,18,19,20,21,22,1,23,3],
	[24,25,26,27,28,29,30,31,23],
	[32,33,34,35,36,37,38,39,40],
	[41,42,43,44,45,46,47,48,49],
	[50,51,52,53,54,55,56,57,58],
	[59,60,61,62,63,64,65,66,67],
	[68,69,70,71,72,73,74,75,76],
	[77,78,79,80,81,82,83,84],
	[85,86,87,88,89,90,91,92],
	[93,94,95,96,0,1,2,3,4],
	[97,98,99,100,101,102,103,104],
	[105,106,107,108,109,110,111,112],
	[113,114,115,116,117,118,119,120,121],
	[122,123,124,125,126,127,128,129,121]
]

for (let i of [14,25,40,49,58]) decimals[i] = 3
units[121] = 2

export { labels, decimals, units, unitText, categories }