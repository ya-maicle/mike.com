export type StudyVisibility = 'public' | 'members' | 'recruiter'

export type StudyAccess = {
  hasRecruiterAccess: boolean
  hasMemberAccess?: boolean
  allowedStudyIds?: string[]
}

export function canReadStudy(study: { _id: string; visibility?: string }, access: StudyAccess) {
  if (!study.visibility || study.visibility === 'public') return true
  if (study.visibility !== 'members' && study.visibility !== 'recruiter') return false
  if (study.visibility === 'members' && access.hasMemberAccess === true) return true
  return access.hasRecruiterAccess || access.allowedStudyIds?.includes(study._id) === true
}

export function studyAccessLabel(visibility?: string) {
  return visibility === 'members' ? 'Sign-in required' : 'Approval required'
}
