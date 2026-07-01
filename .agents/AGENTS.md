# Project Rules and Guidelines

Welcome to the project! This file outlines the behavioral guidelines, coding standards, and workflows for Antigravity when working on this codebase.

## 1. Project Overview
<!-- Keep this section updated with the high-level goals of the web app -->
- **Goal**: A web app for organizing events. Students can register, check in and check out of an event. Organizers can create events waiting for approval, check attendance with student who has registered. Admins can approve events.
- **Tech Stack**: [Agent can self-decide but integrate with git and GitHub]
- **Target Audience / Platform**: Desktop web browsers, responsive mobile

## 2. Coding Standards
- **Style and Readability**: Write clean, modular, and self-documenting code. Use descriptive variable and function names.
- **Typing**: If using TypeScript, avoid using `any`. Define interfaces and types clearly.
- **Error Handling**: Implement robust error boundaries, try-catch blocks for async operations, and user-friendly error messages. Write unit tests and test the whole app.

## 3. UI/UX & Styling Guidelines
- **Theme**: Follow https://hcmut.edu.vn/
- **CSS Strategy**: Use Vanilla CSS for custom layouts. Define design tokens (colors, font-families, spacing, transitions) using CSS custom properties in `index.css` or `variables.css`.
- **Aesthetics**: Ensure smooth hover effects, micro-animations, and consistent spacing (margins/padding). Avoid raw, basic browser styles.
- **Responsiveness**: Build mobile-first or highly responsive layouts using media queries or CSS Grid/Flexbox.

## 4. Git Integration & Commit Workflow
- **Commit Message Format**: Use Conventional Commits (e.g., `feat: add OAuth login button`, `fix: handle empty git repository state`).
- **Branch Management**: Work on feature-specific branches (e.g., `feature/git-sync`, `bugfix/auth-token`).
- **Safety**: Do not commit secrets, API keys, or personal access tokens directly. Use environment variables (e.g., `.env`).

## 5. Agent Workflow Rules
- **Planning**: Before implementing complex architectural features, draft a clear plan detailing modifications and dependencies.
- **Interactive Checkpoints**: Stop and verify critical milestones with automated tests or manual browser verification steps.
- **Preserve Context**: Maintain existing comments, docstrings, and documentation unless specifically modifying that behavior.
