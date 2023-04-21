import { stats } from "../data/stats"

let prevTitle: string, prevID: number

const characters = stats.characters,
icon1 = <HTMLLinkElement>document.querySelector('[sizes]'),
icon2 = <HTMLLinkElement>icon1.nextElementSibling

export function updateTitle(title: string, charID = 0) {
	if (title != prevTitle)
		document.title = prevTitle = title

	if (prevID != charID) {
		icon1.href = `/images/icons/small/${characters[prevID = charID].name.replace(/ | /g, '_')}.png`
		icon2.href = `/images/icons/medium/${characters[charID].name.replace(/ | /g, '_')}.png`
	}
}