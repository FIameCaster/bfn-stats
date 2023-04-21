import { useState, useEffect } from 'react'
import { useSearchParams, NavigateOptions } from 'react-router-dom'

let oldSearch: URLSearchParams

export function useUrlState<T>(initialState: T, param: string, serialize: (value: T) => string, deserialize: (str: string) => T, options: NavigateOptions) {
	const [search, setSearch] = useSearchParams()
	const defaltVal = serialize(initialState)
	const currentValue = search.get(param) ?? defaltVal
	const [state, setState] = useState(deserialize(currentValue))
	const serializedState = serialize(state)

	useEffect(() => {
		if (currentValue != serializedState) {
			setState(deserialize(currentValue))
		}

	}, [serializedState, currentValue])

	// All components using this hook need reference to the same URLSearchParams to update multiple values in the same render
	// It's the only solution with this hook, which is why I made a new hook
	oldSearch = search

	return [
		state, (newState: T | ((state: T) => T)) => {
			const newParamVal = serialize(
				typeof newState == 'function' ? (<Function>newState)(state) : newState
			)
			setState(newState)
			oldSearch[newParamVal == defaltVal ? 'delete' : 'set'](param, newParamVal)
			setSearch(oldSearch, options)
		}
	] as const
}