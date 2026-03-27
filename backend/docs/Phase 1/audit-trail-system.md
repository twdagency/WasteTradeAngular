# Audit Trail System

Audit trail system to track all authenticated API requests.

## Features

- Automatically log all API calls from authenticated users
- Store detailed information: user ID, company ID, path, method, IP address, user agent
- Sanitize sensitive data in request body
- Support filtering and pagination with advanced search capabilities
- API to query audit trails with role-based access control
- CSV export functionality for audit trail analysis
- Enhanced user context tracking (name, role, company, site type)
- Optimized database queries with strategic indexing

## Components

### 1. Model: `AuditTrail`
Path: `src/models/audit-trail.model.ts`

Data fields:
- `id`: Unique identifier for the audit trail record
- `userId`: ID of the user making the request
- `companyId`: Company ID associated with the user
- `type`: Action type based on path (User Management, Company Management, etc.)
- `action`: Full API path
- `method`: HTTP method (GET, POST, PUT, DELETE, etc.)
- `ipAddress`: Client IP address
- `userAgent`: Browser/client user agent
- `requestBody`: Sanitized request body (JSONB format)
- `responseStatus`: HTTP response status code
- `loggedUserName`: Full name of the user making the request
- `loggedUserRole`: Role of the user (Super Admin, Admin, Trader, Buyer, Seller, Haulier)
- `loggedCompanyName`: Name of the company associated with the user
- `siteType`: Type of site (Waste Trade, Trader, Haulier)
- `createdAt`: Timestamp when the audit trail was created
- `updatedAt`: Timestamp when the audit trail was last updated

### 2. Repository: `AuditTrailRepository`
Path: `src/repositories/audit-trail.repository.ts`

CRUD operations for audit trail data.

### 3. Service: `AuditTrailService`
Path: `src/services/audit-trail.service.ts`

Business logic for audit trail:
- Create audit trail from request
- Determine type based on path mapping
- Sanitize request body to remove sensitive data
- Extract IP address from various headers
- Map user roles to appropriate audit trail categories
- Advanced filtering with custom SQL queries for performance
- CSV export with formatted output

### 4. Controller: `AuditTrailController`
Path: `src/controllers/audit-trail.controller.ts`

REST API endpoints:
- `GET /audit-trails` - List all audit trails with filtering and pagination
- `GET /audit-trails/export` - Export audit trails to CSV format

**Note**: Only Super Admin and Admin users can access audit trail endpoints.

### 5. Middleware: `AuditTrailMiddleware`
Path: `src/middleware/audit-trail.middleware.ts`

Middleware to automatically capture all authenticated requests.

### 6. Migration: `CreateAuditTrailsIndexMigration`
Path: `src/migrations/[1.0.13]-create-audit-trails-index.migration.ts`

Database migration to create indexes for better query performance. The audit trails table itself is created automatically by LoopBack from the model definition.

## Configuration

### Application Setup
In `src/application.ts`:

```typescript
// Service binding
this.bind('services.AuditTrailService').toClass(AuditTrailService);

// Middleware setup
this.middleware(createAuditTrailMiddleware({
    excludePaths: ['/ping', '/health', '/explorer'],
    excludeMethods: ['OPTIONS'],
}));
```

### Middleware Options

```typescript
interface AuditTrailMiddlewareOptions {
  excludePaths?: string[]; // Paths to exclude from audit
  excludeMethods?: string[]; // HTTP methods to exclude
}
```

Default excluded paths:
- `/ping`
- `/health`
- `/explorer`
- `/openapi.json`
- `/favicon.ico`

Default excluded methods:
- `OPTIONS`

## Database Schema

```sql
CREATE TABLE audit_trails (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  company_id INTEGER,
  type VARCHAR(100) NOT NULL,
  action VARCHAR(500) NOT NULL,
  method VARCHAR(10) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_body JSONB,
  response_status INTEGER,
  logged_user_name VARCHAR(500) NOT NULL,
  logged_user_role VARCHAR(100) NOT NULL,
  logged_company_name VARCHAR(500),
  site_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);
```

## API Usage Examples

### Get all audit trails with pagination
```bash
GET /audit-trails?filter[limit]=10&filter[order]=createdAt%20DESC
```

### Export audit trails to CSV
```bash
GET /audit-trails/export
```

### Filter by user name
```bash
GET /audit-trails?filter[where][loggedUserName]=john
```

### Filter by company name
```bash
GET /audit-trails?filter[where][loggedCompanyName]=company
```

### Filter by user role
```bash
GET /audit-trails?filter[where][loggedUserRole]=Admin
```

### Filter by date range
```bash
GET /audit-trails?filter[where][startDate]=2024-01-01&filter[where][endDate]=2024-01-31
```

### Combined filters with pagination
```bash
GET /audit-trails?filter[where][startDate]=2024-01-01&filter[where][endDate]=2024-01-31&filter[where][loggedUserName]=john&filter[where][loggedUserRole]=Admin&filter[skip]=0&filter[limit]=20
```

## Security Features

### Sensitive Data Sanitization

Middleware automatically removes sensitive fields from request body:
- `password`
- `passwordHash`
- `token`
- `accessToken`
- `refreshToken`
- `secret`
- `apiKey`
- `privateKey`
- `captchaToken`
- `mFullToken`

### IP Address Detection

Middleware automatically detects IP address from multiple sources:
- `x-forwarded-for` header
- `x-real-ip` header
- `x-client-ip` header
- `connection.remoteAddress`
- `socket.remoteAddress`

## Performance Considerations

### Database Indexes

Indexes created to optimize performance:
- `user_id`
- `company_id` 
- `type`
- `method`
- `created_at`
- Composite indexes: `(user_id, created_at)`, `(company_id, created_at)`

### User Role-Based Access Control

The audit trail system implements strict access control:
- **Super Admin**: Full access to all audit trails
- **Admin**: Full access to all audit trails  
- **Other Users**: No access to audit trail endpoints

### CSV Export Feature

The system includes a CSV export feature accessible at `/audit-trails/export`:
- Exports audit trails with applied filters
- Includes columns: Timestamp, Name of User, Type, Organisation, Role of User, Action
- Downloads as a file with timestamp in filename
- Respects the same access control as viewing audit trails

### Error Handling

Middleware designed to not disrupt main request flow:
- If audit trail creation fails, only log error and continue
- Non-blocking operations
- Graceful degradation

## Deployment

1. Run migration to create indexes:
```bash
npm run migration:run
```

2. Restart application to apply middleware changes

3. Monitor logs to verify audit trail creation

**Note**: The audit trails table is automatically created from the LoopBack model definition. The migration only creates performance indexes.

## Monitoring

Check audit trail creation:
```bash
# Get recent audit trail activity
GET /audit-trails?filter[limit]=10&filter[order]=createdAt%20DESC

# Export audit trails for analysis
GET /audit-trails/export
```

## User Role Mapping

The system automatically maps user roles to audit trail roles:

| Global Role | Audit Trail Role | Site Type |
|-------------|------------------|-----------|
| SUPER_ADMIN | Super Admin      | Waste Trade |
| ADMIN       | Admin           | Waste Trade |
| USER (Haulier) | Haulier      | Haulier |
| USER (Buyer and Seller) | Buyer         | Trader |
| USER (Seller) | Seller         | Trader |
| USER (Buyer) | Buyer           | Trader |

## Action Type Mappings

The system automatically categorizes API endpoints into action types:

| API Path Pattern | Action Type |
|------------------|-------------|
| `/auth/*` | Authentication |
| `/users/*` | User Management |
| `/companies/*` | Company Management |
| `/listings/*` | Listing Management |
| `/offers/*` | Offer Management |
| `/materials/*` | Material Management |
| `/notifications/*` | Notification |
| `/files/*`, `/upload/*` | File Management |
| `/company-documents/*` | Company Documents |
| `/company-locations/*` | Company Locations |
| `/company-users/*` | Company Users |
| `/account-status/*` | Account Status |
| `/listing-documents/*` | Listing Documents |
| `/material-users/*` | Material Users |
| `/salesforce/*` | Salesforce Integration |
| `/translation/*` | Translation |
| `/cronjob/*` | System Jobs |
| `/audit-trails/*` | Audit Trails |

## Technical Implementation Details

### Custom SQL Queries

The service uses custom SQL queries for optimal performance when filtering large datasets:
- Direct SQL execution for filtering by user name, company name, role, and date ranges
- Parameterized queries to prevent SQL injection
- Pagination handled at the SQL level for efficiency

### Async Audit Trail Creation

Audit trails are created asynchronously to avoid impacting API response times:
- Middleware captures request/response data
- Audit trail creation happens in finally block
- Errors in audit trail creation are logged but don't affect main request flow

## Troubleshooting

### Common Issues

**Issue**: Audit trails not being created
- **Solution**: Check that the user is authenticated (has valid JWT token)
- **Solution**: Verify the path is not in the excluded paths list
- **Solution**: Check application logs for audit trail creation errors

**Issue**: Access denied when viewing audit trails
- **Solution**: Ensure user has SUPER_ADMIN or ADMIN role
- **Solution**: Verify JWT token is valid and not expired

**Issue**: CSV export not working
- **Solution**: Same access control as viewing - check user role
- **Solution**: Verify filter parameters are correctly formatted

**Issue**: Poor performance when querying audit trails
- **Solution**: Ensure migration has been run to create indexes
- **Solution**: Use appropriate filters to limit result set size
- **Solution**: Use pagination for large datasets

### Debug Information

Enable debug logging to troubleshoot issues:
- Audit trail creation errors are logged to console
- Middleware includes request path and user information in logs
- SQL queries can be monitored for performance optimization

### Performance Monitoring

Monitor these metrics:
- Audit trail creation rate
- Query response times for audit trail endpoints
- Database storage growth for audit_trails table
- Index usage statistics
