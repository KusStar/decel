export interface OrgData {
  id: string;
  name: string;
  pro: boolean;
  members: Member[];
  projects: Project[];
  features: Features;
  createdAt: string;
  updatedAt: string;
}

export interface Features {
}

export interface Member {
  user: User;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  git: null;
  productionDeployment: null;
  hasProductionDeployment: boolean;
  organizationId: string;
  envVars: any[];
  createdAt: string;
  updatedAt: string;
}
