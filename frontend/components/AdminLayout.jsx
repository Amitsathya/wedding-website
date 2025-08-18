import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Card } from '@/components/ui/card';
import { BarChart3, FileText, Users, Mail, Camera, MessageSquare, ExternalLink, LogOut, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Registrations', href: '/admin/registrations', icon: FileText },
    { name: 'Guests', href: '/admin/guests', icon: Users },
    { name: 'RSVPs', href: '/admin/rsvps', icon: Mail },
    { name: 'Photos', href: '/admin/photos', icon: Camera },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 sm:space-x-8">
              <Link href="/admin" className="text-lg sm:text-xl font-bold font-serif text-foreground">
                Wedding Admin
              </Link>
              
              <div className="hidden md:flex space-x-2">
                {navigation.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center
                        ${router.pathname === item.href
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }
                      `}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle />
              <div className="hidden sm:flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/" target="_blank">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Site
                  </Link>
                </Button>
                <div className="text-sm text-muted-foreground hidden lg:block">
                  {user?.email}
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
              
              {/* Mobile menu button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${router.pathname === item.href
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <IconComponent className="w-4 h-4 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
              
              <div className="border-t border-border pt-2 mt-2">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                  <Link href="/" target="_blank">
                    <ExternalLink className="w-4 h-4 mr-3" />
                    View Site
                  </Link>
                </Button>
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {user?.email}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="w-full justify-start"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-2 sm:px-0">
        {children}
      </div>
    </div>
  );
}