# TSmart Quality - Deployment Guide

This guide will walk you through deploying the TSmart Quality application to Vercel.

## Prerequisites

1. Vercel account (sign up at [vercel.com](https://vercel.com))
2. GitHub/GitLab/Bitbucket account (for repository hosting)
3. Node.js and npm installed locally

## Deployment Steps

### 1. Prepare Your Repository

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Ensure all sensitive information is in `.env` files and they are in `.gitignore`

### 2. Set Up Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on "Add New" > "Project"
3. Import your repository
4. Configure the project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command:** `npm run build` or `yarn build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install` or `yarn`

### 3. Configure Environment Variables

In your Vercel project settings, go to "Settings" > "Environment Variables" and add the following:

```
NODE_ENV=production
API_URL=/api
# Add other environment variables from your .env file
```

### 4. Deploy

1. Click "Deploy"
2. Vercel will automatically deploy your application
3. Once deployed, you'll receive a URL for your live application

### 5. Configure Custom Domain (Optional)

1. Go to your project in Vercel
2. Click on "Settings" > "Domains"
3. Add your custom domain and follow the verification steps

## API Deployment

The API is configured to be deployed as a serverless function in Vercel. The `vercel.json` file in the root directory handles the routing between the frontend and API.

## Environment Variables

Make sure to set up the following environment variables in your Vercel project:

```
# Database
DATABASE_URL=your_database_connection_string

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

# API Configuration
API_PORT=3000
NODE_ENV=production
```

## Troubleshooting

- If you encounter build errors, check the build logs in the Vercel dashboard
- Ensure all environment variables are properly set
- Verify that the database connection string is correct and accessible from Vercel's servers

## Continuous Deployment

Vercel automatically deploys new changes when you push to your main branch. To set up different environments:

1. Go to your project in Vercel
2. Click on "Settings" > "Git"
3. Configure the production and preview branches

## Support

For any issues with deployment, please refer to the [Vercel Documentation](https://vercel.com/docs) or contact support.
