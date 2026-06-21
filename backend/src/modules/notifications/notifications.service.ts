export type NotificationMessage = {
  userId: string;
  title: string;
  body: string;
};

export class NotificationsService {
  async send(message: NotificationMessage) {
    console.log("notification", message);
  }
}

export const notificationsService = new NotificationsService();
