#!/bin/bash

PASS=blah

if [ "$1" == "" ]; then
echo "Usage: sqlite3-enc.sh dev.sqlite3.sql --enc"
echo "Usage: sqlite3-enc.sh dev.sqlite3.sql.enc --dec"
exit 1
fi

filename="$1"
mode="$2"
if [ ! "$mode" == "--dec" ]; then
mode="--enc"
fi

sqlite3Enc() {
echo "Encrypt sqlite database: $filename"

if [ -e "$filename" ]; then
echo "removing $filename..."
rm "$filename"
fi

touch "$filename"

for table in $(sqlite3 -line dev.sqlite3 '.tables' | xargs | sed 's/ward_members //g; s/members //g;'); do
  sqlite3 -line dev.sqlite3 ".dump ${table}" >> "$filename"
done

cat "$filename" | openssl enc -aes-128-cbc -a -salt -pass "pass:$PASS" > "${filename}.enc"
rm "$filename"
}

sqlite3Dec() {
echo "Decrypt sqlite database: $filename"

if [ ! -e "$filename" ]; then
echo "Missing $filename"
exit 1
fi

decryptedFilename="${filename%.*}"
cat "$filename" | openssl enc -aes-128-cbc -a -d -salt -pass "pass:$PASS" > "$decryptedFilename"
if [ "$?" == 0 ]; then rm "$filename"; fi
}

case $mode in
--dec)
  sqlite3Dec
  ;;
*)
  sqlite3Enc
  ;;
esac

echo Done

# tempfile="dev.sqlite3.sql.enc"
# echo "${tempfile%.*}"
# echo "${tempfile%%.*}"
# echo "${tempfile#*.}"
# echo "${tempfile##*.}"
