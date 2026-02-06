# Quick Setup Guide

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Configure Environment
Copy `.env.example` to `.env` and update with your credentials:
```bash
cp .env.example .env
```

## Step 3: Database Setup
```bash
# Create PostgreSQL database
createdb ratnaveda

# Or using psql:
psql -U postgres
CREATE DATABASE ratnaveda;
\q
```

## Step 4: Run Migrations
```bash
npm run migrate
```

## Step 5: Seed Default Data
```bash
npm run seed
```

This creates:
- Default admin user (username: `admin`, password: `admin123`)
- Default settings

## Step 6: Start Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## Step 7: Access Application
- **Admin Panel**: http://localhost:3000/admin/login
- **Customer Portal**: http://localhost:3000

## Optional: AWS S3 Setup
If you want to use S3 for image storage:
1. Create an S3 bucket
2. Set up IAM user with S3 access
3. Add credentials to `.env`:
   ```
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=your-bucket-name
   ```

If S3 is not configured, images will be stored locally in the `uploads/` directory.

## Optional: Redis Setup
For caching (improves performance):
1. Install Redis: `brew install redis` (Mac) or `apt-get install redis` (Linux)
2. Start Redis: `redis-server`
3. Redis will be used automatically if available

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process using port 3000

### Migration Errors
- Ensure database is empty or use `npm run migrate:rollback` first
- Check PostgreSQL version (requires v12+)

### Image Upload Issues
- Check file permissions on `uploads/` directory
- Verify S3 credentials if using cloud storage
- Check file size limits (max 10MB)

## Next Steps
1. Log in to admin panel
2. Change default admin password
3. Add categories
4. Add your first gemstone
5. Generate master QR code
6. Test customer portal

