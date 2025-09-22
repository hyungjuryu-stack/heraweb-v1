import { GoogleGenAI, Type } from "@google/genai";
import type { Student, GeneratedTest, LessonRecord, MonthlyReport, TrendAnalysis } from '../types';

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

const trendAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        overallTrend: { 
            type: Type.STRING, 
            description: '학생의 여러 리포트에 걸친 전반적인 학습 추세를 한두 문장으로 요약합니다. (예: "꾸준한 상승세를 보였으나 최근 주춤하는 경향이 있습니다.")' 
        },
        keyStrengths: { 
            type: Type.STRING, 
            description: '분석 기간 동안 꾸준히 강점으로 나타난 부분에 대해 구체적인 데이터(예: 과목, 점수대)를 근거로 서술합니다.' 
        },
        areasForGrowth: { 
            type: Type.STRING, 
            description: '점수가 하락했거나, 다른 지표에 비해 꾸준히 낮은 성취도를 보이는 약점 및 개선이 필요한 부분을 구체적인 데이터를 근거로 서술합니다.' 
        },
        recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '분석된 강점과 약점을 바탕으로, 학생에게 도움이 될 만한 2-3가지의 구체적이고 실행 가능한 맞춤 학습 전략 또는 지도 방안을 제안합니다.'
        }
    },
    required: ["overallTrend", "keyStrengths", "areasForGrowth", "recommendations"]
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


export const generateStudentReview = async (student: Student & { attitudeRate: number, selfDirectedLearningRate: number }, studentRecords: LessonRecord[], teacherName: string | null, trendAnalysis: TrendAnalysis | null): Promise<string> => {
  try {
    const recordsSummary = studentRecords.length > 0
      ? `해당 기간의 전체 수업 기록:\n` + studentRecords.map(r => {
          const tests = [r.testScore1, r.testScore2, r.testScore3].filter(Boolean).join(', ');
          const textbooks = [r.main_textbook, r.supplementary_textbook, r.reinforcement_textbook].filter(Boolean).join(' / ');
          return `- ${r.date}: 출석(${r.attendance}), 태도(${r.attitude}), 과제(${r.homework}), 자기주도(${r.selfDirectedLearning})`
            + (tests ? `, 테스트(${tests})` : '')
            + (textbooks ? `, 교재(${textbooks})` : '')
            + (r.notes ? `, 노트: ${r.notes}` : '')
            + (r.requested_test ? `, 요청사항(${r.requested_test})` : '');
        }).join('\n')
      : "해당 기간의 수업 기록이 없습니다.";

    const trendAnalysisSummary = trendAnalysis
      ? `
      **참고 자료 (장기 학습 트렌드 AI 분석 요약):**
      - 전체 추세: ${trendAnalysis.overallTrend}
      - 강점: ${trendAnalysis.keyStrengths}
      - 성장 영역: ${trendAnalysis.areasForGrowth}
      - 추천 전략: ${trendAnalysis.recommendations.join('; ')}
      `
      : "장기 학습 트렌드 분석 자료 없음.";

    const prompt = `
      **당신은 학생을 오랫동안 세심하게 지켜본, 경험 많고 자상한 수학 선생님입니다.** 학생의 학부모님께 보낼 월간 리포트 종합 리뷰를 작성해주세요.
      전문적이고 신뢰감 있으면서도, 따뜻하고 인간적인 어조를 사용해주세요. **AI가 작성한 것처럼 딱딱하거나 형식적인 문장이 아닌, 자연스럽고 진심이 담긴 글로 작성하는 것이 가장 중요합니다.**

      **학생 기본 정보:**
      - 학생 이름: ${student.name}
      - 학년: ${student.grade}
      - 담당 교사: ${teacherName ?? '미배정'}

      **분석할 정량 데이터 (기간 전체 요약):**
      - 평균 점수: ${student.avgScore}점
      - 출석률: ${student.attendanceRate}%
      - 과제 제출률: ${student.homeworkRate}%
      - 수업 태도 점수: ${student.attitudeRate}점
      - 자기주도 학습 점수: ${student.selfDirectedLearningRate}점

      **참고 자료 (기간 내 상세 기록):**
      - 진단 테스트 총평: ${student.diagnosticTestNotes || '없음'}
      - ${recordsSummary}

      ${trendAnalysisSummary}

      **작성 지침:**
      **0. (중요) 장기 추세 연계:** '장기 학습 트렌드' 분석 결과가 있다면, 월간 리뷰에 자연스럽게 반영해주세요. 예를 들어, "AI 장기 분석에서 나타난 것처럼, ${student.name} 학생은 꾸준한 상승세를 보이고 있으며, 이번 달에도 그 경향이 이어졌습니다." 와 같이 시작하면 좋습니다.
      
      **1. 학습 태도 및 성취도 (4-5문장):**
          - 따뜻한 인사말로 시작하여, 한 달간 학생의 전반적인 학습 태도와 분위기를 이야기하듯 풀어주세요.
          - 정량 데이터와 수업 기록을 엮어 학생의 **'성장 스토리'**를 들려주세요. 특히, **자기주도 학습 점수**가 높다면 스스로 문제를 해결하려는 의지가 강하다는 점을, 낮다면 동기 부여가 필요하다는 점을 언급해주세요. 예를 들어, "이번 달 ${student.name} 학생은 꾸준한 성실함으로 교과 과정을 잘 따라왔습니다. 특히 월초에 다소 어려워했던 '함수' 단원에서, 월말 평가 때는 모든 문제를 맞추며 눈에 띄는 성장을 이루어냈습니다." 와 같이 **시간의 흐름에 따른 변화**를 구체적으로 보여주세요.
          - 수업 기록을 인용할 때, '9월 15일 수업에서는 오답 노트를 꼼꼼하게 정리해오는 모습이 참 인상적이었습니다.' 와 같이 선생님이 직접 관찰한 듯한 느낌을 살려주세요.

      **2. 강점과 성장할 부분 (4-5문장):**
          - 학생이 가진 강점을 구체적인 단원이나 문제 유형을 예로 들어 칭찬해주세요. "연산 속도가 빠르고 정확하며, 특히 복잡한 방정식 풀이에서 강점을 보이고 있습니다."
          - '보완점'이나 '문제점'이라는 직접적인 표현 대신, **'앞으로 더 성장할 부분'**이라는 긍정적인 뉘앙스로 표현해주세요. "앞으로는 서술형 문제에서 자신의 생각을 논리적으로 풀어내는 연습에 집중한다면, 더욱 완성도 높은 학습이 이루어질 것입니다." 와 같이 부드럽게 제안해주세요.

      **3. 학원에서의 지도 계획 (2-3문장):**
          - 위에서 언급한 '성장할 부분'을 학원에서 어떻게 도울 것인지 구체적이고 실행 가능한 계획을 제시해주세요. 딱딱한 보고가 아닌, 학생을 위한 맞춤 계획을 설명하는 느낌으로 작성해주세요.
          - "다음 달에는 ${student.name} 학생과 함께 주 1회 서술형 문제 집중 클리닉을 진행하여, 풀이 과정 작성 능력을 향상시킬 계획입니다. 오답 노트를 더욱 효과적으로 활용하는 방법에 대해서도 개별적으로 지도하겠습니다."

      **4. 가정에서의 격려 방안 (2-3문장):**
          - 학부모님과의 **'교육적 파트너십'**을 강조하며, 가정에서 실천할 수 있는 구체적인 방안을 제안해주세요.
          - "가정에서 ${student.name} 학생이 어려운 문제에 부딪혔을 때, 바로 답을 알려주시기보다 스스로 해결할 시간을 충분히 주시고 그 노력의 과정을 칭찬해주시면 아이의 자신감 향상에 큰 도움이 될 것입니다. 주말에 함께 서점을 방문하여 다양한 수학 관련 교양 서적을 접하게 해주시는 것도 수학적 흥미를 높이는 좋은 방법입니다."

      **최종 결과물:**
      - 위 항목들을 **소제목이나 번호 없이 하나의 완성된 글**로 자연스럽게 연결해주세요.
      - **분량은 이전보다 2배 이상**으로 풍부하고 상세하게 작성해주세요.
      - **가장 중요한 것은 '진심'입니다. AI가 아닌, 학생을 아끼는 선생님의 마음으로 작성해주세요.**
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

export const generateTrendAnalysis = async (student: Student, reports: MonthlyReport[]): Promise<TrendAnalysis> => {
    try {
        const reportSummary = reports
            .sort((a, b) => a.period.localeCompare(b.period)) // Sort reports chronologically
            .map(r => 
                `- ${r.period}: 평균 점수(${r.avgScore}점), 출석률(${r.attendanceRate}%), 과제 수행률(${r.homeworkRate}%), 수업 태도(${r.attitudeRate}점), 자기주도(${r.selfDirectedLearningRate}점)`
            ).join('\n');

        const prompt = `
            **당신은 데이터 기반 교육 컨설턴트입니다.** 여러 기간에 걸친 학생의 학습 데이터를 분석하여, 장기적인 학습 추세와 맞춤형 성장 전략을 제시하는 심층 분석 리포트를 작성해주세요.
            긍정적이고 건설적인 어조를 사용하되, 데이터에 기반한 객관적인 분석을 제공해야 합니다.

            **학생 기본 정보:**
            - 학생 이름: ${student.name}
            - 학년: ${student.grade}

            **분석할 장기 학습 데이터:**
            ${reportSummary}

            **분석 지침:**
            1.  **전체 추세 분석:** 제공된 모든 리포트 데이터를 종합하여 학생의 성취도가 상승세, 하락세, 또는 정체 상태인지 명확하게 요약해주세요. 변화의 변곡점이 있다면 그 시점을 언급해주세요.
            2.  **강점 및 약점 도출:** 일시적인 결과가 아닌, 여러 기간에 걸쳐 반복적으로 나타나는 강점과 약점을 찾아주세요. 예를 들어, '과제 수행률은 꾸준히 높지만, 평균 점수의 변동성이 크다' 와 같이 분석해주세요.
            3.  **맞춤형 추천 제공:** 분석 결과를 바탕으로, 학생의 강점을 강화하고 약점을 보완할 수 있는 구체적이고 실천 가능한 학습 전략을 2~3가지 제안해주세요. 추상적인 조언이 아닌, '특정 단원 오답 노트 강화', '주 1회 심화 문제 풀이 시간 확보' 등 명확한 액션 플랜을 제시해야 합니다.

            **출력 형식:**
            - 반드시 제공된 JSON 스키마 형식에 맞춰 응답을 생성해주세요.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: trendAnalysisSchema,
                temperature: 0.5,
            },
        });

        const jsonString = response.text.trim();
        const generatedContent = JSON.parse(jsonString);
        return generatedContent as TrendAnalysis;

    } catch (error) {
        console.error("Error generating trend analysis:", error);
        throw new Error("학습 트렌드 분석에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
};