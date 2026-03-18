'use server';
import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        console.error('Authentication Error:', error);
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid email or password. Please try again.';
                default:
                    return 'An unexpected error occurred during authentication. Please try again later.';
            }
        }
        throw error; // Re-throw unexpected errors to be handled by the global error handler
    }
}

const InvoiceSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Customer is required',
    }),
    amount: z.coerce.number().gt(0, { message: 'Amount must be a positive number' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Status must be either "pending" or "paid"',
    }),
    date: z.string()
});
const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
    const rawFormData = {
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    };
    const validatedFields = CreateInvoice.safeParse(rawFormData);
    if (!validatedFields.success) {
        return {
            message: 'Missing or invalid fields, please correct the errors and try again.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = Math.round(amount * 100); // Convert dollars to cents
    const date = new Date().toISOString().split('T')[0]; // Get current date in ISO format
    // Here you would typically insert the new invoice into your database
    // For example:
    try {
        await sql`INSERT INTO invoices (customer_id, amount, status, date) VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`; 
    } catch (error) {
        console.error('Error creating invoice:', error);
        return {
            message: 'Database error, failed to create invoice.',
            success: false,
        };
    }
    console.log('Received form data:', rawFormData);
    revalidatePath('/dashboard/invoices'); // Revalidate the invoices page to show the new invoice
    redirect('/dashboard/invoices'); // Redirect to the invoices page after creation
}

const UpdateInvoice = InvoiceSchema.omit({ id: true, date: true });
export async function updateInvoice(id: string, prevState: State, formData: FormData) {
    const rawFormData = {
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    };
    const validatedFields = UpdateInvoice.safeParse(rawFormData);
    if (!validatedFields.success) {
        return {
            message: 'Missing or invalid fields, please correct the errors and try again.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    const { customerId, amount, status } = validatedFields.data;
    try {
        
        const amountInCents = Math.round(amount * 100); // Convert dollars to cents
        // Here you would typically update the invoice in your database
        // For example:
        await sql`UPDATE invoices SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status} WHERE id = ${id}`; 
    } catch (error) {
        console.error('Error updating invoice:', error);
        return {
            message: 'Database error, failed to update invoice.',
            success: false,
        };
    }
    console.log('Received form data for update:', rawFormData);
    revalidatePath('/dashboard/invoices'); // Revalidate the invoices page to show the updated invoice
    redirect('/dashboard/invoices'); // Redirect to the invoices page after update
}

export async function deleteInvoice(id: string) {
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
    } catch (error) {
        console.error('Error deleting invoice:', error);
        return {
            message: 'Database error, failed to delete invoice.',
            success: false,
        };
    }
    revalidatePath('/dashboard/invoices'); // Revalidate the invoices page to remove the deleted invoice
}

export type State = {
    message?: string | null;
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    }
}