import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Eye, Search, Trash2, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { bookingService } from '@/services/database';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useClassesData } from '@/hooks/useClassesData';

interface BookingData {
  id: string;
  name: string;
  email: string;
  phone: string;
  classType: string;
  preferredDate: string;
  preferredTime: string;
  experience: string;
  specialRequests: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

const ITEMS_PER_PAGE = 15;

const AdminBookings = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Bulk Selection
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());

  // Classes Data (for pricing)
  const { classes } = useClassesData();

  // Filters
  const [classFilter, setClassFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // CSV Export Filter State
  const [exportTimeframe, setExportTimeframe] = useState('all');

  useEffect(() => {
    loadBookings();
  }, []);

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
      // Delete sequentially or parallel depending on API limits
      for (const id of Array.from(selectedBookings)) {
        await bookingService.deleteBooking(id);
      }
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
    // Filter bookings based on export timeframe
    const now = new Date();
    const exportData = bookings.filter(booking => {
      if (exportTimeframe === 'all') return true;
      
      const createdAt = new Date(booking.createdAt);
      const diffTime = now.getTime() - createdAt.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (exportTimeframe === '1month') return diffDays <= 30;
      if (exportTimeframe === '3months') return diffDays <= 90;
      if (exportTimeframe === '1year') return diffDays <= 365;
      
      return true;
    });

    if (exportData.length === 0) {
      toast({ title: "Export Failed", description: "No data available for the selected timeframe.", variant: "destructive" });
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
    link.setAttribute("download", `bookings-export-${exportTimeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
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
      
      return true;
    });
  }, [bookings, classFilter, dateFilter]);

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
  }, [classFilter, dateFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-yoga-forest">Manage Bookings</h2>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yoga-sage mx-auto mb-4"></div>
          <p className="text-yoga-forest">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

          <div className="flex items-center bg-white border rounded-md shadow-sm">
            <Select value={exportTimeframe} onValueChange={setExportTimeframe}>
              <SelectTrigger className="border-0 focus:ring-0 w-[140px] rounded-r-none h-9">
                <SelectValue placeholder="Export Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="1month">1 Month</SelectItem>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              onClick={handleExportCSV}
              className="rounded-l-none h-9 bg-yoga-sage hover:bg-yoga-sage/90 border-l border-yoga-sage/20"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
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
      </div>

      {/* Table View */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
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
                      <div className="text-xs text-gray-500">{booking.experience || 'Not specified'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-yoga-forest">{classPrice}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-700">{new Date(booking.preferredDate).toLocaleDateString()}</div>
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
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Booking Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 text-sm mt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div><span className="font-semibold text-gray-500">Name:</span> {booking.name}</div>
                                <div><span className="font-semibold text-gray-500">Phone:</span> {booking.phone}</div>
                                <div className="col-span-2"><span className="font-semibold text-gray-500">Email:</span> {booking.email}</div>
                                <div><span className="font-semibold text-gray-500">Class Type:</span> {booking.classType}</div>
                                <div><span className="font-semibold text-gray-500">Amount:</span> {classPrice}</div>
                                <div><span className="font-semibold text-gray-500">Experience:</span> {booking.experience || 'None'}</div>
                                <div><span className="font-semibold text-gray-500">Date:</span> {new Date(booking.preferredDate).toLocaleDateString()}</div>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
