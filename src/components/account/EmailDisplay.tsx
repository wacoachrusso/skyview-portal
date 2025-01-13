interface EmailDisplayProps {
  userEmail: string | null;
}

export const EmailDisplay = ({ userEmail }: EmailDisplayProps) => {
  return (
    <div className="grid grid-cols-3 items-center gap-4">
      <span className="font-medium text-brand-navy">Email:</span>
      <span className="col-span-2 text-gray-700">{userEmail}</span>
    </div>
  );
};