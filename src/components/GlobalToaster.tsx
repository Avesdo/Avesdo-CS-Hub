import { Toaster, ToastBar, toast as hotToast } from 'react-hot-toast';
import { X } from 'lucide-react';

export const GlobalToaster = () => {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        className: 'shadow-xl border rounded-lg max-w-sm',
        success: {
          duration: 4000,
          className: 'bg-green-50 text-green-900 border-green-200',
          style: {}, // clearing style as we use className
        },
        error: {
          duration: 8000,
          className: 'bg-red-50 text-red-900 border-red-200',
          style: {},
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t} style={{ ...t.style, padding: '8px 16px', alignItems: 'center' }}>
          {({ icon, message }) => (
            <>
              {icon}
              <div className="flex-1 ml-2">{message}</div>
              {t.type !== 'blank' && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    hotToast.dismiss(t.id);
                  }}
                  className="ml-4 opacity-50 hover:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-1 rounded-sm shrink-0"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};
