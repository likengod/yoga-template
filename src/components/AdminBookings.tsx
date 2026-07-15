import React, { useState, useEffect, useMemo } from 'react';
import AdminLoadingSpinner from './admin/AdminLoadingSpinner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Trash2, Download } from 'lucide-react';
import BookingTable from './admin/bookings/BookingTable';
import { bookingService } from '@/services/database';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminPagination from './admin/AdminPagination';
import { useClassesData } from '@/hooks/useClassesData';
import { instructorsApi } from '@/services/mysqlApi';
import { useToast } from '@/hooks/use-toast';

interface BookingData {
  id: string;
  name: string;
  email: string;
  phone: string;
  classType: string;
  instructor: string;
  preferredDate: string;
  preferredTime: string;
  experience: string;
  specialRequests: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return new Date(dateStr).toLocaleDateString();
};

const ITEMS_PER_PAGE = 15;

interface AdminBookingsProps {
  isInstructor?: boolean;
  currentUsername?: string;
}

const AdminBookings = ({ isInstructor = false, currentUsername = '' }: AdminBookingsProps) => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectedInstructorName, setConnectedInstructorName] = useState<string | null>(null);
  
  // Bulk Selection
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());

  // Classes Data (for pricing)
  const { classes } = useClassesData();

  // Filters
  const [classFilter, setClassFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadBookings();
    if (isInstructor && currentUsername) {
      // Find the instructor profile whose connected_user matches this username
      instructorsApi.getAll().then((allInstructors: any[]) => {
        const linked = allInstructors.find(
          (inst: any) => inst.connected_user?.toLowerCase() === currentUsername.toLowerCase()
        );
        setConnectedInstructorName(linked ? linked.name : null);
      }).catch(() => setConnectedInstructorName(null));
    }
  }, [isInstructor, currentUsername]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const data = await bookingService.getBookings();
      const typedBookings = data.map((booking: any) => ({
        id: booking.id,
        name: booking.name,
        email: booking.email,
        phone: booking.phone || '',
        classType: booking.class_type || '',
        instructor: booking.instructor || '',
        preferredDate: booking.preferred_date || '',
        preferredTime: booking.preferred_time || '',
        experience: booking.experience || '',
        specialRequests: booking.special_requests || '',
        createdAt: booking.created_at || new Date().toISOString(),
        status: (booking.status || 'pending') as 'pending' | 'confirmed' | 'cancelled'
      }));
      setBookings(typedBookings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setSelectedBookings(new Set()); // Reset selections on load
    } catch (error) {
      console.error('AdminBookings: Error loading bookings:', error);
      toast({
        variant: "destructive",
        title: "Load Error",
        description: "Failed to load bookings from database.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    try {
      await bookingService.updateStatus(id, status);
      await loadBookings();
      toast({ title: "Booking Updated", description: `Booking status changed to ${status}.` });
    } catch (error) {
      console.error('AdminBookings: Error updating booking status:', error);
      toast({ variant: "destructive", title: "Update Error", description: "Failed to update booking status." });
    }
  };

  const deleteBookingHandler = async (id: string) => {
    try {
      await bookingService.deleteBooking(id);
      await loadBookings();
      toast({ title: "Booking Deleted", description: "The booking has been deleted successfully." });
    } catch (error) {
      console.error('AdminBookings: Error deleting booking:', error);
      toast({ variant: "destructive", title: "Delete Error", description: "Failed to delete booking." });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBookings.size === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedBookings.size} selected bookings?`)) return;

    try {
      setIsLoading(true);
      // Delete in parallel for better performance
      await Promise.all(Array.from(selectedBookings).map(id => bookingService.deleteBooking(id)));
      toast({ title: "Bookings Deleted", description: `Successfully deleted ${selectedBookings.size} bookings.` });
      setSelectedBookings(new Set());
      await loadBookings();
    } catch (error) {
      console.error('AdminBookings: Error during bulk delete:', error);
      toast({ variant: "destructive", title: "Bulk Delete Error", description: "Failed to delete some bookings." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (isInstructor) return;
    // Export currently filtered bookings
    const exportData = filteredBookings;

    if (exportData.length === 0) {
      toast({ title: "Export Failed", description: "No data available to export.", variant: "destructive" });
      return;
    }

    const headers = ['ID', 'Customer Name', 'Email', 'Phone', 'Class Type', 'Amount', 'Experience', 'Preferred Date', 'Preferred Time', 'Status', 'Created At'];
    
    const csvRows = [headers.join(',')];
    
    exportData.forEach(booking => {
      const classObj = classes.find(c => c.title === booking.classType);
      const amount = classObj?.price || 'N/A';
      const cleanAmount = amount.replace(/,/g, ''); // Remove commas to not break CSV
      const row = [
        `"${booking.id}"`,
        `"${booking.name}"`,
        `"${booking.email}"`,
        `"${booking.phone}"`,
        `"${booking.classType}"`,
        `"${cleanAmount}"`,
        `"${booking.experience}"`,
        `"${new Date(booking.preferredDate).toLocaleDateString()}"`,
        `"${booking.preferredTime}"`,
        `"${booking.status}"`,
        `"${new Date(booking.createdAt).toISOString()}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bookings-export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      // Instructor role: only show bookings for their connected instructor profile
      if (isInstructor) {
        if (!connectedInstructorName) return false; // no linked profile → show nothing
        if (booking.instructor?.toLowerCase() !== connectedInstructorName.toLowerCase()) return false;
      }

      // Class filter
      if (classFilter && !booking.classType.toLowerCase().includes(classFilter.toLowerCase())) {
        return false;
      }
      
      // Date filter (using preferredDate)
      if (dateFilter !== 'all') {
        const bookingDate = new Date(booking.preferredDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diffTime = today.getTime() - bookingDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateFilter === 'today' && diffDays !== 0) return false;
        if (dateFilter === 'yesterday' && diffDays !== 1) return false;
        if (dateFilter === 'last7' && (diffDays < 0 || diffDays > 7)) return false;
        if (dateFilter === 'last30' && (diffDays < 0 || diffDays > 30)) return false;
      }
      
      // Status filter
      if (statusFilter !== 'all' && booking.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
  }, [bookings, classFilter, dateFilter, statusFilter, isInstructor, connectedInstructorName]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleSelectAll = () => {
    if (selectedBookings.size === paginatedBookings.length && paginatedBookings.length > 0) {
      setSelectedBookings(new Set());
    } else {
      const newSelected = new Set<string>();
      paginatedBookings.forEach(b => newSelected.add(b.id));
      setSelectedBookings(newSelected);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedBookings);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBookings(newSelected);
  };

  useEffect(() => {
    setCurrentPage(1);
    setSelectedBookings(new Set()); // Reset selections on filter change
  }, [classFilter, dateFilter, statusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-yoga-forest">Manage Bookings</h2>
        <AdminLoadingSpinner message="Loading bookings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructor info banner */}
      {isInstructor && (
        connectedInstructorName ? (
          <div className="flex items-center gap-2 bg-yoga-sage/10 border border-yoga-sage/30 rounded-lg px-4 py-3 text-sm text-yoga-forest">
            <span className="text-yoga-sage font-bold">🔒</span>
            <span>Viewing bookings for your instructor profile: <strong>{connectedInstructorName}</strong></span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 text-sm text-amber-800">
            <span>⚠️</span>
            <span>Your user account (<strong>{currentUsername}</strong>) is not linked to any instructor profile yet. Ask an admin to connect your account in <em>Manage Instructors</em>.</span>
          </div>
        )
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-yoga-forest">Manage Bookings</h2>
          <div className="text-sm text-yoga-forest/70 font-medium bg-yoga-sage/10 px-3 py-1 rounded-full">
            Total: {filteredBookings.length} bookings
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {selectedBookings.size > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedBookings.size})
            </Button>
          )}

          {!isInstructor && (
            <Button 
              size="sm" 
              onClick={handleExportCSV}
              className="h-9 bg-yoga-sage hover:bg-yoga-sage/90 shadow-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search by Class Type..." 
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Class Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7">Last 7 Days</SelectItem>
              <SelectItem value="last30">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table View */}
      <BookingTable 
        paginatedBookings={paginatedBookings}
        selectedBookings={selectedBookings}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        classes={classes}
        isInstructor={isInstructor}
        updateBookingStatus={updateBookingStatus}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <AdminPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
