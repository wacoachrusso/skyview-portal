
interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800">
      <p>{message}</p>
    </div>
  );
};
