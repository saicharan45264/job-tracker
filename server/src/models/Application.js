import mongoose from 'mongoose';

export const APPLICATION_STATUSES = [
  'Wishlist',
  'Applied',
  'Assessment',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
];

export const APPLICATION_PRIORITIES = ['Low', 'Medium', 'High'];

export const WORK_ARRANGEMENTS = ['On-site', 'Hybrid', 'Remote'];

export const EMPLOYMENT_TYPES = ['Full-time', 'Internship', 'Part-time', 'Contract'];

export const APPLICATION_SOURCES = [
  'LinkedIn',
  'Company Website',
  'Referral',
  'Job Portal',
  'Campus Placement',
  'Other',
];

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [120, 'Company name cannot exceed 120 characters'],
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Job title cannot exceed 150 characters'],
    },
    jobDescription: {
      type: String,
      default: '',
    },
    jobUrl: {
      type: String,
      trim: true,
      default: '',
    },
    companyWebsite: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    workArrangement: {
      type: String,
      enum: WORK_ARRANGEMENTS,
      default: 'Remote',
    },
    employmentType: {
      type: String,
      enum: EMPLOYMENT_TYPES,
      default: 'Full-time',
    },
    experienceLevel: {
      type: String,
      default: 'Entry-level',
    },
    salaryMin: {
      type: Number,
      default: null,
    },
    salaryMax: {
      type: Number,
      default: null,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    source: {
      type: String,
      enum: APPLICATION_SOURCES,
      default: 'LinkedIn',
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'Applied',
    },
    priority: {
      type: String,
      enum: APPLICATION_PRIORITIES,
      default: 'Medium',
    },
    recruiterName: {
      type: String,
      trim: true,
      default: '',
    },
    recruiterEmail: {
      type: String,
      trim: true,
      default: '',
    },
    recruiterPhone: {
      type: String,
      trim: true,
      default: '',
    },
    resumeVersion: {
      type: String,
      trim: true,
      default: 'v1.0',
    },
    coverLetterVersion: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ userId: 1, createdAt: -1 });
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ userId: 1, applicationDate: -1 });
applicationSchema.index({ userId: 1, company: 1 });
applicationSchema.index({ userId: 1, priority: 1 });

export const Application = mongoose.model('Application', applicationSchema);
