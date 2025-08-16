name: "Containerization with Docker - Phase 0.25"
description: |

## Purpose

Add containerization support with Docker and docker-compose to enable CI-like local development environments and easy Supabase integration, while maintaining pnpm dev as the preferred development workflow.

## Core Principles

1. **Optional enhancement**: Docker is additional tooling, not required for development
2. **Production parity**: Dockerfile mirrors Vercel's Next.js standalone deployment
3. **Local Supabase integration**: docker-compose simplifies local database setup
4. **CI reproduction**: Enable developers to test in CI-like containerized environments
5. **No workflow disruption**: Existing pnpm dev workflow remains primary and unchanged

---

## Goal

Create Docker infrastructure for apps/web with standalone Next.js production builds and optional docker-compose setup for local development with Supabase, enabling container-based testing without changing existing workflows.

## Why

- **Environment parity**: Reproduce production-like environments locally
- **CI debugging**: Test containerized builds that match deployment environment
- **Supabase simplification**: Easy local database setup without CLI complexity
- **Team flexibility**: Support developers who prefer containerized workflows
- **Deployment testing**: Validate builds before they reach Vercel

## What

- Create apps/web/Dockerfile using Next.js standalone output
- Create docker-compose.yml for local web + Supabase development
- Add Docker-related scripts to package.json for convenience
- Document Docker usage in README without requiring it
- Ensure Docker setup works with existing environment variables

### Success Criteria

- [ ] Dockerfile created for apps/web with Next.js standalone build
- [ ] Docker image builds successfully and runs production server
- [ ] docker-compose.yml created with web + Supabase services
- [ ] Docker compose brings up complete local development environment
- [ ] Environment variables properly passed to containerized app
- [ ] Docker setup documented in README with clear optional status
- [ ] Existing pnpm dev workflow unaffected and remains primary
- [ ] Docker builds work with current monorepo structure

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: https://nextjs.org/docs/deployment#docker-image
  why: Official Next.js Docker deployment guide and standalone output

- url: https://nextjs.org/docs/pages/api-reference/next-config-js/output
  why: Next.js standalone output configuration for Docker

- file: apps/web/next.config.js
  why: Current Next.js configuration to extend for standalone output

- file: apps/web/package.json
  why: Build scripts and dependencies for Docker build process

- file: .env.example
  why: Environment variables that need to be available in containers

- file: supabase/README.md
  why: Current Supabase setup to integrate with docker-compose

- url: https://docs.docker.com/compose/
  why: Docker Compose syntax and service configuration

- url: https://supabase.com/docs/guides/self-hosting/docker
  why: Supabase Docker setup patterns and configuration

- file: docs/logs/phase-0-log.md
  why: Section 0.25 requirements for containerization
```

### Current Codebase tree

```bash
mikeiu.com/
├── apps/
│   └── web/
│       ├── next.config.js            # MODIFY: Add standalone output
│       ├── package.json              # REFERENCE: Build scripts
│       ├── src/                      # Next.js application source
│       └── public/                   # Static assets
├── supabase/
│   ├── config.toml                   # REFERENCE: Supabase configuration
│   └── README.md                     # REFERENCE: Current Supabase setup
├── .env.example                      # REFERENCE: Environment variables
├── package.json                      # MODIFY: Add Docker scripts
└── README.md                         # MODIFY: Document Docker usage
```

### Desired Codebase tree with files to be added

```bash
mikeiu.com/
├── apps/
│   └── web/
│       ├── Dockerfile                # CREATE: Production Next.js container
│       ├── .dockerignore             # CREATE: Docker build exclusions
│       ├── next.config.js            # MODIFY: Add standalone output
│       └── package.json              # EXISTING: Build scripts
├── docker-compose.yml                # CREATE: Local dev environment
├── docker-compose.override.yml       # CREATE: Local development overrides
├── .env.docker                       # CREATE: Docker-specific env template
├── package.json                      # MODIFY: Add Docker convenience scripts
└── README.md                         # MODIFY: Document Docker usage
```

### Known Gotchas of our codebase & Docker Quirks

```dockerfile
# CRITICAL: Next.js standalone output configuration
# Must enable output: 'standalone' in next.config.js
# This creates a minimal runtime with only required files

# CRITICAL: pnpm workspace complexity in Docker
# Use multi-stage build to handle monorepo dependencies
# Copy workspace files and install before building

# GOTCHA: Environment variable handling
# Container needs environment variables at runtime
# Use .env file mounting or environment passing

# GOTCHA: Supabase service dependencies
# Web container must wait for Supabase to be ready
# Use health checks and depends_on with condition

# PATTERN: Multi-stage Docker build
# 1. deps: Install dependencies
# 2. builder: Build application
# 3. runner: Minimal runtime image

# PATTERN: Docker Compose development
# - Supabase services (db, auth, storage, etc.)
# - Web service with live reload (optional)
# - Shared network for service communication
```

## Implementation Blueprint

### Data models and structure

```yaml
# Docker Build Strategy
DOCKER_STAGES:
  1. deps: 'Install pnpm and workspace dependencies'
  2. builder: 'Build Next.js application with standalone output'
  3. runner: 'Minimal Alpine runtime with built application'

# Docker Compose Services
COMPOSE_SERVICES:
  supabase-db: 'PostgreSQL database'
  supabase-auth: 'Authentication service'
  supabase-rest: 'PostgREST API'
  supabase-storage: 'File storage service'
  web: 'Next.js application container'

# Environment Variables
ENV_STRATEGY:
  development: 'Mount .env.local or use docker-compose environment'
  production: 'Pass through container environment variables'
  supabase: 'Auto-configured for docker-compose networking'
```

### List of tasks to be completed in order

```yaml
Task 1 - Configure Next.js for Standalone Output:
  MODIFY apps/web/next.config.js:
    - ADD output: 'standalone' configuration
    - PRESERVE existing configuration
    - ENABLE standalone build optimization

Task 2 - Create Production Dockerfile:
  CREATE apps/web/Dockerfile:
    - USE multi-stage build for optimal image size
    - INSTALL pnpm and handle workspace dependencies
    - BUILD Next.js with standalone output
    - CREATE minimal runtime image with Node.js Alpine

Task 3 - Create Docker Ignore File:
  CREATE apps/web/.dockerignore:
    - EXCLUDE development files and node_modules
    - INCLUDE only necessary files for build
    - OPTIMIZE build context size

Task 4 - Create Docker Compose Configuration:
  CREATE docker-compose.yml:
    - ADD Supabase services (db, auth, rest, storage)
    - ADD web service using built Dockerfile
    - CONFIGURE networking between services
    - SET up proper service dependencies and health checks

Task 5 - Create Development Overrides:
  CREATE docker-compose.override.yml:
    - CONFIGURE development-specific settings
    - ENABLE live reload and debugging options
    - MOUNT source code for development workflow

Task 6 - Add Docker Environment Template:
  CREATE .env.docker:
    - PROVIDE Docker-specific environment variables
    - CONFIGURE Supabase service URLs for compose networking
    - DOCUMENT container-specific settings

Task 7 - Add Docker Scripts and Documentation:
  MODIFY package.json:
    - ADD Docker convenience scripts
    - INCLUDE build, run, and compose commands

  MODIFY README.md:
    - DOCUMENT Docker usage as optional enhancement
    - PROVIDE clear setup instructions
    - MAINTAIN pnpm dev as primary workflow
```

### Per task pseudocode

```javascript
// Task 1: Next.js Configuration
// File: apps/web/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // ... existing configuration
}

module.exports = nextConfig

// Task 2: Production Dockerfile
// File: apps/web/Dockerfile
FROM node:20-alpine AS deps
RUN corepack enable pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/config/package.json ./packages/config/
COPY packages/ui/package.json ./packages/ui/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
RUN corepack enable pnpm
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY apps/web ./apps/web
RUN cd apps/web && pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/web/server.js"]

// Task 4: Docker Compose Services
// File: docker-compose.yml
version: '3.8'
services:
  supabase-db:
    image: supabase/postgres:15.6.1.139
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    volumes:
      - supabase_db:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  supabase-auth:
    image: supabase/gotrue:v2.99.0
    depends_on:
      supabase-db:
        condition: service_healthy
    environment:
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://postgres:postgres@supabase-db:5432/postgres
      GOTRUE_SITE_URL: http://localhost:3000
      GOTRUE_JWT_SECRET: your-jwt-secret-here
    ports:
      - "9999:9999"

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    depends_on:
      - supabase-db
      - supabase-auth
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
      - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
    ports:
      - "3000:3000"

volumes:
  supabase_db:
```

### Integration Points

```yaml
DEVELOPMENT_INTEGRATION:
  - primary_workflow: pnpm dev (unchanged)
  - docker_workflow: docker-compose up (optional)
  - environment: .env.local or .env.docker

BUILD_INTEGRATION:
  - standalone_output: Next.js optimized for containers
  - workspace_deps: Proper monorepo dependency handling
  - artifact_size: Minimal production image

SUPABASE_INTEGRATION:
  - local_services: Full Supabase stack in containers
  - networking: Service discovery within compose
  - persistence: Volume-based data persistence
```

## Validation Loop

### Level 1: Docker Build Verification

```bash
# Build the Docker image
cd apps/web && docker build -t mikeiu-web .

# Verify image was created
docker images | grep mikeiu-web

# Test container run
docker run -p 3000:3000 mikeiu-web

# Expected: Container builds and runs successfully
```

### Level 2: Docker Compose Environment

```bash
# Start complete environment
docker-compose up -d

# Verify all services are running
docker-compose ps

# Test web application access
curl http://localhost:3000/api/health

# Check Supabase services
curl http://localhost:8000/health

# Expected: All services healthy and accessible
```

### Level 3: Development Workflow Integration

```bash
# Test development override
docker-compose -f docker-compose.yml -f docker-compose.override.yml up

# Verify pnpm dev still works
pnpm dev

# Test environment variable handling
docker-compose exec web env | grep SUPABASE

# Expected: Both workflows function independently
```

## Final validation Checklist

- [ ] Dockerfile builds successfully with standalone Next.js output
- [ ] Docker image runs and serves application on port 3000
- [ ] docker-compose brings up complete local environment
- [ ] Supabase services accessible and healthy in compose
- [ ] Environment variables properly configured for containers
- [ ] Docker documentation added to README as optional tool
- [ ] Existing pnpm dev workflow unaffected and remains primary
- [ ] Docker scripts added to package.json for convenience
- [ ] .dockerignore optimizes build context size

---

## Anti-Patterns to Avoid

- ❌ Don't make Docker required for development - keep it optional
- ❌ Don't copy entire monorepo into container - use multi-stage builds
- ❌ Don't ignore environment variable configuration in containers
- ❌ Don't skip health checks for service dependencies
- ❌ Don't create overly large Docker images - use Alpine and standalone output
- ❌ Don't change existing development workflows - Docker is additive
- ❌ Don't hardcode secrets in Docker files - use environment variables
