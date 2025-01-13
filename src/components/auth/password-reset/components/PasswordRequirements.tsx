interface Requirement {
  met: boolean;
  text: string;
}

interface PasswordRequirementsProps {
  requirements: Requirement[];
}

export const PasswordRequirements = ({ requirements }: PasswordRequirementsProps) => {
  return (
    <div className="text-sm text-gray-600 mt-2">
      Password requirements:
      <div className="mt-1 space-y-1">
        {requirements.map((req, index) => (
          <div 
            key={index} 
            className={`flex items-center space-x-2 ${req.met ? 'text-green-500' : 'text-gray-500'}`}
          >
            <span className="text-xs">
              {req.met ? '✓' : '○'}
            </span>
            <span>{req.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};