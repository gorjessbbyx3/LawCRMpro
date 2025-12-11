import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User, Mail, Phone, MapPin, Lock, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface ProfileData {
  portalUser: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

export default function PortalProfile() {
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ['/api/portal/profile'],
    meta: {
      onSuccess: (data: ProfileData) => {
        setPhone(data.portalUser.phone || '');
      }
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { phone?: string; password?: string; currentPassword?: string }) => {
      const response = await apiRequest('PATCH', '/api/portal/profile', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/profile'] });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    },
  });

  const handleUpdatePhone = () => {
    updateProfileMutation.mutate({ phone });
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all password fields.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }

    updateProfileMutation.mutate({
      password: newPassword,
      currentPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6" />
          Your Profile
        </h1>
        <p className="text-muted-foreground">View and update your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Portal Account</CardTitle>
            <CardDescription>Your login and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{profile.portalUser.firstName} {profile.portalUser.lastName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile.portalUser.email}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  data-testid="input-phone"
                />
                <Button 
                  onClick={handleUpdatePhone} 
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-update-phone"
                >
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Your legal record details (contact your attorney to update)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{profile.client.firstName} {profile.client.lastName}</p>
              </div>
            </div>

            {profile.client.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email on File</p>
                  <p className="font-medium">{profile.client.email}</p>
                </div>
              </div>
            )}

            {profile.client.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone on File</p>
                  <p className="font-medium">{profile.client.phone}</p>
                </div>
              </div>
            )}

            {(profile.client.address || profile.client.city) && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {profile.client.address && <>{profile.client.address}<br /></>}
                    {profile.client.city && `${profile.client.city}, `}
                    {profile.client.state} {profile.client.zipCode}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your portal login password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                data-testid="input-current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                data-testid="input-new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                data-testid="input-confirm-password"
              />
            </div>
          </div>
          <Button 
            onClick={handleUpdatePassword} 
            disabled={updateProfileMutation.isPending}
            data-testid="button-update-password"
          >
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
