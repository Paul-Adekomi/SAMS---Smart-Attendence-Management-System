import type { ReactNode } from "react";
import { FaTimes } from "react-icons/fa";

function Modal({
  title,
  onClose,
  children,
  maxWidth = "max-w-lg",
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div
      className="fixed inset-0 bg-dark/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-bold text-dark">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-dark cursor-pointer transition-colors"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
