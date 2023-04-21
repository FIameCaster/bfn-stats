import { useState, useEffect } from 'react'

export function useDropdownState(selector: string) {
	const [open, setOpen] = useState(false)

	// To close the menu if the user clicks outside the dropdown
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (!(e.target as HTMLElement).matches(selector + ' *')) return setOpen(false)
			if ((e.target as HTMLElement).matches(selector + '>button')) setOpen(open => !open)
		}

		addEventListener('click', handler)
		return () => removeEventListener('click', handler)
	}, [selector])

	return [open, setOpen] as const
}