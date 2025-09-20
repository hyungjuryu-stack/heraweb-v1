
import React from 'react';
import Card from '../components/ui/Card';
import { useMockData } from '../hooks/useMockData';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const Dashboard: React.FC = () => {
    const { dashboardData } = useMockData();

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">헤라매쓰 대시보드</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="flex flex-col justify-center items-center">
                    <h4 className="text-gray-400 text-lg">총 재원생</h4>
                    <p className="text-5xl font-bold text-[#E5A823] mt-2">{dashboardData.totalStudents}</p>
                </Card>
                <Card className="flex flex-col justify-center items-center">
                    <h4 className="text-gray-400 text-lg">상담/대기</h4>
                    <p className="text-5xl font-bold text-white mt-2">{dashboardData.consultingStudents}</p>
                </Card>
                <Card title="오늘 출결 현황" className="col-span-1 md:col-span-2">
                    <ResponsiveContainer width="100%" height={100}>
                         <PieChart>
                            <Pie data={dashboardData.attendanceToday} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} label>
                                {dashboardData.attendanceToday.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1A3A32', border: '1px solid #4b5563' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="최근 5개월 평균 점수 추이" className="col-span-1 md:col-span-2">
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={dashboardData.scoreTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: '#1A3A32', border: '1px solid #4b5563' }} />
                            <Legend />
                            <Line type="monotone" dataKey="평균 점수" stroke="#E5A823" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
                 <Card title="오늘 학원 일정" className="col-span-1 md:col-span-2">
                    <div className="space-y-4">
                        {dashboardData.schedule.map((item, index) => (
                             <div key={index} className="flex items-center">
                                <span className="w-20 font-bold text-[#E5A823]">{item.time}</span>
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
