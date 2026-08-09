import type { Deployment, Project } from "../types/domain.js";

class InMemoryStore {
  projects = new Map<string, Project>();
  deployments = new Map<string, Deployment>();

  upsertProject(project: Project) {
    this.projects.set(project.id, project);
  }

  getProject(id: string) {
    return this.projects.get(id);
  }

  findProjectByName(name: string) {
    return [...this.projects.values()].find((p) => p.name === name);
  }

  listProjects() {
    return [...this.projects.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  upsertDeployment(deployment: Deployment) {
    this.deployments.set(deployment.id, deployment);
  }

  getDeployment(id: string) {
    return this.deployments.get(id);
  }

  listDeployments() {
    return [...this.deployments.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export const store = new InMemoryStore();
