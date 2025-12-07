'use client';

import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useAuth } from '@/lib/hooks/userAuth';
import { useAuthContext } from '@/lib/contexts/AuthContext';


interface NavbarProps {
  onMenuClick?: () => void;
  sidebarContent?: React.ReactNode;
}

export default function Navbar({ onMenuClick, sidebarContent }: NavbarProps) {
  const { logout } = useAuth();
  const { user } = useAuthContext();

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return name.substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const getDisplayName = () => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.name || 'User';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Mobile Menu */}
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Main navigation menu for the FYP Management Portal
              </SheetDescription>
              {sidebarContent}
            </SheetContent>
          </Sheet>
          
          <div className="lg:hidden">
            <h2 className="text-lg font-bold text-blue-600">FYP Portal</h2>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
                    {getInitials(getDisplayName())}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">{getDisplayName()}</span>
                  <span className="text-xs text-gray-500 capitalize">{user?.role || 'Student'}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{getDisplayName()}</span>
                  <span className="text-xs text-gray-500">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href={`/${user?.role?.toLowerCase()}/profile`} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}