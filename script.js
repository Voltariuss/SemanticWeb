const prefixes = {

  'rdfs:': '<http://www.w3.org/2000/01/rdf-schema#>',
  'foaf:': '<http://xmlns.com/foaf/0.1/>',
  'dbpedia2:': '<http://dbpedia.org/property/>',
  'criminal:': '<http://dbpedia.org/ontology/Criminal>'

};

const filters = {

  contains: { string: 'FILTER(contains(lcase(str(%v)), lcase(str("%"))))' },
  inferiorOrEqual: {
    date: 'FILTER(%v >= "%d"^^xsd:date)',
    integer: 'FILTER(xsd:integer(%v) >= %)'
  },

  superiorOrEqual: {
    date: 'FILTER(%v <= "%d"^^xsd:date)',
    integer: 'FILTER(xsd:integer(%v) <= %)'
  },

  equal: { string: 'FILTER(%v = %)' }

}

const inputs = {

  formName: { variable: '?n', source: 'foaf:name', filter: filters.contains.string },
  formAlias: { variable: '?a', source: 'dbpedia2:alias', filter: filters.contains.string },
  formCriminalCharge: { variable: '?cc', source: 'dbo:criminalCharge', filter: filters.contains.string },
  formConvictionPenalty: { variable: '?cp', source: 'dbo:convictionPenalty', subProperty: {
    variable: '?l', source: 'rdfs:label', filter: filters.contains.string
  } },
  formMotive: { variable: '?m', source: 'dbo:motive', filter: filters.contains.string },
  formApprenhendedBegin: { variable: '?d', source: 'dbpedia2:apprehended', filter: filters.inferiorOrEqual.date },
  formApprenhendedEnd: { variable: '?d', source: 'dbpedia2:apprehended', filter: filters.superiorOrEqual.date },
  formVictimsMin: { variable: '?v', source: 'dbpedia2:victims', filter: filters.inferiorOrEqual.integer },
  formVictimsMax: { variable: '?v', source: 'dbpedia2:victims', filter: filters.superiorOrEqual.integer },
  formCountry: { variable: '?cnt', source: 'dbo:country', filter: filters.equal.string }

}

const langFilter = 'FILTER(langMatches(lang(%v), "%"))';

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
        `<option value="<${ country.cnt.value }>">${ country.cn.value.split('/').pop() }</option>`
      ).join('')
    }`);

  });

}

async function getAutoCompletion(object, value, response) {

  let input = inputs[object.attr('id')];
  let mdx = `${ addPrefixes() }

    SELECT DISTINCT ${ buildSelectedVariable(input) } WHERE {
      ?c a criminal: ; foaf:name ?n ; dbpedia2:alias ?a ; rdfs:comment ?com ;
      ${ input.source } ${ input.variable } ${ buildSubProperty(input.variable, input.subProperty) }
      ${ buildFilters(input, value) }
    } LIMIT 100
  `;

  dbPediaRequest(mdx, data =>
    response(Object.values(data.results.bindings).map(result =>
      result[Object.keys(result)[0]].value
    ))
  );

}

function buildSelectedVariable(input) { return input.subProperty ? buildSelectedVariable(input.subProperty) : input.variable }

function buildSubProperty(from, input) {

  if(!input) { return ''; }

  return `. ${ from } ${ input.source } ${ input.variable } ${ buildSubProperty(input.variable, input.subProperty) }`;

}

function buildFilters(input, value) {

  if(!input.filter) { return buildFilters(input.subProperty, value); }

  return input.filter.replace('%v', input.variable)
                     .replace('%d', $.format.date(value, 'yyyy-MM-dd'))
                     .replace('%', value);

}

function onSubmitFilters(e) {

  let mdx = `${ addPrefixes() }

    SELECT ?n, ?a, ?com WHERE {
      ?c a criminal: ; foaf:name ?n ; dbpedia2:alias ?a ; rdfs:comment ?com
      ${ addVariables('?c') }
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

function addVariables(mainVariable) {

  let usedVariables = [];
  let variables = Object.entries(inputs).map(([inputName, input]) => {

    let value = $(`#${ inputName }`).val();

    if(!input.variable || !value || usedVariables.includes(input.variable)) { return; }

    usedVariables.push(input.variable);

    return `${ mainVariable } ${ input.source } ${ input.variable } ${ buildSubProperty(input.variable, input.subProperty) }`;

  }).filter(value => value).join(' . ');

  return variables ? `. ${ variables }` : '';

}

function addFilters() {

  return Object.entries(inputs).map(([inputName, input]) => {

    let value = $(`#${ inputName }`).val();

    if(!value) { return; }

    return buildFilters(input, value);

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

  $('.autocomplete').autocomplete({
    source: (value, response) => getAutoCompletion($(':focus'), value.term, response)
  });

});
