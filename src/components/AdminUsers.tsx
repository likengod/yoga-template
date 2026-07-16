
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Edit, Trash2, Key, Users, Shield, Crown, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import AdminPagination from './admin/AdminPagination';
import { usersApi } from '@/services/mysqlApi';

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'guest' | 'user' | 'admin' | 'superadmin' | 'instructor';
  phone?: string;
}

interface AdminUsersProps {
  currentUser: { role: string; id: string };
}

const AdminUsers = ({ currentUser }: AdminUsersProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [autoGenerateId, setAutoGenerateId] = useState(true);
  const [newUser, setNewUser] = useState<User>({
    id: '',
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [createConfirmPassword, setCreateConfirmPassword] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showCreateConfirmPassword, setShowCreateConfirmPassword] = useState(false);
  const { toast } = useToast();

  // Default users
  const defaultUsers: User[] = [
    { id: '000001', username: 'admin', password: 'admin123', role: 'superadmin', email: 'admin@example.com', phone: '+1234567890' },
    { id: '000002', username: 'yoga_admin', password: 'shakti2024', role: 'admin', email: 'yoga_admin@example.com', phone: '+1234567891' },
    { id: '000004', username: 'instructor', password: 'teacher123', role: 'instructor', email: 'instructor@example.com', phone: '+1234567893' },
    { id: '000005', username: 'student', password: 'student123', role: 'user', email: 'student@example.com', phone: '+1234567894' },
    ...Array.from({ length: 20 }).map((_, i) => ({
      id: (i + 6).toString().padStart(6, '0'),
      username: `mockuser${i + 1}`,
      password: 'password123',
      role: 'user' as const,
      email: `mockuser${i + 1}@example.com`,
      phone: `+1234567${(i+1).toString().padStart(3, '0')}`
    }))
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      let dbUsers = await usersApi.getAll();
      if (dbUsers && dbUsers.length > 0) {
        setUsers(dbUsers);
        localStorage.setItem('users', JSON.stringify(dbUsers));
        return;
      } else {
        // Seed default users to backend if database is empty
        for (const user of defaultUsers) {
          try {
            await usersApi.create(user);
          } catch (e) {
            console.error("Failed to seed user:", user.username, e);
          }
        }
        dbUsers = await usersApi.getAll();
        if (dbUsers && dbUsers.length > 0) {
          setUsers(dbUsers);
          localStorage.setItem('users', JSON.stringify(dbUsers));
          return;
        }
      }
    } catch (err) {
      console.error("Failed to load users from database:", err);
    }

    // Fallback to localStorage if database query failed or is empty
    let storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (storedUsers.length === 0 && localStorage.getItem('users_initialized') !== 'true') {
      storedUsers = defaultUsers;
      localStorage.setItem('users', JSON.stringify(storedUsers));
      localStorage.setItem('users_initialized', 'true');
    }
    setUsers(storedUsers);
  };

  useEffect(() => {
    if (isCreateDialogOpen) {
      if (autoGenerateId) {
        const generate6DigitId = () => {
          let uniqueId = '';
          let isUnique = false;
          const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
          while (!isUnique) {
            uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
            isUnique = !users.some(u => u.id === uniqueId) && !storedUsers.some((u: any) => u.id === uniqueId);
          }
          return uniqueId;
        };
        setNewUser(prev => ({ ...prev, id: generate6DigitId() }));
      } else {
        setNewUser(prev => ({ ...prev, id: '' }));
      }
    }
  }, [isCreateDialogOpen, autoGenerateId]);

  const canManageUser = (targetUser: User) => {
    // Super admin can manage everyone (including themselves and other super admins)
    if (currentUser.role === 'superadmin') {
      return true;
    }
    // Admin can manage users and guests, but not admins or super admins
    if (currentUser.role === 'admin') {
      return targetUser.role === 'user' || targetUser.role === 'guest' || targetUser.role === 'instructor';
    }
    return false;
  };

  const systemUserIds = ['000001', '000002', '000003', '000004', '000005'];

  const isDeletable = (user: User) => {
    return canManageUser(user) && !systemUserIds.includes(user.id);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Crown size={16} className="text-yellow-600" />;
      case 'admin':
        return <Shield size={16} className="text-blue-600" />;
      case 'instructor':
        return <GraduationCap size={16} className="text-purple-600" />;
      case 'user':
        return <Users size={16} className="text-green-600" />;
      case 'guest':
        return <Users size={16} className="text-gray-600" />;
      default:
        return <Users size={16} className="text-gray-600" />;
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.id || !newUser.username || !newUser.email || !newUser.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields (including User ID)",
      });
      return;
    }

    if (users.some(user => user.username === newUser.username)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Username already exists",
      });
      return;
    }

    if (users.some(user => user.id === newUser.id)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User ID already exists. Please choose a unique ID.",
      });
      return;
    }

    if (newUser.password !== createConfirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    try {
      const userToCreate: User = {
        ...newUser,
      };

      await usersApi.create(userToCreate);

      toast({
        title: "User Created",
        description: `User ${userToCreate.username} has been created successfully`,
      });

      setNewUser({ id: '', username: '', email: '', password: '', role: 'user' });
      setCreateConfirmPassword('');
      setShowCreatePassword(false);
      setShowCreateConfirmPassword(false);
      setIsCreateDialogOpen(false);
      loadUsers();
    } catch (error) {
      console.error("Failed to create user in database:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create user in database",
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await usersApi.update(selectedUser.id, selectedUser);

      toast({
        title: "User Updated",
        description: `User ${selectedUser.username} has been updated successfully`,
      });

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error("Failed to update user in database:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user in database",
      });
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword) return;

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    try {
      const updatedUser = { ...selectedUser, password: newPassword };
      await usersApi.update(selectedUser.id, updatedUser);

      toast({
        title: "Password Changed",
        description: `Password for ${selectedUser.username} has been updated`,
      });

      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setIsPasswordDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error("Failed to change password in database:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to change password in database",
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!canManageUser(user)) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to delete this user",
      });
      return;
    }

    // Prevent deleting built-in system users
    if (systemUserIds.includes(user.id)) {
      toast({
        variant: "destructive",
        title: "Cannot Delete",
        description: "Cannot delete built-in system users",
      });
      return;
    }

    try {
      await usersApi.remove(user.id);

      toast({
        title: "User Deleted",
        description: `User ${user.username} has been deleted`,
      });

      loadUsers();
    } catch (error) {
      console.error("Failed to delete user in database:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user in database",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} selected users?`)) return;

    try {
      // Delete in parallel
      await Promise.all(selectedUsers.map(id => usersApi.remove(id)));

      toast({
        title: "Users Deleted",
        description: `Successfully deleted ${selectedUsers.length} users`,
      });

      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      console.error("Failed to bulk delete users in database:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete one or more users",
      });
      loadUsers();
    }
  };

  const availableRoles = currentUser.role === 'superadmin' 
    ? ['guest', 'user', 'instructor', 'admin', 'superadmin']
    : ['guest', 'user', 'instructor'];

  const pageUsers = users
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const pageDeletableUsers = pageUsers.filter(isDeletable);

  const getEditRoles = (userRole: string) => {
    const roles = [...availableRoles];
    if (userRole && !roles.includes(userRole)) {
      roles.push(userRole);
    }
    return roles;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Users size={20} className="text-yoga-sage" />
            <h2 className="text-xl font-semibold text-yoga-forest">User Management</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {selectedUsers.length > 0 && (
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedUsers.length})
              </Button>
            )}
            <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val); setCurrentPage(1); setSelectedUsers([]); }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Superadmin</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) {
                setNewUser({ id: '', username: '', email: '', password: '', role: 'user' });
                setCreateConfirmPassword('');
                setShowCreatePassword(false);
                setShowCreateConfirmPassword(false);
              }
            }}>
            <DialogTrigger asChild>
              <Button className="bg-yoga-sage hover:bg-yoga-forest">
                <UserPlus size={16} className="mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system with specified role and permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 py-1">
                  <Checkbox 
                    id="auto-id" 
                    checked={autoGenerateId} 
                    onCheckedChange={(checked) => setAutoGenerateId(!!checked)} 
                    className="border-yoga-forest text-yoga-forest"
                  />
                  <Label htmlFor="auto-id" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Auto-generate 6-digit unique User ID
                  </Label>
                </div>
                <div>
                  <Label htmlFor="new-id">User ID *</Label>
                  <Input
                    id="new-id"
                    value={newUser.id}
                    onChange={(e) => !autoGenerateId && setNewUser(prev => ({ ...prev, id: e.target.value }))}
                    disabled={autoGenerateId}
                    placeholder={autoGenerateId ? "Auto-generating..." : "Enter custom User ID"}
                  />
                </div>
                <div>
                  <Label htmlFor="new-username">Username</Label>
                  <Input
                    id="new-username"
                    value={newUser.username}
                    onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label htmlFor="new-email">Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <Label htmlFor="new-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showCreatePassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCreatePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="new-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="new-confirm-password"
                      type={showCreateConfirmPassword ? "text" : "password"}
                      value={createConfirmPassword}
                      onChange={(e) => setCreateConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreateConfirmPassword(!showCreateConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCreateConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="new-role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value as User['role'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map(role => (
                        <SelectItem key={role} value={role}>
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(role)}
                            <span className="capitalize">{role}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateUser} className="w-full bg-yoga-sage hover:bg-yoga-forest">
                  Create User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 py-2">
                  <Checkbox 
                    checked={
                      pageDeletableUsers.length > 0 && 
                      pageDeletableUsers.every(u => selectedUsers.includes(u.id))
                    }
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers(prev => {
                          const toAdd = pageDeletableUsers.map(u => u.id).filter(id => !prev.includes(id));
                          return [...prev, ...toAdd];
                        });
                      } else {
                        setSelectedUsers(prev => prev.filter(id => !pageDeletableUsers.some(u => u.id === id)));
                      }
                    }}
                    className="border-yoga-forest text-yoga-forest"
                  />
                </TableHead>
                <TableHead className="py-2">User ID</TableHead>
                <TableHead className="py-2">Username</TableHead>
                <TableHead className="py-2">Email</TableHead>
                <TableHead className="py-2">Phone</TableHead>
                <TableHead className="py-2">Role</TableHead>
                <TableHead className="py-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="py-2">
                    {isDeletable(user) ? (
                      <Checkbox 
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => {
                          setSelectedUsers(prev => checked ? [...prev, user.id] : prev.filter(id => id !== user.id));
                        }}
                        className="border-yoga-forest text-yoga-forest"
                      />
                    ) : (
                      <Checkbox 
                        disabled
                        className="border-yoga-forest/20 opacity-30 cursor-not-allowed"
                      />
                    )}
                  </TableCell>
                  <TableCell className="py-2 font-mono text-xs text-yoga-forest font-semibold">{user.id}</TableCell>
                  <TableCell className="py-2 font-medium">{user.username}</TableCell>
                  <TableCell className="py-2">{user.email}</TableCell>
                  <TableCell className="py-2">{user.phone || 'N/A'}</TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex space-x-2">
                      {canManageUser(user) && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsPasswordDialogOpen(true);
                            }}
                          >
                            <Key size={14} />
                          </Button>
                          {isDeletable(user) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {users.filter(u => roleFilter === 'all' || u.role === roleFilter).length > itemsPerPage && (
          <div className="mt-4">
            <AdminPagination 
              currentPage={currentPage}
              totalPages={Math.ceil(users.filter(u => roleFilter === 'all' || u.role === roleFilter).length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={selectedUser.username}
                  onChange={(e) => setSelectedUser(prev => prev ? { ...prev, username: e.target.value } : null)}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(value) => setSelectedUser(prev => prev ? { ...prev, role: value as User['role'] } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getEditRoles(selectedUser.role).map(role => (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(role)}
                          <span className="capitalize">{role}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdateUser} className="w-full bg-yoga-sage hover:bg-yoga-forest">
                Update User
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isPasswordDialogOpen} onOpenChange={(open) => {
        setIsPasswordDialogOpen(open);
        if (!open) {
          setNewPassword('');
          setConfirmPassword('');
          setShowPassword(false);
          setShowConfirmPassword(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.username}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-user-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-user-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirm-user-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-user-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button onClick={handleChangePassword} className="w-full bg-yoga-sage hover:bg-yoga-forest">
              <Key size={16} className="mr-2" />
              Change Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
