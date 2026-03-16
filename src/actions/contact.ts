"use server";

export async function sendContactEmail(formData: { name: string; email: string; message: string }) {
    console.log("Contact form submission received:", formData);

    // This is where you would connect to an actual email service.
    // Examples:
    // 1. Using Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'Isshō <onboarding@resend.dev>',
    //   to: 'contact@issho.in',
    //   subject: `New Message from ${formData.name}`,
    //   text: formData.message,
    // });

    // 2. Using Formspree (alternative): 
    // You could also just use a Formspree endpoint directly from the client.

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // For now, we return success to allow the UI to transition.
    return { success: true };
}
