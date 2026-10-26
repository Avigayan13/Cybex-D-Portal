# Contributing to CYBEX D

Thank you for helping improve the SRM AP CSE Section D portal. This guide keeps contributions focused, reviewable, and safe for students who rely on the portal.

## Before you begin

- Check existing issues before opening a new one.
- Never commit `.env` files, API keys, OTP secrets, student data, or production credentials.
- Keep each pull request focused on one bug fix, feature, documentation change, or design improvement.

## Local workflow

1. Create a branch from `main`.
2. Use a descriptive branch name:
   - `feat/short-description` for a feature
   - `fix/short-description` for a bug fix
   - `docs/short-description` for documentation
3. Install dependencies with `npm install`, then start the app with `npm run dev`.
4. Test the changed flow before opening a pull request.

## Pull request checklist

Before requesting review, make sure that you have:

- [ ] Used a clear, descriptive title
- [ ] Explained what changed and why
- [ ] Tested the affected flow locally
- [ ] Added screenshots for visible UI changes
- [ ] Kept secrets and student information out of commits and screenshots
- [ ] Updated documentation when setup or behavior changes

## Reporting issues

A helpful issue includes the expected behavior, what actually happened, reproducible steps, and screenshots when they do not contain private information.

## Respectful collaboration

Use constructive feedback, protect student privacy, and keep discussions focused on improving the portal for the section.
