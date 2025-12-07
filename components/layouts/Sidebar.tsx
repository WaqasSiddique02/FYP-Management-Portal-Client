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
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';


interface SidebarProps {
  role: 'student' | 'supervisor' | 'coordinator';
}

const studentNavItems = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/register-fyp', label: 'Register FYP', icon: UserPlus },
  { href: '/student/select-project', label: 'Select Project', icon: BookOpen },
  { href: '/student/documents', label: 'Upload Documents', icon: Upload },
  { href: '/student/marks-report', label: 'Marks Report', icon: BarChart3 },
  { href: '/student/feedback', label: 'Feedback', icon: MessageSquare },
  { href: '/student/settings', label: 'Settings', icon: Settings },
];

const supervisorNavItems = [
  { href: '/supervisor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/supervisor/groups', label: 'My Groups', icon: Users },
  { href: '/supervisor/proposals', label: 'Proposals', icon: FileText },
  { href: '/supervisor/evaluations', label: 'Evaluations', icon: BookOpen },
  { href: '/supervisor/settings', label: 'Settings', icon: Settings },
];

const coordinatorNavItems = [
  { href: '/coordinator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/coordinator/students', label: 'Students', icon: Users },
  { href: '/coordinator/supervisors', label: 'Supervisors', icon: Users },
  { href: '/coordinator/projects', label: 'Projects', icon: BookOpen },
  { href: '/coordinator/reports', label: 'Reports', icon: FileText },
  { href: '/coordinator/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  
  const navItems = role === 'student' 
    ? studentNavItems 
    : role === 'supervisor' 
    ? supervisorNavItems 
    : coordinatorNavItems;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-blue-600">FYP Portal</h2>
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
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs font-medium text-blue-900">Need Help?</p>
          <p className="text-xs text-blue-700 mt-1">Contact your coordinator</p>
        </div>
      </div>
    </aside>
  );
}