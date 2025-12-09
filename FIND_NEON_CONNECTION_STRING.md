# 🔍 Where to Find Connection String in Neon Dashboard

## 📍 Common Locations in Neon Dashboard

### Location 1: Project Dashboard (Most Common)
1. After logging in, you'll see your **project dashboard**
2. Look for a section called:
   - **"Connection Details"**
   - **"Connection String"**
   - **"Connect to your database"**
   - **"Connection parameters"**
3. It's usually displayed prominently on the main dashboard

### Location 2: Connection Details Panel
1. In your project, look for a **card/panel** that shows:
   - Host
   - Database name
   - User
   - Password
2. There should be a **"Connection string"** tab or button
3. Click it to see the full connection string

### Location 3: Database Settings
1. Click on your **database name** (usually "neondb" or similar)
2. Go to **"Settings"** or **"Configuration"**
3. Look for **"Connection"** section
4. Find **"Connection string"** or **"Connection URI"**

### Location 4: Connect Button
1. Look for a **"Connect"** button (usually green or blue)
2. Click it
3. A modal/popup will show connection options
4. Select **"Connection string"** or **"URI"**
5. Copy the string that starts with `postgresql://`

## 🎯 What You're Looking For

The connection string will look like one of these formats:

**Format 1 (Full string):**
```
postgresql://neondb_owner:your-password@ep-cool-name-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Format 2 (With pooler):**
```
postgresql://neondb_owner:your-password@ep-cool-name-123456-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 🔑 Key Indicators

Look for text that:
- ✅ Starts with `postgresql://`
- ✅ Contains `@` (separates user:pass from host)
- ✅ Contains `.neon.tech` or `.aws.neon.tech` in the host
- ✅ Has a **"Copy"** button next to it
- ✅ Might be labeled as "Connection string", "URI", or "Connection URL"

## ⚠️ What NOT to Use

- ❌ `napi_...` - This is an API token, not a connection string
- ❌ Just the host name - Need the full connection string
- ❌ Connection pooler token - Need the actual database connection string

## 📸 Visual Guide

In most Neon dashboards, you'll see something like:

```
┌─────────────────────────────────────────┐
│ Connection Details                      │
├─────────────────────────────────────────┤
│ Connection string                       │
│ ┌─────────────────────────────────────┐ │
│ │ postgresql://user:pass@host/db...   │ │
│ └─────────────────────────────────────┘ │
│ [Copy] button                            │
└─────────────────────────────────────────┘
```

## 🆘 If You Still Can't Find It

### Option 1: Check Different Tabs
- Try clicking on **"Databases"** tab
- Try clicking on **"Branches"** tab
- Try clicking on **"Settings"** tab

### Option 2: Look for "Show Connection String"
- Some Neon interfaces hide it by default
- Look for a **"Show"** or **"Reveal"** button
- Click it to display the connection string

### Option 3: Create New Connection
1. Some Neon dashboards let you create a new connection
2. This will show you the connection string
3. Use that string

## ✅ Quick Test

Once you find it, verify it's correct:
- ✅ Starts with `postgresql://`
- ✅ Contains your database name
- ✅ Contains `?sslmode=require` at the end
- ✅ Is a long string (50+ characters)

---

**The connection string is usually displayed prominently on the Neon dashboard - look for "Connection Details" or "Connection String" section!**
