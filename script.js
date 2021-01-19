const prefixes = {
  'rdfs:': '<http://www.w3.org/2000/01/rdf-schema#>',
  'foaf:': '<http://xmlns.com/foaf/0.1/>',
  'dbpedia2:': '<http://dbpedia.org/property/>',
  'criminal:': '<http://dbpedia.org/ontology/Criminal>'
};

const filters = {
  formName: 'FILTER(contains(lcase(str(?n)), lcase(str("%"))))',
  formAlias: 'FILTER(contains(lcase(str(?a)), lcase(str("%"))))',
  formCriminalCharge: 'FILTER(contains(lcase(str(?cc)), lcase(str("%"))))',
  formConvictionPenalty: 'FILTER(contains(lcase(str(?cp)), lcase(str("%"))))',
  formMotive: 'FILTER(contains(lcase(str(?m)), lcase(str("%"))))',
  formApprenhendedBegin: 'FILTER(?d >= "%d"^^xsd:date)', // 19390101
  formApprenhendedEnd: 'FILTER(?d <= "%d"^^xsd:date)',
  formVictimsMin: 'FILTER(xsd:integer(?v) >= %)',
  formVictimsMax: 'FILTER(xsd:integer(?v) <= %)',
  formCountry: 'FILTER(?cnt = <http://dbpedia.org/resource/%>)'
}

function onSubmitFilters() {

  let mdx = `${ Object.entries(prefixes).map(([alias, url]) => `PREFIX ${ alias } ${ url }`).join(' ') }
    SELECT ?n, ?a, ?com WHERE {
      ?c a criminal: ; foaf:name ?n ; dbpedia2:alias ?a ; rdfs:comment ?com .
      OPTIONAL {
        ?c dbo:criminalCharge ?cc ;
        dbo:convictionPenalty ?cp ;
        dbo:motive ?m ;
        dbpedia2:apprehended ?d ;
        dbpedia2:victims ?v ;
        dbo:country ?cnt
      }
      ${ Object.entries(filters).map(createFilter).join(' ') }
    } LIMIT 100
  `;

  dbPediaRequest(mdx, data => console.log(data));

}

function createFilter([inputName, filter]) {

  let inputValue = $(`#${ inputName }`).val();

  if(inputValue) {
    filter = filter.replace('%d', $.format.date(inputValue, 'yyyyMMdd'));
    filter = filter.replace('%', inputValue);

    return filter;
  }

  return '';

}

function dbPediaRequest(sparqlRequest, callback) {

  $.get('http://dbpedia.org/sparql', {
    query: sparqlRequest,
    output: 'json'
  }).done(callback);

}

$('#submit').click(onSubmitFilters);
