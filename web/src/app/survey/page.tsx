import { SurveyForm } from "@/components/survey-form"

export default function SurveyPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">건강 상태 자가 진단</h1>
                <p className="text-muted-foreground text-lg">
                    몇 가지 질문을 통해 현재 건강 상태를 점검하고, 맞춤형 영양제를 추천해드립니다.
                </p>
            </div>
            <SurveyForm />
        </div>
    )
}
