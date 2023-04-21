export const getUpgParam = (upgs: Set<number>) => {
	let result = ''
	for (const id of upgs) result += id.toString(36)
	return result
},
getTempParam = (temp: number[]) => {
	let result = ''
	temp.forEach((val, i) => {
		if (val != null) result += i.toString(36) + val
	})
	return result
},
parseUpgParam = (param: string) => {
	const set = new Set<number>()
	if (!param) return set
	for (let i = 0; i < param.length; i++)
		set.add(parseInt(param[i], 36))
	return set
},
parseTempParam = (param: string) => {
	const arr: number[] = []
	if (!param) return arr
	for (let i = 0; i < param.length; i+= 2)
		arr[parseInt(param[i], 36)] = +param[i + 1]
	return arr
}
