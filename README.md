# Wedding Website Application

A complete wedding planning and guest management platform built with Next.js (frontend) and Go (backend), designed to handle RSVPs, photo sharing, and guest communication.

## Features

### For Couples (Admin)
- **Guest Management**: Import guests via CSV, organize into households, tag and categorize
- **RSVP Tracking**: Monitor responses, party sizes, meal choices, and special requests
- **Photo Gallery**: Guest photo uploads with moderation and approval workflow
- **Communication**: Send invitations, reminders, and announcements via email/SMS
- **Analytics**: Track invitation opens, RSVP funnel, and attendance metrics

### for Guests
- **Beautiful Wedding Site**: Static site with event details, story, and logistics
- **Easy RSVP**: Personalized RSVP forms with meal choices and special requests
- **Photo Sharing**: Upload and view wedding photos in real-time
- **Travel Information**: Hotel recommendations, transportation, and local attractions

## Architecture

### Frontend (Next.js)
- **Static Site Generation**: Fast, SEO-friendly wedding pages
- **Admin Dashboard**: React-based management interface
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **CDN Delivery**: Static assets served via Vercel/Netlify

### Backend (Go)
- **Microservices Architecture**: Modular services for different domains
- **RESTful APIs**: Clean API design with proper HTTP semantics
- **Authentication**: JWT-based auth with secure token management
- **Database**: PostgreSQL with GORM ORM
- **Caching**: Redis for session management and performance
- **File Storage**: AWS S3 with CloudFront CDN
- **Email/SMS**: SES and Twilio integration

### Infrastructure
- **AWS ECS**: Containerized Go services with auto-scaling
- **RDS PostgreSQL**: Managed database with backups
- **ElastiCache Redis**: Managed Redis for caching
- **Application Load Balancer**: HTTPS termination and routing
- **CloudFront**: CDN for photos and static assets
- **Terraform**: Infrastructure as Code

## Project Structure

```
wedding-app/
├── frontend/              # Next.js application
│   ├── pages/            # Page components
│   ├── components/       # Reusable React components
│   └── lib/              # Utilities and API client
├── backend/
│   ├── cmd/api/          # Main application entry point
│   ├── internal/         # Business logic services
│   ├── pkg/              # Shared packages
│   ├── migrations/       # Database migrations
│   └── docker/           # Docker configuration
└── infrastructure/
    └── terraform/        # AWS infrastructure
```

## Quick Start

### Prerequisites
- Node.js 18+
- Go 1.21+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wedding-app.git
   cd wedding-app
   ```

2. **Start backend services**
   ```bash
   cd backend
   docker-compose up -d postgres redis
   ```

3. **Run backend**
   ```bash
   go mod download
   go run ./cmd/api
   ```

4. **Run frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

5. **Visit the application**
   - Wedding site: http://localhost:3000
   - Admin dashboard: http://localhost:3000/admin
   - Backend API: http://localhost:8080

### Environment Variables

#### Backend (.env)
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=wedding_user
DB_PASSWORD=wedding_password
DB_NAME=wedding_db

# Redis
REDIS_ADDR=localhost:6379

# AWS
AWS_REGION=us-east-1
S3_BUCKET=your-wedding-photos-bucket

# Email (optional)
SES_FROM_EMAIL=noreply@yourwedding.com
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Deployment

### Production Deployment

1. **Deploy Infrastructure**
   ```bash
   cd infrastructure/terraform
   terraform init
   terraform plan -var="environment=prod"
   terraform apply
   ```

2. **Deploy Backend**
   ```bash
   # Build and push Docker image
   cd backend
   docker build -t your-registry/wedding-app:latest -f docker/Dockerfile .
   docker push your-registry/wedding-app:latest
   
   # Update ECS service
   aws ecs update-service --cluster wedding-app-prod --service wedding-app-prod --force-new-deployment
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   npm run build
   # Deploy to Vercel, Netlify, or S3+CloudFront
   ```

### CI/CD Pipeline

The project includes GitHub Actions workflows for:
- **Frontend**: Automated builds and deployment to Vercel
- **Backend**: Testing, Docker builds, and ECS deployment
- **Infrastructure**: Terraform plan/apply on infrastructure changes

## API Documentation

### Authentication
```bash
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Guests & RSVPs
```bash
GET  /api/guests                    # List all guests (admin)
POST /api/guests/import             # Import guests from CSV
GET  /api/rsvp/:token               # Get RSVP form data
POST /api/rsvp/:token/submit        # Submit RSVP response
GET  /api/rsvps                     # Get all RSVPs (admin)
```

### Photos
```bash
GET  /api/photos                    # Get approved photos
POST /api/photos/upload-url         # Get S3 upload URL
POST /api/photos/complete           # Mark upload complete
GET  /api/admin/photos/pending      # Get photos awaiting moderation
```


## Database Schema

### Core Tables
- **users**: Admin authentication
- **guests**: Guest information and RSVP status
- **rsvps**: RSVP responses with details
- **photos**: Photo metadata and moderation status

### Relationships
- Guests can have multiple RSVPs (for different events)
- Photos belong to albums and have moderation status

## Security Features

- **Authentication**: JWT tokens with secure cookie storage
- **Authorization**: Role-based access control
- **Input Validation**: Request validation and sanitization
- **SQL Injection**: Parameterized queries via GORM
- **File Upload**: Content type validation and virus scanning
- **Rate Limiting**: API rate limits to prevent abuse
- **HTTPS**: SSL/TLS encryption for all communications

## Performance Optimizations

- **Caching**: Redis caching for frequent queries
- **CDN**: CloudFront for photo and asset delivery
- **Database**: Proper indexing and query optimization
- **Connection Pooling**: Database connection management
- **Image Optimization**: Automatic thumbnail generation
- **Static Generation**: Pre-built pages for better SEO

## Monitoring & Logging

- **Application Logs**: Structured JSON logging
- **Error Tracking**: Sentry integration for error monitoring
- **Performance Monitoring**: Request timing and database query metrics
- **Health Checks**: Application and dependency health endpoints
- **Alerting**: CloudWatch alarms for critical metrics

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and add tests
4. Run tests: `go test ./...` and `npm test`
5. Commit changes: `git commit -m "Add your feature"`
6. Push to branch: `git push origin feature/your-feature`
7. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support or questions:
- Create an issue on GitHub
- Email: support@yourwedding.com
- Documentation: [docs.yourwedding.com](https://docs.yourwedding.com)