import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Trash2 } from 'lucide-react';
import { createDoctorSchedule, getMySchedules } from '../../api/doctor';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';

const ScheduleManager = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDurationInfo, setSlotDurationInfo] = useState('30'); // Duration in minutes
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const data = await getMySchedules();
        setSchedules(data);
      } catch (error) {
        // Fallback mock
        setSchedules([
          { id: 1, date: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00:00', endTime: '12:00:00', generatedSlotsCount: 6 },
          { id: 2, date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), startTime: '10:00:00', endTime: '16:00:00', generatedSlotsCount: 12 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      // Assuming backend expects: date, startTime, endTime, slotDuration
      const payload = {
          date: date,
          startTime: startTime + ":00",
          endTime: endTime + ":00",
          slotDuration: parseInt(slotDurationInfo)
      };
      
      await createDoctorSchedule(payload);
      toast.success('Schedule created and slots generated!');
      
      // refetch or append artificially
      setSchedules([...schedules, { ...payload, id: Math.random(), generatedSlotsCount: 'Generated' }]);
    } catch (error) {
      toast.error('Failed to create schedule. Backend might reject overlap.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
         <h1 className="text-2xl font-bold text-gray-900">Schedule Manager</h1>
         <p className="text-gray-500">Define your availability to automatically generate bookable slots for patients.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Schedule Form */}
        <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-primary-600"/> Create New Schedule
                </h2>
                
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input 
                        id="date" 
                        type="date" 
                        label="Date" 
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            id="startTime" 
                            type="time" 
                            label="Start Time" 
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                            required
                        />
                        <Input 
                            id="endTime" 
                            type="time" 
                            label="End Time"
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <Input 
                        id="slotDuration" 
                        type="number" 
                        label="Slot Duration (Minutes)" 
                        value={slotDurationInfo}
                        onChange={e => setSlotDurationInfo(e.target.value)}
                        required
                        min="10"
                        max="120"
                    />

                    <div className="pt-2">
                        <Button type="submit" fullWidth isLoading={creating}>
                            Generate Slots
                        </Button>
                    </div>
                </form>
            </div>
        </div>

        {/* Existing Schedules */}
        <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <CalendarIcon size={20} className="text-primary-600"/> Upcoming Schedules
                </h2>
                
                {loading ? (
                    <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
                ) : (
                    <div className="space-y-4">
                        {schedules.map(sched => (
                            <div key={sched.id} className="p-5 border border-gray-100 rounded-xl flex items-center justify-between hover:border-primary-200 hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary-50 p-3 rounded-xl text-primary-600">
                                        <CalendarIcon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{format(new Date(sched.date), 'EEEE, MMMM do, yyyy')}</h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                            <span className="flex items-center gap-1"><Clock size={14}/> {sched.startTime} - {sched.endTime}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span className="font-medium text-primary-600">{sched.generatedSlotsCount} Slots Auto-Generated</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                    <Trash2 size={20}/>
                                </button>
                            </div>
                        ))}
                        {schedules.length === 0 && (
                             <div className="text-center py-10 text-gray-500">
                                 No schedules created yet. Create one to allow patients to book.
                             </div>
                        )}
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default ScheduleManager;
