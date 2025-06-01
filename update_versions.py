#!/usr/bin/env python3
import json
import os
import re
import sys
import argparse
import subprocess
from pathlib import Path
from typing import List, Dict, Any


class VersionUpdater:
    def __init__(self, new_version: str, dry_run: bool = False):
        self.new_version = new_version
        self.dry_run = dry_run
        self.updated_files = []

    def log(self, message: str, file_path: str = None):
        """Log messages with optional file context."""
        prefix = "[DRY RUN] " if self.dry_run else ""
        if file_path:
            print(f"{prefix}{message}: {file_path}")
        else:
            print(f"{prefix}{message}")

    def find_files(self, pattern: str, exclude_dirs: List[str] = None) -> List[Path]:
        """Find files matching a pattern, excluding specified directories."""
        if exclude_dirs is None:
            exclude_dirs = [
                "node_modules",
                ".git",
                "__pycache__",
                "venv",
                ".venv",
                "dist",
                "build",
            ]

        files = []
        for root, dirs, filenames in os.walk("."):
            # Remove excluded directories from the search
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            for filename in filenames:
                if filename == pattern:
                    files.append(Path(root) / filename)

        return files

    def update_package_json(self, file_path: Path) -> bool:
        """Update version in package.json files."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            if "version" not in data:
                self.log(f"No version field found in {file_path}")
                return False

            old_version = data["version"]
            data["version"] = self.new_version

            if not self.dry_run:
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                    f.write("\n")  # Add newline at end

            self.log(
                f"Updated version from {old_version} to {self.new_version}",
                str(file_path),
            )
            return True

        except (json.JSONDecodeError, FileNotFoundError) as e:
            self.log(f"Error updating {file_path}: {e}")
            return False

    def update_pyproject_toml(self, file_path: Path) -> bool:
        """Update version in pyproject.toml files."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Pattern to match version in [project] or [tool.poetry] sections
            patterns = [
                r'(^\[project\].*?^version\s*=\s*")[^"]*(")',
                r'(^\[tool\.poetry\].*?^version\s*=\s*")[^"]*(")',
                r'(^version\s*=\s*")[^"]*(")',  # Standalone version line
            ]

            updated = False
            for pattern in patterns:
                if re.search(pattern, content, re.MULTILINE | re.DOTALL):
                    old_content = content
                    content = re.sub(
                        pattern,
                        rf"\g<1>{self.new_version}\g<2>",
                        content,
                        flags=re.MULTILINE | re.DOTALL,
                    )
                    if content != old_content:
                        updated = True
                        break

            if updated:
                if not self.dry_run:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(content)
                self.log(f"Updated version to {self.new_version}", str(file_path))
                return True
            else:
                self.log(f"No version field found in {file_path}")
                return False

        except FileNotFoundError as e:
            self.log(f"Error updating {file_path}: {e}")
            return False

    def update_package_lock_json(self, file_path: Path) -> bool:
        """Update version in package-lock.json files."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            updated = False

            # Update root version
            if "version" in data:
                old_version = data["version"]
                data["version"] = self.new_version
                updated = True
                self.log(
                    f"Updated root version from {old_version} to {self.new_version}",
                    str(file_path),
                )

            # Update version in packages section (npm v2+ lockfile format)
            if "packages" in data and "" in data["packages"]:
                root_package = data["packages"][""]
                if "version" in root_package:
                    old_version = root_package["version"]
                    root_package["version"] = self.new_version
                    updated = True
                    self.log(
                        f"Updated packages root version from {old_version} to {self.new_version}",
                        str(file_path),
                    )

            # Update lockfileVersion if needed (optional, but good practice)
            if "lockfileVersion" not in data:
                data["lockfileVersion"] = 3  # Current npm lockfile version
                updated = True

            if updated:
                if not self.dry_run:
                    with open(file_path, "w", encoding="utf-8") as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                        f.write("\n")  # Add newline at end
                return True
            else:
                self.log(f"No version fields found in {file_path}")
                return False

        except (json.JSONDecodeError, FileNotFoundError) as e:
            self.log(f"Error updating {file_path}: {e}")
            return False

    def update_yarn_lock(self, file_path: Path) -> bool:
        """Update yarn.lock is generally regenerated by yarn, but we can note it."""
        self.log(
            f"Found yarn.lock - you should run 'yarn install' to regenerate it after updating package.json",
            str(file_path),
        )
        return False  # Don't count as updated since we don't modify it

    def update_version_file(self, file_path: Path) -> bool:
        """Update simple VERSION files."""
        try:
            if not self.dry_run:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(f"{self.new_version}\n")

            self.log(f"Updated version to {self.new_version}", str(file_path))
            return True

        except Exception as e:
            self.log(f"Error updating {file_path}: {e}")
            return False

    def update_dockerfile(self, file_path: Path) -> bool:
        """Update version in Dockerfile LABEL or ARG instructions."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Common patterns for version in Dockerfiles
            patterns = [
                r'(LABEL version=")[^"]*(")',
                r'(ARG VERSION=")[^"]*(")',
                r'(ENV VERSION=")[^"]*(")',
            ]

            updated = False
            for pattern in patterns:
                if re.search(pattern, content):
                    content = re.sub(pattern, rf"\g<1>{self.new_version}\g<2>", content)
                    updated = True

            if updated:
                if not self.dry_run:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(content)
                self.log(f"Updated version to {self.new_version}", str(file_path))
                return True
            else:
                self.log(f"No version patterns found", str(file_path))
                return False

        except Exception as e:
            self.log(f"Error updating {file_path}: {e}")
            return False

    def run(self):
        """Run the version update process."""
        self.log(f"Starting version update to {self.new_version}")

        # File type handlers
        file_handlers = {
            "package.json": self.update_package_json,
            "package-lock.json": self.update_package_lock_json,
            "yarn.lock": self.update_yarn_lock,
            "pyproject.toml": self.update_pyproject_toml,
            "VERSION": self.update_version_file,
            "Dockerfile": self.update_dockerfile,
        }

        total_updated = 0

        for filename, handler in file_handlers.items():
            files = self.find_files(filename)
            if files:
                self.log(f"Found {len(files)} {filename} files")
                for file_path in files:
                    if handler(file_path):
                        self.updated_files.append(str(file_path))
                        total_updated += 1
            else:
                self.log(f"No {filename} files found")

        self.log(f"Updated {total_updated} files total")

        if self.updated_files:
            self.log("Updated files:")
            for file_path in self.updated_files:
                print(f"  - {file_path}")

    def create_git_tag(self, tag_name: str = None):
        """Create and push a git tag."""
        if tag_name is None:
            tag_name = f"v{self.new_version}"

        try:
            if not self.dry_run:
                # Add changed files
                subprocess.run(["git", "add"] + self.updated_files, check=True)

                # Commit changes
                commit_msg = f"chore: update version to {self.new_version}"
                subprocess.run(["git", "commit", "-m", commit_msg], check=True)

                # Create tag
                subprocess.run(["git", "tag", tag_name], check=True)

                self.log(f"Created git tag: {tag_name}")

                # Ask if user wants to push
                response = (
                    input("Push changes and tag to remote? (y/N): ").strip().lower()
                )
                if response in ["y", "yes"]:
                    subprocess.run(["git", "push"], check=True)
                    subprocess.run(["git", "push", "origin", tag_name], check=True)
                    self.log("Pushed changes and tag to remote")
            else:
                self.log(f"Would create git tag: {tag_name}")

        except subprocess.CalledProcessError as e:
            self.log(f"Git error: {e}")
        except KeyboardInterrupt:
            self.log("Git operations cancelled by user")


def main():
    parser = argparse.ArgumentParser(
        description="Update version numbers across project files"
    )
    parser.add_argument("version", help="New version number (e.g., 1.2.3)")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be updated without making changes",
    )
    parser.add_argument(
        "--tag", action="store_true", help="Create git tag after updating versions"
    )
    parser.add_argument("--tag-name", help="Custom tag name (default: v{version})")

    args = parser.parse_args()

    # Validate version format (basic check)
    if not re.match(r"^\d+\.\d+\.\d+", args.version):
        print("Warning: Version doesn't follow semantic versioning (x.y.z)")
        response = input("Continue anyway? (y/N): ").strip().lower()
        if response not in ["y", "yes"]:
            sys.exit(1)

    # Run version update
    updater = VersionUpdater(args.version, args.dry_run)
    updater.run()

    # Create git tag if requested
    if args.tag and updater.updated_files:
        updater.create_git_tag(args.tag_name)
    elif args.tag and not updater.updated_files:
        print("No files were updated, skipping git tag creation")


if __name__ == "__main__":
    main()
