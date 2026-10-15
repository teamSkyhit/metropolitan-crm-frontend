interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'Module coming soon' }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-dashed border-[#ccd6e2] bg-white p-6 shadow-[0_5px_22px_rgba(15,38,68,0.04)]">
      <p className="text-base font-medium text-[#8491a3]">{message}</p>
    </div>
  );
}
