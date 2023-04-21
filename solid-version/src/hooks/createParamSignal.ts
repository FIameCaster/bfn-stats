import { createEffect, createSignal, Signal } from "solid-js"
import { useSearchParams } from "@solidjs/router"

// Multiple parameters cannot be updated at the same time with this
export function createParamSignal<T>(name: string, defaultValue: string, serialize: (value: T) => string, deserialize: (value: string) => T, replace = true, signal?: Signal<T>) {
	const [searchParams, setSearchParams] = useSearchParams()
	const [state, setState] = signal || createSignal<T>(deserialize(searchParams[name] || defaultValue))

	let prevState: string
	createEffect(() => {
		if (prevState === (prevState = searchParams[name] || defaultValue)) return
		setState(() => deserialize(prevState))
	})

	return [
		state,
		(value: T, updateURL = true) => {
			prevState = serialize(setState(() => value))
			if (updateURL) {
				setSearchParams({ [name]: prevState == defaultValue ? null : prevState }, { replace })
			}
		}
	] as const
}