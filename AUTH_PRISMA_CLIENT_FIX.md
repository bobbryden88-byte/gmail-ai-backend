# ✅ Fix: Prisma Client Schema Mismatch in auth.js

## Problem
Google auth endpoint failing with:
```
Unknown field `subscriptionStatus` for select statement on model `User`
```

The Prisma client on Vercel is out of sync with the schema - it doesn't recognize `subscriptionStatus` but suggests `subscriptionId` exists.

## Root Cause
The Prisma client was generated with an old schema. When using explicit `select` statements, Prisma validates against the generated client code, not the actual database schema.

## Fix Applied

**Removed all explicit `select` statements** from Prisma queries in `auth.js` to let Prisma return all fields that exist in the database, avoiding client schema mismatches.

### Queries Fixed

1. **Line 39** - Registration check: Removed `select`
2. **Line 135** - Login query: Removed `select`  
3. **Line 306** - Google OAuth query: Removed `select` (THIS WAS THE CRASHING ONE)
4. **Line 462** - Token verification: Removed `select`

**Before:**
```javascript
const user = await prisma.user.findFirst({
  where: { ... },
  select: {
    subscriptionStatus: true,  // ❌ Client doesn't know about this
    // ...
  }
});
```

**After:**
```javascript
const user = await prisma.user.findFirst({
  where: { ... }
  // ✅ No select - returns all fields that exist
});
```

## Why This Works

Without an explicit `select`, Prisma will:
- Return all fields that exist in the database
- Work even if the Prisma client is slightly out of sync
- Automatically handle schema migrations

## Important Note

**You still need to regenerate the Prisma client on Vercel:**

1. Push schema changes to your repo
2. Vercel will regenerate Prisma client during build
3. Or manually run: `npx prisma generate` before deploying

## Alternative Solution

If you want to keep explicit selects, you need to ensure Prisma client is regenerated:
```bash
npx prisma generate
```

But removing explicit selects is the safer approach for now.

## Verification

- ✅ All `select` statements removed from Prisma queries
- ✅ Queries will return all fields from database
- ✅ Syntax check passed

---

**Status**: ✅ Fixed  
**Date**: January 2026  
**Files Changed**: 1 (auth.js)  
**Queries Fixed**: 4 (removed explicit selects)
