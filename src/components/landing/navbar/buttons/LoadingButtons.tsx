interface LoadingButtonsProps {
  isMobile: boolean;
}

export const LoadingButtons = ({ isMobile }: LoadingButtonsProps) => {
  if (isMobile) {
    return (
      <div className="w-full py-2">
        <div className="h-9 bg-gray-700/20 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="h-9 w-20 bg-gray-700/20 animate-pulse rounded"></div>
      <div className="h-9 w-20 bg-gray-700/20 animate-pulse rounded"></div>
    </div>
  );
};