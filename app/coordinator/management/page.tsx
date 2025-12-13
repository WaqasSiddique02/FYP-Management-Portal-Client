"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuthContext } from "@/lib/contexts/AuthContext";
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
  DialogTrigger,
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
  UserPlus,
  Search,
  Eye,
  Edit,
  Trash2,
  ArrowLeftRight,
  Briefcase,
  Mail,
  Phone,
  Building2,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MoreVertical,
  Plus,
  TrendingUp,
  GraduationCap,
  BookOpen,
  Calendar,
  Activity,
  BarChart3,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import apiClient from "@/lib/api/axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  totalFaculty?: number;
  totalStudents?: number;
  availableSupervisors?: number;
  createdAt?: string;
}

interface Faculty {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  specialization?: string;
  assignedGroups?: number;
  maxCapacity?: number;
  isAvailable?: boolean;
  createdAt?: string;
  employeeId?: string;
  designation?: string;
  officeLocation?: string;
  officeHours?: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  rollNumber?: string;
  department?: string;
  semester?: number;
  cgpa?: number;
  groupName?: string;
  supervisor?: string;
  createdAt?: string;
}

interface UserSummary {
  totalUsers: number;
  totalStudents: number;
  totalSupervisors: number;
  activeUsers: number;
}

export default function ManagementPage() {
  const { user, loading: authLoading } = useAuthContext();

  // Department States
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [departmentSearchQuery, setDepartmentSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [addDepartmentOpen, setAddDepartmentOpen] = useState(false);
  const [editDepartmentOpen, setEditDepartmentOpen] = useState(false);
  const [deleteDepartmentOpen, setDeleteDepartmentOpen] = useState(false);
  const [viewDepartmentOpen, setViewDepartmentOpen] = useState(false);

  // Faculty States
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [filteredFaculties, setFilteredFaculties] = useState<Faculty[]>([]);
  const [facultySearchQuery, setFacultySearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [addFacultyOpen, setAddFacultyOpen] = useState(false);
  const [viewFacultyOpen, setViewFacultyOpen] = useState(false);
  const [transferFacultyOpen, setTransferFacultyOpen] = useState(false);
  const [removeFacultyOpen, setRemoveFacultyOpen] = useState(false);

  // Loading States
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingFaculties, setLoadingFaculties] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingUserSummary, setLoadingUserSummary] = useState(true);

  // Users & Students States
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [filterStudentDepartment, setFilterStudentDepartment] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewStudentOpen, setViewStudentOpen] = useState(false);
  const [deleteStudentOpen, setDeleteStudentOpen] = useState(false);
  const [userSummary, setUserSummary] = useState<UserSummary | null>(null);

  // Form States
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    code: "",
    description: "",
  });

  const [newFaculty, setNewFaculty] = useState({
    supervisorId: "",
    departmentId: "",
  });

  const [transferData, setTransferData] = useState({
    fromDepartmentId: "",
    toDepartmentId: "",
    supervisorId: "",
  });

  // Fetch Departments
  useEffect(() => {
    if (!authLoading && user) {
      fetchDepartments();
    }
  }, [authLoading, user]);

  // Fetch Faculties
  useEffect(() => {
    if (!authLoading && user) {
      fetchAllFaculties();
    }
  }, [authLoading, user]);

  // Fetch User Summary
  useEffect(() => {
    if (!authLoading && user) {
      fetchUserSummary();
    }
  }, [authLoading, user]);

  // Fetch Students
  useEffect(() => {
    if (!authLoading && user) {
      fetchAllStudents();
    }
  }, [authLoading, user]);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await apiClient.get(`${API_BASE_URL}/departments`);
      
      console.log('Raw departments response:', response.data);
      
      // Backend returns: { statusCode, message, data: [...] }
      let data = response.data?.data || [];
      
      console.log('Extracted departments data:', data);
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.warn('Departments data is not an array:', data);
        data = [];
      }
      
      // Map to ensure consistent field names
      const mappedDepartments = data.map((dept: any) => ({
        _id: dept._id || dept.id,
        name: dept.name || '',
        code: dept.code || '',
        description: dept.description || '',
        totalFaculty: dept.totalFaculty || dept.facultyList?.length || 0,
        totalStudents: dept.totalStudents || 0,
        availableSupervisors: dept.availableSupervisors || 0,
        createdAt: dept.createdAt || '',
      }));
      
      console.log('Mapped departments:', mappedDepartments);
      
      setDepartments(mappedDepartments);
      setFilteredDepartments(mappedDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
      setFilteredDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchAllFaculties = async () => {
    try {
      setLoadingFaculties(true);
      // Fetch all departments and their faculty
      const deptResponse = await apiClient.get(`${API_BASE_URL}/departments`);
      // Backend returns: { statusCode, message, data: [...] }
      const departmentsData = deptResponse.data?.data || [];
      
      const allFaculty: Faculty[] = [];
      for (const dept of departmentsData) {
        try {
          const facultyResponse = await apiClient.get(
            `${API_BASE_URL}/departments/${dept._id}/faculty`
          );
          
          // Backend returns: { statusCode, message, data: { faculty: [...] } }
          let facultyList = facultyResponse.data?.data?.faculty || [];
          
          // Ensure facultyList is an array
          if (!Array.isArray(facultyList)) {
            console.warn(`Faculty data for ${dept.name} is not an array:`, facultyList);
            facultyList = [];
          }
          
          // Map faculty with department name based on actual backend structure
          const mappedFaculty = facultyList.map((f: any) => ({
            _id: f._id || f.id,
            name: f.fullName || `${f.firstName || ''} ${f.lastName || ''}`.trim() || 'Unknown',
            email: f.email || 'N/A',
            phone: f.phoneNumber || f.phone || '',
            department: dept.name,
            specialization: f.specialization || '',
            assignedGroups: f.assignedGroups?.length || f.currentStudentCount || 0,
            maxCapacity: f.maxStudents || 12,
            isAvailable: f.isAvailableForSupervision !== undefined ? f.isAvailableForSupervision : true,
            createdAt: f.createdAt || '',
            employeeId: f.employeeId || '',
            designation: f.designation || '',
            officeLocation: f.officeLocation || '',
            officeHours: f.officeHours || '',
          }));
          
          allFaculty.push(...mappedFaculty);
        } catch (err) {
          console.error(`Error fetching faculty for ${dept.name}:`, err);
        }
      }
      
      console.log('All faculty members:', allFaculty);
      
      setFaculties(allFaculty);
      setFilteredFaculties(allFaculty);
    } catch (error) {
      console.error("Error fetching faculties:", error);
      setFaculties([]);
      setFilteredFaculties([]);
    } finally {
      setLoadingFaculties(false);
    }
  };

  // Fetch User Summary
  const fetchUserSummary = async () => {
    try {
      setLoadingUserSummary(true);
      const response = await apiClient.get(`${API_BASE_URL}/users/summary`);
      const data = response.data?.data || response.data;
      
      // Map backend structure to frontend structure
      const studentCount = data.students?.total || 0;
      const supervisorCount = data.supervisors?.total || 0;
      
      const summary: UserSummary = {
        totalUsers: studentCount + supervisorCount,
        totalStudents: studentCount,
        totalSupervisors: supervisorCount,
        activeUsers: studentCount + supervisorCount,
      };
      
      setUserSummary(summary);
    } catch (error) {
      console.error("Error fetching user summary:", error);
      setUserSummary(null);
    } finally {
      setLoadingUserSummary(false);
    }
  };

  // Fetch All Students
  const fetchAllStudents = async () => {
    try {
      setLoadingStudents(true);
      
      // Fetch both students and groups in parallel
      const [studentsResponse, groupsResponse] = await Promise.all([
        apiClient.get(`${API_BASE_URL}/users`, { params: { role: 'student' } }),
        apiClient.get(`${API_BASE_URL}/coordinator/groups`).catch(() => ({ data: [] }))
      ]);
      
      // Extract students data
      const studentsData = studentsResponse.data?.data || studentsResponse.data;
      const usersArray = studentsData?.users || studentsData || [];
      
      // Extract groups data - backend returns array directly
      const groupsArray = Array.isArray(groupsResponse.data) ? groupsResponse.data : [];
      
      // Create a map of student ID to their group and supervisor
      const studentGroupMap = new Map();
      
      groupsArray.forEach((group: any) => {
        const groupName = group.name || 'Unknown Group';
        const supervisor = group.assignedSupervisor 
          ? `${group.assignedSupervisor.firstName || ''} ${group.assignedSupervisor.lastName || ''}`.trim() || 'Supervisor'
          : 'Not Assigned';
        
        // Add leader to map
        if (group.leader && group.leader._id) {
          studentGroupMap.set(group.leader._id, { groupName, supervisor });
        }
        
        // Add all members to map
        if (Array.isArray(group.members)) {
          group.members.forEach((member: any) => {
            if (member && member._id) {
              studentGroupMap.set(member._id, { groupName, supervisor });
            }
          });
        }
      });
      
      // Map students with their group and supervisor info
      const mappedStudents = Array.isArray(usersArray) ? usersArray.map((s: any) => {
        const studentId = s._id || s.id;
        const groupInfo = studentGroupMap.get(studentId);
        
        // Use assignedSupervisor from student if available, otherwise use group supervisor
        let supervisor = 'Not Assigned';
        if (s.assignedSupervisor && s.assignedSupervisor._id) {
          supervisor = `${s.assignedSupervisor.firstName || ''} ${s.assignedSupervisor.lastName || ''}`.trim() || 'Supervisor';
        } else if (groupInfo?.supervisor && groupInfo.supervisor !== 'Not Assigned') {
          supervisor = groupInfo.supervisor;
        }
        
        return {
          _id: studentId,
          name: s.fullName || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown',
          email: s.email || 'N/A',
          phone: s.phoneNumber || s.phone || '',
          rollNumber: s.rollNumber || 'N/A',
          department: s.department || 'N/A',
          semester: parseInt(s.semester) || 0,
          cgpa: parseFloat(s.cgpa) || 0,
          groupName: groupInfo?.groupName || 'No Group',
          supervisor: supervisor,
          createdAt: s.createdAt || '',
        };
      }) : [];
      
      setStudents(mappedStudents);
      setFilteredStudents(mappedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Filter Departments
  useEffect(() => {
    let filtered = departments;
    if (departmentSearchQuery) {
      filtered = filtered.filter(
        (dept) =>
          dept.name.toLowerCase().includes(departmentSearchQuery.toLowerCase()) ||
          dept.code.toLowerCase().includes(departmentSearchQuery.toLowerCase())
      );
    }
    setFilteredDepartments(filtered);
  }, [departmentSearchQuery, departments]);

  // Filter Faculties
  useEffect(() => {
    let filtered = faculties;

    if (facultySearchQuery) {
      filtered = filtered.filter(
        (faculty) =>
          faculty.name?.toLowerCase().includes(facultySearchQuery.toLowerCase()) ||
          faculty.email?.toLowerCase().includes(facultySearchQuery.toLowerCase()) ||
          faculty.department?.toLowerCase().includes(facultySearchQuery.toLowerCase())
      );
    }

    if (filterDepartment !== "all") {
      filtered = filtered.filter((faculty) => faculty.department === filterDepartment);
    }

    if (filterAvailability !== "all") {
      const isAvailable = filterAvailability === "available";
      filtered = filtered.filter((faculty) => faculty.isAvailable === isAvailable);
    }

    setFilteredFaculties(filtered);
  }, [facultySearchQuery, filterDepartment, filterAvailability, faculties]);

  // Filter Students
  useEffect(() => {
    let filtered = students;

    if (studentSearchQuery) {
      filtered = filtered.filter(
        (student) =>
          student.name?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
          student.email?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
          student.rollNumber?.toLowerCase().includes(studentSearchQuery.toLowerCase())
      );
    }

    if (filterStudentDepartment !== "all") {
      filtered = filtered.filter((student) => student.department === filterStudentDepartment);
    }

    setFilteredStudents(filtered);
  }, [studentSearchQuery, filterStudentDepartment, students]);

  // Department CRUD Operations
  const handleAddDepartment = async () => {
    try {
      const response = await apiClient.post(`${API_BASE_URL}/departments`, newDepartment);
      console.log('Department added successfully:', response.data);
      setAddDepartmentOpen(false);
      setNewDepartment({ name: "", code: "", description: "" });
      await fetchDepartments();
      alert('Department added successfully!');
    } catch (error: any) {
      console.error("Error adding department:", error);
      alert(error.response?.data?.message || 'Failed to add department');
    }
  };

  const handleUpdateDepartment = async () => {
    if (!selectedDepartment) return;
    try {
      const response = await apiClient.put(
        `${API_BASE_URL}/departments/${selectedDepartment._id}`, 
        {
          name: selectedDepartment.name,
          code: selectedDepartment.code,
          description: selectedDepartment.description,
        }
      );
      console.log('Department updated successfully:', response.data);
      setEditDepartmentOpen(false);
      await fetchDepartments();
      alert('Department updated successfully!');
    } catch (error: any) {
      console.error("Error updating department:", error);
      alert(error.response?.data?.message || 'Failed to update department');
    }
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;
    try {
      const response = await apiClient.delete(
        `${API_BASE_URL}/departments/${selectedDepartment._id}`
      );
      console.log('Department deleted successfully:', response.data);
      setDeleteDepartmentOpen(false);
      await fetchDepartments();
      alert('Department deleted successfully!');
    } catch (error: any) {
      console.error("Error deleting department:", error);
      alert(error.response?.data?.message || 'Failed to delete department. Department must be empty.');
    }
  };

  // Faculty Operations
  const handleAddFaculty = async () => {
    try {
      const response = await apiClient.post(
        `${API_BASE_URL}/departments/${newFaculty.departmentId}/faculty`,
        { supervisorId: newFaculty.supervisorId }
      );
      console.log('Faculty added successfully:', response.data);
      setAddFacultyOpen(false);
      setNewFaculty({ supervisorId: "", departmentId: "" });
      await fetchAllFaculties();
      alert('Faculty added successfully!');
    } catch (error: any) {
      console.error("Error adding faculty:", error);
      alert(error.response?.data?.message || 'Failed to add faculty');
    }
  };

  const handleTransferFaculty = async () => {
    try {
      const response = await apiClient.patch(`${API_BASE_URL}/faculty/transfer`, transferData);
      console.log('Faculty transferred successfully:', response.data);
      setTransferFacultyOpen(false);
      await fetchAllFaculties();
      alert('Faculty transferred successfully!');
    } catch (error: any) {
      console.error("Error transferring faculty:", error);
      alert(error.response?.data?.message || 'Failed to transfer faculty');
    }
  };

  const handleRemoveFaculty = async () => {
    if (!selectedFaculty) return;
    try {
      const dept = departments.find((d) => d.name === selectedFaculty.department);
      if (dept) {
        const response = await apiClient.delete(
          `${API_BASE_URL}/departments/${dept._id}/faculty/${selectedFaculty._id}`
        );
        console.log('Faculty removed successfully:', response.data);
        setRemoveFacultyOpen(false);
        await fetchAllFaculties();
        alert('Faculty removed successfully!');
      }
    } catch (error: any) {
      console.error("Error removing faculty:", error);
      alert(error.response?.data?.message || 'Failed to remove faculty');
    }
  };

  // Student Operations
  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    try {
      await apiClient.delete(`${API_BASE_URL}/users/${selectedStudent._id}?role=student`);
      setDeleteStudentOpen(false);
      await fetchAllStudents();
      alert('Student deleted successfully!');
    } catch (error: any) {
      console.error("Error deleting student:", error);
      alert(error.response?.data?.message || 'Failed to delete student');
    }
  };

  const departmentStats = {
    total: departments.length,
    withFaculty: departments.filter((d) => (d.totalFaculty || 0) > 0).length,
    withStudents: departments.filter((d) => (d.totalStudents || 0) > 0).length,
  };

  const facultyStats = {
    total: faculties.length,
    available: faculties.filter((f) => f.isAvailable).length,
    unavailable: faculties.filter((f) => !f.isAvailable).length,
  };

  const studentStats = {
    total: students.length,
    withGroup: students.filter((s) => s.groupName !== 'No Group').length,
    withoutGroup: students.filter((s) => s.groupName === 'No Group').length,
    withSupervisor: students.filter((s) => s.supervisor !== 'Not Assigned').length,
  };

  if (authLoading) {
    return (
      <DashboardLayout role="coordinator">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-slate-700 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="coordinator">
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="bg-indigo-700 border border-indigo-600 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-xl">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                System Management
              </h1>
              <p className="text-indigo-100 mt-1">
                Manage departments, faculty, students, and system users
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="departments" className="space-y-6">
          <TabsList className="bg-indigo-100 p-1 border border-indigo-300">
            <TabsTrigger
              value="departments"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Departments
            </TabsTrigger>
            <TabsTrigger
              value="faculty"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Faculty
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Users & Analytics
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Students
            </TabsTrigger>
          </TabsList>

          {/* DEPARTMENTS TAB */}
          <TabsContent value="departments" className="space-y-6">
            {/* Department Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="border-indigo-300 bg-white shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2">
                        Total Departments
                      </p>
                      <p className="text-4xl font-bold text-indigo-900">
                        {departmentStats.total}
                      </p>
                    </div>
                    <div className="bg-indigo-100 p-4 rounded-xl">
                      <Building2 className="h-8 w-8 text-indigo-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-300 bg-white shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">
                        With Faculty
                      </p>
                      <p className="text-4xl font-bold text-purple-900">
                        {departmentStats.withFaculty}
                      </p>
                    </div>
                    <div className="bg-purple-100 p-4 rounded-xl">
                      <UserCheck className="h-8 w-8 text-purple-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-300 bg-white shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                        With Students
                      </p>
                      <p className="text-4xl font-bold text-blue-900">
                        {departmentStats.withStudents}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-xl">
                      <TrendingUp className="h-8 w-8 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department Search and Actions */}
            <Card className="border-slate-300 bg-white shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Search departments..."
                        value={departmentSearchQuery}
                        onChange={(e) => setDepartmentSearchQuery(e.target.value)}
                        className="pl-10 border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                  <Dialog open={addDepartmentOpen} onOpenChange={setAddDepartmentOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Department
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-slate-900">
                          Add New Department
                        </DialogTitle>
                        <DialogDescription className="text-slate-600">
                          Create a new department in the system
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="dept-name">Department Name *</Label>
                          <Input
                            id="dept-name"
                            placeholder="e.g., Computer Science"
                            value={newDepartment.name}
                            onChange={(e) =>
                              setNewDepartment({ ...newDepartment, name: e.target.value })
                            }
                            className="border-slate-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dept-code">Department Code *</Label>
                          <Input
                            id="dept-code"
                            placeholder="e.g., CS"
                            value={newDepartment.code}
                            onChange={(e) =>
                              setNewDepartment({ ...newDepartment, code: e.target.value })
                            }
                            className="border-slate-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dept-desc">Description</Label>
                          <Input
                            id="dept-desc"
                            placeholder="Department description"
                            value={newDepartment.description}
                            onChange={(e) =>
                              setNewDepartment({
                                ...newDepartment,
                                description: e.target.value,
                              })
                            }
                            className="border-slate-300"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setAddDepartmentOpen(false)}
                          className="border-slate-300"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddDepartment}
                          className="bg-slate-800 hover:bg-slate-900 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Department
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Departments Table */}
            <Card className="border-slate-300 bg-white shadow-md">
              <CardHeader className="border-b border-slate-200 bg-slate-50">
                <CardTitle className="text-lg font-bold text-slate-900">
                  Departments ({filteredDepartments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingDepartments ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Code
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Faculty
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Students
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredDepartments.map((dept, index) => (
                          <tr
                            key={dept._id}
                            className={`hover:bg-slate-50 transition-colors ${
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-slate-100 p-2 rounded-lg">
                                  <Building2 className="h-5 w-5 text-slate-700" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900 text-sm">
                                    {dept.name}
                                  </p>
                                  {dept.description && (
                                    <p className="text-xs text-slate-600">
                                      {dept.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Badge className="bg-slate-200 text-slate-800 border-slate-300">
                                {dept.code}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-sm font-semibold text-slate-900">
                                {dept.totalFaculty || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-sm font-semibold text-slate-900">
                                {dept.totalStudents || 0}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-slate-100"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white">
                                  <DropdownMenuLabel className="text-xs font-semibold text-slate-600">
                                    Actions
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedDepartment(dept);
                                      setViewDepartmentOpen(true);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedDepartment(dept);
                                      setEditDepartmentOpen(true);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedDepartment(dept);
                                      setDeleteDepartmentOpen(true);
                                    }}
                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredDepartments.length === 0 && (
                      <div className="text-center py-16">
                        <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">No departments found</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FACULTY TAB */}
          <TabsContent value="faculty" className="space-y-6">
            {/* Faculty Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="border-indigo-300 bg-white shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2">
                        Total Faculty
                      </p>
                      <p className="text-4xl font-bold text-indigo-900">
                        {facultyStats.total}
                      </p>
                    </div>
                    <div className="bg-indigo-100 p-4 rounded-xl">
                      <Users className="h-8 w-8 text-indigo-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-300 bg-white shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-2">
                        Available
                      </p>
                      <p className="text-4xl font-bold text-emerald-900">
                        {facultyStats.available}
                      </p>
                    </div>
                    <div className="bg-emerald-100 p-4 rounded-xl">
                      <UserCheck className="h-8 w-8 text-emerald-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-300 bg-white shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-2">
                        At Capacity
                      </p>
                      <p className="text-4xl font-bold text-amber-900">
                        {facultyStats.unavailable}
                      </p>
                    </div>
                    <div className="bg-amber-100 p-4 rounded-xl">
                      <UserX className="h-8 w-8 text-amber-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Faculty Search and Filters */}
            <Card className="border-slate-300 bg-white shadow-md">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Search faculty..."
                        value={facultySearchQuery}
                        onChange={(e) => setFacultySearchQuery(e.target.value)}
                        className="pl-10 border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                      <SelectTrigger className="border-slate-300 bg-white">
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept._id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={filterAvailability}
                      onValueChange={setFilterAvailability}
                    >
                      <SelectTrigger className="border-slate-300 bg-white">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="unavailable">At Capacity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Faculty Table */}
            <Card className="border-slate-300 bg-white shadow-md">
              <CardHeader className="border-b border-slate-200 bg-slate-50">
                <CardTitle className="text-lg font-bold text-slate-900">
                  Faculty Members ({filteredFaculties.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingFaculties ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Faculty Member
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Workload
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredFaculties.map((faculty, index) => (
                          <tr
                            key={faculty._id}
                            className={`hover:bg-slate-50 transition-colors ${
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-slate-100 p-2 rounded-lg">
                                  <Briefcase className="h-5 w-5 text-slate-700" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900 text-sm">
                                    {faculty.name}
                                  </p>
                                  {faculty.specialization && (
                                    <p className="text-xs text-slate-600">
                                      {faculty.specialization}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                  <Mail className="h-3 w-3" />
                                  {faculty.email}
                                </div>
                                {faculty.phone && (
                                  <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <Phone className="h-3 w-3" />
                                    {faculty.phone}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-medium text-slate-900">
                                  {faculty.department || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                                <span className="text-sm font-bold text-slate-900">
                                  {faculty.assignedGroups || 0}
                                </span>
                                <span className="text-xs text-slate-600">
                                  / {faculty.maxCapacity || 0}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {faculty.isAvailable ? (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Available
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                  <UserX className="h-3 w-3 mr-1" />
                                  Full
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-slate-100"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white">
                                  <DropdownMenuLabel className="text-xs font-semibold text-slate-600">
                                    Actions
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedFaculty(faculty);
                                      setViewFacultyOpen(true);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedFaculty(faculty);
                                      const dept = departments.find(
                                        (d) => d.name === faculty.department
                                      );
                                      setTransferData({
                                        fromDepartmentId: dept?._id || "",
                                        toDepartmentId: "",
                                        supervisorId: faculty._id,
                                      });
                                      setTransferFacultyOpen(true);
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                                    Transfer
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedFaculty(faculty);
                                      setRemoveFacultyOpen(true);
                                    }}
                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredFaculties.length === 0 && (
                      <div className="text-center py-16">
                        <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">No faculty members found</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* USERS & ANALYTICS TAB */}
          <TabsContent value="users" className="space-y-6">
            {/* User Summary Analytics */}
            {loadingUserSummary ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-700" />
              </div>
            ) : userSummary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <Card className="border-indigo-300 bg-white shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2">
                          Total Users
                        </p>
                        <p className="text-4xl font-bold text-indigo-900">
                          {userSummary.totalUsers || 0}
                        </p>
                      </div>
                      <div className="bg-indigo-100 p-4 rounded-xl">
                        <Users className="h-8 w-8 text-indigo-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-emerald-300 bg-white shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-2">
                          Total Students
                        </p>
                        <p className="text-4xl font-bold text-emerald-900">
                          {userSummary.totalStudents || 0}
                        </p>
                      </div>
                      <div className="bg-emerald-100 p-4 rounded-xl">
                        <GraduationCap className="h-8 w-8 text-emerald-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-purple-300 bg-white shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">
                          Total Supervisors
                        </p>
                        <p className="text-4xl font-bold text-purple-900">
                          {userSummary.totalSupervisors || 0}
                        </p>
                      </div>
                      <div className="bg-purple-100 p-4 rounded-xl">
                        <Briefcase className="h-8 w-8 text-purple-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-teal-300 bg-white shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-2">
                          Active Users
                        </p>
                        <p className="text-4xl font-bold text-teal-900">
                          {userSummary.activeUsers || 0}
                        </p>
                      </div>
                      <div className="bg-teal-100 p-4 rounded-xl">
                        <UserCheck className="h-8 w-8 text-teal-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* System Overview */}
            <Card className="border-indigo-300 bg-white shadow-md">
              <CardHeader className="border-b border-indigo-200 bg-indigo-50">
                <CardTitle className="text-lg font-bold text-indigo-900">
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-linear-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                    <Building2 className="h-10 w-10 text-indigo-600 mx-auto mb-3" />
                    <p className="text-2xl font-bold text-indigo-900">{departmentStats.total}</p>
                    <p className="text-sm text-indigo-600 font-medium">Departments</p>
                  </div>
                  <div className="text-center p-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <Briefcase className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
                    <p className="text-2xl font-bold text-emerald-900">{facultyStats.total}</p>
                    <p className="text-sm text-emerald-600 font-medium">Faculty Members</p>
                  </div>
                  <div className="text-center p-4 bg-linear-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <GraduationCap className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                    <p className="text-2xl font-bold text-purple-900">{studentStats.total}</p>
                    <p className="text-sm text-purple-600 font-medium">Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STUDENTS TAB */}
          <TabsContent value="students" className="space-y-6">
            {/* Student Search and Filters */}
            <Card className="border-slate-300 bg-white shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="Search students by name, email, or roll number..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        className="pl-10 border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-64">
                    <Select value={filterStudentDepartment} onValueChange={setFilterStudentDepartment}>
                      <SelectTrigger className="border-slate-300 bg-white">
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept._id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students Table */}
            <Card className="border-slate-300 bg-white shadow-md">
              <CardHeader className="border-b border-slate-200 bg-slate-50">
                <CardTitle className="text-lg font-bold text-slate-900">
                  Students ({filteredStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loadingStudents ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map((student, index) => (
                          <tr
                            key={student._id}
                            className={`hover:bg-slate-50 transition-colors ${
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                  <GraduationCap className="h-5 w-5 text-indigo-700" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900 text-sm">
                                    {student.name}
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    {student.rollNumber}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                  <Mail className="h-3 w-3" />
                                  {student.email}
                                </div>
                                {student.phone && (
                                  <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <Phone className="h-3 w-3" />
                                    {student.phone}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="space-y-1">
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                  {student.department}
                                </Badge>
                                <p className="text-xs text-slate-600">Semester {student.semester}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-slate-100"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedStudent(student);
                                      setDeleteStudentOpen(true);
                                    }}
                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Student
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredStudents.length === 0 && (
                      <div className="text-center py-16">
                        <GraduationCap className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">No students found</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Student Dialog */}
        <Dialog open={viewStudentOpen} onOpenChange={setViewStudentOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-indigo-900">
                Student Details
              </DialogTitle>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-4 py-4">
                <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="bg-indigo-200 p-4 rounded-xl">
                    <GraduationCap className="h-8 w-8 text-indigo-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-indigo-900">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-sm text-indigo-700 font-medium mt-1">
                      Roll Number: {selectedStudent.rollNumber}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 border border-indigo-200 rounded-lg bg-indigo-50">
                    <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">
                      Email
                    </p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-indigo-600" />
                      <p className="text-sm font-medium text-indigo-900 truncate">
                        {selectedStudent.email}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                    <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">
                      Phone
                    </p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-purple-600" />
                      <p className="text-sm font-medium text-purple-900">
                        {selectedStudent.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                      Department
                    </p>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900">
                        {selectedStudent.department}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 border border-teal-200 rounded-lg bg-teal-50">
                    <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1">
                      Group
                    </p>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-teal-600" />
                      <p className="text-sm font-medium text-teal-900">
                        {selectedStudent.groupName}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 border border-cyan-200 rounded-lg bg-cyan-50">
                    <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide mb-1">
                      Supervisor
                    </p>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-cyan-600" />
                      <p className="text-sm font-medium text-cyan-900">
                        {selectedStudent.supervisor}
                      </p>
                    </div>
                  </div>
                  {selectedStudent.semester && (
                    <div className="p-3 border border-pink-200 rounded-lg bg-pink-50">
                      <p className="text-xs font-semibold text-pink-700 uppercase tracking-wide mb-1">
                        Semester
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-pink-600" />
                        <p className="text-sm font-medium text-pink-900">
                          {selectedStudent.semester}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setViewStudentOpen(false)}
                className="border-slate-300"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Student Dialog */}
        <Dialog open={deleteStudentOpen} onOpenChange={setDeleteStudentOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-red-900">
                Delete Student
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Are you sure you want to delete {selectedStudent?.name}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">Warning</p>
                    <p>This action cannot be undone. All student data will be permanently deleted.</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteStudentOpen(false)}
                className="border-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteStudent}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Faculty Dialog */}
        <Dialog open={viewFacultyOpen} onOpenChange={setViewFacultyOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-indigo-900">
                Faculty Details
              </DialogTitle>
            </DialogHeader>
            {selectedFaculty && (
              <div className="space-y-4 py-4">
                <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="bg-indigo-200 p-4 rounded-xl">
                    <Briefcase className="h-8 w-8 text-indigo-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-indigo-900">
                      {selectedFaculty.name}
                    </h3>
                    {selectedFaculty.employeeId && (
                      <p className="text-sm text-indigo-700 font-medium mt-1">
                        Employee ID: {selectedFaculty.employeeId}
                      </p>
                    )}
                    {selectedFaculty.designation && (
                      <p className="text-sm text-purple-600 font-medium mt-1">
                        {selectedFaculty.designation}
                      </p>
                    )}
                    {selectedFaculty.specialization && (
                      <p className="text-sm text-slate-600 mt-1">
                        {selectedFaculty.specialization}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      {selectedFaculty.isAvailable ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          Available
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          Full
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 border border-indigo-200 rounded-lg bg-indigo-50">
                    <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">
                      Email
                    </p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-indigo-600" />
                      <p className="text-sm font-medium text-indigo-900 truncate">
                        {selectedFaculty.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                    <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">
                      Phone
                    </p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-purple-600" />
                      <p className="text-sm font-medium text-purple-900">
                        {selectedFaculty.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                      Department
                    </p>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900">
                        {selectedFaculty.department || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 border border-teal-200 rounded-lg bg-teal-50">
                    <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-1">
                      Office Location
                    </p>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-teal-600" />
                      <p className="text-sm font-medium text-teal-900">
                        {selectedFaculty.officeLocation || 'Not set'}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 border border-cyan-200 rounded-lg bg-cyan-50 md:col-span-2">
                    <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide mb-1">
                      Office Hours
                    </p>
                    <p className="text-sm font-medium text-cyan-900">
                      {selectedFaculty.officeHours || 'Not set'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <h4 className="font-semibold text-indigo-900 mb-3">
                    Workload Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-indigo-600 mb-1">Assigned Groups</p>
                      <p className="text-2xl font-bold text-indigo-900">
                        {selectedFaculty.assignedGroups || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-600 mb-1">Max Capacity</p>
                      <p className="text-2xl font-bold text-indigo-900">
                        {selectedFaculty.maxCapacity || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 bg-white rounded-lg p-2">
                      <div className="w-full bg-indigo-200 rounded-full h-3">
                        <div
                          className="bg-indigo-600 h-3 rounded-full transition-all"
                          style={{
                            width: `${
                              ((selectedFaculty.assignedGroups || 0) /
                                (selectedFaculty.maxCapacity || 1)) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setViewFacultyOpen(false)}
                  className="border-slate-300"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Transfer Faculty Dialog */}
        <Dialog open={transferFacultyOpen} onOpenChange={setTransferFacultyOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Transfer Faculty
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Transfer {selectedFaculty?.name} to a different department
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Current Department</Label>
                <Input
                  value={selectedFaculty?.department || ""}
                  disabled
                  className="bg-slate-100 border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label>Transfer To</Label>
                <Select
                  value={transferData.toDepartmentId}
                  onValueChange={(value) =>
                    setTransferData({ ...transferData, toDepartmentId: value })
                  }
                >
                  <SelectTrigger className="border-slate-300 bg-white">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {departments
                      .filter((dept) => dept.name !== selectedFaculty?.department)
                      .map((dept) => (
                        <SelectItem key={dept._id} value={dept._id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setTransferFacultyOpen(false)}
                className="border-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTransferFaculty}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Transfer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove Faculty Dialog */}
        <Dialog open={removeFacultyOpen} onOpenChange={setRemoveFacultyOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-red-900">
                Remove Faculty
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Are you sure you want to remove {selectedFaculty?.name} from{" "}
                {selectedFaculty?.department}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">Warning</p>
                    <p>
                      This will unassign all groups from this faculty member.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRemoveFacultyOpen(false)}
                className="border-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRemoveFaculty}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Department Dialog */}
        <Dialog open={deleteDepartmentOpen} onOpenChange={setDeleteDepartmentOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-red-900">
                Delete Department
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Are you sure you want to delete {selectedDepartment?.name}?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">Warning</p>
                    <p>This action cannot be undone. Department must be empty.</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDepartmentOpen(false)}
                className="border-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteDepartment}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Department Dialog */}
        <Dialog open={editDepartmentOpen} onOpenChange={setEditDepartmentOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Edit Department
              </DialogTitle>
            </DialogHeader>
            {selectedDepartment && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Department Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedDepartment.name}
                    onChange={(e) =>
                      setSelectedDepartment({
                        ...selectedDepartment,
                        name: e.target.value,
                      })
                    }
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Department Code</Label>
                  <Input
                    id="edit-code"
                    value={selectedDepartment.code}
                    onChange={(e) =>
                      setSelectedDepartment({
                        ...selectedDepartment,
                        code: e.target.value,
                      })
                    }
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-desc">Description</Label>
                  <Input
                    id="edit-desc"
                    value={selectedDepartment.description || ""}
                    onChange={(e) =>
                      setSelectedDepartment({
                        ...selectedDepartment,
                        description: e.target.value,
                      })
                    }
                    className="border-slate-300"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDepartmentOpen(false)}
                className="border-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateDepartment}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Department Dialog */}
        <Dialog open={viewDepartmentOpen} onOpenChange={setViewDepartmentOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-indigo-900">
                Department Details
              </DialogTitle>
            </DialogHeader>
            {selectedDepartment && (
              <div className="space-y-4 py-4">
                <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <div className="bg-indigo-200 p-4 rounded-xl">
                    <Building2 className="h-8 w-8 text-indigo-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-indigo-900">
                      {selectedDepartment.name}
                    </h3>
                    <Badge className="mt-2 bg-indigo-200 text-indigo-800 border-indigo-300">
                      {selectedDepartment.code}
                    </Badge>
                    {selectedDepartment.description && (
                      <p className="text-sm text-slate-600 mt-2">
                        {selectedDepartment.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 border border-indigo-200 rounded-lg bg-indigo-50">
                    <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1">
                      Total Faculty
                    </p>
                    <p className="text-3xl font-bold text-indigo-900">
                      {selectedDepartment.totalFaculty || 0}
                    </p>
                  </div>
                  <div className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                    <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">
                      Total Students
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      {selectedDepartment.totalStudents || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setViewDepartmentOpen(false)}
                className="border-slate-300"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
