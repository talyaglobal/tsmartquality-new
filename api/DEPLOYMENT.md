# TSmart Quality API - Vercel Deployment Guide

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/tsmartquality-api)

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Database**: Set up a PostgreSQL database (recommended: Vercel Postgres, Supabase, or PlanetScale)
3. **GitHub Repository**: Push your code to GitHub

## 🛠️ Deployment Steps

### 1. Database Setup

#### Option A: Vercel Postgres (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Create Postgres database
vercel storage create postgres
```

#### Option B: External Database
- Set up PostgreSQL on your preferred provider
- Note down the connection string

### 2. Environment Variables

Set these environment variables in your Vercel dashboard:

```bash
# Database
DATABASE_URL=postgresql://username:password@hostname:5432/database
POSTGRES_URL=postgresql://username:password@hostname:5432/database

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
JWT_EXPIRES_IN=1h

# CORS (replace with your actual frontend URL)
FRONTEND_URL=https://your-frontend.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://tsmartquality.vercel.app

# App
NODE_ENV=production
```

### 3. Deploy to Vercel

#### Option A: Via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Set root directory to `api`
5. Add environment variables
6. Deploy

#### Option B: Via CLI
```bash
# Navigate to api directory
cd api

# Deploy
vercel

# Set environment variables (interactive)
vercel env add DATABASE_URL
vercel env add JWT_SECRET
# ... add all other env vars

# Redeploy with environment variables
vercel --prod
```

## 📡 API Endpoints

Once deployed, your API will be available at: `https://your-project.vercel.app/api`

### Available Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | User authentication |
| GET | `/api/products` | List products (with pagination) |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product (soft delete) |
| PATCH | `/api/products/bulk-status` | Bulk update products |
| GET | `/api/quality-checks` | List quality checks |
| GET | `/api/users/me` | Get user profile |

## 🧪 Testing Your Deployment

### 1. Health Check
```bash
curl https://your-project.vercel.app/api/health
```

### 2. Authentication Test
```bash
curl -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"batuhan@talyasmart.com","password":"123456"}'
```

### 3. Products Test
```bash
curl https://your-project.vercel.app/api/products
```

## 🔧 Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    }
  ]
}
```

### package.json (key scripts)
```json
{
  "scripts": {
    "vercel-build": "echo 'Build completed'",
    "postinstall": "npm run build"
  }
}
```

## 🛡️ Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **JWT Secret**: Use a strong, random secret (minimum 32 characters)
3. **CORS**: Configure allowed origins properly
4. **Database**: Use SSL connections in production
5. **Rate Limiting**: Consider adding rate limiting for production

## 🐛 Troubleshooting

### Common Issues:

1. **Build Errors**
   - Check TypeScript compilation errors
   - Ensure all dependencies are installed

2. **Database Connection**
   - Verify DATABASE_URL format
   - Check network connectivity
   - Ensure SSL settings are correct

3. **CORS Issues**
   - Update ALLOWED_ORIGINS environment variable
   - Check frontend URL configuration

4. **Function Timeout**
   - Database queries should complete within 30 seconds
   - Optimize slow queries
   - Consider connection pooling

### Debug Logs
```bash
# View deployment logs
vercel logs your-project-url

# View function logs
vercel logs your-project-url --follow
```

## 📈 Performance Optimization

1. **Database Indexing**: Ensure proper indexes on frequently queried columns
2. **Connection Pooling**: Use connection pooling for database connections
3. **Caching**: Implement Redis or in-memory caching for frequently accessed data
4. **Compression**: Enable gzip compression

## 🔄 CI/CD Setup

### GitHub Actions (Optional)
```yaml
name: Deploy to Vercel
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **PostgreSQL**: [postgresql.org/docs](https://www.postgresql.org/docs/)
- **API Issues**: Check function logs in Vercel dashboard

---

**Happy Deploying! 🎉**