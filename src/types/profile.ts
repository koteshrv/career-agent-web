export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
}

export interface CandidateProfile {
  // Contact & Personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  
  // Professional Links
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;

  // Work Authorization
  workAuthorization: 'US_CITIZEN' | 'PERMANENT_RESIDENT' | 'NEED_SPONSORSHIP' | 'STUDENT_VISA' | 'OTHER';
  requiresSponsorship: boolean;

  // Demographics / Voluntary EEO (Optional)
  gender?: string;
  veteranStatus?: string;
  disabilityStatus?: string;

  // Skills & Summary
  headline: string;
  summary: string;
  skills: string[];

  // Deep AI Context for Autofill & Essay Generation
  keyAccomplishments: string[];

  // Work & Education
  experiences: WorkExperience[];
  education: Education[];

  // Resume details
  resumeFileName?: string;
  resumeText?: string;
  updatedAt: string;
}

export const DEFAULT_PROFILE: CandidateProfile = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  linkedinUrl: '',
  githubUrl: '',
  portfolioUrl: '',
  workAuthorization: 'US_CITIZEN',
  requiresSponsorship: false,
  headline: '',
  summary: '',
  skills: [],
  keyAccomplishments: [],
  experiences: [],
  education: [],
  updatedAt: new Date().toISOString(),
};
