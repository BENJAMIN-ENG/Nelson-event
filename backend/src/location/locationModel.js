import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Location name is required'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Location code is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
locationSchema.index({ parent: 1 });
locationSchema.index({ code: 1 });

const Location = mongoose.model('Location', locationSchema);

export default Location;
