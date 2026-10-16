import React from 'react';
import { useCrm } from '../context/CrmContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useCrm();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start gap-3 bg-white animate-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? 'border-emerald-200 ring-1 ring-emerald-500/15'
                : isWarning
                ? 'border-amber-200 ring-1 ring-amber-500/15'
                : 'border-blue-200 ring-1 ring-blue-500/15'
            }`}
          >
            <div className={`p-1 rounded-lg shrink-0 ${
              isSuccess
                ? 'bg-emerald-50 text-emerald-600'
                : isWarning
                ? 'bg-amber-50 text-amber-600'
                : 'bg-blue-50 text-blue-600'
            }`}>
              {isSuccess ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : isWarning ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1 text-xs">
              <h4 className="font-bold text-slate-800">{toast.title}</h4>
              <p className="text-slate-500 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
