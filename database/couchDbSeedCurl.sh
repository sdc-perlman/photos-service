echo 'Seeding Database'
rm -r insertDocs
mkdir insertDocs
node ./couchDbGenerateBulks.js
curl -X DELETE 'http://admin:breakthroughtheyeti@127.0.0.1:5984/sdc-perlman-photos1'
curl -X PUT 'http://admin:breakthroughtheyeti@127.0.0.1:5984/sdc-perlman-photos1?partitioned=true'
#curl -d @insertDocs.json -H "Content-type: application/json" -X POST 'http://admin:breakthroughtheyeti@127.0.0.1:5984/sdc-perlman-photos1/_bulk_docs'

for I in {0..9999}
do
  curl --silent -d @insertDocs/$I.json -H "Content-type: application/json" -X POST 'http://admin:breakthroughtheyeti@127.0.0.1:5984/sdc-perlman-photos1/_bulk_docs?batch=ok' >/dev/null 
  echo $I
done