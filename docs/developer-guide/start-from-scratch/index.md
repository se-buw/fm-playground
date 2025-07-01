# Start from Scratch

This guide covers creating a new FM Playground project using `fmp-create`. This approach gives you a minimal, customizable setup with only the tools you need.

## 🎯 Overview

The start-from-scratch approach is ideal when you:

- Want a clean, minimal starting point
- Only need specific formal method tools
- Prefer to avoid unnecessary dependencies
- Are building a specialized or domain-specific playground
- Want to learn the platform architecture step by step

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **Python** (version 3.8 or higher) - [Download here](https://python.org/)
- **Docker** (optional but recommended) - [Download here](https://docker.com/)
- **Code Editor** - VS Code recommended

### Quick Setup Verification

```bash
# Check Node.js version
node --version
# Should show v16.0.0 or higher

# Check Python version
python --version
# Should show Python 3.8.0 or higher

# Check Docker (optional)
docker --version
# Should show Docker version info
```

## 🚀 Getting Started


### Interactive Setup

```bash
# Create a new FM Playground project
npx fmp-create
```

This starts an interactive setup process that guides you through all configuration options.


### 1. Project Name

```
? What is your project name? (my-fm-playground)
```

**Guidelines:**

- Use lowercase letters, numbers, hyphens, and underscores only
- Examples: `my-fm-playground`, `logic-solver`, `verification-tools`
- This will be your project folder name


### 2. Tool Selection

```
? Which formal method tools would you like to include? 
  (Leave empty for a minimal setup)
❯◯ Alloy - A declarative modeling language for software systems
 ◯ Limboole - A SAT-based tool for Boolean reasoning  
 ◯ nuXmv - A symbolic model checker for finite and infinite-state systems
 ◯ SMT (Z3) - A SMT solver for satisfiability modulo theories
 ◯ Spectra - A specification language for reactive systems
```

**Available Tools:**

| Tool | Description | Use Cases | Language |
|------|-------------|-----------|----------|
| **Alloy** | Declarative modeling language | System modeling, constraint solving | Java |
| **Limboole** | SAT-based Boolean reasoning | Propositional logic, satisfiability | Python |
| **nuXmv** | Symbolic model checker | Temporal logic, verification | Python |
| **SMT (Z3)** | SMT solver | Mathematical theories, constraint solving | Python |
| **Spectra** | Reactive systems  | GR(1) synthesis, reactive systems | Python |

**Selection Tips:**

- Use **Space** to select/deselect tools
- Use **Arrow keys** to navigate
- Select **none** for minimal setup (you can add tools later)
- Select **all** if you want the full experience


### 3. Dependency Installation

```
? Would you like to install dependencies? (Y/n)
```

- **Yes (recommended)**: Automatically installs all npm dependencies
- **No**: You'll need to run `npm install` manually later


## 💡 Example Sessions

### Minimal Setup (No Tools)

```bash
$ npx fmp-create

🚀 Create FM Playground
Set up a new Formal Methods playground project

? What is your project name? my-minimal-playground
? Which formal method tools would you like to include? 
  (Leave empty for a minimal setup) (none selected)
? Would you like to install dependencies? Yes

✔ Creating FM Playground project...
✔ Dependencies installed successfully!

✅ FM Playground project created successfully!

To get started:

  cd my-minimal-playground/frontend
  npm run dev

No tools selected - minimal playground setup created.
You can add tools later using the `npx fmp-tool` command.

Happy formal method modeling! 🎉
```

### Full Setup (All Tools)

```bash
$ npx fmp-create

🚀 Create FM Playground
Set up a new Formal Methods playground project

? What is your project name? my-full-playground
? Which formal method tools would you like to include?
❯◉ Alloy - A declarative modeling language for software systems
 ◉ Limboole - A SAT-based tool for Boolean reasoning
 ◉ nuXmv - A symbolic model checker for finite and infinite-state systems
 ◉ SMT (Z3) - A SMT solver for satisfiability modulo theories
 ◉ Spectra - A specification language for reactive systems
? Would you like to install dependencies? Yes

✔ Creating FM Playground project...
✔ Dependencies installed successfully!

✅ FM Playground project created successfully!

To get started:

  cd my-full-playground/frontend
  npm run dev

Selected tools:
  • Alloy - A declarative modeling language for software systems
  • Limboole - A SAT-based tool for Boolean reasoning
  • nuXmv - A symbolic model checker for finite and infinite-state systems
  • SMT (Z3) - A SMT solver for satisfiability modulo theories
  • Spectra - A specification language for reactive systems

Happy formal method modeling! 🎉
```


## 🔧 What Gets Created

Based on your selections, `fmp-create` will generate:

### Always Created
- **Frontend**: React TypeScript application
- **Backend**: Python Flask application
- **Docker Configuration**: docker-compose.yml
- **Documentation**: README.md with setup instructions

### Tool-Specific (Based on Selection)
- **alloy-api/**: Java Gradle service (if Alloy selected)
- **limboole-api/**: Python FastAPI service (if Limboole selected)
- **nuxmv-api/**: Python FastAPI service (if nuXmv selected)
- **z3-api/**: Python FastAPI service (if SMT selected)
- **spectra-api/**: Python FastAPI service (if Spectra selected)

### Frontend Integration
- **Tool Components**: Only for selected tools
- **ToolMaps Configuration**: Customized for your selection
- **Monaco Language Support**: For selected tool languages
- **API Client Code**: For selected tool endpoints

## ⚠️ Common Issues

### 1. Directory Already Exists

```bash
Error: Directory 'my-project' already exists
```

**Solution:**
```bash
# Remove existing directory
rm -rf my-project

# Or choose a different name
npx fmp-create
```

### 2. Permission Errors

```bash
Error: EACCES: permission denied
```

**Solution:**
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm

# Or use different cache
npx --cache /tmp/npx-cache fmp-create
```

### 3. Network Issues

```bash
Error: Failed to download templates
```

**Solution:**
```bash
# Check internet connection
# Try with different registry
npx --registry https://registry.npmjs.org/ fmp-create
```


## 🎯 Next Steps

After project creation:

1. [Understand Project Structure →](project-structure.md)








