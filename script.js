function onSubmitFilters () {

}

function dbPediaRequest (sparqlRequest, callback) {
  $.get('http://dbpedia.org/sparql', {
    query: sparqlRequest,
    output: 'json'
  }).done(callback);
}