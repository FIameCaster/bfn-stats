import { Suspense, useState } from 'react'
import { Outlet, Link, useSearchParams } from 'react-router-dom'
import { Settings } from './Settings'
import { Provider } from './settingStore'
import { SearchProvider } from '../../hooks/useUrlState'
import { getParamStr } from '../../utils'

export function Navbar() {

	return (
		<Provider>
			<SearchProvider>
				<div className="bg-pattern"><div/></div>
				<nav>
					<Links />
					<Settings />
				</nav>
				<Suspense fallback={<div></div>}>
					<Outlet />
				</Suspense>
			</SearchProvider>
		</Provider>
	)
}

function Links() {

	let searchStr = ''
	const [search] = useSearchParams()
	
	// Filtering away params which should be kept between navigations
	for (const [key, value] of search) {
		if ('dmc'.includes(key)) searchStr += `&${key}=${value}`
	}

	searchStr = getParamStr(searchStr)

	return <ul className="main-menu">
		<li className="nav-dropdown">
			<button className="nav-link menu-toggle">Classes</button>
			<ul className="dropdown-list">
				<li>
					<Link className="nav-link" to={"/" + searchStr}>List</Link>
				</li>
				<li>
					<Link className="nav-link" to={"/classes/peashooter/" + searchStr}><span className="dropdown-text">Individual</span><span>Classes</span></Link>
				</li>
				<li>
					<Link className="nav-link" to={"/compare" + searchStr}>Compare</Link>
				</li>
				<li>
					<Link className="nav-link" to={"/ttk" + searchStr}>TTK</Link>
				</li>
			</ul>
		</li>
		<li>
			<Link className="nav-link" to={"/about" + searchStr}>About</Link>
		</li>
	</ul>
}