import { createClient } from './client';

const supabase = createClient();

// Randevu güncellemelerini dinle
export function subscribeToAppointmentUpdates(shopId: string, callback: (payload: any) => void) {
  const subscription = supabase
    .channel(`shop:${shopId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'appointments',
      filter: `shop_id=eq.${shopId}`,
    }, callback)
    .subscribe();
    
  return subscription;
}
