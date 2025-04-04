
interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
      <p>{message}</p>
    </div>
  );
};
