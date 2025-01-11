#!/bin/bash

# Text colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verifying Stripe Configuration..."

# Check if .env file exists
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file found${NC}"
else
    echo -e "${RED}✗ .env file not found${NC}"
    exit 1
fi

# Check for Stripe public key
if grep -q "VITE_STRIPE_PUBLIC_KEY" .env; then
    STRIPE_PUBLIC_KEY=$(grep "VITE_STRIPE_PUBLIC_KEY" .env | cut -d '=' -f2)
    if [[ $STRIPE_PUBLIC_KEY == "pk_test_your_publishable_key" ]]; then
        echo -e "${RED}✗ VITE_STRIPE_PUBLIC_KEY is still set to default value${NC}"
    else
        echo -e "${GREEN}✓ VITE_STRIPE_PUBLIC_KEY is configured${NC}"
    fi
else
    echo -e "${RED}✗ VITE_STRIPE_PUBLIC_KEY not found in .env${NC}"
fi

# Check for Stripe secret key
if grep -q "STRIPE_SECRET_KEY" .env; then
    echo -e "${GREEN}✓ STRIPE_SECRET_KEY is configured${NC}"
else
    echo -e "${RED}✗ STRIPE_SECRET_KEY not found in .env${NC}"
fi

# Check node_modules for required packages
if [ -d "node_modules/@stripe/stripe-js" ]; then
    echo -e "${GREEN}✓ @stripe/stripe-js is installed${NC}"
else
    echo -e "${RED}✗ @stripe/stripe-js is not installed${NC}"
fi

if [ -d "node_modules/stripe" ]; then
    echo -e "${GREEN}✓ stripe package is installed${NC}"
else
    echo -e "${RED}✗ stripe package is not installed${NC}"
fi

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. If any ✗ appears above, refer to docs/STRIPE_TROUBLESHOOTING.md"
echo "2. Use test card 4242 4242 4242 4242 to verify payment flow"
echo "3. Check browser console for additional debugging information"
