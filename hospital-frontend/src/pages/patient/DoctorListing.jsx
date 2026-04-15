import React, { useEffect, useMemo, useState } from "react";
import { Search, UserRound, CalendarHeart, MapPin, IndianRupee, Clock, CalendarDays, CheckCircle2 } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/Alert";
import Spinner from "../../components/ui/Spinner";

import { getDoctorsPaged } from "../../api/doctor";
import { getDoctorSlotsByDate } from "../../api/doctorSchedules";
import { bookAppointmentSelf } from "../../api/appointments";

function DoctorCard({ d, onBook }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
            <UserRound size={32} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {d.user?.fullName}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm font-medium text-emerald-600 bg-emerald-50 w-fit px-2.5 py-0.5 rounded-full">
              <CheckCircle2 size={14} />
              {d.specialization}
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gray-400" /> {d.department || "General"}</span>
              <span className="flex items-center gap-1"><IndianRupee size={16} className="text-gray-400" /> {d.consultationFee ?? 0}</span>
            </div>
          </div>
        </div>
        
        <div className="w-full sm:w-auto flex flex-col items-end gap-3">
          <div className="hidden sm:block">
            {d.approved ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">Verified Doctor</span>
            ) : (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200">Pending</span>
            )}
          </div>
          <Button onClick={() => onBook(d)} disabled={!d.approved} className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-indigo-500/30 shadow-lg">
            <CalendarDays size={18} />
            Book Slots
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DoctorListing() {
  const [query, setQuery] = useState({ specialization: "", department: "", page: 0, size: 6 });
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");

  const params = useMemo(() => ({
    specialization: query.specialization || undefined,
    department: query.department || undefined,
    page: query.page,
    size: query.size,
    sortBy: "id",
    direction: "asc",
  }), [query]);

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const data = await getDoctorsPaged(params);
      setRes(data);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [params.page]);

  const openDoctor = async (doc) => {
    setSelectedDoctor(doc);
    setModalOpen(true);
    setSelectedSlot("");
    await loadSlots(doc.id, date);
  };

  const loadSlots = async (doctorId, day) => {
    setSlotsLoading(true);
    try {
      const s = await getDoctorSlotsByDate(doctorId, day);
      setSlots(s || []);
    } catch (e) {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const book = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    setBooking(true);
    try {
      const appointmentDateTime = `${date}T${selectedSlot}:00`;
      await bookAppointmentSelf({
        doctorId: selectedDoctor.id,
        appointmentDateTime,
        symptoms: "",
        notes: "",
      });
      await loadSlots(selectedDoctor.id, date);
      setSelectedSlot("");
    } catch (e) {
      setErr(e?.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header section with gradient */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Find Expert Doctors</h1>
          <p className="text-indigo-100/80 text-lg max-w-xl">Search specific specialities and book an appointment with our elite medical professionals.</p>
          
          <div className="mt-8 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="E.g. Cardiologist, Dentist..."
                  value={query.specialization}
                  icon={Search}
                  className="!bg-white"
                  onChange={(e) => setQuery((p) => ({ ...p, specialization: e.target.value, page: 0 }))}
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Department (e.g. Cardiology)"
                  value={query.department}
                  icon={MapPin}
                  className="!bg-white"
                  onChange={(e) => setQuery((p) => ({ ...p, department: e.target.value, page: 0 }))}
                />
              </div>
              <div className="sm:w-32 flex items-stretch">
                <Button 
                  onClick={() => { setQuery((p) => ({ ...p, page: 0 })); load(); }}
                  className="w-full h-auto bg-teal-500 hover:bg-teal-400 text-white shadow-lg border-0"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {err ? <Alert type="error" title="Error">{err}</Alert> : null}

      {/* Doctor List */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CalendarHeart className="text-indigo-600" />
          Available Doctors
        </h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading doctors directly to your feed...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {(res?.content || []).map((d) => (
                <DoctorCard key={d.id} d={d} onBook={openDoctor} />
              ))}
            </div>
            
            {(!res?.content || res.content.length === 0) && (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <UserRound size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No doctors found</h3>
                <p className="text-gray-500 mt-1">Try adjusting your search filters to find more doctors.</p>
              </div>
            )}
          </>
        )}
      </div>

      {res && res.totalPages > 0 ? (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm mt-6">
          <div className="text-sm font-medium text-gray-500">
            Page <span className="text-gray-900 font-bold">{res.page + 1}</span> of {res.totalPages}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" disabled={res.page <= 0} onClick={() => setQuery((p) => ({ ...p, page: Math.max(0, p.page - 1) }))}>
              Previous
            </Button>
            <Button variant="primary" disabled={res.last} onClick={() => setQuery((p) => ({ ...p, page: p.page + 1 }))}>
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <Modal
        open={modalOpen}
        title={selectedDoctor ? `Book Appointment with ${selectedDoctor.user?.fullName}` : "Book Slot"}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-between items-center w-full">
            <span className="text-sm text-gray-500">Select a green slot to book</span>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={book} disabled={!selectedSlot || booking} isLoading={booking}>
                {booking ? "Confirming..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        }
      >
        <div className="pb-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
            <Input
              label="Select Consultation Date"
              type="date"
              value={date}
              className="!bg-white"
              onChange={async (e) => {
                const v = e.target.value;
                setDate(v);
                if (selectedDoctor) await loadSlots(selectedDoctor.id, v);
              }}
            />
          </div>

          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-indigo-600" /> Available Time Slots
          </h4>
          
          {slotsLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : slots.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSlot(s)}
                  className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all active:scale-95 ${
                    selectedSlot === s
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                      : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No slots open on this date.</p>
              <p className="text-xs text-gray-400 mt-1">Please try selecting another date.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}