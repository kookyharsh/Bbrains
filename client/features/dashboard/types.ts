export type RoleRow = {
  role?: { name?: string | null } | { name?: string | null }[] | null;
};

export type LeaderboardLikeEntry = {
  userId?: string;
  id?: string;
  rank?: number;
  score?: number;
  xp?: number;
  totalXp?: number;
  totalPoints?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  user?: {
    username?: string;
    userDetails?: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
  };
};

export interface TransformedLeaderboardEntry {
  id: string;
  rank: number;
  xp: number;
  points: number;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
}
