import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Detail from './pages/Detail'
import SimpleLogin from './pages/SimpleLogin'
import NotFound from './pages/NotFound'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminVenueForm from './pages/admin/AdminVenueForm'
import './App.css'

export default function App() {
  return (
    <Routes>
      {/* Public routes - mobile layout */}
      <Route path="/" element={
        <div className="h-full w-full max-w-lg mx-auto bg-white shadow-2xl mobile-container relative">
          <Home />
        </div>
      } />
      <Route path="/detail/:id" element={
        <div className="h-full w-full max-w-lg mx-auto bg-white shadow-2xl mobile-container relative">
          <Detail />
        </div>
      } />
      <Route path="/login" element={<SimpleLogin />} />

      {/* Admin routes - full desktop layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="create" element={<AdminVenueForm />} />
        <Route path="edit/:id" element={<AdminVenueForm />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
