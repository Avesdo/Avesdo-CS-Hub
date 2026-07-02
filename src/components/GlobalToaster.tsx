import { Toaster, ToastBar, toast as hotToast } from 'react-hot-toast';
import { X } from 'lucide-react';

export const GlobalToaster = () => {
  return (
    <Toaster
      position="bottom-right"
      containerStyle={{ zIndex: 'var(--z-toast)' }}
      toastOptions={{
        duration: 4000,
        className:
          '!bg-white/95 !backdrop-blur-md border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl !text-slate-800',
        success: {
          duration: 4000,
          className:
            '!bg-white/95 !backdrop-blur-md border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl !text-slate-800',
          style: { background: 'unset', color: 'unset' },
        },
        error: {
          duration: 8000,
          className:
            '!bg-white/95 !backdrop-blur-md border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl !text-slate-800',
          style: { background: 'unset', color: 'unset' },
        },
        loading: {
          duration: Infinity,
          className:
            '!bg-white/95 !backdrop-blur-md border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl !text-slate-800',
          style: { background: 'unset', color: 'unset' },
          iconTheme: {
            primary: '#00bdd9',
            secondary: '#ffffff',
          },
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
