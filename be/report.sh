#!/bin/bash

# echo -e "\n====== Fetch all companionships where there is only a single minister assigned\n"
#
# # (select * from district_assignments where createdAt in (select max(createdAt) from district_assignments)) dal
#
# # -- fetch all companionships where there is only a single minister assigned
# read -r -d '' sql <<-'EOF'
# select dal.district_id, dal.companionship_id, count(dal.companionship_id) as cnt from (select * from district_assignments where createdAt in (select max(createdAt) from district_assignments)) dal where type = 'minister' group by district_id, companionship_id having count(companionship_id) < 2
# EOF
# echo "$sql" | sqlite3 eq.sqlite3 | column -t -s\|

echo -e "\n====== Companionships missing minister(s)\n"

read -r -d '' sql <<-'EOF'
select da.district_id, da.companionship_id, da.name, da.legacyCmisId, da.type from (select * from district_assignments where createdAt in (select max(createdAt) from district_assignments)) da inner join (select district_id, companionship_id, count(companionship_id) as cnt from (select * from district_assignments where createdAt in (select max(createdAt) from district_assignments)) dal where type = 'minister' group by district_id, companionship_id having count(companionship_id) < 2) daf on da.district_id = daf.district_id and da.companionship_id = daf.companionship_id order by da.district_id, da.companionship_id, da.type desc;
EOF
echo "$sql" | sqlite3 eq.sqlite3 | sed 's/undefined *//g' | column -t -s\|
  
echo -e "\n====== Companionships missing minister(s) (with details)\n"

# -- fetch all companionships and details where there is only a single minister assigned
read -r -d '' sql <<-'EOF'
    select da.district_id, da.companionship_id, wm.coupleName, wm.address, case 
    when (instr(lower(wm.address), 'dry') = 0 and (instr(lower(wm.address), '180 s') > 0 or instr(lower(wm.address), '140 s') > 0 or (instr(lower(wm.address), '1990 w') > 0) or (instr(lower(wm.address), '1850 w') > 0))) then "eastlake"
    when (instr(lower(wm.address), 'silver oak') > 0 or instr(lower(wm.address), 'quivira') > 0 or (instr(lower(wm.address), 'dry creek') > 0) or (instr(lower(wm.address), 'sterling loop') > 0)) then "meadows"
    when ((instr(lower(wm.address), '100 s geneva') > 0)) then "alloy"
    when ((instr(lower(wm.address), 'holdaway') > 0)) then "holdaway"
    else 'other-neighborhoods'
    end as region, da.legacyCmisId, da.type from ward_members wm inner join (select * from district_assignments where createdAt in (select max(createdAt) from district_assignments)) da inner join (select district_id, companionship_id, count(companionship_id) as cnt from (select * from district_assignments where createdAt in (select max(createdAt) from district_assignments)) dal where type = 'minister' group by district_id, companionship_id having count(companionship_id) < 2) daf on da.district_id = daf.district_id and da.companionship_id = daf.companionship_id and da.legacyCmisId = wm.id order by da.district_id, da.companionship_id, da.type desc;
EOF
echo "$sql" | sqlite3 eq.sqlite3 | sed 's/undefined *//g' | column -t -s\|
  
# echo -e "\n====== Less than 2 families assigned\n"
#
# # -- fetch all families and details for companionships where there is less than 2 families
# read -r -d '' sql <<-'EOF'
#     select da.district_id, da.companionship_id, wm.coupleName, wm.address, case 
#     when (instr(lower(wm.address), 'dry') = 0 and (instr(lower(wm.address), '180 s') > 0 or instr(lower(wm.address), '140 s') > 0 or (instr(lower(wm.address), '1990 w') > 0) or (instr(lower(wm.address), '1850 w') > 0))) then "eastlake"
#     when (instr(lower(wm.address), 'silver oak') > 0 or instr(lower(wm.address), 'quivira') > 0 or (instr(lower(wm.address), 'dry creek') > 0) or (instr(lower(wm.address), 'sterling loop') > 0)) then "meadows"
#     when ((instr(lower(wm.address), '100 s geneva') > 0)) then "alloy"
#     when ((instr(lower(wm.address), 'holdaway') > 0)) then "holdaway"
#     else 'other-neighborhoods'
#     end as region, da.legacyCmisId, da.type from ward_members wm inner join (select * from district_assignments where createdAt in (select max(createdAt) from district_assignments)) da inner join (select district_id, companionship_id, count(companionship_id) as cnt from (select * from district_assignments where createdAt in (select max(createdAt) from district_assignments)) dal where type = 'assignment' group by district_id, companionship_id having count(companionship_id) < 2) daf on da.district_id = daf.district_id and da.companionship_id = daf.companionship_id and da.legacyCmisId = wm.id where da.type = 'assignment' order by da.district_id, da.companionship_id, da.type desc
# EOF
# echo "$sql" | sqlite3 eq.sqlite3 | column -t -s\|
  
# echo -e "\n====== Fetch all companionships where there is less than 2 families\n"
#
# # -- fetch all companionships where there is less than 2 families
# read -r -d '' sql <<-'EOF'
# select district_id, companionship_id, count(companionship_id) as cnt from (select * from district_assignments where createdAt in (select max(createdAt) from district_assignments)) dal where type = 'assignment' group by district_id, companionship_id having count(companionship_id) < 2
# EOF
# echo "$sql" | sqlite3 eq.sqlite3 | column -t -s\|

echo -e "\n====== Less than 2 families assigned (grouped with ministering brothers)\n"

# -- fetch all companionships and details where there is less than 2 families
read -r -d '' sql <<-'EOF'
select da.district_id, da.companionship_id, da.name, da.legacyCmisId, da.type from (select * from district_assignments where createdAt in (select max(createdAt) from district_assignments)) da inner join (select district_id, companionship_id, count(companionship_id) as cnt from (select * from district_assignments where createdAt in (select max(createdAt) from district_assignments)) dal where type = 'assignment' group by district_id, companionship_id having count(companionship_id) < 2) daf on da.district_id = daf.district_id and da.companionship_id = daf.companionship_id order by da.district_id, da.companionship_id, da.type desc;
EOF
echo "$sql" | sqlite3 eq.sqlite3 | sed 's/undefined *//g' | column -t -s\|

echo -e "\n====== Less than 2 families assigned (grouped with ministering brothers, with details)\n"

# -- fetch all companionships and details where there is less than 2 families
read -r -d '' sql <<-'EOF'
    select da.district_id, da.companionship_id, wm.coupleName, wm.address, case 
    when (instr(lower(wm.address), 'dry') = 0 and (instr(lower(wm.address), '180 s') > 0 or instr(lower(wm.address), '140 s') > 0 or (instr(lower(wm.address), '1990 w') > 0) or (instr(lower(wm.address), '1850 w') > 0))) then "eastlake"
    when (instr(lower(wm.address), 'silver oak') > 0 or instr(lower(wm.address), 'quivira') > 0 or (instr(lower(wm.address), 'dry creek') > 0) or (instr(lower(wm.address), 'sterling loop') > 0)) then "meadows"
    when ((instr(lower(wm.address), '100 s geneva') > 0)) then "alloy"
    when ((instr(lower(wm.address), 'holdaway') > 0)) then "holdaway"
    else 'other-neighborhoods'
    end as region, da.legacyCmisId, da.type from ward_members wm inner join (select * from district_assignments where createdAt in (select max(createdAt) from district_assignments)) da inner join (select district_id, companionship_id, count(companionship_id) as cnt from (select * from district_assignments where createdAt in (select max(createdAt) from district_assignments)) dal where type = 'assignment' group by district_id, companionship_id having count(companionship_id) < 2) daf on da.district_id = daf.district_id and da.companionship_id = daf.companionship_id and da.legacyCmisId = wm.id order by da.district_id, da.companionship_id, da.type desc;
EOF
echo "$sql" | sqlite3 eq.sqlite3 | sed 's/undefined *//g' | column -t -s\|



# -- ward families who have been assigned to a companionship
# -- select da.legacyCmisId, da.name from district_assignments da where da.type = 'assignment'

# -- common join for ward members
# -- ward_members wm inner join tag_associations ta inner join tags t on wm.id = ta.association_id and ta.tag_id = t.id

echo -e "\n====== No ministering brothers assigned\n"

# -- when trying to find another family to assign to a companionship
# -- fetch all families by neighborhood who do not have ministering brethren assigned
read -r -d '' sql <<-'EOF'
select t.name, wm2.id, wm2.name from (select wm.id, wm.coupleName as name from ward_members wm where wm.id not in (select wm.id from ward_members wm inner join (select da.legacyCmisId from (select * from district_assignments where createdAt in (select max(createdAt) from district_assignments)) da where da.type = 'assignment') withAssign on wm.id = withAssign.legacyCmisId) and wm.archived_at is null) wm2 inner join tag_associations ta inner join tags t on wm2.id = ta.association_id and ta.tag_id = t.id where ta.association_type = 'ward_members' and t.name in ('alloy', 'meadows', 'eastlake', 'holdaway', 'other-neighborhoods') order by t.name, wm2.name;
EOF
echo "$sql" | sqlite3 eq.sqlite3 | sed 's/undefined *//g' | column -t -s\|

echo -e "\n====== Brothers without any ministering assignment\n"

# -- when trying to find another brother to assign to a companionship
# -- fetch all brothers by neighborhood who do not have a ministering assignment
read -r -d '' sql <<-'EOF'
select t.name, wm2.id, wm2.name from (select wm.id, wm.coupleName as name, wm.headOfHouse_gender as gender from ward_members wm where wm.id not in (select wm.id from ward_members wm inner join (select da.legacyCmisId from (select * from district_assignments where createdAt in (select max(createdAt) from district_assignments)) da where da.type = 'minister') withAssign on wm.id = withAssign.legacyCmisId) and wm.archived_at is null) wm2 inner join tag_associations ta inner join tags t on wm2.id = ta.association_id and ta.tag_id = t.id where ta.association_type = 'ward_members' and t.name in ('alloy', 'meadows', 'eastlake', 'holdaway', 'other-neighborhoods') and wm2.gender = 'MALE' order by t.name, wm2.name;
EOF
echo "$sql" | sqlite3 eq.sqlite3 | sed 's/undefined *//g' | column -t -s\|

# -- get all families in the ward, by neighborhood and lastname
# -- select wm.id, ta.id, t.name, wm.coupleName, wm.address from ward_members wm inner join tag_associations ta inner join tags t on wm.id = ta.association_id and ta.tag_id = t.id where ta.association_type = 'ward_members' and t.name in ('alloy', 'meadows', 'eastlake', 'holdaway', 'other-neighborhoods') and wm.archived_at is null order by t.name, wm.coupleName

