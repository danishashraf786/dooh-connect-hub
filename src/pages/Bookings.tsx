import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, DollarSign, Monitor, Clock, ArrowLeft, Check, X, Eye, FileImage, FileVideo } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Booking {
  id: string;
  campaign_id: string;
  screen_id: string;
  start_datetime: string;
  end_datetime: string;
  total_cost: number;
  status: string;
  created_at: string;
  campaigns: {
    name: string;
    advertiser_id: string;
    user_profiles: {
      business_name: string;
      contact_email: string;
    };
    creatives?: {
      id: string;
      title: string;
      description: string;
      public_url: string;
      file_type: string;
    };
  };
  screens: {
    name: string;
    location: string;
    owner_id: string;
  };
}

const Bookings = () => {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          campaigns!inner (
            name,
            advertiser_id,
            user_profiles!campaigns_advertiser_id_fkey (
              business_name,
              contact_email
            ),
            creatives (
              id,
              title,
              description,
              public_url,
              file_type
            )
          ),
          screens!inner (
            name,
            location,
            owner_id
          )
        `);

      // Filter based on user role
      if (profile?.role === 'advertiser') {
        query = query.eq('campaigns.advertiser_id', user.id);
      } else {
        query = query.eq('screens.owner_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching bookings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: `Booking ${status}`,
        description: `The booking has been ${status} successfully.`,
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        title: "Error updating booking",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const hours = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
    return hours;
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => b.status === 'approved');
  const completedBookings = bookings.filter(b => ['rejected', 'completed'].includes(b.status));

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
        <div>
          <h1 className="text-3xl font-bold">
            {profile?.role === 'advertiser' ? 'My Bookings' : 'Booking Requests'}
          </h1>
          <p className="text-muted-foreground">
            {profile?.role === 'advertiser' 
              ? 'Track your screen bookings and campaign performance' 
              : 'Manage booking requests for your screens'
            }
          </p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeBookings.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Monitor className="mr-2 h-5 w-5" />
                          {booking.screens.name}
                        </CardTitle>
                        <CardDescription>
                          Campaign: {booking.campaigns.name}
                          {profile?.role === 'screen_owner' && (
                            <> • By: {booking.campaigns.user_profiles.business_name}</>
                          )}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{booking.screens.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {calculateDuration(booking.start_datetime, booking.end_datetime)}h
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Cost</p>
                        <p className="font-medium flex items-center">
                          <DollarSign className="mr-1 h-4 w-4" />
                          {booking.total_cost}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Requested</p>
                        <p className="font-medium">{formatDateTime(booking.created_at)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Start Time</p>
                        <p className="font-medium flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {formatDateTime(booking.start_datetime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">End Time</p>
                        <p className="font-medium flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {formatDateTime(booking.end_datetime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      {booking.campaigns.creatives && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              Preview Content
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Campaign Content Preview</DialogTitle>
                              <DialogDescription>
                                Review the content for "{booking.campaigns.name}"
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Content Details</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Title:</span> {booking.campaigns.creatives.title || 'No title'}
                                  </div>
                                  <div>
                                    <span className="font-medium">Type:</span> 
                                    <span className="ml-2 inline-flex items-center">
                                      {booking.campaigns.creatives.file_type?.startsWith('image/') ? (
                                        <><FileImage className="mr-1 h-4 w-4" /> Image</>
                                      ) : (
                                        <><FileVideo className="mr-1 h-4 w-4" /> Video</>
                                      )}
                                    </span>
                                  </div>
                                </div>
                                {booking.campaigns.creatives.description && (
                                  <div className="mt-2">
                                    <span className="font-medium">Description:</span>
                                    <p className="text-muted-foreground">{booking.campaigns.creatives.description}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="border rounded-lg p-4 bg-gray-50">
                                <h4 className="font-medium mb-2">Preview</h4>
                                {booking.campaigns.creatives.file_type?.startsWith('image/') ? (
                                  <img 
                                    src={booking.campaigns.creatives.public_url} 
                                    alt={booking.campaigns.creatives.title || 'Campaign content'}
                                    className="max-w-full h-auto rounded"
                                    style={{ maxHeight: '400px' }}
                                  />
                                ) : booking.campaigns.creatives.file_type?.startsWith('video/') ? (
                                  <video 
                                    src={booking.campaigns.creatives.public_url}
                                    controls
                                    className="max-w-full h-auto rounded"
                                    style={{ maxHeight: '400px' }}
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                ) : (
                                  <div className="text-center py-8 text-muted-foreground">
                                    Content preview not available
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      
                      {profile?.role === 'screen_owner' && booking.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, 'rejected')}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, 'approved')}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {pendingBookings.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No pending bookings</h3>
                  <p className="text-muted-foreground">
                    {profile?.role === 'advertiser' 
                      ? 'All your bookings have been processed.' 
                      : 'No new booking requests at the moment.'
                    }
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="active">
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Monitor className="mr-2 h-5 w-5" />
                          {booking.screens.name}
                        </CardTitle>
                        <CardDescription>
                          Campaign: {booking.campaigns.name}
                        </CardDescription>
                      </div>
                      <Badge variant="default" className="bg-green-500">
                        Live
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Running Time</p>
                        <p className="font-medium flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          {formatDateTime(booking.start_datetime)} - {formatDateTime(booking.end_datetime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="font-medium flex items-center text-green-600">
                          <DollarSign className="mr-1 h-4 w-4" />
                          {booking.total_cost}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {activeBookings.length === 0 && (
                <div className="text-center py-12">
                  <Monitor className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No active bookings</h3>
                  <p className="text-muted-foreground">
                    No campaigns are currently running on your screens.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="space-y-4">
              {completedBookings.map((booking) => (
                <Card key={booking.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Monitor className="mr-2 h-5 w-5" />
                          {booking.screens.name}
                        </CardTitle>
                        <CardDescription>
                          Campaign: {booking.campaigns.name}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{calculateDuration(booking.start_datetime, booking.end_datetime)}h</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-medium">${booking.total_cost}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="font-medium">{formatDateTime(booking.end_datetime)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {completedBookings.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No completed bookings</h3>
                  <p className="text-muted-foreground">
                    Completed and rejected bookings will appear here.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Bookings;