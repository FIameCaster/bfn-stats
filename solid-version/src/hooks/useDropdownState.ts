import { createSignal, onCleanup } from "solid-js"

export function useDropdownState(selector: string) {

	const [open, setOpen] = createSignal(false)

	// To close the menu if the user clicks outside the dropdown
	const handler = (e: MouseEvent) => {
		if (!(e.target as HTMLElement).matches(selector + ' *')) return setOpen(false)
		if ((e.target as HTMLElement).matches(selector + '>button')) setOpen(open => !open)
	}

	addEventListener('click', handler)
	onCleanup(() => removeEventListener('click', handler))

	return [open, setOpen] as const
}