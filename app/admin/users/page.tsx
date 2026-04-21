"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical,
  Pencil,
  Trash2,
  Mail,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data
const users = [
  { 
    id: "1", 
    name: "John Doe", 
    email: "john@example.com",
    role: "Admin",
    status: "active",
    lastLogin: "2 hours ago",
    meetings: 45
  },
  { 
    id: "2", 
    name: "Jane Smith", 
    email: "jane@example.com",
    role: "Moderator",
    status: "active",
    lastLogin: "1 day ago",
    meetings: 23
  },
  { 
    id: "3", 
    name: "Bob Wilson", 
    email: "bob@example.com",
    role: "Presenter",
    status: "active",
    lastLogin: "3 days ago",
    meetings: 12
  },
  { 
    id: "4", 
    name: "Alice Brown", 
    email: "alice@example.com",
    role: "Attendee",
    status: "inactive",
    lastLogin: "2 weeks ago",
    meetings: 5
  },
  { 
    id: "5", 
    name: "Charlie Davis", 
    email: "charlie@example.com",
    role: "Presenter",
    status: "active",
    lastLogin: "5 hours ago",
    meetings: 34
  },
]

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage team members and their permissions
          </p>
        </div>
        <Link href="/admin/users/invite">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Invite User
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select className="px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="presenter">Presenter</option>
              <option value="attendee">Attendee</option>
            </select>
            <select className="px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>{filteredUsers.length} users found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Login</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Meetings</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.name[0]}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium block">{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{user.role}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        user.status === "active" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{user.lastLogin}</td>
                    <td className="py-3 px-4 text-sm">{user.meetings}</td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Pencil className="w-4 h-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
