create function touch_updated() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create table projects (
 id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name))>0),
 source_locale text not null check(source_locale ~ '^[A-Za-z]{2,3}([_-][A-Za-z0-9]{2,8})*$'),
 owner text not null, retention_purpose text not null default '', review_due date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table locales (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references projects,
 code text not null check(code ~ '^[A-Za-z]{2,3}([_-][A-Za-z0-9]{2,8})*$'),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(project_id,code)
);
create table strings (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references projects,
 name text not null check(length(trim(name))>0), source_text text not null check(length(trim(source_text))>0),
 version integer not null default 1 check(version>0), description text not null default '',
 max_length integer check(max_length>0), risk text not null default 'standard' check(risk in ('standard','claim','personal')),
 evidence text not null default '', review_due date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(project_id,name), unique(id,project_id)
);
create table translations (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, string_id uuid not null,
 locale text not null, text text not null default '', reviewed_version integer, reviewer text, evidence text,
 reviewed_at timestamptz, editor text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(string_id,project_id) references strings(id,project_id), foreign key(project_id,locale) references locales(project_id,code),
 unique(string_id,locale)
);
create table tasks (
 id uuid primary key default gen_random_uuid(), string_id uuid not null references strings, name text not null,
 owner text not null, due date not null, status text not null default 'open' check(status in ('open','done')),
 resolution text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table terms (
 id uuid primary key default gen_random_uuid(), project_id uuid not null, locale text not null,
 source_term text not null check(length(trim(source_term))>0), target_term text not null check(length(trim(target_term))>0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(project_id,locale) references locales(project_id,code), unique(project_id,locale,source_term)
);
create table imports (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references projects, locale text not null,
 string_name text not null, source_row jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(project_id,locale,string_name)
);
create table events (
 id uuid primary key default gen_random_uuid(), actor text not null, action text not null, details jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function immutable_event() returns trigger language plpgsql as $$ begin raise exception 'Events cannot be edited'; end $$;
create trigger immutable_events before update or delete on events for each row execute function immutable_event();
do $$ declare t text; begin foreach t in array array['projects','locales','strings','translations','tasks','terms','imports'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated()',t);
 end loop;
 foreach t in array array['projects','locales','strings','translations','tasks','terms','imports','events'] loop
 execute format('alter table %I enable row level security',t); execute format('revoke all on %I from public',t);
 end loop; end $$;
-- Deliberately limited to literal named braces and printf tokens. Complex ICU and markup need a dedicated parser.
create function placeholders(t text) returns text language sql immutable as $$
 select coalesce(string_agg(m[1], '|' order by m[1]),'') from regexp_matches(t, '(\{[A-Za-z_][A-Za-z0-9_]*\}|%[0-9]*\$?[sdif])','g') m
$$;
create view translation_status as
select p.id project_id,p.name project,s.id string_id,s.name key,l.code locale,s.source_text,s.version,
 coalesce(t.text,'') translation, t.reviewer,t.editor,s.risk,s.max_length,s.description,
 case
 when s.source_text ~ '\{[^{}]*,[[:space:]]*(plural|select|selectordinal)' or coalesce(t.text,'') ~ '\{[^{}]*,[[:space:]]*(plural|select|selectordinal)' or s.source_text ~ '<[^>]+>' or coalesce(t.text,'') ~ '<[^>]+>' then 'unsupported-format'
 when coalesce(trim(t.text),'')='' then 'missing'
 when placeholders(s.source_text)<>placeholders(t.text) then 'placeholder-mismatch'
 when s.max_length is not null and char_length(t.text)>s.max_length then 'too-long'
 when exists(select 1 from terms g where g.project_id=p.id and g.locale=l.code and position(lower(g.source_term) in lower(s.source_text))>0 and position(lower(g.target_term) in lower(t.text))=0) then 'term-mismatch'
 when s.risk<>'standard' and (s.evidence='' or s.review_due is null or s.review_due<current_date) then 'evidence-due'
 when t.reviewed_version is distinct from s.version then 'needs-review'
 else 'ready' end state
from strings s join projects p on p.id=s.project_id join locales l on l.project_id=p.id
left join translations t on t.string_id=s.id and t.locale=l.code;
create view release_readiness as
select project_id,project,locale,count(*) total,count(*) filter(where state='ready') ready,
 count(*) filter(where state<>'ready') blocked from translation_status group by project_id,project,locale;
create view overdue_tasks as
select t.id,t.name,t.owner,t.due,p.name project,s.name key,t.status from tasks t join strings s on s.id=t.string_id join projects p on p.id=s.project_id where t.status='open' and t.due<current_date;
create view compliance_findings as
select p.id record_id,p.name record,'project-review' rule,'Review date missing or overdue' finding from projects p where review_due is null or review_due<current_date
union all select id,name,'retention-purpose','Record why personal information must be kept' from projects where retention_purpose=''
union all select id,name,'claim-evidence','Claim needs current evidence and a review date' from strings where risk='claim' and (evidence='' or review_due is null or review_due<current_date)
union all select id,name,'personal-accuracy','Personal information needs an accuracy check before use' from strings where risk='personal' and (evidence='' or review_due is null or review_due<current_date);
