export type Interest = { id: number; name: string };
export type Profile = {
  id: number;
  user_id: number;
  name: string;
  age: number;
  gender: 'woman' | 'man' | 'nonbinary';
  presentation: 'feminine' | 'masculine';
  bio: string;
  occupation: string;
  district: string;
  weekend: 'Adventure' | 'Creative' | 'Cozy';
  social: 'Balanced' | 'Outgoing' | 'Quiet';
  image: string;
  photos?: string[];
  interests: Interest[];
  preferences: {
    min_age: number;
    max_age: number;
    weekend: Profile['weekend'];
    social: Profile['social'];
    genders: Profile['gender'][];
  };
};
export type Candidate = Omit<Profile, 'interests'> & {
  interests: string;
  score: number;
  shared_count: number;
  shared_interests: string;
  interest_points: number;
  weekend_points: number;
  social_points: number;
  reciprocal_points: number;
  district_points: number;
  liked: number;
  saved: number;
};
export type Match = {
  id: number;
  other_id: number;
  name: string;
  image: string;
  photos?: string[];
  age: number;
  occupation: string;
  created_at: string;
  last_message: string | null;
};
export type Message = { id: number; sender_id: number; body: string; created_at: string };
