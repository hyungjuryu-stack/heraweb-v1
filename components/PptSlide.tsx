
import React from 'react';

interface PptSlideProps {
    title: string;
    description: string;
    mockup: React.ReactNode;
    pageNumber: number;
    totalPages: number;
}

const PptSlide: React.FC<PptSlideProps> = ({ title, description, mockup, pageNumber, totalPages }) => {
    return (
        <div style={{
            width: '1280px',
            height: '720px',
            backgroundColor: '#0d211c',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'sans-serif',
            padding: '40px',
            boxSizing: 'border-box'
        }}>
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #E5A823', paddingBottom: '15px', flexShrink: 0 }}>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#E5A823' }}>헤라매쓰 사용설명서</h1>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold' }}>{pageNumber}. {title}</h2>
            </header>
            
            {/* Body */}
            <main style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px', flexGrow: 1, paddingTop: '30px', overflow: 'hidden' }}>
                <div style={{ fontSize: '16px', lineHeight: 1.6, color: '#E0E0E0', whiteSpace: 'pre-wrap' }}>
                    {description}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {mockup}
                </div>
            </main>

            {/* Footer */}
            <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', marginTop: 'auto', flexShrink: 0, fontSize: '14px', color: '#AAAAAA' }}>
                <span>Hera Math Academy Management System</span>
                <span>{pageNumber} / {totalPages}</span>
            </footer>
        </div>
    );
};

export default PptSlide;
