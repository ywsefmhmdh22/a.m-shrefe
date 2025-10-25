 import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebaseConfig';
import { doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

/**
 * ✅ تعريف آمن ومتوافق مع Next.js 15:
 * context.params بقت Promise من كائن، فلازم await.
 */
interface RouteContext {
  params: Promise<{ orderId: string }>;
}

/**
 * 📦 دالة GET: جلب بيانات طلب معين
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { orderId } = await context.params; // لاحظ await هنا ✅

  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ id: orderSnap.id, ...orderSnap.data() });
  } catch (error) {
    console.error(`Firestore Error fetching order ${orderId}:`, error);
    return NextResponse.json(
      { error: 'Internal server failure during fetch.' },
      { status: 500 }
    );
  }
}

/**
 * 🛠️ دالة PUT: تحديث حالة الطلب أو إلغاؤه
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const { orderId } = await context.params;

  try {
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'حالة الطلب الجديدة مطلوبة للتحديث.' },
        { status: 400 }
      );
    }

    const orderRef = doc(db, 'orders', orderId);

    if (status === 'Cancelled') {
      await deleteDoc(orderRef);
      console.log(`تم حذف الطلب الملغي بنجاح، ID: ${orderId}`);
      return NextResponse.json(
        { message: 'تم إلغاء وحذف الطلب بنجاح.', deleted: true },
        { status: 200 }
      );
    }

    await updateDoc(orderRef, { status });
    console.log(`تم تحديث الطلب ${orderId} إلى الحالة: ${status}`);

    return NextResponse.json(
      {
        message: 'تم تحديث حالة الطلب بنجاح.',
        newStatus: status,
        deleted: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Firestore Error updating/deleting order ${orderId}:`, error);
    return NextResponse.json(
      { error: 'فشل داخلي في الخادم أثناء التحديث.' },
      { status: 500 }
    );
  }
}

/**
 * ❌ دالة DELETE: حذف طلب معين
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const { orderId } = await context.params;

  try {
    const orderRef = doc(db, 'orders', orderId);
    await deleteDoc(orderRef);

    console.log(`تم حذف الطلب بنجاح، ID: ${orderId}`);

    return NextResponse.json(
      { message: 'Order deleted successfully.', deleted: true },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Firestore Error deleting order ${orderId}:`, error);
    return NextResponse.json(
      { error: 'Internal server failure during deletion.' },
      { status: 500 }
    );
  }
}
