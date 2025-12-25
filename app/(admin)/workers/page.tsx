'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useStorageSync } from '@/hooks/useStorageSync';
import { storage } from '@/lib/storage';
import { User, Task } from '@/lib/types';
import { AI } from '@/lib/ai';
import { generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Trophy, Target, Search, Filter, UserCheck, CheckCircle2 } from 'lucide-react';

export default function WorkersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    // Filters
    const [userFilter, setUserFilter] = useState('ALL');
    const [roleFilter, setRoleFilter] = useState('ALL');

    // New Task Form
    const [selectedUserId, setSelectedUserId] = useState('');
    const [taskDescription, setTaskDescription] = useState('');

    const loadData = useCallback(async () => {
        await storage.init();
        const [u, t] = await Promise.all([
            storage.getUsers(),
            storage.getTasks()
        ]);
        setUsers(u);
        setTasks(t);
    }, []);

    useStorageSync(loadData);

    useEffect(() => {
        if (typeof window !== 'undefined') loadData();
    }, [loadData]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId || !taskDescription) return;

        const newTask: Task = {
            id: generateId(),
            userId: selectedUserId,
            description: taskDescription,
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };
        await storage.addTask(newTask);
        loadData();
        setTaskDescription('');
        setIsTaskModalOpen(false);
    };

    const handleCompleteTask = async (task: Task) => {
        const updatedTask = { ...task, status: 'COMPLETED' as const, completedAt: new Date().toISOString() };
        await storage.updateTask(updatedTask);
        loadData();
    };

    // --- Derived Data for Charts & Tables ---
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesUser = userFilter === 'ALL' || u.id === userFilter;
            const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
            return matchesUser && matchesRole;
        });
    }, [users, userFilter, roleFilter]);

    const userStats = useMemo(() => {
        return filteredUsers.map(u => {
            const userTasks = tasks.filter(t => t.userId === u.id);
            const completed = userTasks.filter(t => t.status === 'COMPLETED').length;
            const pending = userTasks.length - completed;
            const efficiency = AI.calculateUserEfficiency(u, tasks); // Uses shared logic
            return {
                ...u,
                totalTasks: userTasks.length,
                completed,
                pending,
                efficiency
            };
        }).sort((a, b) => b.efficiency - a.efficiency); // Rank by efficiency
    }, [filteredUsers, tasks]);

    const topPerformer = userStats.length > 0 ? userStats[0] : null;

    // Charts Data
    const efficiencyData = userStats.map(u => ({
        name: u.name,
        efficiency: u.efficiency,
        tasks: u.completed
    })).slice(0, 10); // Top 10

    const taskDistributionData = [
        { name: 'Completed', value: tasks.filter(t => t.status === 'COMPLETED').length, color: '#10b981' },
        { name: 'Pending', value: tasks.filter(t => t.status === 'PENDING').length, color: '#f59e0b' },
    ];

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981'];

    return (
        <div className="flex flex-col gap-8 pb-10">
            <header className="flex flex-col gap-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Team Performance</h1>
                        <p className="text-muted-foreground">Detailed efficiency ranking and task management.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => setIsTaskModalOpen(true)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Assign Task
                        </Button>
                    </div>
                </div>
            </header>

            {/* Quick Stats / Top Performer Highlight */}
            {topPerformer && (userFilter === 'ALL') && (
                <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-lg">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-lg bg-background/95 backdrop-blur-sm p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 shadow-md">
                                <Trophy className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-muted-foreground uppercase tracking-wide text-[10px]">Current Lead Performer</h3>
                                <div className="text-2xl font-black gradient-text">{topPerformer.name}</div>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{topPerformer.role}</span>
                                    <span>• {topPerformer.efficiency} Efficiency Score</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-8 text-center bg-muted/50 p-4 rounded-xl">
                            <div>
                                <div className="text-3xl font-black text-foreground">{topPerformer.completed}</div>
                                <div className="text-[10px] uppercase font-bold text-muted-foreground">Tasks Done</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-foreground">{topPerformer.totalTasks}</div>
                                <div className="text-[10px] uppercase font-bold text-muted-foreground">Total Assigned</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg border border-muted">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    Filters:
                </div>
                <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-[200px] h-9">
                        <SelectValue placeholder="Filter by User" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Users</SelectItem>
                        {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[150px] h-9">
                        <SelectValue placeholder="Filter by Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Roles</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="POS_AGENT">POS Agent</SelectItem>
                        {/* Deduplicate other roles if any */}
                        {Array.from(new Set(users.map(u => u.role)))
                            .filter(r => r !== 'ADMIN' && r !== 'POS_AGENT')
                            .map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)
                        }
                    </SelectContent>
                </Select>
                {(userFilter !== 'ALL' || roleFilter !== 'ALL') && (
                    <Button variant="ghost" size="sm" onClick={() => { setUserFilter('ALL'); setRoleFilter('ALL'); }}>
                        Reset
                    </Button>
                )}
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* Chart: Efficiency Matrix */}
                <Card className="lg:col-span-2 premium-card">
                    <CardHeader>
                        <CardTitle>Efficiency Matrix</CardTitle>
                        <CardDescription>Comparative analysis of task completion rates.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={efficiencyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                <Legend />
                                <Bar dataKey="efficiency" fill="#3b82f6" name="Score" radius={[4, 4, 0, 0]}>
                                    {efficiencyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Chart: Task Status */}
                <Card className="premium-card">
                    <CardHeader>
                        <CardTitle>Workload Status</CardTitle>
                        <CardDescription>Global task completion ratio.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={taskDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {taskDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="text-center mt-2">
                            <span className="text-3xl font-bold">{tasks.length}</span>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">Total Tasks</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* User List Table */}
            <Card className="premium-card">
                <CardHeader>
                    <CardTitle>Personnel Roster</CardTitle>
                    <CardDescription>Individual performance statistics.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rank</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Tasks Done</TableHead>
                                <TableHead>Pending</TableHead>
                                <TableHead>Efficiency</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userStats.map((u, index) => (
                                <TableRow key={u.id} className="group hover:bg-muted/50">
                                    <TableCell className="font-bold text-muted-foreground">#{index + 1}</TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                {u.name[0]}
                                            </div>
                                            {u.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">
                                            {u.role}
                                        </span>
                                    </TableCell>
                                    <TableCell>{u.completed}</TableCell>
                                    <TableCell>
                                        {u.pending > 0 ? (
                                            <span className="text-amber-600 font-bold">{u.pending}</span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs opacity-50">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${u.efficiency >= 80 ? 'bg-green-500' : u.efficiency >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${Math.min(u.efficiency, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold">{u.efficiency}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Active Tasks List - Always useful to have nearby */}
            <Card>
                <CardHeader>
                    <CardTitle>Pending Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {tasks.filter(t => t.status === 'PENDING').map(t => {
                            const user = users.find(u => u.id === t.userId);
                            // Filter this list too based on overall filters? Usually better to show all pending unless specific user is selected
                            if (userFilter !== 'ALL' && user?.id !== userFilter) return null;

                            return (
                                <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                    <div>
                                        <p className="font-medium">{t.description}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <UserCheck className="h-3 w-3" />
                                            <span>{user?.name || 'Unassigned'}</span>
                                            <span className="text-xs">• {new Date(t.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => handleCompleteTask(t)} className="h-8">
                                        Mark Done
                                    </Button>
                                </div>
                            )
                        })}
                        {tasks.filter(t => t.status === 'PENDING').length === 0 && <p className="text-muted-foreground text-center py-4">No pending tasks.</p>}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign New Task</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateTask} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Team Member</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                required
                            >
                                <option value="">Select a user...</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Task Description</Label>
                            <Input
                                value={taskDescription}
                                onChange={(e) => setTaskDescription(e.target.value)}
                                placeholder="e.g. Audit Aisle C, Prepare Order #504"
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Assign Task</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
