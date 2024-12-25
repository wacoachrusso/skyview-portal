export function AccountInfo() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Account Information</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-400">Email</span>
          <span className="text-sm text-white">user@example.com</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-400">Plan</span>
          <span className="text-sm text-white">Free Trial</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-400">Queries Remaining</span>
          <span className="text-sm text-white">2</span>
        </div>
      </div>
    </div>
  );
}