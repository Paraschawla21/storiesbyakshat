import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out focus-visible:outline-offset-4 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "sweep bg-marigold text-linen hover:bg-marigold-dark hover:shadow-[0_6px_20px_-6px_rgba(201,138,59,0.6)] active:scale-[0.98]",
  secondary:
    "bg-transparent text-ink border border-ink/25 hover:border-marigold hover:text-marigold-dark hover:-translate-y-px",
  ghost: "bg-transparent text-ink hover:text-marigold-dark underline-offset-4 hover:underline",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  href,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
