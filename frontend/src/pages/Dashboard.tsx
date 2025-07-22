import React from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import {
  creatorProfileAPI,
  contentAPI,
  monetizationAPI,
} from '../services/api';
import {
  Lightbulb,
  DollarSign,
  TrendingUp,
  Users,
  Plus,
  ArrowRight,
  Save,
  Trash2,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: profiles = [] } = useQuery({
    queryKey: ['creator-profiles'],
    queryFn: creatorProfileAPI.getAll,
  });

  const { data: contentIdeas = [] } = useQuery({
    queryKey: ['content-ideas'],
    queryFn: contentAPI.getAll,
  });

  const { data: monetizationIdeas = [] } = useQuery({
    queryKey: ['monetization-ideas'],
    queryFn: monetizationAPI.getAll,
  });

  const savedIdeas = contentIdeas.filter((idea: any) => idea.is_saved);
  const recentIdeas = contentIdeas.slice(0, 3);
  const recentMonetizationIdeas = monetizationIdeas.slice(0, 3);

  const stats = [
    {
      name: 'Creator Profiles',
      value: profiles.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Content Ideas',
      value: contentIdeas.length,
      icon: Lightbulb,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Saved Ideas',
      value: savedIdeas.length,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Monetization Ideas',
      value: monetizationIdeas.length,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-white/90 dark:bg-[#18181f]/90 shadow-xl border-0 backdrop-blur-lg p-8 relative overflow-hidden">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-200">
          Ready to create amazing content that resonates with your audience? Let's get started!
        </p>
        <div className="mt-6 flex gap-4">
          <Link to="/profile">
            <Button>Go to Profile</Button>
          </Link>
          <Link to={profiles.length > 0 ? `/content-ideas/${profiles[0].id}` : '/content-ideas'}>
            <Button>Generate Ideas</Button>
          </Link>
          <Link to={profiles.length > 0 ? `/monetization-ideas/${profiles[0].id}` : '/monetization-ideas'}>
            <Button>Monetization Ideas</Button>
          </Link>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat: any) => (
          <Card key={stat.name} className="flex items-center gap-4 bg-white/90 dark:bg-[#18181f]/90 shadow-lg border-0 hover:scale-105 transition-transform duration-300">
            <div className={`p-3 rounded-xl ${stat.bgColor} shadow-inner dark:bg-gradient-to-br dark:from-purple-800/60 dark:via-[#2d0b3a]/60 dark:to-pink-900/40`}>
              <stat.icon className={`h-7 w-7 ${stat.color} dark:text-white`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase dark:text-gray-200">{stat.name}</p>
              <p className="text-2xl font-extrabold text-gray-900 drop-shadow-lg dark:text-white">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Content Ideas */}
      {recentIdeas.length > 0 && (
        <Card className="bg-white/90 dark:bg-[#18181f]/90 shadow-xl border-0 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Content Ideas</h3>
            <Link to="/content-ideas" className="flex items-center">
              <Button>
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentIdeas.map((idea: any) => (
              <Card key={idea.id} className="border border-gray-200 dark:border-[#2d0b3a] rounded-xl p-4 bg-white/90 dark:bg-[#18181f]/90 shadow-sm hover:scale-[1.02] transition-transform">
                <h4 className="font-medium text-gray-900 dark:text-white">{idea.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-200 mt-1 line-clamp-2">{idea.concept}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-pink-400 dark:text-white">
                    {idea.content_type}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-300">
                    {new Date(idea.generated_at).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Monetization Ideas */}
      {recentMonetizationIdeas.length > 0 && (
        <Card className="bg-white/90 dark:bg-[#18181f]/90 shadow-xl border-0 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Monetization Ideas</h3>
            <Link to={profiles.length > 0 ? `/monetization-ideas/${profiles[0].id}` : '/monetization-ideas'} className="flex items-center">
              <Button>
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentMonetizationIdeas.map((idea: any) => (
              <Card key={idea.id} className="border border-gray-200 dark:border-[#2d0b3a] rounded-xl p-4 bg-white/90 dark:bg-[#18181f]/90 shadow-sm hover:scale-[1.02] transition-transform">
                <h4 className="font-medium text-gray-900 dark:text-white">{idea.brand_name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-200 mt-1 line-clamp-2">{idea.pitch_angle}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-pink-400 dark:text-white">
                    {idea.collaboration_type}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-300">
                    {new Date(idea.generated_at).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
