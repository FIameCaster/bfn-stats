import { useSyncExternalStore } from "react"
import { clamp } from "../utils"

const getWidth = () => document.documentElement.getBoundingClientRect().width

const subscribe = (callback: () => void) => {
	addEventListener('resize', callback)
	return () => removeEventListener('resize', callback)
}

export function useColumnLayout(minWidth: number, padding: number, maxCount: number) {
	return useSyncExternalStore(subscribe, () => clamp(1, Math.floor((getWidth() - padding) / minWidth), maxCount))
}