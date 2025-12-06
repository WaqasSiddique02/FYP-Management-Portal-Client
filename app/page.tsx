'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, UserCog, Shield, GraduationCap } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const roles = [
    {
      id: 'student',
      title: 'Student',
      description: 'Access your FYP submissions, view feedback, and track progress',
      icon: BookOpen,
      route: '/student/login',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      id: 'supervisor',
      title: 'Supervisor',
      description: 'Review student projects, provide guidance, and manage evaluations',
      icon: UserCog,
      route: '/supervisor/login',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      id: 'coordinator',
      title: 'Coordinator',
      description: 'Oversee all projects, assign supervisors, and manage system settings',
      icon: Shield,
      route: '/coordinator/login',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    }
  ];

  const handleRoleClick = (route: string) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-gray-900 shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <GraduationCap className="h-10 w-10 text-blue-400 mr-3" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                FYP Management System
              </h1>
            </div>
            <p className="text-base sm:text-lg text-gray-300 mt-2">
              Final Year Project Portal
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
            Welcome! Please Select Your Role
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your role below to access the portal and manage your final year projects
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleClick(role.route)}
                className={`${role.color} border-2 rounded-2xl p-8 transition-all duration-200 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 text-left w-full`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="bg-white rounded-full p-4 mb-4 shadow-md">
                    <Icon className="h-12 w-12 text-gray-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {role.title}
                  </h3>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {role.description}
                  </p>
                  <div className="mt-6 text-blue-600 font-semibold text-lg">
                    Click to Login →
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="mt-16 bg-white rounded-xl shadow-md p-6 sm:p-8 border border-gray-200">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Need Help?
            </h3>
            <p className="text-gray-600 text-base mb-4">
              If you're having trouble accessing the portal or need assistance, please contact your system administrator.
            </p>
            <a
              href="mailto:support@fyp-portal.edu"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 text-base"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-400 text-sm">
            © 2025 FYP Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}