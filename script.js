function onSubmitFilters () {

}

function dbPediaRequest (sparqlRequest, callback) {
  $.ajax({
    url: `http://dbpedia.org/sparql?default-graph-uri=http://dbpedia.org&query=${sparqlRequest}&output=json`
  }).done(callback);
}