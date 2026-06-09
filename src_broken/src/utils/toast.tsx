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
      icon: <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
    }),
  
  error: (title: string, message?: string) => 
    hotToast.error(<ToastContent title={title} message={message} />, {
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
    }),
  
  warning: (title: string, message?: string) => hotToast(<ToastContent title={title} message={message} />, {
    duration: 5000,
    icon: <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />,
    style: {
      background: '#fff7ed',
      color: '#9a3412',
      border: '1px solid #fed7aa',
    }
  }),
  
  info: (title: string, message?: string) => hotToast(<ToastContent title={title} message={message} />, {
    duration: 4000,
    icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    style: {
      background: '#eff6ff',
      color: '#1e40af',
      border: '1px solid #bfdbfe',
    }
  }),
  
  dismiss: (id?: string) => hotToast.dismiss(id),
  
  loading: (title: string, message?: string) => hotToast.loading(<ToastContent title={title} message={message} />)
};
