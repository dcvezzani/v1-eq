#!/bin/bash

read -r -d '' cookie <<-'EOF'
audience_split=15; WRUID=1521363450905830; audience_id=501800; aam_uuid=73537519879642355912093815999344016609; lds-preferred-lang-v2=eng; optimizelyEndUserId=oeu1540782617013r0.37965657750889314; WRUIDCD=1996711239467180; __CT_Data=gpv=38&ckp=tld&dm=lds.org&apv_59_www11=42&cpv_59_www11=35&rpv_59_www11=33; ctm={\'pgv\':8319653847554533|\'vst\':5404716872998750|\'vstr\':488004792662453|\'intr\':1544365733884|\'v\':1|\'lvst\':3805}; cr-aths=shown; lds-preferred-lang=eng; AMCV_66C5485451E56AAE0A490D45%40AdobeOrg%40AdobeOrg=1999109931%7CMCMID%7C50460743624521144332123202997537125423%7CMCAID%7CNONE; aam_sc=aamsc%3D708195%7C855179; check=true; AMCVS_66C5485451E56AAE0A490D45%40AdobeOrg=1; audience_s_split=77; s_cc=true; _fbp=fb.1.1549203284566.1550766386; ADRUM=s=1549203287897&r=https%3A%2F%2Fwww.lds.org%2F%3F479231918; amlbcookie=75; JSESSIONID=0; __VCAP_ID__=59cd8b16-f381-4557-58fb-aaad; mbox=PC#ee4e141ade2147878d6d59092a2da18c.28_125#1612448084|session#9c413e96bec946ac93b811d8e961a3db#1549205164; AMCV_66C5485451E56AAE0A490D45%40AdobeOrg=1099438348%7CMCIDTS%7C17924%7CMCMID%7C73753970999719347692114950626000914839%7CMCAAMLH-1549808107%7C9%7CMCAAMB-1549808107%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1549210507s%7CNONE%7CMCAID%7CNONE%7CMCSYNCSOP%7C411-17792%7CvVersion%7C2.1.0; s_sq=ldsall%3D%2526pid%253Dhttps%25253A%25252F%25252Flcr.lds.org%25252F%25253Flang%25253Deng%2526oid%253Dhttps%25253A%25252F%25252Flcr.lds.org%25252Forgs%25252F5873015%25253Flang%25253Deng%2526ot%253DA; utag_main=v_id:0160417984b500311739875dfee004078001d0700093c$_sn:140$_ss:0$_st:1549205119683$vapi_domain:lds.org$dc_visit:139$ses_id:1549203284012%3Bexp-session$_pn:2%3Bexp-session$dc_event:4%3Bexp-session$dc_region:us-east-1%3Bexp-session; t_ppv=undefined%2C75%2C64%2C767%2C7911480; ObSSOCookie=nHCxUhQHOlSLaaqPqM4xrvdt1ZVmef9E4OqWmbyEkRWa4bI5vlHvGNY0HgiZQgSY5UuOUm6VdfJ5lq6XmIZKHxHf8LyKjlauTUNZjJmUaLSIH4UvvkC8YPyuRpKLVH%2BUEntSruI34ycXSxMjwSFLFsQtGe7E2hH3twO79K2UpOJKFkr2JvSR1yut4PjoR2xOF2R5yQmzKsmOlBxDsKZUPbpY6j7m0ewZdRgP79w%2BNDefAJ%2FW6qcj%2BaMi5S8Wf7%2FUcUPaeVEQsdlsgpfvk5HIv%2FIDPVFyWucfhZtvpXadClM%3D; TS01b89640=01999b7023d40ea39bd6fd80c390d3fac3fcbc858d045254710868c36813d0a8e0214119e4dba3feeffbf75a1eb4917d617d89e432d8a1067033823530264436d72da6874b; lds-id=AQIC5wM2LY4SfcyIO-6SgalK-HTEaDJwoX-GMmKb-0zIP8w.*AAJTSQACMDIAAlNLABMxNDU1MzQ1NTgwNzMzMDg4NTYwAAJTMQACMDU.*; ADRUM_BTa=R:34|g:46afd355-69b0-4284-ba60-2ea8404258ef|n:customer1_acb14d98-cf8b-4f6d-8860-1c1af7831070; ADRUM_BT1=R:34|i:14049|e:273
EOF

echo "$cookie" > /Users/davidvezzani/projects/v1-eq/be/lds-cookie.txt

sleep 2

echo attempting to fetch records
node_modules/.bin/babel-node man-import.js

echo grouping members by neighborhood
node_modules/.bin/babel-node tag-members-neighborhoods.js >/dev/null

echo identifying single sisters
node_modules/.bin/babel-node tag-members-single-sisters.js >/dev/null

echo updating member details on google drive
node_modules/.bin/babel-node update_member_details.js >/dev/null

echo generate single sisters report
sqlite3 eq.sqlite3 ".read single-sisters-report.sql"; cat v1-eq-single-sisters-report.csv >/dev/null

# todo: use input to switch between proposed and active
# proposed ministering assignments
echo generate proposed ministering assignment data
curl 'https://lcr.lds.org/ministering-proposed-assignments?lang=eng&type=EQ' -H 'authority: lcr.lds.org' -H 'cache-control: max-age=0' -H 'upgrade-insecure-requests: 1' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36' -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8' -H 'referer: https://lcr.lds.org/ministering-proposed-assignments?lang=eng&type=EQ' -H 'accept-encoding: gzip, deflate, br' -H 'accept-language: en-US,en;q=0.9' -H $'cookie: '"${cookie}" -H 'if-none-match: "afa85-cOI+2ckUiUj0w5PIC1FbLkGicaI"' --compressed > ministering.html
grep '__NEXT_DATA__' ministering.html | perl -p -e 's/^.*__NEXT_DATA__ = //g' > ministering-proposed.json
cat ministering-proposed.json | jq '.props.initialState.ministeringData' > ministering.json

# live ministering assignments
# curl 'https://lcr.lds.org/services/umlu/v1/ministering/data-full?lang=eng&type=EQ&unitNumber=13730' -H 'pragma: no-cache' -H $'cookie: '"${cookie}" -H 'accept-encoding: gzip, deflate, br' -H 'accept-language: en-US,en;q=0.9' -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36' -H 'accept: application/json, text/plain, */*' -H 'cache-control: no-cache' -H 'authority: lcr.lds.org' -H 'referer: https://lcr.lds.org/orgs/5873015?lang=eng' --compressed > ministering.json

# collect district information
echo collect district information
cat ministering.json | jq '.elders| map({districtName, districtUuid, supervisorName, supervisorPersonUuid, companionships: ( if ((.companionships | length) > 0) then (.companionships | map({ministers: (if (.ministers | length > 0) then (.ministers | map({type: "minister", legacyCmisId, name})) else ([]) end), assignments: (if (.assignments | length > 0) then (.assignments | map({type: "assignment", legacyCmisId, name})) else ([]) end)})) else [] end )})' > districts.json

# highlight minister/assignment concerns (optional)
echo highlight minister/assignment concerns - optional
cat ministering.json | jq '.elders| map(select(.districtName | contains("District 1", "District 2", "District 3"))) | map({districtName, districtUuid, supervisorName, supervisorPersonUuid, companionships: ( if ((.companionships | length) > 0) then (.companionships | map({ministers: (if ((.ministers | length > 0) and (.ministers | length < 2)) then (.ministers | map({type: "minister", legacyCmisId, name})) else ([]) end), assignments: (if ((.assignments | length > 0) and (.assignments | length < 2)) then (.assignments | map({type: "assignment", legacyCmisId, name})) else ([]) end)}) | map(select((((.ministers | length) > 0) or ((.assignments | length) > 0)))) ) else [] end )})' > districts-concerns.json

echo import district data
node_modules/.bin/babel-node import-districts.js >/dev/null

# ministering assignment report (optional)
echo ministering assignment report - optional
# ./report.sh 2>&1 | tee "report-$(date +%Y-%m-%d).txt"; cp "report-$(date +%Y-%m-%d).txt" "ministering-assignments-report.txt"
./report.sh >/dev/null; cp "report-$(date +%Y-%m-%d).txt" "ministering-assignments-report.txt"

echo generate proposed ministering assignments
node_modules/.bin/babel-node minist-assigns-03.js >/dev/null

echo DONE!


