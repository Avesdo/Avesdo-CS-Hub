import React from 'react';
import hotToast from 'react-hot-toast';
import { AlertTriangle, Info, Check, AlertCircle, Loader2 } from 'lucide-react';

const ToastContent = ({ title, message }: { title: string; message?: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-sm font-semibold text-slate-800">{title}</span>
    {message && <span className="text-xs font-medium text-slate-500">{message}</span>}
  </div>
);

const baseToastClass =
  '!bg-white/95 !backdrop-blur-md border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl';

export const toast = {
  success: (title: string, message?: string) =>
    hotToast.success(<ToastContent title={title} message={message} />, {
      icon: (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Check className="h-4 w-4" />
        </div>
      ),
      className: baseToastClass,
      style: { background: 'unset', color: 'unset' },
    }),

  error: (title: string, message?: string) =>
    hotToast.error(<ToastContent title={title} message={message} />, {
      icon: (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertCircle className="h-4 w-4" />
        </div>
      ),
      className: baseToastClass,
      style: { background: 'unset', color: 'unset' },
    }),

  warning: (title: string, message?: string) =>
    hotToast(<ToastContent title={title} message={message} />, {
      duration: 5000,
      icon: (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <AlertTriangle className="h-4 w-4" />
        </div>
      ),
      className: baseToastClass,
      style: { background: 'unset', color: 'unset' },
    }),

  info: (title: string, message?: string) =>
    hotToast(<ToastContent title={title} message={message} />, {
      duration: 4000,
      icon: (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Info className="h-4 w-4" />
        </div>
      ),
      className: baseToastClass,
      style: { background: 'unset', color: 'unset' },
    }),

  dismiss: (id?: string) => hotToast.dismiss(id),

  loading: (title: string, message?: string) =>
    hotToast.loading(<ToastContent title={title} message={message} />, {
      icon: (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ),
      className: baseToastClass,
      style: { background: 'unset', color: 'unset' },
    }),

  promise: <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    }
  ) => {
    return hotToast.promise(
      promise,
      {
        loading: <ToastContent title={msgs.loading} />,
        success: (data) => {
          const title = typeof msgs.success === 'function' ? msgs.success(data) : msgs.success;
          return <ToastContent title={title} />;
        },
        error: (err) => {
          const title = typeof msgs.error === 'function' ? msgs.error(err) : msgs.error;
          return <ToastContent title={title} />;
        },
      },
      {
        loading: {
          icon: (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ),
          className: baseToastClass,
          style: { background: 'unset', color: 'unset' },
        },
        success: {
          icon: (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check className="h-4 w-4" />
            </div>
          ),
          className: baseToastClass,
          style: { background: 'unset', color: 'unset' },
        },
        error: {
          icon: (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          ),
          className: baseToastClass,
          style: { background: 'unset', color: 'unset' },
        },
      }
    );
  },
};
