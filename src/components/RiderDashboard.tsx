import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Navigation, Package, Star, Power } from 'lucide-react';
import { Rider } from '../types';

export const RiderDashboard = () => {
  const { language } = useLanguage();
  const [rider, setRider] = useState<Rider | null>(null);
  
  useEffect(() => {
    // In real app, fetch rider profile
    setRider({
      id: 'RDR-1',
      fullName: 'Abdul Rahman',
      phone: '0123456789',
      status: 'OFFLINE',
      createdAt: new Date().toISOString()
    });
  }, []);

  const toggleStatus = async () => {
    if (!rider) return;
    const newStatus = rider.status === 'OFFLINE' ? 'AVAILABLE' : 'OFFLINE';
    
    // Real location update
    if (newStatus === 'AVAILABLE' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await fetch('/api/rider/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: newStatus,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          })
        });
        setRider({ ...rider, status: newStatus });
      });
    } else {
      await fetch('/api/rider/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setRider({ ...rider, status: newStatus });
    }
  };

  if (!rider) return <div>Loading...</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-bold">{rider.fullName}</h2>
          <p className="text-xs text-slate-500">{rider.phone}</p>
        </div>
        <button 
          onClick={toggleStatus}
          className={`p-3 rounded-full ${rider.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}
        >
          <Power className="w-6 h-6" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
          <p className="text-xs text-slate-500">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</p>
          <p className="text-lg font-bold">{rider.status}</p>
        </div>
      </div>
    </div>
  );
};
