"use client";

import React, { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuthContext } from "@/lib/contexts/AuthContext";
import apiClient from "@/lib/api/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Users,
  Search,
  Eye,
  Edit,
  UserCheck,
  UserX,
  Loader2,
  MoreVertical,
  ShieldCheck,
  ShieldOff,
  Users2,
  ArrowLeftRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

interface Member {
  _id: string;
  name: string;
  email: string;
  rollNumber: string;
}

interface Supervisor {
  _id: string;
  name: string;
  email: string;
  maxCapacity?: number;
  assignedGroups?: number;
}

interface Group {
  _id: string;
  name: string;
  leader: Member;
  members: Member[];
  department: string;
  assignedSupervisor?: Supervisor;
  project?: {
    _id: string;
    title: string;
    description: string;
    technologies: string[];
    githubRepositoryUrl?: string;
    totalMarks?: number;
  };
}

export default function GroupManagementPage() {
  const { user, loading: authLoading } = useAuthContext();

  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [groupsWithoutSupervisor, setGroupsWithoutSupervisor] = useState<Group[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingSupervisors, setLoadingSupervisors] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [viewGroupOpen, setViewGroupOpen] = useState(false);
  const [assignSupervisorOpen, setAssignSupervisorOpen] = useState(false);
  const [changeSupervisorOpen, setChangeSupervisorOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      fetchGroups();
      fetchSupervisors();
    }
  }, [authLoading, user]);

  useEffect(() => {
    let currentGroups = activeTab === "all" ? groups : groupsWithoutSupervisor;
    if (searchQuery) {
      currentGroups = currentGroups.filter(
        (group) =>
          group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.leader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.members.some(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    setFilteredGroups(currentGroups);
  }, [searchQuery, activeTab, groups, groupsWithoutSupervisor]);

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const [allGroupsRes, unassignedGroupsRes] = await Promise.all([
        apiClient.get(`${API_BASE_URL}/coordinator/groups`),
        apiClient.get(`${API_BASE_URL}/coordinator/groups/without-supervisor`),
      ]);

      const mapGroupData = (data: any): Group[] => {
        if (!Array.isArray(data)) {
          console.error("Expected data to be an array but got:", data);
          return [];
        }
        return data.map((g: any) => ({
          _id: g._id,
          name: g.name,
          leader: {
            _id: g.leader?._id,
            name: g.leader?.fullName || `${g.leader?.firstName || ''} ${g.leader?.lastName || ''}`.trim(),
            email: g.leader?.email,
            rollNumber: g.leader?.rollNumber,
          },
          members: g.members?.map((m: any) => ({
            _id: m._id,
            name: m.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim(),
            email: m.email,
            rollNumber: m.rollNumber,
          })) || [],
          department: g.department,
          assignedSupervisor: g.assignedSupervisor ? {
            _id: g.assignedSupervisor._id,
            name: g.assignedSupervisor.fullName || `${g.assignedSupervisor.firstName || ''} ${g.assignedSupervisor.lastName || ''}`.trim(),
            email: g.assignedSupervisor.email,
          } : undefined,
          project: g.project ? { 
            _id: g.project._id,
            title: g.project.selectedIdea?.title || 'No Title',
            description: g.project.selectedIdea?.description || '',
            technologies: g.project.selectedIdea?.technologies || [],
            githubRepositoryUrl: g.project.githubRepositoryUrl,
            totalMarks: g.project.totalMarks,
          } : undefined,
        }));
      };

      setGroups(mapGroupData(allGroupsRes.data?.data || []));
      setGroupsWithoutSupervisor(mapGroupData(unassignedGroupsRes.data?.data?.groups || []));
      setFilteredGroups(mapGroupData(allGroupsRes.data?.data || []));
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      setLoadingSupervisors(true);
      const response = await apiClient.get(`${API_BASE_URL}/users`, {
        params: { role: 'supervisor', limit: 100 },
      });
      const supervisorsData = response.data?.data?.users || [];
      setSupervisors(supervisorsData.map((s: any) => ({
        _id: s._id,
        name: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
        email: s.email,
        maxCapacity: s.maxStudents,
        assignedGroups: s.currentStudentCount,
      })));
    } catch (error) {
      console.error("Error fetching supervisors:", error);
    } finally {
      setLoadingSupervisors(false);
    }
  };

  const handleAssignSupervisor = async () => {
    if (!selectedGroup || !selectedSupervisor) return;
    try {
      await apiClient.put(
        `${API_BASE_URL}/coordinator/groups/${selectedGroup._id}/assign-supervisor/${selectedSupervisor}`
      );
      setAssignSupervisorOpen(false);
      await fetchGroups(); // Re-fetch to get updated data
      toast.success("Supervisor assigned successfully!");
    } catch (error: any) {
      console.error("Error assigning supervisor:", error);
      toast.error(error.response?.data?.message || "Failed to assign supervisor.");
    }
  };

  const handleChangeSupervisor = async () => {
    if (!selectedGroup || !selectedSupervisor) return;
    try {
      await apiClient.put(
        `${API_BASE_URL}/coordinator/groups/${selectedGroup._id}/change-supervisor/${selectedSupervisor}`
      );
      setChangeSupervisorOpen(false);
      await fetchGroups(); // Re-fetch to get updated data
      toast.success("Supervisor changed successfully!");
    } catch (error: any) {
      console.error("Error changing supervisor:", error);
      toast.error(error.response?.data?.message || "Failed to change supervisor.");
    }
  };

  const stats = {
    total: groups.length,
    assigned: groups.filter(g => g.assignedSupervisor).length,
    unassigned: groupsWithoutSupervisor.length,
  };

  if (authLoading) {
    return (
      <DashboardLayout role="coordinator">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-700" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="coordinator">
      <div className="space-y-6 pb-8">
        <div className="bg-indigo-700 border border-indigo-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-xl">
              <Users2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Group Management</h1>
              <p className="text-indigo-100 mt-1">
                Oversee group formation and supervisor allocation.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="border-indigo-300 bg-white shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-indigo-600 uppercase">Total Groups</p>
                <p className="text-4xl font-bold text-indigo-900">{stats.total}</p>
              </div>
              <div className="bg-indigo-100 p-4 rounded-xl">
                <Users className="h-8 w-8 text-indigo-700" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-300 bg-white shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-600 uppercase">Assigned</p>
                <p className="text-4xl font-bold text-emerald-900">{stats.assigned}</p>
              </div>
              <div className="bg-emerald-100 p-4 rounded-xl">
                <ShieldCheck className="h-8 w-8 text-emerald-700" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-300 bg-white shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-600 uppercase">Unassigned</p>
                <p className="text-4xl font-bold text-amber-900">{stats.unassigned}</p>
              </div>
              <div className="bg-amber-100 p-4 rounded-xl">
                <ShieldOff className="h-8 w-8 text-amber-700" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="bg-indigo-100 p-1 border border-indigo-300">
              <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">All Groups</TabsTrigger>
              <TabsTrigger value="unassigned" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Unassigned</TabsTrigger>
            </TabsList>
            <div className="w-full max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search groups or members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>

          <TabsContent value="all">
            <GroupTable loading={loadingGroups} groups={filteredGroups} setViewGroupOpen={setViewGroupOpen} setSelectedGroup={setSelectedGroup} setAssignSupervisorOpen={setAssignSupervisorOpen} setChangeSupervisorOpen={setChangeSupervisorOpen} />
          </TabsContent>
          <TabsContent value="unassigned">
            <GroupTable loading={loadingGroups} groups={filteredGroups} setViewGroupOpen={setViewGroupOpen} setSelectedGroup={setSelectedGroup} setAssignSupervisorOpen={setAssignSupervisorOpen} setChangeSupervisorOpen={setChangeSupervisorOpen} />
          </TabsContent>
        </Tabs>

        <Dialog open={viewGroupOpen} onOpenChange={setViewGroupOpen}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-indigo-900">{selectedGroup?.name}</DialogTitle>
              <DialogDescription>Department of {selectedGroup?.department}</DialogDescription>
            </DialogHeader>
            {selectedGroup && (
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Leader</h3>
                  <p className="text-slate-600">{selectedGroup.leader.name} ({selectedGroup.leader.rollNumber})</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Members</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {selectedGroup.members.map(m => <li key={m._id}>{m.name} ({m.rollNumber})</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Supervisor</h3>
                  <p className="text-slate-600">{selectedGroup.assignedSupervisor?.name || 'Not Assigned'}</p>
                </div>
                {selectedGroup.project && (
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-2">Project Details</h3>
                    <p className="text-slate-700 font-medium">{selectedGroup.project.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{selectedGroup.project.description}</p>
                    <div className="mt-2">
                      {selectedGroup.project.technologies.map(tech => (
                        <Badge key={tech} variant="secondary" className="mr-1 mb-1">{tech}</Badge>
                      ))}
                    </div>
                    {selectedGroup.project.githubRepositoryUrl && (
                        <p className="text-sm text-slate-600 mt-1">
                            <a href={selectedGroup.project.githubRepositoryUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                                View Repository
                            </a>
                        </p>
                    )}
                    {selectedGroup.project.totalMarks !== undefined && (
                        <p className="text-sm text-slate-600 mt-1">
                            Total Marks: {selectedGroup.project.totalMarks}
                        </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={assignSupervisorOpen || changeSupervisorOpen} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setAssignSupervisorOpen(false);
            setChangeSupervisorOpen(false);
          }
        }}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                {assignSupervisorOpen ? "Assign Supervisor" : "Change Supervisor"}
              </DialogTitle>
              <DialogDescription>
                Select a supervisor for '{selectedGroup?.name}'.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Label htmlFor="supervisor-select">Available Supervisors</Label>
              <Select onValueChange={setSelectedSupervisor}>
                <SelectTrigger id="supervisor-select" className="border-slate-300">
                  <SelectValue placeholder="Select a supervisor" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {loadingSupervisors ? (
                    <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
                  ) : (
                    supervisors.map(s => (
                      <SelectItem key={s._id} value={s._id}>
                        <div className="flex justify-between items-center">
                          <span>{s.name}</span>
                          <span className="text-xs text-slate-500 ml-4">
                            {s.assignedGroups || 0} / {s.maxCapacity || 'N/A'}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAssignSupervisorOpen(false); setChangeSupervisorOpen(false); }}>Cancel</Button>
              <Button onClick={assignSupervisorOpen ? handleAssignSupervisor : handleChangeSupervisor}>
                {assignSupervisorOpen ? "Assign" : "Change"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

interface GroupTableProps {
  loading: boolean;
  groups: Group[];
  setViewGroupOpen: (open: boolean) => void;
  setSelectedGroup: (group: Group) => void;
  setAssignSupervisorOpen: (open: boolean) => void;
  setChangeSupervisorOpen: (open: boolean) => void;
}

const GroupTable = ({ loading, groups, setViewGroupOpen, setSelectedGroup, setAssignSupervisorOpen, setChangeSupervisorOpen }: GroupTableProps) => {
  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-indigo-700" /></div>;
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600 font-medium">No groups found.</p>
      </div>
    );
  }

  return (
    <Card className="border-slate-300 bg-white shadow-md">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Group</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Members</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase">Supervisor</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groups.map((group) => {
                // Create a unique list of all members (leader + members)
                const allMembers = [group.leader, ...group.members];
                const uniqueMembers = Array.from(new Map(allMembers.map(m => [m._id, m])).values());
                
                const memberNames = uniqueMembers.map(m => m.name);
                const displayNames = memberNames.slice(0, 3).join(', ');
                const remainingCount = memberNames.length - 3;

                return (
                  <tr key={group._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 align-top">
                      <p className="font-semibold text-slate-900">{group.name}</p>
                      <p className="text-xs text-slate-600">{group.department}</p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <p className="text-sm text-slate-800">
                        {displayNames}
                        {remainingCount > 0 && (
                          <span className="text-slate-500">, and {remainingCount} more</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Leader: {group.leader.name}
                      </p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      {group.assignedSupervisor ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          <UserCheck className="h-3 w-3 mr-1" />
                          {group.assignedSupervisor.name}
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          <UserX className="h-3 w-3 mr-1" />
                          Unassigned
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center align-top">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white">
                        <DropdownMenuItem onClick={() => { setSelectedGroup(group); setViewGroupOpen(true); }}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        
                        {group.assignedSupervisor ? (
                          <DropdownMenuItem 
                            onClick={() => { setSelectedGroup(group); setChangeSupervisorOpen(true); }}
                          >
                            <ArrowLeftRight className="h-4 w-4 mr-2" /> Change Supervisor
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => { setSelectedGroup(group); setAssignSupervisorOpen(true); }}
                          >
                            <UserCheck className="h-4 w-4 mr-2" /> Assign Supervisor
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
