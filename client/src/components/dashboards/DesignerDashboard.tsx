import { useState, useEffect } from 'react';
import { trpc } from '../../utils/trpc';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Palette,
  Upload,
  Ruler,
  CheckCircle2,
  Camera,
  ArrowRight,
  Sparkles,
  FileText,
  Clock,
  Layers,
  AlertCircle,
  FileCheck,
  Send,
  MessageSquare,
  Download
} from 'lucide-react';

export function DesignerDashboard() {
  const { data: allJobs = [], isLoading } = trpc.jobs.list.useQuery({});
  const utils = trpc.useUtils();

  // Jobs needing CAD / Mockup work
  const designQueue = allJobs.filter((j: any) =>
    j.stage === 'DESIGN_MOCKUP' || j.stage === 'SITE_SURVEY' || j.stage === 'CUSTOMER_APPROVED'
  );

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [draftMockups, setDraftMockups] = useState<{ [key: string]: string }>({});
  const [vectorCutFiles, setVectorCutFiles] = useState<{ [key: string]: string }>({});
  const [submissionStatus, setSubmissionStatus] = useState<{ [key: string]: 'PENDING_REVIEW' | 'APPROVED' | 'REVISION_REQUESTED' }>({});

  useEffect(() => {
    if (designQueue.length > 0 && !selectedJobId) {
      setSelectedJobId(designQueue[0].id);
    }
  }, [designQueue, selectedJobId]);

  const updateStageMutation = trpc.jobs.updateStage.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      utils.analytics.getDashboardMetrics.invalidate();
    }
  });

  if (isLoading) {
    return <div className="py-12 text-center text-slate-500 dark:text-zinc-400">Loading Designer Workstation...</div>;
  }

  const selectedJob = designQueue.find((j: any) => j.id === selectedJobId) || designQueue[0];

  const handleUploadDraftMockup = (jobId: string) => {
    setDraftMockups(prev => ({
      ...prev,
      [jobId]: `Artwork_Customer_Proof_${jobId}_v2.pdf`
    }));
  };

  const handleUploadVectorCutFile = (jobId: string) => {
    setVectorCutFiles(prev => ({
      ...prev,
      [jobId]: `CNC_Acrylic_CutFile_${jobId}.dxf`
    }));
  };

  const handleSubmitForSupervisorReview = (jobId: string) => {
    setSubmissionStatus(prev => ({
      ...prev,
      [jobId]: 'PENDING_REVIEW'
    }));
  };

  const handleSendToProduction = (jobId: string) => {
    updateStageMutation.mutate({
      id: jobId,
      stage: 'PRODUCTION',
      productionSubStatus: 'CNC_CUTTING'
    });
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-[#141417] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h1 className="font-heading text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Palette className="h-5 w-5 text-amber-600 dark:text-yellow-400" /> Designer Workstation Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Active Designer: <span className="font-bold text-amber-600 dark:text-yellow-400">Elena Rostova</span> — Select an assigned job, inspect surveyor measurements & site photos, and upload mockup proofs for supervisor review.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-400/10 text-amber-800 dark:text-yellow-400 border border-yellow-400/30 shrink-0">
          {designQueue.length} Assigned Jobs
        </span>
      </div>

      {/* 2-COLUMN LAYOUT */}
      {designQueue.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 dark:text-zinc-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#141417] space-y-2">
          <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
          <div className="font-bold text-sm text-slate-800 dark:text-zinc-200">All assigned signage design tasks are up to date!</div>
          <p className="text-slate-500 dark:text-zinc-400">No pending artwork or vector cut files waiting right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* COLUMN 1: LEFT SIDEBAR JOB QUEUE LIST (4 COLS) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white dark:bg-[#141417] rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="font-heading text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-amber-600 dark:text-yellow-400" /> Assigned Pending Jobs ({designQueue.length})
                </h3>
              </div>

              <div className="space-y-2">
                {designQueue.map((job: any) => {
                  const isSelected = selectedJob?.id === job.id;
                  const hasMockup = !!draftMockups[job.id];
                  const status = submissionStatus[job.id];

                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all space-y-2 ${isSelected
                          ? 'bg-yellow-400/10 border-yellow-400/80 shadow-xs'
                          : 'bg-slate-50 dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-amber-600 dark:text-yellow-400 font-mono text-[11px]">
                          {job.id}
                        </span>
                        <Badge variant={job.stage.toLowerCase() as any}>
                          {job.stage.replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{job.companyName || job.customerName}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">{job.title}</p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-200/60 dark:border-zinc-800">
                        <span>{job.dimensions.width}x{job.dimensions.height} {job.dimensions.unit}</span>
                        {(job.surveyData?.revisionRequested || job.id === 'JOB-1002') ? (
                          <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Revision Required
                          </span>
                        ) : hasMockup ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Mockup Uploaded
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-yellow-400 font-medium">Needs Mockup</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUMN 2: RIGHT WORKSPACE DETAILS & MOCKUP UPLOADER (8 COLS) */}
          <div className="lg:col-span-8 space-y-4">
            {selectedJob && (
              <div className="bg-white dark:bg-[#141417] rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 space-y-5 shadow-xs">

                {/* 1. Job Header */}
                <div className="flex justify-between items-start gap-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-600 dark:text-yellow-400 font-mono text-xs">{selectedJob.id}</span>
                      <Badge variant={selectedJob.stage.toLowerCase() as any}>
                        {selectedJob.stage.replace(/_/g, ' ')}
                      </Badge>
                      {(selectedJob.surveyData?.revisionRequested || selectedJob.id === 'JOB-1002') && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                          REVISION REQUIRED
                        </span>
                      )}
                    </div>
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white mt-1">
                      {selectedJob.companyName || selectedJob.customerName}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{selectedJob.title}</p>
                  </div>
                </div>

                {/* 🚨 SUPERVISOR REVISION REQUIRED BANNER */}
                {(selectedJob.surveyData?.revisionRequested || selectedJob.id === 'JOB-1002') && (
                  <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-500/10 space-y-2 text-xs shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" /> Revision Required by Supervisor (Dave Henderson)
                      </span>
                      <Badge variant="amber">Action Required</Badge>
                    </div>
                    <div className="text-xs text-slate-800 dark:text-zinc-200">
                      <span className="font-bold text-rose-700 dark:text-rose-400 block text-[11px] uppercase mb-1">
                        Supervisor Revision Description & Change Notes:
                      </span>
                      <p className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 font-semibold shadow-2xs">
                        "{selectedJob.surveyData?.revisionNotes || 'Please adjust logo scale by 5% and change acrylic letter color to gold metallic finish.'}"
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Signage Specs & Dimensions */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-zinc-900/80 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Signage Type</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedJob.signType.replace(/_/g, ' ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Sign Dimensions</span>
                    <span className="font-extrabold text-amber-600 dark:text-yellow-400 text-sm">
                      {selectedJob.dimensions.width} x {selectedJob.dimensions.height} {selectedJob.dimensions.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Mounting Type</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedJob.installationType.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                {/* 3. SUPERVISOR SITE SURVEY MEASUREMENTS & PHOTOS READOUT */}
                {(() => {
                  const survey = selectedJob.surveyData || {};
                  const displayNotes = survey.surveyNotes ||
                    `Measured facade 12.0 ft width x 4.0 ft height. Wall mounting: Alucobond ACP Panel over steel studs. Boom lift required for 20 ft installation height. Electrical junction box located 8 ft away on right wall.`;

                  const defaultPhotos = [
                    { id: 'sp-1', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', caption: 'Main Storefront Facade View' },
                    { id: 'sp-2', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', caption: 'Facade Mounting Wall Close-up' },
                    { id: 'sp-3', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', caption: 'Electrical Power Junction Box' },
                  ];

                  const displayPhotos = (survey.sitePhotos && survey.sitePhotos.length > 0)
                    ? survey.sitePhotos
                    : defaultPhotos;

                  return (
                    <div className="p-4 rounded-xl border border-amber-300/40 dark:border-yellow-400/20 bg-amber-500/5 space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-1 border-b border-amber-500/20">
                        <span className="font-bold text-amber-700 dark:text-yellow-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <Ruler className="h-4 w-4" /> Supervisor Site Survey Description & Photos
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
                          Supervisor: {survey.surveyorName || 'Dave Henderson'}
                        </span>
                      </div>

                      {/* Site Description Notes */}
                      <div className="text-xs text-slate-700 dark:text-zinc-300">
                        <span className="font-bold text-amber-700 dark:text-yellow-400 block text-[11px] uppercase mb-0.5">Site Description & Inspection Notes:</span>
                        <p className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200">
                          {displayNotes}
                        </p>
                      </div>

                      {/* Site Inspection Photos Gallery with Download Controls */}
                      <div className="pt-2 border-t border-amber-500/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase flex items-center gap-1">
                            <Camera className="h-3.5 w-3.5 text-amber-600 dark:text-yellow-400" /> Site Inspection Photos ({displayPhotos.length})
                          </span>
                          <span className="text-[10px] font-bold text-amber-600 dark:text-yellow-400">
                            Click Download to save high-res image for CAD artwork
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {displayPhotos.map((p: any) => (
                            <div key={p.id} className="relative rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-900 overflow-hidden group">
                              <img src={p.url} alt={p.caption} className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-200" />

                              <div className="p-2 bg-slate-950/95 flex justify-between items-center text-[10px]">
                                <span className="font-semibold text-white truncate max-w-[110px]">{p.caption}</span>
                                <a
                                  href={p.url}
                                  download={`${selectedJob.id}_site_photo_${p.id}.jpg`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded bg-amber-500 text-slate-950 hover:bg-yellow-400 font-bold flex items-center gap-1 transition-colors shrink-0"
                                  title="Download High-Res Site Photo"
                                >
                                  <Download className="h-3 w-3" />
                                  <span>Download</span>
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 4. DESIGNER MOCKUP UPLOADER */}
                <div className="space-y-3 pt-1">
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-600 dark:text-yellow-400" /> Upload Signage Mockup Proof
                  </h4>

                  {/* Customer Mockup Proof */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                        <FileText className="h-4 w-4 text-amber-600 dark:text-yellow-400" /> Customer Proof Mockup File
                      </span>
                      {draftMockups[selectedJob.id] && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {draftMockups[selectedJob.id] ? draftMockups[selectedJob.id] : 'Upload 2D/3D signage visual mockup proof (.PDF, .PNG, .JPG)'}
                    </p>
                    <Button
                      size="md"
                      variant="amber"
                      onClick={() => handleUploadDraftMockup(selectedJob.id)}
                      icon={<Upload className="h-4 w-4" />}
                      className="w-full"
                    >
                      {draftMockups[selectedJob.id] ? 'Replace Proof Mockup PDF' : 'Upload Customer Mockup'}
                    </Button>
                  </div>
                </div>

                {/* 5. SUPERVISOR REVIEW SUBMISSION */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-amber-600 dark:text-yellow-400" />
                    <span>Supervisor Reviewer: <strong className="text-slate-800 dark:text-zinc-200">Dave Henderson (Production Supervisor)</strong></span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {submissionStatus[selectedJob.id] === 'PENDING_REVIEW' ? (
                      <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Submitted to Supervisor (Dave Henderson) for Review</span>
                      </div>
                    ) : (
                      <Button
                        size="md"
                        variant="amber"
                        onClick={() => handleSubmitForSupervisorReview(selectedJob.id)}
                        icon={<Send className="h-4 w-4" />}
                        className="w-full sm:w-auto"
                      >
                        Submit Mockup for Supervisor Review
                      </Button>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
