export interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface CreatorProfile {
    id: number;
    user_id: number;
    profile_name: string;
    niche_description: string;
    keywords: string[];
    brand_voice?: string;
    negative_keywords?: string[];
    social_platform: string;
    social_handle: string;
    audience_data: string;
    taste_profile?: any;
    created_at: string;
    updated_at: string;
}

export interface TasteProfile {
  taste_profile: {
    primary_affinities: Record<string, any>;
    cross_domain_patterns: string[];
    audience_persona: string;
  };
  cultural_insights: {
    trending_topics: string[];
    cultural_movements: string[];
    emerging_interests: string[];
  };
  entities_analyzed: string[];
  confidence_score: number;
}

export interface ContentIdea {
    id: number;
    user_id: number;
    creator_profile_id: number;
    title: string;
    concept: string;
    content_type: string;
    visual_elements: string[];
    call_to_action: string;
    why_it_works?: string;
    is_saved: boolean;
    generated_at: string;
}

export interface MonetizationIdea {
    id: number;
    user_id: number;
    creator_profile_id: number;
    brand_name: string;
    collaboration_type: string;
    pitch_angle: string;
    taste_alignment: string;
    why_it_works?: string;
    is_saved: boolean;
    generated_at: string;
}

export interface AnalysisResponse {
    taste_profile: {
        taste_profile: any;
    };
    recommendations: string[];
}

export interface ContentGenerationResponse {
  ideas: ContentIdea[];
  total_generated: number;
}

export interface MonetizationGenerationResponse {
  ideas: MonetizationIdea[];
  total_generated: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
} 