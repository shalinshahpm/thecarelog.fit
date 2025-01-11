# Stripe Payment Integration Troubleshooting Guide

## Configuration Issues

### Environment Variables
1. **Missing or Invalid Public Key**
   ```bash
   # Required in .env at project root
   VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
   STRIPE_SECRET_KEY=sk_test_your_key
   ```
   - Ensure the key starts with `VITE_` for client-side access
   - Verify key is not the placeholder value
   - Check browser console for "Stripe public key: Missing" messages

2. **Production vs Test Keys**
   - Test keys start with `pk_test_` and `sk_test_`
   - Production keys start with `pk_live_` and `sk_live_`
   - Never commit real keys to version control

### Common Error Messages

1. **"Payment system is temporarily unavailable"**
   - Check if `VITE_STRIPE_PUBLIC_KEY` is properly set
   - Verify key format in browser console
   - Ensure the key has required permissions

2. **"Invalid payment session"**
   - Check server logs for Stripe API response
   - Verify webhook configuration
   - Ensure proper session creation parameters

3. **"Failed to initialize payment system"**
   - Check browser console for Stripe.js loading errors
   - Verify network connectivity
   - Check for JavaScript runtime errors

## Debug Logging

### Client-Side
```typescript
// Add these logs in subscription-card.tsx
console.log("Stripe public key:", publicKey ? "Found" : "Missing");
console.log("Stripe initialization:", stripe ? "Success" : "Failed");
```

### Server-Side
```typescript
// Add these logs in routes.ts
console.error("Stripe error details:", error);
console.log("Session creation:", session.id);
```

## Testing Procedures

1. **Test Card Numbers**
   - Success: 4242 4242 4242 4242
   - Declined: 4000 0000 0000 0002
   - Authentication Required: 4000 0025 0000 3155

2. **Testing Checklist**
   - [ ] Verify environment variables are loaded
   - [ ] Test payment with success card
   - [ ] Test payment with failure card
   - [ ] Verify success/cancel URL redirects
   - [ ] Check webhook handling

## Security Best Practices

1. **Environment Variables**
   - Never expose secret key on client side
   - Use environment variables for all keys
   - Rotate keys periodically

2. **Error Handling**
   - Never expose detailed error messages to users
   - Log detailed errors server-side
   - Use generic error messages client-side

3. **Data Handling**
   - Never log full card details
   - Use Stripe Elements for secure input
   - Implement proper CORS policies

## Implementation Details

### Current Setup
```typescript
// Client-side initialization
const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Server-side session creation
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});
```

### Webhook Handling (TODO)
```typescript
// Implement webhook handling for:
// - payment_intent.succeeded
// - payment_intent.failed
// - checkout.session.completed
```

## Support Resources
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Testing Stripe Payments](https://stripe.com/docs/testing)
- [Stripe Elements Integration](https://stripe.com/docs/elements)
