'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStorageSync } from '@/hooks/useStorageSync';
import { storage } from '@/lib/storage';
import { User, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Pencil, Trash2, Key } from 'lucide-react';
import { toast } from 'sonner';
import { generateId } from '@/lib/utils';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [form, setForm] = useState<Partial<User>>({
        username: '',
        name: '',
        password: '',
        role: 'POS_AGENT',
        status: 'ACTIVE'
    });

    const loadUsers = useCallback(async () => {
        await storage.init();
        const u = await storage.getUsers();
        setUsers(u);
    }, []);

    useStorageSync(loadUsers);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleSave = async () => {
        if (!form.username || !form.name || (!editingUser && !form.password)) {
            toast.error('Please fill in all required fields');
            return;
        }

        const newUser: User = {
            id: editingUser?.id || generateId(),
            username: form.username!,
            name: form.name!,
            password: form.password || editingUser?.password,
            role: form.role as UserRole,
            status: form.status as 'ACTIVE' | 'INACTIVE',
        };

        await storage.saveUser(newUser);
        toast.success(editingUser ? 'User updated successfully' : 'User created successfully');
        setIsAddModalOpen(false);
        setEditingUser(null);
        setForm({ username: '', name: '', password: '', role: 'POS_AGENT', status: 'ACTIVE' });
        loadUsers();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            await storage.deleteUser(id);
            toast.success('User deleted');
            loadUsers();
        }
    };

    const openEdit = (user: User) => {
        if (user.role === 'ADMIN') return;
        setEditingUser(user);
        setForm({
            username: user.username,
            name: user.name,
            role: user.role,
            status: user.status,
            password: '' // Don't show password, only update if filled
        });
        setIsAddModalOpen(true);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage POS agents and system administrators.</p>
                </div>
                <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                    setIsAddModalOpen(open);
                    if (!open) {
                        setEditingUser(null);
                        setForm({ username: '', name: '', password: '', role: 'POS_AGENT', status: 'ACTIVE' });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 w-full sm:w-auto">
                            <UserPlus className="h-4 w-4" />
                            Add New User
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">{editingUser ? 'New Password (Leave blank to keep current)' : 'Password'}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Role</Label>
                                    <div className="relative">
                                        <Input
                                            value={form.role}
                                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                                            placeholder="e.g. POS_AGENT, Manager"
                                            list="role-suggestions"
                                        />
                                        <datalist id="role-suggestions">
                                            <option value="ADMIN" />
                                            <option value="POS_AGENT" />
                                            <option value="MANAGER" />
                                            <option value="SUPERVISOR" />
                                        </datalist>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Type any custom role or select from list.</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                    <Select value={form.status} onValueChange={(v: string) => setForm({ ...form, status: v as any })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save User</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.status === 'ACTIVE' ? 'success' as any : 'destructive'}>
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {user.role !== 'ADMIN' && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEdit(user)}
                                                    title="Edit user"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500"
                                                    onClick={() => handleDelete(user.id)}
                                                    title="Delete user"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
