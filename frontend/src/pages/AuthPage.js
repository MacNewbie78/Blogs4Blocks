import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

export default function AuthPage() {
  const { login, register, user } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', city: '', country: '' });

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (e) {
      setError(e.response?.data?.detail || 'Invalid email or password');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!regForm.name || !regForm.email || !regForm.password || !regForm.city) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await register(regForm);
      toast.success('Welcome to Blogs 4 Blocks!');
      navigate('/');
    } catch (e) {
      setError(e.response?.data?.detail || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 py-16" data-testid="auth-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-3xl tracking-tight text-gray-900 mb-2" data-testid="auth-heading">
            Join the Conversation
          </h1>
          <p className="text-sm text-gray-500">
            Sign in or create an account to get notified about discussions and build a permanent presence.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6" data-testid="auth-tabs">
              <TabsTrigger value="login" data-testid="auth-login-tab">
                <LogIn className="w-4 h-4 mr-1.5" /> Sign In
              </TabsTrigger>
              <TabsTrigger value="register" data-testid="auth-register-tab">
                <UserPlus className="w-4 h-4 mr-1.5" /> Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    autoFocus
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 border-2 border-gray-100 focus:border-black rounded-xl"
                    data-testid="login-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="mt-1 border-2 border-gray-100 focus:border-black rounded-xl"
                    data-testid="login-password-input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white hover:bg-gray-800 rounded-full font-bold shadow-[3px_3px_0px_0px_rgba(59,130,246,0.5)] hover:translate-y-[-1px] transition-all"
                  data-testid="login-submit-btn"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
                <div>
                  <Label htmlFor="reg-name">Full Name *</Label>
                  <Input
                    id="reg-name"
                    placeholder="Your name"
                    value={regForm.name}
                    onChange={(e) => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 border-2 border-gray-100 focus:border-black rounded-xl"
                    data-testid="register-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-email">Email *</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    value={regForm.email}
                    onChange={(e) => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 border-2 border-gray-100 focus:border-black rounded-xl"
                    data-testid="register-email-input"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-password">Password *</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Choose a strong password"
                    value={regForm.password}
                    onChange={(e) => setRegForm(prev => ({ ...prev, password: e.target.value }))}
                    className="mt-1 border-2 border-gray-100 focus:border-black rounded-xl"
                    data-testid="register-password-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="reg-city">City *</Label>
                    <Input
                      id="reg-city"
                      placeholder="Your city"
                      value={regForm.city}
                      onChange={(e) => setRegForm(prev => ({ ...prev, city: e.target.value }))}
                      className="mt-1 border-2 border-gray-100 focus:border-black rounded-xl"
                      data-testid="register-city-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-country">Country</Label>
                    <Input
                      id="reg-country"
                      placeholder="Your country"
                      value={regForm.country}
                      onChange={(e) => setRegForm(prev => ({ ...prev, country: e.target.value }))}
                      className="mt-1 border-2 border-gray-100 focus:border-black rounded-xl"
                      data-testid="register-country-input"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white hover:bg-gray-800 rounded-full font-bold shadow-[3px_3px_0px_0px_rgba(59,130,246,0.5)] hover:translate-y-[-1px] transition-all"
                  data-testid="register-submit-btn"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700" data-testid="auth-error">
              {error}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          You can also post as a guest without an account. Guest posts are active for 30 days.
        </p>
      </div>
    </div>
  );
}
