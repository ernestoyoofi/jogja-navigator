
import React from 'react';
import { MapPin, Navigation, Layers, Target } from 'lucide-react';
import { Spot } from '../types';

interface MapFrameProps {
  spots?: Spot[];
  activeRouteName?: string;
  stats?: { distance: string; duration: string };
}

const MapFrame: React.FC<MapFrameProps> = ({ spots = [], activeRouteName, stats }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 bg-gray-50/50">
      {/* Visual background decorations as per image */}
      <div className="absolute top-8 right-8 flex flex-col gap-2">
        <button className="bg-white p-3 rounded-xl shadow-lg hover:bg-gray-50 transition-colors">
          <Layers className="w-5 h-5 text-gray-600" />
        </button>
        <button className="bg-white p-3 rounded-xl shadow-lg hover:bg-gray-50 transition-colors">
          <Target className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* The Frame */}
      <div className="relative w-full max-w-2xl aspect-[3/4] bg-white p-4 shadow-2xl rounded-sm border-[16px] border-[#444] transform hover:scale-[1.01] transition-transform duration-500">
        <div className="w-full h-full bg-[#E2ECE2] relative overflow-hidden flex flex-col">
          {/* Faux Map Background using patterns */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#222 0.5px, transparent 0.5px)', backgroundSize: '16px 16px' }}></div>
          
          {/* "YOGYAKARTA" Text at bottom */}
          <div className="absolute bottom-12 left-0 right-0 text-center">
            <h3 className="text-4xl font-bold text-gray-600/30 tracking-[0.2em] uppercase">Yogyakarta</h3>
            <p className="text-[10px] text-gray-400 font-medium tracking-widest mt-1">CITY OF HISTORY</p>
          </div>

          {/* Map Pins */}
          {spots.map((spot, idx) => (
            <div 
              key={spot.id}
              className="absolute transition-all duration-700 ease-out"
              style={{ 
                top: `${20 + (idx * 25)}%`, 
                left: idx % 2 === 0 ? '60%' : '35%'
              }}
            >
              <div className="relative group">
                <div className={`w-10 h-10 rounded-full ${spot.isCompleted ? 'bg-[#00F0A0]' : 'bg-[#00F0A0]'} border-4 border-white shadow-xl flex items-center justify-center text-white font-bold cursor-pointer group-hover:scale-110 transition-transform`}>
                  {idx + 1}
                </div>
                {/* Floating tooltips style */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-xs font-semibold">
                  {spot.name}
                </div>
              </div>
            </div>
          ))}

          {/* Landscape art feel - mimicking the mountain image in Landing view */}
          {spots.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
               <img src="https://picsum.photos/seed/yogya/800/1200" alt="Landscape" className="w-full h-full object-cover opacity-60 grayscale-[0.2]" />
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/40"></div>
            </div>
          )}
        </div>
      </div>

      {/* Active Route Info Overlay (Bottom Left) */}
      {activeRouteName && (
        <div className="absolute bottom-12 left-12 bg-white p-6 rounded-2xl shadow-xl max-w-xs border border-gray-100">
          <p className="text-[#00F0A0] text-[10px] font-bold uppercase tracking-widest mb-1">Active Route</p>
          <h4 className="text-xl font-bold text-gray-900 mb-1">{activeRouteName}</h4>
          <p className="text-sm text-gray-500">{stats?.distance} • Approx. {stats?.duration}</p>
        </div>
      )}
    </div>
  );
};

export default MapFrame;
