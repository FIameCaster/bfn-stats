import { qs, router, navbar, clamp } from "./router.js";

const container = <PageContainer>qs('#about'),
setState = () => {
  onresize = null
  let [distance, crit, move] = router.url.getParams('d','c','m')
  navbar.settings.state = [
    clamp(0, +distance, 100) || 0, !!crit, !!move
  ]
}

container.addEventListener('navigated', setState)
setState()