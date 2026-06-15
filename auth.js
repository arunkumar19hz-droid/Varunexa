/* ============================================
   VARUNEXA TECHNOLOGY — Supabase Authentication
   Google OAuth & session management
   ============================================ */

(function() {
  'use strict';

  // NOTE: In a real environment, replace these with actual Supabase project credentials.
  // Using placeholders since this is a demonstration environment without live keys.
  const SUPABASE_URL = 'https://placeholder-project.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder.key';

  let supabase;
  
  try {
    // Initialize Supabase client
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.warn('Supabase client initialization failed. Auth features will be simulated.');
  }

  // UI Elements
  const authOverlay = document.getElementById('auth-overlay');
  const googleBtn = document.getElementById('google-signin-btn');
  const signOutBtn = document.getElementById('sign-out-btn');
  const userNameEl = document.getElementById('user-name');
  const userAvatarEl = document.getElementById('user-avatar');

  // Helper to handle loading state
  function setLoading(isLoading) {
    if (authOverlay) {
      if (isLoading) {
        authOverlay.classList.add('loading');
      } else {
        authOverlay.classList.remove('loading');
      }
    }
  }

  // Handle Google Sign-in
  async function signInWithGoogle() {
    if (!supabase) {
      // Simulate auth for demo
      simulateAuth();
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard.html'
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Failed to sign in. Please try again.');
      setLoading(false);
    }
  }

  // Handle Sign-out
  async function signOut() {
    if (!supabase) {
      // Simulate sign out
      localStorage.removeItem('varunexa_demo_auth');
      window.location.reload();
      return;
    }

    try {
      await supabase.auth.signOut();
      window.location.href = '/'; // Redirect to home
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  // Update UI with user data
  function updateUI(user) {
    if (!user) return;
    
    // Hide auth overlay
    if (authOverlay) {
      authOverlay.classList.add('hidden');
    }

    // Set name
    if (userNameEl) {
      userNameEl.textContent = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Client';
    }

    // Set avatar
    if (userAvatarEl) {
      const avatarUrl = user.user_metadata?.avatar_url;
      if (avatarUrl) {
        userAvatarEl.innerHTML = `<img src="${avatarUrl}" alt="Profile" />`;
      } else {
        // Fallback to initials
        const initial = (user.user_metadata?.full_name || user.email || 'C').charAt(0).toUpperCase();
        userAvatarEl.textContent = initial;
      }
    }
  }

  // Check initial session
  async function checkSession() {
    if (!supabase) {
      // Check simulated auth
      const demoUser = localStorage.getItem('varunexa_demo_auth');
      if (demoUser) {
        updateUI(JSON.parse(demoUser));
      }
      return;
    }

    setLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        updateUI(session.user);
      } else {
        // Not logged in, ensure overlay is visible
        if (authOverlay) authOverlay.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  }

  // Simulated Auth for demonstration
  function simulateAuth() {
    setLoading(true);
    setTimeout(() => {
      const mockUser = {
        email: 'client@example.com',
        user_metadata: {
          full_name: 'Demo Client',
          avatar_url: ''
        }
      };
      localStorage.setItem('varunexa_demo_auth', JSON.stringify(mockUser));
      updateUI(mockUser);
      setLoading(false);
    }, 1000);
  }

  // Listeners
  if (googleBtn) {
    googleBtn.addEventListener('click', signInWithGoogle);
  }

  if (signOutBtn) {
    signOutBtn.addEventListener('click', signOut);
  }

  // Initialize
  if (authOverlay) { // Only run on dashboard page
    checkSession();
  }

  // Optional: Listen for auth state changes if using real Supabase
  if (supabase) {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        updateUI(session.user);
      } else if (event === 'SIGNED_OUT') {
        if (authOverlay) authOverlay.classList.remove('hidden');
      }
    });
  }

})();
