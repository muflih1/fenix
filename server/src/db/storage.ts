import { db } from './index.js';
import { jobs, inventoryItems, stockLogs, customers, companies, jobBomItems } from './schema.js';
import { eq, desc } from 'drizzle-orm';
import { Job, InventoryItem, StockLog, WorkflowStage, SignType, InventoryCategory } from '../types.js';

export interface CompanyRecord {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  createdAt: string;
}

class DrizzleStorage {
  private isConnected = false;
  private memoryFallback: {
    companies: CompanyRecord[];
    jobs: Job[];
    inventory: InventoryItem[];
    stockLogs: StockLog[];
  } = {
    companies: [],
    jobs: [],
    inventory: [],
    stockLogs: []
  };

  constructor() {
    this.initDatabase();
  }

  private async initDatabase() {
    try {
      await db.select().from(inventoryItems).limit(1);
      this.isConnected = true;
      console.log(' Successfully connected to PostgreSQL database via Drizzle ORM');

      const existingItems = await db.select().from(inventoryItems).limit(1);
      if (existingItems.length === 0) {
        await this.seedDb();
      }
    } catch (err) {
      console.warn(' PostgreSQL server not reachable on localhost:5432. Running with in-memory Drizzle sync fallback store.');
      this.isConnected = false;
      this.seedMemoryFallback();
    }
  }

  private async seedDb() {
    try {
      const defaultCompanies = [
        { id: 'COMP-101', name: 'Apex Lounge & Bar', phone: '+91 98765 43210', email: 'alex@apexbar.com', address: '742 Evergreen Terrace, Downtown' },
        { id: 'COMP-102', name: 'Urban Threads Fashion', phone: '+91 98765 88990', email: 'contact@urbanthreads.com', address: '120 Fashion Way, Suite 4B' },
        { id: 'COMP-103', name: 'Metro Health Clinic', phone: '+91 98765 44332', email: 'info@metrohealth.org', address: '500 Medical Center Blvd' }
      ];

      for (const comp of defaultCompanies) {
        await db.insert(companies).values(comp).onConflictDoNothing();
      }

      const defaultInventory: (typeof inventoryItems.$inferInsert)[] = [
        {
          id: 'INV-101',
          sku: 'LED-MOD-2835-W',
          name: 'Samsung 2835 3-LED Injection Module (White 6500K)',
          category: 'LED_MODULES',
          stockQuantity: 450,
          minReorderLevel: 100,
          unit: 'pcs',
          unitCostPrice: 35.00,
          sellingPrice: 65.00,
          supplier: 'LumiTech Opto Solutions',
          binLocation: 'Rack A-01',
        },
        {
          id: 'INV-102',
          sku: 'PSU-400W-12V',
          name: 'MeanWell 400W 12V IP67 Waterproof Power Supply',
          category: 'POWER_SUPPLIES',
          stockQuantity: 12,
          minReorderLevel: 5,
          unit: 'pcs',
          unitCostPrice: 2800.00,
          sellingPrice: 4500.00,
          supplier: 'PowerPulse Wholesale',
          binLocation: 'Shelf P-04',
        },
        {
          id: 'INV-103',
          sku: 'ACRYLIC-WHITE-3MM',
          name: 'Cast Opal White Acrylic Sheet (4ft x 8ft x 3mm)',
          category: 'ACRYLIC_SHEETS',
          stockQuantity: 8,
          minReorderLevel: 10,
          unit: 'sheets',
          unitCostPrice: 4500.00,
          sellingPrice: 7200.00,
          supplier: 'PolyPlast Materials',
          binLocation: 'Bay 3 Vertical',
        }
      ];

      for (const item of defaultInventory) {
        await db.insert(inventoryItems).values(item).onConflictDoNothing();
      }

      const defaultCustomer = {
        id: 'CUST-1001',
        name: 'Alex Rivera',
        companyId: 'COMP-101',
        phone: '+91 98765 43210',
        email: 'alex@apexbar.com',
      };
      await db.insert(customers).values(defaultCustomer).onConflictDoNothing();

      const defaultJob: typeof jobs.$inferInsert = {
        id: 'JOB-1001',
        title: 'Apex Lounge Exterior 3D LED Illuminated Facade Sign',
        companyId: 'COMP-101',
        customerId: defaultCustomer.id,
        signType: '3D_ACRYLIC_CHANNEL_LETTERS',
        width: 12,
        height: 4,
        unit: 'ft',
        installationType: 'OUTDOOR_FACADE',
        siteAddress: '742 Evergreen Terrace, Downtown',
        stage: 'PRODUCTION',
        productionSubStatus: 'LED_WIRING',
        priority: 'HIGH',
        notes: 'Backlit halo effect requested for main logo lettering.',
        assignedDesignerName: 'Elena Rostova',
        surveyScheduledDate: '2026-07-28',
        surveyorName: 'Jake Miller',
        surveyStatus: 'COMPLETED',
        wallType: 'Alucobond ACP Composite Panel',
        accessMethod: 'Boom Lift 20ft',
        wallThicknessInches: 4.5,
        electricalHookupAvailable: true,
        powerDistanceFt: 8,
        surveyNotes: 'Structural wall studs verified. Electrical conduit ready behind main entrance.',
        sitePhotosJson: JSON.stringify([
          { id: 'img-1', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?w=500', caption: 'Facade Entrance Wall View', uploadedAt: new Date().toISOString() },
          { id: 'img-2', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500', caption: 'Electrical Junction Box Proximity', uploadedAt: new Date().toISOString() }
        ]),
        estimatedMaterialCost: 35000.00,
        laborCost: 45000.00,
        overheadCost: 10000.00,
        markupPercent: 40,
        totalQuoteAmount: 126000.00,
        depositPaid: 63000.00,
        finalBalancePaid: 0,
        paymentStatus: 'PARTIAL',
      };
      await db.insert(jobs).values(defaultJob).onConflictDoNothing();

      console.log(' Initial PostgreSQL seed completed with Relational Joins & Site Surveys.');
    } catch (err) {
      console.error('Failed to seed PostgreSQL db:', err);
    }
  }

  private seedMemoryFallback() {
    const now = new Date().toISOString();

    this.memoryFallback.companies = [
      { id: 'COMP-101', name: 'Apex Lounge & Bar', phone: '+91 98765 43210', email: 'alex@apexbar.com', address: '742 Evergreen Terrace, Downtown', createdAt: now },
      { id: 'COMP-102', name: 'Urban Threads Fashion', phone: '+91 98765 88990', email: 'contact@urbanthreads.com', address: '120 Fashion Way, Suite 4B', createdAt: now },
      { id: 'COMP-103', name: 'Metro Health Clinic', phone: '+91 98765 44332', email: 'info@metrohealth.org', address: '500 Medical Center Blvd', createdAt: now }
    ];

    this.memoryFallback.inventory = [
      {
        id: 'INV-101',
        sku: 'LED-MOD-2835-W',
        name: 'Samsung 2835 3-LED Injection Module (White 6500K)',
        category: 'LED_MODULES',
        stockQuantity: 450,
        minReorderLevel: 100,
        unit: 'pcs',
        unitCostPrice: 35.00,
        sellingPrice: 65.00,
        supplier: 'LumiTech Opto Solutions',
        binLocation: 'Rack A-01',
        updatedAt: now
      }
    ];

    this.memoryFallback.jobs = [
      {
        id: 'JOB-1001',
        title: 'Apex Lounge Exterior 3D LED Illuminated Facade Sign',
        customerName: 'Alex Rivera',
        companyName: 'Apex Lounge & Bar',
        phone: '+91 98765 43210',
        email: 'alex@apexbar.com',
        signType: '3D_ACRYLIC_CHANNEL_LETTERS',
        dimensions: { width: 12, height: 4, unit: 'ft' },
        installationType: 'OUTDOOR_FACADE',
        siteAddress: '742 Evergreen Terrace, Downtown',
        stage: 'PRODUCTION',
        productionSubStatus: 'LED_WIRING',
        priority: 'HIGH',
        notes: 'Backlit halo effect requested for main logo lettering.',
        assignedDesignerName: 'Elena Rostova',
        surveyData: {
          scheduledDate: '2026-07-28',
          surveyorName: 'Jake Miller',
          assignedDesignerName: 'Elena Rostova',
          surveyStatus: 'COMPLETED',
          wallType: 'Alucobond ACP Composite Panel',
          accessMethod: 'Boom Lift 20ft',
          wallThicknessInches: 4.5,
          electricalHookupAvailable: true,
          powerDistanceFt: 8,
          surveyNotes: 'Structural wall studs verified. Electrical conduit ready behind main entrance.',
          sitePhotos: [
            { id: 'img-1', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?w=500', caption: 'Facade Entrance Wall View', uploadedAt: now },
            { id: 'img-2', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500', caption: 'Electrical Junction Box Proximity', uploadedAt: now }
          ]
        },
        bom: [],
        financials: {
          estimatedMaterialCost: 35000.00,
          laborCost: 45000.00,
          overheadCost: 10000.00,
          markupPercent: 40,
          totalQuoteAmount: 126000.00,
          depositPaid: 63000.00,
          finalBalancePaid: 0,
          paymentStatus: 'PARTIAL'
        },
        createdAt: now,
        updatedAt: now
      }
    ];

    this.memoryFallback.stockLogs = [
      {
        id: 'LOG-1001',
        inventoryItemId: 'INV-101',
        itemName: 'Samsung 2835 3-LED Injection Module (White 6500K)',
        type: 'OUTWARD_JOB_CONSUMPTION',
        quantityChanged: -120,
        jobId: 'JOB-1001',
        notes: 'Deducted for Apex Lounge 3D channel letter fabrication',
        timestamp: now
      }
    ];
  }

  // --- COMPANY REPOSITORY METHODS ---
  async getCompanies(search?: string): Promise<CompanyRecord[]> {
    if (this.isConnected) {
      try {
        const rows = await db.select().from(companies);
        let result = rows.map(r => ({
          id: r.id,
          name: r.name,
          phone: r.phone || undefined,
          email: r.email || undefined,
          address: r.address || undefined,
          taxId: r.taxId || undefined,
          createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString()
        }));

        if (search) {
          const s = search.toLowerCase();
          result = result.filter(c => c.name.toLowerCase().includes(s));
        }

        return result;
      } catch (err) {
        console.error('PostgreSQL query error in getCompanies:', err);
      }
    }

    let res = [...this.memoryFallback.companies];
    if (search) {
      const s = search.toLowerCase();
      res = res.filter(c => c.name.toLowerCase().includes(s));
    }
    return res;
  }

  async getOrCreateCompany(name: string, details?: { phone?: string; email?: string; address?: string }): Promise<CompanyRecord> {
    const existingList = await this.getCompanies();
    const matched = existingList.find(c => c.name.toLowerCase() === name.trim().toLowerCase());
    if (matched) return matched;

    const newId = `COMP-${Math.floor(100 + Math.random() * 900)}`;
    const newComp: typeof companies.$inferInsert = {
      id: newId,
      name: name.trim(),
      phone: details?.phone || null,
      email: details?.email || null,
      address: details?.address || null,
    };

    if (this.isConnected) {
      try {
        await db.insert(companies).values(newComp).onConflictDoNothing();
      } catch (err) {
        console.error('PostgreSQL insert error in getOrCreateCompany:', err);
      }
    }

    const created: CompanyRecord = {
      id: newId,
      name: name.trim(),
      phone: details?.phone,
      email: details?.email,
      address: details?.address,
      createdAt: new Date().toISOString()
    };
    this.memoryFallback.companies.unshift(created);
    return created;
  }

  // --- JOBS REPOSITORY METHODS (USING RELATIONAL SQL JOINS) ---
  async getJobs(filters?: { search?: string; stage?: WorkflowStage }): Promise<Job[]> {
    if (this.isConnected) {
      try {
        const rows = await db
          .select({
            job: jobs,
            customer: customers,
            company: companies,
          })
          .from(jobs)
          .leftJoin(customers, eq(jobs.customerId, customers.id))
          .leftJoin(companies, eq(jobs.companyId, companies.id));

        let result = rows.map(r => this.mapJoinedJobRecordToEntity(r.job, r.customer, r.company));
        
        if (filters?.stage && (filters.stage as string) !== 'ALL') {
          result = result.filter(j => j.stage === filters.stage);
        }
        if (filters?.search) {
          const s = filters.search.toLowerCase();
          result = result.filter(j => 
            j.id.toLowerCase().includes(s) ||
            j.title.toLowerCase().includes(s) ||
            j.customerName.toLowerCase().includes(s) ||
            (j.companyName && j.companyName.toLowerCase().includes(s))
          );
        }

        return result;
      } catch (err) {
        console.error('PostgreSQL query error in getJobs:', err);
      }
    }

    let res = [...this.memoryFallback.jobs];
    if (filters?.stage && (filters.stage as string) !== 'ALL') {
      res = res.filter(j => j.stage === filters.stage);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      res = res.filter(j => 
        j.id.toLowerCase().includes(s) ||
        j.title.toLowerCase().includes(s) ||
        j.customerName.toLowerCase().includes(s) ||
        (j.companyName && j.companyName.toLowerCase().includes(s))
      );
    }
    return res;
  }

  async getJobById(id: string): Promise<Job | null> {
    if (this.isConnected) {
      try {
        const rows = await db
          .select({
            job: jobs,
            customer: customers,
            company: companies,
          })
          .from(jobs)
          .leftJoin(customers, eq(jobs.customerId, customers.id))
          .leftJoin(companies, eq(jobs.companyId, companies.id))
          .where(eq(jobs.id, id))
          .limit(1);

        if (rows.length > 0) {
          return this.mapJoinedJobRecordToEntity(rows[0].job, rows[0].customer, rows[0].company);
        }
      } catch (err) {
        console.error('PostgreSQL query error in getJobById:', err);
      }
    }
    return this.memoryFallback.jobs.find(j => j.id === id) || null;
  }

  async createJob(jobData: any): Promise<Job> {
    const newId = `JOB-${Math.floor(1000 + Math.random() * 9000)}`;
    const custId = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;

    let companyId = jobData.companyId;
    let companyName = jobData.companyName;

    if (companyName && !companyId) {
      const comp = await this.getOrCreateCompany(companyName, {
        phone: jobData.phone,
        email: jobData.email,
        address: jobData.siteAddress
      });
      companyId = comp.id;
      companyName = comp.name;
    }

    const newJobRecord = {
      id: newId,
      title: jobData.title,
      companyId: companyId || null,
      customerId: custId,
      signType: jobData.signType,
      width: Number(jobData.dimensions.width),
      height: Number(jobData.dimensions.height),
      unit: jobData.dimensions.unit,
      installationType: jobData.installationType,
      siteAddress: jobData.siteAddress,
      stage: jobData.stage || 'QUOTATION',
      priority: jobData.priority || 'NORMAL',
      notes: jobData.notes || '',
      assignedDesignerName: jobData.assignedDesignerName || null,
      estimatedMaterialCost: Number(jobData.financials.estimatedMaterialCost),
      laborCost: Number(jobData.financials.laborCost),
      overheadCost: Number(jobData.financials.overheadCost),
      markupPercent: Number(jobData.financials.markupPercent),
      totalQuoteAmount: Number(jobData.financials.totalQuoteAmount),
      depositPaid: Number(jobData.financials.depositPaid || 0),
      finalBalancePaid: Number(jobData.financials.finalBalancePaid || 0),
      paymentStatus: jobData.financials.paymentStatus || 'PENDING_DEPOSIT',
    };

    if (this.isConnected) {
      try {
        await db.insert(customers).values({
          id: custId,
          name: jobData.customerName,
          companyId: companyId || null,
          phone: jobData.phone || '',
          email: jobData.email || '',
        }).onConflictDoNothing();

        await db.insert(jobs).values(newJobRecord);
      } catch (err) {
        console.error('PostgreSQL insert error in createJob:', err);
      }
    }

    const createdJob = this.mapJoinedJobRecordToEntity(
      {
        ...newJobRecord,
        productionSubStatus: null,
        assignedTeam: null,
        installationDate: null,
        surveyScheduledDate: null,
        surveyorName: null,
        surveyStatus: 'NOT_SCHEDULED',
        wallType: null,
        accessMethod: null,
        wallThicknessInches: null,
        electricalHookupAvailable: true,
        powerDistanceFt: null,
        sitePhotosJson: null,
        surveyNotes: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: custId,
        name: jobData.customerName,
        companyId: companyId || null,
        phone: jobData.phone || '',
        email: jobData.email || '',
        createdAt: new Date()
      },
      companyName ? {
        id: companyId || 'COMP-101',
        name: companyName,
        phone: jobData.phone,
        email: jobData.email,
        address: jobData.siteAddress,
        taxId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } : null
    );

    this.memoryFallback.jobs.unshift(createdJob);
    return createdJob;
  }

  async updateJobStage(id: string, stage: WorkflowStage): Promise<Job | null> {
    if (this.isConnected) {
      try {
        await db.update(jobs).set({ stage, updatedAt: new Date() }).where(eq(jobs.id, id));
      } catch (err) {
        console.error('PostgreSQL update error in updateJobStage:', err);
      }
    }

    const memJob = this.memoryFallback.jobs.find(j => j.id === id);
    if (memJob) {
      memJob.stage = stage;
      memJob.updatedAt = new Date().toISOString();
      return memJob;
    }
    return this.getJobById(id);
  }

  async updateJobDesigner(id: string, assignedDesignerName: string): Promise<Job | null> {
    if (this.isConnected) {
      try {
        await db.update(jobs).set({ assignedDesignerName, updatedAt: new Date() }).where(eq(jobs.id, id));
      } catch (err) {
        console.error('PostgreSQL update error in updateJobDesigner:', err);
      }
    }

    const memJob = this.memoryFallback.jobs.find(j => j.id === id);
    if (memJob) {
      memJob.assignedDesignerName = assignedDesignerName;
      memJob.updatedAt = new Date().toISOString();
      return memJob;
    }
    return this.getJobById(id);
  }

  async updateJobProductionSubStatus(id: string, productionSubStatus: string): Promise<Job | null> {
    if (this.isConnected) {
      try {
        await db.update(jobs).set({ productionSubStatus, updatedAt: new Date() }).where(eq(jobs.id, id));
      } catch (err) {
        console.error('PostgreSQL update error in updateJobProductionSubStatus:', err);
      }
    }

    const memJob = this.memoryFallback.jobs.find(j => j.id === id);
    if (memJob) {
      memJob.productionSubStatus = productionSubStatus as any;
      memJob.updatedAt = new Date().toISOString();
      return memJob;
    }
    return this.getJobById(id);
  }

  async updateJobInstallationDispatch(id: string, dispatch: { assignedTeam?: string; installationDate?: string }): Promise<Job | null> {
    if (this.isConnected) {
      try {
        await db.update(jobs).set({ 
          assignedTeam: dispatch.assignedTeam, 
          installationDate: dispatch.installationDate, 
          updatedAt: new Date() 
        }).where(eq(jobs.id, id));
      } catch (err) {
        console.error('PostgreSQL update error in updateJobInstallationDispatch:', err);
      }
    }

    const memJob = this.memoryFallback.jobs.find(j => j.id === id);
    if (memJob) {
      if (dispatch.assignedTeam) memJob.assignedTeam = dispatch.assignedTeam;
      if (dispatch.installationDate) memJob.installationDate = dispatch.installationDate;
      memJob.updatedAt = new Date().toISOString();
      return memJob;
    }
    return this.getJobById(id);
  }

  async updateJobSurveyData(id: string, surveyInput: any): Promise<Job | null> {
    const updatePayload: any = {
      updatedAt: new Date()
    };

    if (surveyInput.scheduledDate !== undefined) updatePayload.surveyScheduledDate = surveyInput.scheduledDate;
    if (surveyInput.surveyorName !== undefined) updatePayload.surveyorName = surveyInput.surveyorName;
    if (surveyInput.assignedDesignerName !== undefined) updatePayload.assignedDesignerName = surveyInput.assignedDesignerName;
    if (surveyInput.surveyStatus !== undefined) updatePayload.surveyStatus = surveyInput.surveyStatus;
    if (surveyInput.wallType !== undefined) updatePayload.wallType = surveyInput.wallType;
    if (surveyInput.accessMethod !== undefined) updatePayload.accessMethod = surveyInput.accessMethod;
    if (surveyInput.wallThicknessInches !== undefined) updatePayload.wallThicknessInches = Number(surveyInput.wallThicknessInches);
    if (surveyInput.electricalHookupAvailable !== undefined) updatePayload.electricalHookupAvailable = Boolean(surveyInput.electricalHookupAvailable);
    if (surveyInput.powerDistanceFt !== undefined) updatePayload.powerDistanceFt = Number(surveyInput.powerDistanceFt);
    if (surveyInput.surveyNotes !== undefined) updatePayload.surveyNotes = surveyInput.surveyNotes;
    if (surveyInput.sitePhotos !== undefined) updatePayload.sitePhotosJson = JSON.stringify(surveyInput.sitePhotos);

    if (this.isConnected) {
      try {
        await db.update(jobs).set(updatePayload).where(eq(jobs.id, id));
      } catch (err) {
        console.error('PostgreSQL update error in updateJobSurveyData:', err);
      }
    }

    const memJob = this.memoryFallback.jobs.find(j => j.id === id);
    if (memJob) {
      if (surveyInput.assignedDesignerName) memJob.assignedDesignerName = surveyInput.assignedDesignerName;
      memJob.surveyData = {
        ...memJob.surveyData,
        ...surveyInput
      };
      memJob.updatedAt = new Date().toISOString();
      return memJob;
    }
    return this.getJobById(id);
  }

  // --- INVENTORY REPOSITORY METHODS ---
  async getInventory(filters?: { search?: string; category?: string; lowStockOnly?: boolean }): Promise<InventoryItem[]> {
    if (this.isConnected) {
      try {
        let result = await db.select().from(inventoryItems);

        if (filters?.category && filters.category !== 'ALL') {
          result = result.filter(i => i.category === filters.category);
        }
        if (filters?.lowStockOnly) {
          result = result.filter(i => i.stockQuantity <= i.minReorderLevel);
        }
        if (filters?.search) {
          const s = filters.search.toLowerCase();
          result = result.filter(i => 
            i.name.toLowerCase().includes(s) ||
            i.sku.toLowerCase().includes(s) ||
            i.supplier.toLowerCase().includes(s)
          );
        }

        return result.map(i => this.mapInventoryRecordToEntity(i));
      } catch (err) {
        console.error('PostgreSQL query error in getInventory:', err);
      }
    }

    let res = [...this.memoryFallback.inventory];
    if (filters?.category && filters.category !== 'ALL') {
      res = res.filter(i => i.category === filters.category);
    }
    if (filters?.lowStockOnly) {
      res = res.filter(i => i.stockQuantity <= i.minReorderLevel);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      res = res.filter(i => 
        i.name.toLowerCase().includes(s) ||
        i.sku.toLowerCase().includes(s) ||
        i.supplier.toLowerCase().includes(s)
      );
    }
    return res;
  }

  async createInventoryItem(itemData: any): Promise<InventoryItem> {
    const newId = `INV-${Math.floor(100 + Math.random() * 900)}`;

    const newItemRecord = {
      id: newId,
      sku: itemData.sku || `SKU-${Date.now().toString().slice(-6)}`,
      name: itemData.name,
      category: itemData.category,
      stockQuantity: Number(itemData.stockQuantity || 0),
      minReorderLevel: Number(itemData.minReorderLevel || 10),
      unit: itemData.unit || 'pcs',
      unitCostPrice: Number(itemData.unitCostPrice || 0),
      sellingPrice: Number(itemData.sellingPrice || 0),
      supplier: itemData.supplier || 'General Supplier',
      binLocation: itemData.binLocation || 'Rack A-01',
    };

    if (this.isConnected) {
      try {
        await db.insert(inventoryItems).values(newItemRecord);
      } catch (err) {
        console.error('PostgreSQL insert error in createInventoryItem:', err);
      }
    }

    const createdItem = this.mapInventoryRecordToEntity({
      ...newItemRecord,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    this.memoryFallback.inventory.unshift(createdItem);

    await this.logStockMovement({
      itemId: newId,
      itemName: itemData.name,
      type: 'INWARD_PURCHASE',
      quantityChanged: Number(itemData.stockQuantity || 0),
      notes: 'Initial material stock registration',
    });

    return createdItem;
  }

  async updateStockQuantity(id: string, newQty: number, notes?: string): Promise<InventoryItem | null> {
    const existing = await this.getInventoryItemById(id);
    if (!existing) return null;

    const diff = newQty - existing.stockQuantity;

    if (this.isConnected) {
      try {
        await db.update(inventoryItems).set({ stockQuantity: newQty, updatedAt: new Date() }).where(eq(inventoryItems.id, id));
      } catch (err) {
        console.error('PostgreSQL update error in updateStockQuantity:', err);
      }
    }

    const memItem = this.memoryFallback.inventory.find(i => i.id === id);
    if (memItem) {
      memItem.stockQuantity = newQty;
      memItem.updatedAt = new Date().toISOString();
    }

    await this.logStockMovement({
      itemId: id,
      itemName: existing.name,
      type: diff >= 0 ? 'INWARD_PURCHASE' : 'ADJUSTMENT',
      quantityChanged: diff,
      notes: notes || `Stock quantity adjusted manually from ${existing.stockQuantity} to ${newQty}`,
    });

    return memItem || existing;
  }

  async deleteInventoryItem(id: string): Promise<boolean> {
    if (this.isConnected) {
      try {
        await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
      } catch (err) {
        console.error('PostgreSQL delete error in deleteInventoryItem:', err);
      }
    }

    this.memoryFallback.inventory = this.memoryFallback.inventory.filter(i => i.id !== id);
    return true;
  }

  async getStockLogs(): Promise<StockLog[]> {
    if (this.isConnected) {
      try {
        const rows = await db.select().from(stockLogs).orderBy(desc(stockLogs.timestamp));
        return rows.map(r => ({
          id: r.id,
          inventoryItemId: r.itemId,
          itemName: r.itemName,
          type: r.type as any,
          quantityChanged: r.quantityChanged,
          jobId: r.jobId || undefined,
          notes: r.notes,
          timestamp: r.timestamp ? r.timestamp.toISOString() : new Date().toISOString()
        }));
      } catch (err) {
        console.error('PostgreSQL query error in getStockLogs:', err);
      }
    }
    return this.memoryFallback.stockLogs;
  }

  private async logStockMovement(data: { itemId: string; itemName: string; type: string; quantityChanged: number; jobId?: string; notes: string }) {
    const logId = `LOG-${Math.floor(1000 + Math.random() * 9000)}`;

    if (this.isConnected) {
      try {
        await db.insert(stockLogs).values({
          id: logId,
          itemId: data.itemId,
          itemName: data.itemName,
          type: data.type,
          quantityChanged: data.quantityChanged,
          jobId: data.jobId || null,
          notes: data.notes,
        });
      } catch (err) {
        console.error('PostgreSQL insert error in logStockMovement:', err);
      }
    }

    this.memoryFallback.stockLogs.unshift({
      id: logId,
      inventoryItemId: data.itemId,
      itemName: data.itemName,
      type: data.type as any,
      quantityChanged: data.quantityChanged,
      jobId: data.jobId,
      notes: data.notes,
      timestamp: new Date().toISOString()
    });
  }

  private async getInventoryItemById(id: string): Promise<InventoryItem | null> {
    const items = await this.getInventory();
    return items.find(i => i.id === id) || null;
  }

  // --- RELATIONAL JOIN MAPPER ---
  private mapJoinedJobRecordToEntity(
    jobRec: typeof jobs.$inferSelect,
    custRec?: typeof customers.$inferSelect | null,
    compRec?: typeof companies.$inferSelect | null
  ): Job {
    const customerName = custRec ? custRec.name : 'Unknown Customer';
    const companyName = compRec ? compRec.name : (custRec ? custRec.name : 'Individual');
    const phone = custRec ? custRec.phone : (compRec?.phone || '');
    const email = custRec ? (custRec.email || '') : (compRec?.email || '');

    return {
      id: jobRec.id,
      title: jobRec.title,
      customerName,
      companyName,
      phone,
      email,
      signType: jobRec.signType as SignType,
      dimensions: {
        width: jobRec.width,
        height: jobRec.height,
        unit: jobRec.unit as any
      },
      installationType: jobRec.installationType as any,
      siteAddress: jobRec.siteAddress,
      stage: jobRec.stage as WorkflowStage,
      productionSubStatus: jobRec.productionSubStatus as any,
      priority: jobRec.priority as any,
      notes: jobRec.notes || undefined,
      assignedDesignerName: jobRec.assignedDesignerName || undefined,
      assignedTeam: jobRec.assignedTeam || undefined,
      installationDate: jobRec.installationDate || undefined,
      surveyData: {
        scheduledDate: jobRec.surveyScheduledDate || undefined,
        surveyorName: jobRec.surveyorName || undefined,
        assignedDesignerName: jobRec.assignedDesignerName || undefined,
        surveyStatus: (jobRec.surveyStatus as any) || 'NOT_SCHEDULED',
        wallType: jobRec.wallType || undefined,
        accessMethod: jobRec.accessMethod || undefined,
        wallThicknessInches: jobRec.wallThicknessInches || undefined,
        electricalHookupAvailable: jobRec.electricalHookupAvailable ?? true,
        powerDistanceFt: jobRec.powerDistanceFt || undefined,
        sitePhotos: jobRec.sitePhotosJson ? JSON.parse(jobRec.sitePhotosJson) : [],
        surveyNotes: jobRec.surveyNotes || undefined
      },
      bom: [],
      financials: {
        estimatedMaterialCost: jobRec.estimatedMaterialCost,
        laborCost: jobRec.laborCost,
        overheadCost: jobRec.overheadCost,
        markupPercent: jobRec.markupPercent,
        totalQuoteAmount: jobRec.totalQuoteAmount,
        depositPaid: jobRec.depositPaid,
        finalBalancePaid: jobRec.finalBalancePaid,
        paymentStatus: jobRec.paymentStatus as any
      },
      createdAt: jobRec.createdAt ? jobRec.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: jobRec.updatedAt ? jobRec.updatedAt.toISOString() : new Date().toISOString(),
    };
  }

  private mapInventoryRecordToEntity(rec: typeof inventoryItems.$inferSelect): InventoryItem {
    return {
      id: rec.id,
      sku: rec.sku,
      name: rec.name,
      category: rec.category as InventoryCategory,
      stockQuantity: rec.stockQuantity,
      minReorderLevel: rec.minReorderLevel,
      unit: rec.unit,
      unitCostPrice: rec.unitCostPrice,
      sellingPrice: rec.sellingPrice || undefined,
      supplier: rec.supplier,
      binLocation: rec.binLocation,
      updatedAt: rec.updatedAt ? rec.updatedAt.toISOString() : new Date().toISOString(),
    };
  }
}

export const dbStore = new DrizzleStorage();

export const dbStorage = {
  getCompanies: (search?: string) => dbStore.getCompanies(search),
  getOrCreateCompany: (name: string, details?: any) => dbStore.getOrCreateCompany(name, details),
  getJobs: (filters?: any) => dbStore.getJobs(filters),
  getJobById: (id: string) => dbStore.getJobById(id),
  createJob: (data: any) => dbStore.createJob(data),
  updateJobStage: (id: string, stage: any) => dbStore.updateJobStage(id, stage),
  updateJobDesigner: (id: string, designer: string) => dbStore.updateJobDesigner(id, designer),
  updateJobProductionSubStatus: (id: string, subStatus: any) => dbStore.updateJobProductionSubStatus(id, subStatus),
  updateJobInstallationDispatch: (id: string, dispatch: any) => dbStore.updateJobInstallationDispatch(id, dispatch),
  updateJobSurveyData: (id: string, surveyInput: any) => dbStore.updateJobSurveyData(id, surveyInput),
  getInventory: (filters?: any) => dbStore.getInventory(filters),
  createInventoryItem: (data: any) => dbStore.createInventoryItem(data),
  updateStockQuantity: (id: string, qty: number, notes?: string) => dbStore.updateStockQuantity(id, qty, notes),
  deleteInventoryItem: (id: string) => dbStore.deleteInventoryItem(id),
  getStockLogs: () => dbStore.getStockLogs(),
};

export const dbData = dbStorage;
