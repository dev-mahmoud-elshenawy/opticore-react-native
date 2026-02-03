#!/bin/bash
# Spec Kit Helper: Quality Gate Checker

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SPEC KIT QUALITY GATES      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════╝${NC}"
echo ""

FAILURES=0
TOTAL_CHECKS=6

# Check 1: Type Checking
echo -e "${BLUE}[1/$TOTAL_CHECKS] Type Checking...${NC}"
if command -v npm &> /dev/null && [ -f "package.json" ]; then
    if npm run type-check --silent 2>&1 | grep -qi "error"; then
        echo -e "${RED}❌ Type errors found${NC}"
        FAILURES=$((FAILURES + 1))
    else
        echo -e "${GREEN}✅ Type checking passed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipped (no npm/package.json)${NC}"
fi
echo ""

# Check 2: Tests
echo -e "${BLUE}[2/$TOTAL_CHECKS] Running Tests...${NC}"
if command -v npm &> /dev/null && [ -f "package.json" ]; then
    if npm test -- --passWithNoTests --silent 2>&1; then
        echo -e "${GREEN}✅ Tests passed${NC}"
    else
        echo -e "${RED}❌ Tests failed${NC}"
        FAILURES=$((FAILURES + 1))
    fi
else
    echo -e "${YELLOW}⚠️  Skipped${NC}"
fi
echo ""

# Check 3: Coverage
echo -e "${BLUE}[3/$TOTAL_CHECKS] Coverage...${NC}"
if command -v npm &> /dev/null && [ -f "package.json" ]; then
    COVERAGE_OUTPUT=$(npm test -- --coverage --silent --passWithNoTests 2>&1 || true)
    LINE_COV=$(echo "$COVERAGE_OUTPUT" | grep -oE "[0-9]+\.[0-9]+" | head -1)

    if [ -n "$LINE_COV" ]; then
        if (( $(echo "$LINE_COV >= 80" | bc -l) )); then
            echo -e "${GREEN}✅ Coverage: ${LINE_COV}%${NC}"
        else
            echo -e "${RED}❌ Coverage: ${LINE_COV}% (< 80%)${NC}"
            FAILURES=$((FAILURES + 1))
        fi
    else
        echo -e "${YELLOW}⚠️  Could not determine${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipped${NC}"
fi
echo ""

# Check 4: Linting
echo -e "${BLUE}[4/$TOTAL_CHECKS] Linting...${NC}"
if command -v npm &> /dev/null && [ -f "package.json" ]; then
    if npm run lint --silent 2>&1; then
        echo -e "${GREEN}✅ Linting passed${NC}"
    else
        echo -e "${RED}❌ Linting failed${NC}"
        FAILURES=$((FAILURES + 1))
    fi
else
    echo -e "${YELLOW}⚠️  Skipped${NC}"
fi
echo ""

# Check 5: Formatting
echo -e "${BLUE}[5/$TOTAL_CHECKS] Formatting...${NC}"
if command -v npm &> /dev/null && [ -f "package.json" ]; then
    if npm run format -- --check --silent 2>&1; then
        echo -e "${GREEN}✅ Formatting correct${NC}"
    else
        echo -e "${YELLOW}⚠️  Run 'npm run format'${NC}"
        FAILURES=$((FAILURES + 1))
    fi
else
    echo -e "${YELLOW}⚠️  Skipped${NC}"
fi
echo ""

# Check 6: Console Statements
echo -e "${BLUE}[6/$TOTAL_CHECKS] Console Statements...${NC}"
if git rev-parse --git-dir > /dev/null 2>&1; then
    CONSOLE_FILES=$(git diff --cached --name-only --diff-filter=ACM | \
                    grep -E '\.(js|ts|jsx|tsx)$' | \
                    xargs grep -l "console\\.\\(log\\|debug\\)" 2>/dev/null || true)

    if [ -n "$CONSOLE_FILES" ]; then
        echo -e "${RED}❌ Console statements found${NC}"
        FAILURES=$((FAILURES + 1))
    else
        echo -e "${GREEN}✅ No console statements${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipped (not git repo)${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════╗${NC}"
echo -e "${BLUE}║         SUMMARY                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════╝${NC}"
echo ""

if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✅ ALL QUALITY GATES PASSED${NC}"
    exit 0
else
    echo -e "${RED}❌ $FAILURES GATE(S) FAILED${NC}"
    exit 1
fi
