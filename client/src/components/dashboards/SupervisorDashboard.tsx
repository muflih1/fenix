import React, { useState } from 'react';
import { trpc } from '../../utils/trpc';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  ShieldCheck, 
  Camera, 
  CheckCircle2, 
  RefreshCw, 
  FileCheck, 
  MapPin,
  Sparkles,
  ArrowRight,
  Upload,
  Trash2,
  UserCheck,
  Download
} from 'lucide-react';

const SAMPLE_PHOTO_PRESETS = [
  { url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', caption: 'Main Storefront Facade View' },
  { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', caption: 'Facade Mounting Wall Close-up' },
  { url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', caption: 'Electrical Power Junction Box' },
];

export function SupervisorDashboard() {
  const { data: allJobs = [], isLoading } = trpc.jobs.list.useQuery({});
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState<'SURVEY' | 'MOCKUP' | 'QA'>('SURVEY');
  
  // Inline Site Survey Form States per job
  const [surveyDescriptions, setSurveyDescriptions] = useState<{ [key: string]: string }>({});
  const [surveyDesigners, setSurveyDesigners] = useState<{ [key: string]: string }>({});
  const [surveyPhotos, setSurveyPhotos] = useState<{ [key: string]: { id: string; url: string; caption: string }[] }>({});
  const [reworkNotes, setReworkNotes] = useState<{ [key: string]: string }>({});

  const updateStageMutation = trpc.jobs.updateStage.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      utils.analytics.getDashboardMetrics.invalidate();
    }
  });

  const updateSurveyMutation = trpc.jobs.updateSurveyData.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
    }
  });

  if (isLoading) {
    return <div className="py-12 text-center text-slate-500 dark:text-zinc-400">Loading Supervisor Workstation...</div>;
  }

  // 1. Site Survey Queue
  const siteSurveyQueue = allJobs.filter((j: any) => 
    j.stage === 'SITE_SURVEY' || j.stage === 'CUSTOMER_APPROVED'
  );

  // 2. Designer Mockups Pending Review Queue
  const mockupReviewQueue = allJobs.filter((j: any) => 
    j.stage === 'DESIGN_MOCKUP'
  );

  // 3. Post-Installation Quality Assurance (QA) Queue
  const postInstallationQAQueue = allJobs.filter((j: any) => 
    j.stage === 'INSTALLATION'
  );

  // Inline Survey Handlers
  const handleAddPresetPhoto = (jobId: string, preset: { url: string; caption: string }) => {
    const newPhoto = {
      id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      url: preset.url,
      caption: preset.caption
    };
    setSurveyPhotos(prev => ({
      ...prev,
      [jobId]: [...(prev[jobId] || []), newPhoto]
    }));
  };

  const handleDeleteInlinePhoto = (jobId: string, photoId: string) => {
    setSurveyPhotos(prev => ({
      ...prev,
      [jobId]: (prev[jobId] || []).filter(p => p.id !== photoId)
    }));
  };

  const handleCompleteSurvey = (jobId: string) => {
    const notes = surveyDescriptions[jobId] || 'Measured facade 12ft x 4ft. ACP panel wall mounting. Boom lift required for 20ft height.';
    const photos = (surveyPhotos[jobId] && surveyPhotos[jobId].length > 0 
      ? surveyPhotos[jobId] 
      : SAMPLE_PHOTO_PRESETS.map((p, idx) => ({ id: `p-${idx}`, ...p }))
    ).map(p => ({
      ...p,
      uploadedAt: (p as any).uploadedAt || new Date().toISOString()
    }));

    updateSurveyMutation.mutate({
      id: jobId,
      surveyData: {
        surveyNotes: notes,
        surveyorName: 'Dave Henderson',
        assignedDesignerName: surveyDesigners[jobId] || 'Elena Rostova',
        surveyStatus: 'COMPLETED',
        sitePhotos: photos
      }
    });

    updateStageMutation.mutate({
      id: jobId,
      stage: 'DESIGN_MOCKUP',
      assignedDesignerName: surveyDesigners[jobId] || 'Elena Rostova'
    });
  };

  const handleApproveMockup = (jobId: string) => {
    updateStageMutation.mutate({
      id: jobId,
      stage: 'PRODUCTION',
      productionSubStatus: 'CNC_CUTTING'
    });
  };

  const handleRequestMockupRework = (jobId: string) => {
    const note = reworkNotes[jobId] || 'Please adjust acrylic letter outline by 2mm, change LED color temperature to 6500K cool white.';
    
    updateSurveyMutation.mutate({
      id: jobId,
      surveyData: {
        revisionRequested: true,
        revisionNotes: note,
        revisionRequestedAt: new Date().toISOString()
      }
    });

    alert(`✓ Revision Requested for Job ${jobId}!\n\nFeedback sent to Lead Designer (Elena Rostova):\n"${note}"`);
  };

  const handleApproveOnSiteQA = (jobId: string) => {
    updateStageMutation.mutate({
      id: jobId,
      stage: 'COMPLETED'
    });
  };

  const handleRequestInstallationRework = (jobId: string) => {
    const note = reworkNotes[jobId] || 'Transformer housing cover loose. Re-tighten wall anchors and seal conduit.';
    alert(`Installation Rework requested for Job ${jobId}: ${note}`);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#141417] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <h1 className="font-heading text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-yellow-400" /> Supervisor Console
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Active Supervisor: <span className="font-bold text-amber-600 dark:text-yellow-400">Dave Henderson</span> — Fill site description notes, upload multiple images inline, and assign lead designer. No popup modals required.
        </p>
      </div>

      {/* 3 WORKSTATION TABS */}
      <div className="flex bg-slate-100 dark:bg-zinc-900/80 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800 gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('SURVEY')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'SURVEY'
              ? 'bg-white dark:bg-[#141417] text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-zinc-800'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MapPin className="h-4 w-4 text-amber-600 dark:text-yellow-400" />
          <span>1. Site Surveys ({siteSurveyQueue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MOCKUP')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'MOCKUP'
              ? 'bg-white dark:bg-[#141417] text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-zinc-800'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="h-4 w-4 text-amber-600 dark:text-yellow-400" />
          <span>2. Mockup Reviews ({mockupReviewQueue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('QA')}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'QA'
              ? 'bg-white dark:bg-[#141417] text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-zinc-800'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCheck className="h-4 w-4 text-amber-600 dark:text-yellow-400" />
          <span>3. Post-Install QA ({postInstallationQAQueue.length})</span>
        </button>
      </div>

      {/* TAB 1: INLINE SITE SURVEY (NO MODAL - JUST DESCRIPTION + MULTI-IMAGE UPLOAD) */}
      {activeTab === 'SURVEY' && (
        <div className="space-y-4">
          {siteSurveyQueue.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-zinc-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#141417] space-y-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
              <div className="font-bold text-sm text-slate-800 dark:text-zinc-200">All pending site surveys completed!</div>
            </div>
          ) : (
            siteSurveyQueue.map((job: any) => {
              const currentPhotos = surveyPhotos[job.id] || job.surveyData?.sitePhotos || [];

              return (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] space-y-4 shadow-xs"
                >
                  {/* Job Header */}
                  <div className="flex justify-between items-start gap-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-600 dark:text-yellow-400 font-mono text-xs">{job.id}</span>
                        <Badge variant={job.stage.toLowerCase() as any}>{job.stage.replace(/_/g, ' ')}</Badge>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">{job.companyName || job.customerName}</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{job.siteAddress} • Contact: {job.customerName} ({job.phone})</p>
                    </div>
                  </div>

                  {/* 2 SIMPLE INPUTS: DESCRIPTION + MULTIPLE IMAGES */}
                  <div className="space-y-3">
                    
                    {/* INPUT 1: Site Description Notes */}
                    <div>
                      <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 block mb-1 flex items-center gap-1.5">
                        <FileCheck className="h-4 w-4 text-amber-600 dark:text-yellow-400" /> 1. Site Survey Description & Notes *
                      </label>
                      <textarea
                        rows={3}
                        value={surveyDescriptions[job.id] || job.surveyData?.surveyNotes || ''}
                        onChange={(e) => setSurveyDescriptions({ ...surveyDescriptions, [job.id]: e.target.value })}
                        placeholder="Type site inspection details (e.g., Measured facade 12ft x 4ft. ACP wall panel mounting. Boom lift needed for 20ft height)."
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>

                    {/* INPUT 2: Upload Multiple Images */}
                    <div className="space-y-2.5 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                          <Camera className="h-4 w-4 text-amber-600 dark:text-yellow-400" /> 2. Upload Multiple Site Photos ({currentPhotos.length})
                        </label>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">Add site inspection proof images for designer</span>
                      </div>

                      {/* Quick Image Upload Presets */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="text-[11px] text-slate-400 self-center">Upload Preset Image:</span>
                        {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
                          <Button
                            key={idx}
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddPresetPhoto(job.id, preset)}
                            icon={<Upload className="h-3 w-3 text-amber-600 dark:text-yellow-400" />}
                          >
                            + {preset.caption}
                          </Button>
                        ))}
                      </div>

                      {/* Image Thumbnails */}
                      {currentPhotos.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                          {currentPhotos.map((photo: any) => (
                            <div key={photo.id} className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-900 group">
                              <img src={photo.url} alt={photo.caption} className="w-full h-20 object-cover" />
                              <div className="p-1 text-[9px] font-semibold text-white bg-slate-950/80 truncate">
                                {photo.caption}
                              </div>
                              <button
                                onClick={() => handleDeleteInlinePhoto(job.id, photo.id)}
                                className="absolute top-1 right-1 p-1 rounded bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Delete image"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Assign Lead Designer & Complete Button */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                      <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
                        <UserCheck className="h-4 w-4 text-amber-600 dark:text-yellow-400 shrink-0" />
                        <span className="font-semibold text-slate-700 dark:text-zinc-300 shrink-0">Assign Designer:</span>
                        <select
                          value={surveyDesigners[job.id] || job.assignedDesignerName || 'Elena Rostova'}
                          onChange={(e) => setSurveyDesigners({ ...surveyDesigners, [job.id]: e.target.value })}
                          className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                        >
                          <option value="Elena Rostova">Elena Rostova (Lead CAD Designer)</option>
                          <option value="Alex Vance">Alex Vance (3D Signage Tech)</option>
                        </select>
                      </div>

                      <Button
                        size="md"
                        variant="primary"
                        disabled={updateStageMutation.isPending}
                        onClick={() => handleCompleteSurvey(job.id)}
                        icon={<ArrowRight className="h-4 w-4" />}
                      >
                        Save Site Survey & Send to Designer
                      </Button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: DESIGNER MOCKUP REVIEWS */}
      {activeTab === 'MOCKUP' && (
        <div className="space-y-4">
          {mockupReviewQueue.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-zinc-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#141417]">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
              <div className="font-bold text-sm text-slate-800 dark:text-zinc-200">No pending artwork mockups awaiting review!</div>
            </div>
          ) : (
            mockupReviewQueue.map((job: any) => (
              <div key={job.id} className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] space-y-4 shadow-xs">
                <div className="flex justify-between items-start gap-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-600 dark:text-yellow-400 font-mono text-xs">{job.id}</span>
                      {job.surveyData?.revisionRequested && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                          REVISION REQUESTED SENT TO DESIGNER
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">{job.companyName || job.customerName}</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{job.title}</p>
                  </div>
                </div>

                {/* Mockup Image Preview Card */}
                <div className="space-y-3 p-4 rounded-xl border border-amber-300/40 dark:border-yellow-400/20 bg-amber-500/5 text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-amber-500/20">
                    <span className="font-bold text-amber-700 dark:text-yellow-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> Lead Designer Mockup Proof (Elena Rostova)
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Artwork_Customer_Proof_{job.id}_v2.png
                    </span>
                  </div>

                  {/* High-Res Mockup Image Preview Card */}
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-950 group">
                    <img 
                      src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80" 
                      alt="3D Signage Design Mockup Proof" 
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-3 justify-between">
                      <div className="text-white text-xs">
                        <span className="font-extrabold text-amber-400 block text-sm">3D Illuminated Front-Lit Acrylic LED Signage</span>
                        <span className="text-[11px] text-slate-300">Dimensions: 12.0 ft x 4.0 ft • RGB Dual-Channel LED Wiring</span>
                      </div>
                      <a 
                        href="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-yellow-400 transition-colors flex items-center gap-1 shrink-0"
                      >
                        <Download className="h-3.5 w-3.5" /> Full-Res Mockup
                      </a>
                    </div>
                  </div>

                  {/* Feedback Rework Notes Input */}
                  <div className="pt-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                      Revision / Rework Feedback Notes (If requesting changes)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Adjust acrylic letter outline by 2mm, change LED color temperature to 6500K cool white."
                      value={reworkNotes[job.id] || ''}
                      onChange={(e) => setReworkNotes({ ...reworkNotes, [job.id]: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    size="md"
                    variant="outline"
                    onClick={() => handleRequestMockupRework(job.id)}
                    icon={<RefreshCw className="h-4 w-4 text-rose-500" />}
                  >
                    Request Rework
                  </Button>
                  <Button
                    size="md"
                    variant="primary"
                    onClick={() => handleApproveMockup(job.id)}
                    icon={<CheckCircle2 className="h-4 w-4" />}
                  >
                    Approve & Send to Production
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: POST-INSTALLATION QA */}
      {activeTab === 'QA' && (
        <div className="space-y-4">
          {postInstallationQAQueue.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-zinc-400 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#141417]">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
              <div className="font-bold text-sm text-slate-800 dark:text-zinc-200">No active installations waiting for post-installation QA!</div>
            </div>
          ) : (
            postInstallationQAQueue.map((job: any) => (
              <div key={job.id} className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141417] space-y-4 shadow-xs">
                <div className="flex justify-between items-start gap-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="font-bold text-amber-600 dark:text-yellow-400 font-mono text-xs">{job.id}</span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">{job.companyName || job.customerName}</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{job.siteAddress}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-300/40 dark:border-yellow-400/20 bg-amber-500/5 space-y-2 text-xs">
                  <span className="font-bold text-amber-800 dark:text-yellow-400 uppercase tracking-wider text-[11px]">
                    On-Site Post-Installation QA Checklist
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                    <div>✓ Illuminated LED Facade Glow</div>
                    <div>✓ Flush Wall Mounting</div>
                    <div>✓ Power Transformer Stability</div>
                    <div>✓ Site Cleanup</div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    size="md"
                    variant="outline"
                    onClick={() => handleRequestInstallationRework(job.id)}
                    icon={<RefreshCw className="h-4 w-4 text-rose-500" />}
                  >
                    QA Failed: Request Rework
                  </Button>
                  <Button
                    size="md"
                    variant="primary"
                    onClick={() => handleApproveOnSiteQA(job.id)}
                    icon={<ArrowRight className="h-4 w-4" />}
                  >
                    On-Site QA Passed: Complete Order
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
