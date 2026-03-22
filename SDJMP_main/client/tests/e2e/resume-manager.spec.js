import { expect, test } from 'playwright/test'

function createPdfDataUrl() {
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Count 1 /Kids [3 0 R] >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 18 Tf
72 96 Td
(SkillMatch Resume) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000063 00000 n 
0000000122 00000 n 
0000000248 00000 n 
0000000342 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
412
%%EOF`

  return `data:application/pdf;base64,${Buffer.from(pdfContent).toString('base64')}`
}

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
  },
}

const uploadedResume = {
  _id: 'resume-uploaded-1',
  name: 'Aarav_Sharm_Resume.pdf',
  type: 'uploaded',
  fileUrl: createPdfDataUrl(),
  data: {
    mimeType: 'application/pdf',
    originalName: 'Aarav_Sharm_Resume.pdf',
    size: 2048,
  },
  atsScore: 0,
  isPrimary: true,
  status: 'verified',
  createdAt: '2026-03-20T09:00:00.000Z',
}

const builtResume = {
  _id: 'resume-built-1',
  name: 'Aarav_Sharm_Resume.pdf',
  type: 'built',
  fileUrl: '',
  data: {
    fullName: 'Aarav Sharma',
    email: 'student@skillmatch.dev',
    phone: '+91 99999 99999',
    location: 'Bengaluru, India',
    summary: 'Frontend-focused student building production-ready interfaces.',
    skills: ['React', 'Node.js', 'MongoDB'],
    education: [
      {
        id: 1,
        degree: 'B.Tech Computer Science',
        institution: 'State Technical University',
        year: '2026',
      },
    ],
    experience: [
      {
        id: 1,
        title: 'Frontend Intern',
        company: 'NovaStack Labs',
        period: '2025 - Present',
        bullets: ['Built a responsive employer dashboard.', 'Improved form completion flows.'],
      },
    ],
    projects: [
      {
        id: 1,
        title: 'SkillMatch Resume Builder',
        description: 'Structured resume generation for students.',
        link: 'https://example.com/resume-builder',
      },
    ],
  },
  atsScore: 82,
  isPrimary: false,
  status: 'pending',
  createdAt: '2026-03-18T09:00:00.000Z',
}

test.beforeEach(async ({ page }) => {
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
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ resumes: [uploadedResume, builtResume] }),
      })
      return
    }

    await route.continue()
  })
})

test('resume cards are clickable and built resumes download as PDF documents', async ({ page }) => {
  await page.goto('/student/resumes')

  await expect(page.getByRole('heading', { name: 'Resume Manager' })).toBeVisible({ timeout: 10000 })

  const uploadedCard = page
    .getByRole('button')
    .filter({ has: page.getByRole('heading', { name: 'Aarav_Sharm_Resume.pdf' }) })
    .first()
  await uploadedCard.click()

  await expect(page.getByRole('dialog')).toBeVisible()
  await page.goto('/student/resumes')
  await expect(page.getByRole('heading', { name: 'Resume Manager' })).toBeVisible({ timeout: 10000 })

  const builtResumeRow = page
    .getByRole('button')
    .filter({ has: page.getByText('Builder', { exact: true }) })
    .filter({ has: page.getByRole('heading', { name: 'Aarav_Sharm_Resume.pdf' }) })
    .first()

  const download = await Promise.all([
    page.waitForEvent('download'),
    builtResumeRow.getByLabel('Download Aarav_Sharm_Resume.pdf').click(),
  ])

  expect(download[0].suggestedFilename()).toBe('Aarav_Sharm_Resume.pdf')
})
