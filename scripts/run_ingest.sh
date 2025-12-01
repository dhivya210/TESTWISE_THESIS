#!/bin/bash
# Run ingestion script

cd "$(dirname "$0")/.."
python scripts/ingest_kb.py --dir kb

