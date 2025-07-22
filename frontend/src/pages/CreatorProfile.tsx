import React, { useState } from 'react';
import nlp from 'compromise';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creatorProfileAPI, analysisAPI } from '../services/api';
import { CreatorProfile, AnalysisResponse } from '../types';
import { Brain, Save, Plus, TrendingUp } from 'lucide-react';

// Allow prompt to be attached for UI filtering
type AnalysisResponseWithPrompt = AnalysisResponse & { prompt?: string };

interface ProfileForm {
  profile_name: string;
  niche_description: string;
  keywords: string;
  brand_voice?: string;
  negative_keywords?: string;
  social_platform: string;
  social_handle: string;
  audience_data: string;
}


// --- FollowupPromptModal component ---
type FollowupPromptModalProps = {
  analysisResult: AnalysisResponseWithPrompt;
  setAnalysisResult: (r: AnalysisResponseWithPrompt | null) => void;
  profileId: number;
};

const FollowupPromptModal: React.FC<FollowupPromptModalProps> = ({ analysisResult, setAnalysisResult, profileId }) => {
  const [prompt, setPrompt] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <div className="mt-6">
      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Ask a follow-up or request deeper insights</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);
  try {
    const result = await analysisAPI.analyzeAudience(profileId, prompt);
    // Attach the prompt to the result so the parent can use it for filtering
    setAnalysisResult({ ...result, prompt });
    // Optionally, store globally for fallback (for demo/dev)
    if (typeof window !== 'undefined') {
      (window as any).lastAudiencePrompt = prompt;
    }
    setPrompt('');
  } catch (err) {
    setError('Failed to get follow-up insights.');
  } finally {
    setLoading(false);
  }
        }}
        className="flex flex-col gap-2"
      >
        <textarea
          className="input-field dark:bg-[#18181f] dark:text-white dark:border-[#232336]"
          placeholder="e.g., What are some niche audience segments I should target?"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={2}
        />
        <div className="flex items-center gap-2">
          <button type="submit" className="btn-primary" disabled={loading || !prompt.trim()}>
            {loading ? 'Requesting...' : 'Update Insights'}
          </button>
          {error && <span className="text-red-500 text-sm">{error}</span>}
        </div>
      </form>
    </div>
  );
};

const CreatorProfilePage: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
const [analysisResult, setAnalysisResult] = useState<AnalysisResponseWithPrompt | null>(null);
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);
  const [editingProfile, setEditingProfile] = useState<CreatorProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ['creator-profiles'],
    queryFn: creatorProfileAPI.getAll,
  });

  React.useEffect(() => {
    setAnalysisResult(null);
  }, [profiles]);

  const createProfileMutation = useMutation({
    mutationFn: creatorProfileAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-profiles'] });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: ({ profileId, additionalContext }: { profileId: number; additionalContext?: string }) =>
      analysisAPI.analyzeAudience(profileId, additionalContext),
  });

  const deleteProfileMutation = useMutation({
    mutationFn: creatorProfileAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-profiles'] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => creatorProfileAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-profiles'] });
      setShowEditModal(false);
      setEditingProfile(null);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProfileForm>();

  const onSubmit = async (data: ProfileForm) => {
    const keywords = data.keywords.split(',').map(k => k.trim()).filter(k => k);
    const negative_keywords = data.negative_keywords?.split(',').map(k => k.trim()).filter(k => k) || [];
    try {
      await createProfileMutation.mutateAsync({
        profile_name: data.profile_name,
        niche_description: data.niche_description,
        keywords,
        brand_voice: data.brand_voice,
        negative_keywords,
        social_platform: data.social_platform,
        social_handle: data.social_handle,
        audience_data: data.audience_data,
      });
      reset();
    } catch (error) {
      console.error('Failed to create profile:', error);
    }
  };

  const handleAnalyze = async (profileId: number) => {
    setIsAnalyzing(true);
    setCurrentProfileId(profileId);
    try {
      const result = await analyzeMutation.mutateAsync({ profileId });
      setAnalysisResult(result);
    } catch (error) {
      console.error('Failed to analyze audience:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Creator Profile</h1>
        <p className="text-gray-600 dark:text-gray-200">Manage your creator profile and analyze your audience</p>
      </div>

      {/* Create New Profile */}
      <div className="card bg-white/90 dark:bg-[#232336]/90">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Profile Name
            </label>
            <input
              {...register('profile_name', { required: 'Profile name is required' })}
              className={`input-field mt-1 ${errors.profile_name ? 'border-red-300' : ''} dark:bg-[#18181f] dark:text-white dark:border-[#232336]`}
              placeholder="e.g., Trendulum Gaming"
            />
            {errors.profile_name && (
              <p className="mt-1 text-sm text-red-600">{errors.profile_name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Niche Description
            </label>
            <textarea
              {...register('niche_description', { required: 'Niche description is required' })}
              rows={3}
              className={`input-field mt-1 ${errors.niche_description ? 'border-red-300' : ''} dark:bg-[#18181f] dark:text-white dark:border-[#232336]`}
              placeholder="Describe your content niche (e.g., sustainable fashion for petite women, vintage sci-fi book reviews)"
            />
            {errors.niche_description && (
              <p className="mt-1 text-sm text-red-600">{errors.niche_description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Keywords (comma-separated)
            </label>
            <input
              {...register('keywords', { required: 'Keywords are required' })}
              className={`input-field mt-1 ${errors.keywords ? 'border-red-300' : ''} dark:bg-[#18181f] dark:text-white dark:border-[#232336]`}
              placeholder="e.g., Nintendo, Final Fantasy, retro gaming"
            />
            {errors.keywords && (
              <p className="mt-1 text-sm text-red-600">{errors.keywords.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Brand Voice (Optional)
            </label>
            <input
              {...register('brand_voice')}
              className="input-field mt-1 dark:bg-[#18181f] dark:text-white dark:border-[#232336]"
              placeholder="e.g., Witty and sarcastic, educational, inspirational"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Negative Keywords (Optional, comma-separated)
            </label>
            <input
              {...register('negative_keywords')}
              className="input-field mt-1 dark:bg-[#18181f] dark:text-white dark:border-[#232336]"
              placeholder="e.g., speedrunning, modern games"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Social Platform</label>
            <select {...register('social_platform', { required: 'Social platform is required' })} className="input-field mt-1 dark:bg-[#18181f] dark:text-white dark:border-[#232336]">
              <option value="">Select platform</option>
              <option value="YouTube">YouTube</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="Twitter">Twitter</option>
            </select>
            <input
              {...register('social_handle', { required: 'Social handle or URL is required' })}
              className="input-field mt-1 dark:bg-[#18181f] dark:text-white dark:border-[#232336]"
              placeholder="e.g., @yourhandle or full URL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Audience Data
            </label>
            <textarea
              {...register('audience_data', { required: 'Audience data is required' })}
              rows={4}
              className={`input-field mt-1 ${errors.audience_data ? 'border-red-300' : ''} dark:bg-[#18181f] dark:text-white dark:border-[#232336]`}
              placeholder="Describe your audience, their interests, comments they leave, brands they mention, etc."
            />
            {errors.audience_data && (
              <p className="mt-1 text-sm text-red-600">{errors.audience_data.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={createProfileMutation.isPending}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            {createProfileMutation.isPending ? 'Creating...' : 'Create Profile'}
          </button>
        </form>
      </div>

      {/* Existing Profiles */}
      {profiles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Profiles</h2>
          {profiles.map((profile) => (
            <div key={profile.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {profile.niche_description}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Keywords: {profile.keywords.join(', ')}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Created: {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                  
                  {profile.taste_profile && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Brain className="h-4 w-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">
                            Audience analyzed
                          </span>
                        </div>
                        <button
                          className="btn-primary bg-blue-500 hover:bg-blue-600 text-white ml-2 px-3 py-1 rounded"
                          onClick={() => {
                            // Extract recommendations from analysis_notes if present
                            let recommendations: string[] = [];
                            const notes = profile.taste_profile?.analysis_notes;
                            if (notes) {
                              if (Array.isArray(notes)) {
                                recommendations = notes;
                              } else if (typeof notes === 'string') {
                                recommendations = [notes];
                              }
                            }
                            setCurrentProfileId(profile.id);
                            setAnalysisResult({ taste_profile: profile.taste_profile, recommendations });
                          }}
                        >
                          View Audience Insights
                        </button>
                      </div>
                      {profile.taste_profile.confidence_score && (
                        <p className="text-xs text-green-700 mt-1">
                          Confidence score: {Math.round(profile.taste_profile.confidence_score * 100)}%
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2 items-end">
                  {!profile.taste_profile && (
                    <button
                      onClick={() => handleAnalyze(profile.id)}
                      disabled={isAnalyzing}
                      className="btn-primary flex items-center"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Audience'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this profile?')) {
                        deleteProfileMutation.mutate(profile.id);
                      }
                    }}
                    className="btn-primary bg-red-500 hover:bg-red-600 text-white flex items-center"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setEditingProfile(profile);
                      // Pre-fill the form with the selected profile's data
                      reset({
                        profile_name: profile.profile_name || '',
                        niche_description: profile.niche_description || '',
                        keywords: profile.keywords ? profile.keywords.join(', ') : '',
                        brand_voice: profile.brand_voice || '',
                        negative_keywords: profile.negative_keywords ? profile.negative_keywords.join(', ') : '',
                        social_platform: profile.social_platform || '',
                        social_handle: profile.social_handle || '',
                        audience_data: profile.audience_data || '',
                      });
                      setShowEditModal(true);
                    }}
                    className="btn-primary bg-blue-500 hover:bg-blue-600 text-white flex items-center"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
          {/* Edit Modal */}
          {showEditModal && editingProfile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white dark:bg-[#232336] p-6 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
                <form
                  onSubmit={handleSubmit(async (data) => {
                    const keywords = data.keywords.split(',').map(k => k.trim()).filter(k => k);
                    const negative_keywords = data.negative_keywords?.split(',').map(k => k.trim()).filter(k => k) || [];
                    await updateProfileMutation.mutateAsync({
                      id: editingProfile.id,
                      data: {
                        ...data,
                        keywords,
                        negative_keywords,
                      },
                    });
                  })}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Profile Name
                    </label>
                    <input
                      defaultValue={editingProfile.profile_name}
                      {...register('profile_name', { required: 'Profile name is required' })}
                      className={`input-field mt-1 ${errors.profile_name ? 'border-red-300' : ''} dark:bg-[#18181f] dark:text-white dark:border-[#232336]`}
                      placeholder="e.g., Trendulum Gaming"
                    />
                    {errors.profile_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.profile_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Keywords (comma-separated)
                    </label>
                    <input
                      defaultValue={editingProfile.keywords.join(', ')}
                      {...register('keywords', { required: 'Keywords are required' })}
                      className="input-field mt-1 dark:bg-[#18181f] dark:text-white dark:border-[#232336]"
                      placeholder="e.g., Nintendo, Final Fantasy, retro gaming"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Brand Voice (Optional)
                    </label>
                    <input
                      defaultValue={editingProfile.brand_voice}
                      {...register('brand_voice')}
                      className="input-field mt-1 dark:bg-[#18181f] dark:text-white dark:border-[#232336]"
                      placeholder="e.g., Witty and sarcastic, educational, inspirational"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Negative Keywords (Optional, comma-separated)
                    </label>
                    <input
                      defaultValue={editingProfile.negative_keywords ? editingProfile.negative_keywords.join(', ') : ''}
                      {...register('negative_keywords')}
                      className="input-field mt-1 dark:bg-[#18181f] dark:text-white dark:border-[#232336]"
                      placeholder="e.g., speedrunning, modern games"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Social Platform</label>
                      <select defaultValue={editingProfile.social_platform} {...register('social_platform', { required: 'Social platform is required' })} className={`input-field mt-1 dark:bg-[#18181f] dark:text-white dark:border-[#232336]`}>
                        <option value="">Select platform</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Instagram">Instagram</option>
                        <option value="TikTok">TikTok</option>
                        <option value="Twitter">Twitter</option>
                      </select>
                      <input
                        defaultValue={editingProfile.social_handle}
                        {...register('social_handle', { required: 'Social handle or URL is required' })}
                        className="input-field mt-1 dark:bg-[#18181f] dark:text-white dark:border-[#232336]"
                        placeholder="e.g., @yourhandle or full URL"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Audience Data
                    </label>
                    <textarea
                      defaultValue={editingProfile.audience_data}
                      {...register('audience_data', { required: 'Audience data is required' })}
                      rows={4}
                      className={`input-field mt-1 ${errors.audience_data ? 'border-red-300' : ''}`}
                      placeholder="Describe your audience, their interests, comments they leave, brands they mention, etc."
                    />
                    {errors.audience_data && (
                      <p className="mt-1 text-sm text-red-600">{errors.audience_data.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn-primary bg-gray-400"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && currentProfileId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-[#232336] rounded-2xl shadow-2xl w-full max-w-3xl relative max-h-[90vh] flex flex-col border border-gray-200 dark:border-[#232336]">
            {/* Floating close button */}
            <button
              className="absolute -top-4 -right-4 bg-white dark:bg-[#232336] border border-gray-300 dark:border-[#232336] rounded-full shadow-lg w-10 h-10 flex items-center justify-center text-2xl text-gray-500 hover:text-blue-600 hover:scale-110 transition-all z-50"
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
              onClick={() => setAnalysisResult(null)}
              aria-label="Close audience insights"
            >
              &times;
            </button>
            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-[#232336] rounded-t-2xl px-8 pt-6 pb-3 border-b border-gray-100 dark:border-[#232336] flex flex-col gap-1 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Audience Insights</h2>
              <span className="text-sm text-gray-500 dark:text-gray-300">Deep dive into your audience's interests and trends</span>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
              {/* Taste Profile Details */}
              {analysisResult.taste_profile?.taste_profile && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Audience Taste Profile</h3>
                  <hr className="mb-6 border-gray-200 dark:border-[#232336]" />
                  {/* --- Dynamic domain/entity filtering based on prompt --- */}
                  {(() => {
                    // Get the prompt from the follow-up modal if present
                    let prompt = '';
                    if (analysisResult && (analysisResult as any).prompt) {
                      prompt = (analysisResult as any).prompt;
                    }
                    if (!prompt && typeof window !== 'undefined' && (window as any).lastAudiencePrompt) {
                      prompt = (window as any).lastAudiencePrompt;
                    }

                    // --- compromise NLP-based prompt parsing for domain/entity display ---
                    const normalize = (str: string) => str.trim().toLowerCase().replace(/ /g, '_');
                    const denormalize = (str: string) => str.replace(/_/g, ' ');
                    const availableDomains = Object.keys(analysisResult.taste_profile.taste_profile);
                    // Map: normalized label -> domain key
                    const labelToDomain: Record<string, string> = {};
                    availableDomains.forEach(domain => {
                      labelToDomain[normalize(denormalize(domain))] = domain;
                    });

                    // Use compromise to extract all nouns/entities from the prompt
                    const promptLower = prompt.toLowerCase();
                    let showMoreDomains: Record<string, number> = {};
                    let onlyShowDomains: Set<string> = new Set();
                    let hideDomains: Set<string> = new Set();

                    // Extract all noun phrases and single nouns
                    let doc = nlp(promptLower);
                    let nounPhrases = doc.nouns().out('array');
                    // Also extract single words for fuzzy matching
                    let words = doc.terms().out('array');

                    // Fuzzy match: if a noun phrase or word matches a domain, consider it mentioned
                    const mentionedDomains = new Set<string>();
                    nounPhrases.concat(words).forEach((np: string) => {
                      const norm = normalize(np);
                      if (labelToDomain[norm]) {
                        mentionedDomains.add(labelToDomain[norm]);
                      } else {
                        // Try partial match
                        for (const key in labelToDomain) {
                          if (norm.includes(key) || key.includes(norm)) {
                            mentionedDomains.add(labelToDomain[key]);
                          }
                        }
                      }
                    });

                    // Intent detection: look for intent words near domain mentions
                    // If "only" or "just" is near a domain, treat as onlyShow
                    // If "hide" or "remove" is near a domain, treat as hide
                    // If "less" is near a domain, show fewer (not implemented, fallback to hide)
                    // Otherwise, treat as showMore
                    mentionedDomains.forEach(domain => {
                      // Find the index of the domain in the prompt
                      const domainLabel = denormalize(domain);
                      const idx = promptLower.indexOf(domainLabel);
                      let windowText = '';
                      if (idx !== -1) {
                        windowText = promptLower.slice(Math.max(0, idx - 15), idx + domainLabel.length + 15);
                      }
                      if (/only|just/.test(windowText)) {
                        onlyShowDomains.add(domain);
                      } else if (/hide|remove|less/.test(windowText)) {
                        hideDomains.add(domain);
                      } else {
                        showMoreDomains[domain] = 10;
                      }
                    });

                    // Build filtered domain list
                    let entries = Object.entries(analysisResult.taste_profile.taste_profile)
                      .filter(([_, data]) => !(data as any)?.error);
                    if (onlyShowDomains.size > 0) {
                      entries = entries.filter(([domain]) => onlyShowDomains.has(domain));
                    } else if (hideDomains.size > 0) {
                      entries = entries.filter(([domain]) => !hideDomains.has(domain));
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {entries.map(([domain, data]) => {
                          const domainData = data as any;
                          const entities = Array.isArray(domainData.entities) ? domainData.entities : [];
                          if (!entities.length) return null;
                          // Sort by popularity if available, descending
                          const sorted = [...entities].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                          // Show more entities if requested for this domain, or top N if specified
                          const nEntities = showMoreDomains[domain] || 3;
                          const topEntities = sorted.slice(0, nEntities);
                          // Build a summary sentence
                          const names = topEntities.map(e => e.name).join(', ');
                          const domainLabel = domain.replace(/_/g, ' ');
                          return (
                            <div
                              key={domain}
                              className="bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-[#18181f] dark:via-[#232336] dark:to-[#232336] rounded-xl shadow-md p-6 flex flex-col gap-3 border border-gray-100 dark:border-[#232336] hover:shadow-xl transition-shadow"
                            >
                              <h4 className="text-lg font-bold capitalize text-blue-700 dark:text-blue-300 mb-1 tracking-wide flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-600" />
                                {domainLabel}
                              </h4>
                              <p className="text-sm text-gray-700 dark:text-gray-200 mb-3">
                                <span className="font-semibold text-blue-800 dark:text-blue-200">{domainLabel}</span> examples: <span className="font-semibold">{names}</span>
                              </p>
                              <div className="flex flex-col gap-4">
                                {topEntities.map((entity: any) => (
                                  <div
                                    key={entity.entity_id}
                                    className="flex items-start gap-4 bg-white dark:bg-[#232336] rounded-lg p-3 border border-gray-100 dark:border-[#232336] shadow-sm hover:shadow-md transition-shadow"
                                  >
                                    {entity.properties?.image?.url && (
                                      <img src={entity.properties.image.url} alt={entity.name} className="w-14 h-14 rounded-lg object-cover border border-gray-200 dark:border-[#232336] shadow" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-base text-gray-900 dark:text-white truncate">{entity.name}</div>
                              {entity.properties?.short_descriptions?.[0]?.value && (
                                <div className="text-xs text-gray-600 dark:text-gray-300 mb-1 line-clamp-2">
                                  {(() => {
                                    const desc = entity.properties.short_descriptions[0].value;
                                    // Simple language detection: check for non-ASCII chars or use regex for non-English scripts
                                    const isEnglish = /^[\x00-\x7F]*$/.test(desc);
                                    if (isEnglish) return desc;
                                    // If not English, use a translation API (e.g., Google Translate)
                                    // For demo: show placeholder, but you can wire up an actual API call here
                                    return '[Translated] ' + desc;
                                  })()}
                                </div>
                              )}
                                      {entity.tags && entity.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {entity.tags.slice(0, 3).map((tag: any) => (
                                            <span key={tag.id} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full font-medium">
                                              {tag.name}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                      {typeof entity.popularity === 'number' && (
                                        <div className="text-xs text-gray-400 mt-1">Popularity: {(entity.popularity * 100).toFixed(1)}%</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Follow-up Prompt */}
              <FollowupPromptModal analysisResult={analysisResult} setAnalysisResult={setAnalysisResult} profileId={currentProfileId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorProfilePage;