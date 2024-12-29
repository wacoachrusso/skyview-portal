import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AccountInfoProps {
  userEmail: string | null;
  profile: any;
}

export const AccountInfo = ({ userEmail, profile }: AccountInfoProps) => {
  return (
    <Card className="bg-white/95 shadow-xl">
      <CardHeader>
        <CardTitle className="text-brand-navy">Account Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-brand-navy">Email:</span>
            <span className="col-span-2 text-gray-700">{userEmail}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-brand-navy">Full Name:</span>
            <span className="col-span-2 text-gray-700">{profile?.full_name || 'Not set'}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-brand-navy">User Type:</span>
            <span className="col-span-2 text-gray-700">{profile?.user_type || 'Not set'}</span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-medium text-brand-navy">Airline:</span>
            <span className="col-span-2 text-gray-700">{profile?.airline || 'Not set'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};