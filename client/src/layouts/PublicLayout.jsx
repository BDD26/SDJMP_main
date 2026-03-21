import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  Briefcase,
  GraduationCap,
  Menu,
  X,
  ChevronRight,
  Building2,
  Users,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { ThemeToggle } from '@/components/theme-toggle'
import { publicNavigation } from '@/app/navigation'
import { getDashboardPath } from '@/app/roles'

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  const getDashboardLink = () => {
    return user ? getDashboardPath(user.role) : '/login'
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-fade-up">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SkillMatch</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {publicNavigation.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button asChild>
                <Link to={getDashboardLink()}>
                  Go to Dashboard
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle & Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 animate-in spin-in-90 duration-300" />
              ) : (
                <Menu className="h-6 w-6 animate-in spin-in-90 duration-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container px-4 py-4 flex flex-col gap-4">
              {publicNavigation.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium ${
                    location.pathname === link.path
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t">
                {isAuthenticated ? (
                  <Button asChild>
                    <Link to={getDashboardLink()}>Go to Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button asChild>
                      <Link to="/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 animate-fade-up delay-100">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 animate-fade-up delay-200">
        <div className="container px-4 md:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Briefcase className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">SkillMatch</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Connecting talented students with top employers through skill-based matching.
              </p>
            </div>

            {/* For Students */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                For Students
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/jobs" className="hover:text-foreground hover:translate-x-1 inline-block transition-transform duration-300">Browse Jobs</Link></li>
                <li><Link to="/skills" className="hover:text-foreground hover:translate-x-1 inline-block transition-transform duration-300">Skills Library</Link></li>
                <li><Link to="/register" className="hover:text-foreground hover:translate-x-1 inline-block transition-transform duration-300">Create Profile</Link></li>
              </ul>
            </div>

            {/* For Employers */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                For Employers
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/register" className="hover:text-foreground hover:translate-x-1 inline-block transition-transform duration-300">Post Jobs</Link></li>
                <li><Link to="/about" className="hover:text-foreground hover:translate-x-1 inline-block transition-transform duration-300">Find Talent</Link></li>
                <li><Link to="/about" className="hover:text-foreground hover:translate-x-1 inline-block transition-transform duration-300">Pricing</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Company
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground hover:translate-x-1 inline-block transition-transform duration-300">About Us</Link></li>
                <li><Link to="/about" className="hover:text-foreground hover:translate-x-1 inline-block transition-transform duration-300">Contact</Link></li>
                <li><Link to="/about" className="hover:text-foreground hover:translate-x-1 inline-block transition-transform duration-300">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              2026 SDJMP. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Award className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Trusted by 500+ companies
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
