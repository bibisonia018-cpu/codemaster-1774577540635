import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { sendOrderToTelegram } from '../services/telegramService';

const ShopPage = () => {
  const { vendorId } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [vendor, setVendor] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    if (!vendorId) return;

    // Get Vendor Info
    getDoc(doc(db, "users", vendorId)).then(docSnap => {
      if (docSnap.exists()) setVendor(docSnap.data());
    });

    // Get Products (Real-time)
    const q = query(collection(db, "products"), where("vendorId", "==", vendorId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [vendorId]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdering(true);
    
    try {
      // 1. Save order to Firestore
      const orderData = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        price: selectedProduct.price,
        vendorId,
        customerInfo,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, "orders"), orderData);

      // 2. Send Telegram Notification
      await sendOrderToTelegram(vendor, selectedProduct, customerInfo);

      alert("تم إرسال طلبك بنجاح! سيتصل بك التاجر قريباً.");
      setSelectedProduct(null);
    } catch (error) {
      alert("حدث خطأ أثناء الطلب.");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">{vendor?.shopName || 'المتجر'}</h1>
        <p className="text-gray-600">اختر منتجك وسنرسل طلبك فوراً لصاحب المتجر</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border p-4 flex flex-col">
            <img src={product.image || 'https://via.placeholder.com/200'} alt="" className="w-full h-48 object-cover rounded-md mb-4" />
            <h3 className="text-lg font-bold">{product.name}</h3>
            <p className="text-indigo-600 font-bold mb-4">{product.price} د.ج</p>
            <button 
              onClick={() => setSelectedProduct(product)}
              className="mt-auto bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
            >
              اطلب الآن
            </button>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">إتمام الطلب: {selectedProduct.name}</h2>
            <form onSubmit={handleOrder} className="space-y-4">
              <input 
                required 
                className="w-full p-2 border rounded" 
                placeholder="الإسم الكامل" 
                onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
              />
              <input 
                required 
                className="w-full p-2 border rounded" 
                placeholder="رقم الهاتف" 
                onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
              />
              <textarea 
                required 
                className="w-full p-2 border rounded" 
                placeholder="العنوان التفصيلي" 
                onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
              />
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={isOrdering}
                  className="flex-1 bg-green-600 text-white py-2 rounded-md disabled:bg-gray-400"
                >
                  {isOrdering ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 bg-gray-200 py-2 rounded-md"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;