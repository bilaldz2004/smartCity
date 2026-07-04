export function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const baseStyles = "font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "text-white bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 shadow-indigo-900/30",
    secondary: "text-slate-700 bg-white border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400",
    danger: "text-white bg-red-600 hover:bg-red-700",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
