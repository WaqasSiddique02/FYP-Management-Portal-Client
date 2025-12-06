'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  GraduationCap, 
  Users, 
  Search, 
  UserPlus, 
  X, 
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { studentAPI, groupAPI } from '@/lib/api/student.api';
import { useAuthProtection } from '@/lib/hooks/useAuthProtection';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
}

interface SearchedStudent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  rollNumber: string;
  department: string;
}

interface SelectedMember {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  department: string;
}

interface ExistingGroup {
  _id: string;
  name: string;
  leader: {
    _id: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
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
    designation: string;
  };
}

export default function RegisterFYPPage() {
  const { isChecking: authLoading } = useAuthProtection('STUDENT');
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedStudent[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [existingGroup, setExistingGroup] = useState<ExistingGroup | null>(null);

  useEffect(() => {
    checkRegistrationStatus();
    fetchDepartments();
  }, []);

  const checkRegistrationStatus = async () => {
    try {
      const response = await studentAPI.getProfile();
      const profileData = response.data || response;
      const student = profileData.student;
      
      if (student?.isRegisteredForFYP) {
        // Student already registered, check if they have a group
        if (profileData.group) {
          // Already has a group, show group details
          setExistingGroup(profileData.group);
          setCurrentStep(3); // Set to step 3 to show completion view
        } else {
          // Registered but no group, skip to step 2
          setCurrentStep(2);
        }
      }
    } catch (err: any) {
      console.error('Failed to check registration status:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await studentAPI.getDepartments();
      setDepartments(response.departments || []);
    } catch (err: any) {
      setError('Failed to load departments');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError('');
    try {
      const response = await studentAPI.searchStudents(searchQuery);
      const data = response.data || response;
      setSearchResults(data.students || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search students');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addMember = (student: SearchedStudent) => {
    if (selectedMembers.length >= 2) {
      setError('Maximum 2 additional members allowed (3 members total including you)');
      return;
    }

    if (selectedMembers.some(m => m.id === student._id)) {
      setError('This member is already added');
      return;
    }

    setSelectedMembers([
      ...selectedMembers,
      {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        email: student.email,
        rollNumber: student.rollNumber,
        department: student.department,
      },
    ]);
    setSearchQuery('');
    setSearchResults([]);
    setError('');
  };

  const removeMember = (id: string) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== id));
  };

  const handleRegisterFYP = async () => {
    if (!selectedDepartment) {
      setError('Please select a department');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await studentAPI.registerFYP(selectedDepartment);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register for FYP');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    if (selectedMembers.length < 2) {
      setError('Please add at least 2 more members to complete your group of 3');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const memberIds = selectedMembers.map(m => m.id);
      await groupAPI.createGroup(groupName, memberIds);
      setSuccess(true);
      setTimeout(() => {
        router.replace('/student/dashboard');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create group';
      setError(errorMessage);
      
      // If error is about a member already in a group, scroll to error message
      if (errorMessage.includes('already part of a group')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (success) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-md border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center> mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  Registration Successful!
                </h3>
                <p className="text-green-700 mb-4">
                  You've successfully registered for FYP and created your group.
                </p>
                <p className="text-sm text-green-600">Redirecting to dashboard...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Register for FYP</h1>
              <p className="text-blue-100 mt-1">Complete your registration in 2 simple steps</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= 1 ? 'bg-white text-blue-600' : 'bg-white/30 text-white'
              }`}>
                1
              </div>
              <span className="font-medium">Department Selection</span>
            </div>
            <div className="h-0.5 w-12 bg-white/30"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= 2 ? 'bg-white text-blue-600' : 'bg-white/30 text-white'
              }`}>
                2
              </div>
              <span className="font-medium">Group Creation</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">{error}</p>
                  {error.includes('already part of a group') && (
                    <p className="text-xs text-red-700 mt-1">
                      Please remove this member from your selection or choose different members.
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-600 hover:text-red-800 shrink-0"
                  aria-label="Dismiss error"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Department Selection */}
        {currentStep === 1 && (
          <Card className="shadow-lg">
            <CardHeader className="bg-linear-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-blue-600" />
                Step 1: Select Your Department
              </CardTitle>
              <CardDescription>
                Choose the department for your FYP registration
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-base font-semibold">
                  Department <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{dept.name}</span>
                          {dept.description && (
                            <span className="text-xs text-gray-500">{dept.description}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Important Information
                </h4>
                <ul className="text-sm text-blue-700 space-y-1 ml-6 list-disc">
                  <li>Make sure to select the correct department</li>
                  <li>After registration, you'll proceed to create your FYP group</li>
                  <li>You need to add 2 team members (3 members total including you)</li>
                </ul>
              </div>

              <Button 
                onClick={handleRegisterFYP} 
                disabled={!selectedDepartment || loading}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Continue to Group Creation
                    <Users className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Group Creation */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Group Name */}
            <Card className="shadow-lg">
              <CardHeader className="bg-linear-to-r from-indigo-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-indigo-600" />
                  Step 2: Create Your Group
                </CardTitle>
                <CardDescription>
                  Name your group and add team members (1-3 members)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="groupName" className="text-base font-semibold">
                    Group Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="groupName"
                    placeholder="e.g., Team Alpha, Innovation Squad, Code Warriors"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-gray-500">Choose a unique and memorable name for your group</p>
                </div>
              </CardContent>
            </Card>

            {/* Search Members */}
            <Card className="shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-gray-600" />
                  Search & Add Members
                </CardTitle>
                <CardDescription>
                  Search for students by name, email, or roll number
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by name, email, or roll number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="h-11"
                    />
                  </div>
                  <Button 
                    onClick={handleSearch} 
                    disabled={searching || !searchQuery.trim()}
                    variant="outline"
                    className="px-6"
                  >
                    {searching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                    {searchResults.map((student) => (
                      <div
                        key={student._id}
                        className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{student.email}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {student.rollNumber}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {student.department}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => addMember(student)}
                          disabled={selectedMembers.some(m => m.id === student._id)}
                          size="sm"
                          variant="default"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Members */}
            <Card className="shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    Group Members
                  </span>
                  <Badge variant="secondary" className="text-sm">
                    {selectedMembers.length}/2 Additional Members
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {selectedMembers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No members added yet</p>
                    <p className="text-sm">Search and add team members above</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedMembers.map((member, index) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-600">{member.email}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {member.rollNumber}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {member.department}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeMember(member.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card className="shadow-lg bg-linear-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="pt-6">
                <Button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedMembers.length === 0 || loading}
                  className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Group...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Complete Registration & Create Group
                    </>
                  )}
                </Button>
                <p className="text-center text-sm text-gray-600 mt-3">
                  By clicking submit, you confirm that all information is correct
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Group Already Created - Show Details */}
        {currentStep === 3 && existingGroup && (
          <div className="space-y-6">
            {/* Success Banner */}
            <Card className="shadow-lg border-green-500">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600 shrink-0" />
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">FYP Registration Completed</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Your group has been successfully registered</p>
                  </div>
                  <Badge className="bg-green-600 text-white self-start sm:self-auto">Active</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Group Details Card */}
            <Card className="shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="text-lg">Group Registration Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Group Name Row */}
                  <div className="flex flex-col sm:flex-row border-b pb-4 gap-2 sm:gap-0">
                    <div className="sm:w-48 shrink-0">
                      <Label className="text-sm font-semibold text-gray-700">Group Name</Label>
                    </div>
                    <div className="flex-1">
                      <p className="text-base sm:text-lg font-bold text-gray-900">{existingGroup.name}</p>
                    </div>
                  </div>

                  {/* Group Members Row */}
                  <div className="flex flex-col sm:flex-row border-b pb-4 gap-2 sm:gap-0">
                    <div className="sm:w-48 shrink-0">
                      <Label className="text-sm font-semibold text-gray-700">Group Members</Label>
                      <p className="text-xs text-gray-500 mt-1">({existingGroup.members.length} members)</p>
                    </div>
                    <div className="flex-1">
                      <div className="space-y-3">
                        {existingGroup.members.map((member, index) => (
                          <div key={member._id} className="flex items-start gap-2 sm:gap-3">
                            <span className="text-sm font-medium text-gray-500 w-5 sm:w-6 shrink-0">{index + 1}.</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                                {member.firstName} {member.lastName}
                                {member._id === existingGroup.leader._id && (
                                  <Badge className="ml-2 bg-blue-600 text-white text-xs">Leader</Badge>
                                )}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">{member.rollNumber}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Assigned Supervisor Row */}
                  <div className="flex flex-col sm:flex-row pb-4 gap-2 sm:gap-0">
                    <div className="sm:w-48 shrink-0">
                      <Label className="text-sm font-semibold text-gray-700">Assigned Supervisor</Label>
                    </div>
                    <div className="flex-1">
                      {existingGroup.assignedSupervisor ? (
                        <div>
                          <p className="font-semibold text-gray-900 text-sm sm:text-base">
                            {existingGroup.assignedSupervisor.firstName} {existingGroup.assignedSupervisor.lastName}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1 break-all">{existingGroup.assignedSupervisor.email}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {existingGroup.assignedSupervisor.designation}
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span className="text-xs sm:text-sm">Not assigned yet</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps Card */}
            <Card className="shadow-lg border-blue-200">
              <CardHeader className="border-b bg-blue-50">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-blue-900">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ol className="space-y-2 text-xs sm:text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="font-bold text-blue-600">1.</span>
                    <span>Wait for supervisor assignment by the coordinator</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-blue-600">2.</span>
                    <span>Start working on your FYP proposal once assigned</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-blue-600">3.</span>
                    <span>Check your dashboard regularly for updates and announcements</span>
                  </li>
                </ol>
              </CardContent>
              <CardContent className="pt-0 pb-6">
                <Button
                  onClick={() => router.push('/student/dashboard')}
                  className="w-full h-10 sm:h-11 text-sm sm:text-base bg-blue-600 hover:bg-blue-700"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
