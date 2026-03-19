import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../lib/supabase';

export interface BorrowerPreferences {
  anonymous_mode: boolean;
  funding_timeline: string;
  alerts: {
    direct_messages: boolean;
    document_downloads: boolean;
    term_sheet_offers: boolean;
  };
}

const DEFAULT_PREFERENCES: BorrowerPreferences = {
  anonymous_mode: false,
  funding_timeline: '1-3_months',
  alerts: { direct_messages: true, document_downloads: true, term_sheet_offers: true }
};

export const useBorrowerSettings = (userData: any) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  
  const [revenue, setRevenue] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [preferences, setPreferences] = useState<BorrowerPreferences>(DEFAULT_PREFERENCES);

  // Currency Formatter
  const handleRevenueChange = useCallback((val: string) => {
    const raw = val.replace(/\D/g, '');
    setRevenue(raw ? parseInt(raw, 10).toLocaleString('en-US') : '');
  }, []);

  // Fetch Initial Data
  useEffect(() => {
    const fetchProfileSettings = async () => {
      if (!userData?.id) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('revenue, industry, settings')
          .eq('id', userData.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setRevenue(data.revenue || '');
          setIndustry(data.industry || 'Technology');
          if (data.settings) setPreferences(data.settings as BorrowerPreferences);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileSettings();
  }, [userData]);

  // Upsert to Database
  const saveSettings = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); 
    setMsg({ text: '', type: '' });
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userData.id,
          role: userData.role || 'borrower',
          email: userData.email,
          revenue: revenue,
          industry: industry,
          settings: preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setMsg({ text: 'Corporate preferences securely saved to database.', type: 'success' });
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    } catch (error: any) {
      setMsg({ text: error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }, [userData, revenue, industry, preferences]);

  return {
    loading, saving, msg,
    revenue, industry, preferences,
    handleRevenueChange, setIndustry, setPreferences, saveSettings
  };
};