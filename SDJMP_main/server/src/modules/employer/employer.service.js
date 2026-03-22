export function serializeEmployerCompany(userDocument) {
  const user = userDocument.toObject ? userDocument.toObject() : userDocument

  return {
    id: String(user._id || user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company || {},
    avatar: user.avatar || '',
  }
}
