import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Monitor, MapPin, DollarSign, Settings, ArrowLeft, Eye, EyeOff } from 'lucide-react';
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
  cms_api_url?: string;
  cms_api_key?: string;
  webhook_url?: string;
  created_at: string;
}

const ScreenInventory = () => {
  const { user } = useAuth();
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchScreens();
    }
  }, [user]);

  const fetchScreens = async () => {
    try {
      const { data, error } = await supabase
        .from('screens')
        .select('*')
        .eq('owner_id', user?.id)
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

  const toggleScreenStatus = async (screenId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('screens')
        .update({ is_active: !currentStatus })
        .eq('id', screenId);

      if (error) throw error;

      setScreens(screens.map(screen => 
        screen.id === screenId 
          ? { ...screen, is_active: !currentStatus }
          : screen
      ));

      toast({
        title: "Success",
        description: `Screen ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Screen Inventory</h1>
            <p className="text-muted-foreground">Manage your screens and monitor bookings</p>
          </div>
        </div>
        <Button asChild>
          <Link to="/screens/new">
            <Monitor className="mr-2 h-4 w-4" />
            Add New Screen
          </Link>
        </Button>
      </div>

      {screens.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Monitor className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No screens yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first screen to begin receiving bookings
            </p>
            <Button asChild>
              <Link to="/screens/new">Add Your First Screen</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {screens.map((screen) => (
            <Card key={screen.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-lg">
                    <Monitor className="mr-2 h-5 w-5" />
                    {screen.name}
                  </CardTitle>
                  <Badge variant={screen.is_active ? 'default' : 'secondary'}>
                    {screen.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {screen.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{screen.address}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <Badge variant="outline">{screen.screen_type}</Badge>
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

                  {screen.cms_api_url && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">CMS:</span>
                      <Badge variant="outline" className="text-green-600">Connected</Badge>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleScreenStatus(screen.id, screen.is_active)}
                      className="flex-1"
                    >
                      {screen.is_active ? (
                        <>
                          <EyeOff className="mr-1 h-3 w-3" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="mr-1 h-3 w-3" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/screens/${screen.id}/settings`}>
                        <Settings className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScreenInventory;