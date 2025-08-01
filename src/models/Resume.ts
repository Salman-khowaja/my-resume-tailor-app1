import mongoose from 'mongoose'

const ResumeSchema = new mongoose.Schema({
  email: String,
  resume: String,
  jobDesc: String,
  tailored: String
}, { timestamps: true })

export default mongoose.models.Resume || mongoose.model('Resume', ResumeSchema)
