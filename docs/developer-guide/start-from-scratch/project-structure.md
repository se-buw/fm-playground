# Project Structure Guide

This guide explains the structure of your FM Playground project created with `fmp-create`.

## 📁 Overview

Your project follows a microservices architecture with separate services for frontend, backend, and each formal method tool.

```
my-fm-playground/
├── frontend/                    # React TypeScript application
├── backend/                     # Python Flask/FastAPI server  
├── [tool-name]-api/            # Tool-specific microservices
├── compose.yml                 # Docker Compose configuration
└── README.md                   # Project documentation
```

## 🎨 Frontend Structure

The frontend structure is similar to 

```
frontend/
│   ├── src/
│   │   ├── api/                # API client functions
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/           # React contexts for global state
│   │   ├── types/              # TypeScript type definitions
│   │   ├── atoms.tsx           # Jotai state management
│   │   ├── ToolMaps.tsx        # Tool registration and config
│   │   └── App.tsx             # Main application component
├── tools/                      # Tool implementations
│   ├── alloy/                  # (if selected)
│   ├── limboole/               # (if selected)
│   ├── common/                 # Shared utilities
│   └── [other-tools]/          # Based on selection
├── index.html                  # HTML template
├── package.json                # Dependencies
└── vite.config.ts              # Build configuration
```

### Key Frontend Files

- `src/ToolMaps.tsx`
Central configuration for all tools. If you selected only Alloy and Limboole, it would look like this:

```typescript
export const fmpConfig: FmpConfig = {
  title: 'FM Playground',
  repository: 'https://github.com/fm4se/fm-playground',
  issues: 'https://github.com/fm4se/fm-playground/issues',
  tools: {
    als: { name: 'Alloy', extension: 'als', shortName: 'ALS' },
    limboole: { name: 'Limboole', extension: 'limboole', shortName: 'SAT' },
  },
};
```

- `src/atoms.tsx`
Global state management with Jotai:

```typescript
export const editorValueAtom = atom('');
export const languageAtom = atom('alloy');
export const outputAtom = atom('');
export const isExecutingAtom = atom(false);
```

- `tools/[tool-name]/`
Each tool has its own directory with:
    - **Executor**: Core execution logic
    - **TextMate Grammar**: Syntax highlighting
    - **Components**: Optional UI components

!!! note "Note"
    The ``backend`` and `{tool}-api` structures are same as described in the [Existing Project Structure](../existing-project/project-structure.md#backend-architecture) guide.
















## 🐳 Docker Configuration

### Main `compose.yml`

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - FLASK_ENV=development

  # Only selected tools appear here
  alloy-api:
    build: ./alloy-api
    ports:
      - "8001:8001"

  limboole-api:
    build: ./limboole-api
    ports:
      - "8002:8002"
```

### Individual Service Configs

Each tool API has its own `compose.yml` for standalone development:

```yaml
# limboole-api/compose.yml
version: '3.8'
services:
  limboole-api:
    build: .
    ports:
      - "8002:8002"
    volumes:
      - .:/app
    environment:
      - PYTHONPATH=/app
```

## 🌐 Service Communication

### Frontend ↔ Backend

```typescript
// frontend/src/api/tools.ts
export const executetool = async (tool: string, code: string) => {
  const response = await fetch(`${API_BASE}/api/execute/${tool}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  return response.json();
};
```

### Backend ↔ Tool APIs

```python
# backend/routes/proxy.py
import requests

def proxy_to_tool_api(tool, data):
    tool_urls = {
        'alloy': 'http://alloy-api:8001',
        'limboole': 'http://limboole-api:8002',
    }
    
    url = f"{tool_urls[tool]}/execute"
    response = requests.post(url, json=data)
    return response.json()
```

## 📊 Architecture Benefits

### Microservices Advantages

1. **Independence**: Each tool can be developed/deployed separately
2. **Scalability**: Scale individual tools based on usage
3. **Technology Freedom**: Use best language for each tool
4. **Isolation**: Tool failures don't affect others
5. **Development**: Teams can work on different tools independently

### Service Boundaries

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │  Tool APIs  │
│             │    │             │    │             │
│ React/Vite  │◄──►│Python/Flask │◄──►│Various Lang │
│             │    │             │    │             │
│   Port:3000 │    │   Port:8000 │    │ Ports:8001+ │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🔍 Understanding Your Selection

### Minimal Setup (No Tools)

```
my-playground/
├── frontend/        # Basic UI only
├── backend/         # Coordination layer
├── compose.yml      # Frontend + Backend only
└── README.md
```

### Full Setup (All Tools)

```
my-playground/
├── frontend/        # Full UI with all tools
├── backend/         # Full coordination layer
├── alloy-api/       # Java service
├── limboole-api/    # Python service
├── nuxmv-api/       # Python service
├── z3-api/          # Python service
├── spectra-api/     # Python service
├── compose.yml      # All services
└── README.md
```

### Custom Selection Example

If you selected only Alloy and Limboole:

```
my-playground/
├── frontend/        # UI with Alloy + Limboole
├── backend/         # Coordination layer
├── alloy-api/       # Java service
├── limboole-api/    # Python service
├── compose.yml      # 4 services total
└── README.md
```

## 🎯 Next Steps

Now that you understand the structure:

1. **[Set Up Development →](development-setup.md)** - Get your playground running
2. **[Add Tools →](adding-tools.md)** - Extend with more formal method tools
3. **[Customize →](customization.md)** - Personalize your playground

## 💡 Tips

- **Start Simple**: Begin with one tool, understand the flow
- **Use Docker**: Simplifies service orchestration
- **Check Logs**: `docker-compose logs [service]` for debugging
- **Modify Gradually**: Change one service at a time
