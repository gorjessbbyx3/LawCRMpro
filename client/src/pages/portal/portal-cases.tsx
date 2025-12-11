import { useQuery } from '@tanstack/react-query';
import { useLocation, useParams } from 'wouter';
import { Briefcase, ArrowLeft, Clock, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description?: string;
  caseType: string;
  status: string;
  priority: string;
  courtLocation?: string;
  opposingParty?: string;
  progress?: number;
  nextAction?: string;
  nextActionDue?: string;
  createdAt: string;
}

export default function PortalCases() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id?: string }>();

  if (params.id) {
    return <CaseDetail id={params.id} />;
  }

  return <CasesList />;
}

function CasesList() {
  const [, setLocation] = useLocation();

  const { data: cases, isLoading } = useQuery<Case[]>({
    queryKey: ['/api/portal/cases'],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="h-6 w-6" />
          Your Cases
        </h1>
        <p className="text-muted-foreground">View the status of your legal matters</p>
      </div>

      {cases && cases.length > 0 ? (
        <div className="space-y-4">
          {cases.map((c) => (
            <Card 
              key={c.id} 
              className="hover-elevate cursor-pointer"
              onClick={() => setLocation(`/portal/cases/${c.id}`)}
              data-testid={`card-case-${c.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="text-lg">{c.title}</CardTitle>
                    <CardDescription>{c.caseNumber}</CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>
                      {c.status}
                    </Badge>
                    <Badge variant="outline">{c.caseType.replace('_', ' ')}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {c.progress !== undefined && c.progress !== null && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} className="h-2" />
                  </div>
                )}
                {c.nextAction && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Next: {c.nextAction}
                    {c.nextActionDue && ` (Due: ${new Date(c.nextActionDue).toLocaleDateString()})`}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No cases found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CaseDetail({ id }: { id: string }) {
  const [, setLocation] = useLocation();

  const { data: caseData, isLoading } = useQuery<Case>({
    queryKey: ['/api/portal/cases', id],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => setLocation('/portal/cases')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cases
        </Button>
        <p className="mt-4 text-muted-foreground">Case not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={() => setLocation('/portal/cases')} data-testid="button-back-cases">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cases
      </Button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{caseData.title}</h1>
          <p className="text-muted-foreground">{caseData.caseNumber}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge variant={caseData.status === 'active' ? 'default' : 'secondary'}>
            {caseData.status}
          </Badge>
          <Badge variant="outline">{caseData.caseType.replace('_', ' ')}</Badge>
          <Badge variant={caseData.priority === 'high' || caseData.priority === 'urgent' ? 'destructive' : 'secondary'}>
            {caseData.priority}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Case Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {caseData.description && (
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-muted-foreground">{caseData.description}</p>
              </div>
            )}
            
            {caseData.courtLocation && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Court Location</p>
                  <p className="text-muted-foreground">{caseData.courtLocation}</p>
                </div>
              </div>
            )}

            {caseData.opposingParty && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Opposing Party</p>
                  <p className="text-muted-foreground">{caseData.opposingParty}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Opened</p>
                <p className="text-muted-foreground">
                  {new Date(caseData.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {caseData.progress !== undefined && caseData.progress !== null && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Case Progress</span>
                  <span className="font-medium">{caseData.progress}%</span>
                </div>
                <Progress value={caseData.progress} className="h-3" />
              </div>
            )}

            {caseData.nextAction && (
              <div className="p-4 rounded-md bg-muted">
                <p className="text-sm font-medium">Next Step</p>
                <p className="text-muted-foreground">{caseData.nextAction}</p>
                {caseData.nextActionDue && (
                  <p className="text-sm mt-2">
                    Due: {new Date(caseData.nextActionDue).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Have Questions?</CardTitle>
          <CardDescription>Contact your attorney about this case</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setLocation('/portal/messages')} data-testid="button-contact-attorney">
            Send Message
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
