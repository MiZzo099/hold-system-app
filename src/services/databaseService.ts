// Database Service - Connects to your Google Sheets via Apps Script Web App

export interface Hold {
  id: string;
  emrId: string;
  patientName: string;
  clinic: string;
  holdReason: string;
  placedDate: string;
  placedBy: string;
  status: 'hold' | 'cleared' | 'escalated';
  daysOnHold: number;
  notes?: string;
}

// Use Vercel proxy to avoid CORS issues in the browser
const GOOGLE_WEB_APP_URL = '/api/proxy';

export class DatabaseService {
  /**
   * Fetch all active holds from the database
   */
  static async fetchActiveHolds(): Promise<Hold[]> {
    if (GOOGLE_WEB_APP_URL) {
      try {
        const response = await fetch(`${GOOGLE_WEB_APP_URL}?action=getActiveHolds`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.holds) {
            return data.holds;
          }
        }
      } catch (error) {
        console.error('Error fetching active holds from Web App:', error);
      }
    }
    
    // Fallback to mock if API fails or no URL provided
    return getMockHolds();
  }

  /**
   * Fetch hold history
   */
  static async fetchHoldHistory(): Promise<Hold[]> {
    if (GOOGLE_WEB_APP_URL) {
      try {
        const response = await fetch(`${GOOGLE_WEB_APP_URL}?action=getHoldHistory`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.history) {
            return data.history;
          }
        }
      } catch (error) {
        console.error('Error fetching hold history from Web App:', error);
      }
    }
    return [];
  }

  /**
   * Get holds statistics
   */
  static async getHoldsStats(): Promise<{
    total: number;
    escalated: number;
    over7Days: number;
    over14Days: number;
    byClinic: Record<string, number>;
    byReason: Record<string, number>;
  }> {
    try {
      const holds = await this.fetchActiveHolds();
      const stats = {
        total: holds.length,
        escalated: holds.filter(h => h.status === 'escalated').length,
        over7Days: holds.filter(h => h.daysOnHold >= 7).length,
        over14Days: holds.filter(h => h.daysOnHold >= 14).length,
        byClinic: {} as Record<string, number>,
        byReason: {} as Record<string, number>
      };

      holds.forEach(hold => {
        stats.byClinic[hold.clinic] = (stats.byClinic[hold.clinic] || 0) + 1;
        stats.byReason[hold.holdReason] = (stats.byReason[hold.holdReason] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        total: 0,
        escalated: 0,
        over7Days: 0,
        over14Days: 0,
        byClinic: {},
        byReason: {}
      };
    }
  }

  /**
   * Add a new hold
   */
  static async addHold(hold: Omit<Hold, 'id' | 'daysOnHold'>): Promise<boolean> {
    if (GOOGLE_WEB_APP_URL) {
      try {
        const response = await fetch(GOOGLE_WEB_APP_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            action: 'PLACE_HOLD',
            payload: hold
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          return data.status === 'success';
        }
      } catch (error) {
        console.error('Error adding hold to Web App:', error);
        return false;
      }
    }
    
    // Mock behavior
    console.log('Adding mock hold:', hold);
    return true;
  }

  /**
   * Clear a hold
   */
  static async clearHold(holdId: string, clearedBy: string): Promise<boolean> {
    if (GOOGLE_WEB_APP_URL) {
      try {
        const response = await fetch(GOOGLE_WEB_APP_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            action: 'CLEAR_HOLD',
            payload: {
              id: holdId,
              clearedBy: clearedBy
            }
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          return data.status === 'success';
        }
      } catch (error) {
        console.error('Error clearing hold in Web App:', error);
        return false;
      }
    }
    
    // Mock behavior
    console.log('Clearing mock hold:', holdId);
    return true;
  }
}

/**
 * Mock holds data for demo/testing
 */
function getMockHolds(): Hold[] {
  return [
    {
      id: 'hold_1',
      emrId: '12345',
      patientName: 'John Doe',
      clinic: 'Fordham',
      holdReason: 'Missing Referral',
      placedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      placedBy: 'auth28@cobsolution.com',
      status: 'hold',
      daysOnHold: 8,
      notes: 'Patient needs to bring referral from MD'
    },
    {
      id: 'hold_2',
      emrId: '12346',
      patientName: 'Jane Smith',
      clinic: 'Astoria',
      holdReason: 'Pending Authorization from Insurance',
      placedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      placedBy: 'auth29@cobsolution.com',
      status: 'hold',
      daysOnHold: 3,
      notes: 'Waiting for insurance approval'
    },
    {
      id: 'hold_3',
      emrId: '12347',
      patientName: 'Robert Johnson',
      clinic: 'Bay Ridge',
      holdReason: 'Insurance Inactive',
      placedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      placedBy: 'menna.sayed@cobsolution.com',
      status: 'hold',
      daysOnHold: 15,
      notes: 'Need new insurance information'
    },
    {
      id: 'hold_4',
      emrId: '12348',
      patientName: 'Maria Garcia',
      clinic: 'Flatbush',
      holdReason: 'COB Update Required',
      placedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      placedBy: 'billing35@cobsolution.com',
      status: 'hold',
      daysOnHold: 2,
      notes: 'Patient needs to update insurance'
    },
    {
      id: 'hold_5',
      emrId: '12349',
      patientName: 'Michael Brown',
      clinic: 'Midtown',
      holdReason: 'MD Signature Missing',
      placedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      placedBy: 'ali.esmail@cobsolution.com',
      status: 'hold',
      daysOnHold: 5,
      notes: 'Referral requires MD signature'
    }
  ];
}
