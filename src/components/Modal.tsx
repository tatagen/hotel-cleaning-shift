import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  return (
    <div
      className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 px-3 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer text-xs font-bold flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            閉じる
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
