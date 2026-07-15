import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

export interface BookingData {
  id: string;
  name: string;
  email: string;
  phone: string;
  classType: string;
  instructor: string;
  experience: string;
  preferredDate: string;
  preferredTime: string;
  specialRequests: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

interface BookingTableProps {
  paginatedBookings: BookingData[];
  selectedBookings: Set<string>;
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  classes: any[];
  isInstructor: boolean;
  updateBookingStatus: (id: string, status: 'confirmed' | 'cancelled' | 'pending') => void;
}

const BookingTable = ({
  paginatedBookings,
  selectedBookings,
  toggleSelect,
  toggleSelectAll,
  classes,
  isInstructor,
  updateBookingStatus
}: BookingTableProps) => {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={14} className="text-green-600" />;
      case 'cancelled': return <XCircle size={14} className="text-red-600" />;
      default: return <Clock size={14} className="text-yellow-600" />;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div 
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden",
        isInstructor && "select-none"
      )}
      onContextMenu={isInstructor ? (e) => e.preventDefault() : undefined}
      onCopy={isInstructor ? (e) => e.preventDefault() : undefined}
    >
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="w-12 text-center">
              <Checkbox 
                checked={paginatedBookings.length > 0 && selectedBookings.size === paginatedBookings.length}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedBookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                No bookings found matching your filters.
              </TableCell>
            </TableRow>
          ) : (
            paginatedBookings.map((booking) => {
              const classObj = classes.find(c => c.title === booking.classType);
              const classPrice = classObj?.price || 'N/A';

              return (
                <TableRow key={booking.id} className="hover:bg-gray-50/50">
                  <TableCell className="text-center">
                    <Checkbox 
                      checked={selectedBookings.has(booking.id)}
                      onCheckedChange={() => toggleSelect(booking.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-yoga-forest">{booking.name}</div>
                    <div className="text-xs text-gray-500">{booking.email}</div>
                    <div className="text-xs text-gray-400">{booking.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-700">{booking.classType}</div>
                    {booking.instructor && (
                      <div className="text-xs text-gray-600 font-medium">Instructor: {booking.instructor}</div>
                    )}
                    <div className="text-xs text-gray-500">{booking.experience || 'Not specified'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-yoga-forest">{classPrice}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-700">{formatDate(booking.preferredDate)}</div>
                    <div className="text-xs text-gray-500">{booking.preferredTime || 'Not specified'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`flex w-fit items-center gap-1.5 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="capitalize">{booking.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-yoga-sage hover:bg-yoga-sage/10">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent 
                          className={cn(isInstructor && "select-none")}
                          onContextMenu={isInstructor ? (e) => e.preventDefault() : undefined}
                          onCopy={isInstructor ? (e) => e.preventDefault() : undefined}
                        >
                          <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 text-sm mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div><span className="font-semibold text-gray-500">Name:</span> {booking.name}</div>
                              <div><span className="font-semibold text-gray-500">Phone:</span> {booking.phone}</div>
                              <div className="col-span-2"><span className="font-semibold text-gray-500">Email:</span> {booking.email}</div>
                              <div><span className="font-semibold text-gray-500">Class Type:</span> {booking.classType}</div>
                              <div><span className="font-semibold text-gray-500">Instructor:</span> {booking.instructor || 'None'}</div>
                              <div><span className="font-semibold text-gray-500">Amount:</span> {classPrice}</div>
                              <div><span className="font-semibold text-gray-500">Experience:</span> {booking.experience || 'None'}</div>
                              <div><span className="font-semibold text-gray-500">Date:</span> {formatDate(booking.preferredDate)}</div>
                              <div><span className="font-semibold text-gray-500">Time:</span> {booking.preferredTime || 'None'}</div>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-500">Special Requests:</span> 
                              <p className="mt-1 p-3 bg-gray-50 rounded-md border text-gray-700">{booking.specialRequests || 'None'}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {booking.status !== 'confirmed' && (
                        <Button size="sm" variant="outline" className="h-8 text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateBookingStatus(booking.id, 'confirmed')}>
                          Confirm
                        </Button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <Button size="sm" variant="outline" className="h-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateBookingStatus(booking.id, 'cancelled')}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BookingTable;
