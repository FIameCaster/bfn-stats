import '../../assets/about.css'
import { updateTitle } from '../../utils/updateTitle'

export function About() {
	updateTitle('About - BFN Stats')

	return (
		<div id="about">
			<main>
			<h1>About the site</h1>
			<p>With BFN lacking a stat-site for so long, I decided it was finally time to make one. While BFN might not have as many characters due to the removal of variants, many of its upgrades can be hard to understand due to poor descriptions. </p>
			<h2>Site features:</h2>
			<ul>
				<li>Page for viewing stats on all classes in the game sorted by almost any stat</li>
				<li>Detailed descriptions for all the upgrades</li>
				<li>Page for comparing the stats of multiple classes</li>
				<li>Page for calculating time to kill for all classes at any health pool</li>
				<li>Detailed stats for all classes in the game. You can click on a class-icon to go to the page for that class</li>
			</ul>
			<p>You might notice that this site is missing multiple features present in the sites for both <a target="_blank" href="https://gw-stats.netlify.app">Garden Warfare</a> and <a target="_blank" href="https://gw2-stats.netlify.app">Garden Warfare 2</a>. One feature missing is the linecharts which didn't seem useful for BFN due to the removal of damage dropoff. Additionally, there's no historical stats from previous patches. This is very unlikely to be added due to the upgrade system making it impossible to implement it the way it was implemented for the other two sites.</p>
			<h2>Who made this?</h2>
			<p>This site was created by FlameCaster#3026 on discord (FIameCaster on Origin).</p>
			<p>If you have any questions, suggestions, bugs to report or similar, there's a <a target="_blank" href="https://discord.gg/SqFyB2FdtS">dedicated channel</a> in the Floral Federation Discord server for it.</p>
			<p>Source code is on <a target="_blank" href="https://github.com/FIameCaster/bfn-stats">GitHub</a>.</p>
		</main>
		</div>
	)
}