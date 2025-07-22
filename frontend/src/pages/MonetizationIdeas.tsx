import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creatorProfileAPI, monetizationAPI } from '../services/api';
import { MonetizationIdea } from '../types';
import { Save, Trash2, Sparkles, Lightbulb } from 'lucide-react';

const MonetizationIdeas: React.FC = () => {
  const queryClient = useQueryClient();

  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
  const [constraints, setConstraints] = useState('');

  const { data: profiles = [] } = useQuery({
    queryKey: ['creator-profiles'],
    queryFn: creatorProfileAPI.getAll,
  });

  const { data: monetizationIdeas = [] } = useQuery({
    queryKey: ['monetizationIdeas'],
    queryFn: monetizationAPI.getAll,
  });

  const generateMutation = useMutation({
    mutationFn: ({ profileId, constraints }: { profileId: number; constraints?: string }) =>
      monetizationAPI.generateIdeas(profileId, constraints),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monetizationIdeas'] }),
  });

  const saveMutation = useMutation({
    mutationFn: monetizationAPI.saveIdea,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monetizationIdeas'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: monetizationAPI.deleteIdea,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monetizationIdeas'] }),
  });

  const handleGenerate = async () => {
    if (!selectedProfile) return;
    try {
      await generateMutation.mutateAsync({ profileId: selectedProfile, constraints });
    } catch (err) {
      console.error("Generation failed", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Monetization Ideas</h1>
        <p className="text-gray-600 dark:text-gray-200">Generate brand collaboration ideas for your creator profile</p>
      </div>

      {/* Generate Form */}
      <div className="card bg-white/90 dark:bg-[#232336]/90 p-5 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Generate New Ideas</h2>

        {/* Profile Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
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

        {/* Optional Constraints */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Additional Constraints (Optional)
          </label>
          <textarea
            rows={3}
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            className="input-field dark:bg-[#18181f] dark:text-white dark:border-[#232336]"
            placeholder="e.g. food brands, eco-friendly only..."
          />
        </div>

        <button
          className="btn-primary flex items-center dark:bg-pink-400 dark:text-white dark:hover:bg-pink-500"
          onClick={handleGenerate}
          disabled={!selectedProfile || generateMutation.isPending}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {generateMutation.isPending ? 'Generating...' : 'Generate Ideas'}
        </button>
      </div>

      {/* Ideas */}
      {monetizationIdeas.length === 0 ? (
        <div className="card text-center py-12 bg-white/90 dark:bg-[#232336]/90">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No monetization ideas yet</h3>
          <p className="text-gray-600 dark:text-gray-200">
            Generate your first monetization idea to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {monetizationIdeas.map((idea) => (
            <div key={idea.id} className="card bg-white/90 dark:bg-[#232336]/90 p-4 rounded-lg shadow-sm">
              <div className="flex items-start justify-between mb-3 gap-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{idea.brand_name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveMutation.mutate(idea.id)}
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
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
                        deleteMutation.mutate(idea.id);
                      }
                    }}
                    className="p-2 rounded-lg transition-colors text-red-500 hover:text-white hover:bg-red-500 dark:hover:bg-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-1 dark:text-gray-200">{idea.pitch_angle}</p>

              {idea.why_it_works && (
                <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 dark:bg-blue-900 dark:border-blue-600">
                  <p className="text-xs text-blue-800 font-semibold dark:text-blue-200">Why it works:</p>
                  <p className="text-xs text-blue-700 dark:text-blue-100">{idea.why_it_works}</p>
                </div>
              )}

              <div className="mt-3">
                <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200">Taste Alignment:</h4>
                <p className="text-xs text-gray-600 dark:text-gray-200">{idea.taste_alignment}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-[#232336]">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-pink-400 dark:text-white">
                  {idea.collaboration_type}
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
  );
};

export default MonetizationIdeas;
