function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeStringArray(values = []) {
  const source = Array.isArray(values) ? values : [values]

  return source
    .flat(Infinity)
    .map((value) => (typeof value === 'string' ? value.trim() : String(value || '').trim()))
    .filter(Boolean)
}

function normalizeSkills(skills = []) {
  if (!Array.isArray(skills)) {
    return []
  }

  return skills
    .map((skill) => {
      if (typeof skill === 'string') {
        return {
          name: skill.trim(),
          level: 'intermediate',
          years: 1,
        }
      }

      return {
        id: skill?.id ? String(skill.id) : undefined,
        name: normalizeString(skill?.name),
        level: skill?.level || 'intermediate',
        years: Number.isFinite(Number(skill?.years)) ? Number(skill.years) : 0,
      }
    })
    .filter((skill) => skill.name)
}

function normalizeEducation(entries = []) {
  if (!Array.isArray(entries)) {
    return []
  }

  return entries
    .map((entry, index) => ({
      id: entry?.id ? String(entry.id) : `edu-${Date.now()}-${index}`,
      degree: normalizeString(entry?.degree),
      institution: normalizeString(entry?.institution),
      year: normalizeString(entry?.year),
    }))
    .filter((entry) => entry.degree || entry.institution || entry.year)
}

function normalizeProjects(entries = []) {
  if (!Array.isArray(entries)) {
    return []
  }

  return entries
    .map((entry, index) => ({
      id: entry?.id ? String(entry.id) : `project-${Date.now()}-${index}`,
      title: normalizeString(entry?.title),
      description: normalizeString(entry?.description),
      link: normalizeString(entry?.link),
    }))
    .filter((entry) => entry.title || entry.description || entry.link)
}

function normalizeCertifications(entries = []) {
  if (!Array.isArray(entries)) {
    return []
  }

  return entries
    .map((entry) => ({
      name: normalizeString(entry?.name),
      issuer: normalizeString(entry?.issuer),
      year: normalizeString(entry?.year),
    }))
    .filter((entry) => entry.name || entry.issuer || entry.year)
}

function normalizePreferences(preferences = {}) {
  return {
    jobTypes: normalizeStringArray(preferences?.jobTypes),
    locations: normalizeStringArray(preferences?.locations),
    minSalary: normalizeString(preferences?.minSalary),
  }
}

export function normalizeProfile(profile = {}) {
  return {
    bio: normalizeString(profile?.bio),
    location: normalizeString(profile?.location),
    skills: normalizeSkills(profile?.skills),
    education: normalizeEducation(profile?.education),
    projects: normalizeProjects(profile?.projects),
    certifications: normalizeCertifications(profile?.certifications),
    preferences: normalizePreferences(profile?.preferences),
  }
}

export const transformProfileForFrontend = (backendProfile = {}) => normalizeProfile(backendProfile)

export function buildStudentProfileViewData(user = {}) {
  const normalizedProfile = normalizeProfile(user?.profile || {})

  return {
    ...normalizedProfile,
    name: normalizeString(user?.name) || 'Student',
    email: normalizeString(user?.email),
    avatar: normalizeString(user?.avatar),
    locationLabel:
      normalizedProfile.location ||
      normalizedProfile.preferences.locations[0] ||
      'Location not added yet',
  }
}

export const transformProfileForBackend = (frontendProfile = {}) => {
  const normalizedProfile = normalizeProfile(frontendProfile)

  return {
    profile: normalizedProfile,
  }
}

export const calculateProfileCompletion = (profile = {}) => {
  const normalizedProfile = normalizeProfile(profile)
  const fields = {
    bio: !!normalizedProfile.bio,
    location: !!normalizedProfile.location,
    skills: normalizedProfile.skills.length > 0,
    education: normalizedProfile.education.length > 0,
    projects: normalizedProfile.projects.length > 0,
    certifications: normalizedProfile.certifications.length > 0,
    preferences:
      normalizedProfile.preferences.locations.length > 0 ||
      !!normalizedProfile.preferences.minSalary ||
      normalizedProfile.preferences.jobTypes.length > 0,
  }

  const completedFields = Object.values(fields).filter(Boolean).length
  return Math.round((completedFields / Object.keys(fields).length) * 100)
}
