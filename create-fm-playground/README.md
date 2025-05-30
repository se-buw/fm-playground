# create-fm-playground

A CLI tool to create new Formal Methods playground projects with customizable tool selection.

## Quick Start

```bash
npx create-fm-playground
```

Or install globally:

```bash
npm install -g create-fm-playground
create-fm-playground
```

## What it does

This CLI tool helps you set up a new Formal Methods playground project by:

1. **Copying the frontend base**: Copies all files from the FM Playground frontend directory to a `frontend/` subdirectory
2. **Copying the backend**: Always copies the backend directory to project root for API functionality
3. **Tool selection**: Provides an interactive interface to select which formal method tools you want to include:
    - **Alloy**: A declarative modeling language for software systems
    - **Limboole**: A SAT-based tool for Boolean reasoning
    - **nuXmv**: A symbolic model checker for finite and infinite-state systems
    - **SMT (Z3)**: A SMT solver for satisfiability modulo theories
    - **Spectra**: A specification language for reactive systems
4. **API copying**: Copies only the API directories for selected tools (`alloy-api/`, `z3-api/`, etc.)
5. **Project setup**: Creates a new project with proper configuration and README
6. **Minimal setup support**: Allows creating projects with no tools selected for custom setups

## Features

- 🎯 **Interactive CLI** - Easy-to-use prompts for project configuration
- 🛠️ **Selective tool inclusion** - Choose only the tools you need, or none for minimal setup
- 🏗️ **Full-stack setup** - Copies frontend, backend, and selected tool APIs
- 📦 **Automatic dependency installation** - Optional npm install for frontend
- 📝 **Generated documentation** - Creates a README with selected tools info
- ⚡ **Fast setup** - Get started with formal methods in seconds
- 🔧 **Smart configuration** - Automatically configures project files based on tool selection:
    - **Frontend/**: Complete frontend application in subdirectory
    - **Backend/**: Always included backend API server
    - **Tool APIs**: Only copies API directories for selected tools (alloy-api/, z3-api/, etc.)
    - **ToolMaps.tsx**: Only imports and configures selected tools (template for no-tools setup)
    - **HTML scripts**: Conditionally includes tool-specific JavaScript files
    - **Vite config**: Removes proxy settings for unselected tools
    - **Dependencies**: Only copies files needed by selected tools
    - **Common files**: Selectively filters Guides.json and lineHighlightingUtil.ts

## Usage

When you run the command, you'll be prompted for:

1. **Project name** - Name for your new FM playground project
2. **Tool selection** - Choose which formal method tools to include (or leave empty for minimal setup)
3. **Dependency installation** - Whether to automatically run `npm install`

## Example

```bash
$ npx create-fm-playground

🚀 Create FM Playground
Set up a new Formal Methods playground project

? What is your project name? my-awesome-fm-project
? Which formal method tools would you like to include? (Press <space> to select)
❯◯ Alloy - A declarative modeling language for software systems
 ◉ Limboole - A SAT-based tool for Boolean reasoning
 ◉ SMT (Z3) - A SMT solver for satisfiability modulo theories
 ◯ nuXmv - A symbolic model checker for finite and infinite-state systems
 ◯ Spectra - A specification language for reactive systems

? Would you like to install dependencies? Yes

✅ FM Playground project created successfully!

To get started:

  cd my-awesome-fm-project
  npm run dev
```

## Project Structure

After running the CLI, your project will have this structure:

```
my-fm-project/
├── frontend/               # React frontend application
│   ├── src/               # React application source
│   ├── public/            # Static assets
│   ├── tools/             # Selected tool configurations
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
├── backend/               # Backend API server (always included)
│   ├── app.py            # Main Flask application
│   ├── routes/           # API route handlers
│   ├── db/               # Database models and queries
│   └── requirements.txt   # Python dependencies
├── alloy-api/            # Alloy tool API (if Alloy selected)
├── z3-api/               # Z3/SMT tool API (if SMT selected)
├── limboole-api/         # Limboole tool API (if Limboole selected)
├── nuxmv-api/            # nuXmv tool API (if nuXmv selected)
├── spectra-api/          # Spectra tool API (if Spectra selected)
└── README.md             # Project documentation
```

## Getting Started

To start your development environment:

```bash
# Navigate to your project
cd my-fm-project

# Start the frontend development server
cd frontend
npm install  # if not already installed
npm run dev

# In another terminal, start the backend (optional)
cd ../backend
poetry install  # or pip install -r requirements.txt
python app.py

# Start individual tool APIs as needed (optional)
cd ../alloy-api  # or any other *-api directory
# Follow the API-specific README instructions
```

## Development

To work on this CLI tool:

```bash
git clone https://github.com/se-buw/fm-playground.git
cd fm-playground/create-fm-playground
npm install

# Build TypeScript to JavaScript
npm run build

# For development with auto-rebuild
npm run dev

# Link for local testing
npm link

# Now you can use the local version
create-fm-playground
```

### Development Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode compilation
- `npm run prepublishOnly` - Build before publishing

### Project Structure

```
src/
├── index.ts              # Main implementation
├── types.ts              # TypeScript type definitions
├── tool-map-template.ts  # Tool configuration templates
bin/
├── cli.mjs              # CLI entry point
dist/                    # Compiled JavaScript (generated)
```

## Requirements

- Node.js >= 16.0.0
- npm >= 7.0.0

## License

MIT © Software Engineering @ Bauhaus-Universität Weimar

## Related

- [FM Playground](https://github.com/se-buw/fm-playground) - The main FM Playground project
- [formal-methods.net](https://formal-methods.net) - Learn more about formal methods
