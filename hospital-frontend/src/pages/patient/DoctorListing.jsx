import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Star, Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { getDoctors, getDoctorSlots, bookAppointment } from '../../api/patient';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';

const DoctorCard = ({ doctor, onBook }) => (
  <div className="glass-card p-6 flex flex-col h-full hover:shadow-xl transition-all border border-gray-100 bg-white">
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-100 to-primary-50 flex items-center justify-center text-primary-700 font-bold text-xl shrink-0 border border-primary-200">
        {doctor.userFullName?.charAt(0) || 'D'}
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-lg">Dr. {doctor.userFullName}</h3>
        <p className="text-primary-600 font-medium text-sm">{doctor.specialization}</p>
        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span>{doctor.experienceYears} Years Exp</span>
        </div>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-50 mb-6">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Consultation Fee</span>
        <span className="font-bold text-gray-900">${doctor.consultationFee}</span>
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>Qualifications</span>
        <span className="text-gray-900 truncate max-w-[150px]" title={doctor.qualifications}>{doctor.qualifications}</span>
      </div>
    </div>
    <div className="mt-auto">
      <Button fullWidth onClick={() => onBook(doctor)}>
        Book Appointment
      </Button>
    </div>
  </div>
);

const BookAppointmentModal = ({ doctor, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    // Logic to fetch slots would go here. Since DTO doesn't explicitly expose slots endpoint to patient in overview,
    // we use a mocked/generic approach or the actual backend `getDoctorSlots` if implemented.
    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        // const fetchedSlots = await getDoctorSlots(doctor.id, formattedDate);
        // setSlots(fetchedSlots);
        
        // Mocking slots for UI until backend explicitly supplies `/doctors/{id}/slots`
        setTimeout(() => {
           setSlots([
             { id: 1, time: '09:00 AM' },
             { id: 2, time: '09:30 AM' },
             { id: 3, time: '10:00 AM' },
             { id: 4, time: '11:00 AM', isBooked: true },
             { id: 5, time: '02:00 PM' }
           ]);
           setSlotsLoading(false);
        }, 500);
      } catch (error) {
        toast.error('Failed to load slots');
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [selectedDate, doctor.id]);

  const handleBooking = async () => {
    if (!selectedSlot) return toast.error('Please select a time slot.');
    if (!reason) return toast.error('Please enter a reason for visit.');

    setLoading(true);
    try {
      // DTO Expected: doctorId, appointmentDateTime, reason
      const dateTime = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedSlot.time}`; 
      // Note: Time parsing depends on backend expectations.

      // Mocked booking response success
      await bookAppointment({
          doctorId: doctor.id,
          appointmentDateTime: new Date().toISOString(), // Use real ISO string or let spring handle format
          reason: reason
      });
      toast.success('Appointment booked successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to book appointment. Time slot might be taken.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
            <p className="text-sm text-gray-500">Dr. {doctor.userFullName} - {doctor.specialization}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            
            {/* Date Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">Select Date</label>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {[0, 1, 2, 3, 4, 5, 6].map(i => {
                  const date = addDays(new Date(), i);
                  const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(date)}
                      className={`min-w-[70px] p-3 rounded-2xl flex flex-col items-center justify-center border transition-all
                        ${isSelected 
                          ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/20' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:bg-primary-50'
                        }
                      `}
                    >
                      <span className="text-xs uppercase font-medium opacity-80">{format(date, 'EEE')}</span>
                      <span className="text-xl font-bold mt-1">{format(date, 'dd')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">Available Time Slots</label>
              {slotsLoading ? (
                 <div className="flex items-center justify-center py-8">
                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                 </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {slots.map(slot => (
                    <button
                      key={slot.id}
                      disabled={slot.isBooked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border
                        ${slot.isBooked 
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60' 
                          : selectedSlot?.id === slot.id
                            ? 'bg-primary-50 border-primary-600 text-primary-700 ring-1 ring-primary-600'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300'
                        }
                      `}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reason Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Reason for Visit</label>
              <textarea
                rows="3"
                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                placeholder="Briefly describe your symptoms or reason for visit..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              ></textarea>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleBooking} isLoading={loading}>Confirm Booking</Button>
        </div>
      </div>
    </div>
  );
};

const DoctorListing = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getDoctors(0, 50, searchTerm);
        setDoctors(data?.content || []);
      } catch (error) {
        // Mock fallback if DB is empty or `/paged` fails
        setDoctors([
           { id: 1, userFullName: 'Sarah Jenkins', specialization: 'CARDIOLOGIST', experienceYears: 12, consultationFee: 150, qualifications: 'MD, FACC' },
           { id: 2, userFullName: 'Michael Chen', specialization: 'NEUROLOGIST', experienceYears: 8, consultationFee: 200, qualifications: 'MBBS, MD' },
           { id: 3, userFullName: 'Emily Davis', specialization: 'PEDIATRICIAN', experienceYears: 5, consultationFee: 100, qualifications: 'MD' }
        ]);
        toast.error('Using offline mock data. API failed.');
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(() => fetchDoctors(), 500); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Find a Doctor</h1>
        <p className="text-gray-500 mb-6">Search from our network of highly qualified medical professionals.</p>
        
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by name, specialization..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {doctors.map(doctor => (
             <DoctorCard 
                key={doctor.id} 
                doctor={doctor} 
                onBook={(doc) => setSelectedDoctor(doc)} 
             />
          ))}
          {doctors.length === 0 && (
             <div className="col-span-full py-20 text-center text-gray-500">
                 No doctors found matching your search.
             </div>
          )}
        </div>
      )}

      {selectedDoctor && (
        <BookAppointmentModal 
          doctor={selectedDoctor} 
          onClose={() => setSelectedDoctor(null)} 
        />
      )}
    </div>
  );
};

export default DoctorListing;
