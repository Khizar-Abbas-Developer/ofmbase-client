import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the JWT token from the request header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    
    const token = authHeader.replace('Bearer ', '');

    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError) throw authError;
    if (!user) throw new Error('User not found');

    // Get the agency record
    const { data: agency, error: agencyError } = await supabaseClient
      .from('agencies')
      .select('id')
      .eq('profile_id', user.id)
      .single();
    
    if (agencyError) throw new Error('Failed to fetch agency');
    if (!agency) throw new Error('Agency not found');

    const { email, creatorData } = await req.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      throw new Error('Invalid email');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Generate a secure temporary password
    const temporaryPassword = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 12);

    // Create auth user
    const { data: authData, error: createError } = await supabaseClient.auth.admin.createUser({
      email: normalizedEmail,
      password: temporaryPassword,
      email_confirm: true,
    });

    if (createError) {
      if (createError.message.includes('already exists')) {
        throw new Error('A user with this email already exists');
      }
      throw createError;
    }

    if (!authData.user) {
      throw new Error('Failed to create user account');
    }

    try {
      // Create profile
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert([{
          id: authData.user.id,
          email: normalizedEmail,
          type: 'creator'
        }]);

      if (profileError) throw profileError;

      // Create creator record
      const { data: creator, error: creatorError } = await supabaseClient
        .from('creators')
        .insert([{ 
          ...creatorData, 
          id: authData.user.id,
          email: normalizedEmail,
          agency_id: agency.id,
          status: 'invited'
        }])
        .select()
        .single();

      if (creatorError) throw creatorError;

      return new Response(
        JSON.stringify(creator),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (error) {
      // If anything fails after creating the auth user, clean it up
      await supabaseClient.auth.admin.deleteUser(authData.user.id);
      throw error;
    }
  } catch (error) {
    console.error('Error in create-creator function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create creator account',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});