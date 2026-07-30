import React, { useState } from 'react';
import { Dialog } from './ui/Dialog';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { ConfirmModal } from './ui/ConfirmModal';
import { trpc } from '../utils/trpc';
import { useAuth } from '../context/AuthContext';
import { Job, WorkflowStage, ProductionSubStatus, SitePhoto } from '../../../server/src/types';
import { 
  Wrench, 
  Truck, 
  CheckCircle2, 
  DollarSign, 
  Layers, 
  Trash2, 
  Plus, 
  PackageCheck,
  Upload,
  Ruler,
  FileCheck,
  Calendar,
  Camera,
  MapPin,
  Sparkles
} from 'lucide-react';

interface JobDetailModalProps {
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const STAGES: { label: string; value: WorkflowStage }[] = [
  { label: '1. Quotation', value: 'QUOTATION' },
  { label: '2. Customer Approved', value: 'CUSTOMER_APPROVED' },
  { label: '3. Site Survey', value: 'SITE_SURVEY' },
  { label: '4. Design & CAD', value: 'DESIGN_MOCKUP' },
  { label: '5. Production', value: 'PRODUCTION' },
  { label: '6. Installation', value: 'INSTALLATION' },
  { label: '7. Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const SUB_STATUSES: { label: string; value: ProductionSubStatus }[] = [
  { label: 'CNC / Laser Cutting Substrate', value: 'CNC_CUTTING' },
  { label: 'Acrylic Channel Bending', value: 'LETTER_BENDING' },
  { label: 'LED Wiring & Soldering', value: 'LED_WIRING' },
  { label: 'Power Supply & QC Testing', value: 'TESTING_QC' },
  { label: 'Packaging & Prep for Transport', value: 'PACKAGING' },
];

const SAMPLE_PHOTO_PRESETS = [
  { url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?w=500', caption: 'Facade Front View' },
  { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500', caption: 'Electrical Breaker Panel' },
  { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500', caption: 'Wall Mounting Studs' }
];

export function JobDetailModal({ jobId, isOpen, onClose }: JobDetailModalProps) {
  const utils = trpc.useUtils();
  const { currentPersona, hasPermission } = useAuth();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const { data: job, isLoading } = trpc.jobs.getById.useQuery(
    { id: jobId! },
    { enabled: !!jobId && isOpen }
  );

  const { data: inventory = [] } = trpc.inventory.list.useQuery(
    {},
    { enabled: isOpen }
  );

  const updateStageMutation = trpc.jobs.updateStage.useMutation({
    onSuccess: () => {
      utils.jobs.getById.invalidate({ id: jobId! });
      utils.jobs.list.invalidate();
      utils.inventory.list.invalidate();
      utils.analytics.getDashboardMetrics.invalidate();
    }
  });

  const updateSurveyMutation = trpc.jobs.updateSurveyData.useMutation({
    onSuccess: () => {
      utils.jobs.getById.invalidate({ id: jobId! });
      utils.jobs.list.invalidate();
    }
  });

  const updateBOMMutation = trpc.jobs.updateBOMAndFinancials.useMutation({
    onSuccess: () => {
      utils.jobs.getById.invalidate({ id: jobId! });
      utils.jobs.list.invalidate();
      utils.inventory.list.invalidate();
    }
  });

  const deleteMutation = trpc.jobs.delete.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      utils.analytics.getDashboardMetrics.invalidate();
      onClose();
    }
  });

  // Local state
  const [selectedInvId, setSelectedInvId] = useState('');
  const [addQty, setAddQty] = useState(1);
  const [assignedCrew, setAssignedCrew] = useState('');
  const [installDate, setInstallDate] = useState('');
  const [depositAmount, setDepositAmount] = useState(0);
  const [mockupFile, setMockupFile] = useState<string | null>(null);

  // Survey Form Local State
  const [surveyDate, setSurveyDate] = useState('');
  const [surveyorName, setSurveyorName] = useState('');
  const [assignedDesignerName, setAssignedDesignerName] = useState('');
  const [measuredWidth, setMeasuredWidth] = useState(12);
  const [measuredHeight, setMeasuredHeight] = useState(4);
  const [measuredUnit, setMeasuredUnit] = useState<'ft' | 'inch' | 'mm'>('ft');
  const [wallType, setWallType] = useState('');
  const [accessMethod, setAccessMethod] = useState('');
  const [wallThickness, setWallThickness] = useState(4);
  const [powerDistance, setPowerDistance] = useState(10);
  const [surveyNotes, setSurveyNotes] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');

  if (!isOpen || !jobId) return null;

  const canAdvanceStage = hasPermission('ADVANCE_STAGE');
  const canViewFinancials = hasPermission('VIEW_FINANCIALS');
  const canEditFinancials = hasPermission('EDIT_FINANCIALS');
  const canUpdateProduction = hasPermission('UPDATE_PRODUCTION_SUBSTATUS');
  const canManageDispatch = hasPermission('MANAGE_DISPATCH');
  const canDeleteItem = hasPermission('DELETE_ITEM');
  const canUploadMockups = hasPermission('UPLOAD_MOCKUPS');
  const canUpdateSiteSpecs = hasPermission('UPDATE_SITE_SPECS');

  const surveyData = job?.surveyData || {};
  const currentPhotos: SitePhoto[] = surveyData.sitePhotos || [];

  const handleStageChange = (newStage: WorkflowStage) => {
    if (!canAdvanceStage) return;
    updateStageMutation.mutate({
      id: jobId,
      stage: newStage
    });
  };

  const handleSubStatusChange = (subStatus: ProductionSubStatus) => {
    if (!canUpdateProduction) return;
    updateStageMutation.mutate({
      id: jobId,
      stage: 'PRODUCTION',
      productionSubStatus: subStatus
    });
  };

  const handleDispatchSave = () => {
    if (!canManageDispatch) return;
    updateStageMutation.mutate({
      id: jobId,
      stage: job?.stage || 'INSTALLATION',
      assignedTeam: assignedCrew || job?.assignedTeam,
      installationDate: installDate || job?.installationDate
    });
  };

  const handleSaveSurvey = () => {
    updateSurveyMutation.mutate({
      id: jobId,
      surveyData: {
        scheduledDate: surveyDate || surveyData.scheduledDate,
        surveyorName: surveyorName || surveyData.surveyorName || currentPersona.name,
        assignedDesignerName: assignedDesignerName || surveyData.assignedDesignerName || 'Elena Rostova',
        surveyStatus: 'COMPLETED',
        wallType: wallType || surveyData.wallType,
        accessMethod: accessMethod || surveyData.accessMethod,
        wallThicknessInches: Number(wallThickness) || surveyData.wallThicknessInches,
        powerDistanceFt: Number(powerDistance) || surveyData.powerDistanceFt,
        surveyNotes: surveyNotes || surveyData.surveyNotes,
        sitePhotos: currentPhotos
      }
    });
  };

  const handleAddSamplePhoto = (preset: { url: string; caption: string }) => {
    const newPhoto: SitePhoto = {
      id: `img-${Date.now()}`,
      url: preset.url,
      caption: photoCaption || preset.caption,
      uploadedAt: new Date().toISOString()
    };

    updateSurveyMutation.mutate({
      id: jobId,
      surveyData: {
        ...surveyData,
        sitePhotos: [...currentPhotos, newPhoto]
      }
    });
    setPhotoCaption('');
  };

  const handleDeletePhoto = (photoId: string) => {
    const updatedPhotos = currentPhotos.filter(p => p.id !== photoId);
    updateSurveyMutation.mutate({
      id: jobId,
      surveyData: {
        ...surveyData,
        sitePhotos: updatedPhotos
      }
    });
  };

  const handleAddBOMItem = () => {
    if (!job || !selectedInvId) return;
    const invItem = inventory.find((i: any) => i.id === selectedInvId);
    if (!invItem) return;

    const existingIndex = job.bom.findIndex((b: any) => b.inventoryItemId === selectedInvId);
    let updatedBOM = [...job.bom];

    if (existingIndex >= 0) {
      const current = updatedBOM[existingIndex];
      const newQty = current.quantity + addQty;
      updatedBOM[existingIndex] = {
        ...current,
        quantity: newQty,
        totalCost: Math.round((newQty * current.unitCost) * 100) / 100
      };
    } else {
      updatedBOM.push({
        inventoryItemId: invItem.id,
        name: invItem.name,
        category: invItem.category,
        quantity: addQty,
        unit: invItem.unit,
        unitCost: invItem.unitCostPrice,
        totalCost: Math.round((addQty * invItem.unitCostPrice) * 100) / 100
      });
    }

    const newMaterialCost = updatedBOM.reduce((sum: number, item: any) => sum + item.totalCost, 0);
    const subtotal = newMaterialCost + job.financials.laborCost + job.financials.overheadCost;
    const newTotalQuote = subtotal * (1 + job.financials.markupPercent / 100);

    updateBOMMutation.mutate({
      id: job.id,
      bom: updatedBOM,
      financials: {
        ...job.financials,
        estimatedMaterialCost: Math.round(newMaterialCost * 100) / 100,
        totalQuoteAmount: Math.round(newTotalQuote * 100) / 100
      }
    });

    setSelectedInvId('');
    setAddQty(1);
  };

  const handleRemoveBOMItem = (invId: string) => {
    if (!job) return;
    const updatedBOM = job.bom.filter((b: any) => b.inventoryItemId !== invId);
    const newMaterialCost = updatedBOM.reduce((sum: number, item: any) => sum + item.totalCost, 0);
    const subtotal = newMaterialCost + job.financials.laborCost + job.financials.overheadCost;
    const newTotalQuote = subtotal * (1 + job.financials.markupPercent / 100);

    updateBOMMutation.mutate({
      id: job.id,
      bom: updatedBOM,
      financials: {
        ...job.financials,
        estimatedMaterialCost: Math.round(newMaterialCost * 100) / 100,
        totalQuoteAmount: Math.round(newTotalQuote * 100) / 100
      }
    });
  };

  const handleRecordPayment = (type: 'deposit' | 'balance') => {
    if (!job || !canEditFinancials) return;
    let newDeposit = job.financials.depositPaid;
    let newBalance = job.financials.finalBalancePaid;

    if (type === 'deposit') {
      newDeposit = depositAmount > 0 ? depositAmount : Math.round(job.financials.totalQuoteAmount * 0.5);
    } else {
      newBalance = Math.max(0, job.financials.totalQuoteAmount - newDeposit);
    }

    let status: 'PENDING_DEPOSIT' | 'PARTIAL' | 'PAID_IN_FULL' = 'PENDING_DEPOSIT';
    if (newDeposit + newBalance >= job.financials.totalQuoteAmount) {
      status = 'PAID_IN_FULL';
    } else if (newDeposit > 0) {
      status = 'PARTIAL';
    }

    updateBOMMutation.mutate({
      id: job.id,
      bom: job.bom,
      financials: {
        ...job.financials,
        depositPaid: newDeposit,
        finalBalancePaid: newBalance,
        paymentStatus: status
      }
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={job ? `${job.id} - ${job.title}` : 'Job Details'}
      description={job ? `${job.companyName || job.customerName} • ${job.siteAddress}` : ''}
      maxWidth="4xl"
    >
      {isLoading || !job ? (
        <div className="py-12 text-center text-slate-500 dark:text-zinc-400">Loading job details...</div>
      ) : (
        <div className="space-y-6">
          {/* Top Status & Stage Pipeline Stepper */}
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] p-4 space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-zinc-400">Current Stage:</span>
                <Badge variant={job.stage.toLowerCase() as any}>
                  {job.stage.replace('_', ' ')}
                </Badge>
                {job.priority !== 'NORMAL' && (
                  <Badge variant={job.priority.toLowerCase() as any}>
                    {job.priority} PRIORITY
                  </Badge>
                )}
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400">
                Created: <span className="text-slate-900 dark:text-zinc-200 font-semibold">{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Stage Selector Buttons (Only if permitted) */}
            {canAdvanceStage ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 pt-1">
                {STAGES.map((s) => {
                  const isActive = job.stage === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => handleStageChange(s.value)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-yellow-400 text-black font-bold shadow-xs' 
                          : 'bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-zinc-400 pt-1 italic">
                Stage progression is managed by Front Office / Shop Supervisors.
              </div>
            )}
          </div>

          {/* Main Grid: Job Details, Site Visit, Specs & Financials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Left 2 Cols: Details, Specs, Site Survey Visit & Photos */}
            <div className="md:col-span-2 space-y-4">
              {/* Specs & Dimensions */}
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] p-4 space-y-2 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400 flex items-center gap-1.5">
                  <Layers className="h-4 w-4" /> Signage Specifications
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm pt-1">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 block">Sign Type</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-200">{job.signType.replace(/_/g, ' ')}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 block">Dimensions</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-200">
                      {job.dimensions.width} x {job.dimensions.height} {job.dimensions.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 block">Mounting Type</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-200">{job.installationType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 block">Customer</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-200">{job.customerName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 block">Phone</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-200">{job.phone}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 block">Email</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-200">{job.email || 'N/A'}</span>
                  </div>
                </div>
                {job.notes && (
                  <div className="pt-2 text-xs text-slate-600 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800">
                    <span className="font-semibold text-slate-900 dark:text-zinc-200">Notes:</span> {job.notes}
                  </div>
                )}
              </div>

              {/* SITE SURVEY VISIT, INSPECTION & PHOTO UPLOADER (VISIBLE TO PERMITTED ROLES) */}
              {canUpdateSiteSpecs ? (
                <div className="rounded-xl border border-amber-300 dark:border-yellow-400/40 bg-amber-500/5 p-4 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400 flex items-center gap-1.5">
                      <Ruler className="h-4 w-4" /> Site Visit Inspection, Measurements & Photos
                    </h4>
                    <Badge variant={surveyData.surveyStatus === 'COMPLETED' ? 'completed' : 'amber'}>
                      {surveyData.surveyStatus || 'NOT_SCHEDULED'}
                    </Badge>
                  </div>

                  {/* Ultra-Simple Site Survey Form: Multiple Photos + Description + Assign Designer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <Input
                      label="Site Survey Supervisor"
                      value={surveyorName || surveyData.surveyorName || 'Dave Henderson'}
                      onChange={(e) => setSurveyorName(e.target.value)}
                      placeholder="e.g. Dave Henderson"
                    />
                    <Input
                      label="Assign Lead Designer *"
                      value={assignedDesignerName || surveyData.assignedDesignerName || 'Elena Rostova'}
                      onChange={(e) => setAssignedDesignerName(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                      Site Survey Description & Field Inspection Notes *
                    </label>
                    <textarea
                      rows={3}
                      value={surveyNotes || surveyData.surveyNotes || ''}
                      onChange={(e) => setSurveyNotes(e.target.value)}
                      placeholder="e.g. Measured facade 12ft x 4ft. ACP panel wall mounting. Boom lift required for 20ft height. Conduit ready 8ft away."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  {/* Multiple Site Photos Upload & Gallery */}
                  <div className="space-y-3 pt-2 border-t border-amber-500/20">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400 flex items-center gap-1.5">
                      <Camera className="h-4 w-4" /> Upload Site Inspection Photos ({currentPhotos.length})
                    </span>

                    {/* Photo Preset Uploader */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
                      <Input
                        label="Photo Caption Tag"
                        value={photoCaption}
                        onChange={(e) => setPhotoCaption(e.target.value)}
                        placeholder="e.g. Main Facade Entrance View"
                      />
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="text-[11px] text-slate-400 block self-center">Upload Preset Photo:</span>
                        {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddSamplePhoto(preset)}
                            icon={<Upload className="h-3 w-3 text-amber-600 dark:text-yellow-400" />}
                          >
                            + {preset.caption}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Photo Gallery Grid */}
                    {currentPhotos.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                        {currentPhotos.map((photo) => (
                          <div key={photo.id} className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-900 group">
                            <img src={photo.url} alt={photo.caption} className="w-full h-24 object-cover" />
                            <div className="p-1.5 text-[10px] font-semibold text-white bg-slate-950/80 truncate">
                              {photo.caption}
                            </div>
                            <button
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="absolute top-1 right-1 p-1 rounded bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Delete photo"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button size="sm" variant="primary" onClick={handleSaveSurvey}>
                    Save Site Inspection Measurements
                  </Button>
                </div>
              ) : (
                /* READ-ONLY SITE SURVEY READOUT FOR DESIGNERS & OTHER ROLES */
                (surveyData.surveyNotes || currentPhotos.length > 0) && (
                  <div className="rounded-xl border border-amber-300/40 dark:border-yellow-400/20 bg-amber-500/5 p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400 flex items-center gap-1.5">
                        <Ruler className="h-4 w-4" /> Supervisor Site Survey & Inspection Readout
                      </h4>
                      <Badge variant="completed">Verified by {surveyData.surveyorName || 'Dave Henderson'}</Badge>
                    </div>

                    {surveyData.surveyNotes && (
                      <div className="text-xs text-slate-700 dark:text-zinc-300">
                        <span className="font-bold text-amber-700 dark:text-yellow-400 block text-[11px] uppercase mb-0.5">Site Description & Inspection Notes:</span>
                        <p className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">{surveyData.surveyNotes}</p>
                      </div>
                    )}

                    {currentPhotos.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-amber-700 dark:text-yellow-400 uppercase block mb-1.5 flex items-center gap-1">
                          <Camera className="h-3.5 w-3.5" /> Site Inspection Photo Proofs ({currentPhotos.length})
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {currentPhotos.map((photo) => (
                            <div key={photo.id} className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-900">
                              <img src={photo.url} alt={photo.caption} className="w-full h-24 object-cover" />
                              <div className="p-1 text-[10px] font-semibold text-white bg-slate-950/80 truncate">
                                {photo.caption}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}

              {/* DESIGNER EXCLUSIVE: CAD Cut Files & Artwork Mockups */}
              {canUploadMockups && (
                <div className="rounded-xl border border-amber-300 dark:border-yellow-400/30 bg-amber-500/5 p-4 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400 flex items-center gap-1.5">
                    <Upload className="h-4 w-4" /> CAD Vectors & Artwork Cut Mockups
                  </h4>
                  <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/80 text-center space-y-2">
                    <FileCheck className="h-6 w-6 text-amber-600 dark:text-yellow-400 mx-auto" />
                    <div className="text-xs font-semibold text-slate-900 dark:text-zinc-200">
                      {mockupFile ? `Uploaded: ${mockupFile}` : 'Upload Vector (.AI, .DXF, .SVG) or Proof Proofing PDF'}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setMockupFile('Signage_3D_Vector_Cut_File_v2.dxf')}
                    >
                      {mockupFile ? 'Replace Mockup' : 'Select Artwork File'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Production Sub-Status (Visible to Supervisors & Technicians) */}
              {canUpdateProduction && job.stage === 'PRODUCTION' && (
                <div className="rounded-xl border border-amber-300 dark:border-yellow-400/30 bg-amber-500/5 p-4 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400 flex items-center gap-1.5">
                    <Wrench className="h-4 w-4" /> Shop Fabrication Progress
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUB_STATUSES.map((sub) => {
                      const isCurrent = job.productionSubStatus === sub.value;
                      return (
                        <button
                          key={sub.value}
                          onClick={() => handleSubStatusChange(sub.value)}
                          className={`p-2.5 rounded-lg border text-xs font-medium text-left flex items-center justify-between transition-all cursor-pointer ${
                            isCurrent
                              ? 'border-yellow-400 bg-yellow-400 text-black font-bold shadow-xs'
                              : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 text-slate-700 dark:text-zinc-300 hover:border-slate-300 dark:hover:border-zinc-700'
                          }`}
                        >
                          <span>{sub.label}</span>
                          {isCurrent && <CheckCircle2 className="h-4 w-4 text-black" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Installation Dispatch (Visible to Supervisors & Technicians) */}
              {canManageDispatch && (job.stage === 'INSTALLATION' || job.stage === 'COMPLETED') && (
                <div className="rounded-xl border border-amber-300 dark:border-yellow-400/30 bg-amber-500/5 p-4 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400 flex items-center gap-1.5">
                    <Truck className="h-4 w-4" /> Crew Dispatch & Installation Schedule
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Assigned Crew / Lead"
                      value={assignedCrew || job.assignedTeam || ''}
                      onChange={(e) => setAssignedCrew(e.target.value)}
                      placeholder="e.g. Crew Alpha - Tech Dave"
                    />
                    <Input
                      label="Scheduled Install Date"
                      type="date"
                      value={installDate || job.installationDate || ''}
                      onChange={(e) => setInstallDate(e.target.value)}
                    />
                  </div>
                  <Button size="sm" variant="primary" onClick={handleDispatchSave}>
                    Save Dispatch Info
                  </Button>
                </div>
              )}

              {/* Bill of Materials (BOM) */}
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400 flex items-center gap-1.5">
                    <PackageCheck className="h-4 w-4" /> Material BOM & Inventory Reservation
                  </h4>
                </div>

                {/* Add Item to BOM input row */}
                {canEditFinancials && (
                  <div className="flex gap-2 items-end bg-slate-50 dark:bg-zinc-900/80 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                    <div className="flex-1">
                      <Select
                        label="Select Shop Material"
                        options={[
                          { label: '-- Select Material --', value: '' },
                          ...inventory.map((i: any) => ({
                            label: `${i.name} (In stock: ${i.stockQuantity} ${i.unit})`,
                            value: i.id
                          }))
                        ]}
                        value={selectedInvId}
                        onChange={(e) => setSelectedInvId(e.target.value)}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        label="Qty"
                        type="number"
                        min="1"
                        value={addQty}
                        onChange={(e) => setAddQty(Number(e.target.value))}
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={!selectedInvId}
                      onClick={handleAddBOMItem}
                      icon={<Plus className="h-4 w-4" />}
                    >
                      Add
                    </Button>
                  </div>
                )}

                {/* BOM Table */}
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 uppercase font-semibold">
                      <tr>
                        <th className="p-2.5">Item</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Qty</th>
                        {canViewFinancials && <th className="p-2.5">Unit Cost</th>}
                        {canViewFinancials && <th className="p-2.5">Total</th>}
                        {canEditFinancials && <th className="p-2.5 text-right">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-800 dark:text-zinc-200">
                      {job.bom.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-slate-500 italic">
                            No materials added to BOM yet. Select an item above or use the Quick Estimator.
                          </td>
                        </tr>
                      ) : (
                        job.bom.map((item) => (
                          <tr key={item.inventoryItemId} className="hover:bg-slate-50 dark:hover:bg-zinc-900/60">
                            <td className="p-2.5 font-medium">{item.name}</td>
                            <td className="p-2.5 text-slate-500 dark:text-zinc-400">{item.category.replace(/_/g, ' ')}</td>
                            <td className="p-2.5 font-semibold text-amber-600 dark:text-yellow-400">{item.quantity} {item.unit}</td>
                            {canViewFinancials && <td className="p-2.5">${item.unitCost.toFixed(2)}</td>}
                            {canViewFinancials && <td className="p-2.5 font-bold">${item.totalCost.toFixed(2)}</td>}
                            {canEditFinancials && (
                              <td className="p-2.5 text-right">
                                <button
                                  onClick={() => handleRemoveBOMItem(item.inventoryItemId)}
                                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Financial Summary & Payments (ONLY VISIBLE IF PERMITTED) */}
            {canViewFinancials && (
              <div className="space-y-4">
                {/* Financial Quote breakdown */}
                <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] p-4 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400 flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4" /> Quotation & Profit Margin
                  </h4>

                  <div className="space-y-2 text-xs border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                      <span>Materials Cost:</span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-200">${job.financials.estimatedMaterialCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                      <span>Labor Cost:</span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-200">${job.financials.laborCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                      <span>Overhead (15%):</span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-200">${job.financials.overheadCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                      <span>Markup ({job.financials.markupPercent}%):</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">+${(job.financials.totalQuoteAmount - (job.financials.estimatedMaterialCost + job.financials.laborCost + job.financials.overheadCost)).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex justify-between items-baseline">
                    <span className="text-xs uppercase font-bold text-slate-500 dark:text-zinc-400">Total Quote Amount</span>
                    <span className="font-heading text-xl font-extrabold text-amber-600 dark:text-yellow-400">
                      ${job.financials.totalQuoteAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Status & Recording */}
                <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] p-4 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-yellow-400">Payment Status</h4>
                    <Badge variant={job.financials.paymentStatus === 'PAID_IN_FULL' ? 'completed' : 'amber'}>
                      {job.financials.paymentStatus.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-zinc-400">Deposit Paid (50%):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">${job.financials.depositPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-zinc-400">Final Balance Paid:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">${job.financials.finalBalancePaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 dark:border-zinc-800 pt-2 font-bold text-slate-900 dark:text-zinc-200">
                      <span>Remaining Balance:</span>
                      <span className="text-amber-600 dark:text-yellow-400">
                        ${(job.financials.totalQuoteAmount - (job.financials.depositPaid + job.financials.finalBalancePaid)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {canEditFinancials && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      {job.financials.depositPaid === 0 && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleRecordPayment('deposit')}
                        >
                          Record 50% Deposit (${(job.financials.totalQuoteAmount * 0.5).toFixed(2)})
                        </Button>
                      )}
                      {job.financials.paymentStatus !== 'PAID_IN_FULL' && job.financials.depositPaid > 0 && (
                        <Button
                          size="sm"
                          variant="amber"
                          onClick={() => handleRecordPayment('balance')}
                        >
                          Record Full Balance Received
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Danger Zone (Manager Only) */}
                {canDeleteItem && (
                  <div className="pt-2 flex justify-end">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setIsDeleteConfirmOpen(true)}
                      icon={<Trash2 className="h-4 w-4" />}
                    >
                      Delete Job
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CUSTOM ALERT DIALOG FOR JOB DELETION */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => { if (job) deleteMutation.mutate({ id: job.id }); }}
        title={`Delete Job Order (${job?.id})`}
        description={job ? `Are you sure you want to permanently delete "${job.title}" (${job.companyName || job.customerName}) from the shop pipeline? This action cannot be reverted.` : ''}
        confirmText="Permanently Delete Job"
        cancelText="Keep Order"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </Dialog>
  );
}
