 import React from 'react';
// ✅ تم حذف 'Settings' لحل مشكلة التحذير
import { PlusCircle, ListTodo, Users, ArrowLeftCircle, BarChart } from 'lucide-react';

// ✅ تعريف نوع الخصائص (Props) لمكون ActionCard لإصلاح خطأ TypeScript
interface ActionCardProps {
	title: string;
	description: string;
	icon: React.ElementType; // يستخدم لتمرير مكون Lucide-React كأيقونة
	color: string;
	shadow: string;
	href: string;
}

// البيانات الخاصة بالأزرار
const dashboardActions: ActionCardProps[] = [
	{
		title: 'إضافة إعلان جديد',
		description: 'إنشاء ورفع منتج جديد إلى واجهة العرض العامة.',
		icon: PlusCircle,
		color: 'from-green-500 to-emerald-600',
		shadow: 'shadow-green-500/50',
		href: 'add-ad', // رابط افتراضي
	},
	{
		title: 'الإعلانات التي تم رفعها',
		description: 'عرض وإدارة وتعديل جميع الإعلانات الحالية المنشورة.',
		icon: ListTodo,
		color: 'from-blue-500 to-indigo-600',
		shadow: 'shadow-blue-500/50',
		href: 'view-ads', // رابط افتراضي
	},
	{
		title: 'لوح طلبات الأدمن',
		description: 'مراجعة وتلبية الطلبات والاستفسارات الخاصة بالعملاء.',
		icon: Users,
		color: 'from-pink-500 to-purple-600',
		shadow: 'shadow-pink-500/50',
		href: ' admin-orders', // رابط افتراضي
	},
	{
		title: 'الإحصائيات والتحليل',
		description: 'متابعة أداء الإعلانات وحركة المرور على المتجر.',
		icon: BarChart,
		color: 'from-yellow-500 to-amber-600',
		shadow: 'shadow-yellow-500/50',
		href: 'analytics', // رابط افتراضي
	},
];

// مكون بطاقة الإجراء (زر)
// ✅ تم تطبيق نوع ActionCardProps هنا
const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon: Icon, color, shadow, href }) => {
	return (
		// استخدام <a> بدلاً من Link لبيئة الملف الواحد
		<a href={href} className="col-span-1 block">
			<div
				className={`bg-gray-800/80 p-6 rounded-3xl border border-gray-700 backdrop-blur-md shadow-2xl transition-all duration-500 transform 
					hover:scale-[1.03] hover:bg-gray-700/90 cursor-pointer
					group overflow-hidden relative h-full`}
			>
				{/* خلفية متوهجة */}
				<div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${color}`}></div>
				
				{/* أيقونة وتوهج */}
				<div className="flex items-center mb-4">
					<div
						className={`p-4 rounded-full bg-gradient-to-br ${color} text-white shadow-xl ${shadow} transition-transform duration-500 group-hover:rotate-6`}
					>
						<Icon className="w-8 h-8 md:w-10 md:h-10" />
					</div>
				</div>

				<h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 relative z-10">
					{title}
				</h3>
				<p className="text-gray-400 text-base relative z-10">
					{description}
				</p>
				
				{/* تأثير زر متحرك */}
				<div className="mt-4 flex justify-start">
					<span className={`text-sm font-semibold py-2 px-5 rounded-full text-white bg-gradient-to-r ${color} 
						transition-all duration-300 transform group-hover:translate-x-1 group-hover:shadow-lg group-hover:brightness-110`}>
						اذهب &rarr;
					</span>
				</div>
			</div>
		</a>
	);
};

// المكون الرئيسي للوحة التحكم
const AdminDashboard = () => {
	return (
		<div className="min-h-screen bg-gradient-to-b from-[#0a0022] to-[#150035] p-4 sm:p-8 font-[Inter] text-right">
			
			{/* رأس الصفحة */}
			<header className="max-w-7xl mx-auto mb-10 pt-10">
				<h1 className="text-4xl sm:text-5xl font-extrabold mb-3 text-white tracking-wider bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
					⚙️ لوحة تحكم المدير
				</h1>
				<p className="text-gray-300 text-lg">
					مرحباً بك، يمكنك إدارة جميع جوانب تطبيق الإعلانات من هنا.
				</p>
			</header>
			
			{/* شبكة الإجراءات */}
			<section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
				{dashboardActions.map((action) => (
					<ActionCard key={action.title} {...action} />
				))}
			</section>

			{/* زر العودة للواجهة العامة */}
			<div className="max-w-7xl mx-auto mt-12 text-center">
				<a href="#page" className="inline-flex items-center text-lg font-semibold text-blue-400 hover:text-blue-300 transition-colors">
					العودة إلى واجهة العرض العامة
					<ArrowLeftCircle className="w-5 h-5 mr-2" />
				</a>
			</div>
		</div>
	);
};

export default AdminDashboard;
