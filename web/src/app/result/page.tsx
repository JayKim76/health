"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SurveyValues } from "@/lib/schemas/survey"
import { calculateHealthScore, getRecommendations, Supplement, PRODUCT_RECOMMENDATIONS } from "@/lib/recommendation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts"

export default function ResultPage() {
    const router = useRouter()
    const [score, setScore] = useState<number | null>(null)
    const [recommendations, setRecommendations] = useState<Supplement[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // sessionStorage에서 데이터 로드
        const savedData = sessionStorage.getItem("surveyData")
        if (!savedData) {
            alert("설문 데이터가 없습니다. 다시 진행해주세요.")
            router.push("/survey")
            return
        }

        try {
            const parsedData: SurveyValues = JSON.parse(savedData)
            const calculatedScore = calculateHealthScore(parsedData)
            const recs = getRecommendations(parsedData)

            setScore(calculatedScore)
            setRecommendations(recs)
        } catch (error) {
            console.error("데이터 처리 중 오류:", error)
            alert("데이터를 불러오는 중 문제가 발생했습니다.")
            router.push("/survey")
        } finally {
            setIsLoading(false)
        }
    }, [router])

    if (isLoading || score === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl font-medium animate-pulse">결과 분석 중...</p>
            </div>
        )
    }

    // Chart Data
    const chartData = [
        { name: "Score", value: score },
        { name: "Remaining", value: 100 - score },
    ]
    const COLORS = ["hsl(var(--primary))", "hsl(var(--muted))"]

    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="text-center mb-10 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-primary">건강 분석 리포트</h1>
                <p className="text-muted-foreground text-lg">
                    회원님의 설문 결과를 바탕으로 분석된 건강 점수와 맞춤 솔루션입니다.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {/* 점수 섹션 */}
                <Card className="md:col-span-1 border-primary/20 shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <CardTitle>건강 점수</CardTitle>
                        <CardDescription>생활 습관 및 증상 기반</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                    <Label
                                        value={`${score}점`}
                                        position="center"
                                        className="fill-foreground text-3xl font-bold"
                                    />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* 요약 섹션 */}
                <Card className="md:col-span-2 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-xl">종합 평가</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-secondary/30 rounded-lg">
                            <p className="text-lg font-medium leading-relaxed">
                                {score >= 80 ? "관리를 매우 잘하고 계시네요! 🌟" :
                                    score >= 50 ? "조금만 더 신경 쓰면 좋아질 거예요. 💪" :
                                        "적극적인 관리가 필요합니다. 🏥"}
                            </p>
                            <p className="mt-2 text-muted-foreground">
                                현재 <strong>{recommendations.length}가지</strong> 주요 개선 포인트가 발견되었습니다.
                                아래 추천 영양성분을 통해 부족한 부분을 채워보세요.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 추천 리스트 섹션 */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold px-1">추천 영양 성분 TOP {recommendations.length}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendations.map((item) => (
                        <Card key={item.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary/60 overflow-hidden">
                            <CardHeader className="bg-secondary/10 pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl mb-1">{item.name}</CardTitle>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {item.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-background border rounded-full text-xs text-muted-foreground">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                {/* 추천 이유 */}
                                <div className="bg-primary/5 p-3 rounded-md">
                                    <p className="text-sm font-semibold text-primary/90 flex items-center gap-2">
                                        💡 추천 이유
                                    </p>
                                    <p className="text-sm mt-1">{item.matchReason}</p>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {item.description}
                                </p>

                                {/* 공식 DB 검색 링크 */}
                                <div className="pt-2 border-t mt-4">
                                    <p className="text-xs font-semibold text-muted-foreground mb-2">🛒 인증된 제품 찾기 (공식 DB)</p>
                                    <div className="flex flex-wrap gap-2">
                                        <a
                                            href={`https://www.foodsafetykorea.go.kr/portal/healthyfoodlife/searchHomeHF.do?searchKeyword=${item.searchKeyword}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs px-3 py-1.5 bg-background border rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1 group"
                                        >
                                            <span>🇰🇷 식품안전나라 (국내)</span>
                                            <span className="text-slate-400 group-hover:text-primary">↗</span>
                                        </a>
                                        <a
                                            href="https://impfood.mfds.go.kr/CFCCC01F01"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs px-3 py-1.5 bg-background border rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1 group"
                                        >
                                            <span>✈️ 수입식품정보마루 (해외)</span>
                                            <span className="text-slate-400 group-hover:text-primary">↗</span>
                                        </a>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1.5">
                                        * 위 사이트에서 <strong>'{item.searchKeyword}'</strong>(으)로 검색하여 식약처 인증 마크를 확인하세요.
                                    </p>
                                </div>

                                {/* 실제 제품 추천 (브랜드 예시) */}
                                {PRODUCT_RECOMMENDATIONS[item.id] && (
                                    <div className="pt-2 border-t mt-4">
                                        <p className="text-xs font-semibold text-muted-foreground mb-2">🏆 인기/가성비 제품 예시</p>
                                        <div className="space-y-2">
                                            {PRODUCT_RECOMMENDATIONS[item.id].map((product, idx) => (
                                                <div key={idx} className="bg-secondary/10 p-2 rounded-md text-sm">
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-medium text-slate-800">{product.name}</span>
                                                        <span className="text-xs font-bold text-primary">{product.priceEstimate}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                                                    <div className="flex gap-1">
                                                        {product.features.map(f => (
                                                            <span key={f} className="text-[10px] px-1.5 py-0.5 bg-white border rounded text-slate-500">
                                                                {f}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    {recommendations.length === 0 && (
                        <div className="col-span-full text-center py-10 bg-secondary/10 rounded-xl">
                            <p className="text-lg text-muted-foreground">
                                특별히 부족한 부분이 발견되지 않았습니다. 현재 건강 상태를 잘 유지하세요! 🎉
                            </p>
                        </div>
                    )}
                </div>
            </div >

            <div className="mt-16 text-center">
                <Button size="lg" variant="outline" onClick={() => router.push("/survey")}>
                    다시 진단하기
                </Button>
            </div>
        </div >
    )
}
