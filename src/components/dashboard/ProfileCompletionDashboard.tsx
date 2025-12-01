import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, TrendingUp, Lock, Unlock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MissingField {
  field: string;
  label: string;
  weight: number;
}

export default function ProfileCompletionDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [missingFields, setMissingFields] = useState<MissingField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileCompletion();
    }
  }, [user, profile]);

  const fetchProfileCompletion = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      const { percentage, missing } = calculateCompletion(data);
      setCompletionPercentage(percentage);
      setMissingFields(missing);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = (profileData: any) => {
    const fields = [
      { field: 'first_name', label: 'First Name', weight: 5 },
      { field: 'last_name', label: 'Last Name', weight: 5 },
      { field: 'phone_number', label: 'Phone Number', weight: 5 },
      { field: 'date_of_birth', label: 'Date of Birth', weight: 5 },
      { field: 'gender', label: 'Gender', weight: 5 },
      { field: 'marital_status', label: 'Marital Status', weight: 5 },
      { field: 'address', label: 'Address', weight: 10 },
      { field: 'state_of_origin', label: 'State of Origin', weight: 5 },
      { field: 'local_government', label: 'Local Government', weight: 5 },
      { field: 'nationality', label: 'Nationality', weight: 5 },
      { field: 'occupation', label: 'Occupation', weight: 5 },
      { field: 'employment_status', label: 'Employment Status', weight: 5 },
      { field: 'monthly_income', label: 'Monthly Income', weight: 5 },
      { field: 'id_type', label: 'ID Type', weight: 5 },
      { field: 'id_number', label: 'ID Number', weight: 5 },
      { field: 'next_of_kin_name', label: 'Next of Kin Name', weight: 5 },
      { field: 'next_of_kin_phone', label: 'Next of Kin Phone', weight: 5 },
      { field: 'next_of_kin_relationship', label: 'Next of Kin Relationship', weight: 5 },
    ];

    let totalWeight = 0;
    let completedWeight = 0;
    const missing: MissingField[] = [];

    fields.forEach(({ field, label, weight }) => {
      totalWeight += weight;
      if (profileData[field] && profileData[field] !== '') {
        completedWeight += weight;
      } else {
        missing.push({ field, label, weight });
      }
    });

    const percentage = Math.round((completedWeight / totalWeight) * 100);
    return { percentage, missing };
  };

  const getStatusColor = () => {
    if (completionPercentage >= 70) return 'text-green-600';
    if (completionPercentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusMessage = () => {
    if (completionPercentage >= 70) return 'Profile Complete - All Features Unlocked!';
    if (completionPercentage >= 40) return 'Almost There - Keep Going!';
    return 'Profile Incomplete - Complete to Unlock Features';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Profile Completion</CardTitle>
            <CardDescription className={`text-lg font-semibold mt-1 ${getStatusColor()}`}>
              {getStatusMessage()}
            </CardDescription>
          </div>
          {completionPercentage >= 70 ? (
            <Unlock className="h-12 w-12 text-green-600" />
          ) : (
            <Lock className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Progress Circle and Percentage */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg className="transform -rotate-90 w-40 h-40">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-muted"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * completionPercentage) / 100}
                className={completionPercentage >= 70 ? 'text-green-600' : 'text-primary'}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold">{completionPercentage}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={completionPercentage} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0%</span>
            <span className="font-semibold text-yellow-600">70% (Target)</span>
            <span>100%</span>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Benefits at 70% Completion
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              {completionPercentage >= 70 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-sm">
                <strong>Property Purchase:</strong> Unlock the ability to buy properties and land
              </span>
            </li>
            <li className="flex items-start gap-2">
              {completionPercentage >= 70 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-sm">
                <strong>Documentation Access:</strong> Apply for property documentation services
              </span>
            </li>
            <li className="flex items-start gap-2">
              {completionPercentage >= 70 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-sm">
                <strong>Payment Plans:</strong> Access flexible payment and installment options
              </span>
            </li>
            <li className="flex items-start gap-2">
              {completionPercentage >= 70 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-sm">
                <strong>Priority Support:</strong> Get faster response times and dedicated assistance
              </span>
            </li>
          </ul>
        </div>

        {/* Missing Fields */}
        {missingFields.length > 0 && completionPercentage < 70 && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Missing Information ({missingFields.length} fields)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {missingFields.slice(0, 9).map((field) => (
                <Badge
                  key={field.field}
                  variant="outline"
                  className="justify-center py-2 text-xs"
                >
                  {field.label}
                </Badge>
              ))}
            </div>
            {missingFields.length > 9 && (
              <p className="text-sm text-muted-foreground text-center">
                +{missingFields.length - 9} more fields
              </p>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={() => navigate('/profile')}
          className="w-full"
          size="lg"
          variant={completionPercentage >= 70 ? 'outline' : 'default'}
        >
          {completionPercentage >= 70 ? 'View Profile' : 'Complete Your Profile'}
        </Button>
      </CardContent>
    </Card>
  );
}
