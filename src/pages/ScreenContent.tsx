import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Monitor, Calendar, Play, Pause, ArrowLeft, Image, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContentItem {
  id: string;
  campaign: {
    name: string;
    advertiser: {
      business_name: string;
    };
  } | null;
  screen: {
    name: string;
  } | null;
  creative: {
    title: string;
    public_url: string;
    file_type: string;
    duration_seconds?: number;
  } | null;
  start_datetime: string;
  end_datetime: string;
  status: string;
}

const ScreenContent = () => {
  const { user } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchContent();
    }
  }, [user]);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          start_datetime,
          end_datetime,
          status,
          screen:screens!inner(
            id,
            name,
            owner_id
          ),
          campaign:campaigns!inner(
            id,
            name,
            advertiser:user_profiles!inner(
              business_name
            )
          )
        `)
        .eq('screen.owner_id', user?.id)
        .eq('status', 'confirmed')
        .gte('end_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true });

      if (error) throw error;
      
      // Fetch creatives separately to avoid complex joins
      const bookingsWithCreatives = await Promise.all(
        (data || []).map(async (booking) => {
          const { data: creative } = await supabase
            .from('creatives')
            .select('id, title, public_url, file_type, duration_seconds')
            .eq('campaign_id', booking.campaign?.id)
            .single();
          
          return {
            ...booking,
            creative
          };
        })
      );
      
      setContent(bookingsWithCreatives as ContentItem[]);
    } catch (error: any) {
      toast({
        title: "Error fetching content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isCurrentlyPlaying = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (fileType?.startsWith('video/')) {
      return <Video className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
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
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Screen Content</h1>
          <p className="text-muted-foreground">Monitor content being displayed on your screens</p>
        </div>
      </div>

      {content.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Monitor className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No active content</h3>
            <p className="text-muted-foreground">
              When advertisers book your screens, their content will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {content.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(item.creative?.file_type)}
                      <CardTitle className="text-lg">{item.creative?.title || 'Untitled Creative'}</CardTitle>
                    </div>
                    {isCurrentlyPlaying(item.start_datetime, item.end_datetime) && (
                      <Badge variant="default" className="bg-green-600">
                        <Play className="mr-1 h-3 w-3" />
                        Live
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline">
                    {item.campaign?.name || 'Unknown Campaign'}
                  </Badge>
                </div>
                <CardDescription>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Monitor className="mr-1 h-4 w-4" />
                      {item.screen?.name}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDateTime(item.start_datetime)} - {formatDateTime(item.end_datetime)}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Advertiser:</span>
                    <span className="font-medium">{item.campaign?.advertiser?.business_name || 'Unknown Advertiser'}</span>
                  </div>
                  
                  {item.creative?.duration_seconds && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Duration:</span>
                      <span className="font-medium">{item.creative.duration_seconds} seconds</span>
                    </div>
                  )}

                  {item.creative?.public_url && (
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Preview:</span>
                      <div className="border rounded-lg p-4 bg-muted/50">
                        {item.creative.file_type?.startsWith('image/') ? (
                          <img 
                            src={item.creative.public_url} 
                            alt="Creative preview"
                            className="max-w-full h-32 object-contain mx-auto rounded"
                          />
                        ) : item.creative.file_type?.startsWith('video/') ? (
                          <video 
                            src={item.creative.public_url}
                            className="max-w-full h-32 object-contain mx-auto rounded"
                            controls
                            muted
                          />
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <Monitor className="mx-auto h-8 w-8 mb-2" />
                            <p>Preview not available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <div className="flex items-center space-x-2">
                        {isCurrentlyPlaying(item.start_datetime, item.end_datetime) ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-green-600">Currently Playing</span>
                          </>
                        ) : new Date(item.start_datetime) > new Date() ? (
                          <>
                            <Pause className="h-3 w-3 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-600">Scheduled</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-600">Completed</span>
                          </>
                        )}
                      </div>
                    </div>
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

export default ScreenContent;