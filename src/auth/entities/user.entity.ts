export interface User {
  id: number;
  email: string;
  password_hash: string;
  name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: number;
  email: string;
  name?: string;
  created_at: Date;
  updated_at: Date;
} 