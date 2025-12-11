import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Scale, Lock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/queryClient';

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface InvitationData {
  valid: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  clientName?: string;
  error?: string;
}

export default function PortalAcceptInvitation() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const token = searchParams.get('token');
  
  const [success, setSuccess] = useState(false);

  const { data: invitation, isLoading, error } = useQuery<InvitationData>({
    queryKey: ['/api/portal/auth/verify-invitation', token],
    queryFn: async () => {
      const response = await fetch(`/api/portal/auth/verify-invitation/${token}`);
      return response.json();
    },
    enabled: !!token,
    retry: false,
  });

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest('POST', '/api/portal/auth/accept-invitation', {
        token,
        password,
      });
      return response.json();
    },
    onSuccess: () => {
      setSuccess(true);
    },
  });

  const onSubmit = (data: PasswordFormValues) => {
    acceptMutation.mutate(data.password);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-lg font-medium">Invalid Invitation</p>
            <p className="text-muted-foreground mt-2">No invitation token provided.</p>
            <Button className="mt-4" onClick={() => setLocation('/portal/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-lg font-medium">Invalid or Expired Invitation</p>
            <p className="text-muted-foreground mt-2">
              {invitation?.error || 'This invitation link is no longer valid. Please contact your attorney for a new invitation.'}
            </p>
            <Button className="mt-4" onClick={() => setLocation('/portal/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <p className="text-lg font-medium">Account Activated!</p>
            <p className="text-muted-foreground mt-2">
              Your client portal account has been set up successfully. You can now log in.
            </p>
            <Button 
              className="mt-4" 
              onClick={() => setLocation('/portal/login')}
              data-testid="button-go-to-login"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Scale className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Set Up Your Account</CardTitle>
          <CardDescription>
            Welcome, {invitation.firstName}! Create a password to access the client portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {acceptMutation.error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {(acceptMutation.error as any)?.message || 'Failed to set up account. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-4 p-3 rounded-md bg-muted">
            <p className="text-sm">
              <span className="font-medium">Email:</span> {invitation.email}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="password" 
                          placeholder="Create a password" 
                          className="pl-10"
                          data-testid="input-password"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="password" 
                          placeholder="Confirm your password" 
                          className="pl-10"
                          data-testid="input-confirm-password"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={acceptMutation.isPending}
                data-testid="button-activate-account"
              >
                {acceptMutation.isPending ? 'Setting up...' : 'Activate Account'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
