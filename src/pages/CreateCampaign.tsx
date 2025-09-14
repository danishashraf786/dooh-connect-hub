import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, DollarSign, Upload, ArrowLeft, FileVideo, FileImage, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateCampaign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
    content: {
      title: '',
      description: '',
      imageUrl: '',
      videoUrl: '',
      callToAction: ''
    }
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('creatives')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from('creatives')
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      setUploadProgress(10);

      // Create campaign first
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          name: formData.name,
          description: formData.description,
          budget: parseFloat(formData.budget),
          start_date: formData.startDate,
          end_date: formData.endDate,
          advertiser_id: user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (campaignError) throw campaignError;
      setUploadProgress(30);

      let creativeId = null;

      // Handle file upload if present
      if (uploadedFile) {
        setUploadProgress(40);
        const publicUrl = await handleFileUpload(uploadedFile);
        setUploadProgress(70);

        // Create creative record
        const { data: creative, error: creativeError } = await supabase
          .from('creatives')
          .insert({
            advertiser_id: user.id,
            campaign_id: campaign.id,
            title: formData.content.title,
            description: formData.content.description,
            public_url: publicUrl,
            file_type: uploadedFile.type,
            storage_path: `${user.id}/${Date.now()}.${uploadedFile.name.split('.').pop()}`
          })
          .select()
          .single();

        if (creativeError) throw creativeError;
        creativeId = creative.id;
        setUploadProgress(90);

        // Update campaign with creative_id
        const { error: updateError } = await supabase
          .from('campaigns')
          .update({ creative_id: creativeId })
          .eq('id', campaign.id);

        if (updateError) throw updateError;
      }

      setUploadProgress(100);

      toast({
        title: "Campaign created successfully!",
        description: "You can now discover screens and book them for your campaign.",
      });

      navigate('/campaigns');
    } catch (error: any) {
      toast({
        title: "Error creating campaign",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
          <h1 className="text-3xl font-bold">Create New Campaign</h1>
          <p className="text-muted-foreground">Set up your advertising campaign and create engaging content.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="mr-2 h-5 w-5" />
                  Campaign Details
                </CardTitle>
                <CardDescription>Basic information about your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Summer Sale 2024"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your campaign goals and target audience..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="budget" className="flex items-center">
                    <DollarSign className="mr-1 h-4 w-4" />
                    Total Budget
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="1000.00"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Campaign Content
                </CardTitle>
                <CardDescription>Create the content that will be displayed on screens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contentTitle">Content Title</Label>
                  <Input
                    id="contentTitle"
                    value={formData.content.title}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      content: { ...formData.content, title: e.target.value }
                    })}
                    placeholder="Big Summer Sale!"
                  />
                </div>

                <div>
                  <Label htmlFor="contentDescription">Content Description</Label>
                  <Textarea
                    id="contentDescription"
                    value={formData.content.description}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      content: { ...formData.content, description: e.target.value }
                    })}
                    placeholder="Up to 50% off all items this weekend only!"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="fileUpload">Upload Creative File</Label>
                  <div className="space-y-2">
                    <input
                      id="fileUpload"
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadedFile(file);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('fileUpload')?.click()}
                        className="flex items-center"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Choose File
                      </Button>
                      {uploadedFile && (
                        <div className="flex items-center space-x-2">
                          {uploadedFile.type.startsWith('image/') ? (
                            <FileImage className="h-4 w-4 text-blue-500" />
                          ) : (
                            <FileVideo className="h-4 w-4 text-purple-500" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {uploadedFile.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setUploadedFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  OR
                </div>

                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.content.imageUrl}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      content: { ...formData.content, imageUrl: e.target.value }
                    })}
                    placeholder="https://example.com/image.jpg"
                    disabled={!!uploadedFile}
                  />
                </div>

                <div>
                  <Label htmlFor="videoUrl">Video URL (Optional)</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={formData.content.videoUrl}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      content: { ...formData.content, videoUrl: e.target.value }
                    })}
                    placeholder="https://example.com/video.mp4"
                    disabled={!!uploadedFile}
                  />
                </div>

                <div>
                  <Label htmlFor="callToAction">Call to Action</Label>
                  <Input
                    id="callToAction"
                    value={formData.content.callToAction}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      content: { ...formData.content, callToAction: e.target.value }
                    })}
                    placeholder="Visit our store now!"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link to="/dashboard">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;