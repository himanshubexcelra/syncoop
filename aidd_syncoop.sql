--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0 (Debian 17.0-1.pgdg120+1)
-- Dumped by pg_dump version 17.0 (Debian 17.0-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: status_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status_type AS ENUM (
    '0',
    '1'
);


ALTER TYPE public.status_type OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: module; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.module (
    id integer NOT NULL,
    name text NOT NULL,
    route text NOT NULL,
    status public.status_type
);


ALTER TABLE public.module OWNER TO postgres;

--
-- Name: module_action; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.module_action (
    id integer NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    "moduleId" integer NOT NULL
);


ALTER TABLE public.module_action OWNER TO postgres;

--
-- Name: module_action_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.module_action_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.module_action_id_seq OWNER TO postgres;

--
-- Name: module_action_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.module_action_id_seq OWNED BY public.module_action.id;


--
-- Name: module_action_role_permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.module_action_role_permission (
    id integer NOT NULL,
    "actionId" integer NOT NULL,
    "roleId" integer NOT NULL
);


ALTER TABLE public.module_action_role_permission OWNER TO postgres;

--
-- Name: module_action_role_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.module_action_role_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.module_action_role_permission_id_seq OWNER TO postgres;

--
-- Name: module_action_role_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.module_action_role_permission_id_seq OWNED BY public.module_action_role_permission.id;


--
-- Name: module_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.module_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.module_id_seq OWNER TO postgres;

--
-- Name: module_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.module_id_seq OWNED BY public.module.id;


--
-- Name: module_permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.module_permission (
    id integer NOT NULL,
    "moduleId" integer NOT NULL,
    "roleId" integer NOT NULL
);


ALTER TABLE public.module_permission OWNER TO postgres;

--
-- Name: module_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.module_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.module_permission_id_seq OWNER TO postgres;

--
-- Name: module_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.module_permission_id_seq OWNED BY public.module_permission.id;


--
-- Name: organization; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organization (
    id integer NOT NULL,
    name text NOT NULL,
    "orgAdminId" integer NOT NULL,
    status public.status_type,
    "createdAt" timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata json
);


ALTER TABLE public.organization OWNER TO postgres;

--
-- Name: organization_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organization_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.organization_id_seq OWNER TO postgres;

--
-- Name: organization_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organization_id_seq OWNED BY public.organization.id;


--
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    id integer NOT NULL,
    type text NOT NULL,
    name text NOT NULL,
    status public.status_type,
    priority integer NOT NULL,
    "createdAt" timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.role OWNER TO postgres;

--
-- Name: role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_id_seq OWNER TO postgres;

--
-- Name: role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    "firstName" character varying,
    email character varying,
    password character varying,
    status public.status_type,
    "createdAt" timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastName" character varying,
    "organizationId" integer
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_id_seq OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: user_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_role (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "roleId" integer NOT NULL
);


ALTER TABLE public.user_role OWNER TO postgres;

--
-- Name: user_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_role_id_seq OWNER TO postgres;

--
-- Name: user_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_role_id_seq OWNED BY public.user_role.id;


--
-- Name: module id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module ALTER COLUMN id SET DEFAULT nextval('public.module_id_seq'::regclass);


--
-- Name: module_action id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_action ALTER COLUMN id SET DEFAULT nextval('public.module_action_id_seq'::regclass);


--
-- Name: module_action_role_permission id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_action_role_permission ALTER COLUMN id SET DEFAULT nextval('public.module_action_role_permission_id_seq'::regclass);


--
-- Name: module_permission id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_permission ALTER COLUMN id SET DEFAULT nextval('public.module_permission_id_seq'::regclass);


--
-- Name: organization id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization ALTER COLUMN id SET DEFAULT nextval('public.organization_id_seq'::regclass);


--
-- Name: role id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role ALTER COLUMN id SET DEFAULT nextval('public.role_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: user_role id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role ALTER COLUMN id SET DEFAULT nextval('public.user_role_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
6497df00-b631-4327-8ef3-8dbe77baeb60	2d24cf70bd5ab270aea570c1afb4d83804fc4900b17ce393922b493da06d3ba5	2024-10-05 10:38:05.514614+00	0_init	\N	\N	2024-10-05 10:38:05.500007+00	1
\.


--
-- Data for Name: module; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.module (id, name, route, status) FROM stdin;
1	User	/dashboard	1
2	Project	/projects	1
3	Organization	/dashboard	1
\.


--
-- Data for Name: module_action; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.module_action (id, name, type, "moduleId") FROM stdin;
3	View own Org & Client Organizations	view	3
4	Edit own Org & Client Org settings	edit	3
5	View Project	view_project	2
6	Create Project	create_project	2
7	Edit Project	edit_project	2
8	Delete Project	delete_project	2
\.


--
-- Data for Name: module_action_role_permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.module_action_role_permission (id, "actionId", "roleId") FROM stdin;
1	5	2
2	6	2
3	7	2
4	8	2
5	5	3
6	6	3
7	7	3
8	8	3
9	3	2
10	4	2
11	3	3
\.


--
-- Data for Name: module_permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.module_permission (id, "moduleId", "roleId") FROM stdin;
1	1	2
2	2	2
3	3	2
4	2	3
5	3	3
\.


--
-- Data for Name: organization; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organization (id, name, "orgAdminId", status, "createdAt", "updatedAt", metadata) FROM stdin;
1	Fauxbio	2	1	2024-10-05 10:43:59.518279	2024-10-05 10:43:59.518279	\N
3	Synergene	3	1	2024-10-05 10:43:59.523715	2024-10-05 10:43:59.523715	\N
5	AstraVantage	4	1	2024-10-05 10:43:59.525488	2024-10-05 10:43:59.525488	\N
6	VitaSphere	5	1	2024-10-05 10:51:02.209616	2024-10-05 10:51:02.209616	\N
7	ChronosPath	6	1	2024-10-05 10:51:22.815353	2024-10-05 10:51:22.815353	{"functionalAssay1":"test1","functionalAssay2":"test2","functionalAssay3":"test3","functionalAssay4":"test4"}
8	New org	8	1	2024-10-05 16:22:42.449	2024-10-05 16:22:42.449	\N
9	EMD DD	1	1	2024-10-07 01:09:46.962776	2024-10-07 01:09:46.962776	\N
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role (id, type, name, status, priority, "createdAt", "updatedAt") FROM stdin;
1	admin	System Admin	1	1	2024-10-05 10:47:29.144775	2024-10-05 10:47:29.144775
3	library_manager	Library manager	1	3	2024-10-05 10:47:29.151636	2024-10-05 10:47:29.151636
4	researcher	Researcher	1	4	2024-10-05 10:47:29.153027	2024-10-05 10:47:29.153027
5	protocol_approver	Protocol approver	1	5	2024-10-05 10:47:29.154706	2024-10-05 10:47:29.154706
2	org_admin	Organization admin	1	2	2024-10-05 10:47:29.150447	2024-10-05 10:47:29.150447
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, "firstName", email, password, status, "createdAt", "updatedAt", "lastName", "organizationId") FROM stdin;
2	Himanshu	himanshu.bhatia@external.milliporesigma.com	Test@123	1	2024-10-05 10:41:58.822887	2024-10-05 10:41:58.822887	Bhatia	1
3	Apoorv	apoorv.mehrotra@external.milliporesigma.com	Test@123	1	2024-10-05 10:41:58.824539	2024-10-05 10:41:58.824539	Mehrotra	3
4	Forum	forum.tanna@external.milliporesigma.com	Test@123	1	2024-10-05 10:41:58.827142	2024-10-05 10:41:58.827142	Tanna	5
5	Suresh	suresh.kumar@external.milliporesigma.com	Test@123	1	2024-10-05 10:41:58.828167	2024-10-05 10:41:58.828167	Kumar	6
6	Manjunath	manjunath.kumar@external.milliporesigma.com	Test@123	1	2024-10-05 10:49:42.771468	2024-10-05 10:49:42.771468	Kumar	7
8	Test	test.org@external.milliporesigma.com	\N	1	2024-10-05 16:22:42.438	2024-10-05 16:22:42.438	Org	8
1	System	sys_admin@external.milliporesigma.com	Test@123	1	2024-10-05 10:41:58.817931	2024-10-05 10:41:58.817931	Admin	9
7	Pallab	pallab.kumar@external.milliporesigma.com	Test@123	1	2024-10-05 10:49:42.775341	2024-10-05 10:49:42.775341	Kumar	3
9	Test	test@milliporesigma.com	Wntqoo0.	1	2024-10-07 10:08:05.967	2024-10-07 10:08:05.967	User Astra	5
\.


--
-- Data for Name: user_role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_role (id, "userId", "roleId") FROM stdin;
1	1	1
2	2	2
3	3	2
4	4	2
5	5	2
6	6	2
7	7	3
8	8	1
9	9	4
10	9	3
\.


--
-- Name: module_action_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.module_action_id_seq', 8, true);


--
-- Name: module_action_role_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.module_action_role_permission_id_seq', 11, true);


--
-- Name: module_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.module_id_seq', 5, true);


--
-- Name: module_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.module_permission_id_seq', 5, true);


--
-- Name: organization_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organization_id_seq', 9, true);


--
-- Name: role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_id_seq', 5, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 9, true);


--
-- Name: user_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_role_id_seq', 10, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: module_action module_action_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_action
    ADD CONSTRAINT module_action_pkey PRIMARY KEY (id);


--
-- Name: module_action_role_permission module_action_role_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_action_role_permission
    ADD CONSTRAINT module_action_role_permission_pkey PRIMARY KEY (id);


--
-- Name: module_permission module_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_permission
    ADD CONSTRAINT module_permission_pkey PRIMARY KEY (id);


--
-- Name: module module_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module
    ADD CONSTRAINT module_pkey PRIMARY KEY (id);


--
-- Name: organization organization_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT organization_pkey PRIMARY KEY (id);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user_role user_role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY (id);


--
-- Name: organization_orgAdminId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "organization_orgAdminId_key" ON public.organization USING btree ("orgAdminId");


--
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- Name: module_action module_action_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_action
    ADD CONSTRAINT "module_action_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public.module(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: module_action_role_permission module_action_role_permission_actionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_action_role_permission
    ADD CONSTRAINT "module_action_role_permission_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES public.module_action(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: module_action_role_permission module_action_role_permission_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_action_role_permission
    ADD CONSTRAINT "module_action_role_permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: module_permission module_permission_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_permission
    ADD CONSTRAINT "module_permission_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public.module(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: module_permission module_permission_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.module_permission
    ADD CONSTRAINT "module_permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: organization organization_orgAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organization
    ADD CONSTRAINT "organization_orgAdminId_fkey" FOREIGN KEY ("orgAdminId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user user_organizationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "user_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES public.organization(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_role user_role_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT "user_role_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.role(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_role user_role_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role
    ADD CONSTRAINT "user_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

