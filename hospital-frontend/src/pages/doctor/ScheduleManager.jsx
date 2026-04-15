import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
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

    try {
      await createDoctorSchedule({ doctorId, ...form, slotDurationMinutes: Number(form.slotDurationMinutes) });
      await load();
    } catch (ex) {
      setErr(ex?.response?.data?.message || "Failed to create schedule");
    }
  };

  if (loading) return <div className="flex items-center gap-2 text-slate-700"><Spinner /> Loading</div>;

  return (
    <div className="space-y-6">
      <Card title="Schedule manager" subtitle="Create weekly slots for patients">
        {err ? <div className="mb-4"><Alert type="error" title="Error">{err}</Alert></div> : null}

        <form onSubmit={submit} className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Day of week</label>
            <select
              value={form.dayOfWeek}
              onChange={(e) => set("dayOfWeek", e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option>MONDAY</option>
              <option>TUESDAY</option>
              <option>WEDNESDAY</option>
              <option>THURSDAY</option>
              <option>FRIDAY</option>
              <option>SATURDAY</option>
              <option>SUNDAY</option>
            </select>
          </div>

          <Input label="Start time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} placeholder="10:00" />
          <Input label="End time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} placeholder="13:00" />
          <Input
            label="Slot duration (minutes)"
            value={form.slotDurationMinutes}
            onChange={(e) => set("slotDurationMinutes", e.target.value)}
            placeholder="30"
          />

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Available</label>
            <select
              value={String(form.available)}
              onChange={(e) => set("available", e.target.value === "true")}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <Button type="submit">Create schedule</Button>
          </div>
        </form>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Day</th>
                <th className="px-4 py-3 font-semibold">Start</th>
                <th className="px-4 py-3 font-semibold">End</th>
                <th className="px-4 py-3 font-semibold">Duration</th>
                <th className="px-4 py-3 font-semibold">Available</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-3 font-semibold">{s.dayOfWeek}</td>
                  <td className="px-4 py-3">{s.startTime}</td>
                  <td className="px-4 py-3">{s.endTime}</td>
                  <td className="px-4 py-3">{s.slotDurationMinutes}</td>
                  <td className="px-4 py-3">{String(!!s.available)}</td>
                </tr>
              ))}
              {!list.length ? (
                <tr><td className="px-4 py-6 text-slate-600" colSpan={5}>No schedules found</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}