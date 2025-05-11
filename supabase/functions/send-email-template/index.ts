import { Resend } from 'npm:resend@2.1.0';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface EmailTemplate {
  subject: string;
  html: string;
}

const templates: Record<string, (data: any) => EmailTemplate> = {
  employeeInvite: (data: { name: string; email: string; role: string; inviteUrl: string }) => ({
    subject: 'You\'ve been invited to join OFMBase',
    html: `
      <h1>Welcome to OFMBase!</h1>
      <p>Hi ${data.name},</p>
      <p>You've been invited to join OFMBase as a ${data.role}.</p>
      <p>Click the link below to set up your account:</p>
      <a href="${data.inviteUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">
        Accept Invitation
      </a>
      <p>If you didn't expect this invitation, you can safely ignore this email.</p>
    `,
  }),
  
  verifyEmail: (data: { email: string; verifyUrl: string }) => ({
    subject: 'Verify your email address',
    html: `
      <h1>Welcome to OFMBase!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${data.verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>If you didn't create an account with us, you can safely ignore this email.</p>
    `,
  }),
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateName, to, data } = await req.json();

    if (!templateName || !to || !data) {
      throw new Error('Missing required fields');
    }

    const template = templates[templateName];
    if (!template) {
      throw new Error('Invalid template name');
    }

    const { subject, html } = template(data);

    const { data: emailData, error } = await resend.emails.send({
      from: 'OFMBase <noreply@ofmbase.com>',
      to,
      subject,
      html,
    });

    if (error) throw error;

    return new Response(
      JSON.stringify(emailData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});