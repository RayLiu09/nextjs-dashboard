'use client'

import { useEffect } from "react";

export default function Error({error, reset}: {error: Error & { digest?: string }, reset: () => void}) {
    useEffect(() => {
        // Log the error to the console for debugging purposes
        console.error('Error in Invoices page:', error);
    }, [error]);
    return (
        <div className="p-4 bg-red-100 text-red-700 rounded">
            <h2 className="text-lg font-semibold mb-2">An error occurred</h2>
            <p>{error.message}</p>
            <button onClick={reset} className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400">
                Try Again
            </button>
        </div>
    );
}