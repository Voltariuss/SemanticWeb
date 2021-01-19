const prefixes = {
  'rdfs:': '<http://www.w3.org/2000/01/rdf-schema#>',
  'foaf:': '<http://xmlns.com/foaf/0.1/>',
  'dbpedia2:': '<http://dbpedia.org/property/>',
  'criminal:': '<http://dbpedia.org/ontology/Criminal>'
};

const filters = {
  formName: { filter: 'FILTER(contains(lcase(str(?n)), lcase(str("%"))))' },
  formAlias: { filter: 'FILTER(contains(lcase(str(?a)), lcase(str("%"))))' },
  formCriminalCharge: { variable: 'dbo:criminalCharge ?cc', filter: 'FILTER(contains(lcase(str(?cc)), lcase(str("%"))))' },
  formConvictionPenalty: { variable: 'dbo:convictionPenalty ?cp', filter: 'FILTER(contains(lcase(str(?cp)), lcase(str("%"))))' },
  formMotive: { variable: 'dbo:motive ?m', filter: 'FILTER(contains(lcase(str(?m)), lcase(str("%"))))' },
  formApprenhendedBegin: { variable: 'dbpedia2:apprehended ?d', filter: 'FILTER(?d >= "%d"^^xsd:date)' },
  formApprenhendedEnd: { variable: 'dbpedia2:apprehended ?d', filter: 'FILTER(?d <= "%d"^^xsd:date)' },
  formVictimsMin: { variable: 'dbpedia2:victims ?v', filter: 'FILTER(xsd:integer(?v) >= %)' },
  formVictimsMax: { variable: 'dbpedia2:victims ?v', filter: 'FILTER(xsd:integer(?v) <= %)' },
  formCountry: { variable: 'dbo:country ?cnt', filter: 'FILTER(?cnt = <%>)' }
}

function getCountries() {

  let mdx = `${ addPrefixes() }

    SELECT DISTINCT ?cnt, ?cn WHERE {
      ?c a criminal: ; foaf:name ?n ; dbpedia2:alias ?a ; rdfs:comment ?com  ; dbo:country ?cnt . ?cnt dbp:commonName ?cn
    }
  `;

  dbPediaRequest(mdx, data => {

    let json = data.results.bindings;

    $('#formCountry').append(`${
      Object.values(json).map(country =>
        `<option value="${ country.cnt.value }">${ country.cn.value.split('/').pop() }</option>`
      ).join('')
    }`);

  });

}

function onSubmitFilters(e) {

  let mdx = `${ addPrefixes() }

    SELECT ?n, ?a, ?com WHERE {
      ?c a criminal: ; foaf:name ?n ; dbpedia2:alias ?a ; rdfs:comment ?com ${ addVariables() }
      ${ addFilters() }
    } LIMIT 100
  `;

  e.preventDefault();

  dbPediaRequest(mdx, data => {

    let json = data.results.bindings;

    $('#searchResults').html(`${
      Object.values(json).map(result => `
        <div>
          <span>Nom : </span>${ result.n.value } -
          <span>Pseudonyme : </span>${ result.a.value } -
          <span>Description : </span>${ result.com.value }
        </div>
      `).join('')
    }`);

  });

}

function addPrefixes() {

  return Object.entries(prefixes).map(([alias, url]) => `PREFIX ${ alias } ${ url }`).join(' ');

}

function addVariables() {

  let usedVariables = [];
  let variables = Object.entries(filters).map(([inputName, filterOptions]) => {

    let variable = filterOptions['variable'];
    let inputValue = $(`#${ inputName }`).val();

    if(!variable || !inputValue || usedVariables.includes(variable))
    { return; }

    usedVariables.push(variable);

    return variable;

  }).filter(value => value).join(' ; ');

  return variables ? ` ; ${ variables }` : '';

}

function addFilters() {

  return Object.entries(filters).map(([inputName, filterOptions]) => {

    let filter = filterOptions.filter;
    let inputValue = $(`#${ inputName }`).val();

    if(!inputValue) { return; }

    filter = filter.replace('%d', $.format.date(inputValue, 'yyyy-MM-dd'));
    filter = filter.replace('%', inputValue);

    return filter;

  }).join(' ');

}

function dbPediaRequest(sparqlRequest, callback) {

  $.get('http://dbpedia.org/sparql', {
    query: sparqlRequest,
    output: 'json'
  }).done(callback);

}

$(document).ready(() => {

  $('#submit').click(onSubmitFilters);

  getCountries();

});
