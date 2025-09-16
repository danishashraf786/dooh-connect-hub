import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Monitor, MapPin, DollarSign, Search, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Screen {
  id: string;
  name: string;
  location: string;
  address: string;
  screen_type: string;
  size_inches: number;
  resolution: string;
  hourly_rate: number;
  currency: string;
  is_active: boolean;
  owner: {
    business_name: string;
  };
}

const DiscoverScreens = () => {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScreens, setSelectedScreens] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchScreens();
  }, []);

  const fetchScreens = async () => {
    try {
      const { data, error } = await supabase
        .from('screens')
        .select(`
          *,
          owner:user_profiles!screens_owner_id_fkey(
            business_name
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScreens(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching screens",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredScreens = screens.filter(screen =>
    screen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    screen.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    screen.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleScreenSelection = (screenId: string) => {
    const newSelection = new Set(selectedScreens);
    if (newSelection.has(screenId)) {
      newSelection.delete(screenId);
    } else {
      newSelection.add(screenId);
    }
    setSelectedScreens(newSelection);
  };

  const handleBookSelected = () => {
    if (selectedScreens.size === 0) {
      toast({
        title: "No screens selected",
        description: "Please select at least one screen to proceed with booking.",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to booking page with selected screen IDs
    const screenIds = Array.from(selectedScreens).join(',');
    window.location.href = `/booking?screens=${screenIds}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Discover Screens</h1>
            <p className="text-muted-foreground">Find the perfect screens for your advertising campaign</p>
          </div>
          {selectedScreens.size > 0 && (
            <Button onClick={handleBookSelected} className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Book {selectedScreens.size} Screen{selectedScreens.size !== 1 ? 's' : ''}
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by location, name, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Screens Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScreens.map((screen) => (
            <Card 
              key={screen.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedScreens.has(screen.id) ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => toggleScreenSelection(screen.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg">
                    <Monitor className="mr-2 h-5 w-5" />
                    {screen.name}
                  </CardTitle>
                  <Badge variant={selectedScreens.has(screen.id) ? 'default' : 'outline'}>
                    {selectedScreens.has(screen.id) ? 'Selected' : 'Available'}
                  </Badge>
                </div>
                <CardDescription className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {screen.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{screen.address}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Owner:</span>
                    <span className="text-sm font-medium">{screen.owner?.business_name || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <Badge variant="secondary">{screen.screen_type}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Size:</span>
                    <span className="text-sm font-medium">{screen.size_inches}"</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Resolution:</span>
                    <span className="text-sm font-medium">{screen.resolution}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="flex items-center text-lg font-bold text-primary">
                      <DollarSign className="h-4 w-4" />
                      {screen.hourly_rate}
                    </span>
                    <span className="text-sm text-muted-foreground">per hour</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredScreens.length === 0 && (
          <div className="text-center py-12">
            <Monitor className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No screens found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'No screens are currently available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverScreens;