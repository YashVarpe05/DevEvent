import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import Event from './event.model';

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => {
          // Basic email format validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Auto-generate createdAt and updatedAt
  }
);

// Pre-save hook: Verify that the referenced event exists
BookingSchema.pre('save', async function (next) {
  const booking = this as IBooking;

  // Only validate eventId if it's new or modified
  if (booking.isModified('eventId')) {
    try {
      // Use imported Event model (ensures it's registered)
      const eventExists = await Event.exists({ _id: booking.eventId });

      if (!eventExists) {
        return next(
          new Error(
            `Event with ID ${booking.eventId} does not exist. Please provide a valid event ID.`
          )
        );
      }
    } catch (error) {
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.name === 'MissingSchemaError') {
          return next(
            new Error('Event model not registered. Please ensure Event model is loaded.')
          );
        }
        return next(
          new Error(`Event validation failed: ${error.message}`)
        );
      }
      return next(
        new Error('Failed to validate event reference. Please try again.')
      );
    }
  }

  next();
});

// Create index on eventId for faster queries when fetching bookings by event
BookingSchema.index({ eventId: 1 });

// Create compound index for unique bookings per event per email (optional: prevents duplicate bookings)
BookingSchema.index({ eventId: 1, email: 1 }, { unique: true });

// Create and export the Booking model
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
