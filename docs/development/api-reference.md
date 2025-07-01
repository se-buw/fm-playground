# API Reference

This document provides detailed information about the FM Playground API endpoints, request/response formats, and usage examples based on the actual implementation.

## Base URLs

```
Backend API (Production): https://play.formal-methods.net/api
Backend API (Development): http://localhost:8000/api

Tool APIs (Development):
- Z3 API: http://localhost:8001
- Limboole API: http://localhost:8002  
- nuXmv API: http://localhost:8003
- Spectra API: http://localhost:8004
- Alloy API: http://localhost:8005
```

## Authentication

The FM Playground uses session-based authentication with OAuth2 providers.

### OAuth2 Authentication

#### Login Endpoints
```http
GET /api/login/google
GET /api/login/github
```
Redirects to OAuth provider for authentication.

#### OAuth Callback
```http
GET /api/auth/google
GET /api/auth/github
```
OAuth callback endpoints that process the authentication response.

### Session Management

#### Check Session Status
```http
GET /api/check_session
```

**Response (200 OK):**
```json
{
  "message": "Found user",
  "id": "google_123456789",
  "email": "user@example.com"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "401 Unauthorized"
}
```

#### Get Current User Profile
```http
GET /api/@me
```

**Response (200 OK):**
```json
{
  "message": "Found user",
  "id": "github_987654321",
  "email": "user@example.com"
}
```

#### Logout
```http
GET /api/logout
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

## Core Backend API Endpoints

### Code Management

#### Save Code
```http
POST /api/save
Content-Type: application/json

{
  "code": "string",           // The source code
  "check": "string",          // Tool type (SAT, SMT, XMV, SPECTRA, ALS)
  "parent": "string|null",    // Parent permalink for versioning
  "meta": "object|null"       // Additional metadata
}
```

**Rate Limit:** 2 requests per second

#### Get Code by Permalink
```http
GET /api/permalink/?p={permalink}
```

**Parameters:**
- `p` (required): The permalink identifier

**Response (200 OK):**
```json
{
  "code": "(assert (> x 0))\n(check-sat)"
}
```

**Response (404 Not Found):** Returns 404 if permalink doesn't exist.

### User History Management

#### Get User History
```http
GET /api/histories?page={page}
```

**Parameters:**
- `page` (optional): Page number (default: 1)

**Authentication:** Required

**Response (200 OK):**
```json
{
  "history": [
    {
      "id": 123,
      "permalink": "happy-bright-dog-moon",
      "check_type": "SMT",
      "time": "2024-01-15T10:30:00Z",
      "meta": null
    }
  ],
  "has_more_data": true
}
```

**Response (401 Unauthorized):**
```json
{
  "result": "fail",
  "message": "You are not logged in."
}
```

#### Unlink History Item
```http
PUT /api/unlink-history
Content-Type: application/json

{
  "id": 123
}
```

**Authentication:** Required

**Response (200 OK):**
```json
{
  "result": "success"
}
```

#### Get Code by Data ID
```http
GET /api/code/{data_id}
```

**Authentication:** Required

**Response (200 OK):**
```json
{
  "result": "success",
  "code": "(assert (> x 0))",
  "check": "SMT",
  "permalink": "happy-bright-dog-moon"
}
```

#### Search User History
```http
GET /api/search?q={query}
```

**Parameters:**
- `q` (required): Search query

**Authentication:** Required

**Response (200 OK):**
```json
{
  "history": [
    {
      "id": 123,
      "permalink": "happy-bright-dog-moon",
      "check_type": "SMT",
      "time": "2024-01-15T10:30:00Z"
    }
  ],
  "has_more_data": false
}
```

#### Get History by Permalink
```http
GET /api/history/{permalink}
```

**Authentication:** Required

**Response (200 OK):**
```json
{
  "history": {
    "id": 123,
    "permalink": "happy-bright-dog-moon",
    "check_type": "SMT",
    "time": "2024-01-15T10:30:00Z",
    "meta": null
  }
}
```

### User Data Management

#### Download User Data
```http
GET /api/download-user-data
```

**Authentication:** Required

**Response (200 OK):**
```json
{
  "email": "user@example.com",
  "data": [
    {
      "id": 123,
      "permalink": "happy-bright-dog-moon",
      "code": "(assert (> x 0))",
      "check_type": "SMT",
      "time": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Delete User Profile
```http
DELETE /api/delete-profile
```

**Authentication:** Required

**Response (200 OK):**
```json
{
  "result": "success"
}
```

### Metadata and Feedback

#### Get Metadata
```http
GET /api/metadata?check={check_type}&p={permalink}
```

**Parameters:**
- `check` (required): Tool type (SAT, SMT, XMV, SPECTRA, ALS)
- `p` (required): Permalink identifier

**Response (200 OK):**
```json
{
  "permalink": "happy-bright-dog-moon",
  "check_type": "SMT",
  "created_at": "2024-01-15T10:30:00Z",
  "meta": null
}
```

#### Submit Feedback
```http
POST /api/feedback
Content-Type: application/json

{
  "rating": 5,
  "comment": "Great tool!"
}
```

**Response (200 OK):**
```json
{
  "result": "success"
}
```

**Response (413 Payload Too Large):**
```json
{
  "result": "The comment is too large."
}
```

## Tool APIs

Each formal methods tool has its own dedicated API service.

### Z3 API (SMT Solver)

#### Execute Z3 Code
```http
GET /smt/run/?check={check_type}&p={permalink}
```

**Parameters:**
- `check` (required): Must be "SMT"
- `p` (required): Permalink identifier

**Response (200 OK):**
```
sat
(model 
  (define-fun x () Int
    1)
)
```

**Response (404 Not Found):**
```json
{
  "detail": "Permalink not found"
}
```

**Response (500 Internal Server Error):**
```json
{
  "detail": "Error running z3"
}
```

### Limboole API (SAT Solver)

#### Execute Limboole Code
```http
GET /sat/run/?check={check_type}&p={permalink}&check_sat={boolean}
```

**Parameters:**
- `check` (required): Must be "SAT"
- `p` (required): Permalink identifier
- `check_sat` (required): Boolean flag for satisfiability checking

**Response (200 OK):**
```
% SATISFIABLE
```

**Response (400 Bad Request):**
```json
{
  "detail": "Invalid query parameters"
}
```

### nuXmv API (Model Checker)

#### Execute nuXmv Code
```http
GET /xmv/run/?check={check_type}&p={permalink}
```

**Parameters:**
- `check` (required): Must be "XMV"
- `p` (required): Permalink identifier

**Response (200 OK):**
```
-- specification AG p  is true
```

**Response (500 Internal Server Error):**
```json
{
  "detail": "Error running nuXmv cli"
}
```

### Spectra API (Reactive Synthesis)

#### Execute Spectra Code
```http
GET /spectra/run/?check={check_type}&p={permalink}&command={command}
```

**Parameters:**
- `check` (required): Must be "SPECTRA"
- `p` (required): Permalink identifier
- `command` (required): One of the supported commands

**Supported Commands:**
- `check-realizability`
- `concrete-controller`
- `concrete-counter-strategy`
- `unrealizable-core`
- `check-well-sep`
- `non-well-sep-core`

**Response (200 OK):**
```
REALIZABLE
```

**Response (422 Unprocessable Entity):**
```json
{
  "detail": "Invalid command"
}
```

### Alloy API (Relational Logic)

The Alloy API is implemented in Java using Spring Boot.

#### Execute Alloy Code
```http
POST /alloy/run
Content-Type: application/json

{
  "check": "ALS",
  "p": "permalink-id",
  "cmd": 1
}
```

**Parameters:**
- `check` (required): Must be "ALS"
- `p` (required): Permalink identifier
- `cmd` (required): Command index to execute (1-based)

**Response (200 OK):**
```json
{
  "result": "satisfiable",
  "instance": {
    "atoms": [
      {"relation": "Person", "tuples": [["Person0"]]}
    ]
  }
}
```

#### Get Alloy Instance
```http
GET /alloy/instance/{instance_id}
```

**Response (200 OK):**
```json
{
  "instance_id": "abc123",
  "xml": "<alloy>...</alloy>",
  "json": {
    "atoms": []
  }
}
```

## Data Models

### Database Schema

#### User Model
```python
class User:
    id: str              # OAuth provider ID (e.g., "google_123456")
    email: str           # User email address
    data: List[Data]     # Related data entries
```

#### Data Model
```python
class Data:
    id: int              # Primary key
    time: datetime       # Creation timestamp
    session_id: str      # Session identifier
    parent: int          # Parent data ID for versioning
    check_type: str      # Tool type (SAT, SMT, XMV, SPECTRA, ALS)
    permalink: str       # Permalink identifier
    meta: str            # JSON metadata
    code_id: int         # Foreign key to Code table
    user_id: str         # Foreign key to User table (nullable)
```

#### Code Model
```python
class Code:
    id: int              # Primary key
    code: str            # Source code content
    data: List[Data]     # Related data entries
```

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "detail": "Invalid query parameters"
}
```

#### 401 Unauthorized
```json
{
  "error": "401 Unauthorized"
}
```

#### 404 Not Found
```json
{
  "detail": "Permalink not found"
}
```

#### 413 Payload Too Large
```json
{
  "result": "The code is too large."
}
```

#### 422 Unprocessable Entity
```json
{
  "detail": "Invalid command"
}
```

#### 429 Too Many Requests
```json
{
  "result": "You have already made a request recently."
}
```

#### 500 Internal Server Error
```json
{
  "detail": "Error running code"
}
```

## Rate Limiting

- **Save endpoint**: 2 requests per second per user
- **Tool APIs**: No explicit rate limiting, but timeout protection
- **Authentication**: No rate limiting on OAuth flows

## Caching

### Redis Caching
- **Tool execution results**: Cached based on code content
- **Code retrieval**: Cached by permalink
- **Session data**: Stored in Redis for session management

### Cache Behavior
- **TTL**: Varies by tool and result size
- **Invalidation**: Automatic expiration
- **Fallback**: Direct execution if Redis unavailable

## Security Features

### Input Validation
- **Code size limits**: Maximum 1MB per code submission
- **Comment size limits**: Maximum 1MB per feedback comment
- **Parameter validation**: All API parameters validated

### Authentication & Authorization
- **OAuth2 integration**: Google and GitHub providers
- **Session management**: Secure session handling
- **User isolation**: Users can only access their own data

### CORS Configuration
- **Cross-origin requests**: Enabled for frontend integration
- **Credentials**: Supports credentials for authenticated requests

## Environment Variables

### Backend Configuration
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost/db_name

# Redis
REDIS_URL=redis://localhost:6379

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Tool API Configuration
```bash
# Backend API URL
API_URL=http://localhost:8000/

# Redis
REDIS_URL=redis://localhost:6379
```

## Development and Testing

### Running APIs Locally

#### Backend API
```bash
cd backend
python app.py
# Runs on http://localhost:8000
```

#### Tool APIs
```bash
# Z3 API
cd z3-api
uvicorn main:app --port 8001

# Limboole API
cd limboole-api
uvicorn main:app --port 8002

# nuXmv API
cd nuxmv-api
uvicorn main:app --port 8003

# Spectra API
cd spectra-api
uvicorn main:app --port 8004
```

#### Alloy API
```bash
cd alloy-api
./gradlew bootRun
# Runs on http://localhost:8005
```

### Testing Endpoints

#### Health Check
```bash
curl http://localhost:8000/api/check_session
```

#### Save Code
```bash
curl -X POST http://localhost:8000/api/save \
  -H "Content-Type: application/json" \
  -d '{
    "code": "(assert (> x 0))\n(check-sat)",
    "check": "SMT",
    "parent": null,
    "meta": null
  }'
```

#### Execute Tool
```bash
curl "http://localhost:8001/smt/run/?check=SMT&p=your-permalink"
```

## Migration and Versioning

### Database Migrations
The backend uses Flask-Migrate for database schema management:

```bash
# Create new migration
flask db migrate -m "Description of changes"

# Apply migrations
flask db upgrade

# Rollback migration
flask db downgrade
```

### API Versioning
- **Current version**: v2.6.9
- **Backward compatibility**: Maintained for existing endpoints
- **Breaking changes**: Introduced with major version updates

## Monitoring and Logging

### Request Logging
All API requests are logged with:
- Request method and path
- Response status code
- Execution time
- User session information

### Error Logging
Errors are logged with:
- Error message and stack trace
- Request context
- User information (if available)

### Performance Monitoring
- **Response times**: Tracked for all endpoints
- **Cache hit rates**: Monitored for Redis operations
- **Tool execution times**: Logged for performance analysis

## Next Steps

- Review the [Development Guide](development-guide.md) for implementation details
- Check the [Testing Guide](testing.md) for API testing strategies
- See the [Debugging Guide](debugging.md) for troubleshooting API issues

**Response:**
```json
{
  "check": "SAT",
  "permalink": "example-permalink-123"
}
```

#### Get Code by Permalink
```http
GET /api/permalink/?check={check}&p={permalink}
```

**Response:**
```json
{
  "code": "x & y | z"
}
```

#### Get Code by ID
```http
GET /api/code/{data_id}
Authorization: Required
```

**Response:**
```json
{
  "result": "success",
  "code": "x & y | z",
  "check": "SAT",
  "permalink": "example-permalink-123"
}
```

### User History

#### Get User History
```http
GET /api/histories?page={page}
Authorization: Required
```

**Response:**
```json
{
  "history": [
    {
      "id": 1,
      "code": "x & y",
      "check_type": "SAT",
      "permalink": "example-123",
      "time": "2024-01-01T00:00:00Z"
    }
  ],
  "has_more_data": true
}
```

#### Search History
```http
GET /api/search?q={query}
Authorization: Required
```

#### Download User Data
```http
GET /api/download-user-data
Authorization: Required
```

**Response:**
```json
{
  "email": "user@example.com",
  "data": [/* user history data */]
}
```

### Tool Execution APIs

Each tool has its own API service with consistent endpoints:

#### Limboole (SAT Solver)
```http
GET /sat/run/?check=SAT&p={permalink}&check_sat={boolean}
```

#### Z3 (SMT Solver)
```http
GET /smt/run/?check=SMT&p={permalink}
```

#### nuXmv (Model Checker)
```http
GET /xmv/run/?check=XMV&p={permalink}
```

#### Alloy (Analyzer)
```http
GET /alloy/run/?check=ALS&p={permalink}&cmd={command_number}
```

#### Spectra (Reactive Synthesis)
```http
GET /spectra/run/?check=SPECTRA&p={permalink}&command={command}
```

## Rate Limiting

- **Save endpoint**: 2 requests per second
- **Other endpoints**: Standard rate limiting applies

## Error Handling

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `413` - Payload Too Large
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Code Examples

### JavaScript/TypeScript

```typescript
// Save code example
const saveCode = async (code: string, tool: string) => {
  const response = await fetch('/api/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      code,
      check: tool,
      parent: null,
      meta: { version: '2.6.9' }
    })
  });
  
  return await response.json();
};

// Get code by permalink
const getCode = async (check: string, permalink: string) => {
  const response = await fetch(
    `/api/permalink/?check=${check}&p=${permalink}`
  );
  return await response.json();
};
```

### Python

```python
import requests

# Save code
def save_code(code: str, tool: str):
    response = requests.post(
        'http://localhost:8000/api/save',
        json={
            'code': code,
            'check': tool,
            'parent': None,
            'meta': {'version': '2.6.9'}
        },
        cookies=session_cookies
    )
    return response.json()

# Execute tool
def run_tool(tool: str, permalink: str, **kwargs):
    params = {'check': tool, 'p': permalink, **kwargs}
    response = requests.get(f'/{tool.lower()}/run/', params=params)
    return response.text
```

### curl

```bash
# Save code
curl -X POST http://localhost:8000/api/save \
  -H "Content-Type: application/json" \
  -d '{
    "code": "x & y | z",
    "check": "SAT",
    "parent": null,
    "meta": {"version": "2.6.9"}
  }' \
  --cookie-jar cookies.txt

# Get code
curl "http://localhost:8000/api/permalink/?check=SAT&p=example-123"

# Execute SAT solver
curl "http://localhost:8000/sat/run/?check=SAT&p=example-123&check_sat=true"
```

## Data Models

### Code Object
```typescript
interface Code {
  id: number;
  code: string;
  created_at: string;
}
```

### Data Object
```typescript
interface Data {
  id: number;
  time: string;
  session_id: string;
  parent?: number;
  check_type: string;
  permalink: string;
  meta?: object;
  code_id: number;
  user_id?: string;
}
```

### User Object
```typescript
interface User {
  id: string;           // OAuth provider ID
  email: string;
  created_at: string;
}
```

## Tool-Specific Parameters

### Limboole Parameters
- `check_sat`: boolean - Whether to check satisfiability

### Alloy Parameters  
- `cmd`: number - Command index to execute (1-based)

### Spectra Parameters
- `command`: string - Command to execute (e.g., "check-realizability")

## Webhooks and Real-time Features

The API supports WebSocket connections for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time updates
};
```

## Caching

- Redis caching is implemented for frequently accessed permalinks
- Tool execution results are cached to improve performance
- Cache TTL varies by tool and result size

## Security Considerations

- All user input is validated and sanitized
- Rate limiting prevents abuse
- Session tokens expire automatically
- CORS is configured for cross-origin requests
- File size limits prevent large uploads

## Migration and Versioning

The API uses database migrations for schema changes:

```bash
# Run migrations
flask db upgrade

# Create new migration
flask db migrate -m "Description"
```

API versioning follows semantic versioning principles with backward compatibility maintained.
