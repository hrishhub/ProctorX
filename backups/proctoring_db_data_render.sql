--
-- PostgreSQL database dump
--

\restrict v7Tm07KvvKR8rZqeIHdiWYK6SGu1UGvmTGBhaRsJuXuBddYVZRmhBb8aYFdy6w6

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

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
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizations (id, name, slug, created_at) FROM stdin;
1	Default Organization	default	2026-10-02 00:29:13.035857
\.


--
-- Data for Name: exams; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.exams (id, title, description, duration, total_marks, published, created_at, organization_id) FROM stdin;
1	Computer Science Test	Basic programming examination	30	2	f	\N	1
2	Science Test	This is a Trail Test	30	2	t	\N	1
3	General Aptitude 		30	2	t	2026-10-02 03:57:24.187704	1
4	Computer Science Test	f	30	1	t	2026-10-02 04:11:05.811155	1
5	Maths Test		30	1	t	2026-10-02 05:10:09.410093	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password_hash, role, created_at, organization_id) FROM stdin;
1	Admin	admin@proctoring.com	$argon2id$v=19$m=65536,t=3,p=4$BdwbmywXruvwgt1PlJAzXQ$IlVaxp+jAxGcp095Gwe4Iq8BjlreI2lXXa27yTO8MmY	admin	\N	1
2	Hrishabh Raj	student@proctoring.com	$argon2id$v=19$m=65536,t=3,p=4$F723Y9T7dvyCJzP0NIxE1g$Lg1ze3S2UMPVZoDkvbbV8nEZhbVlJRT8hG0ZFcjmmlI	student	\N	1
3	Hansraj	hans@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$1MnDXd9rFXSAYBqmuytGxw$Dptt+k+7iNHdhQB9UnyeN6DxqGLWMsF8zI0wyQ986Q8	student	2026-10-02 04:48:45.834351	1
\.


--
-- Data for Name: attempts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attempts (id, student_id, exam_id, status, score, started_at, submitted_at, organization_id) FROM stdin;
1	2	2	submitted	2	2026-10-01 19:12:57.390561	2026-10-01 19:15:30.875252	1
2	2	2	submitted	0	2026-10-01 19:15:33.847069	2026-10-01 19:18:15.250315	1
3	2	2	submitted	0	2026-10-01 19:18:17.820055	2026-10-01 19:18:17.843331	1
4	2	2	submitted	0	2026-10-01 19:18:20.301755	2026-10-01 19:18:20.3203	1
5	2	2	submitted	0	2026-10-01 19:20:02.990746	2026-10-01 19:20:03.030075	1
6	2	2	submitted	0	2026-10-01 19:20:04.963306	2026-10-01 19:20:04.985336	1
7	2	2	submitted	0	2026-10-01 19:20:06.988901	2026-10-01 19:20:07.01071	1
8	2	2	submitted	0	2026-10-01 19:21:47.567807	2026-10-01 19:21:47.597909	1
9	2	2	submitted	0	2026-10-01 19:21:49.44639	2026-10-01 19:21:49.467418	1
10	2	2	submitted	0	2026-10-01 19:22:10.573626	2026-10-01 19:22:10.595809	1
11	2	2	submitted	0	2026-10-01 19:23:34.609907	2026-10-01 19:23:34.651444	1
12	2	2	submitted	0	2026-10-01 19:23:39.674853	2026-10-01 19:23:39.697184	1
13	2	2	submitted	0	2026-10-01 19:23:41.619439	2026-10-01 19:23:41.641337	1
14	2	2	submitted	0	2026-10-01 19:24:25.898738	2026-10-01 19:24:25.923038	1
15	2	2	submitted	0	2026-10-01 19:24:28.635584	2026-10-01 19:24:28.653403	1
16	2	2	submitted	0	2026-10-01 19:25:47.945469	2026-10-01 19:25:59.409172	1
17	2	2	submitted	0	2026-10-01 19:27:53.332974	2026-10-01 19:28:24.707278	1
18	2	2	submitted	0	2026-10-01 19:28:50.088566	2026-10-01 19:30:19.834345	1
19	2	2	submitted	0	2026-10-01 19:30:33.814065	2026-10-01 19:32:20.831118	1
20	2	2	submitted	0	2026-10-01 19:32:44.979226	2026-10-01 19:33:01.567595	1
21	2	2	submitted	0	2026-10-01 19:33:40.865144	2026-10-01 19:36:31.543554	1
22	2	2	submitted	0	2026-10-01 19:36:34.124849	2026-10-01 19:38:25.913364	1
23	2	2	submitted	0	2026-10-01 19:38:29.243843	2026-10-01 19:40:40.928083	1
24	2	2	submitted	0	2026-10-01 19:40:50.983308	2026-10-01 19:41:02.652276	1
25	2	2	submitted	0	2026-10-01 19:42:06.803994	2026-10-01 19:43:49.438964	1
26	2	2	submitted	0	2026-10-01 19:43:52.865183	2026-10-01 19:43:53.909196	1
27	2	2	submitted	0	2026-10-01 19:45:31.763828	2026-10-01 19:45:32.789635	1
28	2	2	submitted	0	2026-10-01 19:46:29.120585	2026-10-01 19:46:30.148402	1
29	2	2	submitted	2	2026-10-01 19:46:44.814013	2026-10-01 19:47:30.157379	1
30	2	2	submitted	2	2026-10-01 19:47:34.814766	2026-10-01 19:47:38.670743	1
31	2	2	submitted	0	2026-10-01 19:50:26.38873	2026-10-01 19:50:36.662492	1
32	2	2	submitted	0	2026-10-01 19:52:10.989436	2026-10-01 19:52:18.349539	1
33	2	2	submitted	2	2026-10-01 19:53:38.860022	2026-10-01 19:53:44.523831	1
34	2	2	submitted	0	2026-10-01 19:59:35.596617	2026-10-01 20:00:46.764318	1
35	2	3	submitted	2	2026-10-02 04:13:28.603482	2026-10-02 04:13:41.644883	1
36	2	4	submitted	0	2026-10-02 04:13:46.47737	2026-10-02 04:19:04.25132	1
37	2	2	submitted	0	2026-10-02 04:19:07.270217	2026-10-02 04:21:24.130375	1
38	2	3	submitted	2	2026-10-02 04:21:27.235494	2026-10-02 04:21:32.167724	1
39	2	3	submitted	2	2026-10-02 04:21:34.754535	2026-10-02 04:21:39.272499	1
40	2	2	submitted	2	2026-10-02 04:22:03.900774	2026-10-02 04:22:16.038529	1
41	2	4	submitted	0	2026-10-02 04:25:22.793432	2026-10-02 04:26:02.967716	1
42	2	4	submitted	0	2026-10-02 04:26:05.40571	2026-10-02 04:26:31.777017	1
43	2	4	submitted	0	2026-10-02 04:28:36.115163	2026-10-02 04:28:41.03076	1
44	2	3	submitted	0	2026-10-02 04:28:47.594472	2026-10-02 04:28:51.797503	1
45	2	4	submitted	0	2026-10-02 04:30:36.757682	2026-10-02 04:30:40.654245	1
46	2	4	submitted	0	2026-10-02 04:32:22.326966	2026-10-02 04:32:26.869652	1
47	2	3	submitted	2	2026-10-02 04:32:41.784349	2026-10-02 04:32:46.457463	1
48	2	3	submitted	0	2026-10-02 04:41:37.098993	2026-10-02 04:41:46.241945	1
49	2	4	submitted	0	2026-10-02 04:47:43.354492	2026-10-02 04:47:48.897305	1
50	3	4	submitted	0	2026-10-02 05:05:37.660252	2026-10-02 05:05:44.475268	1
51	3	4	submitted	1	2026-10-02 05:07:52.890591	2026-10-02 05:07:58.784808	1
52	3	4	submitted	0	2026-10-02 05:08:49.683751	2026-10-02 05:10:37.051128	1
53	3	5	submitted	0	2026-10-02 05:10:42.245125	2026-10-02 05:22:01.444488	1
54	2	5	submitted	0	2026-10-02 05:21:16.638921	2026-10-02 05:24:43.203579	1
56	2	5	submitted	0	2026-10-02 05:24:55.245013	2026-10-02 05:25:10.546613	1
55	3	5	submitted	0	2026-10-02 05:22:07.537393	2026-10-02 05:25:44.744497	1
57	2	4	submitted	0	2026-10-02 05:25:15.125773	2026-10-02 05:29:24.866426	1
58	2	4	submitted	0	2026-10-02 05:29:29.543008	2026-10-02 05:30:13.059414	1
59	2	5	submitted	0	2026-10-02 05:30:17.784337	2026-10-02 05:33:20.667422	1
60	2	5	submitted	0	2026-10-02 05:33:28.986436	2026-10-02 05:33:34.748108	1
61	2	4	submitted	0	2026-10-02 05:33:40.073281	2026-10-02 05:33:44.593386	1
62	2	5	submitted	0	2026-10-02 05:33:51.312201	2026-10-02 05:34:08.402031	1
63	2	5	submitted	0	2026-10-02 05:34:14.582271	2026-10-02 05:36:31.910369	1
64	2	5	submitted	0	2026-10-02 05:36:37.522561	2026-10-02 05:36:58.696228	1
65	2	4	submitted	0	2026-10-02 05:37:07.902679	2026-10-02 05:43:09.280605	1
66	2	5	submitted	1	2026-10-02 05:43:17.233431	2026-10-02 05:43:22.717195	1
67	2	5	submitted	0	2026-10-02 05:45:54.664974	2026-10-02 05:46:03.307286	1
69	3	5	in_progress	0	2026-10-02 05:47:28.948818	\N	1
68	2	5	submitted	0	2026-10-02 05:46:41.898282	2026-10-02 05:50:30.573232	1
70	2	2	submitted	0	2026-10-02 05:50:38.654186	2026-10-02 05:50:49.593561	1
71	2	5	submitted	0	2026-10-02 05:50:53.469881	2026-10-02 05:55:01.976247	1
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.questions (id, exam_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, image_url) FROM stdin;
1	1	What is the time complexity of binary search?	O(n)	O(log n)	O(n²)	O(1)	1	1	\N
2	1	Which data structure follows FIFO?	Stack	Tree	Queue	Graph	2	1	\N
3	2	What is Recursion	Optionnnn	Nothingg	Justtt	Whattt	3	2	\N
4	3	Who is He 	Me	You	You	Me	2	2	\N
5	4	dgf	ghgf	fj	hj	hgj	0	1	\N
6	5		2	4	4	5	1	1	/uploads/questions/72ca07702f0b4ab8b84babaa95161a59.png
\.


--
-- Data for Name: answers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.answers (id, attempt_id, question_id, selected_option) FROM stdin;
1	1	3	3
2	2	3	0
3	16	3	1
4	29	3	3
5	30	3	3
6	32	3	0
7	33	3	3
8	34	3	2
9	35	4	2
10	37	3	0
11	38	4	2
12	39	4	2
13	40	3	3
14	42	5	3
15	43	5	1
16	44	4	1
17	45	5	1
18	46	5	1
19	47	4	2
20	49	5	3
21	50	5	3
22	51	5	0
23	58	5	3
24	60	6	0
25	62	6	2
26	66	6	1
27	68	6	0
28	70	3	0
\.


--
-- Data for Name: proctoring_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.proctoring_events (id, attempt_id, event_type, event_data, "timestamp") FROM stdin;
1	18	exam_submitted	Exam automatically submitted after timer expired	2026-10-01 19:30:19.810741
2	19	fullscreen_enter	Candidate entered fullscreen mode	2026-10-01 19:30:33.876307
3	19	fullscreen_exit	Candidate exited fullscreen mode	2026-10-01 19:30:46.346893
4	19	fullscreen_enter	Candidate entered fullscreen mode	2026-10-01 19:30:48.960418
5	19	fullscreen_exit	Candidate exited fullscreen mode	2026-10-01 19:30:52.981129
6	19	fullscreen_enter	Candidate entered fullscreen mode	2026-10-01 19:30:56.855768
7	19	fullscreen_exit	Candidate exited fullscreen mode	2026-10-01 19:30:59.796301
8	19	window_blur	Exam window lost focus	2026-10-01 19:31:01.177779
9	19	tab_switch	Candidate changed browser tab or window	2026-10-01 19:31:01.186203
10	19	fullscreen_enter	Candidate entered fullscreen mode	2026-10-01 19:31:20.695064
11	19	fullscreen_exit	Candidate exited fullscreen mode	2026-10-01 19:31:22.687144
12	19	window_blur	Exam window lost focus	2026-10-01 19:31:23.88648
13	19	tab_switch	Candidate changed browser tab or window	2026-10-01 19:31:23.890914
14	19	exam_submitted	Timer expired	2026-10-01 19:32:20.809645
15	20	exam_submitted	Candidate submitted examination	2026-10-01 19:33:01.533348
16	20	fullscreen_exit		2026-10-01 19:33:01.547716
17	21	fullscreen_exit		2026-10-01 19:33:42.751702
18	21	tab_switch	Candidate changed browser tab or window	2026-10-01 19:33:43.516177
19	21	fullscreen_exit		2026-10-01 19:34:25.877655
20	21	tab_switch	Candidate changed browser tab or window	2026-10-01 19:34:27.007488
21	21	fullscreen_exit		2026-10-01 19:34:31.542057
22	21	tab_switch	Candidate changed browser tab or window	2026-10-01 19:34:32.973383
23	21	tab_switch	Candidate changed browser tab or window	2026-10-01 19:34:33.915232
24	21	fullscreen_exit		2026-10-01 19:34:39.136552
25	21	tab_switch	Candidate changed browser tab or window	2026-10-01 19:34:39.685228
26	21	fullscreen_exit		2026-10-01 19:36:15.420852
27	21	fullscreen_exit		2026-10-01 19:36:20.402326
28	21	tab_switch	Candidate changed browser tab or window	2026-10-01 19:36:21.414223
29	21	exam_submitted	Timer expired	2026-10-01 19:36:31.527694
30	22	fullscreen_enter	Candidate entered fullscreen	2026-10-01 19:36:34.304138
31	22	fullscreen_exit	Candidate exited fullscreen	2026-10-01 19:36:51.168078
32	22	window_blur	Exam window lost focus	2026-10-01 19:36:53.29764
33	22	tab_switch	Candidate changed browser tab or window	2026-10-01 19:36:53.30425
34	22	exam_submitted	{"message":"Timer expired","severity":"medium"}	2026-10-01 19:38:25.894528
35	22	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-01 19:38:27.476371
36	23	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-01 19:38:38.112965
37	23	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-01 19:38:39.040888
38	23	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-01 19:38:39.048645
39	23	exam_submitted	{"message":"Timer expired","severity":"medium"}	2026-10-01 19:40:40.89894
40	23	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-01 19:40:41.14137
41	22	microphone_disconnected	{"message":"Microphone track ended","severity":"high"}	2026-10-01 19:40:44.959278
42	24	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-01 19:40:51.387269
43	24	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-01 19:41:02.610699
44	24	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-01 19:41:02.614179
45	24	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-01 19:41:02.640833
46	25	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-01 19:42:07.720798
47	25	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-01 19:42:13.358272
48	25	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-01 19:42:14.007754
49	25	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-01 19:42:14.014375
50	25	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-01 19:42:18.482154
51	25	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-01 19:42:20.912373
52	25	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-01 19:42:21.596249
53	25	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-01 19:42:21.600849
54	25	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-01 19:43:53.593881
55	29	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-01 19:46:45.580541
56	25	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-01 19:46:45.769266
57	25	exam_started	{"message":"Candidate started examination","severity":"medium"}	2026-10-01 19:46:45.778112
58	29	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-01 19:46:47.405628
59	29	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-01 19:46:48.708104
60	29	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-01 19:46:48.714432
61	25	face_not_detected	{"message":"No face detected for more than 3 seconds","severity":"high"}	2026-10-01 19:46:51.029987
62	25	face_not_detected	{"message":"No face detected for more than 3 seconds","severity":"high"}	2026-10-01 19:46:56.031185
63	25	face_not_detected	{"message":"No face detected for more than 3 seconds","severity":"high"}	2026-10-01 19:47:01.030831
64	25	face_not_detected	{"message":"No face detected for more than 3 seconds","severity":"high"}	2026-10-01 19:47:06.288166
65	25	face_not_detected	{"message":"No face detected for more than 3 seconds","severity":"high"}	2026-10-01 19:47:11.526815
66	25	face_not_detected	{"message":"No face detected for more than 3 seconds","severity":"high"}	2026-10-01 19:47:16.536787
67	25	face_not_detected	{"message":"No face detected for more than 3 seconds","severity":"high"}	2026-10-01 19:47:21.776771
68	29	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-01 19:47:24.501089
69	25	face_not_detected	{"message":"No face detected for more than 3 seconds","severity":"high"}	2026-10-01 19:47:26.786555
70	29	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-01 19:47:30.124687
71	29	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-01 19:47:30.128807
72	29	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-01 19:47:30.145331
73	30	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-01 19:47:35.645536
74	30	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-01 19:47:38.622503
75	30	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-01 19:47:38.624894
76	30	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-01 19:47:38.657656
77	31	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-01 19:50:27.297152
78	31	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-01 19:50:36.623724
80	31	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-01 19:50:36.647596
81	32	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-01 19:52:12.036174
82	32	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-01 19:52:18.309457
84	32	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-01 19:52:18.324562
85	33	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-01 19:53:39.856797
86	33	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-01 19:53:44.486313
88	33	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-01 19:53:44.508541
92	34	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-01 19:59:52.107652
93	34	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-01 20:00:05.758491
95	34	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-01 20:00:25.220897
96	34	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-01 20:00:30.066393
97	34	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-01 20:00:30.090771
98	34	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-01 20:00:31.128551
99	34	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-01 20:00:46.722301
101	34	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-01 20:00:46.753993
79	31	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-01 19:50:36.628958
83	32	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-01 19:52:18.313353
87	33	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-01 19:53:44.490382
89	34	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-01 19:59:36.660963
90	34	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-01 19:59:51.198339
91	34	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-01 19:59:52.100533
94	34	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-01 20:00:05.764466
100	34	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-01 20:00:46.726237
102	35	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 04:13:30.746026
103	35	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 04:13:41.476272
104	35	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 04:13:41.595096
105	35	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:13:41.639689
106	36	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 04:13:47.641188
107	36	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:13:51.080063
108	36	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 04:13:51.155715
109	36	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 04:13:52.467529
110	36	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 04:14:18.577891
111	36	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:14:18.595634
112	36	exam_submitted	{"message":"Timer expired","severity":"medium"}	2026-10-02 04:19:04.223445
113	36	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-02 04:19:05.391845
114	37	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 04:19:07.712452
115	37	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 04:19:33.632347
116	37	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 04:19:34.959292
117	37	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 04:19:41.968886
118	37	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:19:43.467942
119	37	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 04:19:43.477015
120	37	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:20:05.977372
121	37	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 04:20:05.993025
122	37	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:20:37.551051
123	37	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 04:20:37.559652
124	37	exam_submitted	{"message":"Timer expired","severity":"medium"}	2026-10-02 04:21:24.091228
125	37	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-02 04:21:25.808758
126	38	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 04:21:32.051346
127	38	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:21:32.056477
128	38	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 04:21:32.212018
129	39	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 04:21:35.23986
130	39	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 04:21:39.150047
131	39	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:21:39.157723
132	39	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 04:21:39.236538
133	40	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 04:22:04.283426
134	40	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 04:22:15.961681
135	40	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:22:15.968589
136	40	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 04:22:16.01368
137	41	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 04:25:23.809753
138	41	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 04:25:26.761578
139	41	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:25:29.08961
140	41	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 04:25:29.101445
141	41	exam_submitted	{"message":"Timer expired","severity":"medium"}	2026-10-02 04:26:02.945592
142	41	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-02 04:26:03.70953
143	42	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 04:26:05.777339
144	42	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 04:26:18.174532
145	42	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:26:19.27717
146	42	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 04:26:19.303743
147	42	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 04:26:27.68585
148	42	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 04:26:31.705988
149	42	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:26:31.710949
150	42	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 04:26:31.755039
151	43	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 04:28:36.965714
152	43	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 04:28:40.953864
153	43	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:28:40.963887
154	43	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 04:28:40.975173
155	44	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 04:28:48.481091
156	44	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 04:28:51.708574
157	44	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:28:51.717136
158	44	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 04:28:51.771869
159	45	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 04:30:37.432359
160	45	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 04:30:40.573164
164	46	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 04:32:26.768566
169	47	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:32:46.389214
170	47	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 04:32:46.438675
161	45	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:30:40.586335
162	45	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 04:30:40.626778
165	46	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:32:26.774674
166	46	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 04:32:26.825454
168	47	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 04:32:46.385283
163	46	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 04:32:23.069581
167	47	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 04:32:42.544346
171	48	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 04:41:38.559319
172	48	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 04:41:46.165404
173	48	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:41:46.171271
174	48	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 04:41:46.219233
175	49	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 04:47:44.650781
176	49	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 04:47:48.792641
177	49	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 04:47:48.80362
178	49	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 04:47:48.869882
179	50	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 05:05:38.751145
180	50	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 05:05:44.42508
181	50	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 05:05:44.440247
182	50	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:05:44.482981
183	51	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 05:07:53.679473
184	51	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 05:07:58.731868
185	51	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:07:58.735595
186	51	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 05:07:58.771324
187	52	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 05:08:50.555194
188	52	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 05:08:55.940305
189	52	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:08:56.98832
190	52	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:08:59.610312
191	52	exam_submitted	{"message":"Timer expired","severity":"medium"}	2026-10-02 05:10:37.026381
192	52	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-02 05:10:37.996046
193	53	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 05:10:42.472797
194	53	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 05:10:52.202849
195	53	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:10:53.394786
196	53	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:10:53.402468
197	53	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:11:23.736817
198	53	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:11:23.741135
199	53	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:12:15.692785
200	53	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:12:15.701679
201	52	microphone_disconnected	{"message":"Microphone track ended","severity":"high"}	2026-10-02 05:12:15.711631
202	54	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:21:31.575028
203	54	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:21:31.609547
204	53	exam_submitted	{"message":"Timer expired","severity":"medium"}	2026-10-02 05:22:01.429004
205	53	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-02 05:22:02.748722
206	55	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 05:22:07.9427
207	55	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 05:22:11.794852
208	55	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:22:12.879798
209	55	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:22:12.885929
210	54	exam_submitted	{"message":"Timer expired","severity":"medium"}	2026-10-02 05:24:43.190519
211	54	camera_permission_denied	{"message":"Unable to access camera or microphone","severity":"high"}	2026-10-02 05:24:43.671217
212	54	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-02 05:24:43.833695
213	56	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:25:04.067406
214	56	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:25:04.09447
215	56	exam_submitted	{"message":"Timer expired","severity":"medium"}	2026-10-02 05:25:10.516573
216	56	camera_permission_denied	{"message":"Unable to access camera or microphone","severity":"high"}	2026-10-02 05:25:11.012874
217	56	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-02 05:25:11.180599
218	57	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:25:18.942154
219	57	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:25:18.970997
220	55	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:25:44.541725
221	55	exam_submitted	{"message":"Timer expired","severity":"medium"}	2026-10-02 05:25:44.725391
222	55	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-02 05:25:45.788294
223	55	microphone_disconnected	{"message":"Microphone track ended","severity":"high"}	2026-10-02 05:25:46.309518
224	57	exam_submitted	{"message":"Timer expired","severity":"medium"}	2026-10-02 05:29:24.823468
225	57	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-02 05:29:26.095557
226	58	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:29:42.885984
227	58	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:29:42.918227
228	58	exam_submitted	{"message":"Timer expired","severity":"medium"}	2026-10-02 05:30:13.032471
229	58	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-02 05:30:14.240074
230	59	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:30:22.796651
231	59	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:30:28.90902
232	59	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:30:28.945114
233	59	exam_submitted	{"message":"Timer expired","severity":"medium"}	2026-10-02 05:33:20.647151
234	59	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-02 05:33:21.849407
235	60	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 05:33:34.727167
236	60	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:33:34.736183
238	62	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 05:34:08.37073
241	59	microphone_disconnected	{"message":"Microphone track ended","severity":"high"}	2026-10-02 05:34:19.662958
237	61	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 05:33:44.551143
239	62	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:34:08.381731
240	63	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:34:19.63343
242	63	exam_submitted	{"message":"Timer expired","severity":"medium"}	2026-10-02 05:36:31.884984
243	63	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-02 05:36:32.968853
244	64	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:36:44.366465
245	64	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 05:36:58.669285
246	64	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:36:58.680331
247	65	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:37:16.87415
248	65	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:37:16.890565
249	65	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:38:36.910476
250	65	camera_permission_denied	{"message":"Unable to access camera or microphone","severity":"high"}	2026-10-02 05:43:00.781151
251	65	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-02 05:43:00.922009
252	65	looking_away	{"message":"Candidate detected as Looking Down","severity":"medium"}	2026-10-02 05:43:04.544433
253	65	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 05:43:09.246795
254	65	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:43:09.255545
255	66	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 05:43:22.67688
256	66	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:43:22.687579
257	67	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 05:46:03.274347
258	67	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:46:03.283082
259	68	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:46:44.365677
260	68	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:46:44.402857
261	69	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 05:47:30.43999
262	69	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 05:47:41.093851
263	69	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:47:44.591917
264	69	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:47:44.598517
265	69	camera_permission_denied	{"message":"Unable to access camera or microphone","severity":"high"}	2026-10-02 05:48:46.462672
266	69	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-02 05:48:46.679213
267	69	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 05:48:47.636483
268	69	looking_away	{"message":"Candidate detected as Looking Down","severity":"medium"}	2026-10-02 05:48:50.276786
269	68	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 05:50:24.89476
270	68	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 05:50:30.532528
271	68	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:50:30.535533
272	68	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 05:50:30.546168
273	70	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 05:50:39.530989
274	70	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 05:50:49.547872
275	70	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:50:49.550297
276	70	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 05:50:49.584697
277	71	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 05:50:54.284528
278	71	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:51:00.849147
279	71	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 05:51:00.858174
280	71	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 05:51:03.483948
281	71	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 05:51:09.798209
282	71	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:51:11.090868
283	71	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:51:11.098083
284	71	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 05:52:53.929757
285	71	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 05:53:00.567545
286	71	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:53:03.06622
287	71	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:53:03.070337
288	71	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:53:24.887622
289	71	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:53:24.890467
290	71	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:53:31.295344
291	71	tab_switch	{"message":"Candidate changed browser tab or window","severity":"medium"}	2026-10-02 05:53:31.297798
292	71	camera_permission_denied	{"message":"Unable to access camera or microphone","severity":"high"}	2026-10-02 05:54:37.250269
293	71	monitoring	{"message":"Face monitoring started","severity":"low"}	2026-10-02 05:54:37.402649
294	71	looking_away	{"message":"Candidate detected as Looking Down","severity":"medium"}	2026-10-02 05:54:41.133015
295	71	face_not_detected	{"message":"No face detected for more than 3 seconds","severity":"high"}	2026-10-02 05:54:47.123188
296	71	face_not_detected	{"message":"No face detected for more than 3 seconds","severity":"high"}	2026-10-02 05:54:52.374165
297	71	looking_away	{"message":"Candidate detected as Looking Right","severity":"medium"}	2026-10-02 05:54:54.14085
298	71	fullscreen_enter	{"message":"Candidate entered fullscreen","severity":"medium"}	2026-10-02 05:54:57.22498
299	71	looking_away	{"message":"Candidate detected as Looking Down","severity":"medium"}	2026-10-02 05:54:59.372239
300	71	exam_submitted	{"message":"Candidate submitted examination","severity":"medium"}	2026-10-02 05:55:01.936942
301	71	window_blur	{"message":"Exam window lost focus","severity":"medium"}	2026-10-02 05:55:01.941141
302	71	fullscreen_exit	{"message":"Candidate exited fullscreen","severity":"medium"}	2026-10-02 05:55:01.96642
\.


--
-- Name: answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.answers_id_seq', 28, true);


--
-- Name: attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.attempts_id_seq', 71, true);


--
-- Name: exams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.exams_id_seq', 5, true);


--
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organizations_id_seq', 1, true);


--
-- Name: proctoring_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.proctoring_events_id_seq', 302, true);


--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.questions_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- PostgreSQL database dump complete
--

\unrestrict v7Tm07KvvKR8rZqeIHdiWYK6SGu1UGvmTGBhaRsJuXuBddYVZRmhBb8aYFdy6w6

