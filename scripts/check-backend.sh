#!/usr/bin/env bash
set -euo pipefail

cd backend
npm install
npx prisma generate
npm run build
