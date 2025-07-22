import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { creatorProfileAPI, contentAPI } from '../services/api';
import { useQueryClient } from '@tanstack/react-query';
import { ContentIdea } from '../types';
import { Lightbulb, Save, Plus, Sparkles } from 'lucide-react';
import { Trash } from '../components/ui/trash';


const ContentIdeas: React.FC = () => {


  const deleteIdeaMutation = useMutation({
    mutationFn: async (ideaId: number) => {
      await contentAPI.deleteIdea(ideaId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
    },
  });

  const handleDeleteIdea = async (ideaId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this idea? This action cannot be undone.');
    if (!confirmed) return;
    try {
      await deleteIdeaMutation.mutateAsync(ideaId);
      setLocalIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
    } catch (error) {
      console.error('Failed to delete idea:', error);
    }
  };
  
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
  const [contentType, setContentType] = useState('tiktok');
  const [additionalConstraints, setAdditionalConstraints] = useState('');
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ['creator-profiles'],
    queryFn: creatorProfileAPI.getAll,
  });

  const { data: contentIdeas = [] } = useQuery({
    queryKey: ['content-ideas'],
    queryFn: contentAPI.getAll,
  });

  const generateIdeasMutation = useMutation({
    mutationFn: ({ profileId, contentType, constraints }: {
      profileId: number;
      contentType: string;
      constraints?: string;
    }) => contentAPI.generateIdeas(profileId, contentType, constraints),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
    },
  });

  const saveIdeaMutation = useMutation({
    mutationFn: contentAPI.saveIdea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
    },
  });

  const [localIdeas, setLocalIdeas] = useState<ContentIdea[]>([]);
  useEffect(() => {
    setLocalIdeas(contentIdeas);
  }, [contentIdeas]);

  const handleGenerateIdeas = async () => {
    if (!selectedProfile) return;

    try {
      await generateIdeasMutation.mutateAsync({
        profileId: selectedProfile,
        contentType,
        constraints: additionalConstraints,
      });
    } catch (error) {
      console.error('Failed to generate ideas:', error);
    }
  };

  const handleSaveIdea = async (ideaId: number) => {
    try {
      await saveIdeaMutation.mutateAsync(ideaId);
    } catch (error) {
      console.error('Failed to save idea:', error);
    }
  };

  const contentTypes = [
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'blog', label: 'Blog Post' },
    { value: 'podcast', label: 'Podcast' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Ideas</h1>
        <p className="text-gray-600 dark:text-gray-200">Generate personalized content ideas for your audience</p>
      </div>

      {/* Generate Ideas Form */}
      <div className="card bg-white/90 dark:bg-[#232336]/90">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate New Ideas</h2>
        
        <div className="space-y-4">
          {/* Profile Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Select Creator Profile
            </label>
            <select
              value={selectedProfile || ''}
              onChange={(e) => setSelectedProfile(Number(e.target.value) || null)}
              className="input-field dark:bg-[#18181f] dark:text-white dark:border-[#232336]"
            >
              <option value="">Choose a profile</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.niche_description}
                </option>
              ))}
            </select>
          </div>

          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Content Type
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="input-field dark:bg-[#18181f] dark:text-white dark:border-[#232336]"
            >
              {contentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Constraints */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Additional Constraints (Optional)
            </label>
            <textarea
              value={additionalConstraints}
              onChange={(e) => setAdditionalConstraints(e.target.value)}
              rows={3}
              className="input-field dark:bg-[#18181f] dark:text-white dark:border-[#232336]"
              placeholder="Any specific requirements or themes you'd like to focus on..."
            />
          </div>

          <button
            onClick={handleGenerateIdeas}
            disabled={!selectedProfile || generateIdeasMutation.isPending}
            className="btn-primary flex items-center dark:bg-pink-400 dark:text-white dark:hover:bg-pink-500"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {generateIdeasMutation.isPending ? 'Generating...' : 'Generate Ideas'}
          </button>
        </div>
      </div>

      {/* Content Ideas List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Content Ideas</h2>
        
        {localIdeas.length === 0 ? (
          <div className="card text-center py-12 bg-white/90 dark:bg-[#232336]/90">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No content ideas yet</h3>
            <p className="text-gray-600 dark:text-gray-200">
              Generate your first content idea to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {localIdeas.map((idea) => (
              <div key={idea.id} className="card bg-white/90 dark:bg-[#232336]/90">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{idea.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveIdea(idea.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        idea.is_saved
                          ? 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-[#232336] dark:hover:text-white'
                      }`}
                      title={idea.is_saved ? 'Unsave' : 'Save'}
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteIdea(idea.id)}
                      className="p-2 rounded-lg transition-colors text-red-500 hover:text-white hover:bg-red-500 dark:hover:bg-red-600"
                      title="Discard"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-1 dark:text-gray-200">{idea.concept}</p>
                {idea.why_it_works && (
                  <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 dark:bg-blue-900 dark:border-blue-600">
                    <p className="text-xs text-blue-800 font-semibold dark:text-blue-200">Why it works:</p>
                    <p className="text-xs text-blue-700 dark:text-blue-100">{idea.why_it_works}</p>
                  </div>
                )}
                <div className="mt-3">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200">Visuals:</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-200">{idea.visual_elements.join(', ')}</p>
                </div>
                
                <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1 dark:text-white">Call to Action</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-200">{idea.call_to_action}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-[#232336]">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-pink-400 dark:text-white">
                      {idea.content_type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-300">
                      {new Date(idea.generated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentIdeas; 