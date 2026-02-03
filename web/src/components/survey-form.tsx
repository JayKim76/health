"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { surveySchema, SurveyValues, SYMPTOM_OPTIONS, CONDITION_OPTIONS } from "@/lib/schemas/survey"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function SurveyForm() {
    const [step, setStep] = useState(1)
    const form = useForm<SurveyValues>({
        resolver: zodResolver(surveySchema),
        defaultValues: {
            basicInfo: {
                conditions: [],
            },
            symptoms: [],
        },
        mode: "onChange", // 실시간 유효성 검사
    })

    // 각 단계별 유효성 검사 후 다음 단계로 이동
    const nextStep = async () => {
        let isValid = false
        if (step === 1) {
            isValid = await form.trigger("basicInfo")
        } else if (step === 2) {
            isValid = await form.trigger("lifestyle")
        }

        if (isValid) {
            setStep(step + 1)
        }
    }

    const prevStep = () => {
        setStep(step - 1)
    }

    const router = useRouter() // Add router

    function onSubmit(data: SurveyValues) {
        console.log("Submitting Survey Data:", data)
        sessionStorage.setItem("surveyData", JSON.stringify(data)) // 데이터 저장
        router.push("/result") // 결과 페이지로 이동
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>건강 상태 자가 진단 (Step {step}/3)</CardTitle>
                    <CardDescription>
                        {step === 1 && "기본적인 신체 정보를 알려주세요."}
                        {step === 2 && "평소 생활 습관을 체크합니다."}
                        {step === 3 && "현재 고민이 있는 증상을 모두 선택해주세요."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* --- STEP 1: Basic Info --- */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="basicInfo.age"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>나이</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="만 나이 입력" type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="basicInfo.gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>성별</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="성별 선택" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="male">남성</SelectItem>
                                                            <SelectItem value="female">여성</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="basicInfo.height"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>키 (cm)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="예: 175" type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="basicInfo.weight"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>몸무게 (kg)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="예: 65" type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="basicInfo.conditions"
                                        render={() => (
                                            <FormItem>
                                                <div className="mb-4">
                                                    <FormLabel className="text-base">기저질환 (해당 시 선택)</FormLabel>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {CONDITION_OPTIONS.map((item) => (
                                                        <FormField
                                                            key={item.id}
                                                            control={form.control}
                                                            name="basicInfo.conditions"
                                                            render={({ field }) => {
                                                                return (
                                                                    <FormItem
                                                                        key={item.id}
                                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                                    >
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(item.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                    return checked
                                                                                        ? field.onChange([...(field.value || []), item.id])
                                                                                        : field.onChange(
                                                                                            field.value?.filter(
                                                                                                (value) => value !== item.id
                                                                                            )
                                                                                        )
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal">
                                                                            {item.label}
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                )
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="basicInfo.medications"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>복용 중인 약물 (선택)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="예: 혈압약, 아스피린 등" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* --- STEP 2: Lifestyle --- */}
                            {step === 2 && (
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="lifestyle.sleepTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>평균 수면 시간</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="시간 선택" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="less_5">5시간 미만</SelectItem>
                                                        <SelectItem value="5_7">5~7시간</SelectItem>
                                                        <SelectItem value="7_9">7~9시간 (권장)</SelectItem>
                                                        <SelectItem value="more_9">9시간 이상</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="lifestyle.sleepQuality"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>수면의 질</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-col space-y-1"
                                                    >
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="good" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">개운하게 잘 잔다</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="fair" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">가끔 깬다</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="poor" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">자주 깨고 피곤하다</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="lifestyle.exerciseFrequency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>운동 빈도 (주)</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="빈도 선택" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">거의 안 함</SelectItem>
                                                        <SelectItem value="1-2">1~2회</SelectItem>
                                                        <SelectItem value="3-4">3~4회</SelectItem>
                                                        <SelectItem value="5+">5회 이상</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="lifestyle.dietQuality"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>식습관</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="식습관 선택" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="balanced">규칙적이고 균형 잡힘</SelectItem>
                                                        <SelectItem value="irregular">불규칙함</SelectItem>
                                                        <SelectItem value="fastfood">인스턴트/배달 위주</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="lifestyle.dietFish"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3 pt-2">
                                                <FormLabel>생선 섭취 빈도 (주간)</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-row space-x-4 space-y-0"
                                                    >
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="rare" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">거의 안 먹음</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="moderate" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">주 1~2회</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="frequent" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">주 3회 이상</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="lifestyle.dietVeg"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3 pt-2">
                                                <FormLabel>채소/과일 섭취</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-row space-x-4 space-y-0"
                                                    >
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="rare" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">거의 안 먹음</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="moderate" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">가끔 먹음</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="frequent" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">매일 섭취</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="lifestyle.dietProtein"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3 pt-2 pb-2">
                                                <FormLabel>고기/콩(단백질) 섭취</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-row space-x-4 space-y-0"
                                                    >
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="rare" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">부족함</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="moderate" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">보통</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="frequent" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">충분함</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="lifestyle.stressLevel"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>스트레스 수준</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        className="flex flex-row space-x-4 space-y-0"
                                                    >
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="low" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">낮음</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="medium" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">보통</FormLabel>
                                                        </FormItem>
                                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                                            <FormControl>
                                                                <RadioGroupItem value="high" />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">높음</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* --- STEP 3: Symptoms --- */}
                            {step === 3 && (
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="symptoms"
                                        render={() => (
                                            <FormItem>
                                                <div className="mb-4">
                                                    <FormLabel className="text-base">현재 고민되는 증상 (복수 선택 가능)</FormLabel>
                                                    <FormDescription>
                                                        해당하는 항목을 모두 선택해주세요. 추천 알고리즘에 반영됩니다.
                                                    </FormDescription>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {SYMPTOM_OPTIONS.map((item) => (
                                                        <FormField
                                                            key={item.id}
                                                            control={form.control}
                                                            name="symptoms"
                                                            render={({ field }) => {
                                                                return (
                                                                    <FormItem
                                                                        key={item.id}
                                                                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm"
                                                                    >
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(item.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                    return checked
                                                                                        ? field.onChange([...(field.value || []), item.id])
                                                                                        : field.onChange(
                                                                                            field.value?.filter(
                                                                                                (value) => value !== item.id
                                                                                            )
                                                                                        )
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal cursor-pointer w-full">
                                                                            {item.label}
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                )
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* --- Navigation Buttons --- */}
                            <div className="flex justify-between pt-4">
                                {step > 1 ? (
                                    <Button type="button" variant="outline" onClick={prevStep}>
                                        이전
                                    </Button>
                                ) : (
                                    <div></div> // Spacer
                                )}

                                {step < 3 ? (
                                    <Button type="button" onClick={nextStep}>
                                        다음
                                    </Button>
                                ) : (
                                    <Button type="submit">
                                        결과 보기
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
