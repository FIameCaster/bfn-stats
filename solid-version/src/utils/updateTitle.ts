let prevTitle: string, prevName = "Peashooter"

const icon1 = <HTMLLinkElement>document.querySelector('[sizes]'),
icon2 = <HTMLLinkElement>icon1.nextElementSibling

export function updateTitle(title: string, name = "Peashooter") {
	if (title != prevTitle)
		document.title = prevTitle = title

	if (prevName != (prevName = name)) {
		icon1.href = `/images/icons/small/${name.replace(/ | /g, '_')}.png`
		icon2.href = `/images/icons/medium/${name.replace(/ | /g, '_')}.png`
	}
}