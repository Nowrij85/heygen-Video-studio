import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Image as ImageIcon, 
  Layout, 
  ChevronRight, 
  Loader2, 
  Info,
  Play,
  CheckCircle2,
  AlertCircle,
  Users,
  RefreshCw,
  PlusCircle,
  Upload,
  X,
  Sparkles,
  Wand2,
  Eraser
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { getHeyGenClient } from '../lib/heygen';
import { generateScriptFromPrompt } from '../lib/gemini';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const CreateVideoPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { apiKey, addVideo } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'agent' | 'avatar' | 'photo' | 'template'>(
    (searchParams.get('tab') as any) || 'agent'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [script, setScript] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(searchParams.get('avatarId') || '');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [avatarScale, setAvatarScale] = useState('medium');
  const [bgColor, setBgColor] = useState('#0a0a0f');
  const [dimension, setDimension] = useState({ width: 1280, height: 720 });
  const [speed, setSpeed] = useState(1);

  // Talking Photo State
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Template State
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Data State
  const [avatars, setAvatars] = useState<any[]>([]);
  const [voices, setVoices] = useState<any[]>([]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['agent', 'avatar', 'photo', 'template'].includes(tab)) {
      setActiveTab(tab as any);
    }
    const avatarId = searchParams.get('avatarId');
    if (avatarId) {
      setSelectedAvatar(avatarId);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (!apiKey) return;
      setIsLoading(true);
      try {
        const client = getHeyGenClient(apiKey);
        const [avatarData, voiceData, templateData] = await Promise.all([
          client.getAvatars(),
          client.getVoices(),
          client.getTemplates()
        ]);
        setAvatars(avatarData);
        setVoices(voiceData);
        setTemplates(templateData || []);
        
        if (voiceData.length > 0 && !selectedVoice) {
          setSelectedVoice(voiceData[0].voice_id);
        }

        if (avatarData.length > 0 && !selectedAvatar) {
          setSelectedAvatar(avatarData[0].avatar_id);
        }
      } catch (error) {
        toast.error('Failed to fetch library data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [apiKey]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateScript = async () => {
    if (!prompt) {
      toast.error('Please enter a prompt first');
      return;
    }
    setIsGeneratingScript(true);
    try {
      const generatedScript = await generateScriptFromPrompt(prompt);
      setScript(generatedScript);
      toast.success('Script generated successfully!');
      // After generating script, we can switch to avatar tab or stay here
      // But let's stay here and show the script
    } catch (error: any) {
      toast.error('Failed to generate script: ' + error.message);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      toast.error('API key not configured');
      return;
    }
    if (!script && activeTab !== 'template') {
      toast.error('Please enter a script');
      return;
    }

    const confirmGen = window.confirm(`This will use approximately 2 credits. Proceed?`);
    if (!confirmGen) return;

    setIsGenerating(true);
    try {
      const client = getHeyGenClient(apiKey);
      let result: any;

      if (activeTab === 'avatar' || activeTab === 'agent') {
        if (!selectedAvatar) throw new Error('Please select an avatar');
        const payload = {
          video_inputs: [{
            character: {
              type: 'avatar',
              avatar_id: selectedAvatar,
              avatar_style: 'normal'
            },
            voice: {
              type: 'text',
              input_text: script,
              voice_id: selectedVoice,
              speed: speed
            },
            background: {
              type: 'color',
              value: bgColor
            }
          }],
          dimension: dimension,
          caption: false
        };
        result = await client.generateVideo(payload);
      } else if (activeTab === 'photo') {
        if (!photoFile) throw new Error('Please upload a photo');
        
        toast.info('Uploading photo asset...');
        const asset = await client.uploadAsset(photoFile);
        
        const payload = {
          video_inputs: [{
            character: {
              type: 'talking_photo',
              talking_photo_id: asset.asset_id || asset.id,
            },
            voice: {
              type: 'text',
              input_text: script,
              voice_id: selectedVoice,
            }
          }],
          dimension: dimension
        };
        result = await client.generateVideo(payload);
      } else if (activeTab === 'template') {
        if (!selectedTemplate) throw new Error('Please select a template');
        result = await client.generateTemplateVideo(selectedTemplate.template_id, {});
      }
      
      addVideo({
        id: result.video_id,
        title: title || `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Video ${new Date().toLocaleTimeString()}`,
        status: 'processing',
        progress: 0,
        created_at: new Date().toISOString()
      });

      toast.success('Video generation started!');
      navigate('/dashboard/videos');
    } catch (error: any) {
      toast.error(error.message || error.response?.data?.error?.message || 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  const estimatedCredits = Math.ceil(script.length / 150) * 2 || 2;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Create Video</h1>
          <p className="text-[#94a3b8] mt-1">Transform your ideas into professional AI video</p>
        </div>
        <div className="flex items-center gap-3 p-3 bg-[#12121a] rounded-2xl border border-[#1e1e2e]">
          <div className="text-right">
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Estimated Cost</p>
            <p className="text-lg font-bold text-[#6366f1]">~{estimatedCredits} Credits</p>
          </div>
          <div className="p-2 bg-[#6366f1]/10 rounded-lg text-[#6366f1]">
            <Info size={20} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#12121a] p-1.5 rounded-2xl border border-[#1e1e2e]">
        {[
          { id: 'agent', label: 'Video Agent', icon: Sparkles },
          { id: 'avatar', label: 'Avatar Video', icon: Video },
          { id: 'photo', label: 'Talking Photo', icon: ImageIcon },
          { id: 'template', label: 'Video Template', icon: Layout },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all",
              activeTab === tab.id 
                ? "bg-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20" 
                : "text-[#94a3b8] hover:text-white"
            )}
          >
            <tab.icon size={20} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'agent' && (
              <motion.div
                key="agent-tab"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">What is your video about?</label>
                    <div className="relative">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        placeholder="e.g. Create a 30-second introduction for a new AI product called 'HeyGen Studio'..."
                        className="w-full bg-[#1e1e2e] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all resize-none pr-12"
                      />
                      <button
                        onClick={handleGenerateScript}
                        disabled={isGeneratingScript || !prompt}
                        className="absolute bottom-3 right-3 p-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#6366f1]/20"
                        title="Generate Script"
                      >
                        {isGeneratingScript ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-[#64748b] mt-2">Our AI will generate a professional script and select the best settings for you.</p>
                  </div>

                  {script && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-[#94a3b8]">Generated Script</label>
                          <button 
                            onClick={() => setScript('')}
                            className="text-xs text-[#94a3b8] hover:text-[#ef4444] flex items-center gap-1 transition-colors"
                            title="Clear Script"
                          >
                            <Eraser size={12} />
                            <span>Clear</span>
                          </button>
                        </div>
                        <textarea
                          value={script}
                          onChange={(e) => setScript(e.target.value)}
                          rows={6}
                          className="w-full bg-[#1e1e2e]/50 border border-[#1e1e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#94a3b8] mb-2">Avatar</label>
                          <select
                            value={selectedAvatar}
                            onChange={(e) => setSelectedAvatar(e.target.value)}
                            className="w-full bg-[#1e1e2e] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all appearance-none"
                          >
                            <option value="">Select Avatar</option>
                            {avatars.map((a) => (
                              <option key={a.avatar_id} value={a.avatar_id}>{a.avatar_name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#94a3b8] mb-2">Voice</label>
                          <select
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className="w-full bg-[#1e1e2e] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all appearance-none"
                          >
                            {voices.map((v) => (
                              <option key={v.voice_id} value={v.voice_id}>{v.display_name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'avatar' && (
              <motion.div
                key="avatar-tab"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">Video Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a title for your video..."
                      className="w-full bg-[#1e1e2e] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <label className="block text-sm font-medium text-[#94a3b8]">Script / Text</label>
                        <button 
                          onClick={() => setScript('')}
                          className="text-xs text-[#94a3b8] hover:text-[#ef4444] flex items-center gap-1 transition-colors"
                          title="Clear Script"
                        >
                          <Eraser size={12} />
                          <span>Clear</span>
                        </button>
                      </div>
                      <span className="text-xs text-[#94a3b8]">{script.length} / 1500</span>
                    </div>
                    <textarea
                      value={script}
                      onChange={(e) => setScript(e.target.value.slice(0, 1500))}
                      rows={8}
                      placeholder="What should your avatar say? Type or paste your script here..."
                      className="w-full bg-[#1e1e2e] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#94a3b8] mb-2">Voice Selector</label>
                      <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="w-full bg-[#1e1e2e] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all appearance-none"
                      >
                        {voices.map((v) => (
                          <option key={v.voice_id} value={v.voice_id}>
                            {v.display_name} ({v.language})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#94a3b8] mb-2">Speech Speed ({speed}x)</label>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.1"
                        value={speed}
                        onChange={(e) => setSpeed(parseFloat(e.target.value))}
                        className="w-full h-2 bg-[#1e1e2e] rounded-lg appearance-none cursor-pointer accent-[#6366f1] mt-4"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'photo' && (
              <motion.div
                key="photo-tab"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6 space-y-6">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#1e1e2e] rounded-2xl p-8 hover:border-[#6366f1]/50 transition-all group relative overflow-hidden">
                    {photoPreview ? (
                      <div className="relative w-full aspect-square max-w-xs rounded-xl overflow-hidden">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg text-white hover:bg-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-3 text-[#94a3b8] group-hover:text-white transition-colors"
                      >
                        <div className="p-4 bg-[#1e1e2e] rounded-full group-hover:bg-[#6366f1]/10 transition-colors">
                          <Upload size={32} />
                        </div>
                        <div className="text-center">
                          <p className="font-bold">Upload Portrait Photo</p>
                          <p className="text-xs">JPG, PNG up to 10MB</p>
                        </div>
                      </button>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                      accept="image/*" 
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-[#94a3b8]">Script / Text</label>
                      <button 
                        onClick={() => setScript('')}
                        className="text-xs text-[#94a3b8] hover:text-[#ef4444] flex items-center gap-1 transition-colors"
                        title="Clear Script"
                      >
                        <Eraser size={12} />
                        <span>Clear</span>
                      </button>
                    </div>
                    <textarea
                      value={script}
                      onChange={(e) => setScript(e.target.value.slice(0, 1500))}
                      rows={6}
                      placeholder="What should your photo say?"
                      className="w-full bg-[#1e1e2e] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#94a3b8] mb-2">Voice Selector</label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full bg-[#1e1e2e] border border-[#1e1e2e] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] transition-all appearance-none"
                    >
                      {voices.map((v) => (
                        <option key={v.voice_id} value={v.voice_id}>
                          {v.display_name} ({v.language})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'template' && (
              <motion.div
                key="template-tab"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6">
                  <h3 className="font-bold text-white mb-4">Select a Template</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <button
                        key={template.template_id}
                        onClick={() => setSelectedTemplate(template)}
                        className={cn(
                          "group relative aspect-video rounded-xl overflow-hidden border-2 transition-all",
                          selectedTemplate?.template_id === template.template_id 
                            ? "border-[#6366f1] ring-2 ring-[#6366f1]/20" 
                            : "border-[#1e1e2e] hover:border-[#6366f1]/50"
                        )}
                      >
                        <img src={template.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <CheckCircle2 className="text-white" size={24} />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-[10px] font-bold text-white truncate">{template.name}</p>
                        </div>
                      </button>
                    ))}
                    {templates.length === 0 && (
                      <div className="col-span-full py-12 text-center text-[#94a3b8]">
                        <Layout size={32} className="mx-auto mb-2 opacity-20" />
                        <p>No templates found in your account</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || isLoading}
            className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-[#6366f1]/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Generating Video...
              </>
            ) : (
              <>
                <Play size={24} fill="currentColor" />
                Generate {activeTab === 'template' ? 'from Template' : 'AI Video'}
              </>
            )}
          </button>
        </div>

        {/* Sidebar Options */}
        <div className="space-y-6">
          {/* Contextual Sidebar Content */}
          <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              {activeTab === 'avatar' ? <Users size={18} className="text-[#6366f1]" /> : 
               activeTab === 'photo' ? <ImageIcon size={18} className="text-[#6366f1]" /> :
               <Layout size={18} className="text-[#6366f1]" />}
              {activeTab === 'avatar' ? 'Selected Avatar' : 
               activeTab === 'photo' ? 'Talking Photo' : 'Template Info'}
            </h4>
            
            {activeTab === 'avatar' && (
              selectedAvatar ? (
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-[#6366f1]">
                  <img 
                    src={avatars.find(a => a.avatar_id === selectedAvatar)?.preview_image_url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-bold text-sm truncate">
                      {avatars.find(a => a.avatar_id === selectedAvatar)?.avatar_name}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/dashboard/avatars')}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-[#6366f1] transition-colors"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('/dashboard/avatars')}
                  className="w-full aspect-[3/4] border-2 border-dashed border-[#1e1e2e] rounded-xl flex flex-col items-center justify-center gap-3 text-[#94a3b8] hover:border-[#6366f1]/50 hover:text-white transition-all"
                >
                  <PlusCircle size={32} />
                  <span className="font-bold">Select Avatar</span>
                </button>
              )
            )}

            {activeTab === 'photo' && (
              <div className="text-sm text-[#94a3b8] space-y-4">
                <p>Talking Photos allow you to animate any static portrait image with AI speech.</p>
                <div className="p-3 bg-[#1e1e2e] rounded-xl border border-[#1e1e2e]">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1">Tips</p>
                  <ul className="text-xs list-disc pl-4 space-y-1">
                    <li>Use clear, front-facing portraits</li>
                    <li>Ensure good lighting on the face</li>
                    <li>Avoid busy backgrounds</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'template' && (
              selectedTemplate ? (
                <div className="space-y-4">
                  <div className="aspect-video rounded-xl overflow-hidden">
                    <img src={selectedTemplate.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{selectedTemplate.name}</p>
                    <p className="text-xs text-[#94a3b8] mt-1">ID: {selectedTemplate.template_id.slice(0, 12)}...</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#94a3b8]">Select a template from the list to see details and customize variables.</p>
              )
            )}
          </div>

          {/* Video Settings (only for non-templates) */}
          {activeTab !== 'template' && (
            <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-6 space-y-6">
              <h4 className="font-bold text-white mb-4">Video Settings</h4>
              
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-3">Dimensions</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '16:9 HD', w: 1280, h: 720 },
                    { label: '9:16 Vertical', w: 720, h: 1280 },
                  ].map((dim) => (
                    <button
                      key={dim.label}
                      onClick={() => setDimension({ width: dim.w, height: dim.h })}
                      className={cn(
                        "py-2 rounded-lg text-xs font-bold border transition-all",
                        dimension.width === dim.w 
                          ? "bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]" 
                          : "bg-[#1e1e2e] text-[#94a3b8] border-[#1e1e2e]"
                      )}
                    >
                      {dim.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'avatar' && (
                <div>
                  <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-3">Background Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 bg-[#1e1e2e] border border-[#1e1e2e] rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
