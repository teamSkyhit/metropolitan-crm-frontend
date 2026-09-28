interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'Module coming soon' }: EmptyStateProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6 min-h-[400px] flex items-center justify-center border border-gray-200 border-dashed">
      <p className="text-gray-400 text-lg">{message}</p>
    </div>
  );
}
