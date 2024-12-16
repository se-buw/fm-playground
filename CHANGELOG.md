# Change Log

## v2.4.0 [2024-12-16]
### Changed
- ✨ Alloy- added support for atoms and skolems when parsing expressions
- 🐛 Alloy- fixed tabular output
- 🐛 Alloy- fixed alloy instance is not updating immediately
- 🐛 Alloy- fixed evaluator cleared up when switching tabs


## v2.3.0 [2024-12-04]
### Changed
- ✨ Added alloy evaluator
- 🎨 Improved the visualization of alloy text and tabular format
- ⚡️ Switched deprecated method in Java

## v2.2.2 [2024-12-03]
### Changed
- 📌Bump python dependencies

## v2.2.1 [2024-11-26]
### Changed
⚡️Set alloy memory usage limit; restart if exceeded
⚡️Using minisat for alloy
🐛Handle label on alloy commands

## v2.2.0 [2024-11-20]
### Added
- ✨ Added typo validation in Limboole.
- ✨ Storing language support check as metadata
### Changed
- 🐛 Fixed issue with ascii char recognition
- 🐛 Fixed limboole syntax highlighting
- ♻️ Refactored error messages

## v2.1.1 [2024-11-05]
### Changed
- 🐛 Fixed Alloy default run command ignoring all facts
- 🧪 Fixed Alloy-api bkoken test cases
- ⚡️ Removed some unused code
- ⚡️ Fixed some code smells

## v2.1.0 [2024-11-01]
### Added
 - ✨ SMT in editor language support (browser worker)
 - ✨ Feedback form

## v2.0.0 [2024-10-20]
### Added
- ⚡️ Added caching mechanism for z3, nuXmv, and Spectra with Redis
- ✨ New api for getting metadata
### Changed
- 💥 Separated nuxmv, alloy, and z3 api
- 💥 Merged VAL and QBF are merged into SAT
- 🔥 Remove tool specific api
- 🔥 Remove check type for permalink lookup
- 🔥 Remove dark mode (temporarily)
- ♻️ Migrated backend to Flask 3 and poetry
- ♻️ Populating tools dropdown from fmp.conf
- ♻️ Fixed wasm fallback api
- 🎨 Added issue link on error modals
- 🐛Fixed-creating new spec not reseting the editor
  
## v1.5.0 [2024-10-07]
### Added
 - ✨ Limboole in editor language support (browser worker)
 - ✨ Store playground version for future reference
### Changed
  - ⚡Migrated from JavaScript to TypeScript
  - ♻️Merged some duplicate API endpoints

## v1.4.2 [2024-09-28]
### What's changed?
- 📌Bump esbuild from 0.20.2 to 0.21.5
- 📌Bump micromatch from 4.0.5 to 4.0.8
- 📝Added new examples for SAT, SMT, and Alloy
- 📝Linked YouTube playlist on the readme

## v1.4.1 [2024-08-17]
### What's changed?
- 🐛Fixed #9 - Alloy's subset singnature indication missing in instances
- 🐛Fixed #8 - unexpected behavior on last instance of temporal Alloy models
- 📌Bump axios from 1.6.2 to 1.7.4

## v1.4.0 [2024-08-10]
### What's changed?
- Added alloy tabular and text output 
- Bug Fixed- can't parse alloy integer label
- Fixed- Unicode handling
- Fixed- Alloy timeout
- Disabled next instance button while calculating
- Added rate limiter for alloy
- Added download ext for spectra
- Add SQLite option for local development


## v1.3.0 [2024-07-09]
### What's changed?

- Removed legacy alloy4fun
- Added new Alloy API with Spring Boot
- Integrated Alloy UI into the main playground
- Fixed #6 Limboole syntax error reporting blocks running
- Removed DB migration on docker 
- Fixed spectra line highlighting error
- nuXmv tutorial URL changed
- Updated workflow for docker build


## v1.2.1 [2024-06-09]
### What's changed?
- Introduce new tool - Spectra Synthesizer
- Line highlighting on the editor on error/core
- Introduced dark mode
- Compressing large response body
- Migrated Z3 to the browser


## v1.1.2 [2024-01-10]
### Fix

- Syntax highlighting fails when loading from permalinks 9991aa1c9c83c78fbd1d9849b5b80fd8efd19d19
- Handle non-ASCII characters on specification
- nuXmv time-out blocked by Gunicorn
- Store the specification configuration on refresh/redirect
- Exit fullscreen mode with ESC key keeps current ref
- File upload type
- Run button disable failed when running

## v1.1.1 [2024-01-05]

### Fix
- GitHub link breaks on mobile device
- After loading a spec from the history the output panel keeps the content of previous analyses, and the permalink is not updated
- Keep the selected history highlighted
- The search results reset to all specs after loading a spec


## v1.1.0 [2023-12-28]
### What’s Changed

- Save user theme preference
- Adjust the height on the fullscreen
- Codebase minification on deployment
- Upgrade Alloy-API to the latest maven and java
- Introduce request limit with flask-limiter

### Fix

- Limboole parsing error #4
- Copying empty permalink
- API response error
- nuXmv copyright notice


## v1.0.0 [2023-12-21]
### What's Changed

- Completely rewritten frontend with React
- Added login functionality with Google and GitHub
- Added ability to save specifications
- Added ability to download history as JSON
- Search saved history 

## v0.1 [2023-12-14]