import mongoose from 'mongoose';

export const ACTIVITY_TYPES = [
  'APPLICATION_CREATED',
  'APPLICATION_UPDATED',
  'STATUS_CHANGED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_RESCHEDULED',
  'INTERVIEW_COMPLETED',
  'INTERVIEW_CANCELLED',
  'OFFER_RECEIVED',
  'APPLICATION_REJECTED',
  'APPLICATION_WITHDRAWN',
  'NOTE_ADDED',
];

const activitySchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ACTIVITY_TYPES,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ applicationId: 1, createdAt: -1 });

export const Activity = mongoose.model('Activity', activitySchema);
