ALTER TABLE public.spaces ADD COLUMN country_code text;
ALTER TABLE public.spaces ADD CONSTRAINT spaces_country_code_check CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$');
ALTER TABLE public.spaces DROP CONSTRAINT spaces_kind_check;
ALTER TABLE public.spaces ADD CONSTRAINT spaces_kind_check CHECK (kind IN ('office','meeting','studio','home','apartment','cafeteria','bar'));