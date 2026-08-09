import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";

export interface BackButtonProps {
  to?: string;
  label?: string;
  onClick?: () => void;
  className?: string;
}

export function BackButton({ to, label = "Back", onClick, className }: BackButtonProps) {
  const navigate = useNavigate();

  function handleClick() {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(
        "group inline-flex items-center gap-1.5 rounded-lg border border-[#1e2638] bg-[#11151f]/80 px-2.5 py-1.5 text-xs font-medium text-[#8e98aa] transition-all hover:border-[#2a354c] hover:bg-[#161b28] hover:text-[#f0f3f8]",
        className
      )}
    >
      <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
      <span>{label}</span>
    </button>
  );
}

export default BackButton;
