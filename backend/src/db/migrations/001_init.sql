-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Booking status enum
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'rescheduled');

-- Users (single default user for this assignment)
CREATE TABLE users (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  timezone    VARCHAR(50)  NOT NULL DEFAULT 'America/New_York',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Event Types
CREATE TABLE event_types (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name             VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) NOT NULL UNIQUE,
  duration_minutes INTEGER      NOT NULL CHECK (duration_minutes IN (15, 30, 45, 60, 90)),
  description      TEXT,
  color            VARCHAR(7)   NOT NULL DEFAULT '#006BFF',
  is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Availability Schedules (one per user, is_default = true for the active one)
CREATE TABLE availability_schedules (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL DEFAULT 'Working Hours',
  timezone    VARCHAR(50)  NOT NULL DEFAULT 'America/New_York',
  is_default  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Availability Windows (per day-of-week within a schedule)
CREATE TABLE availability_windows (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID    NOT NULL REFERENCES availability_schedules(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time  TIME    NOT NULL,
  end_time    TIME    NOT NULL,
  CONSTRAINT end_after_start CHECK (end_time > start_time)
);

-- Bookings
CREATE TABLE bookings (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id UUID           NOT NULL REFERENCES event_types(id) ON DELETE RESTRICT,
  invitee_name  VARCHAR(255)   NOT NULL,
  invitee_email VARCHAR(255)   NOT NULL,
  start_time    TIMESTAMPTZ    NOT NULL,
  end_time      TIMESTAMPTZ    NOT NULL,
  timezone      VARCHAR(50)    NOT NULL,
  status        booking_status NOT NULL DEFAULT 'confirmed',
  cancel_token  UUID           NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  notes         TEXT,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Date Overrides (bonus: mark specific dates unavailable or with custom hours)
CREATE TABLE date_overrides (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id    UUID    NOT NULL REFERENCES availability_schedules(id) ON DELETE CASCADE,
  date           DATE    NOT NULL,
  start_time     TIME,
  end_time       TIME,
  is_unavailable BOOLEAN NOT NULL DEFAULT FALSE
);
