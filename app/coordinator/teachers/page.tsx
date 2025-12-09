"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuthContext } from "@/lib/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Filter,
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
  Download,
  Upload,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  assignedGroups: number;
  maxCapacity: number;
  isAvailable: boolean;
  joiningDate: string;
  status: "active" | "inactive" | "on-leave";
}

export default function TeacherManagementPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Dialog states
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Form states
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    specialization: "",
    maxCapacity: 3,
  });

  const [transferData, setTransferData] = useState({
    fromDepartment: "",
    toDepartment: "",
  });

  // Mock data - Replace with actual API call
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockTeachers: Teacher[] = [
        {
          id: "1",
          name: "Dr. Ahmed Hassan",
          email: "ahmed.hassan@university.edu",
          phone: "+92 300 1234567",
          department: "Computer Science",
          specialization: "Machine Learning",
          assignedGroups: 2,
          maxCapacity: 3,
          isAvailable: true,
          joiningDate: "2020-09-01",
          status: "active",
        },
        {
          id: "2",
          name: "Dr. Sara Khan",
          email: "sara.khan@university.edu",
          phone: "+92 301 2345678",
          department: "Software Engineering",
          specialization: "Web Development",
          assignedGroups: 3,
          maxCapacity: 3,
          isAvailable: false,
          joiningDate: "2019-08-15",
          status: "active",
        },
        {
          id: "3",
          name: "Prof. Muhammad Ali",
          email: "m.ali@university.edu",
          phone: "+92 302 3456789",
          department: "Computer Science",
          specialization: "Data Science",
          assignedGroups: 1,
          maxCapacity: 4,
          isAvailable: true,
          joiningDate: "2018-01-10",
          status: "active",
        },
        {
          id: "4",
          name: "Dr. Fatima Noor",
          email: "fatima.noor@university.edu",
          phone: "+92 303 4567890",
          department: "Information Technology",
          specialization: "Cybersecurity",
          assignedGroups: 0,
          maxCapacity: 3,
          isAvailable: true,
          joiningDate: "2021-03-20",
          status: "on-leave",
        },
        {
          id: "5",
          name: "Dr. Imran Shah",
          email: "imran.shah@university.edu",
          phone: "+92 304 5678901",
          department: "Software Engineering",
          specialization: "Mobile Development",
          assignedGroups: 2,
          maxCapacity: 3,
          isAvailable: true,
          joiningDate: "2020-02-14",
          status: "active",
        },
      ];
      setTeachers(mockTeachers);
      setFilteredTeachers(mockTeachers);
      setLoading(false);
    }, 1000);
  };

  // Filter teachers
  useEffect(() => {
    let filtered = teachers;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Department filter
    if (filterDepartment !== "all") {
      filtered = filtered.filter(
        (teacher) => teacher.department === filterDepartment
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      if (filterStatus === "available") {
        filtered = filtered.filter((teacher) => teacher.isAvailable);
      } else if (filterStatus === "unavailable") {
        filtered = filtered.filter((teacher) => !teacher.isAvailable);
      } else {
        filtered = filtered.filter((teacher) => teacher.status === filterStatus);
      }
    }

    setFilteredTeachers(filtered);
  }, [searchQuery, filterDepartment, filterStatus, teachers]);

  const handleAddTeacher = () => {
    // Add teacher logic
    console.log("Adding teacher:", newTeacher);
    setAddTeacherOpen(false);
    // Reset form
    setNewTeacher({
      name: "",
      email: "",
      phone: "",
      department: "",
      specialization: "",
      maxCapacity: 3,
    });
  };

  const handleTransferTeacher = () => {
    console.log("Transferring teacher:", selectedTeacher?.id, transferData);
    setTransferDialogOpen(false);
  };

  const handleDeleteTeacher = () => {
    console.log("Deleting teacher:", selectedTeacher?.id);
    setDeleteDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-slate-100 text-slate-800 border-slate-200">
            Inactive
          </Badge>
        );
      case "on-leave":
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            On Leave
          </Badge>
        );
      default:
        return null;
    }
  };

  const getAvailabilityBadge = (isAvailable: boolean) => {
    return isAvailable ? (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
        <UserCheck className="h-3 w-3 mr-1" />
        Available
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        <UserX className="h-3 w-3 mr-1" />
        Full
      </Badge>
    );
  };

  const departments = [
    "Computer Science",
    "Software Engineering",
    "Information Technology",
    "Data Science",
  ];

  const stats = {
    total: teachers.length,
    active: teachers.filter((t) => t.status === "active").length,
    available: teachers.filter((t) => t.isAvailable).length,
    onLeave: teachers.filter((t) => t.status === "on-leave").length,
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout role="coordinator">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Loading teachers...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="coordinator">
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <Users className="h-7 w-7 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Teacher Management
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Manage supervisors, track availability, and assign workload
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-slate-300 hover:bg-slate-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={addTeacherOpen} onOpenChange={setAddTeacherOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Teacher
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-900">
                      Add New Teacher
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                      Enter teacher information to add them to the system
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          placeholder="Dr. John Doe"
                          value={newTeacher.name}
                          onChange={(e) =>
                            setNewTeacher({ ...newTeacher, name: e.target.value })
                          }
                          className="border-slate-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john.doe@university.edu"
                          value={newTeacher.email}
                          onChange={(e) =>
                            setNewTeacher({ ...newTeacher, email: e.target.value })
                          }
                          className="border-slate-300"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          placeholder="+92 300 1234567"
                          value={newTeacher.phone}
                          onChange={(e) =>
                            setNewTeacher({ ...newTeacher, phone: e.target.value })
                          }
                          className="border-slate-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department *</Label>
                        <Select
                          value={newTeacher.department}
                          onValueChange={(value) =>
                            setNewTeacher({ ...newTeacher, department: value })
                          }
                        >
                          <SelectTrigger className="border-slate-300">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization *</Label>
                        <Input
                          id="specialization"
                          placeholder="e.g., Machine Learning"
                          value={newTeacher.specialization}
                          onChange={(e) =>
                            setNewTeacher({
                              ...newTeacher,
                              specialization: e.target.value,
                            })
                          }
                          className="border-slate-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxCapacity">Max Group Capacity</Label>
                        <Input
                          id="maxCapacity"
                          type="number"
                          min="1"
                          max="10"
                          value={newTeacher.maxCapacity}
                          onChange={(e) =>
                            setNewTeacher({
                              ...newTeacher,
                              maxCapacity: parseInt(e.target.value),
                            })
                          }
                          className="border-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setAddTeacherOpen(false)}
                      className="border-slate-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddTeacher}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Teacher
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="border-indigo-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Total Teachers
                  </p>
                  <p className="text-4xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="bg-indigo-100 p-4 rounded-xl">
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Active Teachers
                  </p>
                  <p className="text-4xl font-bold text-slate-900">{stats.active}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-xl">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Available
                  </p>
                  <p className="text-4xl font-bold text-slate-900">
                    {stats.available}
                  </p>
                </div>
                <div className="bg-blue-100 p-4 rounded-xl">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    On Leave
                  </p>
                  <p className="text-4xl font-bold text-slate-900">
                    {stats.onLeave}
                  </p>
                </div>
                <div className="bg-amber-100 p-4 rounded-xl">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, email, or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-slate-300"
                  />
                </div>
              </div>
              <div>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="border-slate-300">
                    <Building2 className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border-slate-300">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Table */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-200 bg-slate-50">
            <CardTitle className="text-lg font-bold text-slate-900">
              Teachers List ({filteredTeachers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Teacher
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
                      Availability
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
                  {filteredTeachers.map((teacher, index) => (
                    <tr
                      key={teacher.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-100 p-2 rounded-lg">
                            <Briefcase className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">
                              {teacher.name}
                            </p>
                            <p className="text-xs text-slate-600">
                              {teacher.specialization}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Mail className="h-3 w-3" />
                            {teacher.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Phone className="h-3 w-3" />
                            {teacher.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-900">
                            {teacher.department}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                          <span className="text-sm font-bold text-slate-900">
                            {teacher.assignedGroups}
                          </span>
                          <span className="text-xs text-slate-600">
                            / {teacher.maxCapacity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getAvailabilityBadge(teacher.isAvailable)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(teacher.status)}
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
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-xs font-semibold text-slate-600">
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTeacher(teacher);
                                setViewDetailsOpen(true);
                              }}
                              className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Teacher
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTeacher(teacher);
                                setTransferData({
                                  fromDepartment: teacher.department,
                                  toDepartment: "",
                                });
                                setTransferDialogOpen(true);
                              }}
                              className="cursor-pointer"
                            >
                              <ArrowLeftRight className="h-4 w-4 mr-2" />
                              Transfer Department
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTeacher(teacher);
                                setDeleteDialogOpen(true);
                              }}
                              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Teacher
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTeachers.length === 0 && (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No teachers found</p>
                <p className="text-sm text-slate-500 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Details Dialog */}
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Teacher Details
              </DialogTitle>
            </DialogHeader>
            {selectedTeacher && (
              <div className="space-y-6 py-4">
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="bg-indigo-100 p-4 rounded-xl">
                    <Briefcase className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">
                      {selectedTeacher.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {selectedTeacher.specialization}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      {getStatusBadge(selectedTeacher.status)}
                      {getAvailabilityBadge(selectedTeacher.isAvailable)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-200 rounded-xl">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                      Email
                    </p>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <p className="text-sm font-medium text-slate-900">
                        {selectedTeacher.email}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-xl">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                      Phone
                    </p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <p className="text-sm font-medium text-slate-900">
                        {selectedTeacher.phone}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-xl">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                      Department
                    </p>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-500" />
                      <p className="text-sm font-medium text-slate-900">
                        {selectedTeacher.department}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-xl">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                      Joining Date
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(selectedTeacher.joiningDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Workload Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">
                        Assigned Groups
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {selectedTeacher.assignedGroups}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">
                        Max Capacity
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {selectedTeacher.maxCapacity}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 bg-white rounded-lg p-2">
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{
                          width: `${
                            (selectedTeacher.assignedGroups /
                              selectedTeacher.maxCapacity) *
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
                onClick={() => setViewDetailsOpen(false)}
                className="border-slate-300"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transfer Dialog */}
        <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Transfer Teacher
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Transfer {selectedTeacher?.name} to a different department
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Current Department</Label>
                <Input
                  value={transferData.fromDepartment}
                  disabled
                  className="bg-slate-100 border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label>Transfer To</Label>
                <Select
                  value={transferData.toDepartment}
                  onValueChange={(value) =>
                    setTransferData({ ...transferData, toDepartment: value })
                  }
                >
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments
                      .filter((dept) => dept !== transferData.fromDepartment)
                      .map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setTransferDialogOpen(false)}
                className="border-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTransferTeacher}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Transfer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-red-900">
                Remove Teacher
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Are you sure you want to remove {selectedTeacher?.name} from the
                system? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">Warning</p>
                    <p>
                      Removing this teacher will unassign all their groups. Make
                      sure to reassign these groups to other supervisors.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                className="border-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteTeacher}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Teacher
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
