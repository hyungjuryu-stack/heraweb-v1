import React from 'react';
import type { MonthlyReport, Student } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface ReportPDFProps {
  report: MonthlyReport;
  student: Student;
  teacherName: string | null;
}

const ReportPDF: React.FC<ReportPDFProps> = ({ report, student, teacherName }) => {
  const styles = {
    page: {
      width: '210mm',
      minHeight: '297mm',
      padding: '20mm',
      backgroundColor: 'white',
      color: '#333',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box' as const,
    },
    header: {
      textAlign: 'center' as const,
      borderBottom: '2px solid #E5A823',
      paddingBottom: '10px',
      marginBottom: '20px',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold' as const,
      color: '#0d211c',
      margin: 0,
    },
    subtitle: {
      fontSize: '14px',
      color: '#555',
      margin: '5px 0 0 0',
    },
    section: {
      marginBottom: '25px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold' as const,
      color: '#0d211c',
      borderBottom: '1px solid #ddd',
      paddingBottom: '5px',
      marginBottom: '15px',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px 20px',
      fontSize: '14px',
    },
    infoItem: {
      display: 'flex',
    },
    infoLabel: {
      fontWeight: 'bold' as const,
      width: '100px',
      color: '#555',
    },
    infoValue: {
      color: '#333',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
        textAlign: 'center' as const,
        marginTop: '20px',
    },
    statBox: {
        padding: '15px',
        border: '1px solid #eee',
        borderRadius: '8px',
    },
    statLabel: {
        fontSize: '14px',
        color: '#555',
        marginBottom: '5px',
    },
    statValue: {
        fontSize: '24px',
        fontWeight: 'bold' as const,
        color: '#E5A823',
    },
    reviewBox: {
        fontSize: '14px',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap' as const,
        backgroundColor: '#f9f9f9',
        border: '1px solid #eee',
        borderRadius: '8px',
        padding: '15px',
        minHeight: '150px'
    },
    footer: {
      marginTop: '30px',
      paddingTop: '10px',
      borderTop: '1px solid #ddd',
      textAlign: 'right' as const,
      fontSize: '12px',
      color: '#777',
      fontWeight: 'bold' as const,
    }
  };

  const chartData = [
    { subject: '평균 점수', value: report.avgScore, fullMark: 100 },
    { subject: '수업 태도', value: report.attitudeRate, fullMark: 100 },
    { subject: '출석률', value: report.attendanceRate, fullMark: 100 },
    { subject: '과제 수행률', value: report.homeworkRate, fullMark: 100 },
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>월간 학습 리포트</h1>
        <p style={styles.subtitle}>Hera Math Academy Monthly Learning Report</p>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>학생 정보</h2>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}><span style={styles.infoLabel}>이름</span> <span style={styles.infoValue}>{student.name}</span></div>
          <div style={styles.infoItem}><span style={styles.infoLabel}>리포트 기간</span> <span style={styles.infoValue}>{report.period}</span></div>
          <div style={styles.infoItem}><span style={styles.infoLabel}>학교</span> <span style={styles.infoValue}>{student.school} ({student.grade})</span></div>
          <div style={styles.infoItem}><span style={styles.infoLabel}>담당 강사</span> <span style={styles.infoValue}>{teacherName || '-'}</span></div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>학습 현황 요약</h2>
        <div style={{ width: '100%', height: '220px', margin: '0 auto' }}>
            <ResponsiveContainer width="100%" height="100%">
                {/* Fix: Removed isAnimationActive from RadarChart as it's not a valid prop here. It is correctly on the Radar component. */}
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid gridType="circle" />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name={student.name} dataKey="value" stroke="#E5A823" fill="#E5A823" fillOpacity={0.6} isAnimationActive={false} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
        <div style={styles.statsGrid}>
            <div style={styles.statBox}>
                <p style={styles.statLabel}>평균 점수</p>
                <p style={styles.statValue}>{report.avgScore}점</p>
            </div>
             <div style={styles.statBox}>
                <p style={styles.statLabel}>수업 태도</p>
                <p style={styles.statValue}>{report.attitudeRate}점</p>
            </div>
            <div style={styles.statBox}>
                <p style={styles.statLabel}>출석률</p>
                <p style={styles.statValue}>{report.attendanceRate}%</p>
            </div>
            <div style={styles.statBox}>
                <p style={styles.statLabel}>과제 수행률</p>
                <p style={styles.statValue}>{report.homeworkRate}%</p>
            </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>선생님 종합 리뷰</h2>
        <div style={styles.reviewBox}>
          {report.reviewText}
        </div>
      </section>
      
      <footer style={styles.footer}>
        헤라매쓰 수학학원 (Hera Math Academy)
      </footer>
    </div>
  );
};

export default ReportPDF;
