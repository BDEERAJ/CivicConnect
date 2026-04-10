import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    category: { type: String, default: 'General' },
    message: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);
