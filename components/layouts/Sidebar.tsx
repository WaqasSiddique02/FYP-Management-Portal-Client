'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  FolderOpen, 
  MessageSquare,
  Settings,
  BookOpen,
  Github,
  GraduationCap,
  UserPlus,
  Upload,
  BarChart3,
  Calendar,
  User,
  Lightbulb,
  Building2,
  Megaphone,
  CalendarDays
} from 'lucide-react';
import { cn } from '@/lib/utils';


interface SidebarProps {
  role: 'student' | 'supervisor' | 'coordinator';
  isMobile?: boolean;
}

const studentNavItems = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/register-fyp', label: 'Register FYP', icon: UserPlus },
  { href: '/student/select-project', label: 'Select Project', icon: BookOpen },
  { href: '/student/documents', label: 'Upload Documents', icon: Upload },
  { href: '/student/marks-report', label: 'Marks Report', icon: BarChart3 },
  { href: '/student/demo-details', label: 'Demo Details', icon: Calendar },
  { href: '/student/profile', label: 'Profile', icon: User },
];

const supervisorNavItems = [
  { href: '/supervisor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/supervisor/groups', label: 'My Groups', icon: Users },
  { href: '/supervisor/project-ideas', label: 'Project Ideas', icon: Lightbulb },
  { href: '/supervisor/proposals', label: 'Proposals', icon: FileText },
  { href: '/supervisor/evaluations', label: 'Evaluations', icon: BookOpen },
  { href: '/supervisor/schedules', label: 'Schedules', icon: Calendar },
  { href: '/supervisor/profile', label: 'Profile', icon: User },
];

const coordinatorNavItems = [
  { href: '/coordinator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/coordinator/management', label: 'System Management', icon: Building2 },
  { href: '/coordinator/groups', label: 'Groups', icon: Users },
  { href: '/coordinator/projects', label: 'Project Monitoring', icon: FolderOpen },
  { href: '/coordinator/panels', label: 'Evaluation Panels', icon: GraduationCap },
  { href: '/coordinator/schedules', label: 'Demo Scheduling', icon: CalendarDays },
  { href: '/coordinator/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/coordinator/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ role, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  
  const navItems = role === 'student' 
    ? studentNavItems 
    : role === 'supervisor' 
    ? supervisorNavItems 
    : coordinatorNavItems;

  // Color scheme based on role
  const colorScheme = role === 'supervisor' 
    ? {
        primary: 'text-green-600',
        bgPrimary: 'bg-green-50',
        hoverBg: 'hover:bg-green-50',
        hoverText: 'hover:text-green-600',
        helpBg: 'bg-green-50',
        helpTextPrimary: 'text-green-900',
        helpTextSecondary: 'text-green-700',
      }
    : role === 'coordinator'
    ? {
        primary: 'text-indigo-600',
        bgPrimary: 'bg-indigo-50',
        hoverBg: 'hover:bg-indigo-50',
        hoverText: 'hover:text-indigo-600',
        helpBg: 'bg-indigo-50',
        helpTextPrimary: 'text-indigo-900',
        helpTextSecondary: 'text-indigo-700',
      }
    : {
        primary: 'text-blue-600',
        bgPrimary: 'bg-blue-50',
        hoverBg: 'hover:bg-blue-50',
        hoverText: 'hover:text-blue-600',
        helpBg: 'bg-blue-50',
        helpTextPrimary: 'text-blue-900',
        helpTextSecondary: 'text-blue-700',
      };

  const sidebarClasses = isMobile 
    ? "flex flex-col w-64 bg-white border-r border-gray-200 h-screen"
    : "hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0";

  return (
    <aside className={sidebarClasses}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <GraduationCap className={`h-6 w-6 ${colorScheme.primary}`} />
          <h2 className={`text-xl font-bold ${colorScheme.primary}`}>FYP Portal</h2>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive 
                  ? `${colorScheme.bgPrimary} ${colorScheme.primary} font-medium` 
                  : `text-gray-700 ${colorScheme.hoverBg} ${colorScheme.hoverText}`
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className={`${colorScheme.helpBg} rounded-lg p-4`}>
          <p className={`text-xs font-medium ${colorScheme.helpTextPrimary}`}>Need Help?</p>
          <p className={`text-xs ${colorScheme.helpTextSecondary} mt-1`}>Contact your coordinator</p>
        </div>
      </div>
    </aside>
  );
}