type BadgeTone = "green" | "gray" | "red" | "orange" | "primary";

const toneClasses: Record<BadgeTone, string> = {
  green: "bg-green-100 text-green-600",
  gray: "bg-gray-100 text-gray-400",
  red: "bg-red-100 text-red-500",
  orange: "bg-orange-100 text-orange-500",
  primary: "bg-primary/10 text-primary",
};

function Badge({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-max ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

export default Badge;
