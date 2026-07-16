import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  role: { type: String },
  age: { type: Number },
  gender: { type: String },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function run() {
  await mongoose.connect('mongodb+srv://sharonlalspc_db_user:2YkuXV1JEn2kqYpw@job-tracker.vwypkfe.mongodb.net/vitalwatch?appName=job-tracker');
  console.log('Connected to DB');
  const user = await User.findOne({ name: 'cat' });
  console.log('User cat:', JSON.stringify(user, null, 2));
  await mongoose.disconnect();
}

run().catch(console.error);
