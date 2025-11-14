import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Key, User as UserIcon } from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  phone?: string;
  barNumber?: string;
  avatar?: string;
}

export default function Settings() {
  const { user: currentUser, refetchUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch all users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: currentUser?.role === 'attorney' || currentUser?.role === 'admin'
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return await apiRequest('POST', '/api/users', userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsAddUserOpen(false);
      toast({ title: "User created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to create user", description: error.message, variant: "destructive" });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...userData }: any) => {
      return await apiRequest('PUT', `/api/users/${id}`, userData);
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      // If admin updated the current user's info, refetch to update topbar/sidebar
      if (variables.id === currentUser?.id) {
        await refetchUser();
      }
      setIsEditUserOpen(false);
      setSelectedUser(null);
      toast({ title: "User updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update user", description: error.message, variant: "destructive" });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest('DELETE', `/api/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: "User deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete user", description: error.message, variant: "destructive" });
    }
  });

  // Update profile mutation (self-service)
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return await apiRequest('PUT', '/api/auth/profile', profileData);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      // Refetch user to immediately update topbar, sidebar, and all components
      await refetchUser();
      toast({ title: "Profile updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update profile", description: error.message, variant: "destructive" });
    }
  });

  // Change own password mutation (self-service)
  const changeOwnPasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      return await apiRequest('PUT', '/api/auth/password', { password });
    },
    onSuccess: () => {
      setIsChangePasswordOpen(false);
      toast({ title: "Password changed successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to change password", description: error.message, variant: "destructive" });
    }
  });

  // Change user password mutation (admin only)
  const changeUserPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      return await apiRequest('PUT', `/api/users/${userId}`, { password });
    },
    onSuccess: () => {
      setIsChangePasswordOpen(false);
      setSelectedUser(null);
      toast({ title: "User password changed successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to change user password", description: error.message, variant: "destructive" });
    }
  });

  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    
    const userData = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      password: password,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      role: formData.get('role') as string,
      phone: formData.get('phone') as string || undefined,
      barNumber: formData.get('barNumber') as string || undefined,
    };
    addUserMutation.mutate(userData);
  };

  const handleEditUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUser) return;
    const formData = new FormData(e.currentTarget);
    const userData = {
      id: selectedUser.id,
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      role: formData.get('role') as string,
      phone: formData.get('phone') as string || undefined,
      barNumber: formData.get('barNumber') as string || undefined,
    };
    updateUserMutation.mutate(userData);
  };

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const profileData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      barNumber: formData.get('barNumber') as string || undefined,
    };
    updateProfileMutation.mutate(profileData);
  };

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    // If changing a user's password (admin action)
    if (selectedUser) {
      changeUserPasswordMutation.mutate({ userId: selectedUser.id, password: newPassword });
    } else {
      // Changing own password
      changeOwnPasswordMutation.mutate(newPassword);
    }
  };

  const isAdmin = currentUser?.role === 'attorney' || currentUser?.role === 'admin';

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-settings-title">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and user accounts</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile" data-testid="tab-profile">
            <UserIcon className="w-4 h-4 mr-2" />
            My Profile
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="users" data-testid="tab-users">
              <UserIcon className="w-4 h-4 mr-2" />
              User Management
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      defaultValue={currentUser?.firstName}
                      required
                      data-testid="input-firstName"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      defaultValue={currentUser?.lastName}
                      required
                      data-testid="input-lastName"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={currentUser?.email}
                    required
                    data-testid="input-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={currentUser?.phone}
                    data-testid="input-phone"
                  />
                </div>

                {currentUser?.role === 'attorney' && (
                  <div className="space-y-2">
                    <Label htmlFor="barNumber">Hawaii Bar Number</Label>
                    <Input
                      id="barNumber"
                      name="barNumber"
                      defaultValue={currentUser?.barNumber}
                      data-testid="input-barNumber"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={updateProfileMutation.isPending} data-testid="button-update-profile">
                    {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                  </Button>
                  <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" type="button" data-testid="button-change-password">
                        <Key className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handleChangePassword}>
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                          <DialogDescription>Enter your new password below</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              required
                              minLength={6}
                              data-testid="input-newPassword"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              required
                              minLength={6}
                              data-testid="input-confirmPassword"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            type="submit" 
                            disabled={changeOwnPasswordMutation.isPending || changeUserPasswordMutation.isPending} 
                            data-testid="button-submit-password"
                          >
                            {(changeOwnPasswordMutation.isPending || changeUserPasswordMutation.isPending) ? "Changing..." : "Change Password"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage staff accounts (admin only)</CardDescription>
                  </div>
                  <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-user">
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handleAddUser}>
                        <DialogHeader>
                          <DialogTitle>Add New User</DialogTitle>
                          <DialogDescription>Create a new staff account</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="add-firstName">First Name</Label>
                              <Input id="add-firstName" name="firstName" required data-testid="input-add-firstName" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="add-lastName">Last Name</Label>
                              <Input id="add-lastName" name="lastName" required data-testid="input-add-lastName" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="add-username">Username</Label>
                            <Input id="add-username" name="username" required data-testid="input-add-username" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="add-email">Email</Label>
                            <Input id="add-email" name="email" type="email" required data-testid="input-add-email" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="add-password">Password</Label>
                            <Input id="add-password" name="password" type="password" required minLength={6} data-testid="input-add-password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="add-confirmPassword">Confirm Password</Label>
                            <Input id="add-confirmPassword" name="confirmPassword" type="password" required minLength={6} data-testid="input-add-confirmPassword" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="add-role">Role</Label>
                            <Select name="role" defaultValue="paralegal" required>
                              <SelectTrigger id="add-role" data-testid="select-add-role">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="attorney">Attorney</SelectItem>
                                <SelectItem value="paralegal">Paralegal</SelectItem>
                                <SelectItem value="secretary">Secretary</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="add-phone">Phone (optional)</Label>
                            <Input id="add-phone" name="phone" type="tel" data-testid="input-add-phone" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="add-barNumber">Bar Number (optional)</Label>
                            <Input id="add-barNumber" name="barNumber" data-testid="input-add-barNumber" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={addUserMutation.isPending} data-testid="button-submit-add-user">
                            {addUserMutation.isPending ? "Creating..." : "Create User"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="text-center py-8 text-muted-foreground">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No users found</div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <Card key={user.id} data-testid={`card-user-${user.id}`}>
                        <CardContent className="flex items-center justify-between gap-4 p-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold" data-testid={`text-user-name-${user.id}`}>
                                {user.firstName} {user.lastName}
                              </h3>
                              <Badge variant="secondary" data-testid={`badge-user-role-${user.id}`}>
                                {user.role}
                              </Badge>
                              {!user.isActive && (
                                <Badge variant="destructive" data-testid={`badge-user-inactive-${user.id}`}>
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground" data-testid={`text-user-username-${user.id}`}>
                              @{user.username} • {user.email}
                            </p>
                            {user.phone && (
                              <p className="text-sm text-muted-foreground" data-testid={`text-user-phone-${user.id}`}>
                                {user.phone}
                              </p>
                            )}
                            {user.barNumber && (
                              <p className="text-sm text-muted-foreground" data-testid={`text-user-bar-${user.id}`}>
                                Bar #: {user.barNumber}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsChangePasswordOpen(true);
                              }}
                              data-testid={`button-change-password-${user.id}`}
                            >
                              <Key className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsEditUserOpen(true);
                              }}
                              data-testid={`button-edit-user-${user.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
                                  deleteUserMutation.mutate(user.id);
                                }
                              }}
                              disabled={user.id === currentUser?.id}
                              data-testid={`button-delete-user-${user.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <form onSubmit={handleEditUser}>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    name="firstName"
                    defaultValue={selectedUser?.firstName}
                    required
                    data-testid="input-edit-firstName"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    name="lastName"
                    defaultValue={selectedUser?.lastName}
                    required
                    data-testid="input-edit-lastName"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  name="username"
                  defaultValue={selectedUser?.username}
                  required
                  data-testid="input-edit-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={selectedUser?.email}
                  required
                  data-testid="input-edit-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select name="role" defaultValue={selectedUser?.role} required>
                  <SelectTrigger id="edit-role" data-testid="select-edit-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attorney">Attorney</SelectItem>
                    <SelectItem value="paralegal">Paralegal</SelectItem>
                    <SelectItem value="secretary">Secretary</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone (optional)</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  type="tel"
                  defaultValue={selectedUser?.phone}
                  data-testid="input-edit-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-barNumber">Bar Number (optional)</Label>
                <Input
                  id="edit-barNumber"
                  name="barNumber"
                  defaultValue={selectedUser?.barNumber}
                  data-testid="input-edit-barNumber"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateUserMutation.isPending} data-testid="button-submit-edit-user">
                {updateUserMutation.isPending ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
