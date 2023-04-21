import { getParamStr } from "."
import type { Character } from "../types"
import { stats } from "../data/stats"

export const getCompareLink = (char: Character, baseParam: string) => {
	const baseChar = stats.characters[char.id],
	param = baseParam + (baseChar == char ? '' : baseChar.name.endsWith(char.name) ? '&z=1' : '&u=k')

	return `/classes/${baseChar.folderName}/${getParamStr(param)}`
}