import toast from 'react-hot-toast';

const defaultOptions = {
    duration: 3000,
    position: 'top-right',
    style: {
        borderRadius: '12px',
        background: '#fff',
        color: '#333',
        padding: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    },
};

export const showToast = {
    success: (message, options = {}) => {
        return toast.success(message, {
            ...defaultOptions,
            icon: '✅',
            ...options,
        });
    },

    error: (message, options = {}) => {
        return toast.error(message, {
            ...defaultOptions,
            icon: '❌',
            ...options,
        });
    },

    loading: (message, options = {}) => {
        return toast.loading(message, {
            ...defaultOptions,
            ...options,
        });
    },

    promise: (promise, messages) => {
        return toast.promise(
            promise,
            {
                loading: messages.loading || 'Loading...',
                success: messages.success || 'Success!',
                error: messages.error || 'Error occurred',
            },
            defaultOptions
        );
    },

    custom: (message, options = {}) => {
        return toast(message, {
            ...defaultOptions,
            ...options,
        });
    },

    dismiss: (toastId) => {
        toast.dismiss(toastId);
    },
};

export default showToast;
