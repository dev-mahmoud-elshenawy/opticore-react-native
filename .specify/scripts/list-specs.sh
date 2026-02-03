#!/bin/bash
# Spec Kit Helper: List All Specifications

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
GRAY='\033[0;90m'
NC='\033[0m'

SPECS_DIR=".specify/specs"
DETAILED=false

if [ "$1" == "--detailed" ] || [ "$1" == "-d" ]; then
    DETAILED=true
fi

if [ ! -d "$SPECS_DIR" ]; then
    echo "❌ Error: .specify/specs/ not found"
    exit 1
fi

SPEC_COUNT=$(find "$SPECS_DIR" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    SPEC KIT SPECIFICATIONS            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GRAY}Total: $SPEC_COUNT${NC}"
echo ""

if [ "$SPEC_COUNT" -eq 0 ]; then
    echo "No specifications found."
    echo "Create: ./.specify/scripts/create-spec.sh"
    exit 0
fi

CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")

for SPEC_DIR in $(find "$SPECS_DIR" -mindepth 1 -maxdepth 1 -type d | sort); do
    SPEC_NUM=$(basename "$SPEC_DIR" | cut -d'-' -f1)
    FEATURE_NAME=$(basename "$SPEC_DIR" | cut -d'-' -f2-)

    if [ ! -f "$SPEC_DIR/spec.md" ]; then
        continue
    fi

    STATUS=$(grep -m1 "Status:" "$SPEC_DIR/spec.md" | sed 's/.*Status:[[:space:]]*//' | tr -d '*' || echo "UNKNOWN")
    TITLE=$(grep -m1 "^# Spec" "$SPEC_DIR/spec.md" | sed 's/^# Spec [0-9]*: //' || echo "$FEATURE_NAME")

    IS_CURRENT=""
    if [[ "$CURRENT_BRANCH" == "$SPEC_NUM-"* ]]; then
        IS_CURRENT=" ${GREEN}← CURRENT${NC}"
    fi

    case "$STATUS" in
        *DRAFT*) STATUS_COLOR="${YELLOW}" ;;
        *APPROVED*|*READY*) STATUS_COLOR="${BLUE}" ;;
        *IMPLEMENTED*|*COMPLETE*) STATUS_COLOR="${GREEN}" ;;
        *) STATUS_COLOR="${GRAY}" ;;
    esac

    echo -e "${BLUE}Spec $SPEC_NUM${NC}: $TITLE"
    echo -e "  ${STATUS_COLOR}Status:${NC} $STATUS$IS_CURRENT"

    if [ "$DETAILED" = true ]; then
        if [ -f "$SPEC_DIR/plan.md" ]; then
            PLAN_STATUS=$(grep -m1 "Status:" "$SPEC_DIR/plan.md" | sed 's/.*Status:[[:space:]]*//' | tr -d '*' || echo "N/A")
            echo -e "  ${GRAY}Plan:${NC} $PLAN_STATUS"
        fi

        if [ -f "$SPEC_DIR/tasks.md" ]; then
            TOTAL=$(grep -c "^- \[ \]" "$SPEC_DIR/tasks.md" || echo "0")
            DONE=$(grep -c "^- \[x\]" "$SPEC_DIR/tasks.md" || echo "0")
            echo -e "  ${GRAY}Tasks:${NC} $DONE/$TOTAL complete"
        fi

        CREATED=$(grep -m1 "Created:" "$SPEC_DIR/spec.md" | sed 's/.*Created:[[:space:]]*//' || echo "Unknown")
        echo -e "  ${GRAY}Created:${NC} $CREATED"
    fi

    echo ""
done

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

DRAFT=$(find "$SPECS_DIR" -name "spec.md" -exec grep -l "Status.*DRAFT" {} \; | wc -l | tr -d ' ')
APPROVED=$(find "$SPECS_DIR" -name "spec.md" -exec grep -l "Status.*APPROVED" {} \; | wc -l | tr -d ' ')
DONE=$(find "$SPECS_DIR" -name "spec.md" -exec grep -l "Status.*IMPLEMENTED\|Status.*COMPLETE" {} \; | wc -l | tr -d ' ')

echo -e "${YELLOW}Draft: $DRAFT${NC}  ${BLUE}Approved: $APPROVED${NC}  ${GREEN}Implemented: $DONE${NC}"
echo ""
