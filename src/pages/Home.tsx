import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Link } from 'react-router-dom';
import { ShoppingBag, Store } from 'lucide-react';

const Home = () => {
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vendorList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVendors(vendorList.filter((v: any) => v.shopName));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-indigo-600">تسوق من أفضل المتاجر المحلية</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vendors.map(vendor => (
          <Link key={vendor.id} to={`/shop/${vendor.id}`} className="block">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:border-indigo-500 transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Store className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{vendor.shopName}</h2>
                  <p className="text-gray-500 text-sm">{vendor.description || 'متجر متميز لبيع المنتجات'}</p>
                </div>
              </div>
              <ShoppingBag className="text-gray-300" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;