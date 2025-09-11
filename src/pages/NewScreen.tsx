import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewScreen = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    screen_type: '',
    resolution: '',
    size_inches: '',
    hourly_rate: '',
    currency: 'USD',
    description: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || profile?.role !== 'screen_owner') {
      toast({
        title: "Error",
        description: "You must be a screen owner to add screens",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('screens')
        .insert({
          owner_id: user.id,
          name: formData.name,
          location: formData.location,
          address: formData.address,
          screen_type: formData.screen_type,
          resolution: formData.resolution,
          size_inches: parseInt(formData.size_inches),
          hourly_rate: parseFloat(formData.hourly_rate),
          currency: formData.currency,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Screen added successfully!",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p>Please sign in to add a screen.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profile?.role !== 'screen_owner') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p>Only screen owners can add screens.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center space-x-4 mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add New Screen</CardTitle>
          <CardDescription>
            Create a new screen listing for advertisers to discover and book
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Screen Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Downtown LED Billboard"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location/City *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., New York, NY"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="screen_type">Screen Type *</Label>
                  <Select value={formData.screen_type} onValueChange={(value) => handleInputChange('screen_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select screen type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="led_billboard">LED Billboard</SelectItem>
                      <SelectItem value="lcd_display">LCD Display</SelectItem>
                      <SelectItem value="digital_poster">Digital Poster</SelectItem>
                      <SelectItem value="video_wall">Video Wall</SelectItem>
                      <SelectItem value="outdoor_led">Outdoor LED</SelectItem>
                      <SelectItem value="indoor_display">Indoor Display</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="e.g., 123 Main Street, New York, NY 10001"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="resolution">Resolution *</Label>
                  <Select value={formData.resolution} onValueChange={(value) => handleInputChange('resolution', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                      <SelectItem value="3840x2160">3840x2160 (4K UHD)</SelectItem>
                      <SelectItem value="1366x768">1366x768 (HD)</SelectItem>
                      <SelectItem value="2560x1440">2560x1440 (2K QHD)</SelectItem>
                      <SelectItem value="7680x4320">7680x4320 (8K UHD)</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size_inches">Size (inches) *</Label>
                  <Input
                    id="size_inches"
                    type="number"
                    value={formData.size_inches}
                    onChange={(e) => handleInputChange('size_inches', e.target.value)}
                    placeholder="e.g., 55"
                    min="10"
                    max="1000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate ($) *</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    value={formData.hourly_rate}
                    onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                    placeholder="e.g., 150.00"
                    min="0.01"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Additional details about your screen, audience demographics, visibility, etc."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" asChild>
                <Link to="/dashboard">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Screen
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewScreen;