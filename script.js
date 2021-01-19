function onSubmitFilters() {
    
}

function dbPediaRequest (sparqlRequest) {
  return $.get('http://dbpedia.org/sparql', {
    query: sparqlRequest,
    output: 'json'
  });
}

function generateRequest(resource, predicate) {
    return dbPediaRequest(`
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX dc: <http://purl.org/dc/elements/1.1/>
        PREFIX : <http://dbpedia.org/resource/>
        PREFIX dbpedia2: <http://dbpedia.org/property/>
        PREFIX dbpedia: <http://dbpedia.org/>
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX dbpedia2: <http://dbpedia.org/property/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX c: <http://dbpedia.org/ontology/Criminal>
        PREFIX criminal: <`+resource+`>

        SELECT * WHERE {
        criminal: `+predicate+` ?value.
        }
    `);
}

function requestSameURI(predicate, uri, currentCriminal) {
  return dbPediaRequest(`
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX dc: <http://purl.org/dc/elements/1.1/>
      PREFIX : <http://dbpedia.org/resource/>
      PREFIX dbpedia2: <http://dbpedia.org/property/>
      PREFIX dbpedia: <http://dbpedia.org/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX dbpedia2: <http://dbpedia.org/property/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX criminal: <http://dbpedia.org/ontology/Criminal>
      SELECT ?criminal ?name ?label WHERE {
          ?criminal a criminal:.
          OPTIONAL { 
            ?criminal foaf:name ?name 
            FILTER (lang(?name) = 'en')
          }.
          OPTIONAL { 
            ?criminal rdfs:label ?label
            FILTER (lang(?label) = 'en') 
          }.
          ?criminal ${predicate} <${uri}>.
          FILTER (?criminal != <${currentCriminal}>)
      }
      ORDER BY ?criminal
      `
  )
}

function requestContainsText(predicate, text, currentCriminal) {
  return dbPediaRequest(`
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX dc: <http://purl.org/dc/elements/1.1/>
      PREFIX : <http://dbpedia.org/resource/>
      PREFIX dbpedia2: <http://dbpedia.org/property/>
      PREFIX dbpedia: <http://dbpedia.org/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX dbpedia2: <http://dbpedia.org/property/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX criminal: <http://dbpedia.org/ontology/Criminal>
      SELECT ?criminal ?name ?label ?value WHERE {
          ?criminal a criminal:.
          OPTIONAL { 
            ?criminal foaf:name ?name
            FILTER (lang(?name) = 'en') 
          }.
          OPTIONAL { 
            ?criminal rdfs:label ?label
            FILTER (lang(?label) = 'en') 
          }.
          ?criminal ${predicate} ?value.
          FILTER(CONTAINS(lcase(str(?value)), "${text}"))
          FILTER(?criminal != <${currentCriminal}>)
      }
      ORDER BY ?criminal
      `
  )
}


function requestSameYear(predicate, year, currentCriminal) {
  return dbPediaRequest(`
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX dc: <http://purl.org/dc/elements/1.1/>
      PREFIX : <http://dbpedia.org/resource/>
      PREFIX dbpedia2: <http://dbpedia.org/property/>
      PREFIX dbpedia: <http://dbpedia.org/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX dbpedia2: <http://dbpedia.org/property/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX criminal: <http://dbpedia.org/ontology/Criminal>
      SELECT ?criminal ?name ?label WHERE {
          ?criminal a criminal:.
          OPTIONAL { 
            ?criminal foaf:name ?name
            FILTER (lang(?name) = 'en') 
          }.
          OPTIONAL { 
            ?criminal rdfs:label ?label
            FILTER (lang(?label) = 'en') 
          }.
          ?criminal ${predicate} ?value.
          FILTER(year(?value) = ${year})
          FILTER (?criminal != <${currentCriminal}>)
      }
      ORDER BY ?criminal
      `
  )
}

function requestResourceLabel(resource) {
  return dbPediaRequest(`
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX dc: <http://purl.org/dc/elements/1.1/>
      PREFIX : <http://dbpedia.org/resource/>
      PREFIX dbpedia2: <http://dbpedia.org/property/>
      PREFIX dbpedia: <http://dbpedia.org/>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX dbpedia2: <http://dbpedia.org/property/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT ?label ?name <${resource}> as ?resource WHERE {
          OPTIONAL { 
            <${resource}> foaf:name ?name
            FILTER (lang(?name) = 'en') 
          }.
          OPTIONAL { 
            <${resource}> rdfs:label ?label
            FILTER (lang(?label) = 'en') 
          }.
          FILTER (lang(?label) = 'en')
      }
      `
  )
}