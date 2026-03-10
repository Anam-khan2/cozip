import { toast } from 'sonner';

const sharedStyle = {
  borderRadius: '1.25rem',
  boxShadow: '0 18px 44px rgba(122, 144, 112, 0.16)',
  fontFamily: 'Inter, sans-serif',
};

export function showSuccessToast(message: string, description?: string) {
  toast.success(message, {
    description,
    style: {
      ...sharedStyle,
      background: '#F3FBF4',
      border: '1px solid #CDE7D1',
      color: '#30513A',
    },
  });
}

export function showErrorToast(message: string, description?: string) {
  toast.error(message, {
    description,
    style: {
      ...sharedStyle,
      background: '#FFF4F6',
      border: '1px solid #F4CDD6',
      color: '#7A3F52',
    },
  });
}

export function showInfoToast(message: string, description?: string) {
  toast(message, {
    description,
    style: {
      ...sharedStyle,
      background: '#FFFDF7',
      border: '1px solid #E8DDC8',
      color: '#4A5D45',
    },
  });
}