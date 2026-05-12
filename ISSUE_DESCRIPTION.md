# Issue Title: Deployment and Migration from Vercel to Railway

## Description
Deploy the new Java and Python backend services, update frontend configurations, and complete the migration from the old Node.js backend to the new architecture.

## Requirements
This issue handles the complete deployment workflow and migration checklist to ensure zero downtime during the transition.

### Phase 1: Backend Deployment
- [x] Create Procfile for Python backend
- [ ] Deploy Java Backend to Railway (Railway CLI instructions followed)
- [ ] Deploy Python Backend to Railway (Railway CLI instructions followed)

### Phase 2: Frontend Configuration
- [x] Update VITE_API_BASE in admin-dashboard/.env.example
- [x] Update VITE_API_BASE in main website (via .env.example if exists)

### Phase 3: Migration & Cleanup
- [x] Remove old Node.js backend configuration (server/vercel.json)
- [ ] Update CORS origins in Java backend environment variables

### Phase 4: Testing & Verification
- [ ] Backend health checks
- [ ] Frontend integration tests
- [ ] Cross-origin testing
