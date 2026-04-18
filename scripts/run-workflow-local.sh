#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKFLOWS_DIR=".github/workflows"

usage() {
  echo "Usage: $0 <workflow-file> [job] [event] [event-json-file]"
  echo ""
  echo "  workflow-file     Workflow filename (e.g. test.yaml)"
  echo "  job               Optional job ID to run (e.g. run-tests)"
  echo "  event             Optional event trigger (default: pull_request)"
  echo "  event-json-file   Optional path to event JSON file"
  echo ""
  echo "Examples:"
  echo "  $0 test.yaml"
  echo "  $0 test.yaml run-tests"
  echo "  $0 test.yaml run-tests pull_request .github/workflows/test/event.json"
  exit 1
}

[ $# -lt 1 ] && usage

WORKFLOW="$1"
JOB="${2:-}"
EVENT="${3:-pull_request}"
EVENT_FILE="${4:-}"

# Auto-detect event file if it exists alongside the workflow
WORKFLOW_NAME="${WORKFLOW%.yaml}"
DEFAULT_EVENT_FILE="$REPO_ROOT/$WORKFLOWS_DIR/$WORKFLOW_NAME/event.json"
if [ -z "$EVENT_FILE" ] && [ -f "$DEFAULT_EVENT_FILE" ]; then
  EVENT_FILE="$DEFAULT_EVENT_FILE"
fi

ACT_ARGS=(
  "$EVENT"
  --container-architecture linux/amd64
  -P "ubuntu-latest=catthehacker/ubuntu:act-22.04"
  -P "ubuntu-24.04=catthehacker/ubuntu:act-22.04"
  -P "ubuntu-22.04=catthehacker/ubuntu:act-22.04"
  --directory "$REPO_ROOT"
  -W "$REPO_ROOT/$WORKFLOWS_DIR/$WORKFLOW"
)

[ -n "$JOB" ] && ACT_ARGS+=(-j "$JOB")
[ -n "$EVENT_FILE" ] && ACT_ARGS+=(-e "$EVENT_FILE")
[ -n "${GITHUB_TOKEN:-}" ] && ACT_ARGS+=(-s "GITHUB_TOKEN=$GITHUB_TOKEN")

echo "Running: act ${ACT_ARGS[*]}"
echo ""
act "${ACT_ARGS[@]}"
