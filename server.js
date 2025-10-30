// Hera Math Academy - Backend Server
// 이 파일을 실행하려면 Node.js가 설치되어 있어야 하며,
// 터미널에서 'npm install express cors' 명령어를 실행해야 합니다.
// 실행 명령어: node server.js

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001; // 프론트엔드와 다른 포트 사용

// 미들웨어 설정
app.use(cors()); // Cross-Origin Resource Sharing 허용
app.use(express.json()); // JSON 요청 본문 파싱

// --- 외부 메시징 서비스 연동 (시뮬레이션) ---
// 실제 운영 환경에서는 이 부분에 솔라피(Solapi), NHN Cloud 등 전문 업체의 SDK를 연동합니다.

/**
 * 카카오톡 알림톡 발송 시뮬레이션 함수 (1순위)
 * @param {object} recipient - { name, phone }
 * @param {string} message
 * @returns {Promise<boolean>} - 성공 여부
 */
const sendKakaoTalk = async (recipient, message) => {
  console.log(`[Kakao Alimtalk] ${recipient.name}(${recipient.phone})님에게 발송 시도...`);
  // 실제 API 호출 로직: 사전 승인된 템플릿과 함께 메시지 발송 요청
  // 시뮬레이션: 70% 확률로 성공, 30% 확률로 실패 (채널 차단, 카톡 미사용자 등)
  await new Promise(resolve => setTimeout(resolve, 150)); // 네트워크 딜레이 시뮬레이션
  const isSuccess = Math.random() < 0.7;
  if (isSuccess) {
    console.log(`[Kakao Alimtalk] ${recipient.name}님에게 발송 성공!`);
    return true;
  } else {
    console.log(`[Kakao Alimtalk] ${recipient.name}님에게 발송 실패.`);
    return false;
  }
};

/**
 * SMS/LMS 문자 발송 시뮬레이션 함수 (알림톡 실패 시 Fallback)
 * @param {object} recipient - { name, phone }
 * @param {string} message
 * @returns {Promise<boolean>} - 성공 여부
 */
const sendSms = async (recipient, message) => {
  console.log(`[SMS] ${recipient.name}(${recipient.phone})님에게 발송 시도...`);
  // 실제 API 호출 로직
  // 시뮬레이션: 95% 확률로 성공, 5% 확률로 실패 (네트워크 오류, 스팸 등)
  await new Promise(resolve => setTimeout(resolve, 100)); // 네트워크 딜레이 시뮬레이션
  const isSuccess = Math.random() < 0.95;
   if (isSuccess) {
    console.log(`[SMS] ${recipient.name}님에게 발송 성공!`);
    return true;
  } else {
    console.log(`[SMS] ${recipient.name}님에게 발송 실패.`);
    return false;
  }
};


// --- API 엔드포인트 ---

app.post('/api/send-message', async (req, res) => {
  const { message, recipients } = req.body;

  if (!message || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: '잘못된 요청입니다. 메시지와 수신자 목록을 확인해주세요.' });
  }

  console.log(`[API] 총 ${recipients.length}명에게 메시지 발송 요청을 받았습니다.`);
  
  const sentResults = [];

  for (const recipient of recipients) {
    // 1. (1순위) 카카오 알림톡을 먼저 시도합니다.
    const kakaoSuccess = await sendKakaoTalk(recipient, message);

    if (kakaoSuccess) {
      sentResults.push({ ...recipient, status: 'success_kakao' });
      continue; // 성공했으면 다음 수신자로 넘어감
    }

    // 2. (Fallback) 알림톡 실패 시, 일반 문자(SMS)로 자동 전환하여 재시도합니다.
    console.log(`[Fallback] ${recipient.name}님 알림톡 실패, SMS로 전환합니다.`);
    const smsSuccess = await sendSms(recipient, message);

    if (smsSuccess) {
      sentResults.push({ ...recipient, status: 'success_sms' });
    } else {
      sentResults.push({ ...recipient, status: 'failed' });
    }
  }

  console.log('[API] 모든 발송 작업 완료. 결과를 응답합니다.');
  res.status(200).json({ sentResults });
});


// 서버 시작
app.listen(PORT, () => {
  console.log(`Hera Math Academy 백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});