'use client';

import { useState, useEffect } from 'react';
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

    const loadUsers = () => {
        storage.init();
        setUsers(storage.getUsers());
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleSave = () => {
        if (!form.username || !form.name || (!editingUser && !form.password)) {
            toast.error('Please fill in all required fields');
            return;
        }

        const newUser: User = {
            id: editingUser?.id || crypto.randomUUID(),
            username: form.username!,
            name: form.name!,
            password: form.password || editingUser?.password,
            role: form.role as UserRole,
            status: form.status as 'ACTIVE' | 'INACTIVE',
        };

        storage.saveUser(newUser);
        toast.success(editingUser ? 'User updated successfully' : 'User created successfully');
        setIsAddModalOpen(false);
        setEditingUser(null);
        setForm({ username: '', name: '', password: '', role: 'POS_AGENT', status: 'ACTIVE' });
        loadUsers();
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            storage.deleteUser(id);
            toast.success('User deleted');
            loadUsers();
        }
    };

    const openEdit = (user: User) => {
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
            <div className="flex items-center justify-between">
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
                        <Button className="gap-2">
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
                                    <Select value={form.role} onValueChange={(v: string) => setForm({ ...form, role: v as UserRole })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                            <SelectItem value="POS_AGENT">POS Agent</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500"
                                            onClick={() => handleDelete(user.id)}
                                            disabled={user.username === 'admin'}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
