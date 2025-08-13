# 🚀 Step-by-Step Deployment Guide - TPA Platform

## Phase 1: Domain Purchase Through Replit

### Step 1.1: Access Domain Purchase
1. **Navigate to your Replit workspace**
2. **Click "Deploy" button** in the top toolbar
3. **Select "Autoscale Deployment"** (recommended for your platform)
4. **Look for "Custom Domain" or "Buy Domain" option**

### Step 1.2: Domain Selection
- **Choose your domain name** (e.g., `yourcompany.com`, `tpainsurance.com`)
- **Check availability** through Replit's interface
- **Select domain extension** (.com, .net, .org, etc.)
- **Review pricing** (typically $10-15/year)

### Step 1.3: Complete Purchase
- **Enter payment information**
- **Configure domain settings**
- **Enable auto-renewal** (recommended)
- **Verify ownership** (automatic through Replit)

## Phase 2: Pre-Deployment Configuration

### Step 2.1: Environment Variables Setup
```bash
# Required Production Variables
DATABASE_URL=postgresql://[your-neon-url]
SESSION_SECRET=[generate-64-char-random-string]
REPLIT_DOMAINS=[your-purchased-domain.com]
HELCIM_API_TOKEN=[your-production-token]
SENDGRID_API_KEY=[your-production-key]
OPENAI_API_KEY=[if-using-ai-features]
```

### Step 2.2: Database Preparation
- **Current Neon database** can be used for production
- **Run migration**: Execute `npm run db:push` in console
- **Verify tables** are created properly
- **Test connection** with production credentials

### Step 2.3: API Keys Verification
- **Helcim**: Switch to production API token
- **SendGrid**: Configure production email settings
- **VIN API**: Verify NHTSA integration working
- **Test critical endpoints** before deployment

## Phase 3: Deployment Configuration

### Step 3.1: Deployment Settings
1. **Click "Deploy" button**
2. **Select "Autoscale Deployment"**
3. **Configure build settings:**
   - Build command: `npm run build`
   - Start command: `npm run start`
   - Node version: Latest stable

### Step 3.2: Environment Variables
**Add all production environment variables in deployment settings:**
- Navigate to "Environment Variables" section
- Add each variable from Step 2.1
- Ensure no spaces or extra characters
- Mark sensitive variables as "Secret"

### Step 3.3: Resource Configuration
- **Memory**: Start with 1GB (can scale up)
- **CPU**: Auto-scaling enabled
- **Region**: Choose closest to your users
- **Scaling**: Min 0, Max 10 instances

## Phase 4: Domain Connection

### Step 4.1: Link Your Domain
1. **In deployment settings**, find "Custom Domain"
2. **Select your purchased domain** from dropdown
3. **Configure subdomain** (www vs non-www)
4. **Enable SSL/TLS** (automatic)

### Step 4.2: DNS Configuration
**If domain purchased through Replit:**
- DNS automatically configured
- SSL certificate automatically issued
- No manual DNS changes needed

**If using external domain:**
- Add A record: `@` pointing to Replit IP
- Add CNAME: `www` pointing to Replit CNAME
- Wait for DNS propagation (up to 48 hours)

## Phase 5: Testing & Validation

### Step 5.1: Basic Functionality Test
- **Homepage loads** at your domain
- **Quote generation** works properly
- **Database connections** functional
- **Authentication flow** operational

### Step 5.2: Critical Features Test
- **VSC quote calculation** with real rates
- **Payment processing** (test mode first)
- **White-label widgets** loading correctly
- **Email notifications** sending properly

### Step 5.3: Performance Validation
- **Page load times** under 3 seconds
- **API response times** under 500ms
- **Database queries** optimized
- **Error handling** working properly

## Phase 6: Production Configuration

### Step 6.1: Update Production URLs
**Update these in your application:**
```javascript
// Widget URLs
const WIDGET_BASE_URL = 'https://yourdomain.com/widget';

// API endpoints
const API_BASE_URL = 'https://yourdomain.com/api';

// Branded pages
const BRANDED_BASE_URL = 'https://yourdomain.com/branded';
```

### Step 6.2: White-label Configuration
- **Update widget embed codes** with production domain
- **Test reseller portals** on new domain
- **Verify branded quote pages** working
- **Update partner documentation** with new URLs

### Step 6.3: SEO Configuration
- **Update sitemap.xml** with production domain
- **Configure Google Search Console**
- **Submit sitemap** to search engines
- **Update meta tags** with production URLs

## Phase 7: Monitoring & Maintenance

### Step 7.1: Set Up Monitoring
- **Monitor deployment health** through Replit dashboard
- **Set up uptime monitoring** (UptimeRobot, Pingdom)
- **Configure error alerts** for critical issues
- **Track performance metrics** regularly

### Step 7.2: Backup Strategy
- **Database backups** (Neon handles automatically)
- **Code backups** (already in Replit)
- **Environment variable backup** (document securely)
- **Test restoration process** periodically

### Step 7.3: Security Measures
- **Enable all security headers** (already configured)
- **Monitor for vulnerabilities** in dependencies
- **Rotate API keys** quarterly
- **Review access logs** monthly

## Phase 8: Go-Live Checklist

### Final Pre-Launch Checks
- [ ] Domain pointing to deployment correctly
- [ ] SSL certificate active and valid
- [ ] All environment variables configured
- [ ] Database migration completed
- [ ] Payment processing tested
- [ ] Email notifications working
- [ ] White-label widgets functional
- [ ] Performance meets targets
- [ ] Error handling tested
- [ ] Backup systems verified

### Launch Day Tasks
1. **Final functionality test** on production domain
2. **Monitor deployment** for first 24 hours
3. **Test critical user flows** end-to-end
4. **Verify payment processing** with small test transaction
5. **Update documentation** with production URLs
6. **Notify stakeholders** of successful launch

## Ongoing Maintenance Schedule

### Daily
- Monitor application health
- Check error logs
- Verify payment processing

### Weekly  
- Review performance metrics
- Check database health
- Update dependencies if needed

### Monthly
- Review and rotate API keys
- Analyze usage patterns
- Plan scaling adjustments

### Quarterly
- Security audit
- Performance optimization
- Feature updates and improvements

## Support Contacts

### Technical Support
- **Replit Support**: Available in dashboard
- **Database (Neon)**: Built-in support system
- **Payment (Helcim)**: Production support team
- **Email (SendGrid)**: Technical support portal

### Emergency Procedures
- **Application down**: Check Replit deployment status
- **Database issues**: Verify connection strings
- **Payment failures**: Check Helcim dashboard
- **DNS problems**: Verify domain configuration

This guide will walk you through each step with hands-on assistance for your TPA platform deployment.