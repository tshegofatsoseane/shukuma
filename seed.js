// ============================================
// FILE: seed.js
// Run with: node seed.js
// ============================================
require('dotenv').config();
const mongoose = require('mongoose');
const WorkoutCard = require('./models/WorkoutCard');
const User = require('./models/User');

const workoutCards = [
  // STRENGTH
  {
    name: "Push-ups",
    description: "Classic upper body exercise. Do 10-15 push-ups with proper form. Keep your body straight from head to heels.",
    category: "strength"
  },
  {
    name: "Squats",
    description: "Stand with feet shoulder-width apart. Lower your body as if sitting in a chair, then stand back up. Do 15-20 reps.",
    category: "strength"
  },
  {
    name: "Plank Hold",
    description: "Hold a plank position on your forearms for 30-60 seconds. Keep your core tight and body straight.",
    category: "strength"
  },
  {
    name: "Lunges",
    description: "Step forward with one leg and lower your hips until both knees are at 90 degrees. Do 10 reps per leg.",
    category: "strength"
  },
  {
    name: "Mountain Climbers",
    description: "Start in plank position. Alternate bringing knees to chest rapidly for 30 seconds.",
    category: "strength"
  },
  {
    name: "Tricep Dips",
    description: "Use a chair or bench. Lower your body by bending elbows, then push back up. Do 10-15 reps.",
    category: "strength"
  },
  {
    name: "Wall Sit",
    description: "Slide down a wall until thighs are parallel to ground. Hold for 30-45 seconds.",
    category: "strength"
  },
  {
    name: "Bicycle Crunches",
    description: "Lie on back, bring opposite elbow to opposite knee. Alternate sides for 20 reps total.",
    category: "strength"
  },
  {
    name: "Superman Hold",
    description: "Lie face down, lift arms and legs off ground simultaneously. Hold for 20-30 seconds.",
    category: "strength"
  },
  {
    name: "Glute Bridges",
    description: "Lie on back with knees bent. Lift hips up, squeeze glutes at top. Do 15-20 reps.",
    category: "strength"
  },

  // CARDIO
  {
    name: "Jumping Jacks",
    description: "Classic cardio move! Jump while spreading legs and raising arms overhead. Do 30-50 reps.",
    category: "cardio"
  },
  {
    name: "High Knees",
    description: "Run in place bringing knees up to hip level. Go for 30 seconds at a quick pace.",
    category: "cardio"
  },
  {
    name: "Burpees",
    description: "Drop to plank, do a push-up, jump feet forward, then jump up with arms overhead. Do 8-10 reps.",
    category: "cardio"
  },
  {
    name: "Butt Kicks",
    description: "Jog in place kicking heels up towards your glutes. Continue for 30 seconds.",
    category: "cardio"
  },
  {
    name: "Jump Squats",
    description: "Do a regular squat, then explode up into a jump. Land softly and repeat 10-12 times.",
    category: "cardio"
  },
  {
    name: "Star Jumps",
    description: "Jump up spreading arms and legs wide into a star shape. Do 15-20 reps.",
    category: "cardio"
  },
  {
    name: "Speed Skaters",
    description: "Leap side to side, landing on one foot at a time like a speed skater. Do 20 reps (10 per side).",
    category: "cardio"
  },
  {
    name: "Tuck Jumps",
    description: "Jump up bringing knees towards chest. Land softly. Do 8-10 reps.",
    category: "cardio"
  },

  // FLEXIBILITY
  {
    name: "Standing Hamstring Stretch",
    description: "Stand and bend forward trying to touch toes. Hold for 30 seconds. Feel the stretch in back of legs.",
    category: "flexibility"
  },
  {
    name: "Quad Stretch",
    description: "Stand on one leg, pull other foot to glutes. Hold for 30 seconds each side.",
    category: "flexibility"
  },
  {
    name: "Shoulder Stretch",
    description: "Pull one arm across your body with the other hand. Hold 30 seconds each side.",
    category: "flexibility"
  },
  {
    name: "Cat-Cow Stretch",
    description: "On hands and knees, alternate arching and rounding your back. Do 10 slow reps.",
    category: "flexibility"
  },
  {
    name: "Child's Pose",
    description: "Kneel and sit back on heels, extending arms forward. Rest and breathe for 30-60 seconds.",
    category: "flexibility"
  },
  {
    name: "Spinal Twist",
    description: "Sit with legs extended, cross one leg over, twist torso. Hold 30 seconds each side.",
    category: "flexibility"
  },
  {
    name: "Hip Flexor Stretch",
    description: "Lunge position, push hips forward gently. Hold 30 seconds each side.",
    category: "flexibility"
  },
  {
    name: "Chest Opener",
    description: "Clasp hands behind back, lift arms up and back. Hold for 30 seconds.",
    category: "flexibility"
  },

  // BALANCE
  {
    name: "Single Leg Stand",
    description: "Stand on one leg for 30 seconds. Switch legs. Keep your core engaged.",
    category: "balance"
  },
  {
    name: "Tree Pose",
    description: "Stand on one leg, place other foot on inner thigh. Hold 30 seconds each side.",
    category: "balance"
  },
  {
    name: "Heel-to-Toe Walk",
    description: "Walk in a straight line placing heel directly in front of toes. Do 10-15 steps.",
    category: "balance"
  },
  {
    name: "Single Leg Deadlift",
    description: "Stand on one leg, hinge forward at hips extending other leg back. Do 8 reps per leg.",
    category: "balance"
  },
  {
    name: "Warrior III Hold",
    description: "Balance on one leg, extend other leg and arms back forming a T-shape. Hold 20-30 seconds per side.",
    category: "balance"
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shukuma');
    console.log('✅ Connected to MongoDB');

    // Clear existing workout cards
    await WorkoutCard.deleteMany({});
    console.log('🗑️  Cleared existing workout cards');

    // Insert workout cards
    await WorkoutCard.insertMany(workoutCards);
    console.log(`✅ Added ${workoutCards.length} workout cards`);

    // Create admin user (optional)
    const existingAdmin = await User.findOne({ email: 'admin@shukuma.com' });
    if (!existingAdmin) {
      const adminUser = new User({
        username: 'admin',
        email: 'admin@shukuma.com',
        password: 'admin123', // Change this in production!
        isAdmin: true
      });
      await adminUser.save();
      console.log('✅ Created admin user (admin@shukuma.com / admin123)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${workoutCards.length} workout cards`);
    console.log(`   - Strength: ${workoutCards.filter(w => w.category === 'strength').length}`);
    console.log(`   - Cardio: ${workoutCards.filter(w => w.category === 'cardio').length}`);
    console.log(`   - Flexibility: ${workoutCards.filter(w => w.category === 'flexibility').length}`);
    console.log(`   - Balance: ${workoutCards.filter(w => w.category === 'balance').length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();