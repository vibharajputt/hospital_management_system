import React, { useEffect, useState } from "react";
import { CalendarClock, Clock, CalendarDays, PlusCircle, ToggleRight, Settings2 } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";

import { createDoctorSchedule, getDoctorSchedules } from "../../api/doctorSchedules";
import { getMyDoctorProfile } from "../../api/doctor";

export default function ScheduleManager() {
  const [doctorId, setDoctorId] = useState(null);
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    dayOfWeek: "MONDAY",
    startTime: "10:00",
    endTime: "13:00",
    slotDurationMinutes: 30,
    available: true,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const doc = await getMyDoctorProfile();
      setDoctorId(doc.id);
      const schedules = await getDoctorSchedules(doc.id);
      setList(schedules || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!doctorId) return;
    setErr("");
    setCreating(true);

    try {
      await createDoctorSchedule({ doctorId, ...form, slotDurationMinutes: Number(form.slotDurationMinutes) });
      await load();
    } catch (ex) {
      setErr(ex?.response?.data?.message || "Failed to create schedule");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading your schedule...</p>
        </div>
      </div>
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header section with gradient */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 flex items-center gap-3">
              <CalendarClock className="text-teal-400" size={36} />
              Schedule Manager
            </h1>
            <p className="text-indigo-100/80 text-lg max-w-xl">Configure your weekly availability and consultation slots for patients to book.</p>
          </div>
        </div>
      </div>

      {err ? <Alert type="error" title="Error">{err}</Alert> : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow sticky top-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PlusCircle className="text-indigo-600" size={24} /> Add New Slot
            </h3>
            
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                  <CalendarDays size={16} className="text-gray-400" /> Day of Week
                </label>
                <div className="relative">
                  <select
                    value={form.dayOfWeek}
                    onChange={(e) => set("dayOfWeek", e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium text-gray-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
                  >
                    <option>MONDAY</option>
                    <option>TUESDAY</option>
                    <option>WEDNESDAY</option>
                    <option>THURSDAY</option>
                    <option>FRIDAY</option>
                    <option>SATURDAY</option>
                    <option>SUNDAY</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Start Time</label>
                  <input 
                    type="time" 
                    value={form.startTime} 
                    onChange={(e) => set("startTime", e.target.value)} 
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 ml-1">End Time</label>
                  <input 
                    type="time" 
                    value={form.endTime} 
                    onChange={(e) => set("endTime", e.target.value)} 
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" /> Slot Duration
                </label>
                <div className="relative">
                  <select
                    value={form.slotDurationMinutes}
                    onChange={(e) => set("slotDurationMinutes", e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 pl-10 text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="20">20 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes</option>
                  </select>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Settings2 size={16} />
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pb-2">
                <label className="text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                  <ToggleRight size={16} className="text-gray-400" /> Availability
                </label>
                <div className="relative">
                  <select
                    value={String(form.available)}
                    onChange={(e) => set("available", e.target.value === "true")}
                    className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer"
                  >
                    <option value="true">Available for booking</option>
                    <option value="false">Unavailable / On leave</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 shadow-md hover:shadow-lg" isLoading={creating}>
                {creating ? "Creating schedule..." : "Create Schedule"}
              </Button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full">
            <div className="p-6 sm:px-8 sm:pt-8 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarDays className="text-indigo-600" size={24} /> Current Schedule
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-white text-gray-500 uppercase text-xs font-bold tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-5">Day</th>
                    <th className="px-6 py-5">Time Slot</th>
                    <th className="px-6 py-5 text-center">Duration</th>
                    <th className="px-6 py-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {list.map((s) => (
                    <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{s.dayOfWeek}</td>
                      <td className="px-6 py-4 font-semibold text-indigo-700">
                        {s.startTime} - {s.endTime}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-gray-100 text-gray-700 py-1 px-3 rounded-full text-xs font-bold">{s.slotDurationMinutes} mins</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {s.available ? (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full inline-block">Available</span>
                        ) : (
                          <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full inline-block">Unavailable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!list.length ? (
                    <tr>
                      <td className="px-6 py-16 text-center text-gray-500" colSpan={4}>
                        <div className="flex flex-col items-center justify-center">
                          <CalendarDays size={48} className="text-gray-300 mb-3" />
                          <p className="text-lg font-medium text-gray-900">No schedule created</p>
                          <p className="text-sm">Use the form to create your available time slots.</p>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}