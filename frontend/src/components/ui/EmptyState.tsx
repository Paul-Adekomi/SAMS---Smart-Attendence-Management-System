import type { ReactNode } from "react";

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-56 gap-3 text-gray-400 bg-white rounded-2xl shadow-sm px-6">
      <span className="text-4xl">{icon}</span>
      <p className="text-sm font-semibold text-gray-500">{title}</p>
      {description && <p className="text-xs text-gray-400 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

export default EmptyState;
