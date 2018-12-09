.headers on
.mode csv
.once v1-eq-single-sisters-report.csv
select ss.name as name, ss.address as address, ss.phone as phone, ss.email as email, ss.notes_url as notes, t.name as neighborhood from (select id, coupleName as name, address, phone, email, notes_url from ward_members where archived_at is null and headOfHouse_gender = 'FEMALE') ss inner join tag_associations ta inner join tags t on t.id = ta.tag_id and ta.association_type = 'ward_members' and ta.association_id = ss.id and t.name in ('meadows', 'alloy', 'eastlake', 'holdaway', 'other-neighborhoods') order by t.name, ss.name;

