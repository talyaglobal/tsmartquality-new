# TSmart Quality Management API

A modern, TypeScript-based backend API for quality management and product tracking.

## Project Structure

```
tsmartquality/
├── api/                  # API server implementation
│   ├── config/           # Configuration settings
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── migrations/       # Database migrations
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── api-docs.yaml         # OpenAPI/Swagger documentation
└── README.md             # Project documentation
```

## Technology Stack

- **Framework**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: OpenAPI 3.0

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-organization/tsmartquality.git
   cd tsmartquality
   ```

2. Install API dependencies
   ```bash
   cd api
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

### Database Setup

The application will automatically create the necessary tables when started. For a fresh database:

```bash
createdb tsmartquality
```

## API Documentation

OpenAPI documentation is available in the `api-docs.yaml` file and can be viewed using tools like:

- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Redoc](https://redocly.github.io/redoc/)
- [ReadMe.io](https://readme.com/)

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Lint code
- `npm test` - Run tests

## License

This project is proprietary and confidential.

## Contact

For support or questions, contact [support@tsmart.ai](mailto:support@tsmart.ai)