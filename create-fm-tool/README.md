# create-fm-tool

A CLI tool to scaffold formal methods tools for the fm-playground application. This tool helps you quickly create the necessary components to integrate a new formal methods tool into the FM Playground.

## Installation

```bash
# Install globally
npm install -g create-fm-tool

# Or use with npx (recommended)
npx create-fm-tool
```

## Usage

### Interactive Mode

```bash
npx create-fm-tool
```

This will prompt you for all the necessary information to create your tool.

### Quick Mode

```bash
npx create-fm-tool my-tool-name
```

You can provide the tool name as an argument and the CLI will prompt for the remaining configuration.

### With Options

```bash
# Specify custom target path
npx create-fm-tool my-tool --path ./custom/path

# Show help
npx create-fm-tool --help
```

## What it creates

The tool generates a complete scaffold for a formal methods tool including:

- **Executor** (`{tool}Executor.ts`) - Handles tool execution logic and API integration
- **TextMate Grammar** (`{tool}TextMateGrammar.ts`) - Monaco editor language configuration with syntax highlighting
- **Input Component** (optional, `{tool}Options.tsx`) - Additional UI component for tool-specific options
- **Output Component** (optional, `{tool}Notice.tsx`) - Additional UI component for tool-specific information like copyright notices
- **Integration Instructions** (`INTEGRATION.md`) - Detailed instructions for integrating the tool into ToolMaps.tsx and the main application

## Example Structure

After running the tool, you'll get a structure like this:

```
src/tools/mytool/
├── mytoolExecutor.ts
├── mytoolTextMateGrammar.ts
├── MyToolOptions.tsx (optional)
├── MyToolNotice.tsx (optional)
└── INTEGRATION.md
```

## Configuration Options

The CLI will prompt you for:

- **Tool Name**: The internal name of your tool (e.g., "nuxmv", "z3")
- **Display Name**: Human-readable name shown in the UI
- **Tool ID**: Uppercase identifier used in configuration maps
- **File Extension**: File extension for the language
- **Comment Syntax**: Line and block comment syntax
- **Keywords**: Language keywords for syntax highlighting
- **Operators**: Language operators for syntax highlighting
- **API Integration**: Whether the tool requires a backend API
- **Components**: Whether to generate additional input/output components

## Integration

After generation, follow the instructions in the generated `INTEGRATION.md` file to:

1. Update `ToolMaps.tsx` to register your tool
2. Add language configuration to Monaco editor
3. Update line highlighting utilities
4. Set up API endpoints (if needed)

## Example: Creating a Tool Like NuXmv

```bash
npx create-fm-tool nuxmv-like
```

When prompted:

- Display Name: `NuXmv Clone`
- Tool ID: `NUXMV_CLONE`
- File Extension: `xmv`
- Line Comment: `--`
- Keywords: `MODULE, VAR, ASSIGN, INIT, TRANS, SPEC, LTLSPEC, CTLSPEC`
- Operators: `=, >, <, <=, >=, !=, &, |, !, ->, <->`
- API Endpoint: Yes (`/nuxmv-clone`)
- Additional Output Component: Yes (for copyright notice)

This will generate a tool structure similar to the existing nuxmv tool.

## Development

To work on this package:

```bash
# Clone and install dependencies
git clone <repo>
cd create-fm-tool
npm install

# Development mode
npm run dev

# Build
npm run build

# Test locally
npm link
create-fm-tool test-tool
```

## License

MIT
