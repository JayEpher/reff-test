export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface Activity {
  id: string;
  name: string;
  type: 'halloween' | 'team' | 'checkin' | 'mini-game';
  startTime: string;
  endTime: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}
