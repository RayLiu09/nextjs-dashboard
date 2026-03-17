import exp from 'constants';
import { Inter, Lusitana } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const lusitana = Lusitana({
  subsets: ['latin'],
  weight: ['400', '700']
});