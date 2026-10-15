import mongoose from 'mongoose';

export const INTERVIEW_TYPES = [
  'Online Assessment',
  'Recruiter Screening',
  'Technical Interview',
  'Coding Interview',
  'System Design',
  'Managerial Interview',
  'HR Interview',
  'Other',
];

export const INTERVIEW_MODES = ['Online', 'Phone', 'In Person'];

export const INTERVIEW_OUTCOMES = ['Pending', 'Passed', 'Failed', 'Cancelled'];

const checklistItemSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    round: {
      type: String,
      required: [true, 'Interview round is required'],
      trim: true,
      maxlength: [100, 'Round name cannot exceed 100 characters'],
    },
    type: {
      type: String,
      enum: INTERVIEW_TYPES,
      default: 'Technical Interview',
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Interview scheduled date and time is required'],
    },
    timeZone: {
      type: String,
      default: 'UTC',
    },
    durationMinutes: {
      type: Number,
      min: [5, 'Duration must be at least 5 minutes'],
      max: [480, 'Duration cannot exceed 8 hours'],
      default: 45,
    },
    mode: {
      type: String,
      enum: INTERVIEW_MODES,
      default: 'Online',
    },
    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    interviewers: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: '',
    },
    preparationChecklist: {
      type: [checklistItemSchema],
      default: [],
    },
    outcome: {
      type: String,
      enum: INTERVIEW_OUTCOMES,
      default: 'Pending',
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

interviewSchema.index({ userId: 1, scheduledAt: 1 });
interviewSchema.index({ userId: 1, applicationId: 1 });

export const Interview = mongoose.model('Interview', interviewSchema);
