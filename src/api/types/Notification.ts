// Forma del JSON que devuelve el backend (NotificationResponse).
export interface NotificationResponse {
  id: number;
  userId: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}
