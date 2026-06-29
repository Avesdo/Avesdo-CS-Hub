import { create } from 'zustand';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../api/firebase';
import { toast } from '../utils/toast';

export type SupportTicket = {
  'Ticket ID': string;
  'Ticket Subject'?: string;
  Channel?: string;
  'Created By'?: string;
  'Assigned Agent Name'?: string;
  'Ticket Status'?: string;
  'Ticket Tags'?: string; // Used for Project
  'Ticket Category'?: string;
  'Created At'?: string;
  'Last Updated At'?: string;
  'Last Agent Reply At'?: string;
  'Last Contact Reply At'?: string;
  'Response Time (Minutes)'?: number;
  'First Response Time (Minutes)'?: number;
  'Last Closed At'?: string;
  'Number of Agent Replies'?: number;
  'Number of Agent Private Notes'?: number;
  'Number of Contact Replies'?: number;
  'Contact Name'?: string;
  'Contact Email'?: string;
  'Ticket Contact Group'?: string;
  'Time Spent (seconds)'?: number;
  'Onboarding Classification'?: string;
  'Maintenance Classification'?: string;
  'Product Classification'?: string;
  'Internal Classification'?: string;
  'Services Classification'?: string;
  [key: string]: any;
};

interface SupportState {
  tickets: SupportTicket[];
  isLoading: boolean;
  hasFetched: boolean;
  dateRange: '7d' | '30d' | '90d' | 'ytd' | 'all' | 'custom';
  setDateRange: (range: '7d' | '30d' | '90d' | 'ytd' | 'all' | 'custom') => void;
  customStartDate: number | null;
  customEndDate: number | null;
  setCustomDates: (start: number | null, end: number | null) => void;
  fetchTickets: () => Promise<void>;
}

export const useSupportStore = create<SupportState>((set, get) => ({
  tickets: [],
  isLoading: false,
  hasFetched: false,
  dateRange: '30d',
  setDateRange: (range) => set({ dateRange: range }),
  customStartDate: null,
  customEndDate: null,
  setCustomDates: (start, end) => set({ customStartDate: start, customEndDate: end }),
  fetchTickets: async () => {
    const { hasFetched, isLoading } = get();
    if (hasFetched || isLoading) return;

    set({ isLoading: true });
    try {
      const snapshot = await getDocs(collection(db, 'support_tickets'));
      const tickets = snapshot.docs.map((doc) => doc.data() as SupportTicket);
      set({ tickets, isLoading: false, hasFetched: true });
    } catch (err: any) {
      console.error('Failed to fetch support tickets:', err);
      toast.error('Failed to load support data');
      set({ isLoading: false });
    }
  },
}));
