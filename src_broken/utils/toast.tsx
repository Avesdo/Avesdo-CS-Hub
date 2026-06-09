import React from 'react';
import hotToast from 'react-hot-toast';
import { AlertTriangle, Info, Check, AlertCircle } from 'lucide-react';

const ToastContent = ({ title, message }: { title: string; message?: string }) => (
  <div className="flex flex-col gap-0.5 text-sm">
    <span className="font-semibold">{title}</span>
    {message && <span className="text-xs opacity-90">{message}</span>}
  </div>
);

export const toast = {
  success: (title: string, message?: string) => 
    hotToast.success(<ToastContent title={title} message={message} />, {
      icon: <Check className="w-5 h-5 text-green-600 shrink-0" />
    }),
  
  error: (title: string, message?: string) => 
    hotToast.error(<ToastContent title={title} message={message} />, {
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
    }),
  
  warning: (title: string, message?: string) => hotToast(<ToastContent title={title} message={message} />, {
    duration: 5000,
    icon: <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />,
    className: 'bg-orange-50 text-orange-900 border-orange-200 border',
    style: {}
  }),
  
  info: (title: string, message?: string) => hotToast(<ToastContent title={title} message={message} />, {
    duration: 4000,
    icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    className: 'bg-blue-50 text-blue-900 border-blue-200 border',
    style: {}
  }),
  
  dismiss: (id?: string) => hotToast.dismiss(id),
  
  loading: (title: string, message?: string) => hotToast.loading(<ToastContent title={title} message={message} />),

  promise: <T,>(
    promise: Promise<T>,
    msgs: { loading: string; success: string | ((data: T) => string); error: string | ((err: any) => string) }
  ) => {
    return hotToast.promise(promise, {
      loading: <ToastContent title={msgs.loading} />,
      success: (data) => {
        const title = typeof msgs.success === 'function' ? msgs.success(data) : msgs.success;
        return <ToastContent title={title} />;
      },
      error: (err) => {
        const title = typeof msgs.error === 'function' ? msgs.error(err) : msgs.error;
        return <ToastContent title={title} />;
      },
    }, {
      success: {
        icon: <Check className="w-5 h-5 text-green-600 shrink-0" />
      },
      error: {
        icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
      }
    });
  }
};
