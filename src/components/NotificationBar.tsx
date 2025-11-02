import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/lib/notifications';
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NotificationBar: React.FC = () => {
  const { notifications, markAsRead } = useNotifications();
  const [currentNotification, setCurrentNotification] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  // Show the latest unread high priority notification
  useEffect(() => {
    const highPriorityUnread = notifications.find(
      n => !n.read && n.priority === 'high'
    );
    
    if (highPriorityUnread && (!currentNotification || currentNotification.id !== highPriorityUnread.id)) {
      setCurrentNotification(highPriorityUnread);
      setIsVisible(true);
      
      // Auto-hide after 10 seconds for non-critical notifications
      if (highPriorityUnread.type !== 'error') {
        setTimeout(() => {
          setIsVisible(false);
        }, 10000);
      }
    }
  }, [notifications, currentNotification]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const handleClick = () => {
    if (currentNotification) {
      markAsRead(currentNotification.id);
      if (currentNotification.actionUrl) {
        navigate(currentNotification.actionUrl);
      }
      setIsVisible(false);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentNotification) {
      markAsRead(currentNotification.id);
    }
    setIsVisible(false);
  };

  if (!isVisible || !currentNotification) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${getNotificationBgColor(currentNotification.type)}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div 
          className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleClick}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getNotificationIcon(currentNotification.type)}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">
                {currentNotification.title}
              </h4>
              <p className="text-xs opacity-90 truncate">
                {currentNotification.message}
              </p>
            </div>
            {currentNotification.actionUrl && (
              <span className="text-xs font-medium hidden sm:inline">
                Click to view →
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="p-1 h-6 w-6 hover:bg-black/10 ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBar;