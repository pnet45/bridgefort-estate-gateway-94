import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Loader2, Building, Eye } from 'lucide-react';
import PropertyForm from '../properties/PropertyForm';
import { logAdminActivity } from './AdminActivityLogs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Estate {
  id: string;
  name: string;
  location: string | null;
  type: string | null;
  phase: number | null;
  size: number | null;
  promo_price: number | null;
  prelaunch_price: number | null;
  actual_price: number | null;
  title: string | null;
  description: string | null;
  sub_form: string | null;
  media: string[] | null;
  scheme: number | null;
  total_plots: number | null;
  sold_plots: number | null;
  created_at: string | null;
  property_category: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  is_for_sale: boolean | null;
  is_for_rent: boolean | null;
  monthly_rent: number | null;
  annual_rent: number | null;
}

const AdminPropertyManagement: React.FC = () => {
  const [estates, setEstates] = useState<Estate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEstate, setSelectedEstate] = useState<Estate | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [estateToDelete, setEstateToDelete] = useState<Estate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEstates();

    // Real-time updates
    const channel = supabase
      .channel('estate-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'estate' }, fetchEstates)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEstates = async () => {
    try {
      const { data, error } = await supabase
        .from('estate')
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
        .from('estate')
        .delete()
        .eq('id', estateToDelete.id);
        
      if (error) throw error;
      
      await logAdminActivity(
        'property_deleted',
        `Deleted property: ${estateToDelete.name}`,
        'property',
        estateToDelete.id
      );

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

  const handleFormSuccess = async () => {
    const action = selectedEstate ? 'property_updated' : 'property_created';
    const description = selectedEstate 
      ? `Updated property: ${selectedEstate.name}` 
      : 'Created new property';

    await logAdminActivity(action, description, 'property', selectedEstate?.id);
    
    setIsFormOpen(false);
    fetchEstates();
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-900/30 rounded-lg">
            <Building className="h-5 w-5 text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Property Management</h2>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : estates.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-12 w-12 mx-auto text-slate-500 mb-4" />
          <p className="text-slate-400 mb-4">No properties found</p>
          <Button onClick={handleAddNew}>Add Your First Property</Button>
        </div>
      ) : (
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700 hover:bg-slate-700/50">
                <TableHead className="text-slate-300">Name</TableHead>
                <TableHead className="text-slate-300">Location</TableHead>
                <TableHead className="text-slate-300">Type</TableHead>
                <TableHead className="text-slate-300">Price</TableHead>
                <TableHead className="text-slate-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estates.map((estate) => (
                <TableRow key={estate.id} className="border-slate-700 hover:bg-slate-700/50">
                  <TableCell className="font-medium text-white">{estate.name}</TableCell>
                  <TableCell className="text-slate-300">{estate.location || '-'}</TableCell>
                  <TableCell className="text-slate-300">{estate.type || 'Land'}</TableCell>
                  <TableCell className="text-slate-300">
                    {estate.promo_price ? `₦${estate.promo_price.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(estate)}
                        className="h-8 w-8 text-slate-400 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(estate)}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedEstate ? `Edit ${selectedEstate.name}` : 'Add New Property'}
            </DialogTitle>
          </DialogHeader>
          <PropertyForm 
            estate={selectedEstate as any} 
            onCancel={() => setIsFormOpen(false)}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-slate-300">
            Are you sure you want to delete <strong>{estateToDelete?.name}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-4">
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

export default AdminPropertyManagement;
