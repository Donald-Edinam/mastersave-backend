# Swagger API Documentation Setup

## Overview

The MasterSave API now includes comprehensive Swagger/OpenAPI 3.0 documentation with interactive UI and complete endpoint specifications.

## Access Points

### Interactive Documentation
```
http://localhost:5000/api-docs
```
- Full interactive Swagger UI
- Try-it-out functionality for all endpoints
- Authentication support with JWT tokens
- Custom styling and branding

### JSON Specification
```
http://localhost:5000/api-docs.json
```
- Raw OpenAPI 3.0 JSON specification
- Can be imported into other tools (Postman, Insomnia, etc.)
- Machine-readable API specification

## Documentation Coverage

### ✅ Fully Documented Endpoints (9 total)

#### Authentication (3 endpoints)
- `POST /auth/signup` - User registration with profile creation
- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user profile

#### Admin Management (4 endpoints)
- `GET /admin/dashboard` - Dashboard statistics
- `GET /admin/students` - List all students
- `GET /admin/students/{studentId}` - Get specific student
- `PUT /admin/students/{studentId}/profile` - Update student profile

#### System (2 endpoints)
- `GET /health` - Health check
- `GET /test-db` - Database connection test

### 📊 Data Models (6 schemas)
- **User** - User account information
- **Profile** - Student financial profile
- **Transaction** - Financial transactions
- **Budget** - Budget management
- **Success** - Standard success response
- **Error** - Standard error response

## Features

### 🔐 Security Documentation
- JWT Bearer token authentication
- Role-based access control (STUDENT/ADMIN)
- Security schemes properly defined

### 📝 Comprehensive Specifications
- Request/response schemas
- Parameter validation
- Error response codes
- Example payloads
- Field descriptions

### 🎨 Custom UI
- Branded with MasterSave title
- Clean interface without default topbar
- Explorer functionality enabled
- Custom CSS styling

## Implementation Details

### Dependencies Added
```json
{
  "swagger-jsdoc": "^6.x.x",
  "swagger-ui-express": "^4.x.x"
}
```

### File Structure
```
src/
├── config/
│   └── swagger.js          # Swagger configuration
├── routes/
│   ├── auth.js            # Auth endpoints with @swagger docs
│   ├── admin.js           # Admin endpoints with @swagger docs
│   ├── health.js          # Health endpoints with @swagger docs
│   └── testDb.js          # DB test endpoints with @swagger docs
└── app.js                 # Swagger UI setup
```

### Configuration
- OpenAPI 3.0 specification
- Automatic route discovery
- Component schemas for reusability
- Security definitions for JWT

## Usage Examples

### Testing with curl
```bash
# Get API specification
curl http://localhost:5000/api-docs.json

# Test authenticated endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/auth/me
```

### Import to Postman
1. Open Postman
2. Click "Import"
3. Enter URL: `http://localhost:5000/api-docs.json`
4. Postman will create a complete collection

### Integration with Frontend
```javascript
// Fetch API specification
const apiSpec = await fetch('http://localhost:5000/api-docs.json')
  .then(res => res.json());

// Use with swagger-client or similar
import SwaggerClient from 'swagger-client';
const client = await SwaggerClient({
  url: 'http://localhost:5000/api-docs.json'
});
```

## Maintenance

### Adding New Endpoints
1. Add JSDoc comments with @swagger tags to route files
2. Follow existing patterns for consistency
3. Include request/response schemas
4. Add appropriate security requirements

### Example Documentation Pattern
```javascript
/**
 * @swagger
 * /api/endpoint:
 *   post:
 *     summary: Brief description
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchemaName'
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
```

### Updating Schemas
- Modify schemas in `src/config/swagger.js`
- Keep schemas in sync with Prisma models
- Use references (`$ref`) for reusability

## Testing

Run the test suite to verify documentation:
```bash
node test-swagger.js
```

This validates:
- Swagger UI accessibility
- JSON specification availability
- Endpoint functionality
- Schema completeness

## Production Considerations

### Security
- Remove test endpoints in production
- Configure CORS appropriately
- Consider rate limiting for documentation endpoints

### Performance
- Consider caching swagger.json response
- Optimize for large API specifications
- Monitor documentation endpoint usage

### Deployment
- Ensure swagger files are included in build
- Update server URLs for production
- Consider hosting documentation separately

## Benefits

### For Developers
- Interactive testing environment
- Complete API reference
- Automatic client generation
- Consistent documentation

### For Integration
- Machine-readable specifications
- Easy import to API tools
- Standardized format
- Version control friendly

### For Maintenance
- Documentation stays in sync with code
- Automated validation
- Clear API contracts
- Reduced support overhead

## Next Steps

1. **Expand Documentation**: Add more detailed examples and use cases
2. **Add Validation**: Implement request validation based on schemas
3. **Client Generation**: Generate client SDKs from specification
4. **Testing Integration**: Use specification for automated API testing
5. **Monitoring**: Track API usage through documentation

The Swagger documentation is now production-ready and provides a comprehensive reference for the MasterSave API!