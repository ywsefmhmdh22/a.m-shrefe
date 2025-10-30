 import * as React from "react";
// افترض أنك تستخدم مكتبة utility مثل 'clsx' أو 'tailwind-merge'
// لتكوين أسماء الكلاسات بطريقة آمنة وفعالة.
import { cn } from "../lib/utils";

// 💡 تم حذف الواجهة CardProps الفارغة وحل المشكلة
// واستبدالها بالنوع الموسع مباشرة في تعريف المكونات:

// 1. تعريف نوع الخصائص الموحد (الذي يوسع خصائص <div>)
type BaseCardProps = React.HTMLAttributes<HTMLDivElement>;


export function Card({ className, ...props }: BaseCardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-gray-800 bg-gray-900 text-white shadow-md",
                className
            )}
            {...props}
        />
    );
}

// 2. تطبيق نفس النوع على المكونات الفرعية
export function CardHeader({ className, ...props }: BaseCardProps) {
    return <div className={cn("p-4 border-b border-gray-800", className)} {...props} />;
}

// 3. تطبيق نفس النوع على CardTitle (الذي هو h3 لكنه يتلقى خصائص <div>)
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    // 💡 ملاحظة: من الأفضل استخدام React.HTMLAttributes<HTMLHeadingElement> لـ h3
    return (
        <h3
            className={cn("text-lg font-bold text-blue-400 mb-2", className)}
            {...props}
        />
    );
}

// 4. تطبيق نفس النوع على CardContent
export function CardContent({ className, ...props }: BaseCardProps) {
    return <div className={cn("p-4", className)} {...props} />;
}