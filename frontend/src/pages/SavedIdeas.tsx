import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { contentAPI, monetizationAPI } from '../services/api';
import { ContentIdea, MonetizationIdea } from '../types';
import { Bookmark } from 'lucide-react';

const SavedIdeasPage: React.FC = () => {
  const { data: savedContentIdeas = [], isLoading: isLoadingContent } = useQuery<ContentIdea[]>({
    queryKey: ['saved-content-ideas'],
    queryFn: contentAPI.getSaved,
  });

  const { data: savedMonetizationIdeas = [], isLoading: isLoadingMonetization } = useQuery<MonetizationIdea[]>({
    queryKey: ['saved-monetization-ideas'],
    queryFn: monetizationAPI.getSaved,
  });

  const isLoading = isLoadingContent || isLoadingMonetization;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Bookmark className="h-6 w-6 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Ideas</h1>
          <p className="text-gray-600">Your collection of saved content and monetization strategies.</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500">Loading your saved ideas...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Saved Content Ideas */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Content Ideas</h2>
            {savedContentIdeas.length > 0 ? (
              <div className="space-y-4">
                {savedContentIdeas.map((idea: ContentIdea) => (
                  <div key={idea.id} className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800">{idea.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{idea.concept}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">You haven't saved any content ideas yet.</p>
            )}
          </div>

          {/* Saved Monetization Ideas */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Monetization Ideas</h2>
            {savedMonetizationIdeas.length > 0 ? (
              <div className="space-y-4">
                {savedMonetizationIdeas.map((idea: MonetizationIdea) => (
                  <div key={idea.id} className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800">{idea.brand_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{idea.pitch_angle}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">You haven't saved any monetization ideas yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedIdeasPage; 