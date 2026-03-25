import { Navigate, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Layout } from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Menu from '@/pages/Menu'
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'
import Confirmation from '@/pages/Confirmation'
import Tracker from '@/pages/Tracker'

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation/:id" element={<Confirmation />} />
          <Route path="/tracker/:id" element={<Tracker />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}

export default App
