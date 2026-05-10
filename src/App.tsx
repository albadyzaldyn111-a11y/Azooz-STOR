import { Routes, Route } from 'react-router'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Toaster } from '@/components/ui/sonner'
import Home from './pages/Home'
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import AppsPage from "./pages/Apps"
import AppDetails from "./pages/AppDetails"
import Dashboard from "./pages/Dashboard"
import FavoritesPage from "./pages/Favorites"
import AdminDashboard from "./pages/Admin"

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apps" element={<AppsPage />} />
          <Route path="/apps/:slug" element={<AppDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-right" theme="dark" />
    </div>
  )
}
