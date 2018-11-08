/*
-- fetch all companionships where there is only a single minister assigned
select district_id, companionship_id, count(companionship_id) as cnt from district_assignments where type = 'minister' group by district_id, companionship_id having count(companionship_id) > 1

-- fetch all companionships where there is only a single family assigned
select district_id, companionship_id, count(companionship_id) as cnt from district_assignments where type = 'assignment' group by district_id, companionship_id having count(companionship_id) < 2

-- fetch all companionships and details where there is only a single family assigned
select da.district_id, da.companionship_id, da.name, da.legacyCmisId, da.type from district_assignments da inner join (select district_id, companionship_id, count(companionship_id) as cnt from district_assignments where type = 'assignment' group by district_id, companionship_id having count(companionship_id) < 2) daf on da.district_id = daf.district_id and da.companionship_id = daf.companionship_id order by da.district_id, da.companionship_id, da.type desc

-- fetch all companionships and details where there is only a single family assigned
select da.district_id, da.companionship_id, wm.coupleName, wm.address, case 
when (instr(lower(wm.address), '180 s') > 0 or instr(lower(wm.address), '140 s') > 0 or (instr(lower(wm.address), '1990 w') > 0) or (instr(lower(wm.address), '1850 w') > 0)) then "eastlake"
when (instr(lower(wm.address), 'silver oak') > 0 or instr(lower(wm.address), 'quivira') > 0 or (instr(lower(wm.address), 'dry creek') > 0) or (instr(lower(wm.address), 'sterling loop') > 0)) then "meadows"
when ((instr(lower(wm.address), '100 s geneva') > 0)) then "alloy"
when ((instr(lower(wm.address), 'holdaway') > 0)) then "holdaway"
else 'other-neighborhoods'
end as region, da.legacyCmisId, da.type from ward_members wm inner join district_assignments da inner join (select district_id, companionship_id, count(companionship_id) as cnt from district_assignments where type = 'assignment' group by district_id, companionship_id having count(companionship_id) < 2) daf on da.district_id = daf.district_id and da.companionship_id = daf.companionship_id and da.legacyCmisId = wm.id order by da.district_id, da.companionship_id, da.type desc

-- ward families who have been assigned to a companionship
select da.legacyCmisId, da.name from district_assignments da where da.type = 'assignment'

-- common join for ward members
ward_members wm inner join tag_associations ta inner join tags t on wm.id = ta.association_id and ta.tag_id = t.id

-- fetch all families by neighborhood who do not have ministering brethren assigned
select t.name, wm2.id, wm2.name from (select wm.id, wm.coupleName as name from ward_members wm where wm.id not in (select wm.id from ward_members wm inner join (select da.legacyCmisId from district_assignments da where da.type = 'assignment') withAssign on wm.id = withAssign.legacyCmisId) and wm.archived_at is null) wm2 inner join tag_associations ta inner join tags t on wm2.id = ta.association_id and ta.tag_id = t.id where ta.association_type = 'ward_members' and t.name in ('alloy', 'meadows', 'eastlake', 'holdaway', 'other-neighborhoods')

-- fetch all brothers by neighborhood who do not have a ministering assignment
select t.name, wm2.id, wm2.name from (select wm.id, wm.coupleName as name, wm.headOfHouse_gender as gender from ward_members wm where wm.id not in (select wm.id from ward_members wm inner join (select da.legacyCmisId from district_assignments da where da.type = 'minister') withAssign on wm.id = withAssign.legacyCmisId) and wm.archived_at is null) wm2 inner join tag_associations ta inner join tags t on wm2.id = ta.association_id and ta.tag_id = t.id where ta.association_type = 'ward_members' and t.name in ('alloy', 'meadows', 'eastlake', 'holdaway', 'other-neighborhoods') and wm2.gender = 'MALE'

-- get all families in the ward, by neighborhood and lastname
select wm.id, ta.id, t.name, wm.coupleName, wm.address from ward_members wm inner join tag_associations ta inner join tags t on wm.id = ta.association_id and ta.tag_id = t.id where ta.association_type = 'ward_members' and t.name in ('alloy', 'meadows', 'eastlake', 'holdaway', 'other-neighborhoods') and wm.archived_at is null order by t.name, wm.coupleName
*/
