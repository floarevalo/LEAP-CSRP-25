--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

-- Started on 2025-06-12 12:44:02

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 16464)
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
-- TOC entry 216 (class 1259 OID 16469)
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
-- TOC entry 217 (class 1259 OID 16470)
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
-- TOC entry 218 (class 1259 OID 16475)
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
-- TOC entry 219 (class 1259 OID 16480)
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
-- TOC entry 220 (class 1259 OID 16483)
-- Name: section_tree; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.section_tree (
    child_id integer NOT NULL,
    parent_id integer
);


ALTER TABLE public.section_tree OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16486)
-- Name: section_units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.section_units (
    unit_id integer NOT NULL,
    unit_name character varying,
    unit_health integer,
    unit_type character varying,
    unit_role character varying,
    unit_size character varying,
    unit_posture character varying,
    unit_mobility character varying,
    unit_readiness character varying,
    unit_skill character varying,
    is_friendly character varying,
    is_root boolean,
    section_id character varying
);


ALTER TABLE public.section_units OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16491)
-- Name: section_units_unit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.section_units ALTER COLUMN unit_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.section_units_unit_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 223 (class 1259 OID 16492)
-- Name: sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sections (
    sectionid character varying(15) NOT NULL,
    isonline boolean NOT NULL
);


ALTER TABLE public.sections OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16495)
-- Name: tactics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tactics (
    friendlyawareness integer,
    enemyawareness integer,
    friendlylogistics integer,
    enemylogistics integer,
    friendlycoverage integer,
    enemycoverage integer,
    friendlygps integer,
    enemygps integer,
    friendlycomms integer,
    enemycomms integer,
    friendlyfire integer,
    enemyfire integer,
    friendlypattern integer,
    enemypattern integer,
    engagementid integer NOT NULL
);


ALTER TABLE public.tactics OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16498)
-- Name: tactics_engagementid_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.tactics ALTER COLUMN engagementid ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tactics_engagementid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 226 (class 1259 OID 16499)
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
-- TOC entry 227 (class 1259 OID 16502)
-- Name: units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.units (
    unit_id character varying(50) NOT NULL,
    unit_type character varying(50),
    unit_health integer,
    role_type character varying(50),
    unit_size character varying(50),
    force_posture character varying(50),
    force_mobility character varying(50),
    force_readiness character varying(50),
    force_skill character varying(50),
    children character varying[],
    section character varying(50),
    id integer NOT NULL,
    root boolean,
    "isFriendly" boolean,
    xcord numeric,
    ycord numeric,
    zcord numeric
);


ALTER TABLE public.units OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16507)
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
-- TOC entry 4912 (class 0 OID 0)
-- Dependencies: 228
-- Name: units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.units_id_seq OWNED BY public.units.id;


--
-- TOC entry 4727 (class 2604 OID 16508)
-- Name: units id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units ALTER COLUMN id SET DEFAULT nextval('public.units_id_seq'::regclass);


--
-- TOC entry 4886 (class 0 OID 16464)
-- Dependencies: 215
-- Data for Name: engagements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.engagements (sectionid, friendlyid, enemyid, friendlybasescore, enemybasescore, friendlytacticsscore, enemytacticsscore, iswin, enemytotalscore, friendlytotalscore, engagementid, timestamp_column) FROM stdin;
testsection    	58	60	18.799999999999997	25	\N	\N	f	17.5	13.159999999999997	657	\N
testsection    	58	62	18.799999999999997	31.700000000000003	\N	\N	f	22.19	13.159999999999997	658	\N
ONE Copy       	163	176	38.099999999999994	39.4	\N	\N	f	27.58	26.669999999999995	659	\N
ONE Copy       	163	177	38.099999999999994	39.4	\N	\N	f	27.58	26.669999999999995	660	\N
ONE Copy       	163	177	38.099999999999994	39.4	100	100	f	57.58	56.669999999999995	661	\N
ONE Copy       	163	177	38.099999999999994	39.4	100	100	f	57.58	56.669999999999995	662	\N
ONE v1         	73	90	38.099999999999994	35.3	\N	\N	t	24.709999999999997	26.669999999999995	663	\N
ONE v1         	73	89	38.099999999999994	35.3	\N	\N	t	24.709999999999997	26.669999999999995	664	\N
ONE v1         	73	89	38.099999999999994	35.3	100	100	t	54.709999999999994	56.669999999999995	665	\N
ONE v1         	73	92	38.099999999999994	39.4	\N	\N	f	27.58	26.669999999999995	666	\N
ONE v1         	83	101	44	30.400000000000002	\N	\N	t	21.28	30.799999999999997	667	\N
ONE v1         	83	99	44	34.7	\N	\N	t	24.29	30.799999999999997	668	\N
ONE v1         	83	102	44	34.7	\N	\N	t	24.29	30.799999999999997	669	\N
ONE v1         	83	99	44	34.7	\N	\N	t	24.29	30.799999999999997	670	\N
ONE v1         	83	92	44	39.4	\N	\N	t	27.58	30.799999999999997	671	\N
ONE v1         	83	88	44	35.3	\N	\N	t	24.709999999999997	30.799999999999997	672	\N
ONE v1         	78	95	31.6	30.400000000000002	\N	\N	t	21.28	22.12	673	\N
ONE v1         	78	95	31.6	30.400000000000002	75	75	t	43.78	44.620000000000005	674	\N
ONE v1         	78	95	31.6	30.400000000000002	75	75	t	43.78	44.620000000000005	675	\N
ONE v1         	77	102	31.6	34.7	\N	\N	f	24.29	22.12	676	\N
ONE v1         	83	93	44	40.9	\N	\N	t	28.629999999999995	30.799999999999997	677	\N
ONE v1         	77	89	31.6	35.3	\N	\N	f	24.709999999999997	22.12	678	\N
ONE v1         	87	103	44	25.700000000000003	\N	\N	t	17.990000000000002	30.799999999999997	679	\N
ONE v1         	85	90	28.000000000000004	35.3	\N	\N	f	24.709999999999997	19.6	680	\N
ONE v1         	85	89	28.000000000000004	35.3	\N	\N	f	24.709999999999997	19.6	681	\N
ONE v1         	85	93	28.000000000000004	40.9	\N	\N	f	28.629999999999995	19.6	682	\N
ONE v1         	77	94	31.6	30.400000000000002	\N	\N	t	21.28	22.12	683	\N
ONE v1         	85	90	28.000000000000004	35.3	\N	\N	f	24.709999999999997	19.6	684	\N
ONE v1         	87	98	44	32.4	\N	\N	t	22.679999999999996	30.799999999999997	685	\N
ONE v1         	83	97	44	32.4	\N	\N	t	22.679999999999996	30.799999999999997	686	\N
ONE v1         	86	98	44	32.4	\N	\N	t	22.679999999999996	30.799999999999997	687	\N
ONE v1         	86	98	44	32.4	60	60	t	40.67999999999999	48.8	688	\N
ONE v1         	73	98	38.099999999999994	32.4	\N	\N	t	22.679999999999996	26.669999999999995	689	\N
ONE v1         	82	90	41.5	35.3	\N	\N	t	24.709999999999997	29.049999999999997	690	\N
ONE v1         	85	99	28.000000000000004	34.7	\N	\N	f	24.29	19.6	691	\N
ONE v1         	77	96	31.6	30.400000000000002	\N	\N	t	21.28	22.12	692	\N
ONE v1         	86	99	44	34.7	\N	\N	t	24.29	30.799999999999997	693	\N
ONE v1         	86	99	44	34.7	80	80	t	48.29	54.8	694	\N
ONE v1         	83	103	44	25.700000000000003	\N	\N	t	17.990000000000002	30.799999999999997	695	\N
ONE v1         	83	97	44	32.4	\N	\N	t	22.679999999999996	30.799999999999997	696	\N
ONE v1         	85	105	28.000000000000004	25.700000000000003	\N	\N	t	17.990000000000002	19.6	697	\N
ONE v1         	87	104	44	25.700000000000003	\N	\N	t	17.990000000000002	30.799999999999997	698	\N
ONE v1         	87	104	44	25.700000000000003	\N	\N	t	17.990000000000002	30.799999999999997	699	\N
ONE v1         	85	88	28.000000000000004	35.3	\N	\N	f	24.709999999999997	19.6	700	\N
ONE v1         	85	103	28.000000000000004	25.700000000000003	\N	\N	t	17.990000000000002	19.6	701	\N
ONE v1         	87	105	44	25.700000000000003	\N	\N	t	17.990000000000002	30.799999999999997	702	\N
ONE v1         	87	94	44	30.400000000000002	\N	\N	t	21.28	30.799999999999997	703	\N
ONE v1         	83	89	44	35.3	\N	\N	t	24.709999999999997	30.799999999999997	704	\N
ONE v1         	83	89	44	35.3	80	80	t	48.709999999999994	54.8	705	\N
ONE v1         	87	101	44	30.400000000000002	\N	\N	t	21.28	30.799999999999997	706	\N
ONE v1         	85	101	28.000000000000004	30.400000000000002	\N	\N	f	21.28	19.6	707	\N
ONE v1         	87	98	44	32.4	\N	\N	t	22.679999999999996	30.799999999999997	708	\N
ONE v1         	83	103	44	27.200000000000003	\N	\N	t	19.04	30.799999999999997	709	\N
ONE v1         	86	104	44	27.200000000000003	\N	\N	t	19.04	30.799999999999997	710	\N
ONE v1         	85	104	28.000000000000004	27.200000000000003	\N	\N	t	19.04	19.6	711	\N
ONE v1         	83	104	44	27.200000000000003	\N	\N	t	19.04	30.799999999999997	712	\N
ONE v1         	87	99	44	34.7	\N	\N	t	24.29	30.799999999999997	713	\N
ONE v1         	86	105	44	27.200000000000003	\N	\N	t	19.04	30.799999999999997	714	\N
ONE v1         	86	105	44	27.200000000000003	\N	\N	t	19.04	30.799999999999997	715	\N
ONE v1         	83	103	44	27.200000000000003	\N	\N	t	19.04	30.799999999999997	716	\N
ONE v1         	83	99	44	34.7	\N	\N	t	24.29	30.799999999999997	717	\N
ONE v1         	83	105	44	27.200000000000003	\N	\N	t	19.04	30.799999999999997	718	\N
ONE v1         	83	105	44	27.200000000000003	90	90	t	46.04	57.8	719	\N
ONE v1         	87	99	44	34.7	\N	\N	t	24.29	30.799999999999997	720	\N
ONE v1         	87	104	44	27.200000000000003	\N	\N	t	19.04	30.799999999999997	721	\N
ONE v1         	85	99	28.000000000000004	34.7	\N	\N	f	24.29	19.6	722	\N
ONE v1         	86	103	44	27.200000000000003	\N	\N	t	19.04	30.799999999999997	723	\N
ONE v1         	69	104	32.9	27.200000000000003	\N	\N	t	19.04	23.029999999999998	724	\N
ONE v1         	67	95	32.9	30.400000000000002	\N	\N	t	21.28	23.029999999999998	725	\N
ONE v1         	80	98	33.6	32.4	\N	\N	t	22.679999999999996	23.52	726	\N
ONE v1         	81	98	33.6	32.4	\N	\N	t	22.679999999999996	23.52	727	\N
ONE v1         	78	96	31.6	30.400000000000002	\N	\N	t	21.28	22.12	728	\N
ONE v1         	83	104	44	27.200000000000003	\N	\N	t	19.04	30.799999999999997	729	\N
ONE v1         	80	97	33.6	32.4	\N	\N	t	22.679999999999996	23.52	730	\N
ONE v1         	80	97	33.6	32.4	90	90	t	49.67999999999999	50.519999999999996	731	\N
ONE v1         	87	105	44	27.200000000000003	\N	\N	t	19.04	30.799999999999997	732	\N
ONE v1         	85	104	28.000000000000004	27.200000000000003	\N	\N	t	19.04	19.6	733	\N
ONE v1         	86	105	44	27.200000000000003	\N	\N	t	19.04	30.799999999999997	734	\N
ONE v1         	86	104	44	27.200000000000003	\N	\N	t	19.04	30.799999999999997	735	\N
ONE v1         	87	103	44	27.200000000000003	\N	\N	t	19.04	30.799999999999997	736	\N
ONE v1         	85	103	28.000000000000004	27.200000000000003	\N	\N	t	19.04	19.6	737	\N
ONE v1         	85	98	28.000000000000004	32.4	\N	\N	f	22.679999999999996	19.6	738	\N
ONE v1         	77	100	31.6	30.400000000000002	\N	\N	t	21.28	22.12	739	\N
ONE v1         	77	100	31.6	30.400000000000002	100	100	t	51.28	52.120000000000005	740	\N
ONE v1         	77	100	31.6	30.400000000000002	100	100	t	51.28	52.120000000000005	741	\N
ONE v1         	70	90	37.199999999999996	35.3	\N	\N	t	24.709999999999997	26.039999999999996	742	\N
ONE v1         	80	104	33.6	27.200000000000003	\N	\N	t	19.04	23.52	743	\N
ONE v1         	81	98	33.6	32.4	\N	\N	t	22.679999999999996	23.52	744	\N
ONE v1         	81	98	33.6	32.4	\N	\N	t	22.679999999999996	23.52	745	\N
ONE v1         	78	95	31.6	30.400000000000002	\N	\N	t	21.28	22.12	746	\N
ONE v1         	67	93	32.9	40.9	\N	\N	f	28.629999999999995	23.029999999999998	747	\N
ONE v1         	84	103	23.500000000000004	27.200000000000003	\N	\N	f	19.04	16.450000000000003	748	\N
ONE v1         	69	92	32.9	39.4	\N	\N	f	27.58	23.029999999999998	749	\N
ONE v1         	69	92	32.9	39.4	55	55	f	44.08	39.53	750	\N
ONE v1         	69	92	32.9	39.4	55	55	f	44.08	39.53	751	\N
ONE v1         	69	92	32.9	39.4	55	55	f	44.08	39.53	752	\N
ONE v1         	69	92	32.9	39.4	55	55	f	44.08	39.53	753	\N
ONE v1         	69	92	32.9	39.4	55	55	f	44.08	39.53	754	\N
ONE v1         	83	88	44	35.3	\N	\N	t	24.709999999999997	30.799999999999997	755	\N
ONE v1         	83	88	44	35.3	80	80	t	48.709999999999994	54.8	756	\N
ONE v1         	70	91	37.199999999999996	39.4	\N	\N	f	27.58	26.039999999999996	757	\N
ONE v1         	84	101	23.500000000000004	30.400000000000002	\N	\N	f	21.28	16.450000000000003	758	\N
ONE v1         	79	101	31.6	30.400000000000002	\N	\N	t	21.28	22.12	759	\N
ONE v1         	87	104	44	27.200000000000003	\N	\N	t	19.04	30.799999999999997	760	\N
ONE v1         	87	104	44	27.200000000000003	100	100	t	49.04	60.8	761	\N
ONE v1         	65	89	35.3	35.3	\N	\N	f	24.709999999999997	24.709999999999997	762	\N
ONE v1         	65	89	35.3	35.3	100	100	f	54.709999999999994	54.709999999999994	763	\N
ONE v1         	65	89	35.3	35.3	65	65	f	44.209999999999994	44.209999999999994	764	\N
ONE v1         	65	89	35.3	35.3	40	40	f	36.709999999999994	36.709999999999994	765	\N
test           	241	244	31.6	32.4	\N	\N	f	22.679999999999996	22.12	766	\N
ONE v1         	250	94	32.7	30.400000000000002	\N	\N	t	21.28	22.89	767	\N
test 2         	267	268	37.199999999999996	35.3	\N	\N	t	24.709999999999997	26.039999999999996	768	\N
test           	249	254	33.5	35.3	\N	\N	f	24.709999999999997	23.45	769	\N
test 3         	265	274	33.6	32.4	\N	\N	t	22.679999999999996	23.52	770	\N
test 3         	265	274	33.6	32.4	\N	\N	t	22.679999999999996	23.52	771	\N
ONE v1         	83	96	44	30.400000000000002	\N	\N	t	21.28	30.799999999999997	772	\N
ONE v1         	83	96	44	30.400000000000002	100	100	t	51.28	60.8	773	\N
ONE v1         	81	92	33.6	39.4	\N	\N	f	27.58	23.52	774	\N
ONE v1         	81	92	33.6	39.4	100	100	f	57.58	53.519999999999996	775	\N
ONE v1         	84	95	23.500000000000004	30.400000000000002	\N	\N	f	21.28	16.450000000000003	776	\N
ONE v1         	84	95	23.500000000000004	30.400000000000002	60	60	f	39.28	34.45	777	\N
ONE v1         	84	95	23.500000000000004	30.400000000000002	60	60	f	39.28	34.45	778	\N
ONE v1         	79	102	31.6	34.7	\N	\N	f	24.29	22.12	779	\N
test 3         	264	270	36.599999999999994	35.3	\N	\N	t	24.709999999999997	25.619999999999994	780	\N
updated test   	282	283	41.699999999999996	33.6	\N	\N	t	23.52	29.189999999999994	781	\N
ONE v1         	235	91	33.6	39.4	\N	\N	f	27.58	23.52	782	\N
ONE v1         	235	91	33.6	39.4	100	100	f	57.58	53.519999999999996	783	\N
\.


--
-- TOC entry 4888 (class 0 OID 16470)
-- Dependencies: 217
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
EZOHIGUMA-B	1	1	1	1	1	1	1
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
US-MEU	1	1	1	1	1	1	1
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
-- TOC entry 4889 (class 0 OID 16475)
-- Dependencies: 218
-- Data for Name: preset_units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.preset_units (unit_name, unit_type, unit_role, unit_size, unit_posture, unit_mobility, unit_readiness, unit_skill, is_friendly, unit_wez) FROM stdin;
EZOHIGUMA-B	Special Operations Forces - EZO	Combat	Squad/Team	Offense and Defense	Mobile (foot)	Low	Untrained	t	15
EZOHIGUMA-C	Special Operations Forces - EZO	Combat	Squad/Team	Offense and Defense	Mobile (foot)	Low	Untrained	t	15
EZOHIGUMA-D	Special Operations Forces - EZO	Combat	Squad/Team	Offense and Defense	Mobile (foot)	Low	Untrained	t	15
EZOHIGUMA-E	Special Operations Forces - EZO	Combat	Squad/Team	Offense and Defense	Mobile (foot)	Low	Untrained	t	15
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
CH-ARM-CO-A	Armor Company	Combat	Company/Battery	Defensive Only	Mobile (track)	Low	Basic	f	10
CH-ARM-CO-B	Armor Company	Combat	Company/Battery	Defensive Only	Mobile (track)	Low	Basic	f	10
INF-CO-H-5	Infantry	Combat	Company/Battery	Defensive Only	Mobile (foot)	Medium	Advanced	f	10
JAF-BN-A	Infantry	Combat	Battalion	Offensive Only	Mobile (wheeled)	High	Advanced	t	10
JAF-BN-B	Infantry	Combat	Battalion	Offensive Only	Mobile (wheeled)	High	Advanced	t	10
JAF-BN-C	Infantry	Combat	Battalion	Offensive Only	Mobile (wheeled)	High	Advanced	t	10
MARSOC	Special Operations Forces	Combat	Squad/Team	Offense and Defense	Mobile (foot)	High	Elite	t	10
NSW	Special Operations Forces	Combat	Squad/Team	Offense and Defense	Mobile (foot)	High	Elite	t	10
RANGERS	Combined Arms	Combat	Battalion	Offense and Defense	Mobile (foot)	High	Elite	t	10
SFG	Special Operations Forces	Combat	Battalion	Offense and Defense	Mobile (foot)	High	Elite	t	10
SOF-BN-A-8	Special Operations Forces	Combat	Battalion	Offense and Defense	Mobile (foot)	High	Elite	f	10
SOF-BN-B-8	Special Operations Forces	Combat	Battalion	Offense and Defense	Mobile (foot)	High	Elite	f	10
SOF-BN-C-8	Special Operations Forces	Combat	Battalion	Offense and Defense	Mobile (foot)	High	Elite	f	10
SOF-TM-A-3	Special Operations Forces	Combat	Squad/Team	Offense and Defense	Mobile (foot)	High	Elite	f	10
SOF-TM-B-3	Special Operations Forces	Combat	Squad/Team	Offense and Defense	Mobile (foot)	High	Elite	f	10
SOF-TM-C-3	Special Operations Forces	Combat	Squad/Team	Offense and Defense	Mobile (foot)	High	Elite	f	10
SOF-TM-D-3	Special Operations Forces	Combat	Squad/Team	Offense and Defense	Mobile (foot)	High	Elite	f	10
SOF-TM-E-3	Special Operations Forces	Combat	Squad/Team	Offense and Defense	Mobile (foot)	High	Elite	f	10
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
\.


--
-- TOC entry 4890 (class 0 OID 16480)
-- Dependencies: 219
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
\.


--
-- TOC entry 4891 (class 0 OID 16483)
-- Dependencies: 220
-- Data for Name: section_tree; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.section_tree (child_id, parent_id) FROM stdin;
65	64
66	64
67	65
69	67
70	65
71	70
72	71
73	72
235	81
77	65
78	77
79	78
80	65
81	80
82	66
83	82
84	83
85	84
86	66
87	86
89	88
90	88
91	89
92	91
93	92
94	89
95	94
96	95
97	89
98	97
99	90
100	99
101	100
102	101
103	90
104	103
105	104
250	235
251	66
252	64
263	260
264	260
265	263
266	262
267	266
269	265
271	268
272	271
273	270
274	270
275	79
277	276
280	277
278	281
279	278
284	280
285	279
287	286
\.


--
-- TOC entry 4892 (class 0 OID 16486)
-- Dependencies: 221
-- Data for Name: section_units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.section_units (unit_id, unit_name, unit_health, unit_type, unit_role, unit_size, unit_posture, unit_mobility, unit_readiness, unit_skill, is_friendly, is_root, section_id) FROM stdin;
67	JAF BN	83	Infantry	Combat	Battalion	Offensive Only	Mobile (foot)	Medium	Basic	true	f	ONE v1
99	PLA SOF CO A	90	Special Operations Forces	Combat	Company/Battery	Offensive Only	Mobile (foot)	High	Advanced	false	f	ONE v1
105	PLA SOF TM	\N	Special Operations Forces	Combat	Squad/Team	Offensive Only	Mobile (foot)	High	Advanced	false	f	ONE v1
72	BGB	100	Infantry	Combat	Brigade/Regiment	Offensive Only	Mobile (foot)	Medium	Advanced	true	f	ONE v1
64	CJTFHQ	100	Command and Control	Headquarters	Brigade/Regiment	Defensive Only	Stationary	Medium	Advanced	true	t	ONE v1
66	JFSOCC	100	Command and Control	Headquarters	Brigade/Regiment	Defensive Only	Stationary	Medium	Advanced	true	f	ONE v1
71	BGA	21	Infantry	Combat	Brigade/Regiment	Offensive Only	Mobile (foot)	Medium	Advanced	true	f	ONE v1
69	JAF BN	4	Infantry	Combat	Battalion	Offensive Only	Mobile (foot)	Medium	Basic	true	f	ONE v1
86	Ezohuguma A	80	Special Operations Forces	Combat	Battalion	Offense and Defense	Mobile (wheeled)	High	Elite	true	f	ONE v1
73	BGC	40	Armored Mechanized	Combat	Brigade/Regiment	Offensive Only	Mobile (foot)	Medium	Advanced	true	f	ONE v1
70	Logistics	36	Combat Support	Supply Materials	Battalion	Offense and Defense	Mobile (wheeled)	Medium	Advanced	true	f	ONE v1
101	PLA CO C	67	Infantry	Combat	Company/Battery	Offensive Only	Mobile (foot)	Medium	Basic	false	f	ONE v1
90	PLASOF	5	Command and Control	Headquarters	Brigade/Regiment	Defensive Only	Stationary	Medium	Advanced	false	f	ONE v1
82	Rangers	6	Armored Mechanized Tracked	Combat	Battalion	Offensive Only	Mobile (wheeled)	High	Elite	true	f	ONE v1
85	NSWG	0	Special Operations Forces	Combat	Squad/Team	Offensive Only	Mobile (foot)	High	Elite	true	f	ONE v1
77	CO A	42	Infantry	Combat	Company/Battery	Offensive Only	Mobile (foot)	Medium	Advanced	true	f	ONE v1
88	PLAHQ	12	Command and Control	Headquarters	Brigade/Regiment	Defensive Only	Stationary	Medium	Advanced	false	t	ONE v1
98	PLA ARTY B	0	Field Artillery	Combat	Company/Battery	Offensive Only	Mobile (wheeled)	Medium	Basic	false	f	ONE v1
100	PLA CO B	40	Infantry	Combat	Company/Battery	Offensive Only	Mobile (foot)	Medium	Basic	false	f	ONE v1
78	CO B	41	Infantry	Combat	Company/Battery	Offensive Only	Mobile (foot)	Medium	Advanced	true	f	ONE v1
80	ARTY A	34	Field Artillery	Combat	Company/Battery	Offensive Only	Mobile (wheeled)	Medium	Advanced	true	f	ONE v1
103	PLA SOF TM	0	Special Operations Forces	Combat	Squad/Team	Offensive Only	Mobile (foot)	High	Advanced	false	f	ONE v1
93	PLA BG C	0	Armored Mechanized	Combat	Brigade/Regiment	Offense and Defense	Mobile (foot)	Medium	Basic	false	f	ONE v1
97	PLA ARTY A	70	Field Artillery	Combat	Company/Battery	Offensive Only	Mobile (wheeled)	Medium	Basic	false	f	ONE v1
65	JFLCC	100	Command and Control	Headquarters	Brigade/Regiment	Defensive Only	Stationary	Medium	Advanced	true	f	ONE v1
89	PLAA	2	Command and Control	Headquarters	Brigade/Regiment	Defensive Only	Stationary	Medium	Advanced	false	f	ONE v1
87	Ezohuguma B	18	Special Operations Forces	Combat	Battalion	Offense and Defense	Mobile (wheeled)	High	Elite	true	f	ONE v1
104	PLA SOF TM	0	Special Operations Forces	Combat	Squad/Team	Offensive Only	Mobile (foot)	High	Advanced	false	f	ONE v1
91	PLA BG	0	Infantry	Combat	Brigade/Regiment	Offense and Defense	Mobile (foot)	Medium	Basic	false	f	ONE v1
250	RPA	88	Unmanned Aerial Systems	Combat	Squad/Team	Offense and Defense	Flight (fixed wing)	High	Advanced	true	f	ONE v1
94	PLA CO A	52	Infantry	Combat	Company/Battery	Offensive Only	Mobile (foot)	Medium	Basic	false	f	ONE v1
251	RPA	100	Unmanned Aerial Systems	Combat	Squad/Team	Offense and Defense	Flight (fixed wing)	High	Advanced	true	f	ONE v1
252	RPA 3	100	Unmanned Aerial Systems	Combat	Squad/Team	Offense and Defense	Flight (fixed wing)	High	Advanced	true	f	ONE v1
260	CJTFHQ	100	Command and Control	Headquarters	Brigade/Regiment	Defensive Only	Stationary	Medium	Advanced	true	t	test 3
262	CJTFHQ	100	Command and Control	Headquarters	Brigade/Regiment	Defensive Only	Stationary	Medium	Advanced	true	t	test 2
84	MARSOC	5	Reconnaissance	Combat	Squad/Team	Offensive Only	Mobile (foot)	High	Elite	true	f	ONE v1
96	PLA CO C	0	Infantry	Combat	Company/Battery	Offensive Only	Mobile (foot)	Medium	Basic	false	f	ONE v1
81	ARTY B	12	Field Artillery	Combat	Company/Battery	Offensive Only	Mobile (wheeled)	Medium	Advanced	true	f	ONE v1
83	SFG	70	Special Operations Forces	Combat	Battalion	Offense and Defense	Mobile (wheeled)	High	Elite	true	f	ONE v1
79	CO C	42	Infantry	Combat	Company/Battery	Offensive Only	Mobile (foot)	Medium	Advanced	true	f	ONE v1
92	PLA BG B	0	Infantry	Combat	Brigade/Regiment	Offense and Defense	Mobile (foot)	Medium	Basic	false	f	ONE v1
102	PLA SOF CO	67	Special Operations Forces	Combat	Company/Battery	Offensive Only	Mobile (foot)	High	Advanced	false	f	ONE v1
95	PLA CO B	0	Infantry	Combat	Company/Battery	Offensive Only	Mobile (foot)	Medium	Basic	false	f	ONE v1
235	CO Z	17	Field Artillery	Combat	Company/Battery	Offensive Only	Mobile (wheeled)	Medium	Advanced	true	f	ONE v1
263	Logistics	100	Combat Support	Supply Materials	Battalion	Offense and Defense	Mobile (wheeled)	Medium	Advanced	true	f	test 3
266	Logistics	100	Combat Support	Supply Materials	Battalion	Offense and Defense	Mobile (wheeled)	Medium	Advanced	true	f	test 2
269	Logistics	100	Combat Support	Supply Materials	Battalion	Offense and Defense	Mobile (wheeled)	Medium	Advanced	true	f	test 3
271	PLA BG	100	Infantry	Combat	Brigade/Regiment	Offense and Defense	Mobile (foot)	Medium	Basic	false	f	test 2
272	PLA CO	100	Infantry	Combat	Company/Battery	Offensive Only	Mobile (foot)	Medium	Basic	false	f	test 2
273	PLA SOF CO	100	Special Operations Forces	Combat	Company/Battery	Offensive Only	Mobile (foot)	High	Advanced	false	f	test 3
267	Logistics	100	Combat Support	Supply Materials	Battalion	Offense and Defense	Mobile (wheeled)	Medium	Advanced	true	f	test 2
268	PLAHQ	100	Command and Control	Headquarters	Brigade/Regiment	Defensive Only	Stationary	Medium	Advanced	false	t	test 2
265	Artillery	25	Field Artillery	Combat	Company/Battery	Offensive Only	Mobile (wheeled)	Medium	Advanced	true	f	test 3
274	PLA ARTY	26	Field Artillery	Combat	Company/Battery	Offensive Only	Mobile (wheeled)	Medium	Basic	false	f	test 3
275	Rangers	100	Combined Arms	Combat	Battalion	Offensive Only	Mobile (wheeled)	High	Elite	true	f	ONE v1
276	CJTFHQ	100	Command and Control	Headquarters	Brigade/Regiment	Defensive Only	Stationary	Medium	Advanced	true	t	test 2.2
277	Logistics	100	Combat Support	Supply Materials	Battalion	Offense and Defense	Mobile (wheeled)	Medium	Advanced	true	f	test 2.2
278	PLA BG	100	Infantry	Combat	Brigade/Regiment	Offense and Defense	Mobile (foot)	Medium	Basic	false	f	test 2.2
279	PLA CO	100	Infantry	Combat	Company/Battery	Offensive Only	Mobile (foot)	Medium	Basic	false	f	test 2.2
280	Logistics	100	Combat Support	Supply Materials	Battalion	Offense and Defense	Mobile (wheeled)	Medium	Advanced	true	f	test 2.2
281	PLAHQ	100	Command and Control	Headquarters	Brigade/Regiment	Defensive Only	Stationary	Medium	Advanced	false	t	test 2.2
264	Brigade	100	Infantry	Combat	Brigade/Regiment	Offensive Only	Mobile (foot)	Medium	Advanced	true	f	test 3
270	PLAHQ	50	Command and Control	Headquarters	Brigade/Regiment	Defensive Only	Stationary	Medium	Advanced	false	t	test 3
282	US-MLR	50	Infantry	Combat	Battalion	Offense and Defense	Mobile (wheeled)	High	Advanced	true	t	updated test
283	INF-CO-D-5	56	Infantry	Combat	Company/Battery	Defensive Only	Mobile (foot)	Medium	Advanced	false	t	updated test
284	EZOHIGUMA-B	100	Special Operations Forces	Combat	Squad/Team	Offense and Defense	Mobile (foot)	Low	Untrained	true	f	test 2.2
285	INF-BG-C-10	100	Infantry	Combat	Brigade/Regiment	Defensive Only	Mobile (wheeled)	Low	Basic	false	f	test 2.2
286	EZOHIGUMA-B	100	Special Operations Forces	Combat	Squad/Team	Offense and Defense	Mobile (foot)	Low	Untrained	true	t	test again
287	US-ARM-CO-B	100	Armor Company	Combat	Company/Battery	Offensive Only	Mobile (track)	High	Advanced	true	f	test again
\.


--
-- TOC entry 4894 (class 0 OID 16492)
-- Dependencies: 223
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sections (sectionid, isonline) FROM stdin;
ONE v1	t
test 2	t
test 3	t
test 2.2	t
updated test	t
test again	t
\.


--
-- TOC entry 4895 (class 0 OID 16495)
-- Dependencies: 224
-- Data for Name: tactics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tactics (friendlyawareness, enemyawareness, friendlylogistics, enemylogistics, friendlycoverage, enemycoverage, friendlygps, enemygps, friendlycomms, enemycomms, friendlyfire, enemyfire, friendlypattern, enemypattern, engagementid) FROM stdin;
1	0	1	0	1	0	1	0	1	0	1	0	1	1	657
1	0	1	0	1	0	1	0	1	0	1	0	1	1	658
0	1	1	1	1	1	1	1	1	1	1	1	1	1	659
1	1	1	1	1	1	1	1	1	1	1	1	1	1	660
1	1	1	1	1	1	1	1	1	1	1	1	1	1	661
0	1	0	1	0	1	0	1	0	1	0	1	1	1	662
0	1	0	1	0	1	1	1	1	1	1	1	0	1	663
1	1	1	1	1	1	1	1	1	1	1	1	1	1	664
1	1	1	1	1	1	1	1	1	1	1	1	1	1	665
1	1	1	1	0	1	1	1	1	1	1	1	0	1	666
0	1	1	1	1	1	0	1	1	1	1	1	1	1	667
1	1	0	1	0	1	1	1	0	1	1	1	1	1	668
0	1	1	1	1	1	1	1	1	1	1	1	1	1	669
0	1	1	1	1	1	0	1	1	1	1	1	1	1	670
1	1	0	1	1	1	1	1	1	1	1	1	1	1	671
0	1	1	1	1	1	1	1	1	1	1	1	1	1	672
1	1	0	1	1	1	1	1	1	1	1	1	1	1	673
1	1	0	1	1	1	1	1	1	1	1	1	1	1	674
1	1	0	1	1	1	1	1	1	1	1	1	1	1	675
1	1	0	1	0	1	1	1	1	1	1	1	1	1	676
1	1	0	1	0	1	1	1	1	1	0	1	1	1	677
0	1	1	1	1	1	1	1	1	1	1	1	1	1	678
1	1	1	1	1	1	0	1	0	1	1	1	1	1	679
1	1	1	1	1	1	0	1	0	1	1	1	1	1	680
0	1	1	1	1	1	1	1	1	1	1	1	1	1	681
1	1	0	1	1	1	1	1	1	1	1	1	1	1	682
0	1	1	1	1	1	0	1	1	1	1	1	1	1	683
0	1	1	1	1	1	0	1	1	1	1	1	1	1	684
0	1	1	1	1	1	1	1	0	1	1	1	1	1	685
1	0	0	0	1	1	1	1	1	1	1	0	1	0	686
0	1	1	1	0	1	0	1	1	1	1	1	1	1	687
0	1	1	1	0	1	0	1	1	1	1	1	1	1	688
1	1	0	1	1	1	1	1	1	1	1	1	1	1	689
1	1	1	1	1	1	1	1	1	1	1	1	1	1	690
0	1	1	1	1	1	1	1	1	1	1	1	1	1	691
0	1	1	1	1	1	1	1	1	1	1	1	1	1	692
1	1	1	1	0	1	0	1	1	1	1	1	1	1	693
1	1	1	1	0	1	0	1	1	1	1	1	1	1	694
0	1	1	1	1	1	0	1	1	1	1	1	1	1	695
0	0	1	0	1	1	0	1	1	1	1	0	1	0	696
1	1	1	1	0	1	1	1	1	1	0	1	1	1	697
1	1	0	1	1	1	0	1	1	1	1	1	1	1	698
1	1	0	1	1	1	1	1	1	1	1	1	1	1	699
1	1	0	1	0	1	1	1	1	1	1	1	1	1	700
0	1	1	1	0	1	1	1	1	1	1	1	1	1	701
1	1	0	1	1	1	1	1	1	1	0	1	1	1	702
1	1	0	1	1	1	1	1	1	1	1	1	1	1	703
0	1	1	1	1	1	1	1	1	1	1	1	1	1	704
0	1	0	1	0	1	1	1	1	1	1	1	1	1	705
1	1	0	1	1	1	0	1	1	1	1	1	1	1	706
0	1	1	1	0	1	1	1	1	1	1	1	1	1	707
1	1	0	1	0	1	1	1	1	1	1	1	1	1	708
1	1	1	1	0	1	0	1	1	1	0	1	1	1	709
1	1	1	1	0	1	1	1	1	1	0	1	1	1	710
0	1	1	1	0	1	1	1	0	1	1	1	1	1	711
1	1	0	1	1	1	0	1	0	1	1	1	1	1	712
0	1	1	1	1	1	1	1	1	1	1	1	1	1	713
1	1	0	1	0	1	1	1	1	1	1	1	1	1	714
1	1	0	1	1	1	1	1	1	1	1	1	1	1	715
1	1	0	1	1	1	0	1	1	1	1	1	1	1	716
1	1	1	1	1	1	0	1	1	1	1	1	1	1	717
1	1	1	1	1	1	0	1	1	1	1	1	1	1	718
1	1	1	1	1	1	0	1	1	1	1	1	1	1	719
1	1	1	1	0	1	1	1	1	1	1	1	0	1	720
1	1	1	1	0	1	1	1	1	1	1	1	1	1	721
1	1	1	1	1	1	1	1	1	1	1	1	1	1	722
1	1	1	1	1	1	0	1	1	1	1	1	1	1	723
1	1	1	1	1	1	1	1	1	1	1	1	1	1	724
1	1	1	1	1	1	1	1	1	1	1	1	1	1	725
1	1	1	1	1	1	1	1	1	1	1	1	1	1	726
1	1	1	1	1	1	1	1	1	1	1	1	1	1	727
1	1	1	1	1	1	1	1	1	1	1	1	1	1	728
1	1	1	1	0	1	1	1	1	1	1	1	1	1	729
1	0	1	0	0	1	1	1	1	1	1	0	1	0	730
1	0	1	0	1	1	1	1	1	1	1	0	1	0	731
1	1	1	1	0	1	1	1	0	1	1	1	1	1	732
1	1	1	1	1	1	0	1	0	1	1	1	1	1	733
1	1	1	1	1	1	0	1	1	1	1	1	1	1	734
1	1	1	1	1	1	0	1	0	1	1	1	1	1	735
1	1	1	1	0	1	1	1	0	1	1	1	1	1	736
1	1	1	1	1	1	1	1	0	1	1	1	1	1	737
0	1	1	1	1	1	1	1	0	1	1	1	1	1	738
1	1	1	1	1	1	1	1	1	1	1	1	1	1	739
1	1	1	1	1	1	1	1	1	1	1	1	1	1	740
1	1	1	1	1	1	1	1	1	1	1	1	1	1	741
1	1	1	1	1	1	1	1	0	1	1	1	1	1	742
0	1	1	1	0	1	1	1	1	1	1	1	1	1	743
0	1	1	1	1	1	0	1	1	1	1	1	1	1	744
0	1	1	1	0	1	0	1	1	1	1	1	1	1	745
0	1	1	1	1	1	0	1	1	1	1	1	1	1	746
0	1	1	1	1	1	1	1	1	1	1	1	1	1	747
1	1	1	1	1	1	1	1	1	1	1	1	1	1	748
0	1	0	1	1	1	1	1	1	1	1	1	1	1	749
0	1	0	1	1	1	1	1	1	1	1	1	1	1	750
0	1	0	1	1	1	1	1	1	1	1	1	1	1	751
0	1	0	1	1	1	1	1	1	1	1	1	1	1	752
0	1	0	1	1	1	1	1	1	1	1	1	1	1	753
0	1	0	1	1	1	1	1	1	1	1	1	1	1	754
1	1	1	1	0	1	0	1	1	1	1	1	1	1	755
1	1	1	1	0	1	0	1	1	1	1	1	1	1	756
1	1	1	1	1	1	1	1	1	1	1	1	1	1	757
0	1	1	1	0	1	1	1	1	1	1	1	1	1	758
1	1	1	1	1	1	1	1	1	1	1	1	1	1	759
1	1	1	1	1	1	1	1	1	1	1	1	1	1	760
1	1	1	1	1	1	1	1	1	1	1	1	1	1	761
1	1	1	1	1	1	1	1	1	1	1	1	1	1	762
1	1	0	1	1	1	1	1	0	1	1	1	1	1	763
1	1	0	1	1	1	1	1	0	1	0	1	0	1	764
1	1	1	1	1	1	1	1	1	1	1	1	1	1	765
1	1	1	1	1	1	1	1	1	1	1	1	1	1	766
1	1	1	1	1	1	1	1	1	1	1	1	1	1	767
1	1	1	1	1	1	1	1	1	1	1	1	1	1	768
1	1	1	1	1	1	1	1	1	1	1	1	1	1	769
1	1	1	1	1	1	1	1	1	1	1	1	1	1	770
1	1	1	1	1	1	1	1	1	1	1	1	1	1	771
1	1	1	1	1	1	1	1	1	1	1	1	1	1	772
1	1	1	1	0	1	1	1	0	1	0	1	1	1	773
1	1	1	1	1	1	1	1	1	1	1	1	1	1	774
1	1	1	1	1	1	1	1	1	1	1	1	1	1	775
1	1	0	1	1	1	1	1	1	1	0	1	1	1	776
1	1	0	1	1	1	1	1	1	1	0	1	1	1	777
1	1	0	1	1	1	1	1	1	1	0	1	1	1	778
0	1	1	1	1	1	1	1	1	1	1	1	1	1	779
1	1	1	1	1	1	1	1	1	1	1	1	1	1	780
1	1	1	1	1	1	1	1	1	1	1	1	1	1	781
1	1	1	1	1	1	1	1	1	1	1	1	1	1	782
1	1	1	1	1	1	1	1	1	1	1	1	1	1	783
\.


--
-- TOC entry 4897 (class 0 OID 16499)
-- Dependencies: 226
-- Data for Name: unit_tactics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.unit_tactics ("ID", awareness, logistics, coverage, gps, comms, fire, pattern) FROM stdin;
\.


--
-- TOC entry 4898 (class 0 OID 16502)
-- Dependencies: 227
-- Data for Name: units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.units (unit_id, unit_type, unit_health, role_type, unit_size, force_posture, force_mobility, force_readiness, force_skill, children, section, id, root, "isFriendly", xcord, ycord, zcord) FROM stdin;
\.


--
-- TOC entry 4914 (class 0 OID 0)
-- Dependencies: 216
-- Name: engagements_engagementid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.engagements_engagementid_seq', 783, true);


--
-- TOC entry 4915 (class 0 OID 0)
-- Dependencies: 222
-- Name: section_units_unit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.section_units_unit_id_seq', 287, true);


--
-- TOC entry 4916 (class 0 OID 0)
-- Dependencies: 225
-- Name: tactics_engagementid_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tactics_engagementid_seq', 783, true);


--
-- TOC entry 4917 (class 0 OID 0)
-- Dependencies: 228
-- Name: units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.units_id_seq', 41, true);


--
-- TOC entry 4739 (class 2606 OID 16510)
-- Name: unit_tactics enemy_tactics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_tactics
    ADD CONSTRAINT enemy_tactics_pkey PRIMARY KEY ("ID");


--
-- TOC entry 4729 (class 2606 OID 16512)
-- Name: engagements engagements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.engagements
    ADD CONSTRAINT engagements_pkey PRIMARY KEY (engagementid);


--
-- TOC entry 4731 (class 2606 OID 16514)
-- Name: preset_units presetunits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.preset_units
    ADD CONSTRAINT presetunits_pkey PRIMARY KEY (unit_name);


--
-- TOC entry 4733 (class 2606 OID 16516)
-- Name: section_tree section_tree_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section_tree
    ADD CONSTRAINT section_tree_pkey PRIMARY KEY (child_id);


--
-- TOC entry 4735 (class 2606 OID 16518)
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (sectionid);


--
-- TOC entry 4737 (class 2606 OID 16520)
-- Name: tactics tactics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tactics
    ADD CONSTRAINT tactics_pkey PRIMARY KEY (engagementid);


--
-- TOC entry 4741 (class 2606 OID 16522)
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- TOC entry 4742 (class 2606 OID 16523)
-- Name: unit_tactics id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_tactics
    ADD CONSTRAINT id FOREIGN KEY ("ID") REFERENCES public.units(id);


--
-- TOC entry 4905 (class 0 OID 0)
-- Dependencies: 215
-- Name: TABLE engagements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.engagements TO PUBLIC;


--
-- TOC entry 4906 (class 0 OID 0)
-- Dependencies: 216
-- Name: SEQUENCE engagements_engagementid_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.engagements_engagementid_seq TO PUBLIC;


--
-- TOC entry 4907 (class 0 OID 0)
-- Dependencies: 223
-- Name: TABLE sections; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sections TO PUBLIC;


--
-- TOC entry 4908 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE tactics; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tactics TO PUBLIC;


--
-- TOC entry 4909 (class 0 OID 0)
-- Dependencies: 225
-- Name: SEQUENCE tactics_engagementid_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.tactics_engagementid_seq TO PUBLIC;


--
-- TOC entry 4910 (class 0 OID 0)
-- Dependencies: 226
-- Name: TABLE unit_tactics; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.unit_tactics TO PUBLIC;


--
-- TOC entry 4911 (class 0 OID 0)
-- Dependencies: 227
-- Name: TABLE units; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.units TO PUBLIC;


--
-- TOC entry 4913 (class 0 OID 0)
-- Dependencies: 228
-- Name: SEQUENCE units_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.units_id_seq TO PUBLIC;


-- Completed on 2025-06-12 12:44:02

--
-- PostgreSQL database dump complete
--

