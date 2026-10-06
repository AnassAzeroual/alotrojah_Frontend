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

export type Role = 'admin' | 'supervisor' | 'teacher' | 'student' | 'board';
export type TeacherType = 'hifz' | 'murajaa' | 'both';

export interface CurrentUser {
  id: number;
  full_name: string;
  role: Role;
  center_id: number | null;
  /** Resolved by /auth/me + login (T4) so the header chip needs no extra request. */
  center_name?: string | null;
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

/** Self-registration roles (admin excluded — admin accounts are created directly). */
export type RegisterRole = 'supervisor' | 'teacher' | 'student' | 'board';

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role: RegisterRole;
  phone: string;
  teacher_type?: TeacherType;
  birth_date?: string;
  gender?: 'male' | 'female';
}

/** Waiting-room entry (admin listing). */
export interface RegistrationRequest {
  id: number;
  full_name: string;
  email: string;
  role: RegisterRole;
  teacher_type: TeacherType;
  phone: string;
  birth_date: string | null;
  gender: 'male' | 'female' | null;
  requested_at: string;
}

export interface Center {
  id: number;
  name: string;
  city: string | null;
  address?: string | null;
  phone?: string | null;
  manager_name?: string | null;
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

export interface Student {
  id: number;
  full_name: string;
  center_id: number | null;
  group?: { id: number; name: string };
  level_id: number | null;
  gender: string | null;
  status: string;
  student_type: string | null;
  memorization_mode: 'surah' | 'thumn';
  start_hizb: number | null;
}

/** PUT /groups/{id} — every field optional (backend rules are `sometimes`). */
export interface UpdateGroupPayload {
  name?: string;
  level_id?: number;
  teacher_id?: number | null;
  academic_year?: string | null;
  capacity?: number | null;
  schedule_days?: string;
  is_active?: boolean;
}

/** POST /groups — name/center/level required (backend StoreGroupRequest);
 * the server re-scopes center_id to the caller's own center for non-admins. */
export interface CreateGroupPayload {
  name: string;
  center_id: number | null;
  level_id: number;
  teacher_id?: number | null;
  capacity?: number | null;
  schedule_days?: string;
}

/** POST /students */
export interface CreateStudentPayload {
  full_name: string;
  center_id?: number | null;
  group_id?: number | null;
  level_id?: number | null;
  birth_date?: string | null;
  gender?: 'male' | 'female' | null;
  status?: string;
  student_type?: string | null;
  memorization_mode?: 'surah' | 'thumn';
  start_hizb?: number | null;
  notes?: string | null;
}

/** PUT /students/{id} — every field optional (backend rules are `sometimes`). */
export interface UpdateStudentPayload {
  full_name?: string;
  group_id?: number | null;
  level_id?: number | null;
  birth_date?: string | null;
  gender?: 'male' | 'female' | null;
  status?: string;
  student_type?: string | null;
  memorization_mode?: 'surah' | 'thumn';
  start_hizb?: number | null;
  notes?: string | null;
}

export interface ScoringModule {
  id: number;
  code: string;
  name_ar: string;
  center_id?: number | null;
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

export type Breakdown = Record<string, number>;

export interface GroupBreakdowns {
  status?: Breakdown;
  gender?: Breakdown;
  student_type?: Breakdown;
  memorization_mode?: Breakdown;
}

export interface GroupStatsRow {
  id: number;
  name: string;
  center_id: number;
  level: { id: number; name_ar: string } | null;
  teacher: {
    id: number;
    full_name: string;
    phone: string | null;
    teacher_type: 'hifz' | 'murajaa' | 'both';
  } | null;
  academic_year: string | null;
  schedule_days: string;
  is_active: boolean;
  capacity: number | null;
  students_count: number;
  fill_pct: number | null;
  avg_score: number | null;
  attendance_pct: number | null;
  thumn_total: number;
  /** PHP serialises an empty array as [] instead of {} */
  breakdown: GroupBreakdowns | [];
}

export interface GroupStats {
  season: { id: number } | null;
  season_name: string | null;
  kpis: {
    groups: number;
    students: number;
    avg_score: number | null;
    attendance_pct: number | null;
    fill_pct: number | null;
  };
  breakdown: GroupBreakdowns;
  groups: GroupStatsRow[];
}

export interface GroupDetailStudent {
  id: number;
  full_name: string;
  gender: string | null;
  status: string;
  student_type: string | null;
  memorization_mode: 'surah' | 'thumn';
  start_hizb: number | null;
  birth_date: string | null;
  enrollment_date: string | null;
  level_id: number | null;
  notes: string | null;
  avg_score: number | null;
  attendance_pct: number | null;
  thumn_total: number;
}

export interface GroupDetail {
  season_name: string | null;
  group: GroupStatsRow;
  breakdown: GroupBreakdowns;
  trend: { week: number; avg_score: number }[];
  students: GroupDetailStudent[];
}

export interface CreateUserPayload {
  full_name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string | null;
  center_id?: number | null;
  teacher_type?: TeacherType;
}

export interface UpdateUserPayload {
  full_name?: string;
  email?: string;
  password?: string | null;
  role?: Role;
  phone?: string | null;
  center_id?: number | null;
  teacher_type?: TeacherType;
  is_active?: boolean;
}
