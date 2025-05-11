import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
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

    // Get creator ID from URL
    const url = new URL(req.url);
    const creatorId = url.searchParams.get('id');
    if (!creatorId) throw new Error('Creator ID is required');

    // Verify the creator exists
    const { data: creator, error: getCreatorError } = await supabaseClient
      .from('creators')
      .select('*')
      .eq('id', creatorId)
      .single();

    if (getCreatorError) throw getCreatorError;
    if (!creator) throw new Error('Creator not found');

    try {
      // Delete all related records first using Promise.all for parallel execution
      await Promise.all([
        supabaseClient.from('creator_sales').delete().eq('creator_id', creatorId),
        supabaseClient.from('content_requests').delete().eq('creator_id', creatorId),
        supabaseClient.from('costume_requests').delete().eq('creator_id', creatorId),
        supabaseClient.from('scheduled_posts').delete().eq('creator_id', creatorId),
        supabaseClient.from('transactions').delete().eq('creator_id', creatorId),
        supabaseClient.from('credentials').delete().eq('creator_id', creatorId),
      ]);

      // Delete creator record
      const { error: creatorError } = await supabaseClient
        .from('creators')
        .delete()
        .eq('id', creatorId);

      if (creatorError) throw creatorError;

      // Delete profile
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .delete()
        .eq('id', creatorId);

      if (profileError) throw profileError;

      // Finally delete the auth user
      const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(creatorId);
      if (deleteError) throw deleteError;

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (error) {
      console.error('Error during deletion process:', error);
      throw new Error('Failed to clean up user data');
    }
  } catch (error) {
    console.error('Error in delete-creator function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to delete creator',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});