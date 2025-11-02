import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/lib/notifications';
import { Bell, Plus, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const NotificationTester: React.FC = () => {
  const { addNotification, notifications, unreadCount, markAllAsRead, clearAll } = useNotifications();

  const testNotifications = [
    {
      title: 'Assignment Submitted',
      message: 'Your Math homework has been submitted successfully',
      type: 'success' as const,
      priority: 'medium' as const,
      actionUrl: '/student/assignments'
    },
    {
      title: 'Class Reminder',
      message: 'Physics class starts in 15 minutes in Room 201',
      type: 'warning' as const,
      priority: 'high' as const,
      actionUrl: '/student/schedule'
    },
    {
      title: 'New Message',
      message: 'You have a new message from Prof. Johnson about your project',
      type: 'info' as const,
      priority: 'medium' as const,
      actionUrl: '/student/messages'
    },
    {
      title: 'Payment Overdue',
      message: 'Your tuition payment is overdue. Please pay immediately',
      type: 'error' as const,
      priority: 'high' as const,
      actionUrl: '/student/payments'
    }
  ];

  const addTestNotification = (notification: any) => {
    addNotification(notification);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto m-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification System Tester
        </CardTitle>
        <CardDescription>
          Test the dynamic notification system. Current notifications: {notifications.length} | Unread: {unreadCount}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {testNotifications.map((notification, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start h-auto p-3"
              onClick={() => addTestNotification(notification)}
            >
              <div className="flex items-start gap-2">
                {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />}
                {notification.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />}
                {notification.type === 'info' && <Info className="w-4 h-4 text-blue-500 mt-0.5" />}
                {notification.type === 'error' && <XCircle className="w-4 h-4 text-red-500 mt-0.5" />}
                <div className="text-left">
                  <div className="font-medium text-sm">{notification.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All Read ({unreadCount})
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAll}
            disabled={notifications.length === 0}
          >
            Clear All ({notifications.length})
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• High priority notifications appear in the top notification bar</p>
          <p>• All notifications appear in the bell icon dropdown in the header</p>
          <p>• Click on notifications to navigate to relevant pages</p>
          <p>• Notifications are automatically generated on login based on user role</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationTester;