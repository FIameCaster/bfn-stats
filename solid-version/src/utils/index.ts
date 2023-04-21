import { createMemo } from "solid-js"
import { getNavbarSettings } from "../components/Navbar"

export const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(value, max))

export const round = (num: number, decimals = 2) => Math.round(num * 10 ** decimals) / 10 ** decimals

export const getParamStr = (str: string) => str && '?' + str.slice(1)

export const getBaseParam = () => createMemo(() => {
	const [distance, crit, move] = getNavbarSettings()
	let params = ''
	for (const [key, val] of [['d', distance], ['c', crit], ['m', move]]) {
		if (val) params += `&${key}=${+val}`
	}
	return params
})