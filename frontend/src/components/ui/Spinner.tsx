function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-gray-400 text-sm py-10 justify-center">
      <span className="w-4 h-4 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
      {label && <span>{label}</span>}
    </div>
  );
}

export default Spinner;
