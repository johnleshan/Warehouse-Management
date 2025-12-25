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
import { Trophy, Search, Filter, UserCheck, CheckCircle2 } from 'lucide-react';

export default function WorkersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    // Filters
    const [userFilter, setUserFilter] = useState('ALL');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [timeFilter, setTimeFilter] = useState('all');

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
    // 1. Filter Tasks by Time
    const filteredTasks = useMemo(() => {
        if (timeFilter === 'all') return tasks;

        const now = new Date();
        const currentYear = now.getFullYear();

        return tasks.filter(t => {
            const date = new Date(t.createdAt);
            const tYear = date.getFullYear();
            const diffMs = now.getTime() - date.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);

            switch (timeFilter) {
                // Hours
                case '1h': return diffHours <= 1;
                case '3h': return diffHours <= 3;
                case '6h': return diffHours <= 6;
                case '12h': return diffHours <= 12;
                case '18h': return diffHours <= 18;
                case '24h': return diffHours <= 24;

                // Periods
                case 'week': {
                    const oneWeekAgo = new Date(now);
                    oneWeekAgo.setDate(now.getDate() - 7);
                    return date >= oneWeekAgo;
                }
                case 'month': {
                    const oneMonthAgo = new Date(now);
                    oneMonthAgo.setMonth(now.getMonth() - 1);
                    return date >= oneMonthAgo;
                }

                // Years
                case 'year_curr': return tYear === currentYear;
                case 'year_2024': return tYear === 2024;
                case 'year_2023': return tYear === 2023;

                default: return true;
            }
        });
    }, [tasks, timeFilter]);

    // 2. Filter Users
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesUser = userFilter === 'ALL' || u.id === userFilter;
            const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
            return matchesUser && matchesRole;
        });
    }, [users, userFilter, roleFilter]);

    // 3. User Stats based on Filtered Tasks
    const userStats = useMemo(() => {
        return filteredUsers.map(u => {
            const userTasks = filteredTasks.filter(t => t.userId === u.id);
            const completed = userTasks.filter(t => t.status === 'COMPLETED').length;
            const pending = userTasks.length - completed;
            const efficiency = AI.calculateUserEfficiency(u, filteredTasks);
            return {
                ...u,
                totalTasks: userTasks.length,
                completed,
                pending,
                efficiency
            };
        }).sort((a, b) => b.efficiency - a.efficiency);
    }, [filteredUsers, filteredTasks]);

    const topPerformer = userStats.length > 0 ? userStats[0] : null;

    // Charts Data
    const efficiencyData = userStats.map(u => ({
        name: u.name,
        efficiency: u.efficiency,
        tasks: u.completed
    })).slice(0, 10);

    const taskDistributionData = [
        { name: 'Completed', value: filteredTasks.filter(t => t.status === 'COMPLETED').length, color: '#10b981' },
        { name: 'Pending', value: filteredTasks.filter(t => t.status === 'PENDING').length, color: '#f59e0b' },
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
                        {Array.from(new Set(users.map(u => u.role)))
                            .filter(r => r !== 'ADMIN' && r !== 'POS_AGENT')
                            .map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)
                        }
                    </SelectContent>
                </Select>
                <div className="h-4 w-px bg-border mx-2 hidden md:block" />
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="Time Period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="1h">Last 1 Hour</SelectItem>
                        <SelectItem value="3h">Last 3 Hours</SelectItem>
                        <SelectItem value="6h">Last 6 Hours</SelectItem>
                        <SelectItem value="12h">Last 12 Hours</SelectItem>
                        <SelectItem value="18h">Last 18 Hours</SelectItem>
                        <SelectItem value="24h">Last 24 Hours</SelectItem>
                        <SelectItem value="week">Past Week</SelectItem>
                        <SelectItem value="month">Past Month</SelectItem>
                        <div className="border-t my-1" />
                        <SelectItem value="year_curr">Current Year</SelectItem>
                        <SelectItem value="year_2024">2024</SelectItem>
                    </SelectContent>
                </Select>

                {(userFilter !== 'ALL' || roleFilter !== 'ALL' || timeFilter !== 'all') && (
                    <Button variant="ghost" size="sm" onClick={() => { setUserFilter('ALL'); setRoleFilter('ALL'); setTimeFilter('all'); }}>
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
                <Card className="premium-card flex flex-col">
                    <CardHeader>
                        <CardTitle>Workload Status</CardTitle>
                        <CardDescription>Global task completion ratio.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-[300px] flex flex-col items-center justify-center p-0 pb-6 relative">
                        <div className="h-[250px] w-full">
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
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ bottom: 0 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Static Center Label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                            <div className="text-center bg-background/50 backdrop-blur-sm p-2 rounded-full">
                                <span className="text-3xl font-black">{filteredTasks.length}</span>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Total</p>
                            </div>
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
                <CardContent className="overflow-x-auto">
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
                            {userStats.length > 0 ? (
                                userStats.map((u, index) => (
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
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No users found matching current filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Active Tasks List */}
            <Card>
                <CardHeader>
                    <CardTitle>Pending Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {tasks.filter(t => t.status === 'PENDING').map(t => {
                            const user = users.find(u => u.id === t.userId);
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

            {/* Task History / Digital Footprint */}
            <Card className="premium-card">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div>
                            <CardTitle>Digital Footprint</CardTitle>
                            <CardDescription>Comprehensive history of completed operations.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Task Description</TableHead>
                                <TableHead>Performed By</TableHead>
                                <TableHead>Assigned</TableHead>
                                <TableHead>Completed</TableHead>
                                <TableHead>Duration</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTasks.filter(t => t.status === 'COMPLETED').length > 0 ? (
                                filteredTasks.filter(t => t.status === 'COMPLETED')
                                    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
                                    .map(t => {
                                        const user = users.find(u => u.id === t.userId);
                                        // Calculate duration if possible
                                        let duration = '-';
                                        if (t.createdAt && t.completedAt) {
                                            const start = new Date(t.createdAt).getTime();
                                            const end = new Date(t.completedAt).getTime();
                                            const diffMins = Math.round((end - start) / (1000 * 60));
                                            if (diffMins < 60) duration = `${diffMins}m`;
                                            else duration = `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
                                        }

                                        return (
                                            <TableRow key={t.id} className="group hover:bg-muted/50">
                                                <TableCell className="font-medium">{t.description}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                                                            {user?.name?.[0] || '?'}
                                                        </div>
                                                        {user?.name || 'Unknown'}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{t.completedAt ? new Date(t.completedAt).toLocaleString() : '-'}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        {duration}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No completed tasks found in this period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
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
