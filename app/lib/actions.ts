'use server';
import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const CreateInvoiceSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string()
});
const CreateInvoice = CreateInvoiceSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    const rawFormData = {
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    };
    const { customerId, amount, status } = CreateInvoice.parse(rawFormData);
    const amountInCents = Math.round(amount * 100); // Convert dollars to cents
    const date = new Date().toISOString().split('T')[0]; // Get current date in ISO format
    // Here you would typically insert the new invoice into your database
    // For example:
    await sql`INSERT INTO invoices (customer_id, amount, status, date) VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`; 
    console.log('Received form data:', rawFormData);
    revalidatePath('/dashboard/invoices'); // Revalidate the invoices page to show the new invoice
    redirect('/dashboard/invoices'); // Redirect to the invoices page after creation
}

const UpdateInvoice = CreateInvoiceSchema.omit({ id: true, date: true });
export async function updateInvoice(id: string, formData: FormData) {
    const rawFormData = {
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    };
    const { customerId, amount, status } = UpdateInvoice.parse(rawFormData);
    const amountInCents = Math.round(amount * 100); // Convert dollars to cents
    // Here you would typically update the invoice in your database
    // For example:
    await sql`UPDATE invoices SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status} WHERE id = ${id}`; 
    console.log('Received form data for update:', rawFormData);
    revalidatePath('/dashboard/invoices'); // Revalidate the invoices page to show the updated invoice
    redirect('/dashboard/invoices'); // Redirect to the invoices page after update
}

export async function deleteInvoice(id: string) {
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices'); // Revalidate the invoices page to remove the deleted invoice
    } catch (error) {
        console.error('Error deleting invoice:', error);
        throw new Error('Failed to delete invoice.');
    }
}