import { z } from 'zod';
import { router, publicProcedure } from '../trpc.js';
import { JobController } from '../controllers/job.controller.js';

const dimensionsSchema = z.object({
  width: z.number(),
  height: z.number(),
  depth: z.number().optional(),
  unit: z.enum(["ft", "inch", "mm"])
});

const bomItemSchema = z.object({
  inventoryItemId: z.string(),
  name: z.string(),
  category: z.enum([
    "LED_MODULES",
    "POWER_SUPPLIES",
    "ACRYLIC_SHEETS",
    "ALUMINUM_PROFILES",
    "VINYL_FLEX",
    "CONTROLLERS",
    "FASTENERS"
  ]),
  quantity: z.number(),
  unit: z.string(),
  unitCost: z.number(),
  totalCost: z.number()
});

const financialsSchema = z.object({
  estimatedMaterialCost: z.number(),
  laborCost: z.number(),
  overheadCost: z.number(),
  markupPercent: z.number(),
  totalQuoteAmount: z.number(),
  depositPaid: z.number(),
  finalBalancePaid: z.number(),
  paymentStatus: z.enum(["PENDING_DEPOSIT", "PARTIAL", "PAID_IN_FULL"])
});

const sitePhotoSchema = z.object({
  id: z.string(),
  url: z.string(),
  caption: z.string(),
  uploadedAt: z.string()
});

const surveyInputSchema = z.object({
  scheduledDate: z.string().optional(),
  surveyorName: z.string().optional(),
  assignedDesignerName: z.string().optional(),
  surveyStatus: z.enum(["NOT_SCHEDULED", "SCHEDULED", "IN_PROGRESS", "COMPLETED"]).optional(),
  wallType: z.string().optional(),
  accessMethod: z.string().optional(),
  wallThicknessInches: z.number().optional(),
  electricalHookupAvailable: z.boolean().optional(),
  powerDistanceFt: z.number().optional(),
  sitePhotos: z.array(sitePhotoSchema).optional(),
  surveyNotes: z.string().optional(),
  revisionRequested: z.boolean().optional(),
  revisionNotes: z.string().optional(),
  revisionRequestedAt: z.string().optional()
});

export const jobsRouter = router({
  list: publicProcedure
    .input(z.object({
      stage: z.enum([
        "QUOTATION",
        "CUSTOMER_APPROVED",
        "SITE_SURVEY",
        "DESIGN_MOCKUP",
        "PRODUCTION",
        "INSTALLATION",
        "COMPLETED",
        "CANCELLED"
      ]).optional(),
      search: z.string().optional()
    }).optional())
    .query(async ({ input }) => {
      return await JobController.listJobs({
        stage: input?.stage as any,
        search: input?.search
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await JobController.getJobById(input.id);
    }),

  create: publicProcedure
    .input(z.object({
      title: z.string(),
      customerName: z.string(),
      companyName: z.string(),
      phone: z.string(),
      email: z.string(),
      signType: z.enum([
        "3D_ACRYLIC_CHANNEL_LETTERS",
        "NEON_FLEX",
        "LED_LIGHTBOX",
        "P10_OUTDOOR_MATRIX",
        "PYLON_SIGN",
        "VINYL_GRAPHICS"
      ]),
      dimensions: dimensionsSchema,
      installationType: z.enum(["INDOOR", "OUTDOOR_FACADE", "ROOFTOP", "PYLON_GROUND"]),
      siteAddress: z.string(),
      stage: z.enum([
        "QUOTATION",
        "CUSTOMER_APPROVED",
        "SITE_SURVEY",
        "DESIGN_MOCKUP",
        "PRODUCTION",
        "INSTALLATION",
        "COMPLETED",
        "CANCELLED"
      ]).default("QUOTATION"),
      priority: z.enum(["NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
      designMockupUrl: z.string().optional(),
      assignedDesignerName: z.string().optional(),
      assignedTeam: z.string().optional(),
      estimatedDate: z.string().optional(),
      notes: z.string().optional(),
      bom: z.array(bomItemSchema).default([]),
      financials: financialsSchema
    }))
    .mutation(async ({ input }) => {
      return await JobController.createJob(input);
    }),

  updateStage: publicProcedure
    .input(z.object({
      id: z.string(),
      stage: z.enum([
        "QUOTATION",
        "CUSTOMER_APPROVED",
        "SITE_SURVEY",
        "DESIGN_MOCKUP",
        "PRODUCTION",
        "INSTALLATION",
        "COMPLETED",
        "CANCELLED"
      ]),
      productionSubStatus: z.enum([
        "CNC_CUTTING",
        "LETTER_BENDING",
        "LED_WIRING",
        "TESTING_QC",
        "PACKAGING"
      ]).optional(),
      assignedTeam: z.string().optional(),
      assignedDesignerName: z.string().optional(),
      installationDate: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const { id, stage, productionSubStatus, assignedTeam, assignedDesignerName, installationDate } = input;
      return await JobController.updateStage(id, stage, productionSubStatus as any, assignedTeam, installationDate, assignedDesignerName);
    }),

  updateSurveyData: publicProcedure
    .input(z.object({
      id: z.string(),
      surveyData: surveyInputSchema
    }))
    .mutation(async ({ input }) => {
      return await JobController.updateSurveyData(input.id, input.surveyData);
    }),

  updateBOMAndFinancials: publicProcedure
    .input(z.object({
      id: z.string(),
      bom: z.array(bomItemSchema),
      financials: financialsSchema
    }))
    .mutation(async ({ input }) => {
      return await JobController.getJobById(input.id);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await JobController.deleteJob(input.id);
    })
});
