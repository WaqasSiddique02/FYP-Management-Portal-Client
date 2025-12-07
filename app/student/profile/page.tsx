'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuthProtection } from '@/lib/hooks/useAuthProtection';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  Mail,
  Phone,
  Building,
  BookOpen,
  GraduationCap,
  Hash,
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  Briefcase,
  Award,
} from 'lucide-react';
import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';

interface GroupInfo {
  _id: string;
  name: string;
  leader: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  members: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
  }>;
  assignedSupervisor?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface StudentProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  rollNumber: string;
  department: string;
  semester: string;
  program: string;
  phoneNumber?: string;
  cgpa?: number;
  isRegisteredForFYP: boolean;
  assignedSupervisor?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProfileResponse {
  message: string;
  student: StudentProfile;
  group: GroupInfo | null;
}

export default function StudentProfilePage() {
  useAuthProtection('STUDENT');
  
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(ENDPOINTS.STUDENT.PROFILE);
      setProfileData(response.data.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profileData?.student) {
    return (
      <DashboardLayout role="student">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Profile Not Found</h3>
              <p className="text-gray-600">Unable to load profile data.</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const student = profileData.student;
  const group = profileData.group;
  const isGroupLeader = group && group.leader._id === student._id;

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View and manage your personal information</p>
        </div>

        {/* Profile Header Card */}
        <Card className="border-2 border-blue-500">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="shrink-0">
                <Avatar className="h-24 w-24 border-4 border-blue-100">
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                    {getInitials(student.firstName, student.lastName)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="text-gray-600 mt-1">{student.email}</p>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                    {student.rollNumber}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                    {student.program}
                  </Badge>
                  {student.isRegisteredForFYP ? (
                    <Badge className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      FYP Registered
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Registered for FYP
                    </Badge>
                  )}
                  {isGroupLeader && (
                    <Badge className="bg-amber-500">
                      <Award className="h-3 w-3 mr-1" />
                      Group Leader
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                    <p className="font-semibold text-gray-900">
                      {student.firstName} {student.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Email Address</p>
                    <p className="font-semibold text-gray-900 break-all">{student.email}</p>
                  </div>
                </div>

                {student.phoneNumber && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                      <p className="font-semibold text-gray-900">{student.phoneNumber}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Member Since</p>
                    <p className="font-semibold text-gray-900">{formatDate(student.createdAt)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Academic Information
              </CardTitle>
              <CardDescription>Your academic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Hash className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Roll Number</p>
                    <p className="font-semibold text-gray-900">{student.rollNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Department</p>
                    <p className="font-semibold text-gray-900">{student.department}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Program</p>
                    <p className="font-semibold text-gray-900">{student.program}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Briefcase className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Semester</p>
                    <p className="font-semibold text-gray-900">{student.semester}</p>
                  </div>
                </div>

                {student.cgpa !== undefined && student.cgpa !== null && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Award className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">CGPA</p>
                      <p className="font-semibold text-gray-900">{student.cgpa.toFixed(2)} / 4.00</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supervisor Information */}
        {student.assignedSupervisor && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Assigned Supervisor
              </CardTitle>
              <CardDescription>Your FYP supervisor details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Avatar className="h-12 w-12 border-2 border-blue-300">
                  <AvatarFallback className="bg-blue-600 text-white font-semibold">
                    {getInitials(
                      student.assignedSupervisor.firstName,
                      student.assignedSupervisor.lastName
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">
                    {student.assignedSupervisor.firstName} {student.assignedSupervisor.lastName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <p className="text-sm text-gray-700">{student.assignedSupervisor.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Group Information */}
        {group && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Group Information
              </CardTitle>
              <CardDescription>Your FYP group details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-linear-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Group Name</p>
                    <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                  </div>
                  <Badge className="bg-blue-600">
                    {group.members.length} {group.members.length === 1 ? 'Member' : 'Members'}
                  </Badge>
                </div>

                {group.assignedSupervisor && (
                  <>
                    <Separator className="my-3" />
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Group Supervisor</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-purple-600 text-white text-xs">
                            {getInitials(
                              group.assignedSupervisor.firstName,
                              group.assignedSupervisor.lastName
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">
                            {group.assignedSupervisor.firstName} {group.assignedSupervisor.lastName}
                          </p>
                          <p className="text-xs text-gray-600">{group.assignedSupervisor.email}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Group Members</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.members.map((member) => {
                    const isMemberLeader = member._id === group.leader._id;
                    
                    return (
                      <div
                        key={member._id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          isMemberLeader
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback
                            className={`${
                              isMemberLeader
                                ? 'bg-amber-600 text-white'
                                : 'bg-gray-600 text-white'
                            } font-semibold text-sm`}
                          >
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-gray-600">{member.rollNumber}</p>
                        </div>
                        {isMemberLeader && (
                          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
                            Leader
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Account Status
            </CardTitle>
            <CardDescription>Your account registration and activity status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="flex justify-center mb-2">
                  {student.isRegisteredForFYP ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <XCircle className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-1">FYP Registration</p>
                <p className="font-semibold text-gray-900">
                  {student.isRegisteredForFYP ? 'Registered' : 'Not Registered'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="flex justify-center mb-2">
                  {group ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <XCircle className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-1">Group Status</p>
                <p className="font-semibold text-gray-900">
                  {group ? 'In a Group' : 'No Group'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="flex justify-center mb-2">
                  {student.assignedSupervisor || group?.assignedSupervisor ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <XCircle className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-1">Supervisor Assigned</p>
                <p className="font-semibold text-gray-900">
                  {student.assignedSupervisor || group?.assignedSupervisor ? 'Assigned' : 'Not Assigned'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
