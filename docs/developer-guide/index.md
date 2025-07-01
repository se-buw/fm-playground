# FM Playground Developer Guide

Formal Methods (FM) Playground is a web platform for running and experimenting with different formal methods tools. It is designed to be integrated any formal methods tool that can be run without installation on the local machine. The platform is built using modern web technologies and provides a user-friendly interface for interacting with formal methods tools.


# Getting Started

This guide will help you to set up your own instance of the FM Playground and add/modify tools.

There are two main approaches to develop your own FM Playground instance, depending on your needs and preferences:

## 🍴 Working with Existing Project

**Best for:** Developers who want access to all existing tools and prefer a complete codebase as starting point.

If you want to start with all existing formal method tools (Alloy, Limboole, nuXmv, SMT/Z3, Spectra) and build upon them, this approach gives you the full codebase to work with.

**[📖 Read the detailed guide →](existing-project/)**

---

## 🚀 Start from Scratch  

**Best for:** Developers who want a minimal setup and prefer to add only the tools they need.

If you want a clean, minimal starting point and only need specific formal method tools, this approach lets you create a customized playground from the ground up.

**[📖 Read the detailed guide →](start-from-scratch/)**

---

## 🛠️ Adding Custom Tools

Both approaches support adding custom tools using the `fmp-tool` CLI. This powerful tool generator helps you create new formal method tools with minimal effort.

### Key Features

- **Interactive Setup**: Guided configuration for your tool
- **Template Generation**: Automatic creation of all necessary files
- **Integration Support**: Built-in ToolMaps.tsx integration
- **Flexible Options**: Support for custom input/output components

### Quick Start

```bash
npx fmp-tool
```

**[📖 Learn more about tool development →](../development/development-guide.md)**

---

## 🎯 Choose Your Path

| Aspect | Existing Project | Start from Scratch |
|--------|------------------|-------------------|
| **Setup Time** | Quick (fork & clone) | Medium (guided setup) |
| **Initial Tools** | All tools included | Select only what you need |
| **Codebase Size** | Full codebase | Minimal, focused |
| **Customization** | Modify existing | Build from ground up |
| **Learning Curve** | Steeper (more code) | Gentler (less complexity) |

---

## Quick Navigation

- **[Existing Project Setup →](existing-project/)** - Fork and extend the full repository
- **[Start from Scratch →](start-from-scratch/)** - Create a minimal, custom playground  
- **[Development Guide →](../development/development-guide.md)** - Learn about tool development
- **[API Reference →](../development/api-reference.md)** - Technical documentation
- **[Main Repository →](https://github.com/fm4se/fm-playground)** - Source code and issues
