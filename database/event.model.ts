import mongoose, { Document, Model, Schema } from 'mongoose';

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, 'Event overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Event image is required'],
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Event mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be either online, offline, or hybrid',
      },
    },
    audience: {
      type: String,
      required: [true, 'Target audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Event agenda is required'],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Event organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Event tags are required'],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: 'Tags must contain at least one item',
      },
    },
  },
  {
    timestamps: true, // Auto-generate createdAt and updatedAt
  }
);

// Pre-save hook: Generate slug, normalize date, and validate time
EventSchema.pre('save', async function (next) {
  const event = this as IEvent;

  // Generate URL-friendly slug from title (only if title changed or new document)
  if (event.isModified('title')) {
    const baseSlug = event.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen

    // Check for slug collision and append timestamp if needed
    let uniqueSlug = baseSlug;
    let slugExists = await mongoose.model('Event').exists({ 
      slug: uniqueSlug,
      _id: { $ne: event._id } // Exclude current document
    });

    if (slugExists) {
      uniqueSlug = `${baseSlug}-${Date.now()}`;
    }

    event.slug = uniqueSlug;
  }

  // Normalize date to YYYY-MM-DD format (timezone-agnostic)
  if (event.isModified('date')) {
    // Validate YYYY-MM-DD format before parsing
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(event.date)) {
      return next(
        new Error('Invalid date format. Please provide date in YYYY-MM-DD format.')
      );
    }

    try {
      const parsedDate = new Date(event.date);
      if (isNaN(parsedDate.getTime())) {
        return next(new Error('Invalid date format. Please provide a valid date.'));
      }
      
      // Use local date components to avoid timezone conversion
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsedDate.getDate()).padStart(2, '0');
      event.date = `${year}-${month}-${day}`;
    } catch (error) {
      return next(new Error('Invalid date format. Please provide a valid date.'));
    }
  }

  // Normalize time format to HH:MM (24-hour format)
  if (event.isModified('time')) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    const match = event.time.trim().match(timeRegex);
    
    if (!match) {
      return next(
        new Error('Invalid time format. Please use HH:MM format (e.g., 14:30).')
      );
    }
    
    // Pad hour to two digits (e.g., "9:30" becomes "09:30")
    const hour = match[1].padStart(2, '0');
    const minute = match[2];
    event.time = `${hour}:${minute}`;
  }

  next();
});

// Create unique index on slug for faster queries and uniqueness enforcement
EventSchema.index({ slug: 1 }, { unique: true });

// Create and export the Event model
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
