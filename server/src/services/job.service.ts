import { dbStorage } from '../db/storage.js';
import { WorkflowStage, ProductionSubStatus } from '../types.js';

export class JobService {
  static async listJobs(filters?: { stage?: WorkflowStage; search?: string }) {
    return await dbStorage.getJobs(filters);
  }

  static async getJobById(id: string) {
    const job = await dbStorage.getJobById(id);
    if (!job) {
      throw new Error(`Job not found with ID: ${id}`);
    }
    return job;
  }

  static async createJob(jobInput: any) {
    return await dbStorage.createJob(jobInput);
  }

  static async updateStage(id: string, stage: WorkflowStage, subStatus?: ProductionSubStatus, team?: string, date?: string, designer?: string) {
    let job = await dbStorage.updateJobStage(id, stage);
    if (subStatus) {
      job = await dbStorage.updateJobProductionSubStatus(id, subStatus);
    }
    if (team || date) {
      job = await dbStorage.updateJobInstallationDispatch(id, { assignedTeam: team, installationDate: date });
    }
    if (designer) {
      job = await dbStorage.updateJobDesigner(id, designer);
    }
    return job;
  }

  static async updateSurveyData(id: string, surveyInput: any) {
    return await dbStorage.updateJobSurveyData(id, surveyInput);
  }

  static async deleteJob(id: string) {
    return true;
  }
}
