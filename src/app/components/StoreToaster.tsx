import { Toaster } from 'sonner';

export function StoreToaster() {
  return (
    <Toaster
      position="top-right"
      closeButton
      toastOptions={{
        className: 'cozip-toast',
        style: {
          background: '#FFF9FB',
          border: '1px solid #F3D8DE',
          color: '#4A5D45',
        },
      }}
    />
  );
}