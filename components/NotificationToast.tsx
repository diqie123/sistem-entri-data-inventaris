import React, { useEffect } from 'react';
import { Notification } from '../types';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon } from './Icons';

interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const icons = {
  success: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
  warning: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />,
  info: <InformationCircleIcon className="h-6 w-6 text-blue-500" />,
  error: <XCircleIcon className="h-6 w-6 text-red-500" />,
};

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
  const { id, type, message } = notification;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [id, onDismiss]);

  return (
    <div className="max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black dark:ring-white/10 ring-opacity-5 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icons[type]}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onDismiss(id)}
              className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
