import { FaceFrownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <FaceFrownIcon className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-4xl font-bold mb-4">Invoice Not Found</h2>
            <p className="text-gray-600 mb-6">The invoice you are looking for does not exist.</p>
            <Link href="/dashboard/invoices" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Back to Invoices
            </Link>
        </div>
    );
}