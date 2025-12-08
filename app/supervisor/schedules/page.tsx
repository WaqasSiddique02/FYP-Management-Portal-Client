'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { supervisorApi } from '@/lib/api/supervisor.api';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  UserCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  ChevronRight,
  Award,
} from 'lucide-react';

interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  rollNumber?: string;
  designation?: string;
}

interface Panel {
  _id: string;
  name: string;
  department: string;
  description?: string;
  members: Member[];
  isActive: boolean;
}

interface Schedule {
  _id: string;
  group: {
    _id: string;
    name: string;
    department: string;
    leader: Member;
    members: Member[];
    assignedSupervisor?: Member;
  };
  panel: {
    _id: string;
    name: string;
    members: Member[];
  };
  date: string;
  timeSlot: string;
  room: string;
  department: string;
  notes?: string;
  isCompleted: boolean;
  completedAt?: string;
}

interface UnscheduledGroup {
  id: string;
  name: string;
  department: string;
}

export default function PresentationSchedulesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();

  // Panels
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loadingPanels, setLoadingPanels] = useState(true);

  // Panel Schedules
  const [panelSchedules, setPanelSchedules] = useState<Schedule[]>([]);
  const [loadingPanelSchedules, setLoadingPanelSchedules] = useState(false);

  // Assigned Groups Schedules
  const [assignedSchedules, setAssignedSchedules] = useState<Schedule[]>([]);
  const [unscheduledGroups, setUnscheduledGroups] = useState<UnscheduledGroup[]>([]);
  const [assignedStats, setAssignedStats] = useState({
    totalAssignedGroups: 0,
    scheduledCount: 0,
    unscheduledCount: 0,
  });
  const [loadingAssignedSchedules, setLoadingAssignedSchedules] = useState(false);

  // Search
  const [panelSearchQuery, setPanelSearchQuery] = useState('');
  const [assignedSearchQuery, setAssignedSearchQuery] = useState('');

  // Error states
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchPanels();
    } else if (!authLoading && !user) {
      // Not logged in, stop loading
      setLoadingPanels(false);
    }
  }, [authLoading, user]);

  // Safety timeout - separate effect to prevent infinite loading
  useEffect(() => {
    if (!loadingPanels) return;

    const timeout = setTimeout(() => {
      console.warn('Loading timeout - stopping loading state');
      setLoadingPanels(false);
      setError('Request timed out. Please try again.');
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeout);
  }, [loadingPanels]);

  const fetchPanels = async () => {
    try {
      setLoadingPanels(true);
      setError(null);
      console.log('Fetching panels...');
      const response = await supervisorApi.getMyPanels();
      console.log('Panels response:', response);
      setPanels(Array.isArray(response?.panels) ? response.panels : []);
    } catch (error: any) {
      console.error('Error fetching panels:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch panels';
      setError(errorMessage);
      setPanels([]);
    } finally {
      setLoadingPanels(false);
      console.log('Panels loading complete');
    }
  };

  const fetchPanelSchedules = async () => {
    try {
      setLoadingPanelSchedules(true);
      setError(null);
      const response = await supervisorApi.getMyPanelSchedules();
      setPanelSchedules(Array.isArray(response?.schedules) ? response.schedules : []);
    } catch (error: any) {
      console.error('Error fetching panel schedules:', error);
      setError(error.response?.data?.message || 'Failed to fetch panel schedules');
      setPanelSchedules([]);
    } finally {
      setLoadingPanelSchedules(false);
    }
  };

  const fetchAssignedSchedules = async () => {
    try {
      setLoadingAssignedSchedules(true);
      setError(null);
      const response = await supervisorApi.getAssignedGroupsSchedules();
      setAssignedSchedules(Array.isArray(response?.schedules) ? response.schedules : []);
      setUnscheduledGroups(Array.isArray(response?.unscheduledGroups) ? response.unscheduledGroups : []);
      setAssignedStats({
        totalAssignedGroups: response?.totalAssignedGroups || 0,
        scheduledCount: response?.scheduledCount || 0,
        unscheduledCount: response?.unscheduledCount || 0,
      });
    } catch (error: any) {
      console.error('Error fetching assigned schedules:', error);
      setError(error.response?.data?.message || 'Failed to fetch assigned groups schedules');
      setAssignedSchedules([]);
      setUnscheduledGroups([]);
    } finally {
      setLoadingAssignedSchedules(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeSlot: string) => {
    return timeSlot;
  };

  const isPastSchedule = (dateString: string, timeSlot: string) => {
    const scheduleDate = new Date(dateString);
    const now = new Date();
    return scheduleDate < now;
  };

  const filteredPanelSchedules = panelSchedules.filter((schedule) => {
    const searchLower = panelSearchQuery.toLowerCase();
    return (
      schedule.group.name.toLowerCase().includes(searchLower) ||
      schedule.room.toLowerCase().includes(searchLower) ||
      schedule.panel.name.toLowerCase().includes(searchLower)
    );
  });

  const filteredAssignedSchedules = assignedSchedules.filter((schedule) => {
    const searchLower = assignedSearchQuery.toLowerCase();
    return (
      schedule.group.name.toLowerCase().includes(searchLower) ||
      schedule.room.toLowerCase().includes(searchLower)
    );
  });

  if (authLoading || loadingPanels) {
    return (
      <DashboardLayout role="supervisor">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading schedules...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="supervisor">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-green-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Presentation Schedules</h1>
              <p className="text-green-100 text-sm md:text-base">
                View and manage presentation schedules for evaluation panels and assigned groups
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/30">
                <p className="text-3xl font-bold">{panels.length}</p>
                <p className="text-xs text-green-100 mt-1">My Panels</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-900 font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="panels" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
            <TabsTrigger value="panels" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Award className="h-4 w-4 mr-2" />
              My Panels
            </TabsTrigger>
            <TabsTrigger
              value="panel-schedules"
              onClick={() => {
                if (panelSchedules.length === 0 && !loadingPanelSchedules) {
                  fetchPanelSchedules();
                }
              }}
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Panel Schedules
            </TabsTrigger>
            <TabsTrigger
              value="assigned-groups"
              onClick={() => {
                if (assignedSchedules.length === 0 && !loadingAssignedSchedules) {
                  fetchAssignedSchedules();
                }
              }}
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              My Groups
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: My Panels */}
          <TabsContent value="panels" className="space-y-4">
            {panels.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Award className="h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Panels Assigned</h3>
                  <p className="text-slate-500 text-center max-w-sm">
                    You are not assigned to any evaluation panels yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {panels.map((panel) => (
                  <Card key={panel._id} className="border-slate-200 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-base font-bold text-slate-900">
                            {panel.name}
                          </CardTitle>
                          <p className="text-xs text-slate-500 mt-1">{panel.department}</p>
                        </div>
                        <Badge
                          className={
                            panel.isActive
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }
                        >
                          {panel.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {panel.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">{panel.description}</p>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{panel.members.length} Members</span>
                        </div>
                        <div className="pl-6 space-y-1">
                          {panel.members.slice(0, 3).map((member) => (
                            <div key={member._id} className="text-xs text-slate-500">
                              • {member.firstName} {member.lastName}
                              {member.designation && ` (${member.designation})`}
                            </div>
                          ))}
                          {panel.members.length > 3 && (
                            <div className="text-xs text-slate-400">
                              +{panel.members.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Panel Schedules */}
          <TabsContent value="panel-schedules" className="space-y-4">
            {loadingPanelSchedules ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : (
              <>
                {/* Search Bar */}
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Search by group name, panel, or room..."
                    value={panelSearchQuery}
                    onChange={(e) => setPanelSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                {filteredPanelSchedules.length === 0 ? (
                  <Card className="border-2 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Calendar className="h-12 w-12 text-slate-400 mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {panelSearchQuery ? 'No Schedules Found' : 'No Schedules Yet'}
                      </h3>
                      <p className="text-slate-500 text-center max-w-sm">
                        {panelSearchQuery
                          ? 'No schedules match your search'
                          : 'No presentation schedules have been created for your panels'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredPanelSchedules.map((schedule) => (
                      <Card
                        key={schedule._id}
                        className={`border-l-4 ${
                          schedule.isCompleted
                            ? 'border-green-500 bg-green-50/30'
                            : isPastSchedule(schedule.date, schedule.timeSlot)
                            ? 'border-slate-400 bg-slate-50'
                            : 'border-green-600'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Date & Time */}
                            <div className="md:col-span-3 space-y-2">
                              <div className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 text-green-600 mt-0.5" />
                                <div>
                                  <p className="text-xs text-slate-500 uppercase tracking-wide">Date</p>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {formatDate(schedule.date)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-green-600 mt-0.5" />
                                <div>
                                  <p className="text-xs text-slate-500 uppercase tracking-wide">Time</p>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {formatTime(schedule.timeSlot)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                                <div>
                                  <p className="text-xs text-slate-500 uppercase tracking-wide">Room</p>
                                  <p className="text-sm font-semibold text-slate-900">{schedule.room}</p>
                                </div>
                              </div>
                            </div>

                            {/* Group Details */}
                            <div className="md:col-span-4 space-y-2">
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Group</p>
                                <p className="text-base font-bold text-slate-900">{schedule.group.name}</p>
                                <p className="text-xs text-slate-500">{schedule.group.department}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                                  Team Members
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {schedule.group.members.slice(0, 3).map((member) => (
                                    <Badge
                                      key={member._id}
                                      variant="outline"
                                      className="text-xs bg-white"
                                    >
                                      {member.firstName} {member.lastName}
                                    </Badge>
                                  ))}
                                  {schedule.group.members.length > 3 && (
                                    <Badge variant="outline" className="text-xs bg-slate-100">
                                      +{schedule.group.members.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Panel Details */}
                            <div className="md:col-span-4 space-y-2">
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Panel</p>
                                <p className="text-sm font-semibold text-slate-900">{schedule.panel.name}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                                  Panel Members
                                </p>
                                <div className="space-y-1">
                                  {schedule.panel.members.map((member) => (
                                    <div key={member._id} className="text-xs text-slate-600">
                                      • {member.firstName} {member.lastName}
                                      {member.designation && (
                                        <span className="text-slate-500"> ({member.designation})</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="md:col-span-1 flex items-start justify-end">
                              {schedule.isCompleted && (
                                <Badge className="bg-green-600 text-white">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </div>

                          {schedule.notes && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                                <div>
                                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                                  <p className="text-sm text-slate-700">{schedule.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Tab 3: My Assigned Groups */}
          <TabsContent value="assigned-groups" className="space-y-4">
            {loadingAssignedSchedules ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                {assignedStats.totalAssignedGroups > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-slate-200">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900">
                            {assignedStats.totalAssignedGroups}
                          </p>
                          <p className="text-xs text-slate-500">Total Groups</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900">{assignedStats.scheduledCount}</p>
                          <p className="text-xs text-slate-500">Scheduled</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-200">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-orange-100 p-3 rounded-lg">
                          <AlertCircle className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900">
                            {assignedStats.unscheduledCount}
                          </p>
                          <p className="text-xs text-slate-500">Unscheduled</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Search Bar */}
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Search by group name or room..."
                    value={assignedSearchQuery}
                    onChange={(e) => setAssignedSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                {/* Scheduled Groups */}
                {filteredAssignedSchedules.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-slate-900">Scheduled Presentations</h3>
                    {filteredAssignedSchedules.map((schedule) => (
                      <Card
                        key={schedule._id}
                        className={`border-l-4 ${
                          schedule.isCompleted
                            ? 'border-green-500 bg-green-50/30'
                            : isPastSchedule(schedule.date, schedule.timeSlot)
                            ? 'border-slate-400 bg-slate-50'
                            : 'border-green-600'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Date & Time */}
                            <div className="md:col-span-3 space-y-2">
                              <div className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 text-green-600 mt-0.5" />
                                <div>
                                  <p className="text-xs text-slate-500 uppercase tracking-wide">Date</p>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {formatDate(schedule.date)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-green-600 mt-0.5" />
                                <div>
                                  <p className="text-xs text-slate-500 uppercase tracking-wide">Time</p>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {formatTime(schedule.timeSlot)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                                <div>
                                  <p className="text-xs text-slate-500 uppercase tracking-wide">Room</p>
                                  <p className="text-sm font-semibold text-slate-900">{schedule.room}</p>
                                </div>
                              </div>
                            </div>

                            {/* Group Details */}
                            <div className="md:col-span-5 space-y-2">
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Group</p>
                                <p className="text-base font-bold text-slate-900">{schedule.group.name}</p>
                                <p className="text-xs text-slate-500">{schedule.group.department}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Leader</p>
                                <div className="flex items-center gap-2">
                                  <UserCheck className="h-3 w-3 text-green-600" />
                                  <span className="text-sm text-slate-900">
                                    {schedule.group.leader.firstName} {schedule.group.leader.lastName}
                                  </span>
                                  {schedule.group.leader.rollNumber && (
                                    <Badge variant="outline" className="text-xs">
                                      {schedule.group.leader.rollNumber}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                                  Team Members ({schedule.group.members.length})
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {schedule.group.members.map((member) => (
                                    <Badge
                                      key={member._id}
                                      variant="outline"
                                      className="text-xs bg-white"
                                    >
                                      {member.firstName} {member.lastName}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Panel Details */}
                            <div className="md:col-span-3 space-y-2">
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                                  Evaluation Panel
                                </p>
                                <p className="text-sm font-semibold text-slate-900">{schedule.panel.name}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                                  Panel Members
                                </p>
                                <div className="space-y-1">
                                  {schedule.panel.members.map((member) => (
                                    <div key={member._id} className="text-xs text-slate-600">
                                      • {member.firstName} {member.lastName}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="md:col-span-1 flex items-start justify-end">
                              {schedule.isCompleted && (
                                <Badge className="bg-green-600 text-white">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Done
                                </Badge>
                              )}
                            </div>
                          </div>

                          {schedule.notes && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <div className="flex items-start gap-2">
                                <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                                <div>
                                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                                  <p className="text-sm text-slate-700">{schedule.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Unscheduled Groups */}
                {unscheduledGroups.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      Unscheduled Groups
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {unscheduledGroups.map((group) => (
                        <Card key={group.id} className="border-orange-200 bg-orange-50/30">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-slate-900">{group.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{group.department}</p>
                              </div>
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                Pending
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty States */}
                {assignedSchedules.length === 0 && unscheduledGroups.length === 0 && (
                  <Card className="border-2 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Users className="h-12 w-12 text-slate-400 mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No Assigned Groups</h3>
                      <p className="text-slate-500 text-center max-w-sm">
                        You don't have any groups assigned to you yet
                      </p>
                    </CardContent>
                  </Card>
                )}

                {assignedSchedules.length === 0 &&
                  unscheduledGroups.length === 0 &&
                  assignedSearchQuery && (
                    <Card className="border-2 border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <Calendar className="h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Schedules Found</h3>
                        <p className="text-slate-500 text-center max-w-sm">
                          No schedules match your search criteria
                        </p>
                      </CardContent>
                    </Card>
                  )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
