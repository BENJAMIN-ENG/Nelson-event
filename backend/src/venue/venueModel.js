import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema(
    {
        placeName: {
            type: String,
            required: [true, 'Venue place name is required'],
            trim: true,
        },
        capacity: {
            type: Number,
            required: [true, 'Venue capacity is required'],
            min: [1, 'Capacity must be at least 1'],
        },
        location: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
            required: [true, 'Location is required'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Creator is required'],
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
venueSchema.index({ location: 1 });
venueSchema.index({ createdBy: 1 });
venueSchema.index({ placeName: 1 });

const Venue = mongoose.model('Venue', venueSchema);

export default Venue;
