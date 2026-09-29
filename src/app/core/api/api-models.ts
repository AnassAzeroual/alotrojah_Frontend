// Mirror of backend resources. snake_case like the API. No `any` past this file.

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

export interface PageMeta {
  current_page: number;
  total: number;
  per_page: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export type Role = 'admin' | 'supervisor' | 'teacher' | 'guardian' | 'student' | 'board';
export type TeacherType = 'hifz' | 'murajaa' | 'both';

export interface CurrentUser {
  id: number;
  full_name: string;
  role: Role;
  center_id: number | null;
  teacher_type: TeacherType;
}

export interface LoginData {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: CurrentUser;
}

export interface User extends CurrentUser {
  email: string;
  phone: string | null;
  is_active: boolean;
}

export interface Center {
  id: number;
  name: string;
  city: string | null;
  groups_count?: number;
  students_count?: number;
}

export interface Group {
  id: number;
  name: string;
  center_id: number;
  level_id: number;
  capacity: number | null;
  schedule_days: string;
  is_active: boolean;
  teacher?: { id: number; full_name: string };
  students_count?: number;
}

export interface Guardian {
  id: number;
  full_name: string;
  phone: string | null;
  relation: string;
  students_count?: number;
}

export interface Student {
  id: number;
  full_name: string;
  center_id: number | null;
  group?: { id: number; name: string };
  level_id: number | null;
  guardian?: { id: number; full_name: string };
  gender: string | null;
  status: string;
  student_type: string | null;
  memorization_mode: 'surah' | 'thumn';
  start_hizb: number | null;
}

export interface ScoringModule {
  id: number;
  code: string;
  name_ar: string;
  max_points: number;
  scope: 'weekly' | 'murajaa';
  is_active: boolean;
  is_in_weekly_total: boolean;
  sort_order: number;
}

export interface SessionScore {
  id: number;
  student_id: number;
  session_id: number;
  module: { code: string; name_ar: string; max_points: number };
  score: number;
}
