
import React, { useState, useEffect } from 'react';
import { appointmentService } from '../services/appointmentService';
import { Appointment, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { PatientForm } from './PatientForm';
import { ChatRoom } from './ChatRoom';

interface PatientDashboardProps {
  patient: any;
  lang: Language;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ patient, lang }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const all = appointmentService.getAppointments();
    const mine = all.filter(a => a.patientPhone === patient.phone);
    setAppointments(mine);
  }, [patient.phone, showForm]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Welcome, {patient.name}</h2>
          <p className="text-slate-500 font-medium">Your medical journey at MediQ.</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setActiveChatId(null); }}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          {showForm ? 'View My History' : t.bookAppt}
        </button>
      </div>

      {showForm ? (
        <PatientForm onComplete={() => setShowForm(false)} lang={lang} initialData={{name: patient.name, phone: patient.phone}} />
      ) : (
        <div className="grid gap-6">
          {appointments.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
               <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
               </div>
               <p className="text-slate-400 font-bold">No history found. Book your first appointment today!</p>
            </div>
          ) : (
            appointments.map(app => (
              <div key={app.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col transition-all overflow-hidden">
                <div className="flex flex-col md:flex-row gap-8 items-start group">
                  <div className="md:w-1/4">
                    <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1.5">{app.appointmentDate}</div>
                    <div className="text-xl font-black text-slate-900 mb-1">{app.appointmentTime}</div>
                    <h4 className="font-bold text-slate-700">{app.doctorName}</h4>
                    <div className={`inline-block px-4 py-1 rounded-full text-[10px] font-black mt-3 uppercase tracking-tighter ${
                      app.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {app.status}
                    </div>
                  </div>
                  <div className="flex-1 space-y-5">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{t.problem}</span>
                      <p className="text-slate-600 font-medium leading-relaxed">{app.patientProblem}</p>
                    </div>
                    {app.doctorNotes && (
                      <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                           <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                        </div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-2">
                          Doctor's Feedback & Prescription
                        </span>
                        <p className="text-slate-800 font-bold whitespace-pre-wrap leading-relaxed relative z-10">{app.doctorNotes}</p>
                      </div>
                    )}
                  </div>
                  <div className="md:w-1/5 text-right flex flex-col items-end gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{t.healthStatus}</span>
                      <div className={`px-5 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-current/10 ${
                        app.healthStatus === 'Critical' ? 'bg-red-500 text-white' :
                        app.healthStatus === 'Serious' ? 'bg-orange-500 text-white' :
                        app.healthStatus === 'Fair' ? 'bg-blue-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {app.healthStatus}
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveChatId(activeChatId === app.id ? null : app.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        activeChatId === app.id 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-white border-2 border-slate-100 text-slate-600 hover:border-blue-500 hover:text-blue-600'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                      {activeChatId === app.id ? 'Close Chat' : 'Chat with Doctor'}
                    </button>
                  </div>
                </div>

                {activeChatId === app.id && (
                  <div className="mt-8 pt-8 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
                    <ChatRoom appointmentId={app.id} currentRole="patient" theme="light" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
