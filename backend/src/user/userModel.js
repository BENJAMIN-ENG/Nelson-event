import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'User name is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address'
            ],
        },
        role: {
            type: String,
            required: [true, 'User role is required'],
            enum: {
                values: ['Admin', 'Organizer', 'Attend'],
                message: 'Role must be either Admin, Organizer, or Attend'
            },
        },
        location: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
            required: [true, 'Location is required'],
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ location: 1 });

const User = mongoose.model('User', userSchema);

export default User;
