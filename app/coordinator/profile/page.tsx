"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { coordinatorApi } from '@/lib/api/coordinator.api';
import { CoordinatorProfile } from '@/lib/types/coordinator.types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Building2, 
  Calendar, 
  Users, 
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Shield,
  FileText,
  Clock
} from 'lucide-react';

const CoordinatorProfilePage = () => {
  const [profile, setProfile] = useState<CoordinatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coordinatorApi.getProfile();
      setProfile(response.data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err?.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="coordinator">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout role="coordinator">
        <div className="flex flex-col items-center justify-center h-96">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-gray-600 mb-4">{error || 'Profile not found'}</p>
          <button 
            onClick={fetchProfile}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout role="coordinator">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="relative bg-linear-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-8 overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl border border-white/30 shadow-2xl">
              <User className="w-20 h-20 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white">
                  {profile.fullName}
                </h1>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm w-fit">
                  <Shield className="w-3 h-3 mr-1" />
                  Coordinator
                </Badge>
              </div>
              <p className="text-indigo-100 text-lg mb-4">{profile.designation}</p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-white/90">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{profile.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">ID: {profile.coordinatorId}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information Card */}
          <Card className="lg:col-span-2 p-6 border-2 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                    <User className="w-4 h-4" />
                    <span>First Name</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800 pl-6">{profile.firstName}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                    <User className="w-4 h-4" />
                    <span>Last Name</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800 pl-6">{profile.lastName}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                  <Mail className="w-4 h-4" />
                  <span>Email Address</span>
                </div>
                <p className="text-lg font-semibold text-gray-800 pl-6 break-all">{profile.email}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                  <Phone className="w-4 h-4" />
                  <span>Phone Number</span>
                </div>
                <p className="text-lg font-semibold text-gray-800 pl-6">{profile.phoneNumber}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  <span>Office Address</span>
                </div>
                <p className="text-lg font-semibold text-gray-800 pl-6">{profile.officeAddress}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                  <Briefcase className="w-4 h-4" />
                  <span>Designation</span>
                </div>
                <p className="text-lg font-semibold text-gray-800 pl-6">{profile.designation}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  <span>Coordinator ID</span>
                </div>
                <p className="text-lg font-semibold text-gray-800 pl-6">
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {profile.coordinatorId}
                  </Badge>
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Stats & Department Info */}
          <div className="space-y-6">
            {/* Department Card */}
            <Card className="p-6 bg-linear-to-br from-purple-50 to-indigo-50 border-2 border-indigo-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-600 rounded-xl">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Department</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-indigo-700">{profile.department.name}</p>
                  <p className="text-sm text-gray-600 mt-1">Code: {profile.department.code}</p>
                </div>

                <Separator />

                <p className="text-sm text-gray-700 leading-relaxed">
                  {profile.department.description}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <Users className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">{profile.department.totalFaculty}</p>
                    <p className="text-xs text-gray-500 font-medium">Faculty Members</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <GraduationCap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">{profile.department.totalStudents}</p>
                    <p className="text-xs text-gray-500 font-medium">Students</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Account Status Card */}
            <Card className="p-6 bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-600 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Account Status</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Status</span>
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Role</span>
                  <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300">
                    {profile.role}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Member Since</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 pl-6">
                    {formatDate(profile.createdAt)}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Last Updated</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 pl-6">
                    {formatDate(profile.updatedAt)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* System Information */}
        <Card className="p-6 border-2 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gray-100 rounded-xl">
              <Shield className="w-6 h-6 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">System Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl">
              <p className="text-sm text-gray-600 font-medium mb-2">User ID</p>
              <p className="text-sm font-mono font-semibold text-gray-800 break-all">{profile._id}</p>
            </div>

            <div className="p-4 bg-linear-to-br from-purple-50 to-purple-100 rounded-xl">
              <p className="text-sm text-gray-600 font-medium mb-2">Department ID</p>
              <p className="text-sm font-mono font-semibold text-gray-800 break-all">{profile.department._id}</p>
            </div>

            <div className="p-4 bg-linear-to-br from-green-50 to-green-100 rounded-xl">
              <p className="text-sm text-gray-600 font-medium mb-2">Account Created</p>
              <p className="text-sm font-semibold text-gray-800">{formatDate(profile.createdAt)}</p>
            </div>

            <div className="p-4 bg-linear-to-br from-orange-50 to-orange-100 rounded-xl">
              <p className="text-sm text-gray-600 font-medium mb-2">Last Modified</p>
              <p className="text-sm font-semibold text-gray-800">{formatDate(profile.updatedAt)}</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CoordinatorProfilePage;
