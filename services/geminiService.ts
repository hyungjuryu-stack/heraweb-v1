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
      다음 학생 데이터를 바탕으로 학부모님께 보낼 월간 리포트 종합 리뷰를 작성해줘. 실제 선생님이 작성하는 것처럼, 전문적이면서도 따뜻하고 안정감 있는 톤을 사용해줘.

      **학생 기본 정보:**
      - 학생 이름: ${student.name}
      - 학년: ${student.grade}
      - 담당 교사: ${teacherName ?? '미배정'}

      **분석할 정량 데이터:**
      - 평균 점수: ${student.avgScore}점
      - 출석률: ${student.attendanceRate}%
      - 과제 제출률: ${student.homeworkRate}%

      **참고 자료:**
      - 진단 테스트 총평: ${student.diagnosticTestNotes || '없음'}
      - ${recordsSummary}

      **작성 지침:**
      1.  **학습 태도 및 성취도 분석 (2-3문장):**
          - 정량 데이터를 바탕으로 학생의 학습 상태를 구체적으로 분석해줘. 예를 들어, "출석률이 100%로 매우 성실한 태도를 보여주고 있으며, 과제 수행률 또한 높아 학습 습관이 잘 형성되어 있습니다." 와 같이 구체적인 수치를 언급하며 칭찬해줘.
          - 평균 점수의 변화나 특정 테스트 결과가 있다면 긍정적으로 언급해줘.

      2.  **강점 및 보완점 (2-3문장):**
          - 수업 기록, 테스트 결과 등을 종합하여 학생의 강점(예: 특정 단원 이해도, 문제 해결 능력)과 보완이 필요한 점을 부드럽게 설명해줘.
          - "특히, 함수 단원에서 높은 이해도를 보이며 응용 문제 해결 능력이 뛰어납니다. 다만, 서술형 문제에서 풀이 과정을 생략하는 경향이 있어 이 부분을 보완하면 더욱 좋은 결과를 얻을 수 있을 것입니다." 와 같이 구체적인 예시를 들어줘.

      3.  **향후 학원 지도 계획 (1-2문장):**
          - 분석 내용을 바탕으로 학원에서 어떻게 학생을 지도할 것인지 구체적인 계획을 제시해줘.
          - 예: "다음 달부터는 서술형 문제 풀이 연습을 집중적으로 진행하고, 오답 노트 관리를 통해 약점을 보완해 나갈 계획입니다."

      4.  **가정 지도 방안 (1-2문장):**
          - 학부모님이 가정에서 학생을 어떻게 격려하고 도울 수 있는지 구체적인 조언을 추가해줘.
          - 예: "가정에서는 매일 30분씩 꾸준히 수학 문제를 푸는 습관을 유지할 수 있도록 격려해주시고, 풀이 과정을 꼼꼼히 쓰는 연습을 할 수 있도록 칭찬해주시면 큰 도움이 될 것입니다."

      위 4가지 항목을 모두 포함하여 전체적으로 자연스럽게 연결되는 하나의 완성된 리뷰 문구를 작성해줘.
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