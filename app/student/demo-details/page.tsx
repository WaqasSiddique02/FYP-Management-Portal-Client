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
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Mail,
  Phone,
  Award,
  AlertCircle,
  CheckCircle2,
  CalendarClock,
  FileText,
  Building,
  Briefcase,
} from 'lucide-react';
import apiClient from '@/lib/api/axios';
import { ENDPOINTS } from '@/lib/api/endpoints';

interface PanelMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  department?: string;
  specialization?: string;
  officeLocation?: string;
  officeHours?: string;
}

interface EvaluationPanel {
  _id: string;
  name: string;
  members: PanelMember[];
  department: string;
  createdAt: string;
}

interface GroupMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  rollNumber: string;
}

interface Group {
  _id: string;
  name: string;
  leader: GroupMember;
  members: GroupMember[];
}

interface Schedule {
  id: string;
  date: string;
  timeSlot: string;
  room: string;
  department: string;
  notes?: string;
  isCompleted: boolean;
  completedAt?: string;
  group: Group;
  panel: EvaluationPanel;
}

interface ScheduleResponse {
  message: string;
  schedule: Schedule | null;
}

interface PanelResponse {
  message: string;
  panel: EvaluationPanel | null;
}

export default function DemoDetailsPage() {
  useAuthProtection('STUDENT');
  
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState<ScheduleResponse | null>(null);
  const [panelData, setPanelData] = useState<PanelResponse | null>(null);

  useEffect(() => {
    fetchDemoDetails();
  }, []);

  const fetchDemoDetails = async () => {
    try {
      setLoading(true);
      const [scheduleResponse, panelResponse] = await Promise.all([
        apiClient.get(ENDPOINTS.SCHEDULE.MY_SCHEDULE),
        apiClient.get(ENDPOINTS.SCHEDULE.MY_PANEL),
      ]);
      
      setScheduleData(scheduleResponse.data.data);
      setPanelData(panelResponse.data.data);
    } catch (error) {
      console.error('Error fetching demo details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch {
      return 'N/A';
    }
  };

  const formatTime = (timeSlot: string) => {
    if (!timeSlot) return 'N/A';
    
    // If timeSlot is in format like "09:00-10:00" or "9:00 AM - 10:00 AM"
    const parts = timeSlot.split('-');
    if (parts.length === 2) {
      return timeSlot;
    }
    
    return timeSlot;
  };

  const isPastDemo = (dateString: string, timeSlot: string) => {
    try {
      const demoDate = new Date(dateString);
      const now = new Date();
      return demoDate < now;
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading demo details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const schedule = scheduleData?.schedule;
  const panel = panelData?.panel || schedule?.panel;
  const hasSchedule = !!schedule;
  const hasPanel = !!panel;
  const isCompleted = schedule?.isCompleted || false;
  const isPast = schedule ? isPastDemo(schedule.date, schedule.timeSlot) : false;

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Demo Details</h1>
          <p className="text-gray-600 mt-1">View your presentation schedule and evaluation panel</p>
        </div>

        {/* Status Banner */}
        {!hasSchedule ? (
          <Card className="border-yellow-500 bg-yellow-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-600 shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-900">No Demo Scheduled Yet</p>
                  <p className="text-sm text-yellow-700">Your presentation schedule will be assigned by the coordinator soon.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : isCompleted ? (
          <Card className="border-green-500 bg-green-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                <div>
                  <p className="font-semibold text-green-900">Demo Completed</p>
                  <p className="text-sm text-green-700">
                    Your presentation was completed on {schedule.completedAt ? formatDate(schedule.completedAt) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : isPast ? (
          <Card className="border-orange-500 bg-orange-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <CalendarClock className="h-6 w-6 text-orange-600 shrink-0" />
                <div>
                  <p className="font-semibold text-orange-900">Demo Date Passed</p>
                  <p className="text-sm text-orange-700">Your scheduled demo date has passed. Please contact your coordinator if needed.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-blue-500 bg-blue-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-blue-600 shrink-0" />
                <div>
                  <p className="font-semibold text-blue-900">Demo Scheduled</p>
                  <p className="text-sm text-blue-700">Your presentation is scheduled. Make sure to prepare well!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule Details */}
        {hasSchedule && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Date & Time Card */}
            <Card className="border-2 border-blue-500">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Schedule Information
                </CardTitle>
                <CardDescription>Presentation date, time, and venue details</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(schedule.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Time Slot</p>
                      <p className="font-semibold text-gray-900">{formatTime(schedule.timeSlot)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Venue</p>
                      <p className="font-semibold text-gray-900">{schedule.room || 'TBA'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Building className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Department</p>
                      <p className="font-semibold text-gray-900">{schedule.department}</p>
                    </div>
                  </div>
                </div>

                {schedule.notes && (
                  <>
                    <Separator />
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                        <p className="text-sm font-semibold text-blue-900">Additional Notes</p>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{schedule.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Group Details Card */}
            {schedule.group && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Group Information
                  </CardTitle>
                  <CardDescription>Team members presenting</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Group Name</p>
                    <p className="text-lg font-bold text-gray-900">{schedule.group.name}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-gray-500 mb-3">Team Members ({schedule.group.members.length})</p>
                    <div className="space-y-2">
                      {schedule.group.members.map((member) => {
                        const isLeader = member._id === schedule.group.leader._id;
                        
                        return (
                          <div
                            key={member._id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              isLeader ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                isLeader ? 'bg-blue-600' : 'bg-gray-400'
                              }`}>
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {member.firstName} {member.lastName}
                                </p>
                                <p className="text-xs text-gray-600">{member.rollNumber}</p>
                              </div>
                            </div>
                            {isLeader && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
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
          </div>
        )}

        {/* Evaluation Panel */}
        {hasPanel && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Evaluation Panel
              </CardTitle>
              <CardDescription>Panel members who will evaluate your presentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {panel.members.map((member, index) => (
                  <Card key={member._id} className="border-2 hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="h-12 w-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {member.firstName} {member.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{member.designation}</p>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-500 shrink-0" />
                          <p className="text-gray-700 truncate">{member.email}</p>
                        </div>

                        {member.department && (
                          <div className="flex items-center gap-2 text-sm">
                            <Building className="h-4 w-4 text-gray-500 shrink-0" />
                            <p className="text-gray-700">{member.department}</p>
                          </div>
                        )}

                        {member.specialization && (
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="h-4 w-4 text-gray-500 shrink-0" />
                            <p className="text-gray-700">{member.specialization}</p>
                          </div>
                        )}

                        {member.officeLocation && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
                            <p className="text-gray-700">{member.officeLocation}</p>
                          </div>
                        )}

                        {member.officeHours && (
                          <div className="flex items-start gap-2 text-sm mt-3 p-2 bg-gray-50 rounded">
                            <Clock className="h-4 w-4 text-gray-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Office Hours</p>
                              <p className="text-gray-700 text-xs">{member.officeHours}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {panel.members.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No panel members assigned yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* No Panel Message */}
        {!hasPanel && !hasSchedule && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Evaluation Panel Assigned</h3>
                <p className="text-gray-600">The evaluation panel will be assigned once your demo is scheduled.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
