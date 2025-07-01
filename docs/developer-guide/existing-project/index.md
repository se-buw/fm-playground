# Working with Existing Project

This guide covers setting up your FM Playground by forking the existing repository. This approach gives you access to all existing tools and the complete codebase.

## 🎯 Overview

The existing project approach is ideal when you:

- Want all formal method tools (Alloy, Limboole, nuXmv, SMT/Z3, Spectra) currently available on the FM Playground
- Need a comprehensive starting point with full features
- Plan to contribute back to the main project
- Want to learn from existing tool implementations
- Prefer to customize existing tools rather than build from scratch

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (version 20 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **GitHub Account** - [Sign up here](https://github.com/)
- **Code Editor** - VS Code recommended

### Verify Your Setup

```bash
# Check Node.js version
node --version
# Should show version 20.x.x or higher

# Check npm version  
npm --version
# Should show version 10.x.x or higher

# Check Git
git --version
# Should show git version
```

## 🍴 Step 1: Fork the Repository

1. **Navigate to the main repository**
      - [https://github.com/fm4se/fm-playground](https://github.com/fm4se/fm-playground)

2. **Fork the repository**
      
      - Click the **"Fork"** button in the top-right corner
      - Choose your GitHub account as the destination
      - Keep the repository name as `fm-playground` or customize it
      - Ensure "Copy the main branch only" is checked
      - Click **"Create fork"**

3. **Verify your fork**
   
   You should now see the repository at `https://github.com/YOUR_USERNAME/fm-playground`

## 📥 Step 2: Clone Your Fork

```bash
# Clone your forked repository
git clone https://github.com/YOUR_USERNAME/fm-playground.git

# Navigate to the project directory
cd fm-playground

# Add the original repository as upstream (for future updates)
git remote add upstream https://github.com/fm4se/fm-playground.git

# Verify your remotes
git remote -v
# Should show:
# origin    https://github.com/YOUR_USERNAME/fm-playground.git (fetch)
# origin    https://github.com/YOUR_USERNAME/fm-playground.git (push)
# upstream  https://github.com/fm4se/fm-playground.git (fetch)
# upstream  https://github.com/fm4se/fm-playground.git (push)
```

## Step 3: Environment Variables
The FM Playground uses environment variables for configuration. There are two environment files- one in the frontend and one in the backend. Make a copy of the `.env.example` files in both directories and rename them to `.env`. Update the values as needed.

```bash
# Navigate to frontend directory
cd frontend
# Copy the example env file
cp .env.example .env
# Update the .env file with your configuration

# Navigate to backend directory
cd ../backend
# Copy the example env file
cp .env.example .env
# Update the .env file with your configuration
```

## 🔧 Step 3: Install Dependencies

The FM Playground consists of both frontend and backend components:

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# This will install all required packages including:
# - React and TypeScript
# - Monaco Editor for code editing
# - Vite for development server
# - Material-UI components
# - Tool-specific dependencies
```

### Backend Setup

```bash
# Navigate to backend directory (from project root)
cd backend

# Install poetry environment (if not already installed)
poetry install --no-root  
# This will set up the Python environment and install:

```

### Tool Specific Setup

Each tool runs on its own backend service. Different tools may have different dependencies or setup requirements.

#### Alloy

Alloy uses a Java backend. Ensure you have Java 17 or higher installed. To install Alloy dependencies, run:

```bash
# Navigate to Alloy tool directory
cd alloy-api

# Install Alloy dependencies and build the project
./gradlew clean build -x test
# This will compile the Alloy backend and prepare it for use
```

#### Limboole

In the FM Playground, Limboole is running as a WebAssembly module. You can run it directly in the browser without additional setup. Though, for the completeness of the setup, you can also run it as a backend service. We are using FastAPI for the Limboole API.

```bash
# Navigate to Limboole tool directory
cd limboole-api
# Install Limboole dependencies
poetry install --no-root  
# This will set up the Python environment and install necessary packages for Limboole
```

#### nuXmv 
nuXmv is running as a backend service using FastAPI. 

```bash
# Navigate to nuXmv tool directory
cd nuxmv-api
# Install nuXmv dependencies
poetry install --no-root  
# This will set up the Python environment and install necessary packages for nuXmv
```

#### SMT/Z3
In the FM Playground, SMT/Z3 is running a WebAssembly module. It also has a backend service using FastAPI. In case the WebAssembly module fails, it falls back to the backend service.

```bash
# Navigate to SMT/Z3 tool directory
cd z3-api
# Install SMT/Z3 dependencies
poetry install --no-root  
# This will set up the Python environment and install necessary packages for SMT/Z3
```

#### Spectra
Spectra is running as a backend service using FastAPI. 

```bash
# Navigate to Spectra tool directory
cd spectra-api
# Install Spectra dependencies
poetry install --no-root  
# This will set up the Python environment and install necessary packages for Spectra
```


## 🚀 Step 4: Start Development Environment

```bash
# From the project root, you can start both frontend and backend

# Terminal 1: Start frontend
cd frontend
npm run dev
# Frontend will be available at http://localhost:5173

# Terminal 2: Start backend (in a new terminal)
cd backend  
python app.py
# Backend API will be available at http://localhost:8000
```

### Tool-Specific Backend Services
You can start each tool's backend service in separate terminals:

!!! note "Note"
      Each tool's backend service runs independently. You don't need to run all of them unless you want to test all tools simultaneously.


```bash
# Terminal 3: Start Alloy backend
cd alloy-api
./gradlew bootRun
# Alloy backend will be available at http://localhost:8080
# Terminal 4: Start Limboole backend
cd limboole-api
uvicorn main:app --reload
# Limboole backend will be available at http://localhost:8001
# Terminal 5: Start nuXmv backend
cd nuxmv-api
uvicorn main:app --reload
# nuXmv backend will be available at http://localhost:8002
# Terminal 6: Start SMT/Z3 backend
cd z3-api
uvicorn main:app --reload
# SMT/Z3 backend will be available at http://localhost:8003
# Terminal 7: Start Spectra backend
cd spectra-api
uvicorn main:app --reload
# Spectra backend will be available at http://localhost:8004
```




## 🧪 Step 5: Verify Your Setup

1. **Check Frontend**
   
   Open [http://localhost:5173](http://localhost:5173) in your browser. You should see:
   - The FM Playground interface
   - All the tools listed in the top (Alloy, Limboole, nuXmv, SMT, Spectra)

2. **Test a Tool**
   
   - Select "Limboole" from the sidebar
   - Enter a simple boolean formula: `(a & b) | c`
   - Click "Run" to test the tool execution
   - Verify you get output


You have successfully set up your FM Playground with all existing tools! You can now start developing new tools, modifying existing ones, or contributing back to the main project.

## 🎯 Next Steps

Now that you have the basic setup running, you can:

1. **[Explore the Project Structure →](project-structure.md)** - Understand the codebase organization
2. **[Keep Your Fork Updated →](maintenance.md)** - Learn to sync with upstream changes
3. **[Add New Tools →](adding-tools.md)** - Extend the playground with custom tools
4. **[Customize Your Setup →](customization.md)** - Modify existing tools and interface
5. **[Test and Deploy →](testing-deployment.md)** - Test changes and build for production

## 🤝 Contributing Back

If you make improvements that could benefit others:

1. **Create a Pull Request** following the [Contributing Guide](../../development/contributing.md)
2. **Follow Coding Standards** as outlined in the [Development Guide](../../development/development-guide.md)
3. **Add Tests** for new features using the [Testing Guide](../../development/testing.md)

## 🔗 Quick Links

- **[Main Repository](https://github.com/fm4se/fm-playground)** - Source code and issues
- **[Development Guide](../../development/development-guide.md)** - Advanced development topics
- **[API Reference](../../development/api-reference.md)** - Backend API documentation
- **[Community Discussions](https://github.com/fm4se/fm-playground/discussions)** - Ask questions and share ideas
