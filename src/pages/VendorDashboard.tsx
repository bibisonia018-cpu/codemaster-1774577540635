import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, collection, addDoc, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { Settings, Plus, Trash2 } from 'lucide-react';

const VendorDashboard = ({ user }: { user: any }) => {
  const [settings, setSettings] = useState({ shopName: '', telegramBotToken: '', telegramChatId: '' });
  const [products, setProducts] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', image: '' });

  useEffect(() => {
    if (!user) return;
    
    // Load Settings
    getDoc(doc(db, "users", user.uid)).then(s => s.exists() && setSettings(s.data() as any));

    // Load Vendor Products (Real-time)
    const q = query(collection(db, "products"), where("vendorId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const saveSettings = async () => {
    await setDoc(doc(db, "users", user.uid), settings, { merge: true });
    alert("تم حفظ الإعدادات");
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "products"), { ...newProduct, vendorId: user.uid });
    setNewProduct({ name: '', price: '', image: '' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Settings Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Settings /> إعدادات المتجر والتلغرام</h2>
        <div className="space-y-4">
          <input 
            className="w-full p-2 border rounded" 
            placeholder="إسم المتجر" 
            value={settings.shopName}
            onChange={e => setSettings({...settings, shopName: e.target.value})}
          />
          <div className="bg-blue-50 p-3 rounded text-sm text-blue-700 mb-2">
            احصل على التوكن من <a href="https://t.me/BotFather" target="_blank" className="underline">@BotFather</a> والـ ID من <a href="https://t.me/userinfobot" target="_blank" className="underline">@userinfobot</a>
          </div>
          <input 
            className="w-full p-2 border rounded" 
            placeholder="Telegram Bot Token" 
            value={settings.telegramBotToken}
            onChange={e => setSettings({...settings, telegramBotToken: e.target.value})}
          />
          <input 
            className="w-full p-2 border rounded" 
            placeholder="Telegram Chat ID" 
            value={settings.telegramChatId}
            onChange={e => setSettings({...settings, telegramChatId: e.target.value})}
          />
          <button onClick={saveSettings} className="w-full bg-indigo-600 text-white py-2 rounded">حفظ الإعدادات</button>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus /> إضافة منتج جديد</h2>
        <form onSubmit={addProduct} className="space-y-4 mb-6">
          <input required className="w-full p-2 border rounded" placeholder="إسم المنتج" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
          <input required className="w-full p-2 border rounded" placeholder="السعر" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
          <input className="w-full p-2 border rounded" placeholder="رابط صورة المنتج" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">إضافة المنتج</button>
        </form>

        <h3 className="font-bold mb-2">منتجاتك الحالية:</h3>
        <div className="space-y-2">
          {products.map(p => (
            <div key={p.id} className="flex justify-between items-center p-2 border-b">
              <span>{p.name} - {p.price} د.ج</span>
              <button onClick={() => deleteDoc(doc(db, "products", p.id))} className="text-red-500"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;