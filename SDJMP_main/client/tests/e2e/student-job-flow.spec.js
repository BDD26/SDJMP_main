import { expect, test } from 'playwright/test'

const studentSession = {
  id: 'DEV-STUDENT-001',
  name: 'Aarav Sharma',
  email: 'student@skillmatch.dev',
  role: 'student',
  avatar: '',
  profile: {
    bio: 'Frontend-focused student testing the SkillMatch platform.',
    location: 'Bengaluru, India',
    education: 'B.Tech Computer Science',
    institution: 'State Technical University',
    graduationYear: 2026,
    profileCompletion: 88,
    skills: ['React', 'Node.js', 'MongoDB'],
  },
}

const primaryResume = {
  _id: 'resume-primary-1',
  name: 'Aarav_Sharm_Resume.pdf',
  type: 'uploaded',
  fileUrl: 'https://example.com/aarav-resume.pdf',
  isPrimary: true,
  status: 'verified',
  createdAt: '2026-03-20T09:00:00.000Z',
}

const job = {
  id: 'job-react-001',
  _id: 'job-react-001',
  title: 'React Frontend Intern',
  company: 'NovaStack Labs',
  location: 'Remote',
  type: 'Internship',
  salary: '$18/hr',
  deadline: '2026-04-15T00:00:00.000Z',
  status: 'Open',
  createdAt: '2026-03-18T09:00:00.000Z',
  description:
    'Work with the product team to ship polished frontend features.\nCollaborate on React, APIs, and accessibility improvements.',
  skills: ['React', 'Node.js'],
  requirements: ['React', 'REST APIs', 'Testing'],
}

function createApplicationRecord(overrides = {}) {
  return {
    id: 'application-001',
    _id: 'application-001',
    jobId: job.id,
    studentId: studentSession.id,
    employerId: 'EMPLOYER-001',
    status: 'pending',
    resumeId: primaryResume._id,
    notes: '',
    createdAt: '2026-03-22T10:00:00.000Z',
    updatedAt: '2026-03-22T10:00:00.000Z',
    job: {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary,
      status: job.status,
    },
    ...overrides,
  }
}

test.beforeEach(async ({ page }) => {
  const applications = []

  await page.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: studentSession }),
    })
  })

  await page.route('**/api/notifications', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ notifications: [] }),
    })
  })

  await page.route('**/api/users/resumes', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ resumes: [primaryResume] }),
    })
  })

  await page.route('**/api/jobs/student/matches', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          ...job,
          matchScore: 100,
        },
      ]),
    })
  })

  await page.route(`**/api/jobs/${job.id}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(job),
    })
  })

  await page.route('**/api/applications/my', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(applications),
    })
  })

  await page.route('**/api/applications', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue()
      return
    }

    const payload = route.request().postDataJSON()
    const hasDuplicate = applications.some((application) => application.jobId === payload.jobId)

    if (hasDuplicate) {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'You have already applied to this job' }),
      })
      return
    }

    const createdApplication = createApplicationRecord({
      id: `application-${applications.length + 1}`,
      _id: `application-${applications.length + 1}`,
      resumeId: payload.resumeId,
    })

    applications.push(createdApplication)

    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(createdApplication),
    })
  })
})

test('student can search, apply, review applications, and sees duplicate-application handling', async ({ page }) => {
  await page.goto('/student/jobs')

  await expect(page.getByRole('heading', { name: 'Job Opportunities' })).toBeVisible()
  await expect(page.getByText('React Frontend Intern')).toBeVisible()
  await expect(page.getByText('NovaStack Labs')).toBeVisible()

  await page.getByPlaceholder('Search jobs...').fill('React')
  await expect(page.getByText('React Frontend Intern')).toBeVisible()

  await page.getByPlaceholder('Search jobs...').fill('Python')
  await expect(page.getByText('No jobs match your search. Try different keywords.')).toBeVisible()

  await page.getByPlaceholder('Search jobs...').fill('Nova')
  await page.getByRole('link', { name: 'View Match Analysis' }).click()

  await expect(page).toHaveURL(`/jobs/${job.id}`)
  await page.waitForLoadState('networkidle')
  await expect(page.getByText('React Frontend Intern')).toBeVisible()
  const applyNowButton = page.getByRole('button', { name: 'Apply Now' })
  await expect(applyNowButton).toBeVisible()
  await applyNowButton.scrollIntoViewIfNeeded()
  await applyNowButton.evaluate((button) => button.click())
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByText('Apply to NovaStack Labs')).toBeVisible()
  await expect(page.getByText('Aarav_Sharm_Resume.pdf')).toBeVisible()

  await page.getByRole('button', { name: /Confirm & Apply/i }).click()
  await expect(page.getByText('Application submitted successfully')).toBeVisible()
  await expect(page.getByText('Application Sent')).toBeVisible()

  await page.getByRole('button', { name: 'Track Application' }).click()
  await expect(page).toHaveURL('/student/applications')
  await expect(page.getByRole('heading', { name: 'My Applications' })).toBeVisible()
  await expect(page.getByText('React Frontend Intern')).toBeVisible()
  await expect(page.getByText('NovaStack Labs')).toBeVisible()
  await expect(page.getByText('Application Sent')).toBeVisible()

  await page.getByRole('link', { name: 'View Job Details' }).click()
  await expect(page).toHaveURL(`/jobs/${job.id}`)
  await page.waitForLoadState('networkidle')

  await applyNowButton.scrollIntoViewIfNeeded()
  await applyNowButton.evaluate((button) => button.click())
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: /Confirm & Apply/i }).click()
  await expect(page.getByText('You have already applied to this job')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Track Application' })).toHaveCount(0)
})
