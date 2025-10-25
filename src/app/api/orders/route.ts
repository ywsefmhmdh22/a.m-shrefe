 // ✅ src/app/api/orders/route.ts

import { db } from '@/app/lib/firebaseConfig'; 
import { collection, addDoc, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'; 
import { NextResponse } from 'next/server';

// ✅ تعريف هيكل الطلب (OrderData)
interface OrderData {
	adId: string;
	customerName: string;
	phone: string;
	address: string;
	paymentMethod: string;
	adName?: string;
	adPrice?: string;
	orderDate: string;
	status: string;
	userEmail?: string; // ✅ أضفنا البريد الإلكتروني هنا
}

// ✅ معالجة طلبات POST (إضافة طلب جديد)
export async function POST(request: Request) {
	try {
		const data: OrderData = await request.json();

		// ✅ تحقق من البيانات المطلوبة
		if (!data.adId || !data.customerName || !data.phone || !data.address || !data.paymentMethod) {
			return NextResponse.json({ message: 'البيانات المطلوبة غير مكتملة.' }, { status: 400 });
		}

		// ✅ إضافة الطلب الجديد إلى مجموعة orders
		const docRef = await addDoc(collection(db, 'orders'), {
			...data,
			orderDate: new Date().toISOString(), // تأكيد التاريخ من السيرفر
			status: 'Pending', // الحالة الأولية
			userEmail: data.userEmail || null, // ✅ إضافة البريد الإلكتروني للمستخدم
		});

		console.log("✅ تم إضافة طلب جديد بنجاح، ID:", docRef.id);

		return NextResponse.json(
			{ message: 'تم استلام الطلب بنجاح', orderId: docRef.id },
			{ status: 200 }
		);
	} catch (error) {
		console.error('❌ خطأ في معالجة طلب الشراء:', error);
		return NextResponse.json(
			{ message: 'حدث خطأ داخلي في الخادم.' },
			{ status: 500 }
		);
	}
}

// ✅ معالجة طلبات GET (لجلب جميع الطلبات — للأدمن)
export async function GET() {
	try {
		const querySnapshot = await getDocs(collection(db, 'orders'));
		const orders = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
			id: doc.id,
			...doc.data(),
		}));

		return NextResponse.json(orders, { status: 200 });
	} catch (error) {
		console.error('❌ خطأ في جلب الطلبات للأدمن:', error);
		return NextResponse.json(
			{ message: 'حدث خطأ داخلي في الخادم.' },
			{ status: 500 }
		);
	}
}
