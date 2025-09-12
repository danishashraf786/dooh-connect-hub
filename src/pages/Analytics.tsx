import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, DollarSign, Monitor, Calendar, Eye, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Analytics = () => {
  const { profile } = useAuth();
  const [dateRange, setDateRange] = useState('30d');

  // Mock data - in real app, this would come from your analytics service
  const advertiserStats = {
    totalSpend: 12450,
    impressions: 156789,
    clickThrough: 2.3,
    activeCampaigns: 4,
    screenHours: 320,
    avgCost: 38.9
  };

  const screenOwnerStats = {
    totalRevenue: 8750,
    totalBookings: 28,
    occupancyRate: 78,
    activeScreens: 6,
    avgHourlyRate: 85,
    totalHours: 520
  };

  const campaignPerformance = [
    { name: 'Summer Sale', impressions: 45600, spend: 3200, ctr: 2.8 },
    { name: 'Brand Awareness', impressions: 38900, spend: 2800, ctr: 1.9 },
    { name: 'Product Launch', impressions: 52300, spend: 4100, ctr: 3.2 },
    { name: 'Holiday Special', impressions: 20000, spend: 2350, ctr: 2.1 }
  ];

  const screenPerformance = [
    { name: 'Downtown Plaza', bookings: 8, revenue: 2400, occupancy: 85 },
    { name: 'Mall Entrance', bookings: 6, revenue: 1800, occupancy: 72 },
    { name: 'Transit Hub', bookings: 9, revenue: 2700, occupancy: 91 },
    { name: 'Shopping Center', bookings: 5, revenue: 1850, occupancy: 65 }
  ];

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
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              {profile?.role === 'advertiser' 
                ? 'Track your campaign performance and ROI' 
                : 'Monitor your screen revenue and performance'
              }
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant={dateRange === '7d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setDateRange('7d')}
            >
              7 Days
            </Button>
            <Button 
              variant={dateRange === '30d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setDateRange('30d')}
            >
              30 Days
            </Button>
            <Button 
              variant={dateRange === '90d' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setDateRange('90d')}
            >
              90 Days
            </Button>
          </div>
        </div>

        {profile?.role === 'advertiser' ? (
          <>
            {/* Advertiser Analytics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${advertiserStats.totalSpend.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+12% from last period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{advertiserStats.impressions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+8% from last period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{advertiserStats.clickThrough}%</div>
                  <p className="text-xs text-muted-foreground">+0.5% from last period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{advertiserStats.activeCampaigns}</div>
                  <p className="text-xs text-muted-foreground">2 ending this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Screen Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{advertiserStats.screenHours}</div>
                  <p className="text-xs text-muted-foreground">Across all campaigns</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Cost/Hour</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${advertiserStats.avgCost}</div>
                  <p className="text-xs text-muted-foreground">-3% from last period</p>
                </CardContent>
              </Card>
            </div>

            {/* Campaign Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Performance metrics for your active campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignPerformance.map((campaign, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">Campaign</p>
                      </div>
                      <div>
                        <p className="font-medium">{campaign.impressions.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Impressions</p>
                      </div>
                      <div>
                        <p className="font-medium">${campaign.spend.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Spend</p>
                      </div>
                      <div>
                        <p className="font-medium">{campaign.ctr}%</p>
                        <p className="text-sm text-muted-foreground">CTR</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Screen Owner Analytics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${screenOwnerStats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+15% from last period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{screenOwnerStats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">+6 from last period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{screenOwnerStats.occupancyRate}%</div>
                  <p className="text-xs text-muted-foreground">+5% from last period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Screens</CardTitle>
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{screenOwnerStats.activeScreens}</div>
                  <p className="text-xs text-muted-foreground">1 under maintenance</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Hourly Rate</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${screenOwnerStats.avgHourlyRate}</div>
                  <p className="text-xs text-muted-foreground">Across all screens</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{screenOwnerStats.totalHours}</div>
                  <p className="text-xs text-muted-foreground">Booked this period</p>
                </CardContent>
              </Card>
            </div>

            {/* Screen Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Screen Performance</CardTitle>
                <CardDescription>Revenue and occupancy metrics for your screens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {screenPerformance.map((screen, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{screen.name}</p>
                        <p className="text-sm text-muted-foreground">Screen Location</p>
                      </div>
                      <div>
                        <p className="font-medium">{screen.bookings}</p>
                        <p className="text-sm text-muted-foreground">Bookings</p>
                      </div>
                      <div>
                        <p className="font-medium">${screen.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                      </div>
                      <div>
                        <p className="font-medium">{screen.occupancy}%</p>
                        <p className="text-sm text-muted-foreground">Occupancy</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;