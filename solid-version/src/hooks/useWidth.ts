import { createSignal, onCleanup } from "solid-js"

const getWidth = () => document.documentElement.getBoundingClientRect().width

export function useWidth() {
	const [width, setWidth] = createSignal(getWidth())
	const resize = () => setWidth(getWidth())
	addEventListener('resize', resize)
	onCleanup(() => removeEventListener('resize', resize))

	return width
}