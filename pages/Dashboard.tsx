import React, { useMemo } from 'react';
import Card from '../components/ui/Card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import type { Student, Class, Teacher } from '../types';
import { StudentStatus } from '../types';

interface DashboardProps {
    dashboardData: {
        totalStudents: number;
        consultingStudents: number;
        attendanceToday: { name: string; value: number; fill: string; }[];
        scoreTrends: { name: string; '평균 점수': number; }[];
        schedule: { time: string; event: string; }[];
    }
    students: Student[];
    classes: Class[];
    teachers: Teacher[];
}

const COLORS = ['#E5A823', '#F2C94C', '#F2994A', '#EB5757', '#6FCF97', '#56CCF2', '#BB6BD9'];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ dashboardData, students, classes, teachers }) => {

    const gradeDistributionData = useMemo(() => {
        if (!students) return [];
        const gradeCounts = students
            .filter(s => s.status === StudentStatus.ENROLLED)
            .reduce((acc, student) => {
                const grade = student.grade || '미지정';
                acc[grade] = (acc[grade] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(gradeCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [students]);
    
    const classDistributionData = useMemo(() => {
        if (!teachers || !classes) return [];
        
        return teachers
            .filter(t => t.role === 'teacher' || t.role === 'admin')
            .map(teacher => {
                const count = classes.filter(c => c.teacherId === teacher.id).length;
                return { name: teacher.name, '담당 반 개수': count };
            })
            .filter(data => data['담당 반 개수'] > 0)
            .sort((a, b) => b['담당 반 개수'] - a['담당 반 개수']);
    }, [teachers, classes]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">헤라매쓰 대시보드</h1>
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                <Card className="lg:col-span-1 flex flex-col justify-center items-center">
                    <h4 className="text-gray-400 text-lg">총 재원생</h4>
                    <p className="text-5xl font-bold text-[#E5A823] mt-2">{dashboardData.totalStudents}</p>
                </Card>
                <Card className="lg:col-span-1 flex flex-col justify-center items-center">
                    <h4 className="text-gray-400 text-lg">상담/대기</h4>
                    <p className="text-5xl font-bold text-white mt-2">{dashboardData.consultingStudents}</p>
                </Card>
                <Card title="오늘 출결 현황" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={120}>
                         <PieChart>
                            <Pie data={dashboardData.attendanceToday} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} label>
                                {dashboardData.attendanceToday.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1A3A32', border: '1px solid #4b5563' }} />
                            <Legend wrapperStyle={{ fontSize: '12px' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="학년별 재원생 분포" className="lg:col-span-2">
                     <ResponsiveContainer width="100%" height={120}>
                        <PieChart>
                            <Pie data={gradeDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} labelLine={false} label={renderCustomizedLabel}>
                                {gradeDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1A3A32', border: '1px solid #4b5563' }} />
                            <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '12px', lineHeight: '14px' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="최근 5개월 평균 점수 추이" className="lg:col-span-3">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={dashboardData.scoreTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize="12px" />
                            <YAxis stroke="#9ca3af" fontSize="12px" />
                            <Tooltip contentStyle={{ backgroundColor: '#1A3A32', border: '1px solid #4b5563' }} />
                            <Legend />
                            <Line type="monotone" dataKey="평균 점수" stroke="#E5A823" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
                 <Card title="강사별 담당 반 현황" className="lg:col-span-3">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={classDistributionData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize="12px" />
                            <YAxis allowDecimals={false} stroke="#9ca3af" fontSize="12px" />
                            <Tooltip contentStyle={{ backgroundColor: '#1A3A32', border: '1px solid #4b5563' }} />
                            <Legend />
                            <Bar dataKey="담당 반 개수" fill="#E5A823" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="오늘 학원 일정" className="lg:col-span-6">
                    <div className="space-y-4">
                        {dashboardData.schedule.map((item, index) => (
                             <div key={index} className="flex items-center">
                                <span className="w-24 font-bold text-[#E5A823]">{item.time}</span>
                                <span className="text-gray-300">{item.event}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default Dashboard;