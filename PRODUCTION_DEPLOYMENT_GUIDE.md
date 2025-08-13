# 🚀 Production Deployment Guide - TPA Platform

## Overview
This guide covers deploying your TPA Insurance Platform to a custom domain with permanent hosting, SSL, and production-grade configuration.

## Prerequisites Checklist

### Domain Requirements
- [ ] Custom domain purchased and ready (e.g., yourcompany.com)
- [ ] DNS management access for domain configuration
- [ ] SSL certificate requirements understood

### Replit Account Setup
- [ ] Replit account with deployment capabilities
- [ ] Project ready in Replit environment
- [ ] All environment variables configured

### Database & External Services
- [ ] Production PostgreSQL database (Neon, AWS RDS, or similar)
- [ ] Production API keys for external services
- [ ] Payment processor credentials (Helcim)
- [ ] Email service credentials (SendGrid)

## Step 1: Prepare Environment Variables

### Required Production Environment Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@your-db-host:5432/database_name
PGDATABASE=your_production_db
PGHOST=your-db-host
PGUSER=your_db_user
PGPASSWORD=your_db_password
PGPORT=5432

# Authentication
SESSION_SECRET=your-super-secure-session-secret-64-chars-minimum
REPLIT_DOMAINS=yourdomain.com,www.yourdomain.com

# Payment Processing
HELCIM_API_TOKEN=your_helcim_production_token

# Email Services
SENDGRID_API_KEY=your_sendgrid_production_key

# AI Services (if using)
OPENAI_API_KEY=your_openai_api_key

# Object Storage (if using)
DEFAULT_OBJECT_STORAGE_BUCKET_ID=your_bucket_id
PRIVATE_OBJECT_DIR=/your-bucket/private
PUBLIC_OBJECT_SEARCH_PATHS=/your-bucket/public,/your-bucket/assets

# Production URLs
ISSUER_URL=https://replit.com/oidc
REPL_ID=your_repl_id
```

## Step 2: Database Migration

### Production Database Setup
1. **Create Production Database**
   - Use Neon, AWS RDS, or Google Cloud SQL
   - Ensure proper backup and monitoring
   - Set up read replicas if needed

2. **Run Database Migrations**
   ```bash
   npm run db:push
   ```

3. **Seed Production Data**
   - Import rate tables
   - Set up initial tenant configurations
   - Configure default products and coverage options

## Step 3: Replit Deployment Configuration

### Deploy to Replit Hosting
1. **Access Deployment Tab**
   - Navigate to your Replit project
   - Click on "Deploy" tab in the sidebar
   - Choose "Deploy to Replit" option

2. **Configure Deployment Settings**
   - Set build command: `npm run build`
   - Set start command: `npm run start`
   - Configure environment variables in deployment settings

3. **Custom Domain Setup**
   - Add your custom domain in deployment settings
   - Configure DNS records as provided by Replit
   - Enable SSL/TLS encryption

### DNS Configuration
```
# Add these DNS records to your domain:
Type: CNAME
Name: www
Value: [provided by Replit]

Type: A
Name: @
Value: [IP provided by Replit]

# Optional: Redirect non-www to www
Type: CNAME
Name: yourdomain.com
Value: www.yourdomain.com
```

## Step 4: Production Optimizations

### Performance Configuration
1. **Enable Gzip Compression**
2. **Configure CDN for Static Assets**
3. **Set up Database Connection Pooling**
4. **Enable Redis for Session Storage** (optional)

### Security Hardening
1. **SSL/TLS Configuration**
   - Force HTTPS redirects
   - Set security headers
   - Configure HSTS

2. **Environment Security**
   - Rotate all API keys
   - Use production-grade secrets
   - Enable audit logging

### Monitoring Setup
1. **Health Monitoring**
   - Set up uptime monitoring
   - Configure performance alerts
   - Monitor database health

2. **Error Tracking**
   - Implement error logging
   - Set up notification alerts
   - Monitor API response times

## Step 5: Post-Deployment Configuration

### Update Application URLs
```javascript
// Update these in your environment:
FRONTEND_URL=https://yourdomain.com
API_BASE_URL=https://yourdomain.com/api
WIDGET_BASE_URL=https://yourdomain.com/widget
```

### Test Critical Functionality
- [ ] User authentication flow
- [ ] Quote generation and VSC calculations
- [ ] Payment processing (Helcim integration)
- [ ] White-label widget functionality
- [ ] Email notifications
- [ ] Claims processing workflow

### White-label Configuration
- [ ] Update widget URLs to production domain
- [ ] Test embeddable quote widgets
- [ ] Verify branded quote pages
- [ ] Configure subdomain routing

## Step 6: Backup & Disaster Recovery

### Database Backups
- Configure automated daily backups
- Test backup restoration process
- Set up cross-region backup storage

### Application Backups
- Ensure code is in version control
- Document deployment process
- Create rollback procedures

## Step 7: Ongoing Maintenance

### Regular Updates
- Monitor security patches
- Update dependencies monthly
- Review and rotate API keys quarterly

### Performance Monitoring
- Monitor database performance
- Track API response times
- Review error logs weekly

### Business Continuity
- Monitor payment processing success rates
- Track quote conversion metrics
- Review white-label partner performance

## Estimated Costs

### Replit Hosting
- **Replit Pro**: $20/month
- **Custom Domain**: Included with Pro
- **SSL Certificate**: Included

### External Services
- **Database (Neon)**: $20-100/month depending on usage
- **Payment Processing (Helcim)**: 2.9% + $0.30 per transaction
- **Email (SendGrid)**: $20-50/month depending on volume
- **Monitoring**: $10-30/month

**Total Estimated Monthly Cost: $70-200/month**

## Success Metrics

### Technical Metrics
- [ ] 99.9% uptime target
- [ ] <2 second page load times
- [ ] <500ms API response times
- [ ] Zero critical security vulnerabilities

### Business Metrics
- [ ] Payment processing success rate >95%
- [ ] Quote generation completion rate >80%
- [ ] White-label partner satisfaction >90%
- [ ] Claims processing automation >70%

## Support & Documentation

### Emergency Contacts
- Replit Support: support@replit.com
- Database Provider Support
- Payment Processor Support
- Domain Registrar Support

### Documentation Links
- [Replit Deployments](https://docs.replit.com/deployments)
- [Custom Domain Setup](https://docs.replit.com/deployments/custom-domains)
- [Environment Variables](https://docs.replit.com/programming-ide/workspace-features/secrets)

## Next Steps

1. **Purchase and configure your domain**
2. **Set up production database**
3. **Configure all environment variables**
4. **Deploy using Replit's deployment system**
5. **Test all functionality thoroughly**
6. **Monitor and optimize performance**

Your TPA platform is enterprise-ready and can handle production traffic with proper monitoring and maintenance.