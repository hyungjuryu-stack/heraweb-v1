import { GoogleGenAI, Type } from "@google/genai";
import type { Student, GeneratedTest, LessonRecord } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder for environments where the key is not set.
  // In a real deployment, the key would be securely provided.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
  process.env.API_KEY = "YOUR_API_KEY_HERE";
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const testGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "시험지의 제목"
        },
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                        type: Type.STRING,
                        description: "문제 내용"
                    },
                    options: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        },
                        description: "객관식 문제의 선택지 (4개)"
                    },
                    answer: {
                        type: Type.STRING,
                        description: "문제의 정답"
                    },
                    type: {
                        type: Type.STRING,
                        description: "문제 유형 ('multiple-choice' 또는 'short-answer')"
                    }
                },
                required: ["question", "answer", "type"]
            }
        }
    },
    required: ["title", "questions"]
};


export const generateTest = async (grade: string, unit: string, numQuestions: number, difficulty: string): Promise<GeneratedTest> => {
  try {
    const prompt = `
      다음 조건에 맞는 수학 시험지를 생성해줘:
      - 학년: ${grade}
      - 단원: ${unit}
      - 문항 수: ${numQuestions}개 (객관식과 주관식 혼합)
      - 난이도: ${difficulty}
      - 각 문제에는 명확한 질문, 그리고 객관식의 경우 4개의 선택지가 있어야 해.
      - 정답을 명확하게 제공해야 해.
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: testGenerationSchema,
        temperature: 0.8,
      },
    });

    const jsonString = response.text.trim();
    const generatedContent = JSON.parse(jsonString);
    return generatedContent as GeneratedTest;

  } catch (error) {
    console.error("Error generating test:", error);
    throw new Error("시험지 생성에 실패했습니다. API 키와 요청을 확인해주세요.");
  }
};


export const generateStudentReview = async (student: Student, studentRecords: LessonRecord[], teacherName: string | null): Promise<string> => {
  try {
    const recordsSummary = studentRecords.length > 0
      ? `최근 수업 기록 요약:\n` + studentRecords.slice(-5).map(r => 
          `- ${r.date}: 출석(${r.attendance}), 태도(${r.attitude}), 과제(${r.homework}), 노트: ${r.notes || '없음'}`
        ).join('\n')
      : "최근 수업 기록이 없습니다.";

    const prompt = `
      다음 학생 데이터를 바탕으로 학부모님께 보낼 리포트 리뷰 문구를 전문적이고 긍정적인 톤으로 작성해줘. 개선이 필요한 부분은 부드럽게 표현해줘.

      **학생 기본 정보:**
      - 학생 이름: ${student.name}
      - 학년: ${student.grade}
      - 담당 교사: ${teacherName ?? '미배정'}

      **정량 데이터:**
      - 평균 점수: ${student.avgScore}점
      - 출석률: ${student.attendanceRate}%
      - 과제 제출률: ${student.homeworkRate}%

      **참고 자료:**
      - 진단 테스트 총평: ${student.diagnosticTestNotes || '없음'}
      - ${recordsSummary}

      위 모든 정보를 종합적으로 고려하여 학생의 현재 학습 상태를 분석하고, 강점과 보완점을 포함한 종합적인 리뷰를 3~4문장으로 작성해줘.
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text;

  } catch (error) {
    console.error("Error generating student review:", error);
    throw new Error("리뷰 생성에 실패했습니다.");
  }
};