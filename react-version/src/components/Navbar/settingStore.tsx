import {
	useRef,
	createContext,
	useContext,
	useEffect,
	useMemo,
	useSyncExternalStore
} from "react"

import { useSearchParams } from 'react-router-dom'

type Param<T> = [string, (value: T) => string, (str: string) => T]

const paramData: {
	distance: Param<number>,
	crit: Param<boolean>,
	move: Param<boolean>
} = {
	distance: ['d', (value: number) => value + '', (str: string) => +str],
	crit: ['c', (value: boolean) => value ? '1' : '', (str: string) => !!str],
	move: ['m', (value: boolean) => value ? '1' : '', (str: string) => !!str],
},

initialState = {
	distance: 0,
	crit: false,
	move: false
}

function useStoreData() {
	const searchRef = useRef<ReturnType<typeof useSearchParams>>(null)

	searchRef.current = useSearchParams()
	const store = useRef(initialState)
	const subscribers = useRef(new Set<() => void>())

	// Syncing store with url params
	for (const key in paramData) {
		const [param, serialize, deserialize] = paramData[key]
		const defaltVal = serialize(initialState[key])
		const currentValue = searchRef.current[0].get(param) ?? defaltVal
		const serializedState = serialize(store.current[key])

		// If multiple params change at once, the setState will be called multiple times for each subscriber
		// with different object references each time which is not ideal, but should be good enough
		useEffect(() => {
			store.current = { ...store.current, [key]: deserialize(currentValue) }
			for (const callback of subscribers.current) callback()
		}, [currentValue, serializedState])
	}

	return useMemo(() => {
		return {
			get: () => store.current,
			set(value: Partial<typeof initialState>, updateParam?: boolean) {
				const [search, setSearch] = searchRef.current
				const newStore = { ...store.current }

				for (const key in value) {
					const val = value[key]
					newStore[key] = val
					if (updateParam) {
						const [param, serialize] = paramData[key]
						const newSearch = serialize(val)
						search[newSearch == serialize(initialState[key]) ? 'delete' : 'set'](param, newSearch)
						setSearch(search, { replace: true })
					}
				}
				store.current = newStore
				for (const callback of subscribers.current) callback()
			},
			subscribe(callback: () => void) {
				subscribers.current.add(callback)
				return () => void subscribers.current.delete(callback)
			},
		}
	}, [])
}

const StoreContext = createContext<ReturnType<typeof useStoreData>>(null)

export function Provider({ children }: { children: React.ReactNode }) {
	return (
		<StoreContext.Provider value={useStoreData()}>
			{children}
		</StoreContext.Provider>
	)
}

export function useStore() {
	const store = useContext(StoreContext)

	const state = useSyncExternalStore(store.subscribe, store.get)

	return [state, store.set] as const
}