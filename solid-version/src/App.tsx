import { lazy, onMount } from 'solid-js'
import { Routes, Route } from '@solidjs/router'
import { Navbar } from './components/Navbar'

const List = lazy(() => import('./pages/List').then(module => ({ default: module.List })))
const Compare = lazy(() => import('./pages/Compare').then(module => ({ default: module.Compare })))
const Ttk = lazy(() => import('./pages/Ttk').then(module => ({ default: module.Ttk })))
const Classes = lazy(() => import('./pages/Classes').then(module => ({ default: module.Classes })))
const About = lazy(() => import('./pages/About').then(module => ({ default: module.About })))
const Stats = lazy(() => import('./pages/Classes/Stats').then(module => ({ default: module.Stats })))
const Abilities = lazy(() => import('./pages/Classes/Abilities').then(module => ({ default: module.Abilities })))

export const App = () => {
  // Preloading in onMount with a timeout to delay it
  onMount(() => setTimeout(() => {
    import('./pages/List')
    import('./pages/Compare')
    import('./pages/Ttk')
    import('./pages/Classes')
    import('./pages/About')
    import('./pages/Classes/Stats')
    import('./pages/Classes/Abilities')
  }, 500))

  return <Routes>
    <Route path="/" component={Navbar}>
      <Route path="" component={List}/>
      <Route path="compare" element={<Compare />}/>
      <Route path="ttk" element={<Ttk />} />
      <Route path="classes/:name" element={<Classes />}>
        <Route path="" element={<Stats />}/>
        <Route path="abilities" element={<Abilities />}/>
      </Route>
      <Route path="about" element={<About />}/>
    </Route>
  </Routes>
}
