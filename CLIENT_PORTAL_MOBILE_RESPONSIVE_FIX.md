# Client Portal mobile responsive fix

This patch makes the Client Portal mobile-first and removes horizontal overflow on iPhone and other narrow browsers.

Changes:
- full-width portal shell and main content with explicit overflow protection
- compact sticky mobile portal navigation with horizontally scrollable tabs
- single-column dashboard metrics on phones
- single-column project/activity/support/proposal layouts
- safe-area aware spacing for iPhone
- wrapping for long activity, proposal and project text
- proposal detail panel becomes inline instead of sticky on mobile
- smaller mobile typography, padding and card radii

No database migration or environment-variable changes are required.
