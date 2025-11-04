# API Contracts: Dreamy Three.js Portfolio

**Phase**: 1 - Design & Contracts  
**Date**: 2025-11-04  
**Purpose**: Define client-server interface contracts for content delivery

---

## Overview

The MVP uses **static JSON files** with no backend API. These contracts document the **future Azure Functions API** if dynamic content management is added in v2.

Current implementation: All contracts map to static files in `/public/content/`.

---

## Static File Contracts (MVP)

### 1. Portfolio Content

**Endpoint**: `GET /content/portfolio-data.json`  
**Purpose**: Fetch all portfolio sections, projects, and metadata

**Request**: None (static file)

**Response** (200 OK):
```json
{
  "sections": [
    {
      "id": "landing",
      "type": "landing",
      "title": "Welcome to My World",
      "subtitle": "An immersive 3D experience",
      "cameraPosition": { "x": 0, "y": 5, "z": 15 },
      "cameraTarget": { "x": 0, "y": 0, "z": 0 },
      "backgroundModelUrl": "/models/landing-scene.glb"
    },
    {
      "id": "about",
      "type": "content",
      "title": "About Me",
      "cameraPosition": { "x": -10, "y": 3, "z": 10 },
      "cameraTarget": { "x": 0, "y": 2, "z": 0 },
      "content": "## Who I Am\n\nI'm a creative developer..."
    },
    {
      "id": "projects",
      "type": "projects",
      "title": "My Work",
      "cameraPosition": { "x": 5, "y": 4, "z": 12 },
      "cameraTarget": { "x": 0, "y": 1, "z": 0 },
      "projects": [
        {
          "id": "project-1",
          "title": "Dreamscape Explorer",
          "description": "An interactive 3D narrative experience built with Three.js and WebGL shaders.",
          "tags": ["Three.js", "GLSL", "Interactive Art"],
          "thumbnailUrl": "/textures/projects/dreamscape-thumb.jpg",
          "modelUrl": "/models/projects/dreamscape-preview.glb",
          "externalUrl": "https://dreamscape.example.com",
          "featured": true,
          "createdDate": "2025-08-15T00:00:00Z"
        },
        {
          "id": "project-2",
          "title": "Particle Symphony",
          "description": "Real-time generative particle system with audio reactivity.",
          "tags": ["WebGL", "Audio", "Generative"],
          "thumbnailUrl": "/textures/projects/particles-thumb.jpg",
          "featured": false,
          "createdDate": "2025-06-20T00:00:00Z"
        }
      ]
    },
    {
      "id": "contact",
      "type": "contact",
      "title": "Get in Touch",
      "cameraPosition": { "x": 0, "y": 6, "z": 20 },
      "cameraTarget": { "x": 0, "y": 3, "z": 0 },
      "content": "Reach me at: hello@example.com"
    }
  ],
  "metadata": {
    "lastUpdated": "2025-11-04T12:00:00Z",
    "version": "1.0.0",
    "author": "Hun"
  }
}
```

**Response Schema** (TypeScript):
```typescript
interface PortfolioData {
  sections: Section[];
  metadata: Metadata;
}

interface Section {
  id: string;
  type: 'landing' | 'content' | 'projects' | 'contact';
  title: string;
  subtitle?: string;
  cameraPosition: Vector3;
  cameraTarget: Vector3;
  content?: string;
  projects?: Project[];
  backgroundModelUrl?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnailUrl: string;
  modelUrl?: string;
  externalUrl?: string;
  featured: boolean;
  createdDate: string; // ISO 8601
}

interface Metadata {
  lastUpdated: string; // ISO 8601
  version: string;
  author: string;
}
```

**Error Responses**:
- `404 Not Found`: File not found (hosting issue)
- `500 Internal Server Error`: JSON parse error (malformed content)

**Caching**:
- Cache-Control: `public, max-age=3600` (1 hour)
- Update when content changes via CI/CD redeploy

---

## Future Azure Functions API (v2)

### Base URL

**Production**: `https://hun-portfolio-api.azurewebsites.net/api`  
**Staging**: `https://hun-portfolio-staging.azurewebsites.net/api`

**Authentication**: None for read endpoints (public portfolio)  
**Content-Type**: `application/json`

---

### 2. Get All Sections

**Endpoint**: `GET /api/sections`  
**Purpose**: Fetch all portfolio sections (landing, about, projects, contact)

**Request**:
```http
GET /api/sections HTTP/1.1
Host: hun-portfolio-api.azurewebsites.net
```

**Response** (200 OK):
```json
{
  "sections": [
    {
      "id": "landing",
      "type": "landing",
      "title": "Welcome",
      "cameraPosition": { "x": 0, "y": 5, "z": 15 },
      "cameraTarget": { "x": 0, "y": 0, "z": 0 }
    }
  ]
}
```

**Error Responses**:
- `500 Internal Server Error`: Database connection failed

---

### 3. Get Projects

**Endpoint**: `GET /api/projects`  
**Purpose**: Fetch all portfolio projects with optional filtering

**Query Parameters**:
- `featured` (optional): `boolean` — Filter featured projects only
- `tag` (optional): `string` — Filter by tag (e.g., `?tag=Three.js`)
- `limit` (optional): `number` — Max results (default: 50)

**Request**:
```http
GET /api/projects?featured=true&limit=5 HTTP/1.1
Host: hun-portfolio-api.azurewebsites.net
```

**Response** (200 OK):
```json
{
  "projects": [
    {
      "id": "project-1",
      "title": "Dreamscape Explorer",
      "description": "Interactive 3D narrative",
      "tags": ["Three.js", "GLSL"],
      "thumbnailUrl": "https://huncdn.blob.core.windows.net/textures/dreamscape-thumb.jpg",
      "modelUrl": "https://huncdn.blob.core.windows.net/models/dreamscape.glb",
      "featured": true,
      "createdDate": "2025-08-15T00:00:00Z"
    }
  ],
  "total": 1
}
```

**Error Responses**:
- `400 Bad Request`: Invalid query parameter (e.g., `limit=-1`)
- `500 Internal Server Error`: Database query failed

---

### 4. Get Single Project

**Endpoint**: `GET /api/projects/{id}`  
**Purpose**: Fetch detailed information for a specific project

**Path Parameters**:
- `id`: `string` — Project unique identifier

**Request**:
```http
GET /api/projects/project-1 HTTP/1.1
Host: hun-portfolio-api.azurewebsites.net
```

**Response** (200 OK):
```json
{
  "id": "project-1",
  "title": "Dreamscape Explorer",
  "description": "An interactive 3D narrative experience...",
  "longDescription": "Full case study content here (markdown)...",
  "tags": ["Three.js", "GLSL", "Interactive Art"],
  "thumbnailUrl": "https://huncdn.blob.core.windows.net/textures/dreamscape-thumb.jpg",
  "modelUrl": "https://huncdn.blob.core.windows.net/models/dreamscape.glb",
  "gallery": [
    "https://huncdn.blob.core.windows.net/images/dreamscape-1.jpg",
    "https://huncdn.blob.core.windows.net/images/dreamscape-2.jpg"
  ],
  "externalUrl": "https://dreamscape.example.com",
  "featured": true,
  "createdDate": "2025-08-15T00:00:00Z",
  "updatedDate": "2025-10-01T00:00:00Z"
}
```

**Error Responses**:
- `404 Not Found`: Project ID does not exist
- `500 Internal Server Error`: Database error

---

### 5. Get Metadata

**Endpoint**: `GET /api/metadata`  
**Purpose**: Fetch portfolio metadata (version, last updated, author)

**Request**:
```http
GET /api/metadata HTTP/1.1
Host: hun-portfolio-api.azurewebsites.net
```

**Response** (200 OK):
```json
{
  "lastUpdated": "2025-11-04T12:00:00Z",
  "version": "1.2.0",
  "author": "Hun",
  "buildDate": "2025-11-04T10:30:00Z",
  "deploymentEnvironment": "production"
}
```

---

## Content Management (Admin Endpoints - Future)

### 6. Create/Update Project (Admin Only)

**Endpoint**: `POST /api/admin/projects` (create), `PUT /api/admin/projects/{id}` (update)  
**Purpose**: CMS for adding or editing projects

**Authentication**: Azure AD B2C bearer token required

**Request Headers**:
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "title": "New Project",
  "description": "Short summary",
  "longDescription": "Full markdown case study...",
  "tags": ["Three.js", "WebGL"],
  "thumbnailUrl": "https://...",
  "modelUrl": "https://...",
  "featured": false
}
```

**Response** (201 Created / 200 OK):
```json
{
  "id": "project-3",
  "title": "New Project",
  "createdDate": "2025-11-04T14:00:00Z",
  "message": "Project created successfully"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User lacks admin role
- `400 Bad Request`: Validation error (missing required fields)

---

### 7. Upload Asset (Admin Only)

**Endpoint**: `POST /api/admin/assets`  
**Purpose**: Upload 3D models or textures to Azure Blob Storage

**Authentication**: Azure AD B2C bearer token

**Request** (multipart/form-data):
```http
POST /api/admin/assets HTTP/1.1
Content-Type: multipart/form-data
Authorization: Bearer <JWT_TOKEN>

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="model.glb"
Content-Type: model/gltf-binary

<binary data>
------WebKitFormBoundary--
```

**Response** (201 Created):
```json
{
  "url": "https://huncdn.blob.core.windows.net/models/model-abc123.glb",
  "sizeBytes": 2048576,
  "uploadedAt": "2025-11-04T14:05:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: No token
- `413 Payload Too Large`: File >50 MB
- `415 Unsupported Media Type`: Not `.glb`, `.gltf`, `.jpg`, `.png`, `.webp`

---

## Rate Limiting (Future)

**Public Endpoints** (`/api/sections`, `/api/projects`):
- 100 requests per minute per IP
- 429 Too Many Requests if exceeded

**Admin Endpoints** (`/api/admin/*`):
- 30 requests per minute per authenticated user

---

## CORS Policy

**Allowed Origins**:
- Production: `https://hun-portfolio.vercel.app`, `https://hun.me`
- Staging: `https://hun-portfolio-staging.vercel.app`

**Allowed Methods**: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`  
**Allowed Headers**: `Content-Type`, `Authorization`

---

## Implementation Notes

### MVP (Static Files)
- All contracts map to `/public/content/portfolio-data.json`
- Frontend fetches once at app init, caches in memory
- No server-side logic or authentication

### v2 (Azure Functions)
- Azure Functions (Node.js/TypeScript) handle API endpoints
- Azure Blob Storage for glTF models and images (CDN via Azure Front Door)
- Cosmos DB for project metadata (NoSQL document store)
- Azure AD B2C for admin authentication
- Managed identity for Functions → Blob/Cosmos access (no connection strings)

### OpenAPI Specification (Future)

Generate full OpenAPI 3.0 spec for API documentation:

```yaml
openapi: 3.0.0
info:
  title: Hun Portfolio API
  version: 1.0.0
paths:
  /api/sections:
    get:
      summary: Get all sections
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SectionsResponse'
components:
  schemas:
    SectionsResponse:
      type: object
      properties:
        sections:
          type: array
          items:
            $ref: '#/components/schemas/Section'
```

---

## Testing Contracts

### MVP (Static)
- Unit test: Parse `portfolio-data.json` and validate schema with Zod
- E2E test: Fetch `/content/portfolio-data.json`, verify structure

### v2 (Azure API)
- Contract tests: Verify response schemas match OpenAPI spec
- Integration tests: Mock Azure Functions locally, test endpoints
- E2E tests: Deploy to staging, run full user flows

---

## Summary

| Contract | MVP (Static) | v2 (Azure API) |
|----------|-------------|----------------|
| Portfolio Content | `/content/portfolio-data.json` | `GET /api/sections` + `GET /api/projects` |
| Single Project | Included in `portfolio-data.json` | `GET /api/projects/{id}` |
| Metadata | Included in `portfolio-data.json` | `GET /api/metadata` |
| Admin CMS | N/A (manual JSON edit) | `POST /PUT /api/admin/projects` |
| Asset Upload | N/A (commit to repo) | `POST /api/admin/assets` |

All contracts are documented, typed (TypeScript interfaces), and validated (Zod schemas). MVP uses static files; v2 migration to Azure Functions is opt-in and backward-compatible.
