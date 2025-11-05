import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  /**
   * Icon component (from lucide-react)
   */
  icon: LucideIcon;
  /**
   * Button label
   */
  label: string;
  /**
   * Click handler
   */
  onClick?: () => void;
  /**
   * Disabled state (for Swap button)
   */
  disabled?: boolean;
}

/**
 * ActionButton component matching Figma design
 * Horizontal buttons with icon + text, equal width, outline style
 */
export function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex-1 h-9 px-3
        flex items-center justify-center gap-1.5
        border border-border rounded-lg
        text-sm font-medium leading-5
        ${
          disabled
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
        }
      `}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
