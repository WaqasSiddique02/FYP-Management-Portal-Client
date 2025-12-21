"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  UserCog,
  Shield,
  GraduationCap,
  ArrowRight,
  Github,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const roles = [
    {
      id: "student",
      title: "Student Portal",
      description:
        "Submit your FYP, view supervisor feedback, and track evaluation progress in one place.",
      icon: BookOpen,
      route: "/student/login",
      accent: "from-blue-500 to-blue-600",
    },
    {
      id: "supervisor",
      title: "Supervisor Portal",
      description:
        "Manage assigned students, review submissions, and provide structured evaluations.",
      icon: UserCog,
      route: "/supervisor/login",
      accent: "from-emerald-500 to-emerald-600",
    },
    {
      id: "coordinator",
      title: "Coordinator Portal",
      description:
        "Oversee projects, assign supervisors, and control academic workflows centrally.",
      icon: Shield,
      route: "/coordinator/login",
      accent: "from-violet-500 to-violet-600",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2.5 rounded-lg">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              FYP Management Portal
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-14 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          Manage Final Year Projects
          <span className="block bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Smarter & Faster
          </span>
        </h2>
        <p className="mt-6 text-lg text-slate-600 max-w-3xl mx-auto">
          A centralized platform designed for students, supervisors, and
          coordinators to streamline Final Year Project workflows efficiently.
        </p>
      </section>

      {/* Role Cards */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => router.push(role.route)}
                className="group relative bg-white rounded-3xl border border-slate-200 p-8 text-left
                           shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-linear-to-r ${role.accent}`}
                />

                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`p-3 rounded-xl bg-linear-to-br ${role.accent} shadow-lg`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-700 transition" />
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  {role.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {role.description}
                </p>

                <div className="mt-6 font-semibold text-slate-800 group-hover:text-blue-600 transition">
                  Access Portal
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Help Section */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-3xl p-10 text-center text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-4">Need Assistance?</h3>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Having trouble accessing the portal or facing system issues? Our
            support team is here to help you.
          </p>
          <a
            href="mailto:support@fyp-portal.edu"
            className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold
                       px-7 py-3 rounded-xl hover:bg-slate-100 transition"
          >
            Contact Support
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6">
        <p className="text-center text-slate-500 text-sm">
          © 2025 FYP Management System. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
