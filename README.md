# 🔥 Shukuma - Complete Setup Guide

## 📋 Quick Start Checklist

- [ ] Install Node.js and MongoDB
- [ ] Clone/create project folder
- [ ] Install dependencies
- [ ] Create folder structure
- [ ] Set up environment variables
- [ ] Add all code files
- [ ] Seed the database
- [ ] Start the server
- [ ] Create your account
- [ ] Start working out!

---

## 🚀 Installation Steps

### 1. Prerequisites

- use MongoDB Atlas (cloud) - [Sign up free](https://www.mongodb.com/cloud/atlas)

### 2. Create Project Structure

```bash
mkdir shukuma
cd shukuma
```

Create this exact folder structure:

```
shukuma/
├── server.js
├── package.json
├── seed.js
├── .env
├── .gitignore
├── config/
│   └── db.js (optional, connection is in server.js)
├── models/
│   ├── User.js
│   ├── WorkoutCard.js
│   ├── Progress.js
│   └── Team.js
├── routes/
│   ├── index.js
│   ├── auth.js
│   ├── workouts.js
│   ├── progress.js
│   ├── challenges.js
│   └── admin.js
├── middleware/
│   └── auth.js
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
└── views/
    ├── index.ejs
    ├── login.ejs
    ├── signup.ejs
    ├── dashboard.ejs
    ├── shuffle.ejs
    ├── progress.ejs
    ├── challenges.ejs
    ├── teams.ejs
    ├── timed-challenge.ejs
    └── admin/
        └── workouts.ejs
```

### 3. Install Dependencies

```bash
npm init -y
npm install express mongoose express-session connect-mongo bcryptjs ejs dotenv method-override express-validator
npm install --save-dev nodemon
```

### 4. Create .env File

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/shukuma
SESSION_SECRET=your-super-secret-key-change-this-in-production
PORT=3000
```

**For MongoDB Atlas (cloud):**

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shukuma?retryWrites=true&w=majority
SESSION_SECRET=your-super-secret-key-change-this-in-production
PORT=3000
```

### 5. Create .gitignore

Create a `.gitignore` file:

```
node_modules/
.env
*.log
.DS_Store
```

Make sure your `package.json` has these scripts:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
}
```

### 8. Start MongoDB

**Option A: Local MongoDB**

```bash
# On macOS/Linux
mongod

# On Windows
"C:\Program Files\MongoDB\Server\[version]\bin\mongod.exe"
```

**Option B: MongoDB Atlas**

- No need to start anything, just use the connection string in `.env`

### 9. Start the Server

```bash
npm run dev
```

You should see:

```
✅ MongoDB Connected
🚀 Shukuma running on http://localhost:3000
```

### 10. Open in Browser

Navigate to: **http://localhost:3000**

---

## 🎯 First Steps

### Create Your Account

1. Click "Sign Up"
2. Fill in your details
3. Start shuffling workouts!

### Admin Access

- Email: `admin@shukuma.com`
- Password: `admin123`
- **⚠️ CHANGE THIS PASSWORD IN PRODUCTION!**

Admin can:

- Add new workout cards
- Edit existing workouts
- Delete workouts
- Access: `/admin/workouts`

---

### Test Authentication

1. ✅ Sign up with new account
2. ✅ Log out
3. ✅ Log back in
4. ✅ Try accessing `/dashboard` without logging in (should redirect)

### Test Core Features

1. ✅ Shuffle a workout card
2. ✅ Complete a workout (check progress page)
3. ✅ Complete another workout (verify streak increases)
4. ✅ View progress log
5. ✅ Check challenges page
6. ✅ Complete daily card challenge

### Test Team Features

1. ✅ Create a team
2. ✅ Note the team code
3. ✅ Create second account
4. ✅ Join team with code
5. ✅ Check team leaderboard

### Test Admin Features

1. ✅ Login as admin
2. ✅ Add a new workout card
3. ✅ Edit an existing card
4. ✅ Delete a card

---

**Made with ❤️ by Yanga Ngcayisa**
