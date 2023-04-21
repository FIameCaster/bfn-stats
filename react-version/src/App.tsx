import { Route, BrowserRouter, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { lazy, useEffect } from 'react'

const List = lazy(() => import('./pages/List').then(module => ({ default: module.List })))
const Compare = lazy(() => import('./pages/Compare').then(module => ({ default: module.Compare })))
const Ttk = lazy(() => import('./pages/Ttk').then(module => ({ default: module.Ttk })))
const Classes = lazy(() => import('./pages/Classes').then(module => ({ default: module.Classes })))
const About = lazy(() => import('./pages/About').then(module => ({ default: module.About })))
const Stats = lazy(() => import('./pages/Classes/Stats').then(module => ({ default: module.Stats })))
const Abilities = lazy(() => import('./pages/Classes/Abilities').then(module => ({ default: module.Abilities })))

export function App() {
  // Preloading in an effect with a timeout to delay it
  useEffect(() => {
    const timeout = setTimeout(() => {
      import('./pages/List')
      import('./pages/Compare')
      import('./pages/Ttk')
      import('./pages/Classes')
      import('./pages/About')
      import('./pages/Classes/Stats')
      import('./pages/Classes/Abilities')
    }, 500)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navbar/>}>
          <Route index element={<List />}/>
          <Route path="compare" element={<Compare />}/>
          <Route path="ttk" element={<Ttk />} />
          <Route path="classes/:name" element={<Classes />}>
            <Route index element={<Stats />}/>
            <Route path="abilities" element={<Abilities />}/>
          </Route>
          <Route path="about" element={<About />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}