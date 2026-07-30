import { JobService } from '../services/job.service.js';
import { WorkflowStage, ProductionSubStatus } from '../types.js';

export class JobController {
  static async listJobs(filters?: { stage?: WorkflowStage; search?: string }) {
    return await JobService.listJobs(filters);
  }

  static async getJobById(id: string) {
    return await JobService.getJobById(id);
  }

  static async createJob(jobInput: any) {
    return await JobService.createJob(jobInput);
  }

  static async updateStage(id: string, stage: WorkflowStage, subStatus?: ProductionSubStatus, team?: string, date?: string, designer?: string) {
    return await JobService.updateStage(id, stage, subStatus, team, date, designer);
  }

  static async updateSurveyData(id: string, surveyInput: any) {
    return await JobService.updateSurveyData(id, surveyInput);
  }

  static async deleteJob(id: string) {
    return await JobService.deleteJob(id);
  }
}
