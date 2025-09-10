import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, TrendingUp, Users, Zap, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            DOOH Connect Hub
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            The premier marketplace connecting digital out-of-home screen owners with advertisers. 
            Streamline bookings, maximize revenue, and grow your reach.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/auth">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Link to="#features">
                    Learn More
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose DOOH Connect?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for both screen owners and advertisers to maximize success
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Monitor className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Real-Time Inventory</CardTitle>
                <CardDescription>
                  Dynamic availability tracking with smart calendar integration and conflict prevention
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive performance metrics, ROI tracking, and exportable reports
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Two-Sided Marketplace</CardTitle>
                <CardDescription>
                  Seamless connection between screen owners and advertisers with built-in communication
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>CMS Integration</CardTitle>
                <CardDescription>
                  Connect with Edge1, AIScreen, Doohlabs and other platforms for automated content deployment
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Check className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Integrated escrow system with automated invoicing and pro-rata calculations
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Monitor className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Smart Booking</CardTitle>
                <CardDescription>
                  Advanced filtering, bulk bookings, and dynamic pricing based on demand
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* For Screen Owners Section */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">For Screen Owners</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Maximize Revenue</h3>
                    <p className="text-muted-foreground">Dynamic pricing and high-demand booking optimization</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Easy Management</h3>
                    <p className="text-muted-foreground">Streamlined booking approvals and automated content deployment</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Performance Insights</h3>
                    <p className="text-muted-foreground">Detailed analytics on screen performance and revenue trends</p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="p-8">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl">Start Earning Today</CardTitle>
                <CardDescription>Join hundreds of screen owners maximizing their revenue</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Button asChild className="w-full" size="lg">
                  <Link to="/auth">List Your Screens</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Advertisers Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Card className="p-8 order-2 lg:order-1">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl">Launch Your Campaign</CardTitle>
                <CardDescription>Reach your audience with premium digital displays</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Button asChild className="w-full" size="lg">
                  <Link to="/auth">Start Advertising</Link>
                </Button>
              </CardContent>
            </Card>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">For Advertisers</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Smart Discovery</h3>
                    <p className="text-muted-foreground">Find perfect screens with advanced location and audience filtering</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">Campaign Control</h3>
                    <p className="text-muted-foreground">Flexible scheduling, frequency controls, and real-time performance tracking</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">ROI Optimization</h3>
                    <p className="text-muted-foreground">Detailed analytics and performance insights to maximize your advertising ROI</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your DOOH Experience?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join the leading marketplace for digital out-of-home advertising and start growing your business today.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
            <Link to="/auth">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
