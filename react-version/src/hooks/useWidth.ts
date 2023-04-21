import { useSyncExternalStore } from "react"

const getWidth = () => document.documentElement.getBoundingClientRect().width

const subscribe = (callback: () => void) => {
	addEventListener('resize', callback)
	return () => removeEventListener('resize', callback)
}

export const useWidth = () => useSyncExternalStore(subscribe, getWidth)