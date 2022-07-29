export interface InfoData {
  user: User;
  organizations: Organization[];
}

export interface Organization {
  id: string;
  name: null | string;
  pro: boolean;
  features: Features;
  createdAt: string;
  updatedAt: string;
}

interface Features {
}

interface User {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
  githubId: number;
  isBlocked: boolean;
  isAdmin: boolean;
  pro: boolean;
  features: any[];
  updatedAt: string;
  createdAt: string;
}
