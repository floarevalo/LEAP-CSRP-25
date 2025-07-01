--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

-- Started on 2025-07-01 09:23:43

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 228 (class 1255 OID 16954)
-- Name: delete_section_references(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_section_references() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Delete from units
  DELETE FROM units
  WHERE section_id = OLD.sectionid;

  -- Delete from dis
  DELETE FROM dis
  WHERE section_id = OLD.sectionid;

  -- Delete from engagements
  DELETE FROM engagements
  WHERE sectionid = OLD.sectionid;

  RETURN OLD;
END;
$$;


ALTER FUNCTION public.delete_section_references() OWNER TO postgres;

--
-- TOC entry 229 (class 1255 OID 16955)
-- Name: insert_new_section(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_new_section() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
	PERFORM pg_notify(
		'new_section_channel',  -- notification channel name
        json_build_object(
			'sectionid', NEW.sectionid,
        	'isonline', NEW.isonline
        )::text);

	RETURN NULL;
END;
$$;


ALTER FUNCTION public.insert_new_section() OWNER TO postgres;

--
-- TOC entry 230 (class 1255 OID 16956)
-- Name: insert_unit_from_dis(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_unit_from_dis() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
	INSERT INTO units (
		unit_name,
		unit_type,
		unit_role,
		unit_size,
		unit_posture,
		unit_mobility,
		unit_readiness,
		unit_skill,
		unit_id,
		is_friendly,
		unit_health,
		xcord,
		ycord,
		zcord,
		section_id,
		site_id,
		application_id,
		unit_ern
	) 
	SELECT
		NEW.unit_name,
		p.unit_type,
		p.unit_role,
		p.unit_size,
		p.unit_posture,
		p.unit_mobility,
		p.unit_readiness,
		p.unit_skill,
		NEW.unit_id,
		p.is_friendly,
		100,
		NEW.xcord,
		NEW.ycord,
		NEW.zcord,
		NEW.section_id,
		NEW.site_id,
		NEW.application_id,
		NEW.unit_ern
	FROM preset_units p
	WHERE p.unit_name = NEW.unit_name;

	RETURN NEW;
END;
$$;


ALTER FUNCTION public.insert_unit_from_dis() OWNER TO postgres;

--
-- TOC entry 231 (class 1255 OID 16957)
-- Name: insert_unit_from_dis_and_notify(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_unit_from_dis_and_notify() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    payload JSON;
BEGIN
	INSERT INTO units (
		unit_name,
		unit_type,
		unit_role,
		unit_size,
		unit_posture,
		unit_mobility,
		unit_readiness,
		unit_skill,
		unit_id,
		is_friendly,
		unit_health,
		xcord,
		ycord,
		zcord,
		section_id,
		site_id,
		application_id,
		unit_ern,
        unit_wez
	) 
	SELECT
		NEW.unit_name,
		p.unit_type,
		p.unit_role,
		p.unit_size,
		p.unit_posture,
		p.unit_mobility,
		p.unit_readiness,
		p.unit_skill,
		NEW.unit_id,
		p.is_friendly,
		100,
		NEW.xcord,
		NEW.ycord,
		NEW.zcord,
		NEW.section_id,
		NEW.site_id,
		NEW.application_id,
		NEW.unit_ern,
        p.unit_wez
	FROM preset_units p
	WHERE p.unit_name = NEW.unit_name;

    payload := json_build_object(
        'unit_id', NEW.unit_id,
        'unit_name', NEW.unit_name
    );
    PERFORM pg_notify('unit_added', payload::text);
	RAISE NOTICE 'PAYLOAD SENT %', payload;

	RETURN NULL;
END;
$$;


ALTER FUNCTION public.insert_unit_from_dis_and_notify() OWNER TO postgres;

--
-- TOC entry 232 (class 1255 OID 16958)
-- Name: section_isonline_notify(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.section_isonline_notify() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.isonline IS DISTINCT FROM OLD.isonline THEN
        PERFORM pg_notify(
            'isonline_channel',
            json_build_object(
                'sectionid', NEW.sectionid,
                'isonline', NEW.isonline
            )::text
        );
    END IF;
    
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.section_isonline_notify() OWNER TO postgres;

--
-- TOC entry 233 (class 1255 OID 16959)
-- Name: update_section_references(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_section_references() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Update `units` table
  UPDATE units
  SET section_id = NEW.sectionid
  WHERE section_id = OLD.sectionid;

  -- Update `dis` table
  UPDATE dis
  SET section_id = NEW.sectionid
  WHERE section_id = OLD.sectionid;

  -- Update `engagements` table
  UPDATE engagements
  SET sectionid = NEW.sectionid
  WHERE sectionid = OLD.sectionid;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_section_references() OWNER TO postgres;

--
-- TOC entry 234 (class 1255 OID 16960)
-- Name: update_unit_from_dis(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_unit_from_dis() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
	UPDATE units
	SET
		xcord = NEW.xcord,
		ycord = NEW.ycord,
		zcord = NEW.zcord
	FROM dis d
	WHERE units.unit_id = NEW.unit_id;

	RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_unit_from_dis() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 16961)
-- Name: dis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dis (
    unit_name character varying,
    section_id character varying,
    unit_ern integer,
    site_id integer,
    application_id integer,
    unit_id integer NOT NULL,
    xcord numeric,
    ycord numeric,
    zcord numeric
);


ALTER TABLE public.dis OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16966)
-- Name: dis_unit_id_new_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.dis ALTER COLUMN unit_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.dis_unit_id_new_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 217 (class 1259 OID 16967)
-- Name: engagements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.engagements (
    sectionid character(15) NOT NULL,
    friendlyid character varying(30),
    enemyid character varying(30),
    friendlybasescore numeric,
    enemybasescore numeric,
    friendlytacticsscore numeric,
    enemytacticsscore numeric,
    iswin boolean,
    enemytotalscore numeric,
    friendlytotalscore numeric,
    engagementid integer NOT NULL,
    timestamp_column timestamp without time zone
);


ALTER TABLE public.engagements OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16972)
-- Name: engagements_engagementid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.engagements ALTER COLUMN engagementid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.engagements_engagementid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 16973)
-- Name: ordered_engagements; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.ordered_engagements AS
 SELECT sectionid,
    friendlyid,
    enemyid,
    friendlybasescore,
    enemybasescore,
    friendlytacticsscore,
    enemytacticsscore,
    iswin,
    enemytotalscore,
    friendlytotalscore,
    engagementid,
    timestamp_column
   FROM public.engagements
  ORDER BY engagementid DESC;


ALTER VIEW public.ordered_engagements OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16977)
-- Name: preset_tactics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.preset_tactics (
    unit_name character varying,
    awareness integer,
    logistics integer,
    coverage integer,
    gps integer,
    comms integer,
    fire integer,
    pattern integer
);


ALTER TABLE public.preset_tactics OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16982)
-- Name: preset_units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.preset_units (
    unit_name character varying(15) NOT NULL,
    unit_type character varying,
    unit_role character varying,
    unit_size character varying,
    unit_posture character varying,
    unit_mobility character varying,
    unit_readiness character varying,
    unit_skill character varying,
    is_friendly boolean,
    unit_wez integer
);


ALTER TABLE public.preset_units OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16987)
-- Name: section_tactics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.section_tactics (
    unit_id integer NOT NULL,
    awareness integer,
    logistics integer,
    coverage integer,
    gps integer,
    comms integer,
    fire integer,
    pattern integer
);


ALTER TABLE public.section_tactics OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16990)
-- Name: sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sections (
    sectionid character varying(15) NOT NULL,
    isonline boolean NOT NULL
);


ALTER TABLE public.sections OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16993)
-- Name: tactics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tactics (
    "FriendlyISR" integer,
    "EnemyISR" integer,
    "FriendlyLogistics" integer,
    "EnemyLogistics" integer,
    "FriendlyCritical" integer,
    "EnemyCritical" integer,
    "FriendlyGPS" integer,
    "EnemyGPS" integer,
    "FriendlyComms" integer,
    "EnemyComms" integer,
    "FriendlyCAS" integer,
    "EnemyCAS" integer,
    "FriendlyAccess" integer,
    "EnemyAccess" integer,
    "firstAttackFriendly" boolean,
    "friendlyAccuracyPercent" numeric,
    "friendlyAccuracyLevel" character varying,
    "enemyAccuracyPercent" numeric,
    "enemyAccuracyLevel" character varying,
    "friendlyDamage" numeric,
    "enemyDamage" numeric,
    "detectionPositiveFeedback" text,
    "detectionNegativeFeedback" text,
    "accuracyPositiveFeedback" text,
    "accuracyNegativeFeedback" text,
    "damagePositiveFeedback" text,
    "damageNegativeFeedback" text,
    engagementid integer NOT NULL
);


ALTER TABLE public.tactics OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16998)
-- Name: unit_tactics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.unit_tactics (
    "ID" integer NOT NULL,
    awareness integer,
    logistics integer,
    coverage integer,
    gps integer,
    comms integer,
    fire integer,
    pattern integer
);


ALTER TABLE public.unit_tactics OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17001)
-- Name: units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.units (
    unit_name character varying(50) NOT NULL,
    unit_type character varying(50),
    unit_health integer,
    unit_role character varying(50),
    unit_size character varying(50),
    unit_posture character varying(50),
    unit_mobility character varying(50),
    unit_readiness character varying(50),
    unit_skill character varying(50),
    children character varying[],
    section_id character varying(50),
    unit_id integer NOT NULL,
    is_root boolean,
    is_friendly boolean,
    xcord numeric,
    ycord numeric,
    zcord numeric,
    site_id integer,
    application_id integer,
    unit_ern integer,
    unit_wez integer
);


ALTER TABLE public.units OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17006)
-- Name: units_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.units_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.units_id_seq OWNER TO postgres;

--
-- TOC entry 4923 (class 0 OID 0)
-- Dependencies: 227
-- Name: units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.units_id_seq OWNED BY public.units.unit_id;


--
-- TOC entry 4733 (class 2604 OID 17007)
-- Name: units unit_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units ALTER COLUMN unit_id SET DEFAULT nextval('public.units_id_seq'::regclass);


--
-- TOC entry 4900 (class 0 OID 16961)
-- Dependencies: 215
-- Data for Name: dis; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dis (unit_name, section_id, unit_ern, site_id, application_id, unit_id, xcord, ycord, zcord) FROM stdin;
\.


--
-- TOC entry 4902 (class 0 OID 16967)
-- Dependencies: 217
-- Data for Name: engagements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.engagements (sectionid, friendlyid, enemyid, friendlybasescore, enemybasescore, friendlytacticsscore, enemytacticsscore, iswin, enemytotalscore, friendlytotalscore, engagementid, timestamp_column) FROM stdin;
M1A            	58	11	39	36.3	80	80	t	49.41	51.3	934	\N
M1A            	22	12	41.699999999999996	36.3	80	80	t	49.41	53.19	936	\N
M1A            	22	12	41.699999999999996	36.3	80	80	t	49.41	53.19	938	\N
M1A            	58	11	39	36.3	80	80	t	49.41	51.3	933	\N
M1A            	58	11	39	36.3	80	80	t	49.41	51.3	935	\N
M1A            	22	12	41.699999999999996	36.3	80	80	t	49.41	53.19	937	\N
\.


--
-- TOC entry 4904 (class 0 OID 16977)
-- Dependencies: 220
-- Data for Name: preset_tactics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.preset_tactics (unit_name, awareness, logistics, coverage, gps, comms, fire, pattern) FROM stdin;
CJTFHQ	1	1	1	1	1	1	1
Logistics	1	1	1	1	1	1	1
Brigade	1	1	1	1	1	1	1
JAF BN	1	1	1	1	1	1	1
Company	1	1	1	1	1	1	1
Artillery	1	1	1	1	1	1	1
Rangers	1	1	1	1	1	1	1
SFG	1	1	1	1	1	1	1
MARSOC	1	1	1	1	1	1	1
NSWG	1	1	1	1	1	1	1
PLAHQ	1	1	1	1	1	1	1
PLA BG	1	1	1	1	1	1	1
PLA CO	1	1	1	1	1	1	1
PLA ARTY	1	1	1	1	1	1	1
PLA SOF CO	1	1	1	1	1	1	1
PLA SOF TM	1	1	1	1	1	1	1
RPA	1	1	1	1	1	1	1
SOC Helo	1	1	1	1	1	1	1
plane	1	1	1	1	1	1	1
EZOHIGUMA-C	1	1	1	1	1	1	1
EZOHIGUMA-D	1	1	1	1	1	1	1
EZOHIGUMA-E	1	1	1	1	1	1	1
JAF-BN-A	1	1	1	1	1	1	1
JAF-BN-B	1	1	1	1	1	1	1
JAF-BN-C	1	1	1	1	1	1	1
MARSOC	1	1	1	1	1	1	1
NSW	1	1	1	1	1	1	1
RANGERS	1	1	1	1	1	1	1
SFG	1	1	1	1	1	1	1
US-ARM-CO-A	1	1	1	1	1	1	1
US-ARM-CO-B	1	1	1	1	1	1	1
US-ARM-CO-C	1	1	1	1	1	1	1
US-ARTY-A	1	1	1	1	1	1	1
US-ARTY-B	1	1	1	1	1	1	1
US-ARTY-C	1	1	1	1	1	1	1
US-INF-BG-A	1	1	1	1	1	1	1
US-INF-BG-B	1	1	1	1	1	1	1
US-INF-BG-C	1	1	1	1	1	1	1
US-LOG	1	1	1	1	1	1	1
US-LOG-B	1	1	1	1	1	1	1
US-LOG-C	1	1	1	1	1	1	1
US-MLR	1	1	1	1	1	1	1
INF-BG-A-10	1	1	1	1	1	1	1
INF-BG-B-10	1	1	1	1	1	1	1
INF-BG-C-10	1	1	1	1	1	1	1
INF-BN-A-7	1	1	1	1	1	1	1
INF-BN-B-7	1	1	1	1	1	1	1
INF-BN-C-7	1	1	1	1	1	1	1
INF-BN-D-7	1	1	1	1	1	1	1
INF-CO-A-5	1	1	1	1	1	1	1
INF-CO-B-5	1	1	1	1	1	1	1
INF-CO-C-5	1	1	1	1	1	1	1
INF-CO-D-5	1	1	1	1	1	1	1
INF-CO-E-5	1	1	1	1	1	1	1
INF-CO-F-5	1	1	1	1	1	1	1
INF-CO-G-5	1	1	1	1	1	1	1
INF-CO-H-5	1	1	1	1	1	1	1
SOF-BN-A-8	1	1	1	1	1	1	1
SOF-BN-B-8	1	1	1	1	1	1	1
SOF-BN-C-8	1	1	1	1	1	1	1
SOF-TM-A-3	1	1	1	1	1	1	1
SOF-TM-B-3	1	1	1	1	1	1	1
SOF-TM-C-3	1	1	1	1	1	1	1
SOF-TM-D-3	1	1	1	1	1	1	1
SOF-TM-E-3	1	1	1	1	1	1	1
CH-ARM-CO-A	1	1	1	1	1	1	1
CH-ARM-CO-B	1	1	1	1	1	1	1
\.


--
-- TOC entry 4905 (class 0 OID 16982)
-- Dependencies: 221
-- Data for Name: preset_units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.preset_units (unit_name, unit_type, unit_role, unit_size, unit_posture, unit_mobility, unit_readiness, unit_skill, is_friendly, unit_wez) FROM stdin;
EZOHIGUMA-B	Special Operations Forces - EZO	Combat	Squad/Team	Offense and Defense	Mobile (foot)	Low	Untrained	t	15
EZOHIGUMA-C	Special Operations Forces - EZO	Combat	Squad/Team	Offense and Defense	Mobile (foot)	Low	Untrained	t	15
EZOHIGUMA-D	Special Operations Forces - EZO	Combat	Squad/Team	Offense and Defense	Mobile (foot)	Low	Untrained	t	15
EZOHIGUMA-E	Special Operations Forces - EZO	Combat	Squad/Team	Offense and Defense	Mobile (foot)	Low	Untrained	t	15
JAF-BN-A	Infantry	Combat	Battalion	Offensive Only	Mobile (wheeled)	High	Advanced	t	10
JAF-BN-B	Infantry	Combat	Battalion	Offensive Only	Mobile (wheeled)	High	Advanced	t	10
JAF-BN-C	Infantry	Combat	Battalion	Offensive Only	Mobile (wheeled)	High	Advanced	t	10
MARSOC	Special Operations Forces	Combat	Squad/Team	Offense and Defense	Mobile (foot)	High	Elite	t	10
NSW	Special Operations Forces	Combat	Squad/Team	Offense and Defense	Mobile (foot)	High	Elite	t	10
RANGERS	Combined Arms	Combat	Battalion	Offense and Defense	Mobile (foot)	High	Elite	t	10
SFG	Special Operations Forces	Combat	Battalion	Offense and Defense	Mobile (foot)	High	Elite	t	10
US-ARM-CO-A	Armor Company	Combat	Company/Battery	Offensive Only	Mobile (track)	High	Basic	t	10
US-ARM-CO-B	Armor Company	Combat	Company/Battery	Offensive Only	Mobile (track)	High	Advanced	t	10
US-ARM-CO-C	Armor Company	Combat	Company/Battery	Offensive Only	Mobile (track)	High	Advanced	t	10
US-ARTY-A	Field Artillery	Combat	Company/Battery	Offensive Only	Mobile (track)	High	Advanced	t	20
US-ARTY-B	Field Artillery	Combat	Company/Battery	Offensive Only	Mobile (track)	High	Advanced	t	20
US-ARTY-C	Field Artillery	Combat	Company/Battery	Offensive Only	Mobile (track)	High	Advanced	t	20
US-INF-BG-A	Infantry	Combat	Brigade/Regiment	Offensive Only	Mobile (wheeled)	High	Basic	t	10
US-INF-BG-B	Infantry	Combat	Brigade/Regiment	Offensive Only	Mobile (wheeled)	High	Basic	t	10
US-INF-BG-C	Infantry	Combat	Brigade/Regiment	Offensive Only	Mobile (wheeled)	High	Basic	t	10
US-LOG	Combat Support	Supply Materials	Battalion	Defensive Only	Mobile (wheeled)	High	Basic	t	15
US-LOG-B	Combat Support	Supply Materials	Battalion	Defensive Only	Mobile (wheeled)	High	Basic	t	15
US-LOG-C	Combat Support	Supply Materials	Battalion	Defensive Only	Mobile (wheeled)	High	Basic	t	15
US-MEU	Infantry	Combat	Battalion	Offense and Defense	Mobile (wheeled)	High	Advanced	t	20
US-MLR	Infantry	Combat	Battalion	Offense and Defense	Mobile (wheeled)	High	Advanced	t	20
INF-BG-A-10	Infantry	Combat	Brigade/Regiment	Defensive Only	Mobile (wheeled)	Low	Basic	f	10
INF-BG-B-10	Infantry	Combat	Brigade/Regiment	Defensive Only	Mobile (wheeled)	Low	Basic	f	10
INF-BG-C-10	Infantry	Combat	Brigade/Regiment	Defensive Only	Mobile (wheeled)	Low	Basic	f	10
INF-BN-A-7	Infantry	Combat	Battalion	Defensive Only	Mobile (wheeled)	Medium	Basic	f	10
INF-BN-B-7	Infantry	Combat	Battalion	Defensive Only	Mobile (wheeled)	Medium	Basic	f	10
INF-BN-C-7	Infantry	Combat	Battalion	Defensive Only	Mobile (wheeled)	Medium	Basic	f	10
INF-BN-D-7	Infantry	Combat	Battalion	Defensive Only	Mobile (wheeled)	Medium	Basic	f	10
INF-CO-A-5	Infantry	Combat	Company/Battery	Defensive Only	Mobile (foot)	Medium	Advanced	f	10
INF-CO-B-5	Infantry	Combat	Company/Battery	Defensive Only	Mobile (foot)	Medium	Advanced	f	10
INF-CO-C-5	Infantry	Combat	Company/Battery	Defensive Only	Mobile (foot)	Medium	Advanced	f	10
INF-CO-D-5	Infantry	Combat	Company/Battery	Defensive Only	Mobile (foot)	Medium	Advanced	f	10
INF-CO-E-5	Infantry	Combat	Company/Battery	Defensive Only	Mobile (foot)	Medium	Advanced	f	10
INF-CO-F-5	Infantry	Combat	Company/Battery	Defensive Only	Mobile (foot)	Medium	Advanced	f	10
INF-CO-G-5	Infantry	Combat	Company/Battery	Defensive Only	Mobile (foot)	Medium	Advanced	f	10
INF-CO-H-5	Infantry	Combat	Company/Battery	Defensive Only	Mobile (foot)	Medium	Advanced	f	10
SOF-BN-A-8	Special Operations Forces	Combat	Battalion	Offense and Defense	Mobile (foot)	High	Elite	f	10
SOF-BN-B-8	Special Operations Forces	Combat	Battalion	Offense and Defense	Mobile (foot)	High	Elite	f	10
SOF-BN-C-8	Special Operations Forces	Combat	Battalion	Offense and Defense	Mobile (foot)	High	Elite	f	10
SOF-TM-A-3	Special Operations Forces	Combat	Squad/Team	Offense and Defense	Mobile (foot)	High	Elite	f	10
SOF-TM-B-3	Special Operations Forces	Combat	Squad/Team	Offense and Defense	Mobile (foot)	High	Elite	f	10
SOF-TM-C-3	Special Operations Forces	Combat	Squad/Team	Offense and Defense	Mobile (foot)	High	Elite	f	10
SOF-TM-D-3	Special Operations Forces	Combat	Squad/Team	Offense and Defense	Mobile (foot)	High	Elite	f	10
SOF-TM-E-3	Special Operations Forces	Combat	Squad/Team	Offense and Defense	Mobile (foot)	High	Elite	f	10
CH-ARM-CO-A	Armor Company	Combat	Company/Battery	Defensive Only	Mobile (track)	Low	Basic	f	10
CH-ARM-CO-B	Armor Company	Combat	Company/Battery	Defensive Only	Mobile (track)	Low	Basic	f	10
EZOHIGUMA-A	Special Operations Forces - EZO	Combat	Squad/Team	Offense and Defense	Mobile (foot)	Low	Untrained	t	15
\.


--
-- TOC entry 4906 (class 0 OID 16987)
-- Dependencies: 222
-- Data for Name: section_tactics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.section_tactics (unit_id, awareness, logistics, coverage, gps, comms, fire, pattern) FROM stdin;
78	1	1	1	1	1	1	1
64	1	1	1	1	1	1	1
66	1	1	1	1	1	1	1
82	1	1	1	1	1	1	1
105	1	1	1	1	1	1	1
80	1	1	1	1	1	1	1
85	1	1	1	1	1	1	1
98	1	1	1	1	1	1	1
97	0	0	1	1	1	0	0
93	1	1	1	1	1	1	1
88	1	1	1	1	1	1	1
70	1	1	1	1	1	1	1
77	1	1	1	1	1	1	1
69	1	1	1	1	1	1	1
86	1	1	1	1	1	1	1
65	1	1	1	1	1	1	1
89	1	1	1	1	1	1	1
90	1	1	1	1	1	1	1
94	1	1	1	1	1	1	1
91	1	1	1	1	1	1	1
95	1	1	1	1	1	1	1
92	1	1	1	1	1	1	1
103	1	1	1	1	1	1	1
83	1	1	1	1	1	1	1
87	1	1	1	1	1	1	1
71	1	1	1	1	1	1	1
99	1	1	1	1	1	1	1
102	1	1	1	1	1	1	1
84	1	1	1	1	1	1	1
72	1	1	1	1	1	1	1
67	1	1	1	1	1	1	1
79	1	1	1	1	1	1	1
81	1	1	1	1	1	1	1
73	1	1	1	1	1	1	1
235	1	1	1	1	1	1	1
100	1	1	1	1	1	1	1
104	1	1	1	1	1	1	1
101	1	1	1	1	1	1	1
96	1	1	1	1	1	1	1
250	1	1	1	1	1	1	1
251	1	1	1	1	1	1	1
252	1	1	1	1	1	1	1
260	1	1	1	1	1	1	1
262	1	1	1	1	1	1	1
263	1	1	1	1	1	1	1
264	1	1	1	1	1	1	1
265	1	1	1	1	1	1	1
266	1	1	1	1	1	1	1
267	1	1	1	1	1	1	1
268	1	1	1	1	1	1	1
269	1	1	1	1	1	1	1
270	1	1	1	1	1	1	1
271	1	1	1	1	1	1	1
272	1	1	1	1	1	1	1
273	1	1	1	1	1	1	1
274	1	1	1	1	1	1	1
275	1	1	1	1	1	1	1
276	1	1	1	1	1	1	1
277	1	1	1	1	1	1	1
278	1	1	1	1	1	1	1
279	1	1	1	1	1	1	1
280	1	1	1	1	1	1	1
281	1	1	1	1	1	1	1
282	1	1	1	1	1	1	1
283	1	1	1	1	1	1	1
284	1	1	1	1	1	1	1
285	1	1	1	1	1	1	1
286	1	1	1	1	1	1	1
287	1	1	1	1	1	1	1
288	1	1	1	1	1	1	1
289	1	1	1	1	1	1	1
290	1	1	1	1	1	1	1
291	1	1	1	1	1	1	1
292	1	1	1	1	1	1	1
293	1	1	1	1	1	1	1
294	1	1	1	1	1	1	1
295	1	1	1	1	1	1	1
296	1	1	1	1	1	1	1
297	1	1	1	1	1	1	1
298	1	1	1	1	1	1	1
299	1	1	1	1	1	1	1
\.


--
-- TOC entry 4907 (class 0 OID 16990)
-- Dependencies: 223
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sections (sectionid, isonline) FROM stdin;
M1A	t
\.


--
-- TOC entry 4908 (class 0 OID 16993)
-- Dependencies: 224
-- Data for Name: tactics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tactics ("FriendlyISR", "EnemyISR", "FriendlyLogistics", "EnemyLogistics", "FriendlyCritical", "EnemyCritical", "FriendlyGPS", "EnemyGPS", "FriendlyComms", "EnemyComms", "FriendlyCAS", "EnemyCAS", "FriendlyAccess", "EnemyAccess", "firstAttackFriendly", "friendlyAccuracyPercent", "friendlyAccuracyLevel", "enemyAccuracyPercent", "enemyAccuracyLevel", "friendlyDamage", "enemyDamage", "detectionPositiveFeedback", "detectionNegativeFeedback", "accuracyPositiveFeedback", "accuracyNegativeFeedback", "damagePositiveFeedback", "damageNegativeFeedback", engagementid) FROM stdin;
1	1	1	1	1	1	1	1	1	1	1	1	1	1	f	0	Low	0	Low	0	0	Positive detection factors will be listed here.	Negative detection factors will be listed here.	Positive accuracy factors will be listed here.	Negative accuracy factors will be listed here.	Positive damage factors will be listed here.	Negative damage factors will be listed here.	933
1	1	1	1	1	1	1	1	1	1	1	1	1	1	f	0.569088234778925	Low	0.6472416874561238	Low	45.84276778660145	29.063650893670722	Conducted ISR\nENEMY unit readiness: low	No comms (jammed)	Have close air support\nENEMY unit readiness: low	No GPS (jammed)	FRIENDLY defending critical location\nYour target is in a good range	No significant negative factors.	934
1	1	1	1	1	1	1	1	1	1	1	1	1	1	f	0.569088234778925	Low	0.6472416874561238	Low	41.12887811993323	48.92661960366139	Conducted ISR\nENEMY unit readiness: low	No comms (jammed)	Have close air support\nENEMY unit readiness: low	No GPS (jammed)	FRIENDLY defending critical location\nYour target is in a good range	No significant negative factors.	935
1	1	1	1	1	1	1	1	1	1	1	1	1	1	f	0	Low	0	Low	0	0	Positive detection factors will be listed here.	Negative detection factors will be listed here.	Positive accuracy factors will be listed here.	Negative accuracy factors will be listed here.	Positive damage factors will be listed here.	Negative damage factors will be listed here.	936
1	1	1	1	1	1	1	1	1	1	1	1	1	1	f	0.569088234778925	Low	0.6472416874561238	Low	48.92661960366139	48.92661960366139	Conducted ISR\nENEMY unit readiness: low	No comms (jammed)	Have close air support\nENEMY unit readiness: low	No GPS (jammed)	FRIENDLY defending critical location\nYour target is in a good range	No significant negative factors.	937
1	1	1	1	1	1	1	1	1	1	1	1	1	1	f	0.569088234778925	Low	0.6472416874561238	Low	50	45.84276778660145	Conducted ISR\nENEMY unit readiness: low	No comms (jammed)	Have close air support\nENEMY unit readiness: low	No GPS (jammed)	FRIENDLY defending critical location\nYour target is in a good range	No significant negative factors.	938
\.


--
-- TOC entry 4909 (class 0 OID 16998)
-- Dependencies: 225
-- Data for Name: unit_tactics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.unit_tactics ("ID", awareness, logistics, coverage, gps, comms, fire, pattern) FROM stdin;
\.


--
-- TOC entry 4910 (class 0 OID 17001)
-- Dependencies: 226
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.units (unit_name, unit_type, unit_health, unit_role, unit_size, unit_posture, unit_mobility, unit_readiness, unit_skill, children, section_id, unit_id, is_root, is_friendly, xcord, ycord, zcord, site_id, application_id, unit_ern, unit_wez) FROM stdin;
EZOHIGUMA-D	Special Operations Forces - EZO	100	Combat	Squad/Team	Offense and Defense	Mobile (foot)	Low	Untrained	\N	M1A	10	\N	t	20	21	22	1	2	1234	15
CH-ARM-CO-B	Armor Company	100	Combat	Company/Battery	Defensive Only	Mobile (track)	Low	Basic	\N	M1A	12	\N	f	-4079271.14459905	4513126.92167	-1909786.12840086	1	2	1235	10
EZOHIGUMA-B	Special Operations Forces - EZO	100	Combat	Squad/Team	Offense and Defense	Mobile (foot)	Low	Untrained	\N	M1A	13	\N	t	-4079271.14459905	4486126.922	-1909786.12840086	1	2	1235	15
EZOHIGUMA-C	Special Operations Forces - EZO	100	Combat	Squad/Team	Offense and Defense	Mobile (foot)	Low	Untrained	\N	M1A	14	\N	t	-4079271.14459905	4486126.922	-1909786.12840086	1	2	1235	15
INF-BN-A-7	Infantry	100	Combat	Battalion	Defensive Only	Mobile (wheeled)	Medium	Basic	\N	M1A	15	\N	f	511661.163909433	-4878979.57061264	4062761.81157242	1	13	11039	10
INF-CO-H-5	Infantry	100	Combat	Company/Battery	Defensive Only	Mobile (foot)	Medium	Advanced	\N	M1A	21	\N	f	511698.991493648	-4879034.39226133	4062687.46771968	1	13	11039	10
US-INF-BG-B	Infantry	100	Combat	Brigade/Regiment	Offensive Only	Mobile (wheeled)	High	Basic	\N	M1A	57	\N	t	511674.715247298	-4879048.61758516	4062684.25666513	1	13	11037	10
US-INF-BG-A	Infantry	100	Combat	Brigade/Regiment	Offensive Only	Mobile (wheeled)	High	Basic	\N	M1A	58	\N	t	511667.364548471	-4879036.23755709	4062694.14731745	1	13	0	10
US-MLR	Infantry	100	Combat	Battalion	Offense and Defense	Mobile (wheeled)	High	Advanced	\N	M1A	22	\N	t	511671.00384514	-4879041.50677172	4062689.19706217	1	13	11037	20
SOF-BN-A-8	Special Operations Forces	100	Combat	Battalion	Offense and Defense	Mobile (foot)	High	Elite	\N	M1A	23	\N	f	511458.494344392	-4879081.51197384	4062665.26492729	1	13	11215	10
US-LOG	Combat Support	100	Supply Materials	Battalion	Defensive Only	Mobile (wheeled)	High	Basic	\N	M1A	59	\N	t	511670.831850667	-4879046.3522999	4062684.04348853	1	13	0	15
CH-ARM-CO-A	Armor Company	100	Combat	Company/Battery	Defensive Only	Mobile (track)	Low	Basic	\N	M1A	11	\N	f	511670.434168155	-4879048.60043428	4062680.80647117	1	2	1235	10
US-ARM-CO-A	Armor Company	100	Combat	Company/Battery	Offensive Only	Mobile (track)	High	Basic	\N	M1A	66	\N	t	5	6	8	1	12	125	10
US-INF-BG-A	Infantry	100	Combat	Brigade/Regiment	Offensive Only	Mobile (wheeled)	High	Basic	\N	M1A	67	\N	t	8	7	8	1	45	12	10
INF-BG-B-10	Infantry	100	Combat	Brigade/Regiment	Defensive Only	Mobile (wheeled)	Low	Basic	\N	M1A	68	\N	f	8	7	8	1	45	12	10
US-MEU	Infantry	100	Combat	Battalion	Offense and Defense	Mobile (wheeled)	High	Advanced	\N	M1A	16	\N	t	511660.033536171	-4879054.54942339	4062664.23610394	1	13	11039	20
\.


--
-- TOC entry 4925 (class 0 OID 0)
-- Dependencies: 216
-- Name: dis_unit_id_new_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dis_unit_id_new_seq', 78, true);


--
-- TOC entry 4926 (class 0 OID 0)
-- Dependencies: 218
-- Name: engagements_engagementid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.engagements_engagementid_seq', 938, true);


--
-- TOC entry 4927 (class 0 OID 0)
-- Dependencies: 227
-- Name: units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.units_id_seq', 74, true);


--
-- TOC entry 4735 (class 2606 OID 17009)
-- Name: dis dis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dis
    ADD CONSTRAINT dis_pkey PRIMARY KEY (unit_id);


--
-- TOC entry 4745 (class 2606 OID 17011)
-- Name: unit_tactics enemy_tactics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_tactics
    ADD CONSTRAINT enemy_tactics_pkey PRIMARY KEY ("ID");


--
-- TOC entry 4737 (class 2606 OID 17013)
-- Name: engagements engagements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.engagements
    ADD CONSTRAINT engagements_pkey PRIMARY KEY (engagementid);


--
-- TOC entry 4739 (class 2606 OID 17015)
-- Name: preset_units presetunits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preset_units
    ADD CONSTRAINT presetunits_pkey PRIMARY KEY (unit_name);


--
-- TOC entry 4741 (class 2606 OID 17017)
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (sectionid);


--
-- TOC entry 4743 (class 2606 OID 17019)
-- Name: tactics tactics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tactics
    ADD CONSTRAINT tactics_pkey PRIMARY KEY (engagementid);


--
-- TOC entry 4747 (class 2606 OID 17021)
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (unit_id);


--
-- TOC entry 4750 (class 2620 OID 17022)
-- Name: dis dis_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER dis_insert_trigger AFTER INSERT ON public.dis FOR EACH ROW EXECUTE FUNCTION public.insert_unit_from_dis_and_notify();


--
-- TOC entry 4752 (class 2620 OID 17023)
-- Name: sections insert_new_section; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER insert_new_section AFTER INSERT ON public.sections FOR EACH ROW EXECUTE FUNCTION public.insert_new_section();


--
-- TOC entry 4753 (class 2620 OID 17024)
-- Name: sections trg_delete_sectionid_references; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_delete_sectionid_references AFTER DELETE ON public.sections FOR EACH ROW EXECUTE FUNCTION public.delete_section_references();


--
-- TOC entry 4754 (class 2620 OID 17025)
-- Name: sections trg_update_sectionid_references; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_update_sectionid_references AFTER UPDATE OF sectionid ON public.sections FOR EACH ROW WHEN (((old.sectionid)::text IS DISTINCT FROM (new.sectionid)::text)) EXECUTE FUNCTION public.update_section_references();


--
-- TOC entry 4755 (class 2620 OID 17026)
-- Name: sections trigger_isonline; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_isonline AFTER UPDATE ON public.sections FOR EACH ROW EXECUTE FUNCTION public.section_isonline_notify();


--
-- TOC entry 4751 (class 2620 OID 17027)
-- Name: dis update_units; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_units AFTER UPDATE ON public.dis FOR EACH ROW EXECUTE FUNCTION public.update_unit_from_dis();


--
-- TOC entry 4748 (class 2606 OID 17028)
-- Name: tactics fk_engagement; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tactics
    ADD CONSTRAINT fk_engagement FOREIGN KEY (engagementid) REFERENCES public.engagements(engagementid) ON DELETE CASCADE;


--
-- TOC entry 4749 (class 2606 OID 17033)
-- Name: unit_tactics id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_tactics
    ADD CONSTRAINT id FOREIGN KEY ("ID") REFERENCES public.units(unit_id);


--
-- TOC entry 4917 (class 0 OID 0)
-- Dependencies: 217
-- Name: TABLE engagements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.engagements TO PUBLIC;


--
-- TOC entry 4918 (class 0 OID 0)
-- Dependencies: 218
-- Name: SEQUENCE engagements_engagementid_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.engagements_engagementid_seq TO PUBLIC;


--
-- TOC entry 4919 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE sections; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sections TO PUBLIC;


--
-- TOC entry 4920 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE tactics; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tactics TO PUBLIC;


--
-- TOC entry 4921 (class 0 OID 0)
-- Dependencies: 225
-- Name: TABLE unit_tactics; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.unit_tactics TO PUBLIC;


--
-- TOC entry 4922 (class 0 OID 0)
-- Dependencies: 226
-- Name: TABLE units; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.units TO PUBLIC;


--
-- TOC entry 4924 (class 0 OID 0)
-- Dependencies: 227
-- Name: SEQUENCE units_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.units_id_seq TO PUBLIC;


-- Completed on 2025-07-01 09:23:43

--
-- PostgreSQL database dump complete
--

