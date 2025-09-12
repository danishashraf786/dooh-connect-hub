import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Settings, Link2, ArrowLeft, Save, TestTube } from 'lucide-react';
import { Link } from 'react-router-dom';

const ScreenSettings = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  
  const [cmsSettings, setCmsSettings] = useState({
    apiUrl: '',
    apiKey: '',
    webhookUrl: '',
    contentSyncInterval: '15',
    autoApproveBookings: false,
    realtimeUpdates: true
  });

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In a real app, this would save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings saved successfully!",
        description: "Your CMS integration settings have been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      // In a real app, this would test the API connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Connection successful!",
        description: "Your CMS API is responding correctly.",
      });
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: "Unable to connect to your CMS API. Please check your settings.",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
          <h1 className="text-3xl font-bold flex items-center">
            <Settings className="mr-3 h-8 w-8" />
            Screen Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your CMS integration and real-time booking settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CMS Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Link2 className="mr-2 h-5 w-5" />
                CMS Integration
              </CardTitle>
              <CardDescription>
                Connect your content management system for real-time updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apiUrl">CMS API URL</Label>
                <Input
                  id="apiUrl"
                  value={cmsSettings.apiUrl}
                  onChange={(e) => setCmsSettings({ ...cmsSettings, apiUrl: e.target.value })}
                  placeholder="https://your-cms.com/api/v1"
                  type="url"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The base URL of your CMS API endpoint
                </p>
              </div>

              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={cmsSettings.apiKey}
                  onChange={(e) => setCmsSettings({ ...cmsSettings, apiKey: e.target.value })}
                  placeholder="Your CMS API key"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your CMS API authentication key
                </p>
              </div>

              <div>
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={cmsSettings.webhookUrl}
                  onChange={(e) => setCmsSettings({ ...cmsSettings, webhookUrl: e.target.value })}
                  placeholder="https://your-cms.com/webhooks/dooh"
                  type="url"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL to receive booking notifications
                </p>
              </div>

              <div>
                <Label htmlFor="syncInterval">Content Sync Interval (minutes)</Label>
                <Input
                  id="syncInterval"
                  type="number"
                  min="5"
                  max="60"
                  value={cmsSettings.contentSyncInterval}
                  onChange={(e) => setCmsSettings({ ...cmsSettings, contentSyncInterval: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  How often to sync content with your CMS
                </p>
              </div>

              <Button 
                onClick={handleTestConnection} 
                variant="outline" 
                disabled={testingConnection || !cmsSettings.apiUrl || !cmsSettings.apiKey}
                className="w-full"
              >
                <TestTube className="mr-2 h-4 w-4" />
                {testingConnection ? "Testing Connection..." : "Test Connection"}
              </Button>
            </CardContent>
          </Card>

          {/* Booking Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Settings</CardTitle>
              <CardDescription>
                Configure how bookings are handled and processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-approve bookings</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve booking requests
                  </p>
                </div>
                <Button
                  variant={cmsSettings.autoApproveBookings ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCmsSettings({ 
                    ...cmsSettings, 
                    autoApproveBookings: !cmsSettings.autoApproveBookings 
                  })}
                >
                  {cmsSettings.autoApproveBookings ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Real-time updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Push updates to CMS in real-time
                  </p>
                </div>
                <Button
                  variant={cmsSettings.realtimeUpdates ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCmsSettings({ 
                    ...cmsSettings, 
                    realtimeUpdates: !cmsSettings.realtimeUpdates 
                  })}
                >
                  {cmsSettings.realtimeUpdates ? "Enabled" : "Disabled"}
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Integration Benefits</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Real-time booking notifications to your CMS</li>
                  <li>• Automatic content scheduling</li>
                  <li>• Synchronized availability management</li>
                  <li>• Streamlined approval workflows</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>
              Integration endpoints and webhook formats for your CMS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Webhook Payload Example</h4>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "event": "booking.created",
  "booking": {
    "id": "booking_123",
    "screen_id": "screen_456",
    "campaign_name": "Summer Sale",
    "start_time": "2024-07-15T10:00:00Z",
    "end_time": "2024-07-15T18:00:00Z",
    "content": {
      "title": "Big Summer Sale",
      "image_url": "https://example.com/image.jpg",
      "call_to_action": "Visit store now!"
    }
  }
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Required CMS Endpoints</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">POST /content/schedule</p>
                    <p className="text-xs text-muted-foreground">Schedule content for display</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">DELETE /content/[id]</p>
                    <p className="text-xs text-muted-foreground">Remove scheduled content</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">GET /availability</p>
                    <p className="text-xs text-muted-foreground">Check screen availability</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">POST /booking/confirm</p>
                    <p className="text-xs text-muted-foreground">Confirm booking approval</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScreenSettings;