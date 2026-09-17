import { FaCircleCheck, FaCircleExclamation } from "react-icons/fa6";

type AlertProps = {
  type: "error" | "success";
  message: string;
  className?: string;
};

function Alert({ type, message, className = "" }: AlertProps) {
  if (!message) return null;
  const isError = type === "error";
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 text-sm px-4 py-3 rounded-xl ${
        isError ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
      } ${className}`}
    >
      {isError ? (
        <FaCircleExclamation className="mt-0.5 shrink-0" />
      ) : (
        <FaCircleCheck className="mt-0.5 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}

export default Alert;
