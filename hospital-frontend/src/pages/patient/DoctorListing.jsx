import React, { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-extrabold text-slate-900">{d.user?.fullName}</div>
          <div className="mt-1 text-sm text-slate-600">
            {d.specialization} · {d.department || "General"}
          </div>
          <div className="mt-2 text-sm text-slate-700">
            Fee: <span className="font-semibold">{d.consultationFee ?? 0}</span>
          </div>
          <div className="mt-1 text-sm text-slate-700">
            Approved: <span className={`font-semibold ${d.approved ? "text-emerald-700" : "text-rose-700"}`}>{String(!!d.approved)}</span>
          </div>
        </div>
        <Button onClick={() => onBook(d)} disabled={!d.approved}>
          View slots
        </Button>
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
    sortBy: "consultationFee",
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
    <div className="space-y-6">
      <Card
        title="Find doctors"
        subtitle="Search and book available slots"
        right={<Button variant="secondary" onClick={load}>Refresh</Button>}
      >
        {err ? <div className="mb-4"><Alert type="error" title="Error">{err}</Alert></div> : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Specialization"
            placeholder="Cardio, Neuro, General"
            value={query.specialization}
            onChange={(e) => setQuery((p) => ({ ...p, specialization: e.target.value, page: 0 }))}
          />
          <Input
            label="Department"
            placeholder="Cardiology"
            value={query.department}
            onChange={(e) => setQuery((p) => ({ ...p, department: e.target.value, page: 0 }))}
          />
          <div className="flex items-end gap-2">
            <Button
              className="w-full"
              onClick={() => {
                setQuery((p) => ({ ...p, page: 0 }));
                load();
              }}
            >
              Search
            </Button>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-700"><Spinner /> Loading doctors</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {(res?.content || []).map((d) => (
                <DoctorCard key={d.id} d={d} onBook={openDoctor} />
              ))}
            </div>
          )}
        </div>

        {res ? (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Page {res.page + 1} of {res.totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={res.page <= 0}
                onClick={() => setQuery((p) => ({ ...p, page: Math.max(0, p.page - 1) }))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={res.last}
                onClick={() => setQuery((p) => ({ ...p, page: p.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <Modal
        open={modalOpen}
        title={selectedDoctor ? `Slots for ${selectedDoctor.user?.fullName}` : "Slots"}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Close</Button>
            <Button onClick={book} disabled={!selectedSlot || booking}>
              {booking ? "Booking" : "Book selected slot"}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={async (e) => {
              const v = e.target.value;
              setDate(v);
              if (selectedDoctor) await loadSlots(selectedDoctor.id, v);
            }}
          />
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Selected slot</label>
            <div className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm flex items-center">
              {selectedSlot || "None"}
            </div>
          </div>
        </div>

        <div className="mt-5">
          {slotsLoading ? (
            <div className="flex items-center gap-2 text-slate-700"><Spinner /> Loading slots</div>
          ) : slots.length ? (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSlot(s)}
                  className={`h-11 rounded-lg border px-3 text-sm font-semibold transition ${selectedSlot === s
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              No slots available for this date.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}