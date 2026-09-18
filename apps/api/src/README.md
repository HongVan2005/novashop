# NovaShop API

Express + Prisma + PostgreSQL.

Architecture:
- routes: HTTP endpoints
- middleware: authentication / authorization
- db: Prisma client
- prisma: schema + seed
- app.js: middleware + routes + error boundary
- server.js: process entrypoint

The same login endpoint accepts `role=ADMIN` or `role=CUSTOMER`.
The backend always verifies the user's stored role before issuing a JWT.
