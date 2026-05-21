#!/bin/bash
set -e

echo "Running post-merge setup..."
cd Frontend/User-UI
pnpm install --frozen-lockfile
echo "Post-merge setup complete."
