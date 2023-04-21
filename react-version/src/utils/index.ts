export const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(value, max))

export const round = (num: number, decimals = 2) => Math.round(num * 10 ** decimals) / 10 ** decimals

export const getParamStr = (str: string) => str && '?' + str.slice(1)

export const getSettingsParam = (dist: number, crit: boolean, move: boolean) => {
	let params = ''
	for (const [key, val] of [['d', dist], ['c', crit], ['m', move]]) {
		if (val) params += `&${key}=${+val}`
	}
	return params
}