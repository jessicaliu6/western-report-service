BEGIN;

-- Drop table

DROP TABLE public.western_report;

CREATE TABLE public.western_report (
	id serial NOT NULL,
	category text NULL,
	first_name text NULL,
	last_name text NULL,
	phone_number text NULL,
	email text NULL,
	description text NULL,
	location text NULL,
	address text NULL,
	latitude real NULL,
	longitude real NULL,
    date_created text NULL,
	CONSTRAINT western_report_pkey PRIMARY KEY (id)
);

COMMIT;
