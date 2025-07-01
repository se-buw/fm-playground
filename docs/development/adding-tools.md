# Adding New Tools

FM Playground is designed to be extensible, allowing you to add new formal methods tools easily. This guide walks you through the process of integrating a new tool into the platform.

## Overview

Each tool in FM Playground consists of:

- **API Service**: A containerized backend service that handles tool execution
- **Frontend Integration**: UI components for tool interaction
- **Configuration**: Tool metadata and Docker orchestration

## Architecture Pattern

Integrating a new tool consists of two main steps:

1. **Backend Service**: Create a backend service that executes the tool and expose APIs for interaction. You can develop a new service or use existing APIs running anywhere that can be accessed by the frontend.
2. **Frontend Integration**: Add the tool to the frontend, allowing users to interact with it through the UI.


## Step 1: Choose Your Tool

For this example, we will integrate **nuXmv**, since it is already supported in FM Playground and the simplest to set up. However, the same principles apply to any tool you wish to add.

### Prerequisites

Before adding a tool, ensure:

- The tool can be automated/scripted e.g. via command line or API
- You understand its input/output formats
- Licensing allows redistribution (if including binaries)

## 

## Step 2: Create the API Service

### Create Directory Structure

```bash
cd fm-playground-main
mkdir cbmc-api
cd cbmc-api
```

### Core Service (`main.py`)

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from cbmc import CBMCTool

app = FastAPI(
    title="CBMC API",
    description="Bounded Model Checker for C/C++ programs",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cbmc_tool = CBMCTool()

class CBMCRequest(BaseModel):
    code: str
    options: dict = {}

class CBMCResponse(BaseModel):
    success: bool
    output: str
    error: str = ""
    verification_result: str = ""

@app.post("/run", response_model=CBMCResponse)
async def run_cbmc(request: CBMCRequest):
    try:
        result = cbmc_tool.run(request.code, request.options)
        return CBMCResponse(
            success=result['success'],
            output=result['output'],
            verification_result=result.get('verification_result', ''),
            error=result.get('error', '')
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy", "tool": "cbmc"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Tool Implementation (`cbmc.py`)

```python
import subprocess
import tempfile
import os
from pathlib import Path

class CBMCTool:
    def __init__(self):
        self.cbmc_path = "/usr/local/bin/cbmc"
        
    def run(self, code: str, options: dict = {}) -> dict:
        """Execute CBMC on the provided C code."""
        
        # Create temporary file for C code
        with tempfile.NamedTemporaryFile(mode='w', suffix='.c', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        try:
            # Build command
            cmd = [self.cbmc_path]
            
            # Add options
            if options.get('unwind'):
                cmd.extend(['--unwind', str(options['unwind'])])
            if options.get('bounds_check', True):
                cmd.append('--bounds-check')
            if options.get('memory_leak_check'):
                cmd.append('--memory-leak-check')
                
            cmd.append(temp_file)
            
            # Execute CBMC
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            # Parse output
            success = result.returncode == 0
            verification_result = self._parse_verification_result(result.stdout)
            
            return {
                'success': success,
                'output': result.stdout,
                'error': result.stderr if result.stderr else '',
                'verification_result': verification_result
            }
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'output': '',
                'error': 'Execution timeout (30s)',
                'verification_result': 'TIMEOUT'
            }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'verification_result': 'ERROR'
            }
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file):
                os.unlink(temp_file)
    
    def _parse_verification_result(self, output: str) -> str:
        """Parse CBMC output to extract verification result."""
        if "VERIFICATION SUCCESSFUL" in output:
            return "SUCCESSFUL"
        elif "VERIFICATION FAILED" in output:
            return "FAILED"
        elif "PARSING ERROR" in output:
            return "PARSE_ERROR"
        else:
            return "UNKNOWN"
```

### Dependencies (`pyproject.toml`)

```toml
[tool.poetry]
name = "cbmc-api"
version = "1.0.0"
description = "CBMC API service for FM Playground"
authors = ["Your Name <your.email@example.com>"]

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.104.1"
uvicorn = "^0.24.0"
pydantic = "^2.5.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.3"
pytest-asyncio = "^0.21.1"
httpx = "^0.25.2"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

### Container Configuration (`Dockerfile`)

```dockerfile
FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install CBMC
RUN wget -O cbmc.deb https://github.com/diffblue/cbmc/releases/download/cbmc-5.95.1/ubuntu-22.04-cbmc-5.95.1-Linux.deb \
    && dpkg -i cbmc.deb \
    && rm cbmc.deb

# Set up Python environment
WORKDIR /app
COPY pyproject.toml poetry.lock ./

# Install Poetry and dependencies
RUN pip3 install poetry
RUN poetry config virtualenvs.create false
RUN poetry install --no-root   --no-dev

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["python3", "main.py"]
```

### Service Orchestration (`compose.yml`)

```yaml
version: '3.8'

services:
  cbmc-api:
    build: .
    ports:
      - "8007:8000"
    environment:
      - PYTHONPATH=/app
    volumes:
      - /tmp:/tmp
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Step 3: Add Tests

Create `tests/test_cbmc.py`:

```python
import pytest
from cbmc import CBMCTool

@pytest.fixture
def cbmc_tool():
    return CBMCTool()

def test_simple_verification(cbmc_tool):
    code = """
    #include <assert.h>
    
    int main() {
        int x = 5;
        assert(x > 0);
        return 0;
    }
    """
    
    result = cbmc_tool.run(code)
    assert result['success'] == True
    assert result['verification_result'] == "SUCCESSFUL"

def test_failing_assertion(cbmc_tool):
    code = """
    #include <assert.h>
    
    int main() {
        int x = -1;
        assert(x > 0);
        return 0;
    }
    """
    
    result = cbmc_tool.run(code)
    assert result['success'] == False
    assert result['verification_result'] == "FAILED"
```

## Step 4: Update Main Docker Compose

Add your service to the main `compose.yml`:

```yaml
services:
  # ... existing services ...
  
  cbmc-api:
    build: ./cbmc-api
    ports:
      - "8007:8000"
    environment:
      - PYTHONPATH=/app
    restart: unless-stopped
    networks:
      - fm-playground
```

## Step 5: Frontend Integration

### Add Tool Configuration

In `frontend/src/config/tools.ts`:

```typescript
export const tools = [
  // ... existing tools ...
  {
    id: 'cbmc',
    name: 'CBMC',
    description: 'Bounded Model Checker for C/C++',
    category: 'Model Checking',
    language: 'c',
    apiUrl: 'http://localhost:8007',
    defaultCode: `#include <assert.h>

int main() {
    int x;
    // Add your verification conditions
    assert(x >= 0);
    return 0;
}`,
    options: [
      {
        name: 'unwind',
        type: 'number',
        label: 'Unwind Depth',
        default: 10,
        description: 'Maximum loop unwind depth'
      },
      {
        name: 'bounds_check',
        type: 'boolean',
        label: 'Bounds Checking',
        default: true,
        description: 'Enable array bounds checking'
      },
      {
        name: 'memory_leak_check',
        type: 'boolean', 
        label: 'Memory Leak Check',
        default: false,
        description: 'Check for memory leaks'
      }
    ]
  }
];
```

### Add Tool Component (Optional)

For custom UI, create `frontend/src/components/tools/CBMCTool.vue`:

```vue
<template>
  <div class="cbmc-tool">
    <ToolEditor
      :tool="tool"
      :code="code"
      :options="options"
      @run="executeCode"
      @code-change="updateCode"
      @options-change="updateOptions"
    />
    
    <div class="cbmc-results" v-if="result">
      <div class="result-status" :class="resultClass">
        {{ result.verification_result }}
      </div>
      
      <pre class="output">{{ result.output }}</pre>
      
      <div v-if="result.error" class="error">
        {{ result.error }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CBMCTool',
  // ... component logic
}
</script>
```

## Step 6: Test Integration

### Start Services

```bash
# Build and start your new service
cd cbmc-api
docker compose up -d

# Start main application
cd ..
docker compose up -d
```

### Test the Integration

1. **API Test**:
```bash
curl -X POST http://localhost:8007/run \
  -H "Content-Type: application/json" \
  -d '{"code": "#include <assert.h>\nint main() { assert(1 > 0); return 0; }"}'
```

2. **Frontend Test**:
   - Navigate to `http://localhost:3000`
   - Select "CBMC" from the tools sidebar
   - Enter test code and verify execution

## Step 7: Documentation

Create tool-specific documentation in `docs/tools/cbmc.md`:

```markdown
# CBMC Tool

CBMC (Bounded Model Checker) is a verification tool for C/C++ programs...

## Usage Examples

### Basic Assertion Checking
...

### Options Reference
...
```

## Advanced Patterns

### Custom Input Formats

For tools requiring special input formats:

```python
class ToolWithCustomInput:
    def prepare_input(self, user_input: str) -> str:
        """Convert user input to tool-specific format."""
        # Parse and transform input
        return transformed_input
    
    def parse_output(self, raw_output: str) -> dict:
        """Parse tool output into structured format."""
        # Extract relevant information
        return structured_output
```

### Binary Tool Integration

For tools distributed as binaries:

```dockerfile
# Download and install binary
RUN wget https://example.com/tool.tar.gz \
    && tar -xzf tool.tar.gz \
    && mv tool /usr/local/bin/ \
    && chmod +x /usr/local/bin/tool
```

### Multi-file Projects

For tools requiring multiple files:

```python
def handle_project(self, files: dict) -> dict:
    """Handle multi-file input."""
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Write all files
        for filename, content in files.items():
            filepath = Path(temp_dir) / filename
            filepath.parent.mkdir(parents=True, exist_ok=True)
            filepath.write_text(content)
        
        # Execute tool on project
        result = self.run_on_directory(temp_dir)
        return result
        
    finally:
        shutil.rmtree(temp_dir)
```

## Best Practices

### Security

- **Timeout Execution**: Always set timeouts for tool execution
- **Resource Limits**: Use Docker resource constraints
- **Input Validation**: Sanitize user inputs
- **Sandboxing**: Run tools in isolated containers

### Performance

- **Caching**: Cache tool binaries and dependencies
- **Parallel Execution**: Design for concurrent requests
- **Resource Management**: Clean up temporary files

### Maintenance

- **Version Pinning**: Pin tool versions in Dockerfile
- **Health Checks**: Implement service health endpoints
- **Logging**: Add structured logging for debugging
- **Monitoring**: Include metrics and monitoring hooks

## Troubleshooting

### Common Issues

1. **Tool Installation Fails**
   - Check tool dependencies
   - Verify download URLs
   - Review container logs

2. **Execution Timeouts**
   - Increase timeout values
   - Optimize tool parameters
   - Check resource constraints

3. **Frontend Integration Issues**
   - Verify API endpoints
   - Check CORS configuration
   - Review network connectivity

## Next Steps

- **[Customize Your Setup →](customization.md)** - Modify existing tools and interface
- **[Testing and Deployment →](testing-deployment.md)** - Test your new tool thoroughly
- **[Project Structure →](project-structure.md)** - Understand how tools fit in the architecture

## Related Documentation

- [Development Guide](../../development/development-guide.md) - Advanced development patterns
- [API Reference](../../development/api-reference.md) - Backend API documentation
- [Contributing Guide](../../development/contributing.md) - Contributing your tool back to the project
