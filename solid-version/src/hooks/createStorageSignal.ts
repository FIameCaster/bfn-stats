import { createRenderEffect, createSignal, onCleanup } from "solid-js";

export const createStorageSignal = (key: () => string, defaultValue = '', isSession?: boolean) => {
	const storage = isSession ? sessionStorage : localStorage
	const [state, setState] = createSignal<string>()

	// Update signal when name changes
	createRenderEffect(() => {
		setState(storage.getItem(key()) || defaultValue)
	})

	const onstorage = (e: StorageEvent) => {
		if (!e.key || e.key == key()) setState(e.newValue || defaultValue)
	}
	addEventListener('storage', onstorage)
	onCleanup(() => removeEventListener('storage', onstorage))

	return [
		state,
		(newState: string) => {
			storage[defaultValue == newState ? 'removeItem' : 'setItem'](key(), newState)
			setState(newState)
		}
	] as const
}