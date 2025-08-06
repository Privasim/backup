import { ProfileFormData } from '@/app/businessidea/types/profile.types';

export const mockProfiles: Record<string, ProfileFormData> = {
  student: {
    profile: {
      profileType: 'student',
      educationLevel: "Bachelor's in Computer Science",
      fieldOfStudy: "Computer Science",
      yearLevel: "Senior"
    },
    experience: [
      {
        id: "1",
        type: "education",
        title: "Computer Science Student",
        industry: "Technology",
        companySize: "Large",
        seniority: "Entry",
        description: "Studying computer science with focus on web development and AI"
      },
      {
        id: "2",
        type: "work",
        title: "Frontend Developer Intern",
        industry: "Technology",
        companySize: "Small",
        seniority: "Entry",
        description: "Built responsive web interfaces using React and TypeScript"
      }
    ],
    skillset: {
      technical: ["JavaScript", "Python", "React", "Node.js", "SQL", "Git"],
      soft: ["Communication", "Teamwork", "Problem Solving", "Time Management"],
      languages: ["English", "Spanish"],
      certifications: ["AWS Cloud Practitioner", "React Developer Certificate"],
      categories: [
        {
          id: "1",
          name: "Technical Skills",
          skills: [
            { id: "1", name: "JavaScript", category: "Programming", proficiency: 4, highlight: true, source: "education" },
            { id: "2", name: "Python", category: "Programming", proficiency: 4, highlight: true, source: "education" },
            { id: "3", name: "React", category: "Frontend", proficiency: 3, highlight: false, source: "experience" },
            { id: "4", name: "Node.js", category: "Backend", proficiency: 3, highlight: false, source: "experience" }
          ]
        }
      ],
      certificationsDetailed: [
        { id: "1", name: "AWS Cloud Practitioner", issuer: "Amazon Web Services", dateObtained: "2023-12-01" },
        { id: "2", name: "React Developer Certificate", issuer: "Meta", dateObtained: "2023-11-15" }
      ],
      languageProficiency: [
        { id: "1", language: "English", proficiency: "native" },
        { id: "2", language: "Spanish", proficiency: "conversational" }
      ]
    },
    metadata: {
      lastModified: new Date().toISOString(),
      version: "1.0.0",
      isDraft: false
    }
  },

  professional: {
    profile: {
      profileType: 'professional',
      industry: "Technology",
      employmentType: "Full-time",
      yearsOfExperience: "5",
      toolsUsed: ["React", "Node.js", "AWS", "PostgreSQL", "Docker"],
      topWorkActivities: "Leading development teams, architecting scalable solutions, mentoring junior developers"
    },
    experience: [
      {
        id: "1",
        type: "work",
        title: "Senior Software Engineer",
        industry: "Technology",
        companySize: "Medium",
        seniority: "Senior",
        description: "Lead development of microservices architecture and mentor team of 5 developers",
        skills: ["React", "Node.js", "AWS", "PostgreSQL", "Docker", "Team Leadership"],
        achievements: ["Reduced deployment time by 60%", "Led migration to cloud-native architecture"]
      },
      {
        id: "2",
        type: "work",
        title: "Software Engineer",
        industry: "Technology",
        companySize: "Large",
        seniority: "Mid",
        description: "Full-stack development of customer-facing web applications",
        skills: ["JavaScript", "React", "Python", "MongoDB", "REST APIs"],
        achievements: ["Built new feature that increased user engagement by 35%", "Implemented automated testing suite"]
      }
    ],
    skillset: {
      technical: ["React", "Node.js", "AWS", "PostgreSQL", "Docker", "TypeScript", "Team Leadership"],
      soft: ["Communication", "Leadership", "Problem Solving", "Mentoring"],
      languages: ["English", "Mandarin"],
      certifications: ["AWS Solutions Architect", "Certified Kubernetes Administrator"],
      categories: [
        {
          id: "1",
          name: "Technical Skills",
          skills: [
            { id: "1", name: "React", category: "Frontend", proficiency: 5, highlight: true, source: "experience" },
            { id: "2", name: "Node.js", category: "Backend", proficiency: 5, highlight: true, source: "experience" },
            { id: "3", name: "AWS", category: "Cloud", proficiency: 4, highlight: true, source: "experience" },
            { id: "4", name: "Docker", category: "DevOps", proficiency: 4, highlight: false, source: "experience" }
          ]
        }
      ],
      certificationsDetailed: [
        { id: "1", name: "AWS Solutions Architect", issuer: "Amazon Web Services", dateObtained: "2022-08-15" },
        { id: "2", name: "Certified Kubernetes Administrator", issuer: "CNCF", dateObtained: "2023-03-20" }
      ],
      languageProficiency: [
        { id: "1", language: "English", proficiency: "native" },
        { id: "2", language: "Mandarin", proficiency: "conversational" }
      ]
    },
    metadata: {
      lastModified: new Date().toISOString(),
      version: "1.0.0",
      isDraft: false
    }
  }
};

export const getMockProfile = (type: string = 'student'): ProfileFormData => {
  return mockProfiles[type] || mockProfiles.student;
};
