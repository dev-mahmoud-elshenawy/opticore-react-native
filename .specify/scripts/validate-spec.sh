#!/bin/bash
# Spec Kit Helper: Validate Specification

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get spec file
if [ -n "$1" ]; then
    SPEC_FILE="$1"
else
    SPEC_FILE=$(find .specify/specs -name "spec.md" -type f | sort -r | head -1)
fi

if [ ! -f "$SPEC_FILE" ]; then
    echo -e "${RED}❌ Spec file not found: $SPEC_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}Validating Specification${NC}"
echo "File: $SPEC_FILE"
echo ""

ERRORS=0
WARNINGS=0

# Required sections
declare -a REQUIRED_SECTIONS=(
    "# Spec"
    "## Summary"
    "## Problem Statement"
    "## Requirements"
    "## Success Criteria"
)

echo -e "${BLUE}Checking required sections...${NC}"
for SECTION in "${REQUIRED_SECTIONS[@]}"; do
    if grep -q "^$SECTION" "$SPEC_FILE"; then
        echo -e "${GREEN}✅${NC} $SECTION"
    else
        echo -e "${RED}❌${NC} Missing: $SECTION"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""
echo -e "${BLUE}Checking for issues...${NC}"

# Placeholders
if grep -qE '\[.*\]|\(TODO\)|TBD|FIXME' "$SPEC_FILE"; then
    echo -e "${YELLOW}⚠️${NC}  Placeholders or TODO markers found"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅${NC} No placeholders"
fi

# Status
if grep -q "Status.*APPROVED" "$SPEC_FILE"; then
    echo -e "${GREEN}✅${NC} Status: APPROVED"
elif grep -q "Status.*DRAFT" "$SPEC_FILE"; then
    echo -e "${YELLOW}⚠️${NC}  Status: DRAFT (needs approval)"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${RED}❌${NC} No status field"
    ERRORS=$((ERRORS + 1))
fi

# Requirements
REQ_COUNT=$(grep -c "^- REQ-" "$SPEC_FILE" || echo "0")
if [ "$REQ_COUNT" -eq 0 ]; then
    echo -e "${RED}❌${NC} No requirements (REQ-1, REQ-2, etc.)"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅${NC} Found $REQ_COUNT requirements"
fi

# Success criteria
CRITERIA_COUNT=$(grep -c "^- \[ \]" "$SPEC_FILE" || echo "0")
if [ "$CRITERIA_COUNT" -eq 0 ]; then
    echo -e "${RED}❌${NC} No success criteria (checkboxes)"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅${NC} Found $CRITERIA_COUNT success criteria"
fi

# Summary
echo ""
echo "================================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ SPECIFICATION IS VALID${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS WARNING(S)${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS ERROR(S), $WARNINGS WARNING(S)${NC}"
    exit 1
fi
