
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Estate } from '@/types/estate';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import PropertyForm from '../properties/PropertyForm';

const PropertyManagement: React.FC = () => {
  const [estates, setEstates] = useState<Estate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEstate, setSelectedEstate] = useState<Estate | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [estateToDelete, setEstateToDelete] = useState<Estate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEstates();
  }, []);

  const fetchEstates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('Estate')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setEstates(data || []);
    } catch (error) {
      console.error('Error fetching estates:', error);
      toast({
        title: "Error",
        description: "Could not load properties",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedEstate(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (estate: Estate) => {
    setSelectedEstate(estate);
    setIsFormOpen(true);
  };

  const handleDelete = (estate: Estate) => {
    setEstateToDelete(estate);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!estateToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('Estate')
        .delete()
        .eq('id', estateToDelete.id);
        
      if (error) throw error;
      
      setEstates(estates.filter(e => e.id !== estateToDelete.id));
      toast({
        title: "Property deleted",
        description: `${estateToDelete.name} has been deleted successfully`
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting estate:', error);
      toast({
        title: "Error",
        description: "Could not delete the property",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchEstates();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Property Management</h2>
        <Button 
          onClick={handleAddNew}
          className="bg-estate-blue hover:bg-estate-darkBlue"
        >
          <Plus size={16} className="mr-2" />
          Add New Property
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-estate-blue" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No properties found. Click "Add New Property" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                estates.map((estate) => (
                  <TableRow key={estate.id}>
                    <TableCell className="font-medium">{estate.name}</TableCell>
                    <TableCell>{estate.location}</TableCell>
                    <TableCell>{estate.type || 'Land'}</TableCell>
                    <TableCell>{estate.phase || '-'}</TableCell>
                    <TableCell>{estate.size ? `${estate.size} sqm` : '-'}</TableCell>
                    <TableCell>
                      {estate.promo_price ? `₦${estate.promo_price.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(estate)}
                        className="mr-2"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(estate)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Property Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEstate ? `Edit ${selectedEstate.name}` : 'Add New Property'}
            </DialogTitle>
          </DialogHeader>
          <PropertyForm 
            estate={selectedEstate} 
            onCancel={() => setIsFormOpen(false)}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete {estateToDelete?.name}? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyManagement;
