# 🔗 How to Get Neon Database Connection String

## Current Issue
Your `DATABASE_URL` is: `napi_64h5o7xcv0zj8b3tnlloymg6r6waljktzb20gcczzl2i6b3sx2s118y7vry2vwuc`

This is a **Neon API token**, not a database connection string. You need the **PostgreSQL connection string** instead.

## ✅ Step-by-Step: Get Connection String from Neon

### Step 1: Go to Your Neon Project
1. Visit [console.neon.tech](https://console.neon.tech)
2. Sign in
3. Click on your project (the one you're using for gmail-ai-backend)

### Step 2: Find Connection Details
Look for one of these options:

**Option A: Connection Details Button**
- In your project dashboard, look for a button/link that says:
  - **"Connection Details"**
  - **"Connection String"**
  - **"Connect"**
  - **"Connection parameters"**

**Option B: Settings/Configuration**
- Click on **Settings** (gear icon) or **Configuration**
- Look for **"Connection"** or **"Database"** section
- Find **"Connection String"** or **"Connection URI"**

**Option C: Database Tab**
- Click on the **"Databases"** tab
- Click on your database name
- Look for **"Connection String"** or **"Connection Details"**

### Step 3: Copy the Connection String
You should see something like:

```
postgresql://username:password@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**OR** you might see separate fields:
- **Host:** `ep-cool-name-123456.us-east-1.aws.neon.tech`
- **Database:** `neondb`
- **User:** `username`
- **Password:** `password`
- **Port:** `5432`

If you see separate fields, construct it like this:
```
postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
```

### Step 4: What It Should Look Like
A correct Neon connection string looks like:

```
postgresql://neondb_owner:your-password@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Key characteristics:**
- ✅ Starts with `postgresql://`
- ✅ Contains `@` (separates credentials from host)
- ✅ Contains `/` (separates host from database name)
- ✅ Ends with `?sslmode=require` (for secure connections)
- ✅ Host contains `.neon.tech` or `.aws.neon.tech`

## 🔍 If You Can't Find It

### Alternative: Create a New Connection String
1. In Neon dashboard, look for **"Branches"** or **"Databases"**
2. Click on your database
3. Look for **"Connection String"** or **"Copy connection string"**
4. Some Neon interfaces have a **"Copy"** button next to the connection string

### Still Can't Find It?
1. Check if you're in the right project
2. Look for a **"Connect"** or **"Connection"** button in the top navigation
3. Some Neon dashboards show it in a sidebar or dropdown menu

## 📝 What You're Looking For

The connection string should be displayed in a format like this in the Neon UI:

```
Connection string
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

Or it might be shown as:

```
postgresql://neondb_owner:abc123xyz@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## ⚠️ Important Notes

1. **Don't use the API token** (`napi_...`) - that's for Neon's API, not database connections
2. **Use the PostgreSQL connection string** - starts with `postgresql://`
3. **The password might be hidden** - you may need to click "Show" or "Reveal" to see it
4. **Copy the entire string** - from `postgresql://` to the end

## ✅ After You Get It

1. **Copy the connection string**
2. **Go to Vercel** → Settings → Environment Variables
3. **Find `DATABASE_URL`**
4. **Click Edit** (pencil icon)
5. **Replace the value** with the correct connection string
6. **Click Save**
7. **Redeploy** your application

---

**Once you have the correct connection string, your database connection should work!**
