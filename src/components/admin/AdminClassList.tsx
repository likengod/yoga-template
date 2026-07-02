import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Edit, Trash2, Users, Star } from 'lucide-react';
import { OnlineClass } from '@/types/admin';

interface AdminClassListProps {
  classes: OnlineClass[];
  viewMode: 'grid' | 'list';
  onEdit: (classItem: OnlineClass) => void;
  onDelete: (id: string) => void;
}

const AdminClassList: React.FC<AdminClassListProps> = ({ classes, viewMode, onEdit, onDelete }) => {
  if (classes.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-yoga-forest/70">No classes created yet. Click "Add New Class" to get started.</p>
      </Card>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class Title</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((classItem) => (
              <TableRow key={classItem.id}>
                <TableCell className="font-medium">
                  {classItem.title}
                  {classItem.featured && (
                    <Star className="inline-block w-4 h-4 ml-2 text-yellow-500 fill-yellow-500" />
                  )}
                </TableCell>
                <TableCell>{classItem.instructor}</TableCell>
                <TableCell>{classItem.price}</TableCell>
                <TableCell>{classItem.duration}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-yoga-sage" />
                    <span className={`text-sm ${(classItem.availableSeats || 0) <= 3 ? 'text-red-600 font-medium' : 'text-yoga-forest'}`}>
                      {classItem.availableSeats || 0}/{classItem.maxSeats || 15}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={() => onEdit(classItem)}
                      variant="outline"
                      size="sm"
                      className="text-yoga-sage border-yoga-sage hover:bg-yoga-sage hover:text-white"
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => onDelete(classItem.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((classItem) => (
        <Card key={classItem.id} className="overflow-hidden">
          <div className="relative">
            <img loading="lazy" 
              src={classItem.image} 
              alt={classItem.title}
              className="w-full h-32 object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold">
              {classItem.price}
            </div>
            <div className="absolute top-2 right-2 bg-yoga-sage/90 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{classItem.availableSeats || 0}/{classItem.maxSeats || 15}</span>
            </div>
          </div>
          
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-yoga-forest flex items-center justify-between">
              {classItem.title}
              {classItem.featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
            </CardTitle>
            <p className="text-sm text-yoga-sage">with {classItem.instructor}</p>
          </CardHeader>

          <CardContent className="space-y-3">
            <p className="text-sm text-yoga-forest/80 line-clamp-2">{classItem.description}</p>
            
            <div className="text-xs space-y-1 text-yoga-forest/70">
              <div>Duration: {classItem.duration}</div>
              <div>Capacity: {classItem.capacity}</div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span className={`${(classItem.availableSeats || 0) <= 3 ? 'text-red-600 font-medium' : ''}`}>
                  Available: {classItem.availableSeats || 0} seats
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                onClick={() => onEdit(classItem)}
                variant="outline"
                size="sm"
                className="text-yoga-sage border-yoga-sage hover:bg-yoga-sage hover:text-white"
              >
                <Edit size={14} className="mr-1" />
                Edit
              </Button>
              <Button
                onClick={() => onDelete(classItem.id)}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 size={14} className="mr-1" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminClassList;
