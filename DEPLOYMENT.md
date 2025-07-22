# Deployment Guide for Trendulum

This guide will help you deploy Trendulum to various platforms for the QLOO Hackathon.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL (or Docker)
- Qloo API Key
- OpenAI API Key

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd trendulum
./setup.sh
```

### 2. Configure Environment Variables
Edit `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost/trendulum
SECRET_KEY=your-secret-key-here
QLOO_API_KEY=your-qloo-api-key
OPENAI_API_KEY=your-openai-api-key
```

### 3. Start the Application
```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
python main.py

# Terminal 2: Frontend
cd frontend
npm start
```

## 🌐 Production Deployment

### Option 1: Railway (Recommended for Hackathon)

#### Backend Deployment
1. Create account at [Railway](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables:
   - `DATABASE_URL` (Railway will provide PostgreSQL)
   - `SECRET_KEY`
   - `QLOO_API_KEY`
   - `OPENAI_API_KEY`
4. Deploy from `backend/` directory

#### Frontend Deployment
1. Use [Vercel](https://vercel.com) for frontend
2. Connect your GitHub repository
3. Set build settings:
   - Framework: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Add environment variable:
   - `REACT_APP_API_URL`: Your Railway backend URL

### Option 2: Render

#### Backend Deployment
1. Create account at [Render](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Environment: Python 3
5. Add environment variables

#### Frontend Deployment
1. Create new Static Site
2. Connect your GitHub repository
3. Configure:
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`

### Option 3: Heroku

#### Backend Deployment
1. Create account at [Heroku](https://heroku.com)
2. Install Heroku CLI
3. Create app and add PostgreSQL addon
4. Deploy:
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set SECRET_KEY=your-secret-key
heroku config:set QLOO_API_KEY=your-qloo-api-key
heroku config:set OPENAI_API_KEY=your-openai-api-key
git push heroku main
```

#### Frontend Deployment
1. Use [Netlify](https://netlify.com) for frontend
2. Connect your GitHub repository
3. Set build settings and environment variables

## 🐳 Docker Deployment

### Local Docker
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual services
docker build -t trendulum-backend .
docker build -t trendulum-frontend ./frontend
```

### Production Docker
1. Build production images
2. Push to Docker Hub or container registry
3. Deploy to your preferred platform

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Keys
QLOO_API_KEY=your-qloo-api-key
OPENAI_API_KEY=your-openai-api-key

# App Settings
APP_NAME=Trendulum
DEBUG=False
ALLOWED_HOSTS=["your-domain.com"]
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend-url.com
```

## 📊 Database Setup

### PostgreSQL (Production)
1. Create database
2. Run migrations (if using Alembic)
3. Update DATABASE_URL

### SQLite (Development)
For quick development, you can use SQLite:
```env
DATABASE_URL=sqlite:///./trendulum.db
```

## 🔒 Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **CORS**: Configure CORS properly for production
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Input Validation**: Validate all user inputs

## 📈 Monitoring and Logging

### Backend Logging
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

### Frontend Error Tracking
Consider adding Sentry or similar error tracking:
```bash
npm install @sentry/react
```

## 🚀 Performance Optimization

### Backend
1. Use connection pooling for database
2. Implement caching (Redis)
3. Optimize database queries
4. Use async/await properly

### Frontend
1. Code splitting
2. Lazy loading
3. Image optimization
4. Bundle analysis

## 📱 Mobile Responsiveness

The application is built with Tailwind CSS and is mobile-responsive by default.

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          # Add your deployment steps here

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          # Add your deployment steps here
```

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**: Check CORS configuration in backend
2. **Database Connection**: Verify DATABASE_URL format
3. **API Key Issues**: Ensure API keys are valid and have proper permissions
4. **Build Failures**: Check Node.js and Python versions

### Debug Mode
For development, set `DEBUG=True` in backend environment variables.

## 📞 Support

For hackathon support:
1. Check the QLOO documentation
2. Review API rate limits
3. Test with mock data if needed
4. Use the demo mode for presentations

## 🎯 Hackathon Submission Checklist

- [ ] Application deployed and accessible
- [ ] All features working
- [ ] API keys configured
- [ ] Database populated with sample data
- [ ] Demo video recorded
- [ ] README updated with deployment instructions
- [ ] Code repository public and well-documented
- [ ] Environment variables properly configured
- [ ] Application tested on different devices
- [ ] Performance optimized for demo

Good luck with your hackathon submission! 🚀 