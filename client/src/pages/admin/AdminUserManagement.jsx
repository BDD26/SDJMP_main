import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const users = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'student',
    status: 'active',
    joined: '2 months ago',
  },
  {
    id: 2,
    name: 'TechCorp Inc',
    email: 'hr@techcorp.com',
    role: 'employer',
    status: 'active',
    joined: '1 month ago',
  },
]

export default function AdminUserManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">Manage platform users</p>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-medium">Name</th>
              <th className="text-left p-4 font-medium">Role</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Joined</th>
              <th className="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-muted/50">
                <td className="p-4">
                  <h4 className="font-medium">{user.name}</h4>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </td>
                <td className="p-4">
                  <Badge variant="secondary" className="capitalize">
                    {user.role}
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge variant="default">{user.status}</Badge>
                </td>
                <td className="p-4 text-sm text-muted-foreground">{user.joined}</td>
                <td className="p-4">
                  <Button variant="outline" size="sm">View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
