interface PickaxeIconProps {
  className?: string;
}

export function PickaxeIcon({ className = 'h-5 w-5' }: PickaxeIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M16.293 2.293a1 1 0 0 1 1.414 0l4 4a1 1 0 0 1 0 1.414l-2 2a1 1 0 0 1-1.414 0l-.586-.586-8.5 8.5.586.586a1 1 0 0 1 0 1.414l-2 2a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414l2-2a1 1 0 0 1 1.414 0l.586.586 8.5-8.5-.586-.586a1 1 0 0 1 0-1.414l2-2Z" />
    </svg>
  );
}
