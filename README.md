# Trendulum - Taste Architect for Creators

## 🎯 Project Overview

Trendulum is an AI-powered platform that empowers niche content creators to deeply understand their unique audience's evolving tastes, generate hyper-personalized content ideas, and unlock new monetization opportunities through Qloo's Taste AI™.

## 🚀 Core Features

- **Audience Taste Profiling**: Analyze creator's audience using Qloo's Taste AI™ to identify cross-domain affinities
- **AI-Powered Content Generation**: Generate hyper-personalized content ideas using LLM integration
- **Monetization Insights**: Discover brand collaboration opportunities aligned with audience tastes
- **Creator Dashboard**: Comprehensive analytics and idea management

## 🛠 Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **PostgreSQL** - Robust relational database
- **Qloo Taste AI™ API** - Cross-domain taste intelligence
- **OpenAI GPT-4** - Content generation and creative strategy

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Query** - Server state management
- **React Hook Form** - Form handling

### Deployment
- **Docker** - Containerization
- **Vercel** - Frontend hosting
- **Railway/Render** - Backend hosting

## 🏃‍♂️ Quick Start

### Prerequisites
- Python 3.9+
 Python 3.9+ (ensure compatibility)
 Node.js 18+ (ensure compatibility)
 PostgreSQL (ensure compatibility)
 Qloo API Key (store in .env, never commit)
 OpenAI API Key (store in .env, never commit)
### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
uvicorn main:app --reload
 # Edit .env with your API keys (do NOT commit .env)
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend URL
npm run dev
 # Edit .env with your backend URL (do NOT commit .env)
```

## 📱 Demo

Visit: [Demo URL will be added after deployment]

## 🎥 Demo Video

[Video URL will be added after recording]

## 🔑 API Integration

### Qloo Taste AI™
- Analyzes audience preferences across multiple domains
- Identifies cross-domain taste affinities
- Provides cultural context for content strategy

### OpenAI GPT-4
- Generates personalized content ideas
- Creates brand collaboration suggestions
- Provides creative strategy insights

## 💡 Innovation Highlights

1. **Cross-Domain Taste Intelligence**: First platform to leverage Qloo's unique taste profiling for content creators
2. **Hyper-Personalization**: Content ideas tailored to specific audience taste profiles
3. **Cultural Context**: Understanding of cultural trends and preferences
4. **Monetization Alignment**: Brand partnerships based on genuine taste affinity

## 🚀 Future Roadmap

- Multi-platform social media integration
- Advanced analytics dashboard
- Team collaboration features
- Brand matchmaking marketplace
- Mobile application

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

This project was built for the QLOO Hackathon. For questions or collaboration, please reach out to the development team.

---

**Built with ❤️ for the QLOO Hackathon** 