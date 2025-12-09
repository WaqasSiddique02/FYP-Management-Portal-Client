"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { coordinatorApi } from '@/lib/api/coordinator.api';
import { 
  PresentationSchedule, 
  CreateScheduleDto, 
  UpdateScheduleDto,
  AutoScheduleDto,
  EvaluationPanel,
  ProjectGroup
} from '@/lib/types/coordinator.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Search, 
  Wand2, 
  ArrowLeftRight,
  Eye,
  Pencil,
  Trash2,
  CalendarDays,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface GroupWithSchedule extends ProjectGroup {
  hasSchedule: boolean;
}

const DemoSchedulingPage = () => {
  const [schedules, setSchedules] = useState<PresentationSchedule[]>([]);
  const [panels, setPanels] = useState<EvaluationPanel[]>([]);
  const [groups, setGroups] = useState<GroupWithSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [viewFilter, setViewFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAutoScheduleDialogOpen, setIsAutoScheduleDialogOpen] = useState(false);
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<PresentationSchedule | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<CreateScheduleDto>({
    groupId: '',
    panelId: '',
    date: '',
    timeSlot: '',
    room: '',
    department: 'Computer Science',
    notes: ''
  });
  const [editForm, setEditForm] = useState<UpdateScheduleDto>({});
  const [autoScheduleForm, setAutoScheduleForm] = useState<AutoScheduleDto>({
    date: '',
    room: '',
    department: 'Computer Science',
    panelId: ''
  });
  const [swapSchedule1, setSwapSchedule1] = useState('');
  const [swapSchedule2, setSwapSchedule2] = useState('');

  // Time slots (9AM to 4PM, 30 min intervals)
  const timeSlots = [
    '09:00-09:30', '09:30-10:00', '10:00-10:30', '10:30-11:00',
    '11:00-11:30', '11:30-12:00', '12:00-12:30', '12:30-13:00',
    '13:00-13:30', '13:30-14:00', '14:00-14:30', '14:30-15:00',
    '15:00-15:30', '15:30-16:00'
  ];

  const rooms = [
    'Room 301', 'Room 302', 'Room 303', 'Room 401', 'Room 402',
    'Auditorium A', 'Auditorium B', 'Lab 1', 'Lab 2', 'Conference Hall'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [schedulesData, panelsData, projectsData] = await Promise.all([
        coordinatorApi.getAllSchedules(),
        coordinatorApi.getAllPanels(),
        coordinatorApi.getAllProjects()
      ]);

      setSchedules(schedulesData || []);
      setPanels(panelsData?.filter((p: EvaluationPanel) => p.isActive) || []);
      
      // Extract groups from projects and mark which have schedules
      const scheduledGroupIds = new Set(schedulesData?.map((s: PresentationSchedule) => s.group._id) || []);
      const allGroups = projectsData?.data?.map((p: any) => ({
        ...p.group,
        hasSchedule: scheduledGroupIds.has(p.group._id)
      })) || [];
      setGroups(allGroups);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err?.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async () => {
    try {
      await coordinatorApi.createSchedule(createForm);
      await fetchData();
      setIsCreateDialogOpen(false);
      resetCreateForm();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create schedule');
    }
  };

  const handleUpdateSchedule = async () => {
    if (!selectedSchedule) return;
    try {
      await coordinatorApi.updateSchedule(selectedSchedule._id, editForm);
      await fetchData();
      setIsEditDialogOpen(false);
      setSelectedSchedule(null);
      setEditForm({});
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update schedule');
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule) return;
    try {
      await coordinatorApi.deleteSchedule(selectedSchedule._id);
      await fetchData();
      setIsDeleteDialogOpen(false);
      setSelectedSchedule(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete schedule');
    }
  };

  const handleAutoSchedule = async () => {
    try {
      const result = await coordinatorApi.autoSchedule(autoScheduleForm);
      alert(result.message + `\nScheduled: ${result.totalGroupsScheduled}, Remaining: ${result.remainingGroups}`);
      await fetchData();
      setIsAutoScheduleDialogOpen(false);
      setAutoScheduleForm({
        date: '',
        room: '',
        department: 'Computer Science',
        panelId: ''
      });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to auto-schedule');
    }
  };

  const handleSwapSchedules = async () => {
    if (!swapSchedule1 || !swapSchedule2) {
      alert('Please select both schedules to swap');
      return;
    }
    try {
      await coordinatorApi.swapSchedules({
        scheduleId1: swapSchedule1,
        scheduleId2: swapSchedule2
      });
      await fetchData();
      setIsSwapDialogOpen(false);
      setSwapSchedule1('');
      setSwapSchedule2('');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to swap schedules');
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      groupId: '',
      panelId: '',
      date: '',
      timeSlot: '',
      room: '',
      department: 'Computer Science',
      notes: ''
    });
  };

  const openEditDialog = (schedule: PresentationSchedule) => {
    setSelectedSchedule(schedule);
    setEditForm({
      panelId: schedule.panel._id,
      date: schedule.date.split('T')[0],
      timeSlot: schedule.timeSlot,
      room: schedule.room,
      notes: schedule.notes
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (schedule: PresentationSchedule) => {
    setSelectedSchedule(schedule);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (schedule: PresentationSchedule) => {
    setSelectedSchedule(schedule);
    setIsDeleteDialogOpen(true);
  };

  const getFilteredSchedules = () => {
    let filtered = schedules;

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter(s => s.date.split('T')[0] === selectedDate);
    }

    // View filter
    const today = new Date().toISOString().split('T')[0];
    if (viewFilter === 'today') {
      filtered = filtered.filter(s => s.date.split('T')[0] === today);
    } else if (viewFilter === 'upcoming') {
      filtered = filtered.filter(s => s.date.split('T')[0] >= today);
    } else if (viewFilter === 'past') {
      filtered = filtered.filter(s => s.date.split('T')[0] < today);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.panel.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.timeSlot.localeCompare(b.timeSlot);
    });
  };

  const getStatistics = () => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: schedules.length,
      today: schedules.filter(s => s.date.split('T')[0] === today).length,
      upcoming: schedules.filter(s => s.date.split('T')[0] > today).length,
      unscheduled: groups.filter(g => !g.hasSchedule).length
    };
  };

  const stats = getStatistics();
  const filteredSchedules = getFilteredSchedules();

  if (loading) {
    return (
      <DashboardLayout role="coordinator">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="coordinator">
        <div className="flex flex-col items-center justify-center h-96">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchData}>Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="coordinator">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-indigo-700 border border-indigo-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-xl">
              <CalendarDays className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Demo Scheduling</h1>
              <p className="text-indigo-100 mt-1">Manage presentation schedules and avoid conflicts</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Schedules</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-200 opacity-80" />
            </div>
          </div>
          
          <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Today's Presentations</p>
                <p className="text-3xl font-bold mt-2">{stats.today}</p>
              </div>
              <Clock className="w-12 h-12 text-green-200 opacity-80" />
            </div>
          </div>
          
          <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Upcoming</p>
                <p className="text-3xl font-bold mt-2">{stats.upcoming}</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-purple-200 opacity-80" />
            </div>
          </div>
          
          <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Unscheduled Groups</p>
                <p className="text-3xl font-bold mt-2">{stats.unscheduled}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-200 opacity-80" />
            </div>
          </div>
        </div>

        {/* Actions and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by group, room, or panel..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-auto"
                />
                
                <Select value={viewFilter} onValueChange={(value: any) => setViewFilter(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Schedule
              </Button>
              
              <Button 
                onClick={() => setIsAutoScheduleDialogOpen(true)}
                className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                variant="default"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Auto Schedule
              </Button>
              
              <Button 
                onClick={() => setIsSwapDialogOpen(true)}
                className="flex-1 md:flex-none"
                variant="outline"
              >
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Swap
              </Button>
            </div>
          </div>
        </div>

        {/* Schedules Timeline View */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-6 bg-linear-to-r from-indigo-50 to-purple-50 border-b">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
              Presentation Schedule ({filteredSchedules.length})
            </h2>
          </div>
          
          {filteredSchedules.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No schedules found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredSchedules.map((schedule) => {
                const scheduleDate = new Date(schedule.date);
                const isToday = schedule.date.split('T')[0] === new Date().toISOString().split('T')[0];
                const isPast = new Date(schedule.date) < new Date();
                
                return (
                  <div 
                    key={schedule._id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${isPast ? 'opacity-60' : ''}`}
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Date & Time Section */}
                      <div className="lg:w-48 shrink-0">
                        <div className={`inline-flex flex-col items-center justify-center p-4 rounded-xl ${
                          isToday 
                            ? 'bg-linear-to-br from-green-500 to-green-600 text-white' 
                            : 'bg-linear-to-br from-indigo-500 to-indigo-600 text-white'
                        }`}>
                          <Calendar className="w-6 h-6 mb-2" />
                          <p className="text-2xl font-bold">
                            {scheduleDate.getDate()}
                          </p>
                          <p className="text-sm opacity-90">
                            {scheduleDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                          <Separator className="my-2 bg-white/20" />
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <p className="text-sm font-medium">{schedule.timeSlot}</p>
                          </div>
                        </div>
                      </div>

                      {/* Details Section */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600" />
                                {schedule.group.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                <span className="font-medium">Leader:</span>
                                <span>{schedule.group.leader.firstName} {schedule.group.leader.lastName}</span>
                                <Badge variant="outline" className="ml-2">
                                  {schedule.group.leader.rollNumber}
                                </Badge>
                              </div>
                            </div>
                            {isToday && (
                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                Today
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                              <GraduationCap className="w-5 h-5 text-purple-600" />
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Evaluation Panel</p>
                                <p className="text-sm font-semibold text-gray-800">{schedule.panel.name}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {schedule.panel.members.length} member(s)
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                              <MapPin className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="text-xs text-gray-500 font-medium">Location</p>
                                <p className="text-sm font-semibold text-gray-800">{schedule.room}</p>
                                <p className="text-xs text-gray-600 mt-1">{schedule.department}</p>
                              </div>
                            </div>
                          </div>

                          {schedule.notes && (
                            <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Note:</span> {schedule.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Group Members */}
                        <div className="flex flex-wrap gap-2">
                          {schedule.group.members.map((member) => (
                            <Badge key={member._id} variant="secondary" className="px-3 py-1">
                              {member.firstName} {member.lastName} ({member.rollNumber})
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="lg:w-32 flex lg:flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openViewDialog(schedule)}
                          className="flex-1 lg:flex-none"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(schedule)}
                          className="flex-1 lg:flex-none"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteDialog(schedule)}
                          className="flex-1 lg:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Schedule Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Presentation Schedule</DialogTitle>
              <DialogDescription>Schedule a presentation for a group</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Group</Label>
                <Select value={createForm.groupId} onValueChange={(value) => setCreateForm({...createForm, groupId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.filter(g => !g.hasSchedule).map((group) => (
                      <SelectItem key={group._id} value={group._id}>
                        {group.name} - Leader: {group.leader.firstName} {group.leader.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Evaluation Panel</Label>
                <Select value={createForm.panelId} onValueChange={(value) => setCreateForm({...createForm, panelId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select panel" />
                  </SelectTrigger>
                  <SelectContent>
                    {panels.map((panel) => (
                      <SelectItem key={panel._id} value={panel._id}>
                        {panel.name} ({panel.members.length} members)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={createForm.date}
                    onChange={(e) => setCreateForm({...createForm, date: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Time Slot</Label>
                  <Select value={createForm.timeSlot} onValueChange={(value) => setCreateForm({...createForm, timeSlot: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Room</Label>
                <Select value={createForm.room} onValueChange={(value) => setCreateForm({...createForm, room: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room} value={room}>{room}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({...createForm, notes: e.target.value})}
                  placeholder="Any additional notes..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateSchedule}>Create Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Schedule Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule Details</DialogTitle>
            </DialogHeader>
            
            {selectedSchedule && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Group</Label>
                    <p className="font-semibold">{selectedSchedule.group.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Leader</Label>
                    <p className="font-semibold">
                      {selectedSchedule.group.leader.firstName} {selectedSchedule.group.leader.lastName}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-500">Members</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSchedule.group.members.map((member) => (
                      <Badge key={member._id} variant="secondary">
                        {member.firstName} {member.lastName} ({member.rollNumber})
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Date</Label>
                    <p className="font-semibold break-words">
                      {new Date(selectedSchedule.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Time</Label>
                    <p className="font-semibold">{selectedSchedule.timeSlot}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Room</Label>
                    <p className="font-semibold">{selectedSchedule.room}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Department</Label>
                    <p className="font-semibold">{selectedSchedule.department}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-gray-500">Evaluation Panel</Label>
                  <p className="font-semibold mb-2">{selectedSchedule.panel.name}</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedSchedule.panel.members.map((member) => (
                      <div key={member._id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="text-sm">{member.firstName} {member.lastName}</span>
                        </div>
                        <Badge variant="outline" className="sm:ml-auto text-xs">{member.designation}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedSchedule.notes && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-gray-500">Notes</Label>
                      <p className="text-sm mt-1">{selectedSchedule.notes}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Schedule Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Schedule</DialogTitle>
              <DialogDescription>Update schedule details</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Evaluation Panel</Label>
                <Select 
                  value={editForm.panelId} 
                  onValueChange={(value) => setEditForm({...editForm, panelId: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {panels.map((panel) => (
                      <SelectItem key={panel._id} value={panel._id}>
                        {panel.name} ({panel.members.length} members)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Time Slot</Label>
                  <Select 
                    value={editForm.timeSlot} 
                    onValueChange={(value) => setEditForm({...editForm, timeSlot: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Room</Label>
                <Select 
                  value={editForm.room} 
                  onValueChange={(value) => setEditForm({...editForm, room: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room} value={room}>{room}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateSchedule}>Update Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Auto Schedule Dialog */}
        <Dialog open={isAutoScheduleDialogOpen} onOpenChange={setIsAutoScheduleDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Auto Schedule Groups</DialogTitle>
              <DialogDescription>
                Automatically schedule all unscheduled groups with 30-minute slots from 9AM to 4PM
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={autoScheduleForm.date}
                  onChange={(e) => setAutoScheduleForm({...autoScheduleForm, date: e.target.value})}
                />
              </div>

              <div>
                <Label>Room</Label>
                <Select 
                  value={autoScheduleForm.room} 
                  onValueChange={(value) => setAutoScheduleForm({...autoScheduleForm, room: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room} value={room}>{room}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Evaluation Panel</Label>
                <Select 
                  value={autoScheduleForm.panelId} 
                  onValueChange={(value) => setAutoScheduleForm({...autoScheduleForm, panelId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select panel" />
                  </SelectTrigger>
                  <SelectContent>
                    {panels.map((panel) => (
                      <SelectItem key={panel._id} value={panel._id}>
                        {panel.name} ({panel.members.length} members)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>{stats.unscheduled}</strong> unscheduled group(s) will be assigned to available time slots.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAutoScheduleDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAutoSchedule} className="bg-green-600 hover:bg-green-700">
                <Wand2 className="w-4 h-4 mr-2" />
                Auto Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Swap Schedules Dialog */}
        <Dialog open={isSwapDialogOpen} onOpenChange={setIsSwapDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Swap Schedules</DialogTitle>
              <DialogDescription>Swap presentation slots between two groups</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>First Schedule</Label>
                <Select value={swapSchedule1} onValueChange={setSwapSchedule1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select first schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {schedules.map((schedule) => (
                      <SelectItem key={schedule._id} value={schedule._id}>
                        {schedule.group.name} - {new Date(schedule.date).toLocaleDateString()} {schedule.timeSlot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center">
                <ArrowLeftRight className="w-6 h-6 text-gray-400" />
              </div>

              <div>
                <Label>Second Schedule</Label>
                <Select value={swapSchedule2} onValueChange={setSwapSchedule2}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select second schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {schedules.filter(s => s._id !== swapSchedule1).map((schedule) => (
                      <SelectItem key={schedule._id} value={schedule._id}>
                        {schedule.group.name} - {new Date(schedule.date).toLocaleDateString()} {schedule.timeSlot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSwapDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSwapSchedules}>Swap Schedules</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Delete Schedule</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this schedule? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {selectedSchedule && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-semibold text-gray-800">{selectedSchedule.group.name}</p>
                <p className="text-sm text-gray-600">
                  {new Date(selectedSchedule.date).toLocaleDateString()} at {selectedSchedule.timeSlot}
                </p>
                <p className="text-sm text-gray-600">{selectedSchedule.room}</p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteSchedule}>Delete Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DemoSchedulingPage;
