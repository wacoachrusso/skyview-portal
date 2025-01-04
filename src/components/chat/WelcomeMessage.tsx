export function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-white">Welcome to SkyGuide Contract Assistant</h1>
        <p className="text-gray-300">
          I'm here to help you understand your union contract. Please ask questions specifically about:
        </p>
        <ul className="text-gray-300 space-y-2">
          <li>• Contract terms and conditions</li>
          <li>• Work policies and procedures</li>
          <li>• Benefits and compensation details</li>
          <li>• Union rights and responsibilities</li>
        </ul>
        <p className="text-sm text-gray-400 mt-4">
          Note: This assistant is dedicated to contract-related inquiries only. For other topics, 
          please use appropriate alternative resources.
        </p>
      </div>
    </div>
  );
}