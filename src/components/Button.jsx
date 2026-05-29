import React from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-swg-teal text-white hover:bg-swg-blue disabled:bg-slate-300 disabled:text-slate-500",
  secondary:
    "border border-swg-line bg-white text-swg-ink hover:border-swg-teal hover:text-swg-blue disabled:text-slate-400",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-swg-ink disabled:text-slate-400",
};

export default function Button({
  children,
  className = "",
  icon: Icon,
  isLoading = false,
  variant = "primary",
  type = "button",
  ...props
}) {
  return (
    <button
      className={`swg-focus inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      type={type}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
