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
          style: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
          },
        },
        error: {
          duration: Infinity,
          style: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
          },
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t} style={{ ...t.style, padding: '8px 16px', alignItems: 'center' }}>
          {({ icon, message }) => (
            <>
              {icon}
              <div className="flex-1 ml-2">
                {message}
              </div>
              {t.type === 'error' && (
                  className="ml-4 opacity-50 hover:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00bdd9] focus-visible:ring-offset-1 rounded-sm shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    hotToast.dismiss(t.id);
                  }} 
                  className="ml-4 opacity-50 hover:opacity-100 transition-opacity focus:outline-none shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
                </button>
              )}
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};
