import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  hall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hall',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'overcrowding',
      'social_distancing',
      'unauthorized_entry',
      'camera_offline',
      'system_error',
      'custom'
    ],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active',
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    x: Number,
    y: Number,
    camera: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hall.cameras',
    },
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map(),
  },
  detectedAt: {
    type: Date,
    default: Date.now,
  },
  acknowledgedAt: {
    type: Date,
  },
  resolvedAt: {
    type: Date,
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  resolutionNotes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Indexes
alertSchema.index({ hall: 1, status: 1 });
alertSchema.index({ type: 1, severity: 1 });
alertSchema.index({ detectedAt: -1 });
alertSchema.index({ status: 1, severity: 1 });

// Virtual for alert duration
alertSchema.virtual('duration').get(function() {
  const end = this.resolvedAt || new Date();
  return end - this.detectedAt;
});

// Method to acknowledge alert
alertSchema.methods.acknowledge = async function(userId) {
  this.status = 'acknowledged';
  this.acknowledgedAt = new Date();
  this.acknowledgedBy = userId;
  return this.save();
};

// Method to resolve alert
alertSchema.methods.resolve = async function(userId, notes) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolvedBy = userId;
  this.resolutionNotes = notes;
  return this.save();
};

// Static method to get active alerts
alertSchema.statics.getActiveAlerts = function() {
  return this.find({ status: 'active' })
    .populate('hall', 'name')
    .sort({ severity: -1, detectedAt: -1 });
};

// Static method to get alerts by hall
alertSchema.statics.getAlertsByHall = function(hallId, options = {}) {
  const query = { hall: hallId };
  if (options.status) query.status = options.status;
  if (options.type) query.type = options.type;
  if (options.severity) query.severity = options.severity;

  return this.find(query)
    .populate('hall', 'name')
    .sort({ detectedAt: -1 })
    .limit(options.limit || 100);
};

export const Alert = mongoose.model('Alert', alertSchema); 