# ✅ Fix: subscriptionId → stripeSubscriptionId in auth.js

## Problem
Google auth endpoint crashing with:
```
The column `users.subscriptionId` does not exist in the current database.
```

## Root Cause
Prisma queries without explicit `select` statements try to fetch ALL fields. If the Prisma client was generated with an old schema that included `subscriptionId`, it tries to select that non-existent field.

## Fix Applied

Added explicit `select` statements to all Prisma `findUnique` and `findFirst` queries in `auth.js` to only select fields that actually exist in the database.

### Queries Fixed

1. **Line 39-42** - `findUnique` for existing user check:
   ```javascript
   // BEFORE
   const existingUser = await prisma.user.findUnique({
     where: { email: email.toLowerCase() }
   });
   
   // AFTER
   const existingUser = await prisma.user.findUnique({
     where: { email: email.toLowerCase() },
     select: {
       id: true,
       email: true
     }
   });
   ```

2. **Line 131-133** - `findUnique` for login:
   ```javascript
   // Added explicit select with all needed fields
   select: {
     id: true,
     email: true,
     name: true,
     password: true,
     isPremium: true,
     dailyUsage: true,
     monthlyUsage: true,
     subscriptionStatus: true,
     trialActive: true,
     trialStartDate: true,
     trialEndDate: true,
     stripeSubscriptionId: true,
     stripeCustomerId: true,
     planType: true,
     createdAt: true
   }
   ```

3. **Line 285-292** - `findFirst` for Google OAuth (THIS WAS THE CRASHING ONE):
   ```javascript
   // Added explicit select with all needed fields
   select: {
     id: true,
     email: true,
     name: true,
     googleId: true,
     authProvider: true,
     password: true,
     isPremium: true,
     dailyUsage: true,
     monthlyUsage: true,
     subscriptionStatus: true,
     trialActive: true,
     trialStartDate: true,
     trialEndDate: true,
     stripeSubscriptionId: true,
     stripeCustomerId: true,
     planType: true,
     createdAt: true
   }
   ```

4. **Line 422-424** - `findUnique` for token verification:
   ```javascript
   // Added explicit select with all needed fields
   select: {
     id: true,
     email: true,
     name: true,
     isPremium: true,
     subscriptionStatus: true,
     trialActive: true,
     trialStartDate: true,
     trialEndDate: true,
     stripeSubscriptionId: true,
     stripeCustomerId: true,
     planType: true,
     createdAt: true
   }
   ```

## Why This Works

By explicitly selecting only fields that exist in the database schema, we prevent Prisma from trying to select the non-existent `subscriptionId` field, even if the Prisma client was generated with an old schema.

## Additional Note

The `create` and `update` queries don't need changes because they use `data:` which only sets fields, not selects them.

## Verification

- ✅ All `findUnique` queries have explicit `select`
- ✅ All `findFirst` queries have explicit `select`
- ✅ Only existing fields are selected (stripeSubscriptionId, not subscriptionId)
- ✅ Syntax check passed

## Next Steps

1. **Deploy the fixed auth.js**
2. **Regenerate Prisma client** (recommended):
   ```bash
   npx prisma generate
   ```
3. **Test Google sign-in** - should work without errors

---

**Status**: ✅ Fixed
**Date**: January 2026
**Files Changed**: 1 (auth.js)
**Queries Fixed**: 4 (all findUnique/findFirst queries)
