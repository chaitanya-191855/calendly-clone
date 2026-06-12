-- Fast dashboard list (filter active event types per user)
CREATE INDEX idx_event_types_user_active ON event_types(user_id, is_active);

-- Fast day-of-week lookup for availability
CREATE INDEX idx_avail_windows_schedule_day ON availability_windows(schedule_id, day_of_week);

-- Critical: overlap detection for booking conflict check
CREATE INDEX idx_bookings_overlap ON bookings(event_type_id, start_time, end_time);

-- Status filtering (upcoming vs past)
CREATE INDEX idx_bookings_status ON bookings(status);

-- Cancel token lookup
CREATE INDEX idx_bookings_cancel_token ON bookings(cancel_token);

-- Auto-update updated_at on event_types
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_event_types_updated_at
  BEFORE UPDATE ON event_types
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
