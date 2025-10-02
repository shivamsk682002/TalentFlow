import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useState,useEffect } from 'react';

function RoleToggle() {
  const [role, setRole] = useState<'hr' | 'candidate'>(() => (localStorage.getItem('role') as any) || 'hr');

  useEffect(() => {
    localStorage.setItem('role', role);
  }, [role]);

  return (
    <div className="flex items-center gap-3 ">
     
      <div className="flex items-center gap-2 bg-blue-400/10 rounded px-2 py-1 font-medium">
        HR Portal
      </div>
    </div>
  );
}
export default function Navbar() {


  return (
   <>
     <nav className="w-full bg-white border-b border-blue-500/30 fixed ">
          <div className=" mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-16 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link to="/" className="text-xl font-bold text-blue-950">
                  TalentFlow
                </Link>
    
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <Link to="/jobs" className="hover:underline text-blue-900">Jobs</Link>
                  <Link to="/candidates" className="hover:underline text-blue-900">Candidates</Link>
                  <Link to="/about" className="hover:underline text-blue-900">About</Link>
                </div>
              </div>
    
              <div className="flex items-center gap-4">
                <RoleToggle />
              </div>
            </div>
          </div>
        </nav>
        <div className="h-16" />
        </>
  );
}
