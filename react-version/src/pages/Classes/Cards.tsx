import React, { useMemo } from "react"
import { clamp } from "../../utils"

export function Cards({ children, colCount, heights }: { children: React.ReactNode[], colCount: number, heights: number[] }) {
	return useMemo(() => {
		const columns: React.ReactNode[][] = []
		const colHeights: number[] = []

		const getShortestColumn = () => {
			let index = 0, smallest = 1e9
			for (let i = 0; i < colCount; i++) {
				if (colHeights[i] < smallest) smallest = colHeights[index = i]
			}
			return index
		}

		for (let i = 0; i < colCount; i++) {
			columns[i] = []
			colHeights[i] = 0
		}

		children.forEach((card, i) => {
			if (!card) return
			const index = getShortestColumn()

			columns[index].push(card)
			colHeights[index] += heights[i]
		})

		return <main className="content_c" style={{
			maxWidth: clamp(39, colCount * 37.5 + 1.6, 150) + 'rem'
		}}>{
			columns.map((col, i) => (
				<div key={i}>{col}</div>
			))
		}</main>
	}, [colCount, children])
}