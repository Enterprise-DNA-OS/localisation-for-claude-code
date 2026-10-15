insert into projects(id,name,source_locale,owner,retention_purpose,review_due) values
('10000000-0000-0000-0000-000000000001','Harbour booking','en','Mara','Support the current booking release',current_date+30),
('10000000-0000-0000-0000-000000000002','Harbour trade portal','en','Theo','',current_date-8) on conflict do nothing;
insert into locales(project_id,code) select id,l from projects cross join (values('fr'),('de')) as x(l) where id in ('10000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002') on conflict do nothing;
insert into strings(id,project_id,name,source_text,description,max_length,risk,review_due) values
('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','booking.welcome','Welcome {name}','Greeting on booking confirmation',60,'standard',null),
('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000001','booking.confirm','Confirm booking','Booking button',25,'standard',null),
('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001','booking.refund','Fully refundable','Refund promise needs evidence',60,'claim',current_date-4),
('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000002','trade.contact','Contact your account manager','Account contact label',50,'personal',current_date-1) on conflict do nothing;
insert into translations(project_id,string_id,locale,text,reviewed_version,reviewer,evidence,reviewed_at,editor) values
('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','fr','Bienvenue {name}',1,'Luc','Demo review only',now(),'Mara'),
('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','de','Willkommen',null,null,null,null,'Theo'),
('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','fr','Confirmer la réservation',null,null,null,null,'Mara'),
('10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003','fr','Entièrement remboursable',1,'Luc','Demo review',now(),'Mara') on conflict do nothing;
insert into tasks(id,string_id,name,owner,due) values
('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003','Confirm refund conditions','Mara',current_date-5),
('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','Restore German placeholder','Theo',current_date+2) on conflict do nothing;
