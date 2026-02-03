import { SurveyValues } from "./schemas/survey"

export interface Supplement {
    id: string
    name: string
    description: string
    tags: string[]
    matchReason?: string
    priority?: number // 내부 로직용 우선순위
    searchKeyword?: string // 식품안전나라/MFDS 검색용 키워드
}

// 영양제 데이터베이스 확장
export const SUPPLEMENTS_DB: Supplement[] = [
    {
        id: "magnesium",
        name: "마그네슘",
        description: "신경 안정, 근육 이완, 수면 질 개선에 도움을 줍니다. 눈 떨림이나 스트레스가 많을 때 효과적입니다.",
        tags: ["눈 떨림", "수면", "스트레스", "근육"],
        searchKeyword: "마그네슘",
    },
    {
        id: "vitamin_b_complex",
        name: "비타민 B 컴플렉스",
        description: "에너지 생성과 피로 회복에 필수적인 고함량 비타민입니다. 만성 피로와 구내염에 좋습니다.",
        tags: ["만성 피로", "활력", "에너지"],
        searchKeyword: "비타민B",
    },
    {
        id: "omega3",
        name: "오메가-3 (rTG)",
        description: "혈행 개선과 건조한 눈 관리에 필수입니다. 중성지방 수치를 낮추는 데도 도움을 줍니다.",
        tags: ["혈액 순환", "눈 건조", "두뇌"],
        searchKeyword: "EPA 및 DHA",
    },
    {
        id: "vitamin_d",
        name: "비타민 D3",
        description: "현대인의 필수 영양소로 뼈 건강, 면역력 증진, 우울감 완화에 관여합니다.",
        tags: ["뼈 건강", "면역", "실내 활동"],
        searchKeyword: "비타민D",
    },
    {
        id: "milk_thistle",
        name: "밀크씨슬",
        description: "간 세포 보호를 도와 피로 회복과 음주 전후 간 건강 관리에 좋습니다.",
        tags: ["간 건강", "숙취", "피로"],
        searchKeyword: "밀크씨슬",
    },
    {
        id: "probiotics",
        name: "프로바이오틱스 (유산균)",
        description: "장 건강은 면역력의 핵심입니다. 배변 활동 원활 및 소화기 불편감을 완화합니다.",
        tags: ["장 건강", "소화", "가스", "면역"],
        searchKeyword: "프로바이오틱스",
    },
    {
        id: "vitamin_c",
        name: "비타민 C",
        description: "항산화 작용과 면역 기능 유지에 필요하며, 콜라겐 형성을 돕습니다.",
        tags: ["면역", "피부", "항산화"],
        searchKeyword: "비타민C",
    },
    {
        id: "zinc",
        name: "아연",
        description: "정상적인 면역 기능과 세포 분열에 필요합니다. 남성 활력 및 손톱 건강에도 관여합니다.",
        tags: ["면역", "손톱", "남성 활력"],
        searchKeyword: "아연",
    },
    {
        id: "l_theanine",
        name: "L-테아닌",
        description: "스트레스로 인한 긴장 완화에 도움을 주어 마음을 차분하게 해줍니다.",
        tags: ["스트레스", "수면", "이완"],
        searchKeyword: "테아닌",
    },
    {
        id: "biotin",
        name: "비오틴",
        description: "모발과 손톱의 구성 성분인 케라틴 합성을 돕습니다.",
        tags: ["탈모", "손톱", "피부"],
        searchKeyword: "비오틴",
    },
    {
        id: "msm",
        name: "MSM (식이유황)",
        description: "관절 및 연골 건강에 도움을 줄 수 있으며 통증 완화에 기여합니다.",
        tags: ["관절", "통증", "연골"],
        searchKeyword: "엠에스엠",
    },
    {
        id: "coq10",
        name: "코엔자임 Q10",
        description: "항산화 및 높은 혈압 감소에 도움을 줄 수 있으며, 심장 에너지 생성에 관여합니다.",
        tags: ["항산화", "혈압", "활력"],
        searchKeyword: "코엔자임Q10",
    },
]

export function calculateHealthScore(data: SurveyValues): number {
    let score = 100

    // 1. 수면 (최대 -15)
    if (data.lifestyle.sleepTime === "less_5") score -= 10
    else if (data.lifestyle.sleepTime === "5_7") score -= 5
    if (data.lifestyle.sleepQuality !== "good") score -= (data.lifestyle.sleepQuality === "poor" ? 7 : 3)

    // 2. 식습관 (최대 -20, 상세 항목 반영)
    if (data.lifestyle.dietQuality === "fastfood") score -= 10
    else if (data.lifestyle.dietQuality === "irregular") score -= 5

    if (data.lifestyle.dietVeg === "rare") score -= 5
    if (data.lifestyle.dietFish === "rare") score -= 3
    if (data.lifestyle.dietProtein === "rare") score -= 3

    // 3. 운동 및 스트레스
    if (data.lifestyle.exerciseFrequency === "none") score -= 10
    if (data.lifestyle.stressLevel === "high") score -= 10
    else if (data.lifestyle.stressLevel === "medium") score -= 5

    // 4. 증상 감점
    score -= (data.symptoms.length * 3)

    return Math.max(0, score)
}

export function getRecommendations(data: SurveyValues): Supplement[] {
    // 내부적으로 사용할 추천 후보 리스트 (점수제)
    const candidates = new Map<string, { item: Supplement, score: number, reasons: string[] }>()

    const addScore = (id: string, score: number, reason: string) => {
        const item = SUPPLEMENTS_DB.find(s => s.id === id)
        if (!item) return

        const current = candidates.get(id) || { item, score: 0, reasons: [] }
        current.score += score
        if (!current.reasons.includes(reason)) current.reasons.push(reason)
        candidates.set(id, current)
    }

    // --- 1단계: 증상 및 라이프스타일 기반 매핑 (Candidate Selection) ---
    const symptoms = new Set(data.symptoms)

    // 눈 떨림 -> 마그네슘
    if (symptoms.has("eye_tremor")) addScore("magnesium", 10, "눈 떨림 증상 케어")

    // 만성 피로 -> 비타민 B군, 마그네슘, 밀크씨슬(간)
    if (symptoms.has("fatigue")) {
        addScore("vitamin_b_complex", 10, "만성 피로 회복")
        addScore("milk_thistle", 5, "피로 누적 관리")
    }

    // 수면/스트레스 -> 마그네슘, 테아닌
    if (symptoms.has("insomnia") || data.lifestyle.sleepQuality === "poor") {
        addScore("magnesium", 5, "수면 질 개선")
        addScore("l_theanine", 3, "수면을 위한 이완")
    }
    if (data.lifestyle.stressLevel === "high") {
        addScore("magnesium", 5, "스트레스 완화")
        addScore("l_theanine", 8, "긴장 완화")
    }

    // 소화/장 -> 유산균
    if (symptoms.has("indigestion")) addScore("probiotics", 10, "소화 불량 및 가스 개선")

    // 탈모/손톱 -> 비오틴, 아연
    if (symptoms.has("hair_loss")) {
        addScore("biotin", 10, "모발/손톱 건강 케어")
        addScore("zinc", 5, "세포 분열 및 조직 건강")
    }

    // 관절 -> MSM, 비타민 D
    if (symptoms.has("joint_pain")) {
        addScore("msm", 10, "관절 통증 및 불편감 완화")
        addScore("vitamin_d", 3, "뼈 건강 유지")
    }

    // 면역/감기 -> 비타민 C, 아연, 비타민 D
    if (symptoms.has("cold")) {
        addScore("vitamin_c", 8, "면역력 강화")
        addScore("zinc", 8, "정상적인 면역 기능")
        addScore("vitamin_d", 5, "기초 면역 형성")
    }

    // 혈행/건조 -> 오메가3
    if (symptoms.has("skin_trouble")) addScore("omega3", 3, "건조한 피부 개선")

    // 기본 추천 (연령/성별 베이스)
    addScore("vitamin_d", 3, "현대인 필수 기초 영양소")
    addScore("omega3", 3, "혈행 건강 기초")


    // --- 2단계: 식습관 갭(Gap) 분석 (Verification/Subtraction) ---

    // 생선을 자주 먹으면 오메가3 필요성 낮춤
    if (data.lifestyle.dietFish === "frequent") {
        const omega = candidates.get("omega3")
        if (omega) omega.score -= 5 // 점수 대폭 삭감
    } else if (data.lifestyle.dietFish === "rare") {
        addScore("omega3", 5, "식단 내 생선 섭취 부족") // 점수 추가
    }

    // 채소/과일 잘 먹으면 비타민 C/식이섬유 필요성 낮춤
    if (data.lifestyle.dietVeg === "frequent") {
        const vitC = candidates.get("vitamin_c")
        if (vitC) vitC.score -= 4
    } else if (data.lifestyle.dietVeg === "rare") {
        addScore("vitamin_c", 5, "채소/과일 섭취 부족")
        addScore("probiotics", 3, "식이섬유 부족 보완")
    }

    // 고기/단백질 부족 -> 아연, 비타민 B군 필요성 증가
    if (data.lifestyle.dietProtein === "rare") {
        addScore("zinc", 5, "단백질원 섭취 부족")
        addScore("vitamin_b_complex", 3, "에너지원 섭취 부족")
    }

    // 인스턴트/배달 위주 -> 마그네슘, 유산균 필수
    if (data.lifestyle.dietQuality === "fastfood") {
        addScore("magnesium", 5, "나트륨 배출 및 미네랄 보충")
        addScore("probiotics", 5, "장내 환경 개선 시급")
    }


    // --- 3단계: 개인 특성 필터링 (Safety & Life Cycle Filtering) ---

    // 고혈압 -> 코큐텐 추천, (여기서는 나트륨 이슈가 있는 발포비타민은 없으므로 제외 로직은 생략하거나 경고 메시지 추가)
    if (data.basicInfo.conditions?.includes("hypertension")) {
        addScore("coq10", 8, "높은 혈압 감소에 도움")
    }

    // 당뇨 -> 혈당 관련 (현재 DB엔 없음, 추후 바나바잎 등 추가 가능)

    // 4단계: 우선순위 결정 및 정렬 (Final Decision)
    const sortedDetails = Array.from(candidates.values())
        .filter(c => c.score > 0) // 점수가 양수인 것만
        .sort((a, b) => b.score - a.score) // 점수 내림차순

    // 상위 N개 선정 (최대 4개 + 점수가 아주 높으면 추가)
    // 혹은 절대 점수 기준으로 cutoff
    const finalRecommendations: Supplement[] = sortedDetails
        .slice(0, 4)
        .map(c => ({
            ...c.item,
            matchReason: c.reasons[0] + (c.reasons.length > 1 ? ` 외 ${c.reasons.length - 1}건` : "")
        }))

    return finalRecommendations
}

export interface Product {
    name: string
    brand: string
    priceEstimate: string
    features: string[]
}

export const PRODUCT_RECOMMENDATIONS: Record<string, Product[]> = {
    "magnesium": [
        { name: "블루보넷 킬레이트 마그네슘", brand: "Bluebonnet", priceEstimate: "3만원대", features: ["높은 흡수율", "속 편함"] },
        { name: "닥터스베스트 고흡수 마그네슘", brand: "Doctor's Best", priceEstimate: "2만원대", features: ["가성비", "알약 큼"] },
    ],
    "vitamin_b_complex": [
        { name: "쏜리서치 베이직 B 콤플렉스", brand: "Thorne Research", priceEstimate: "3만원대", features: ["활성형 비타민", "고품질"] },
        { name: "라이프익스텐션 바이오액티브 B", brand: "Life Extension", priceEstimate: "1만원대", features: ["가성비", "광범위 성분"] },
    ],
    "omega3": [
        { name: "스포츠리서치 오메가3 트리플 스트렝스", brand: "Sports Research", priceEstimate: "4만원대", features: ["IFOS 5스타", "rTG형"] },
        { name: "노르딕내츄럴스 얼티밋 오메가", brand: "Nordic Naturals", priceEstimate: "5만원대", features: ["레몬향", "최고급 원료"] },
    ],
    "vitamin_d": [
        { name: "나우푸드 비타민 D-3 2000 IU", brand: "Now Foods", priceEstimate: "1만원 미만", features: ["초가성비", "작은 캡슐"] },
        { name: "닥터스베스트 비타민 D3", brand: "Doctor's Best", priceEstimate: "1만원대", features: ["검증된 원료", "높은 함량"] },
    ],
    "milk_thistle": [
        { name: "캘리포니아 골드 뉴트리션 실리마린", brand: "CGN", priceEstimate: "1만원대", features: ["밀크씨슬 추출물", "가성비"] },
        { name: "나우푸드 실리마린 밀크시슬", brand: "Now Foods", priceEstimate: "1만원대", features: ["스테디셀러", "강황 포함"] },
    ],
    "probiotics": [
        { name: "가든오브라이프 닥터 포뮬레이티드", brand: "Garden of Life", priceEstimate: "4만원대", features: ["균주 다양성", "냉장 배송 추천"] },
        { name: "락토비프 프로바이오틱스", brand: "CGN", priceEstimate: "1만원대", features: ["개별 포장", "가성비 갑"] },
    ],
    "vitamin_c": [
        { name: "고려은단 비타민C 1000", brand: "고려은단", priceEstimate: "1만원대", features: ["국민 비타민", "영국산 원료"] },
        { name: "나우푸드 C-1000", brand: "Now Foods", priceEstimate: "1만원대", features: ["로즈힙 함유", "대용량"] },
    ],
    "zinc": [
        { name: "나우푸드 L-옵티진크", brand: "Now Foods", priceEstimate: "1만원 미만", features: ["흡수율 좋음", "구리 포함"] },
        { name: "솔가 킬레이트 아연", brand: "Solgar", priceEstimate: "1만원대", features: ["프리미엄 브랜드", "속 편함"] },
    ],
    "l_theanine": [
        { name: "나우푸드 L-테아닌 200mg", brand: "Now Foods", priceEstimate: "1만원대", features: ["이노시톨 포함", "긴장 완화"] },
        { name: "스포츠리서치 테아닌", brand: "Sports Research", priceEstimate: "2만원대", features: ["코코넛 오일 함유", "순도 높음"] },
    ],
    "biotin": [
        { name: "나우푸드 비오틴 5000mcg", brand: "Now Foods", priceEstimate: "1만원 미만", features: ["고함량", "가성비"] },
        { name: "솔가 비오틴", brand: "Solgar", priceEstimate: "2만원대", features: ["작은 캡슐", "신뢰도 높음"] },
    ],
    "msm": [
        { name: "닥터스베스트 MSM", brand: "Doctor's Best", priceEstimate: "1만원대", features: ["OptiMSM 원료", "관절 건강"] },
        { name: "재로우 포뮬라스 MSM", brand: "Jarrow Formulas", priceEstimate: "1만원대", features: ["파우더/캡슐", "순도 높음"] },
    ],
    "coq10": [
        { name: "닥터스베스트 코큐텐", brand: "Doctor's Best", priceEstimate: "2만원대", features: ["바이오페린 함유", "흡수율 UP"] },
        { name: "라이프익스텐션 슈퍼 유비퀴놀", brand: "Life Extension", priceEstimate: "4만원대", features: ["활성형(유비퀴놀)", "고효율"] },
    ],
}
