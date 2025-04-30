interface ConversationTitleProps {
  title: string;
}

export function ConversationTitle({ title }: ConversationTitleProps) {
  return (
    <span className="text-sm font-medium text-white truncate max-w-[180px]">
      {title}
    </span>
  );
}