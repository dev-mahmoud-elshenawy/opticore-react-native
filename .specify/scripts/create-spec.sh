#!/bin/bash
# Spec Kit Helper: Create New Specification

set -e

SPECS_DIR=".specify/specs"
TEMPLATES_DIR=".specify/templates"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if .specify exists
if [ ! -d "$SPECS_DIR" ]; then
    echo "❌ Error: .specify/specs/ not found"
    echo "Run Spec Kit installation first"
    exit 1
fi

# Find next spec number
if [ -z "$(ls -A $SPECS_DIR)" ]; then
    NEXT_NUM="001"
else
    LAST_NUM=$(ls -1 "$SPECS_DIR" | grep -E '^[0-9]{3}-' | sort -r | head -1 | cut -d'-' -f1)
    NEXT_NUM=$(printf "%03d" $((10#$LAST_NUM + 1)))
fi

# Get feature name
if [ -n "$1" ]; then
    FEATURE_NAME="$1"
else
    echo -e "${BLUE}Creating Spec $NEXT_NUM${NC}"
    read -p "Feature name (lowercase-with-hyphens): " FEATURE_NAME
fi

# Validate
if [ -z "$FEATURE_NAME" ]; then
    echo "❌ Error: Feature name required"
    exit 1
fi

# Convert to lowercase and replace spaces
FEATURE_NAME=$(echo "$FEATURE_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

# Create directory
SPEC_DIR="$SPECS_DIR/$NEXT_NUM-$FEATURE_NAME"
mkdir -p "$SPEC_DIR"

# Copy templates or create minimal
if [ -f "$TEMPLATES_DIR/spec-template.md" ]; then
    cp "$TEMPLATES_DIR/spec-template.md" "$SPEC_DIR/spec.md"
    cp "$TEMPLATES_DIR/plan-template.md" "$SPEC_DIR/plan.md"
    cp "$TEMPLATES_DIR/tasks-template.md" "$SPEC_DIR/tasks.md"

    # Replace placeholders
    sed -i.bak "s/NNN/$NEXT_NUM/g" "$SPEC_DIR"/*.md && rm "$SPEC_DIR"/*.md.bak

    FEATURE_TITLE=$(echo "$FEATURE_NAME" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++)sub(/./,toupper(substr($i,1,1)),$i)}1')
    sed -i.bak "s/Feature Name/$FEATURE_TITLE/g" "$SPEC_DIR"/*.md && rm "$SPEC_DIR"/*.md.bak
else
    # Create minimal templates
    cat > "$SPEC_DIR/spec.md" << EOF
# Spec $NEXT_NUM: $FEATURE_NAME

**Status**: DRAFT
**Created**: $(date +%Y-%m-%d)

## Summary
[One-paragraph summary]

## Requirements
- REQ-1: [Requirement]

## Success Criteria
- [ ] Criteria 1
EOF

    cat > "$SPEC_DIR/plan.md" << EOF
# Plan $NEXT_NUM: $FEATURE_NAME

**Status**: DRAFT
**Created**: $(date +%Y-%m-%d)

## Technical Approach
[Describe approach]
EOF

    cat > "$SPEC_DIR/tasks.md" << EOF
# Tasks $NEXT_NUM: $FEATURE_NAME

**Status**: NOT STARTED

## Phase 1
- [ ] Task 1.1: [Description] (15 min)
EOF
fi

# Create notes.md
cat > "$SPEC_DIR/notes.md" << EOF
# Notes: Spec $NEXT_NUM

## Decisions
[Document implementation decisions here]

## Changes
- $(date +%Y-%m-%d): Spec created
EOF

# Create git branch
BRANCH_NAME="$NEXT_NUM-$FEATURE_NAME"
if git rev-parse --git-dir > /dev/null 2>&1; then
    git checkout -b "$BRANCH_NAME" 2>/dev/null || echo -e "${YELLOW}Branch exists${NC}"
fi

# Success
echo ""
echo -e "${GREEN}✅ Spec $NEXT_NUM created!${NC}"
echo -e "${BLUE}Directory:${NC} $SPEC_DIR"
echo -e "${BLUE}Branch:${NC} $BRANCH_NAME"
echo ""
echo "Next steps:"
echo "1. Edit $SPEC_DIR/spec.md"
echo "2. Run: /speckit.specify (in Claude)"
echo "3. Get approval"
