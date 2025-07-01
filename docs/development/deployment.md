# Development Setup Guide

This guide shows you how to get your FM Playground running locally for development.

## 🎯 Prerequisites

Ensure you have completed:
- [Project Creation](project-creation.md) - Your project is created
- [Project Structure](project-structure.md) - You understand the layout

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Navigate to your project
cd your-project-name

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

Your playground will be available at: **http://localhost:3000**

### Option 2: Manual Setup

If you prefer to run services individually:

```bash
# Terminal 1: Frontend
cd frontend
npm install
npm run dev

# Terminal 2: Backend  
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py

# Terminal 3+: Tool APIs (for each selected tool)
cd [tool-name]-api
# Follow tool-specific setup below
```

## 🐳 Docker Setup Details

### Starting Services

```bash
# Start in detached mode
docker-compose up -d

# Start with logs visible
docker-compose up

# Start specific service
docker-compose up frontend

# Rebuild and start
docker-compose up --build
```

### Managing Services

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs                    # All services
docker-compose logs frontend           # Specific service
docker-compose logs -f --tail=50 backend  # Follow with tail

# Restart services
docker-compose restart                 # All services
docker-compose restart backend         # Specific service

# Stop services
docker-compose down                    # Stop all
docker-compose stop frontend          # Stop specific
```

### Expected Services

Based on your tool selection, you should see:

```bash
$ docker-compose ps

Name                 Command               State           Ports
----------------------------------------------------------------
frontend            npm run dev              Up      0.0.0.0:3000->3000/tcp
backend             python app.py            Up      0.0.0.0:8000->8000/tcp
alloy-api           java -jar app.jar        Up      0.0.0.0:8001->8001/tcp
limboole-api        python main.py           Up      0.0.0.0:8002->8002/tcp
```

## 🔧 Manual Setup Details

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Alternative: with specific port
npm run dev -- --port 3001
```

**Frontend Environment Variables:**
```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000
VITE_ALLOY_API_URL=http://localhost:8001
VITE_LIMBOOLE_API_URL=http://localhost:8002
VITE_NUXMV_API_URL=http://localhost:8003
VITE_SMT_API_URL=http://localhost:8004
VITE_SPECTRA_API_URL=http://localhost:8005
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py

# Alternative: with Flask CLI
flask run --port 8000 --debug
```

**Backend Environment Variables:**
```bash
# backend/.env
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=sqlite:///playground.db
ALLOY_API_URL=http://localhost:8001
LIMBOOLE_API_URL=http://localhost:8002
```

### Tool API Setup

#### Python-based Tools (Limboole, nuXmv, SMT, Spectra)

```bash
cd limboole-api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python main.py

# Alternative: with uvicorn
uvicorn main:app --reload --port 8002
```

#### Java-based Tools (Alloy)

```bash
cd alloy-api

# Build with Gradle
./gradlew build

# Run the application
./gradlew run

# Alternative: run JAR directly
java -jar build/libs/alloy-api.jar
```

## 🧪 Testing Your Setup

### 1. Service Health Checks

```bash
# Test frontend
curl http://localhost:3000

# Test backend
curl http://localhost:8000/health

# Test tool APIs
curl http://localhost:8001/health  # Alloy
curl http://localhost:8002/health  # Limboole
curl http://localhost:8003/health  # nuXmv
curl http://localhost:8004/health  # SMT
curl http://localhost:8005/health  # Spectra
```

### 2. Frontend Interface

Visit [http://localhost:3000](http://localhost:3000) and verify:

- ✅ FM Playground interface loads
- ✅ Selected tools appear in sidebar
- ✅ Code editor is functional
- ✅ No console errors

### 3. Tool Execution Tests

#### Test Limboole
1. Select "Limboole" from sidebar
2. Enter: `(a & b) | (!a & c)`
3. Click "Run"
4. Expect: Satisfiability results

#### Test Alloy
1. Select "Alloy" from sidebar  
2. Enter:
   ```alloy
   sig Person {
     age: Int
   }
   
   pred canVote[p: Person] {
     p.age >= 18
   }
   
   run canVote for 3
   ```
3. Click "Run"
4. Expect: Model instances

#### Test SMT/Z3
1. Select "SMT" from sidebar
2. Enter:
   ```smt
   (declare-const x Int)
   (declare-const y Int)
   (assert (> x 0))
   (assert (< y 10))
   (assert (= (+ x y) 15))
   (check-sat)
   (get-model)
   ```
3. Click "Run"
4. Expect: SAT with model

### 4. API Integration Tests

```bash
# Test backend → tool API communication
curl -X POST http://localhost:8000/api/execute/limboole \
  -H "Content-Type: application/json" \
  -d '{"code": "(a & b)"}'

# Test tool API directly
curl -X POST http://localhost:8002/solve \
  -H "Content-Type: application/json" \
  -d '{"formula": "(a & b)"}'
```

## 🔧 Common Development Tasks

### Code Changes

**Frontend Changes:**
- Files auto-reload with Vite dev server
- No restart needed for React components

**Backend Changes:**
```bash
# With Flask debug mode (auto-reload)
export FLASK_DEBUG=1
python app.py

# Manual restart
docker-compose restart backend
```

**Tool API Changes:**
```bash
# Python APIs with uvicorn (auto-reload)
uvicorn main:app --reload

# Manual restart
docker-compose restart limboole-api
```

### Database Operations

```bash
# Initialize database
cd backend
python -c "from app import create_tables; create_tables()"

# Reset database
rm -f playground.db
python -c "from app import create_tables; create_tables()"
```

### Adding Dependencies

**Frontend:**
```bash
cd frontend
npm install new-package
# Restart if using Docker
docker-compose restart frontend
```

**Backend:**
```bash
cd backend
pip install new-package
pip freeze > requirements.txt
# Rebuild Docker image
docker-compose build backend
```

## 🐛 Troubleshooting

### Port Conflicts

```bash
# Find processes using ports
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows

# Use different ports
# In docker-compose.yml:
ports:
  - "3001:3000"  # host:container
```

### Container Issues

```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs [service-name]

# Restart containers
docker-compose restart

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d
```

### Python Environment Issues

```bash
# Clear Python cache
find . -name "*.pyc" -delete
find . -name "__pycache__" -delete

# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Node.js Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete and reinstall node_modules
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Next Steps

With your development environment running:

1. **[Add Tools →](adding-tools.md)** - Extend with more formal method tools
2. **[Customize →](customization.md)** - Personalize your playground
3. **[Deploy →](deployment.md)** - Share your playground with others

## 💡 Development Tips

- **Use Docker**: Simplifies dependency management
- **Check Logs**: First step in debugging
- **Hot Reload**: Frontend changes reflect immediately
- **API Testing**: Use curl or Postman for API testing
- **Version Control**: Commit working states frequently
