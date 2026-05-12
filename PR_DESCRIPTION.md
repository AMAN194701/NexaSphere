# PR Title: Migration of Backend Services to Railway and Frontend Configuration Update

## Description
This PR completes the migration of NexaSphere's backend from Vercel (Node.js) to Railway (Java and Python). It includes:
- Deployment configuration for the Python backend (`Procfile`).
- Removal of the legacy Vercel backend configuration.
- Updated environment variable examples for both frontends to point to the new Railway API.

## Changes
- **server-python/Procfile**: Added to support deployment on Railway.
- **server/vercel.json**: Removed as the Node.js backend is being decommissioned.
- **admin-dashboard/.env.example**: Updated `VITE_API_BASE` to `https://nexasphere-api.up.railway.app`.
- **.env.example** (Root): Created/Updated to reflect new API base.

## Verification
- Verified `VITE_API_BASE` usage in both frontend codebases.
- Verified `Procfile` command for Python backend.

## Related Issue
Closes #14 (Deployment and Migration from Vercel to Railway)
