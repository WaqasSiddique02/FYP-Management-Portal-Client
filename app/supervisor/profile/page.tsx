'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { supervisorApi } from '@/lib/api/supervisor.api';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Mail,
  Phone,
  Building2,
  BookOpen,
  MapPin,
  Clock,
  Award,
  Users,
  Edit,
  Save,
  X,
  Loader2,
  KeyRound,
  Briefcase,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react';

interface SupervisorProfile {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  employeeId: string;
  designation: string;
  department: string;
  specialization?: string;
  researchInterests?: string[];
  maxStudents: number;
  currentStudentCount: number;
  availableSlots: number;
  isAvailableForSupervision: boolean;
  officeLocation?: string;
  officeHours?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function SupervisorProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthContext();

  const [profile, setProfile] = useState<SupervisorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    designation: '',
    specialization: '',
    researchInterests: '',
    officeLocation: '',
    officeHours: '',
    maxStudents: 12,
  });

  // Password dialog state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchProfile();
    }
  }, [authLoading, user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supervisorApi.getProfile();
      setProfile(data);
      // Initialize form data
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber || '',
        designation: data.designation || '',
        specialization: data.specialization || '',
        researchInterests: data.researchInterests?.join(', ') || '',
        officeLocation: data.officeLocation || '',
        officeHours: data.officeHours || '',
        maxStudents: data.maxStudents || 12,
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data if canceling
      if (profile) {
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          phoneNumber: profile.phoneNumber || '',
          designation: profile.designation || '',
          specialization: profile.specialization || '',
          researchInterests: profile.researchInterests?.join(', ') || '',
          officeLocation: profile.officeLocation || '',
          officeHours: profile.officeHours || '',
          maxStudents: profile.maxStudents || 12,
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        designation: formData.designation,
        specialization: formData.specialization || undefined,
        researchInterests: formData.researchInterests
          ? formData.researchInterests.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        officeLocation: formData.officeLocation || undefined,
        officeHours: formData.officeHours || undefined,
        maxStudents: Number(formData.maxStudents),
      };

      await supervisorApi.updateProfile(payload);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile(); // Refresh profile
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      setPasswordError('');

      await supervisorApi.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success('Password updated successfully!');
      setPasswordDialogOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Error updating password:', error);
      setPasswordError(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout role="supervisor">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !profile) {
    return (
      <DashboardLayout role="supervisor">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Card className="border-red-200 bg-red-50 max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-red-900 font-medium mb-4">{error}</p>
              <Button onClick={fetchProfile} className="bg-green-600 hover:bg-green-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
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
              <h1 className="text-2xl md:text-3xl font-bold mb-2">My Profile</h1>
              <p className="text-green-100 text-sm md:text-base">
                View and manage your profile information
              </p>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <>
                  <Button
                    onClick={handleEditToggle}
                    className="bg-white text-green-600 hover:bg-green-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button
                    onClick={() => setPasswordDialogOpen(true)}
                    variant="outline"
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  >
                    <KeyRound className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-white text-green-600 hover:bg-green-50"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleEditToggle}
                    disabled={isSaving}
                    variant="outline"
                    className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Overview */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-12 w-12 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{profile.fullName}</h2>
                    <p className="text-sm text-slate-500 mt-1">{profile.designation}</p>
                    <Badge className="mt-3 bg-green-600 text-white">
                      {profile.department}
                    </Badge>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 truncate">{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">{profile.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Briefcase className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600">ID: {profile.employeeId}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supervision Stats */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Supervision Load
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Current Students</span>
                      <span className="font-semibold text-slate-900">
                        {profile.currentStudentCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Max Capacity</span>
                      <span className="font-semibold text-slate-900">{profile.maxStudents}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Available Slots</span>
                      <span className="font-semibold text-green-600">
                        {profile.availableSlots}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      {profile.isAvailableForSupervision ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">
                            Available for Supervision
                          </span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-600 font-medium">
                            Not Available
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      {isEditing ? (
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({ ...formData, firstName: e.target.value })
                          }
                          placeholder="Enter first name"
                        />
                      ) : (
                        <p className="text-sm text-slate-900 font-medium py-2">
                          {profile.firstName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({ ...formData, lastName: e.target.value })
                          }
                          placeholder="Enter last name"
                        />
                      ) : (
                        <p className="text-sm text-slate-900 font-medium py-2">
                          {profile.lastName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, phoneNumber: e.target.value })
                          }
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <p className="text-sm text-slate-900 font-medium py-2">
                          {profile.phoneNumber}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation</Label>
                      {isEditing ? (
                        <Input
                          id="designation"
                          value={formData.designation}
                          onChange={(e) =>
                            setFormData({ ...formData, designation: e.target.value })
                          }
                          placeholder="Enter designation"
                        />
                      ) : (
                        <p className="text-sm text-slate-900 font-medium py-2">
                          {profile.designation}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <p className="text-sm text-slate-500 py-2">{profile.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      {isEditing ? (
                        <Input
                          id="specialization"
                          value={formData.specialization}
                          onChange={(e) =>
                            setFormData({ ...formData, specialization: e.target.value })
                          }
                          placeholder="Enter specialization"
                        />
                      ) : (
                        <p className="text-sm text-slate-900 font-medium py-2">
                          {profile.specialization || 'Not specified'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="researchInterests">
                        Research Interests
                      </Label>
                      {isEditing ? (
                        <Textarea
                          id="researchInterests"
                          value={formData.researchInterests}
                          onChange={(e) =>
                            setFormData({ ...formData, researchInterests: e.target.value })
                          }
                          placeholder="e.g., Machine Learning, AI, Deep Learning"
                          rows={3}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2 py-2">
                          {profile.researchInterests && profile.researchInterests.length > 0 ? (
                            profile.researchInterests.map((interest, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                {interest}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-slate-500">Not specified</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxStudents">Maximum Students</Label>
                      {isEditing ? (
                        <Input
                          id="maxStudents"
                          type="number"
                          min="1"
                          max="50"
                          value={formData.maxStudents}
                          onChange={(e) =>
                            setFormData({ ...formData, maxStudents: Number(e.target.value) })
                          }
                        />
                      ) : (
                        <p className="text-sm text-slate-900 font-medium py-2">
                          {profile.maxStudents}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Office Information */}
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                    Office Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="officeLocation">Office Location</Label>
                      {isEditing ? (
                        <Input
                          id="officeLocation"
                          value={formData.officeLocation}
                          onChange={(e) =>
                            setFormData({ ...formData, officeLocation: e.target.value })
                          }
                          placeholder="e.g., Room 301"
                        />
                      ) : (
                        <p className="text-sm text-slate-900 font-medium py-2">
                          {profile.officeLocation || 'Not specified'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="officeHours">Office Hours</Label>
                      {isEditing ? (
                        <Input
                          id="officeHours"
                          value={formData.officeHours}
                          onChange={(e) =>
                            setFormData({ ...formData, officeHours: e.target.value })
                          }
                          placeholder="e.g., Mon-Fri 2-4 PM"
                        />
                      ) : (
                        <p className="text-sm text-slate-900 font-medium py-2">
                          {profile.officeHours || 'Not specified'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Password Change Dialog */}
        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-green-600" />
                Change Password
              </DialogTitle>
              <DialogDescription>
                Enter your current password and choose a new password
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  placeholder="Enter current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm new password"
                />
              </div>

              {passwordError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{passwordError}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setPasswordDialogOpen(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordError('');
                }}
                disabled={isUpdatingPassword}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordChange}
                disabled={isUpdatingPassword}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
