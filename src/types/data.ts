// deno-lint-ignore-file no-explicit-any no-empty-interface
export interface DataItem {
  id: string;
  name: string;
  type: string;
  git: Git | null;
  productionDeployment: ProductionDeployment | null;
  hasProductionDeployment: boolean;
  organizationId: string;
  organization: Organization;
  envVars: any[];
  createdAt: string;
  updatedAt: string;
}

interface Git {
  repository: Repository;
  entrypoint: string;
  productionBranch: string;
  createdAt: string;
  updatedAt: string;
}

interface Repository {
  id: number;
  owner: string;
  name: string;
}

interface Organization {
  id: string;
  name: null;
  pro: boolean;
  features: Features;
  createdAt: string;
  updatedAt: string;
}

interface Features {
}

interface ProductionDeployment {
  id: string;
  url: string;
  domainMappings: DomainMapping[];
  relatedCommit: RelatedCommit;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  envVars: any[];
  isBlocked: boolean;
}

interface DomainMapping {
  domain: string;
  createdAt: string;
  updatedAt: string;
}

interface RelatedCommit {
  hash: string;
  message: string;
  authorName: string;
  authorEmail: string;
  authorGithubUsername: string;
  url: string;
}
