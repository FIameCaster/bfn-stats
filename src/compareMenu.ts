import { upgradeMenu, tempUpgMenu, UpgradeMenuElement, TempMenuElement } from "./upgradeMenu.js"
import { element, router, text } from './router.js'
import { stats } from "./stats.js"
import { getUpgPoints, Upgrade, upgrades } from "./upgrades.js"

type MenuState = [
  number, Set<number>, number[], Character?
]

interface CompareMenuEventMap {
	"menusave": CustomEvent<MenuState>
}
interface CompareMenuContainer extends HTMLDivElement { 
  addEventListener<K extends keyof CompareMenuEventMap>(type: K, listener: (this: CompareMenuContainer, ev: CompareMenuEventMap[K]) => void): void
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: CompareMenuContainer, ev: HTMLElementEventMap[K]) => void): void
	dispatchEvent<K extends keyof CompareMenuEventMap>(ev: CompareMenuEventMap[K]): boolean
}

const characters = stats.characters
const roleMap = {
  "Attack": 0,
  "Defend": 1,
  "Support": 2,
  "Swarm": 3
}
let char: Character, charUpgrades: Upgrade[],
container: CompareMenuContainer,
currentState: MenuState, selectedID = 0

const btns: HTMLElement[] = [],
icon = element('img', { src: '/images/all-icons-large.webp' }),
nameText = text(''), roleText = text(''), roleIcon = element('span'), 
upgEl: UpgradeMenuElement = element('div', { id: 'upg', className: 'select', onkeydown(e) {
  e.code == 'Escape' && upgradeMenu.close()
  e.stopPropagation()
}}, [
  element('button', { textContent: 'Upgrades (0/7)', onclick() {
    if (upgradeMenu.isClosed()) upgradeMenu.open(char, upgEl, currentState[1], currentState[2])
    else upgradeMenu.close()
  }})
]),
tempEl: TempMenuElement = element('div', { id: 'temp', className: 'select', onkeydown(e) {
  e.code == 'Escape' && tempUpgMenu.close()
  e.stopPropagation()
}}, [
  element('button', { textContent: 'Temporary upgrades', onclick() {
    if (tempUpgMenu.isClosed()) tempUpgMenu.open(char, tempEl, currentState[1], currentState[2])
    else tempUpgMenu.close()
  }})
], 0, { visibility: 'hidden' }),
passenger = element('button', { textContent: 'Passenger', className: 'btn', onclick() {
  setChar(getLinkTargets()[0].id)
}}),
vehicle = element('button', { textContent: 'Station', className: 'btn', onclick() {
  setChar(getLinkTargets()[1].id)
} }),
save = element('button', { textContent: 'Save', className: 'btn', onclick() {
  container.dispatchEvent(new CustomEvent('menusave', { detail: copyState(currentState) }))
  el.remove()
}}),
updateUpgPoints = (cost?: number) => {
  upgEl.firstChild.textContent = `Upgrades (${cost ?? getUpgPoints(currentState[1], charUpgrades)}/7)`
},
copyState = (state: MenuState): MenuState => [
  state[0], new Set<number>([...state[1]]), state[2].slice()
],
show = (el: HTMLElement) => el.removeAttribute('style'),
hide = (el: HTMLElement) => el.style.visibility = 'hidden',
updateTempVisibility = () => {
  for (const id of currentState[1]) if (charUpgrades[id][5]) return show(tempEl)
  hide(tempEl)
}

upgEl.addEventListener('upgclose', updateTempVisibility)

for (let i = 0; i < 23; i++) {
  btns[i] = element('button', { title: characters[i].name, onclick() {
    setChar(i, true)
  }}, 0, 0, { backgroundPosition: -5.34 * i + .33 + 'rem .33rem' })
}
btns[23] = element('div', 0, [element('button', { className: 'btn', textContent: 'Close', onclick() {
  el.remove()
}})])

let shouldClose: boolean
const el = element('div', { tabIndex: 0, className: 'menu-container', onkeydown(e) {
  const colCount = Math.floor(Math.min(520, el.getBoundingClientRect().width - 19) / 65)
  let tempID = selectedID
  if (31 < e.keyCode && e.keyCode < 41) e.preventDefault()

  switch (e.code) {
    case 'ArrowRight':
      if ((tempID + 1) % colCount && tempID < 22) tempID++
      break
    case 'ArrowLeft':
      if (tempID % colCount && tempID) tempID--
      break
    case 'ArrowUp':
      if (tempID < colCount) break
      tempID -= colCount
      break
    case 'ArrowDown':
      if (tempID + colCount > 22) break
      tempID += colCount
      break
    case 'PageUp':
    case 'Home':
      tempID = 0
      break
    case 'PageDown':
    case 'End':
      tempID = 22
      break
    case 'Enter':
      if (document.activeElement == el) {
        save.click()
        e.preventDefault()
      }
      break
    case 'Escape':
      el.remove()
  }
  tempID != selectedID && setChar(tempID, true)
}, onclick(e) {
  if (e.target != el || !shouldClose) return
  el.remove()
}, onmousedown(e) {
  shouldClose = e.target == el && !e.button
}, ontouchstart(e) {
  shouldClose = e.target == el
}, onmouseup(e) {
  if (e.target != el) shouldClose = false
}, ontouchend(e) {
  if (e.target != el) shouldClose = false
}}, [
  element('div', { className: 'options_co' }, [
    element('div', { className: 'icon_co' }, [
      icon,
      element('div', 0, [
        element('h1', 0, [nameText]),
        element('p', 0, [roleText, roleIcon]),
      ])
    ]),
    element('div', { className: 'upgs_co' }, [upgEl, tempEl]),
    element('div', { className: 'links_co' }, [
      passenger, vehicle, save
    ])
  ]),
  element('div', { className: 'classes_co' }, btns)
])

const open = (() => {
  let initialized = false,
  open = () => {
    container.append(el)
    el.focus()
  }

  return () => {
    if (initialized == (initialized = true)) return open()
    const stylesheet = router.prefetchedStylesheets['compareMenu']
    stylesheet.onload = open
    stylesheet.rel = 'stylesheet'
  }
})()

const getLinkTargets = () => {
  const owner = char.owner || char
  return [
    owner.passenger ? char.type ? owner : owner.passenger : null,
    owner.vehicle ? char.health > 200 ? owner : owner.vehicle : null
  ]
},
getLinkText = (str: string) => str.length < 9 ? str : str.slice(6)

const setChar = (id: number, resetUpgs?: boolean) => {
  if (id == char?.id) return
  currentState[0] = id
  btns[selectedID].className = ''
  char = characters[currentState[0] = id]
  charUpgrades = upgrades[selectedID = char.owner?.id || id]
  btns[selectedID].className = 'selected'
  icon.title = nameText.data = char.fullName
  roleText.data = `Role: ${char.role}`
  icon.style.objectPosition = `${-8.2 * char.iconId}rem 0`
  roleIcon.style.backgroundPositionX = `${-2.1 * roleMap[char.role]}rem`

  if (resetUpgs && currentState[1].size) {
    currentState[1] = new Set()
    currentState[2] = []
    updateTempVisibility()
    updateUpgPoints(0)
  }

  getLinkTargets().forEach((char, i) => {
    const link = i ? vehicle : passenger
    if (!char) return hide(link)
    link.textContent = char.type || getLinkText(char.name)
    show(link)
  })
},
openMenu = (newContainer: CompareMenuContainer, newState?: MenuState) => {
  container = newContainer
  if (newState) {
    currentState = copyState(newState)
    setChar(newState[0])
    updateTempVisibility()
    updateUpgPoints()
  }
  else if (!currentState) {
    currentState = [0, new Set<number>(), []]
    setChar(0)
  }
  open()
}

router.prefetch(['upgradeMenu'])

type OpenMenu = typeof openMenu

export { openMenu, OpenMenu, CompareMenuContainer, MenuState }