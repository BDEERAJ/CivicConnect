import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  importance: { 
    type: String, 
    enum: ['Low', 'Medium', 'Critical'], 
    default: 'Medium' 
  },

  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },

  authorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // ✅ SIMPLE STRING (no geo stuff)
  location: {
    type: String,
    required: true
  },

  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

}, { timestamps: true });

export default mongoose.model('Problem', problemSchema);