
interface Requirement {
  met: boolean;
  text: string;
}

interface PasswordRequirementsProps {
  requirements: Requirement[];
}

export const PasswordRequirements = ({ requirements }: PasswordRequirementsProps) => {
  return (
    <div className="text-xs space-y-1 mt-2">
      {requirements.map((req, index) => (
        <div 
          key={index} 
          className={`flex items-center space-x-1 ${req.met ? 'text-green-500' : 'text-gray-400'}`}
        >
          <span>{req.met ? '✓' : '○'}</span>
          <span>{req.text}</span>
        </div>
      ))}
    </div>
  );
};
