import {
	useRef,
	createContext,
	useContext,
	useEffect,
	useState,
	useMemo
} from "react"

import { useSearchParams, NavigateOptions } from 'react-router-dom'

function useSearchStore() {
	const searchRef = useRef<ReturnType<typeof useSearchParams>>(null)
	const subscribers = useRef(new Set<() => void>())

	searchRef.current = useSearchParams()
	useEffect(() => {
		for (const callback of subscribers.current) callback()
	})

	return useMemo(() => {
		return {
			get() { return searchRef.current },
			subscribe(callback: () => void) {
				subscribers.current.add(callback)
				return () => void subscribers.current.delete(callback)
			}
		}
	}, [])
}

const SearchContext = createContext<ReturnType<typeof useSearchStore>>(null)

export function SearchProvider({ children }: { children: React.ReactNode }) {
	return (
		<SearchContext.Provider value={useSearchStore()}>
			{children}
		</SearchContext.Provider>
	)
}

export function useUrlState<T>(initialState: T, param: string, serialize: (value: T) => string, deserialize: (str: string) => T, options: NavigateOptions) {
	const searchStore = useContext(SearchContext)

	const [search] = searchStore.get()
	const defaltVal = serialize(initialState)
	const currentValue = search.get(param) ?? defaltVal
	const [state, setState] = useState(deserialize(currentValue))
	const serializedState = serialize(state)

	useEffect(() => {
		return searchStore.subscribe(() => {
			const [search] = searchStore.get()
			const currentValue = search.get(param) ?? defaltVal

			if (currentValue != serializedState) {
				setState(deserialize(currentValue))
			}
		})
	}, [serializedState])

	return [
		// Providing the ability to not update the url allowing frequent 
		// updates to debouce (or something similar) updating the url
		state, (newState: T | ((state: T) => T), updateURL = true) => {
			
			const newParamVal = serialize(
				typeof newState == 'function' ? (newState as Function)(state) : newState
			)
			setState(newState)
			if (!updateURL) return
			const [search, setSearch] = searchStore.get()
			search[newParamVal == defaltVal ? 'delete' : 'set'](param, newParamVal)
			setSearch(search, options)
		}
	] as const
}