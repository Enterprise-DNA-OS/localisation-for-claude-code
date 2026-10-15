create or replace view translation_status as
select p.id project_id,p.name project,s.id string_id,s.name key,l.code locale,s.source_text,s.version,
 coalesce(t.text,'') translation, t.reviewer,t.editor,s.risk,s.max_length,s.description,
 case
 when p.review_due is null or p.review_due<current_date or p.retention_purpose='' then 'project-review'
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
