import { z } from "zod"

export const surveySchema = z.object({
    // 1. 기본 정보
    basicInfo: z.object({
        age: z.string().min(1, { message: "나이를 입력해주세요." }),
        gender: z.enum(["male", "female"]),
        height: z.string().min(1, { message: "키를 입력해주세요." }),
        weight: z.string().min(1, { message: "몸무게를 입력해주세요." }),
        conditions: z.array(z.string()).optional(), // 기저질환 (checkbox)
        medications: z.string().optional(), // 복용 약물 (text)
    }),

    // 2. 라이프스타일
    lifestyle: z.object({
        sleepTime: z.string().min(1, { message: "수면 시간을 선택해주세요." }),
        sleepQuality: z.enum(["good", "fair", "poor"]),
        dietQuality: z.enum(["balanced", "irregular", "fastfood"]),
        dietFish: z.enum(["rare", "moderate", "frequent"]), // NEW: 오메가3
        dietVeg: z.enum(["rare", "moderate", "frequent"]), // NEW: 비타민/미네랄
        dietProtein: z.enum(["rare", "moderate", "frequent"]), // NEW: 아연/철분
        exerciseFrequency: z.enum(["none", "1-2", "3-4", "5+"]),
        stressLevel: z.enum(["low", "medium", "high"]),
    }),


    // 3. 자각 증상 (Multi-select)
    symptoms: z.array(z.string()).refine((value) => value.length > 0, {
        message: "최소한 하나의 관심 증상을 선택해주세요.",
    }),
})

export type SurveyValues = z.infer<typeof surveySchema>

// UI용 옵션 상수
export const SYMPTOM_OPTIONS = [
    { id: "eye_tremor", label: "눈 떨림" },
    { id: "fatigue", label: "만성 피로" },
    { id: "indigestion", label: "소화 불량/가스" },
    { id: "skin_trouble", label: "피부 트러블" },
    { id: "hair_loss", label: "탈모/손톱 깨짐" },
    { id: "joint_pain", label: "관절 통증" },
    { id: "insomnia", label: "불면증" },
    { id: "anxiety", label: "불안/초조" },
    { id: "cold", label: "잦은 감기/면역 저하" }, // NEW
]

export const CONDITION_OPTIONS = [
    { id: "hypertension", label: "고혈압" },
    { id: "diabetes", label: "당뇨" },
    { id: "allergy", label: "알레르기" },
    { id: "none", label: "없음" },
]
