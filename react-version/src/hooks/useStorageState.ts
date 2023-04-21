import { useEffect, useState } from "react"

export function useStorageState(name: string, defaultValue = '', isSession?: boolean) {
	const storage = isSession ? sessionStorage : localStorage
	const [state, setState] = useState(storage.getItem(name) || defaultValue)

	useEffect(() => {
		const onstorage = (e: StorageEvent) => {
			if (!e.key || e.key == name) setState(e.newValue || defaultValue)
		}
		addEventListener('storage', onstorage)
		return removeEventListener('storage', onstorage)
	}, [name])

	return [
		state,
		(newState: string) => {
			storage[defaultValue == newState ? 'removeItem' : 'setItem'](name, newState)
			setState(newState)
		}
	] as const
}