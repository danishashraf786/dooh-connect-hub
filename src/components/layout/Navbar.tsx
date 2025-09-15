import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Monitor, User, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link, useLocation } from 'react-router-dom';

const NavLinks = ({ isMobile = false, onLinkClick = () => {} }) => {
  const { profile } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className={`${isMobile ? 'flex flex-col space-y-4' : 'hidden md:flex items-center space-x-6'}`}>
      <Link 
        to="/dashboard" 
        onClick={onLinkClick}
        className={`text-sm font-medium transition-colors hover:text-primary ${
          isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        Dashboard
      </Link>
      
      {profile?.role === 'advertiser' && (
        <>
          <Link 
            to="/discover" 
            onClick={onLinkClick}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/discover') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Discover Screens
          </Link>
          <Link 
            to="/campaigns" 
            onClick={onLinkClick}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/campaigns') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            My Campaigns
          </Link>
        </>
      )}
      
      {profile?.role === 'screen_owner' && (
        <>
          <Link 
            to="/screens" 
            onClick={onLinkClick}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/screens') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            My Screens
          </Link>
          <Link 
            to="/bookings" 
            onClick={onLinkClick}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/bookings') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Bookings
          </Link>
        </>
      )}
      
      <Link 
        to="/analytics" 
        onClick={onLinkClick}
        className={`text-sm font-medium transition-colors hover:text-primary ${
          isActive('/analytics') ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        Analytics
      </Link>
    </div>
  );
};

export const Navbar = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Monitor className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DOOH Connect</span>
          </Link>

          {/* Desktop Navigation */}
          {user && <NavLinks />}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Mobile Menu */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px]">
                    <div className="flex flex-col space-y-6 mt-6">
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">DOOH Connect</span>
                      </div>
                      <NavLinks isMobile onLinkClick={() => setMobileMenuOpen(false)} />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{profile?.business_name || 'My Account'}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                        <span className="text-xs text-muted-foreground capitalize">{profile?.role}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    {/* Quick role switcher to resolve incorrect dashboard role */}
                    {profile?.role !== 'screen_owner' && (
                      <DropdownMenuItem onClick={() => updateProfile({ role: 'screen_owner' })}>
                        <Monitor className="mr-2 h-4 w-4" />
                        Switch to Screen Owner
                      </DropdownMenuItem>
                    )}
                    {profile?.role !== 'advertiser' && (
                      <DropdownMenuItem onClick={() => updateProfile({ role: 'advertiser' })}>
                        <Monitor className="mr-2 h-4 w-4" />
                        Switch to Advertiser
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};