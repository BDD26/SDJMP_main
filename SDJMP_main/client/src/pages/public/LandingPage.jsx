import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  Building2,
  CheckCircle2,
  TrendingUp,
  Users,
  Award,
  Target,
  Zap,
  BarChart3,
  Shield,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { landingStats as stats, features, testimonials, topSkills } from '@/config/content'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-8 max-w-3xl mx-auto animate-fade-up">
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              Skill-Based Discovery
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Connect Your{' '}
              <span className="text-primary">Skills</span> with{' '}
              <span className="text-primary">Opportunities</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty">
              SkillMatch connects talented students 
              with top employers through skill-based matching. Build your profile, showcase your skills, and land your dream job.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isAuthenticated && (
                <Button size="lg" className="animate-pulse-scale" asChild>
                  <Link to="/register">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button size="lg" variant={isAuthenticated ? "default" : "outline"} asChild>
                <Link to="/jobs">Browse Jobs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30 animate-fade-up delay-100">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className={`flex flex-col items-center text-center gap-2 animate-fade-up delay-${(i % 4) * 100}`}>
                  <Icon className="h-8 w-8 text-primary mb-2" />
                  <span className="text-3xl md:text-4xl font-bold">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12 animate-fade-up delay-200">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SkillMatch?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform is designed to make job searching and hiring more efficient and effective.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className={`relative overflow-hidden animate-fade-up delay-${(i % 4) * 100}`}>
                  <CardHeader>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4 animate-float">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Create Your Profile',
                description: 'Sign up and add your skills, education, and experience to create a comprehensive profile.',
                icon: Users,
              },
              {
                step: '02',
                title: 'Take Assessments',
                description: 'Validate your skills through our assessment tests and earn badges to stand out.',
                icon: Award,
              },
              {
                step: '03',
                title: 'Get Matched',
                description: 'Our algorithm connects you with relevant jobs based on your skills and preferences.',
                icon: Target,
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="relative text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                        {item.step}
                      </div>
                      <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-background border-2 border-primary">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Trending Skills Section */}
      <section className="py-20 md:py-28">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12 animate-fade-up delay-100">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Trending Skills</h2>
              <p className="text-muted-foreground">Most in-demand skills in the job market</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/skills">
                View All Skills
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topSkills.map((skill) => (
              <Card key={skill.name} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-sm text-muted-foreground">{skill.demand} Demand</p>
                    </div>
                  </div>
                  <Badge variant="success" className="bg-success/10 text-success border-success/20">
                    {skill.growth}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from students and employers who have found success with SkillMatch
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="relative">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <svg
                      className="h-8 w-8 text-primary/20"
                      fill="currentColor"
                      viewBox="0 0 32 32"
                    >
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground mb-6">{testimonial.quote}</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <Card className="bg-primary text-primary-foreground overflow-hidden">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Start Your Career Journey?
                </h2>
                <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
                  Join thousands of students and employers who are already using SkillMatch 
                  to connect skills with opportunities.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" asChild>
                    <Link to="/register">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      I am a Student
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10" asChild>
                    <Link to="/register">
                      <Building2 className="mr-2 h-4 w-4" />
                      I am an Employer
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  )
}
