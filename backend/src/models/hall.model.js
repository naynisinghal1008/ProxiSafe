import mongoose from 'mongoose';

const cameraSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  rtspUrl: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  position: {
    x: Number,
    y: Number,
  },
}, { _id: true });

const hallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  capacity: {
    type: Number,
    required: true,
    min: 0,
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  },
  cameras: [cameraSchema],
  floorPlan: {
    type: String, // URL to floor plan image
    trim: true,
  },
  dimensions: {
    width: Number, // in meters
    length: Number, // in meters
  },
  thresholds: {
    occupancyWarning: {
      type: Number,
      default: 80, // percentage
      min: 0,
      max: 100,
    },
    occupancyCritical: {
      type: Number,
      default: 90, // percentage
      min: 0,
      max: 100,
    },
    socialDistancing: {
      type: Number,
      default: 2, // meters
      min: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
hallSchema.index({ name: 1 }, { unique: true });
hallSchema.index({ status: 1 });
hallSchema.index({ 'cameras.status': 1 });

// Virtual for occupancy percentage
hallSchema.virtual('occupancyPercentage').get(function() {
  return (this.currentOccupancy / this.capacity) * 100;
});

// Pre-save middleware
hallSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to update occupancy
hallSchema.methods.updateOccupancy = async function(count) {
  this.currentOccupancy = Math.max(0, Math.min(count, this.capacity));
  return this.save();
};

// Method to check if hall is overcrowded
hallSchema.methods.isOvercrowded = function() {
  return this.occupancyPercentage >= this.thresholds.occupancyCritical;
};

export const Hall = mongoose.model('Hall', hallSchema); 