export function serializeAdminSummary(summary) {
  return {
    users: summary?.users || 0,
    employers: summary?.employers || 0,
    jobs: summary?.jobs || 0,
    applications: summary?.applications || 0,
  }
}
