# TSmart Quality Management System

A full-stack quality management application built with Next.js (frontend) and Node.js/Express (backend).

## Project Structure

```
tsmartquality/
├── api/                  # Backend API server
│   ├── config/           # Configuration settings
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── migrations/       # Database migrations
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── frontend/             # Next.js frontend application
│   ├── public/           # Static files
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── pages/        # Next.js pages
│   │   └── styles/       # Global styles
│   ├── next.config.js    # Next.js config
│   └── package.json      # Frontend dependencies
├── .vercelignore         # Vercel ignore file
├── vercel.json           # Vercel configuration
├── api-docs.yaml         # OpenAPI/Swagger documentation
└── README.md            # Project documentation
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **UI Components**: Headless UI, Hero Icons
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: OpenAPI 3.0
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- PostgreSQL 14+
- npm or yarn

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-organization/tsmartquality.git
   cd tsmartquality
   ```

2. **Set up the backend**
   ```bash
   # Install dependencies
   cd api
   npm install
   
   # Copy environment variables
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   
   # Create and seed the database
   createdb tsmartquality
   psql -d tsmartquality -f ../sample-data.sql
   ```

3. **Set up the frontend**
   ```bash
   # Navigate to frontend directory
   cd ../frontend
   
   # Install dependencies
   npm install
   
   # Copy environment variables
   cp .env.example .env.local
   # Configure API URL (default: http://localhost:3000/api)
   ```

4. **Start the development servers**
   ```bash
   # In one terminal (backend)
   cd api
   npm run dev
   
   # In another terminal (frontend)
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3001
   - API: http://localhost:3000/api
   - API Docs: http://localhost:3000/api-docs

## Deployment

### Vercel Deployment

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the repository to Vercel
3. Configure the following environment variables in Vercel:
   ```
   # Database
   DATABASE_URL=your_postgres_connection_string
   
   # JWT
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRES_IN=1d
   
   # API Configuration
   NODE_ENV=production
   ```
4. Deploy!

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Development

### Available Scripts

#### Backend (in /api directory)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Lint code
- `npm test` - Run tests

#### Frontend (in /frontend directory)
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm start` - Start production server
- `npm run lint` - Lint code

## API Documentation

API documentation is available in the following formats:
- OpenAPI 3.0 spec: `api-docs.yaml`
- Interactive documentation: `/api-docs` (when running locally)

## License

This project is proprietary and confidential.

## Contact

For support or questions, contact [support@tsmart.ai](mailto:support@tsmart.ai)