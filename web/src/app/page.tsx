import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <main className="text-center space-y-6 max-w-2xl">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary">
            Health & Supplement <br /> Advisor
          </h1>
          <p className="text-xl text-muted-foreground">
            나에게 딱 맞는 영양제, AI가 똑똑하게 찾아드립니다.
          </p>
        </div>

        <div className="p-8 bg-card rounded-xl shadow-lg border border-border">
          <p className="mb-6 text-card-foreground">
            지금 바로 건강 자가 진단을 시작하고<br />
            당신만을 위한 맞춤형 건강 리포트를 받아보세요.
          </p>
          <Link href="/survey">
            <Button size="lg" className="px-8 text-lg font-semibold">
              무료 진단 시작하기
            </Button>
          </Link>
        </div>
      </main>

      <footer className="mt-16 text-sm text-gray-500">
        © 2026 Health Advisor. All rights reserved.
      </footer>
    </div>
  )
}
